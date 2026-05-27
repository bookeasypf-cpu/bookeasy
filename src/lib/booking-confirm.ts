import { waitUntil } from "@vercel/functions";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmation, sendNewBookingMerchant } from "@/lib/email";
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
          user: { select: { email: true } },
        },
      },
      service: true,
    },
  });

  if (!booking) return;

  const isMedical = booking.merchant.sector
    ? isMedicalSector(booking.merchant.sector.slug)
    : false;

  // Award XP (non-medical only). The @@unique([bookingId, userId, type]) on
  // XpTransaction guarantees atomicity — two concurrent IPN retries can't both
  // succeed even without a findFirst guard. We just catch P2002.
  if (!isMedical) {
    const xpToAward = booking.service.xpAmount ?? booking.merchant.xpPerBooking;
    if (xpToAward > 0) {
      try {
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
      } catch (e) {
        // P2002 = already awarded. Idempotent — silently skip.
        if (!(typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "P2002")) {
          throw e;
        }
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

  // Push notification to merchant — waitUntil guarantees worker stays alive
  // until completion. Previous .catch(()=>{}) could be killed by Vercel
  // before delivery under Fluid Compute concurrency.
  waitUntil(
    sendPushNotification(booking.merchant.userId, {
      title: "Nouveau rendez-vous",
      body: `${booking.client.name || "Un client"} a réservé ${booking.service.name} le ${booking.date} à ${booking.startTime}`,
      url: "/dashboard/bookings",
    }).catch((err) =>
      console.error("[BOOKING-CONFIRM] push merchant failed:", err instanceof Error ? err.message : err)
    )
  );

  // Confirmation email to client
  if (booking.client.email) {
    waitUntil(
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
      }).catch((err) =>
        console.error("[BOOKING-CONFIRM] client email failed:", err instanceof Error ? err.message : err)
      )
    );
  }

  // Notification email to merchant (in addition to push/in-app)
  if (booking.merchant.user?.email) {
    waitUntil(
      sendNewBookingMerchant({
        merchantEmail: booking.merchant.user.email,
        merchantName: booking.merchant.businessName,
        clientName: booking.client.name || "Un client",
        serviceName: booking.service.name,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        price: booking.totalPrice,
      }).catch((err) =>
        console.error("[BOOKING-CONFIRM] merchant email failed:", err instanceof Error ? err.message : err)
      )
    );
  }

  // Referral bonus (first booking)
  try {
    const referral = await prisma.referral.findUnique({
      where: { refereeId: booking.clientId },
      include: { referrer: { select: { id: true, name: true, email: true } } },
    });

    if (referral && referral.status === "REGISTERED") {
      // Set bookingId on the referral XP so the @@unique constraint also
      // protects this path from double-award under concurrent IPN retries.
      try {
        await prisma.xpTransaction.create({
          data: {
            userId: referral.referrerId,
            bookingId: booking.id,
            amount: REFERRAL_XP_FIRST_BOOKING,
            type: "EARNED",
            reason: `Parrainage : ${booking.client.name || "Filleul"} a fait sa 1ère réservation`,
          },
        });
      } catch (e) {
        // Already rewarded — idempotent return, don't mutate referral status either.
        if (typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "P2002") {
          return;
        }
        throw e;
      }

      await prisma.referral.update({
        where: { id: referral.id },
        data: { status: "FIRST_BOOKING" },
      });

      await checkAndAwardMilestoneBonus(referral.referrerId);

      if (referral.referrer.email) {
        waitUntil(
          sendReferralRewardEmail(
            referral.referrer.email,
            referral.referrer.name || "Parrain",
            REFERRAL_XP_FIRST_BOOKING,
            `${booking.client.name || "Votre filleul"} a fait sa première réservation`
          ).catch((err) =>
            console.error("[BOOKING-CONFIRM] referral email failed:", err instanceof Error ? err.message : err)
          )
        );
      }
    }
  } catch {
    // Don't fail if referral processing fails
  }
}
