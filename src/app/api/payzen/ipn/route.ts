import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySignature, parseIPNData } from "@/lib/payzen";
import { onBookingConfirmed } from "@/lib/booking-confirm";

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
      return new NextResponse("Invalid signature", { status: 400 });
    }

    const ipnData = parseIPNData(body);
    console.log("PayZen IPN:", JSON.stringify({ type: ipnData.type, status: ipnData.transactionStatus, orderId: ipnData.orderId }));

    // Idempotency
    const eventId = `payzen-${ipnData.orderId}-${ipnData.transId}-${ipnData.transactionStatus}`;
    const existing = await prisma.webhookEvent.findUnique({
      where: { id: eventId },
    });
    if (existing) {
      return new NextResponse("OK", { status: 200 });
    }
    await prisma.webhookEvent.create({
      data: { id: eventId, source: "payzen" },
    });

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
      if (ipnData.merchantId) {
        await prisma.merchant.update({
          where: { id: ipnData.merchantId },
          data: {
            plan: "PRO",
            planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });

        const merchant = await prisma.merchant.findUnique({
          where: { id: ipnData.merchantId },
          select: { userId: true },
        });
        if (merchant) {
          await prisma.notification.create({
            data: {
              userId: merchant.userId,
              type: "SUBSCRIPTION",
              title: "Abonnement Pro activé !",
              message: "Votre abonnement Pro est maintenant actif. Profitez de tous les avantages !",
            },
          });
        }
      }
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
          data: { plan: "FREE" },
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
        // Deduct gift card now that payment is confirmed
        if (booking.giftCardCode && booking.giftCardAmount && booking.giftCardAmount > 0) {
          const card = await tx.giftCard.findUnique({
            where: { code: booking.giftCardCode },
          });
          if (card) {
            const deductionEUR = booking.giftCardAmount / 119.33;
            const newBalance = Math.max(0, card.balance - deductionEUR);
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
      senderEmail: true,
      merchantId: true,
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
        const amountXPF = Math.round(card.amount * 119.33);
        const xpEarned = Math.floor(amountXPF / 1000);

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
                reason: `Carte cadeau offerte (${amountXPF.toLocaleString()} F)`,
              },
            });
          }
        }
      });
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
