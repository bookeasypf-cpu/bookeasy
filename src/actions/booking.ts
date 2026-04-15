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

  // Fetch merchant info for XP + notifications
  const merchant = await prisma.merchant.findUnique({
    where: { id: data.merchantId },
    select: { userId: true, xpPerBooking: true, businessName: true, address: true, city: true, sector: { select: { slug: true } } },
  });

  if (!merchant) {
    return { error: "Professionnel introuvable" };
  }

  const isMedical = merchant.sector ? isMedicalSector(merchant.sector.slug) : false;

  // Atomic booking creation: conflict check + gift card + XP all in one transaction
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

      // Handle gift card deduction with balance guard
      if (data.giftCardCode) {
        const card = await tx.giftCard.findUnique({
          where: { code: data.giftCardCode },
        });
        if (card && card.status === "ACTIVE" && card.expiresAt > new Date() &&
            (!card.merchantId || card.merchantId === data.merchantId)) {
          const priceEUR = service.price / 119.33;
          if (card.balance >= priceEUR) {
            const newBalance = card.balance - priceEUR;
            await tx.giftCard.update({
              where: { id: card.id },
              data: {
                balance: newBalance,
                status: newBalance <= 0 ? "USED" : "ACTIVE",
                usedAt: newBalance <= 0 ? new Date() : null,
              },
            });
          }
        }
      }

      const newBooking = await tx.booking.create({
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

      // Award XP inside the transaction (atomic with booking)
      if (!isMedical) {
        const xpToAward = service.xpAmount ?? merchant.xpPerBooking;
        if (xpToAward > 0) {
          await tx.xpTransaction.create({
            data: {
              userId: user.id,
              merchantId: data.merchantId,
              bookingId: newBooking.id,
              amount: xpToAward,
              type: "EARNED",
              reason: `Réservation : ${service.name}`,
            },
          });
        }
      }

      return newBooking;
    });

    // Non-transactional side effects (notifications, emails, referrals)
    await prisma.notification.create({
      data: {
        userId: merchant.userId,
        type: "NEW_BOOKING",
        title: "Nouveau rendez-vous",
        message: `${user.name || "Un client"} a réservé ${service.name} le ${data.date} à ${data.startTime}`,
        metadata: JSON.stringify({ bookingId: booking.id }),
      },
    });

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

        await prisma.xpTransaction.create({
          data: {
            userId: referral.referrerId,
            amount: REFERRAL_XP_FIRST_BOOKING,
            type: "EARNED",
            reason: `Parrainage : ${user.name || "Filleul"} a fait sa 1ère réservation`,
          },
        });

        await checkAndAwardMilestoneBonus(referral.referrerId);

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

    sendPushNotification(merchant.userId, {
      title: "Nouveau rendez-vous",
      body: `${user.name || "Un client"} a réservé ${service.name} le ${data.date} à ${data.startTime}`,
      url: "/dashboard/bookings",
    }).catch(() => {});

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
    }).catch(() => {});

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

  if (isClient) {
    const bookingDateTime = new Date(`${booking.date}T${booking.startTime}`);
    if (bookingDateTime < new Date()) {
      return { error: "Impossible d'annuler un rendez-vous passé" };
    }
  }

  // Atomic cancellation: only succeeds if status is still CONFIRMED/PENDING
  const newStatus = isMerchant ? "CANCELLED_BY_MERCHANT" : "CANCELLED_BY_CLIENT";
  const updated = await prisma.booking.updateMany({
    where: {
      id: bookingId,
      status: { notIn: ["CANCELLED_BY_CLIENT", "CANCELLED_BY_MERCHANT", "COMPLETED"] },
    },
    data: {
      status: newStatus,
      cancelledAt: new Date(),
      cancelReason: reason || null,
    },
  });

  if (updated.count === 0) {
    return { error: "Cette réservation ne peut plus être annulée" };
  }

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

  // Revoke ALL XP earned for this booking
  const earnedXpList = await prisma.xpTransaction.findMany({
    where: { bookingId, type: "EARNED" },
  });

  for (const xp of earnedXpList) {
    await prisma.xpTransaction.create({
      data: {
        userId: xp.userId,
        merchantId: xp.merchantId,
        bookingId,
        amount: -xp.amount,
        type: "REVOKED",
        reason: `Annulation : ${booking.service?.name || "Service"}`,
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
