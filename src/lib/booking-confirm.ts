import { prisma } from "@/lib/prisma";
import { sendBookingConfirmation } from "@/lib/email";
import { sendPushNotification } from "@/lib/push";
import { sendReferralRewardEmail } from "@/lib/email";
import { REFERRAL_XP_FIRST_BOOKING, checkAndAwardMilestoneBonus } from "@/lib/referral";
import { isMedicalSector } from "@/lib/medical";

/**
 * Side effects after a booking is confirmed (payment received or no payment needed).
 * Called from createBooking (zero-payment) and IPN handler (after PayZen payment).
 *
 * Handles: XP award, notifications, push, emails, referral bonus.
 * Must be called AFTER the booking status is set to CONFIRMED.
 */
export async function onBookingConfirmed(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      client: { select: { id: true, name: true, email: true } },
      merchant: {
        select: {
          userId: true,
          xpPerBooking: true,
          businessName: true,
          address: true,
          city: true,
          sector: { select: { slug: true } },
        },
      },
      service: true,
    },
  });

  if (!booking) return;

  const isMedical = booking.merchant.sector
    ? isMedicalSector(booking.merchant.sector.slug)
    : false;

  // Award XP (non-medical only) — guard against duplicate awards
  if (!isMedical) {
    const xpToAward = booking.service.xpAmount ?? booking.merchant.xpPerBooking;
    if (xpToAward > 0) {
      const alreadyAwarded = await prisma.xpTransaction.findFirst({
        where: { bookingId: booking.id, type: "EARNED", userId: booking.clientId },
      });
      if (!alreadyAwarded) {
        await prisma.xpTransaction.create({
          data: {
            userId: booking.clientId,
            merchantId: booking.merchantId,
            bookingId: booking.id,
            amount: xpToAward,
            type: "EARNED",
            reason: `Réservation : ${booking.service.name}`,
          },
        });
      }
    }
  }

  // Notification in-app to merchant
  await prisma.notification.create({
    data: {
      userId: booking.merchant.userId,
      type: "NEW_BOOKING",
      title: "Nouveau rendez-vous",
      message: `${booking.client.name || "Un client"} a réservé ${booking.service.name} le ${booking.date} à ${booking.startTime}`,
      metadata: JSON.stringify({ bookingId: booking.id }),
    },
  });

  // Push notification to merchant
  sendPushNotification(booking.merchant.userId, {
    title: "Nouveau rendez-vous",
    body: `${booking.client.name || "Un client"} a réservé ${booking.service.name} le ${booking.date} à ${booking.startTime}`,
    url: "/dashboard/bookings",
  }).catch(() => {});

  // Confirmation email to client
  if (booking.client.email) {
    sendBookingConfirmation({
      clientName: booking.client.name || "Client",
      clientEmail: booking.client.email,
      serviceName: booking.service.name,
      merchantName: booking.merchant.businessName,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      price: booking.totalPrice,
      address: booking.merchant.address,
      city: booking.merchant.city,
    }).catch(() => {});
  }

  // Referral bonus (first booking)
  try {
    const referral = await prisma.referral.findUnique({
      where: { refereeId: booking.clientId },
      include: { referrer: { select: { id: true, name: true, email: true } } },
    });

    if (referral && referral.status === "REGISTERED") {
      const alreadyRewarded = await prisma.xpTransaction.findFirst({
        where: { userId: referral.referrerId, type: "EARNED", reason: { startsWith: `Parrainage : ` }, bookingId: booking.id },
      });
      if (alreadyRewarded) return;

      await prisma.referral.update({
        where: { id: referral.id },
        data: { status: "FIRST_BOOKING" },
      });

      await prisma.xpTransaction.create({
        data: {
          userId: referral.referrerId,
          amount: REFERRAL_XP_FIRST_BOOKING,
          type: "EARNED",
          reason: `Parrainage : ${booking.client.name || "Filleul"} a fait sa 1ère réservation`,
        },
      });

      await checkAndAwardMilestoneBonus(referral.referrerId);

      if (referral.referrer.email) {
        sendReferralRewardEmail(
          referral.referrer.email,
          referral.referrer.name || "Parrain",
          REFERRAL_XP_FIRST_BOOKING,
          `${booking.client.name || "Votre filleul"} a fait sa première réservation`
        ).catch(() => {});
      }
    }
  } catch {
    // Don't fail if referral processing fails
  }
}
