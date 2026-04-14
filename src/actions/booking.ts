"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { bookingSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { sendBookingConfirmation, sendBookingCancellation, sendReferralRewardEmail } from "@/lib/email";
import { sendPushNotification } from "@/lib/push";
import { REFERRAL_XP_FIRST_BOOKING, checkAndAwardMilestoneBonus } from "@/lib/referral";
import { isMedicalSector } from "@/lib/medical";
import { bookingLimiter, formatRateLimitError } from "@/lib/ratelimit";

export async function createBooking(data: {
  merchantId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  giftCardCode?: string;
}) {
  const user = await requireAuth();

  // Rate limiting: 10 bookings per hour per user
  try {
    const { success, reset } = await bookingLimiter.limit(`booking-${user.id}`);
    if (!success) {
      const resetIn = reset ? Math.ceil((reset - Date.now()) / 1000) : 0;
      return {
        error: formatRateLimitError(resetIn, "réservations"),
      };
    }
  } catch {
    // Fail open if Redis is unavailable
  }

  const result = bookingSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const service = await prisma.service.findUnique({
    where: { id: data.serviceId },
  });

  if (!service) {
    return { error: "Service introuvable" };
  }

  // Atomic booking creation with conflict check
  try {
    const booking = await prisma.$transaction(async (tx) => {
      // Check for conflicts
      const conflicting = await tx.booking.findFirst({
        where: {
          merchantId: data.merchantId,
          date: data.date,
          status: {
            notIn: ["CANCELLED_BY_CLIENT", "CANCELLED_BY_MERCHANT"],
          },
          AND: [
            { startTime: { lt: data.endTime } },
            { endTime: { gt: data.startTime } },
          ],
        },
      });

      if (conflicting) {
        throw new Error("TIME_SLOT_UNAVAILABLE");
      }

      // Handle gift card deduction if provided
      let giftCardId: string | null = null;
      if (data.giftCardCode) {
        const card = await tx.giftCard.findUnique({
          where: { code: data.giftCardCode },
        });
        if (card && card.status === "ACTIVE" && card.balance > 0 && card.expiresAt > new Date() &&
            (!card.merchantId || card.merchantId === data.merchantId)) {
          // Deduct service price from gift card (convert XPF price to EUR)
          const priceEUR = service.price / 119.33;
          const newBalance = Math.max(0, card.balance - priceEUR);
          await tx.giftCard.update({
            where: { id: card.id },
            data: {
              balance: newBalance,
              status: newBalance <= 0 ? "USED" : "ACTIVE",
              usedAt: newBalance <= 0 ? new Date() : null,
            },
          });
          giftCardId = card.id;
        }
      }

      return tx.booking.create({
        data: {
          clientId: user.id,
          merchantId: data.merchantId,
          serviceId: data.serviceId,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          totalPrice: service.price,
          notes: data.giftCardCode
            ? `${data.notes || ""}\n[Carte cadeau: ${data.giftCardCode}]`.trim()
            : data.notes || null,
          status: "CONFIRMED",
        },
      });
    });

    // Create notification for merchant + send confirmation email
    const merchant = await prisma.merchant.findUnique({
      where: { id: data.merchantId },
      select: { userId: true, xpPerBooking: true, businessName: true, address: true, city: true, sector: { select: { slug: true } } },
    });

    if (merchant) {
      await prisma.notification.create({
        data: {
          userId: merchant.userId,
          type: "NEW_BOOKING",
          title: "Nouveau rendez-vous",
          message: `${user.name || "Un client"} a réservé ${service.name} le ${data.date} à ${data.startTime}`,
          metadata: JSON.stringify({ bookingId: booking.id }),
        },
      });

      // Award XP to client (service-level XP takes priority over merchant default)
      // Only award XP for non-medical sectors
      const isMedical = merchant.sector ? isMedicalSector(merchant.sector.slug) : false;
      if (!isMedical) {
        const xpToAward = service.xpAmount ?? merchant.xpPerBooking;
        if (xpToAward > 0) {
          await prisma.xpTransaction.create({
            data: {
              userId: user.id,
              merchantId: data.merchantId,
              bookingId: booking.id,
              amount: xpToAward,
              type: "EARNED",
              reason: `Réservation : ${service.name}`,
            },
          });
        }
      }

      // Check referral: if user was referred and this is their first booking
      try {
        const referral = await prisma.referral.findUnique({
          where: { refereeId: user.id },
          include: { referrer: { select: { id: true, name: true, email: true } } },
        });

        if (referral && referral.status === "REGISTERED") {
          await prisma.referral.update({
            where: { id: referral.id },
            data: { status: "FIRST_BOOKING" },
          });

          // Award XP to referrer for first booking
          await prisma.xpTransaction.create({
            data: {
              userId: referral.referrerId,
              amount: REFERRAL_XP_FIRST_BOOKING,
              type: "EARNED",
              reason: `Parrainage : ${user.name || "Filleul"} a fait sa 1ère réservation`,
            },
          });

          // Check milestones
          await checkAndAwardMilestoneBonus(referral.referrerId);

          // Notify referrer by email
          if (referral.referrer.email) {
            sendReferralRewardEmail(
              referral.referrer.email,
              referral.referrer.name || "Parrain",
              REFERRAL_XP_FIRST_BOOKING,
              `${user.name || "Votre filleul"} a fait sa première réservation`
            ).catch(() => {});
          }
        }
      } catch {
        // Don't fail booking if referral processing fails
      }

      // Push notification to merchant (async, non-blocking)
      sendPushNotification(merchant.userId, {
        title: "Nouveau rendez-vous",
        body: `${user.name || "Un client"} a réservé ${service.name} le ${data.date} à ${data.startTime}`,
        url: "/dashboard/bookings",
      }).catch(() => {});

      // Send confirmation email to client (async, non-blocking)
      sendBookingConfirmation({
        clientName: user.name || "Client",
        clientEmail: user.email!,
        serviceName: service.name,
        merchantName: merchant.businessName,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        price: service.price,
        address: merchant.address,
        city: merchant.city,
      }).catch(() => {}); // Don't fail booking if email fails
    }

    revalidatePath("/my-bookings");
    revalidatePath("/dashboard/bookings");

    return { success: true, bookingId: booking.id };
  } catch (e) {
    if (e instanceof Error && e.message === "TIME_SLOT_UNAVAILABLE") {
      return { error: "Ce créneau n'est plus disponible. Veuillez en choisir un autre." };
    }
    return { error: "Erreur lors de la réservation. Veuillez réessayer." };
  }
}

export async function cancelBooking(bookingId: string, reason?: string) {
  const user = await requireAuth();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      merchant: { select: { userId: true, businessName: true } },
      service: true,
      client: { select: { name: true, email: true } },
    },
  });

  if (!booking) {
    return { error: "Réservation introuvable" };
  }

  const isMerchant = booking.merchant.userId === user.id;
  const isClient = booking.clientId === user.id;

  if (!isMerchant && !isClient) {
    return { error: "Non autorisé" };
  }

  if (booking.status === "CANCELLED_BY_CLIENT" || booking.status === "CANCELLED_BY_MERCHANT") {
    return { error: "Cette réservation est déjà annulée" };
  }

  if (booking.status === "COMPLETED") {
    return { error: "Impossible d'annuler une réservation terminée" };
  }

  // Clients cannot cancel past bookings
  if (isClient) {
    const bookingDateTime = new Date(`${booking.date}T${booking.startTime}`);
    if (bookingDateTime < new Date()) {
      return { error: "Impossible d'annuler un rendez-vous passé" };
    }
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: isMerchant ? "CANCELLED_BY_MERCHANT" : "CANCELLED_BY_CLIENT",
      cancelledAt: new Date(),
      cancelReason: reason || null,
    },
  });

  // Refund gift card balance if booking used a gift card
  if (booking.notes) {
    const giftCardMatch = booking.notes.match(/\[Carte cadeau: ([A-Z0-9-]+)\]/);
    if (giftCardMatch) {
      const giftCardCode = giftCardMatch[1];
      const giftCard = await prisma.giftCard.findUnique({
        where: { code: giftCardCode },
      });
      if (giftCard && booking.service) {
        const refundEUR = booking.service.price / 119.33;
        const newBalance = Math.min(giftCard.amount, giftCard.balance + refundEUR);
        await prisma.giftCard.update({
          where: { id: giftCard.id },
          data: {
            balance: newBalance,
            status: "ACTIVE",
            usedAt: null,
          },
        });
      }
    }
  }

  // Revoke XP if any were earned for this booking
  const earnedXp = await prisma.xpTransaction.findFirst({
    where: {
      bookingId,
      type: "EARNED",
    },
  });

  if (earnedXp) {
    await prisma.xpTransaction.create({
      data: {
        userId: booking.clientId,
        merchantId: booking.merchantId,
        bookingId,
        amount: -earnedXp.amount,
        type: "REVOKED",
        reason: `Annulation : ${booking.service.name}`,
      },
    });
  }

  // Push notification to the other party
  const notifyUserId = isMerchant ? booking.clientId : booking.merchant.userId;
  sendPushNotification(notifyUserId, {
    title: "Rendez-vous annulé",
    body: `Le RDV pour ${booking.service.name} le ${booking.date} à ${booking.startTime} a été annulé`,
    url: isMerchant ? "/my-bookings" : "/dashboard/bookings",
  }).catch(() => {});

  await prisma.notification.create({
    data: {
      userId: notifyUserId,
      type: "BOOKING_CANCELLED",
      title: "Rendez-vous annulé",
      message: `Le rendez-vous pour ${booking.service.name} le ${booking.date} à ${booking.startTime} a été annulé`,
      metadata: JSON.stringify({ bookingId }),
    },
  });

  // Send cancellation email to the other party (async, non-blocking)
  if (isMerchant && booking.client.email) {
    // Merchant cancelled → notify client
    const merchantUser = await prisma.user.findUnique({ where: { id: booking.merchant.userId }, select: { email: true } });
    sendBookingCancellation({
      recipientName: booking.client.name || "Client",
      recipientEmail: booking.client.email,
      serviceName: booking.service.name,
      otherPartyName: booking.merchant.businessName,
      date: booking.date,
      startTime: booking.startTime,
      cancelledBy: "merchant",
      reason,
    }).catch(() => {});
  } else if (isClient) {
    // Client cancelled → notify merchant
    const merchantUser = await prisma.user.findUnique({ where: { id: booking.merchant.userId }, select: { email: true, name: true } });
    if (merchantUser?.email) {
      sendBookingCancellation({
        recipientName: booking.merchant.businessName,
        recipientEmail: merchantUser.email,
        serviceName: booking.service.name,
        otherPartyName: booking.client.name || "Un client",
        date: booking.date,
        startTime: booking.startTime,
        cancelledBy: "client",
        reason,
      }).catch(() => {});
    }
  }

  revalidatePath("/my-bookings");
  revalidatePath("/dashboard/bookings");

  return { success: true };
}

export async function confirmBooking(bookingId: string) {
  const user = await requireAuth();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { merchant: { select: { userId: true } }, service: true },
  });

  if (!booking || booking.merchant.userId !== user.id) {
    return { error: "Non autorisé" };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CONFIRMED" },
  });

  await prisma.notification.create({
    data: {
      userId: booking.clientId,
      type: "BOOKING_CONFIRMED",
      title: "Rendez-vous confirmé",
      message: `Votre rendez-vous pour ${booking.service.name} le ${booking.date} à ${booking.startTime} est confirmé`,
      metadata: JSON.stringify({ bookingId }),
    },
  });

  revalidatePath("/dashboard/bookings");

  return { success: true };
}

export async function completeBooking(bookingId: string) {
  const user = await requireAuth();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { merchant: { select: { userId: true } } },
  });

  if (!booking || booking.merchant.userId !== user.id) {
    return { error: "Non autorisé" };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "COMPLETED" },
  });

  revalidatePath("/dashboard/bookings");

  return { success: true };
}
