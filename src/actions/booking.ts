"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { bookingSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { sendBookingCancellation } from "@/lib/email";
import { sendPushNotification } from "@/lib/push";
import { isMedicalSector } from "@/lib/medical";
import { bookingLimiter, formatRateLimitError } from "@/lib/ratelimit";
import { onBookingConfirmed } from "@/lib/booking-confirm";
import { nanoid } from "nanoid";

export async function createBooking(data: {
  merchantId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  giftCardCode?: string;
  paymentMethod?: "online" | "on_site";
}) {
  const user = await requireAuth();

  try {
    const { success, reset } = await bookingLimiter.limit(`booking-${user.id}`);
    if (!success) {
      const resetIn = reset ? Math.ceil((reset - Date.now()) / 1000) : 0;
      return { error: formatRateLimitError(resetIn, "réservations") };
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
  if (!service) return { error: "Service introuvable" };

  const merchant = await prisma.merchant.findUnique({
    where: { id: data.merchantId },
    select: {
      userId: true,
      xpPerBooking: true,
      businessName: true,
      address: true,
      city: true,
      paymentPolicy: true,
      sector: { select: { slug: true } },
    },
  });
  if (!merchant) return { error: "Professionnel introuvable" };

  // Determine if this booking requires online payment
  const wantsOnline = data.paymentMethod === "online";
  const requiresOnlinePayment =
    merchant.paymentPolicy === "ONLINE_ONLY" ||
    (merchant.paymentPolicy === "FLEXIBLE" && wantsOnline);

  const isMedical = merchant.sector ? isMedicalSector(merchant.sector.slug) : false;

  try {
    const booking = await prisma.$transaction(async (tx) => {
      // Check for conflicts (exclude expired PENDING_PAYMENT)
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
          NOT: {
            AND: [
              { status: "PENDING_PAYMENT" },
              { paymentExpiresAt: { lt: new Date() } },
            ],
          },
        },
      });

      if (conflicting) {
        throw new Error("TIME_SLOT_UNAVAILABLE");
      }

      if (requiresOnlinePayment) {
        // ONLINE PAYMENT PATH: create as PENDING_PAYMENT, no gift card deduction, no XP
        const payzenOrderId = nanoid(12);

        // Calculate gift card deduction to store (but don't deduct yet)
        let giftCardAmount: number | null = null;
        if (data.giftCardCode) {
          const card = await tx.giftCard.findUnique({
            where: { code: data.giftCardCode },
          });
          if (card && card.status === "ACTIVE" && card.expiresAt > new Date() &&
              (!card.merchantId || card.merchantId === data.merchantId)) {
            const priceEUR = service.price / 119.33;
            giftCardAmount = Math.min(card.balance, priceEUR) * 119.33;
          }
        }

        const amountToPay = Math.max(0, service.price - (giftCardAmount || 0));

        // If gift card covers everything, skip payment
        if (amountToPay <= 0) {
          return await createConfirmedBooking(tx, {
            user, data, service, merchant, isMedical,
          });
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
            notes: data.notes || null,
            status: "PENDING_PAYMENT",
            payzenOrderId,
            giftCardCode: data.giftCardCode || null,
            giftCardAmount,
            amountPaid: null,
            paymentExpiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min
          },
        });

        return { ...newBooking, _requiresPayment: true, _amountXPF: Math.round(amountToPay), _payzenOrderId: payzenOrderId };
      }

      // ON-SITE / NO PAYMENT PATH: confirm immediately
      return await createConfirmedBooking(tx, {
        user, data, service, merchant, isMedical,
      });
    });

    if ("_requiresPayment" in booking && booking._requiresPayment) {
      revalidatePath("/dashboard/bookings");
      return {
        success: true,
        bookingId: booking.id,
        requiresPayment: true,
        payzenOrderId: booking._payzenOrderId,
        amountXPF: booking._amountXPF,
      };
    }

    // Side effects for confirmed booking
    await onBookingConfirmed(booking.id);

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

// Helper: create a confirmed booking with gift card deduction + XP
async function createConfirmedBooking(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  opts: {
    user: { id: string; name?: string | null; email?: string | null };
    data: { merchantId: string; serviceId: string; date: string; startTime: string; endTime: string; notes?: string; giftCardCode?: string };
    service: { id: string; name: string; price: number; xpAmount: number | null };
    merchant: { xpPerBooking: number };
    isMedical: boolean;
  }
) {
  const { user, data, service, merchant, isMedical } = opts;

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
  if (booking.giftCardCode) {
    const giftCard = await prisma.giftCard.findUnique({
      where: { code: booking.giftCardCode },
    });
    if (giftCard && booking.giftCardAmount) {
      const refundEUR = booking.giftCardAmount / 119.33;
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
  } else if (booking.notes) {
    // Legacy: gift card stored in notes
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

  if (isMerchant && booking.client.email) {
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
