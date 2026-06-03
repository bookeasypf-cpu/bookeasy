import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { prisma } from "@/lib/prisma";
import { verifySignature, parseIPNData } from "@/lib/payzen";
import { onBookingConfirmed } from "@/lib/booking-confirm";
import { sendGiftCardEmail, sendProUpgradeConfirmation } from "@/lib/email";
import { notifyAdminMarketingEvent } from "@/lib/marketing/notify";
import { computePlanExpiresAt } from "@/lib/pricing";
import { MAX_FOUNDER_SLOTS, type BillingCycle } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const body: Record<string, string> = {};
    formData.forEach((value, key) => {
      body[key] = value.toString();
    });

    const receivedSignature = body.signature;
    if (!receivedSignature || !verifySignature(body, receivedSignature)) {
      console.error("PayZen IPN: signature invalide");
      return new NextResponse("OK", { status: 200 });
    }

    const ipnData = parseIPNData(body);
    console.log("PayZen IPN:", JSON.stringify({ type: ipnData.type, status: ipnData.transactionStatus, orderId: ipnData.orderId }));

    // Atomic idempotency: rely on the WebhookEvent.id unique constraint instead
    // of findUnique+create (non-atomic — two concurrent IPN retries could both
    // pass the check and both run business logic, causing double XP / double
    // subscription activation). The single create+catch P2002 is race-safe.
    const eventId = `payzen-${ipnData.orderId}-${ipnData.transId}-${ipnData.transactionStatus}`;
    try {
      await prisma.webhookEvent.create({
        data: { id: eventId, source: "payzen" },
      });
    } catch (e) {
      if (typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "P2002") {
        // Event already processed — idempotent return.
        return new NextResponse("OK", { status: 200 });
      }
      throw e;
    }

    if (ipnData.type === "PRO_SUBSCRIPTION") {
      await handleProSubscription(ipnData);
    } else if (ipnData.type === "BOOKING_PAYMENT") {
      await handleBookingPayment(ipnData);
    } else if (ipnData.type === "GIFT_CARD_PAYMENT") {
      await handleGiftCardPayment(ipnData);
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("PayZen IPN error:", error);
    // Always return 200 to PayZen to avoid retries
    return new NextResponse("OK", { status: 200 });
  }
}

async function handleProSubscription(ipnData: ReturnType<typeof parseIPNData>) {
  switch (ipnData.transactionStatus) {
    case "AUTHORISED":
    case "CAPTURED": {
      if (!ipnData.merchantId) break;

      // Normalise le cycle reçu en métadonnée. Fallback MONTHLY pour la
      // compat avec les anciens checkouts qui ne passaient pas le champ.
      const cycle: BillingCycle =
        ipnData.cycle === "YEARLY" ? "YEARLY" : "MONTHLY";
      const planExpiresAt = computePlanExpiresAt(cycle);
      const merchantId = ipnData.merchantId;

      // Race-safe founder claim : la dernière place doit revenir au
      // premier paiement IPN traité, pas au premier checkout initié.
      // Transaction Serializable + recount empêche d'allouer une 11ème place.
      let grantedFounder = false;
      const result = await prisma.$transaction(
        async (tx) => {
          let isFounderPricing = false;
          if (ipnData.founder) {
            // L'IPN peut être rejouée; le merchant déjà fondateur reste fondateur,
            // pas besoin de reclaim de place.
            const current = await tx.merchant.findUnique({
              where: { id: merchantId },
              select: { isFounderPricing: true },
            });
            if (current?.isFounderPricing) {
              isFounderPricing = true;
            } else {
              const taken = await tx.merchant.count({
                where: { isFounderPricing: true },
              });
              if (taken < MAX_FOUNDER_SLOTS) {
                isFounderPricing = true;
              }
            }
          }
          const updated = await tx.merchant.update({
            where: { id: merchantId },
            data: {
              plan: "PRO",
              planExpiresAt,
              billingCycle: cycle,
              ...(isFounderPricing ? { isFounderPricing: true } : {}),
            },
            select: { userId: true, isFounderPricing: true },
          });
          return updated;
        },
        { isolationLevel: "Serializable" }
      );
      grantedFounder = result.isFounderPricing && ipnData.founder;

      await prisma.notification.create({
        data: {
          userId: result.userId,
          type: "SUBSCRIPTION",
          title: grantedFounder
            ? "Abonnement Pro Fondateur activé !"
            : "Abonnement Pro activé !",
          message: grantedFounder
            ? "Votre tarif Fondateur est bloqué à vie. Profitez de tous les avantages Pro !"
            : "Votre abonnement Pro est maintenant actif. Profitez de tous les avantages !",
        },
      });

      // Marketing : génère visuel premium + alerte Mara pour boost réseaux.
      waitUntil(
        notifyAdminMarketingEvent({ event: "upgrade", merchantId }).catch((err) => {
          console.error("[PAYZEN-IPN] Marketing notify upgrade failed:", err instanceof Error ? err.message : err);
        })
      );

      // Email confirmation Pro upgrade au marchand.
      // Une query supplémentaire pour récupérer email + name —
      // acceptable car uniquement à la confirmation paiement (rare).
      waitUntil(
        (async () => {
          const m = await prisma.merchant.findUnique({
            where: { id: merchantId },
            select: { user: { select: { email: true, name: true } } },
          });
          if (!m?.user?.email) return;
          await sendProUpgradeConfirmation({
            to: m.user.email,
            name: m.user.name ?? "",
            cycle,
            planExpiresAt,
            isFounder: grantedFounder,
          });
        })().catch((err) => {
          console.error("[PAYZEN-IPN] Pro upgrade email failed:", err instanceof Error ? err.message : err);
        })
      );
      break;
    }
    case "REFUSED":
    case "ERROR": {
      console.warn(`PayZen payment refused for merchant ${ipnData.merchantId}: ${ipnData.authResult}`);
      break;
    }
    case "EXPIRED": {
      if (ipnData.merchantId) {
        await prisma.merchant.update({
          where: { id: ipnData.merchantId },
          // Ne touche pas isFounderPricing : le marchand fondateur garde
          // son tarif bloqué à vie même après une expiration de plan.
          data: { plan: "FREE", billingCycle: null },
        });
      }
      break;
    }
  }
}

async function handleBookingPayment(ipnData: ReturnType<typeof parseIPNData>) {
  if (!ipnData.bookingId) return;

  const booking = await prisma.booking.findUnique({
    where: { id: ipnData.bookingId },
    select: {
      id: true,
      status: true,
      giftCardCode: true,
      giftCardAmount: true,
      totalPrice: true,
      merchantId: true,
      serviceId: true,
    },
  });

  if (!booking) return;

  switch (ipnData.transactionStatus) {
    case "AUTHORISED":
    case "CAPTURED": {
      if (booking.status !== "PENDING_PAYMENT") return;

      await prisma.$transaction(async (tx) => {
        // Deduct gift card now that payment is confirmed (both XPF integers)
        if (booking.giftCardCode && booking.giftCardAmount && booking.giftCardAmount > 0) {
          const card = await tx.giftCard.findUnique({
            where: { code: booking.giftCardCode },
          });
          if (card) {
            const deductionXPF = Math.round(booking.giftCardAmount);
            const newBalance = Math.max(0, card.balance - deductionXPF);
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

        await tx.booking.update({
          where: { id: booking.id },
          data: {
            status: "CONFIRMED",
            paymentStatus: "PAID",
            payzenTransId: ipnData.transId,
            amountPaid: ipnData.amount,
          },
        });
      });

      // Side effects (XP, notifications, emails, referral)
      await onBookingConfirmed(booking.id);
      break;
    }

    case "REFUSED":
    case "ERROR": {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: "FAILED",
        },
      });
      break;
    }

    case "CANCELLED":
    case "EXPIRED": {
      if (booking.status === "PENDING_PAYMENT") {
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: "CANCELLED_BY_CLIENT",
            paymentStatus: "FAILED",
            cancelReason: "Paiement annulé ou expiré",
            cancelledAt: new Date(),
          },
        });
      }
      break;
    }
  }
}

async function handleGiftCardPayment(ipnData: ReturnType<typeof parseIPNData>) {
  if (!ipnData.giftCardId) return;

  const card = await prisma.giftCard.findUnique({
    where: { id: ipnData.giftCardId },
    select: {
      id: true,
      status: true,
      amount: true,
      code: true,
      senderName: true,
      senderEmail: true,
      recipientName: true,
      recipientEmail: true,
      message: true,
      expiresAt: true,
      merchantId: true,
      merchant: { select: { businessName: true } },
    },
  });

  if (!card) return;

  switch (ipnData.transactionStatus) {
    case "AUTHORISED":
    case "CAPTURED": {
      if (card.status !== "PENDING_PAYMENT") return;

      await prisma.$transaction(async (tx) => {
        await tx.giftCard.update({
          where: { id: card.id },
          data: {
            status: "ACTIVE",
            balance: card.amount,
            paymentStatus: "PAID",
            payzenTransId: ipnData.transId,
          },
        });

        // Award XP to buyer: 1 XP per 1000 XPF
        const xpEarned = Math.floor(card.amount / 1000);

        if (xpEarned > 0 && card.merchantId) {
          const buyer = await tx.user.findFirst({
            where: { email: card.senderEmail },
            select: { id: true },
          });

          if (buyer) {
            await tx.xpTransaction.create({
              data: {
                userId: buyer.id,
                merchantId: card.merchantId,
                amount: xpEarned,
                type: "EARNED",
                reason: `Carte cadeau offerte (${card.amount.toLocaleString()} F)`,
              },
            });
          }
        }
      });

      // Send gift card email to recipient — CGU promise. waitUntil keeps the
      // worker alive past the response so Vercel can't kill delivery mid-send.
      waitUntil(
        sendGiftCardEmail({
          recipientEmail: card.recipientEmail,
          recipientName: card.recipientName,
          senderName: card.senderName,
          code: card.code,
          amountXPF: card.amount,
          message: card.message,
          expiresAt: card.expiresAt,
          merchantName: card.merchant?.businessName,
        }).catch((err) =>
          console.error("[IPN-GIFT] email failed:", err instanceof Error ? err.message : err)
        )
      );
      break;
    }

    case "REFUSED":
    case "ERROR": {
      await prisma.giftCard.update({
        where: { id: card.id },
        data: { paymentStatus: "FAILED" },
      });
      break;
    }

    case "CANCELLED":
    case "EXPIRED": {
      await prisma.giftCard.update({
        where: { id: card.id },
        data: {
          status: "CANCELLED",
          paymentStatus: "FAILED",
        },
      });
      break;
    }
  }
}
