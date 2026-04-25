import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { giftCardLimiter, checkRateLimit, formatRateLimitError } from "@/lib/ratelimit";
import { PAYZEN_CONFIGURED } from "@/lib/payzen";
import { nanoid } from "nanoid";

// Générer un code carte cadeau lisible
function generateGiftCardCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "BE-";
  for (let i = 0; i < 3; i++) {
    if (i > 0) code += "-";
    for (let j = 0; j < 4; j++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return code;
}

// GET - Vérifier le solde d'une carte cadeau
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // Rate limit gift card lookups to prevent code enumeration
  try {
    const { success } = await giftCardLimiter.limit(`giftcard-check-${session.user.id}`);
    if (!success) {
      return NextResponse.json({ error: "Trop de vérifications. Réessayez plus tard." }, { status: 429 });
    }
  } catch {
    // Fail open
  }

  const code = req.nextUrl.searchParams.get("code");
  const merchantId = req.nextUrl.searchParams.get("merchantId");

  if (!code) {
    return NextResponse.json({ error: "Code requis" }, { status: 400 });
  }

  const card = await prisma.giftCard.findUnique({
    where: { code: code.toUpperCase() },
    include: { merchant: { select: { id: true, businessName: true } } },
  });

  if (!card) {
    return NextResponse.json({ error: "Carte cadeau introuvable" }, { status: 404 });
  }

  if (card.status === "USED" || card.balance <= 0) {
    return NextResponse.json({ error: "Cette carte cadeau a déjà été utilisée", card: { code: card.code, status: "USED" } }, { status: 400 });
  }

  if (card.expiresAt < new Date()) {
    return NextResponse.json({ error: "Cette carte cadeau a expiré", card: { code: card.code, status: "EXPIRED" } }, { status: 400 });
  }

  // Validate merchant scope if checking from booking page
  if (merchantId && card.merchantId && card.merchantId !== merchantId) {
    return NextResponse.json({
      error: `Cette carte cadeau est uniquement valable chez ${card.merchant?.businessName || "un autre partenaire"}`,
    }, { status: 400 });
  }

  // Convertir EUR en XPF pour l'affichage
  const amountXPF = Math.round(card.amount * 119.33);
  const balanceXPF = Math.round(card.balance * 119.33);

  return NextResponse.json({
    code: card.code,
    amountXPF,
    balanceXPF,
    status: card.status,
    merchantName: card.merchant?.businessName || "Tous les partenaires",
    expiresAt: card.expiresAt,
  });
}

// POST - Créer une carte cadeau
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Rate limiting: 5 gift cards per hour per user (fail-open if Redis down)
    const { success: rlSuccess, resetIn } = await checkRateLimit(
      giftCardLimiter,
      `giftcard-${session.user.id}`
    );
    if (!rlSuccess) {
      return NextResponse.json(
        {
          error: formatRateLimitError(resetIn, "créations de cartes cadeaux"),
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    const { amountXPF, senderName, senderEmail, recipientName, recipientEmail, message, merchantId } = body;

    if (!amountXPF || !senderName || !senderEmail || !recipientName || !recipientEmail) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    // Montants autorisés en XPF
    const allowedAmounts = [2000, 5000, 10000, 20000, 50000];
    if (!allowedAmounts.includes(amountXPF)) {
      return NextResponse.json({ error: "Montant non autorisé" }, { status: 400 });
    }

    // Convertir XPF en EUR (1 EUR = 119.33 XPF)
    const amountEUR = amountXPF / 119.33;

    const code = generateGiftCardCode();
    const payzenOrderId = `GC-${nanoid(12)}`;

    // Mode dual : si PayZen configuré → paiement requis, sinon → gratuit (test)
    if (PAYZEN_CONFIGURED) {
      const card = await prisma.giftCard.create({
        data: {
          code,
          amount: amountEUR,
          balance: 0, // Solde activé après paiement
          currency: "XPF",
          senderName,
          senderEmail,
          recipientName,
          recipientEmail,
          message: message || null,
          merchantId: merchantId || null,
          status: "PENDING_PAYMENT",
          paymentStatus: "PENDING",
          payzenOrderId,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });

      return NextResponse.json({
        giftCardId: card.id,
        requiresPayment: true,
        amountXPF,
      });
    }

    // Fallback : pas de PayZen → carte active immédiatement (mode test)
    const card = await prisma.giftCard.create({
      data: {
        code,
        amount: amountEUR,
        balance: amountEUR,
        currency: "XPF",
        senderName,
        senderEmail,
        recipientName,
        recipientEmail,
        message: message || null,
        merchantId: merchantId || null,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    const balanceXPF = Math.round(card.balance * 119.33);

    // Award XP to buyer: 1 XP per 1000 XPF
    const xpEarned = Math.floor(amountXPF / 1000);
    if (session.user.id && xpEarned > 0 && merchantId) {
      await prisma.xpTransaction.create({
        data: {
          userId: session.user.id,
          merchantId,
          amount: xpEarned,
          type: "EARNED",
          reason: `Carte cadeau offerte (${amountXPF.toLocaleString()} F)`,
        },
      });
    }

    return NextResponse.json({
      code: card.code,
      amountXPF,
      balanceXPF,
      xpEarned: session?.user?.id ? xpEarned : 0,
      expiresAt: card.expiresAt,
      requiresPayment: false,
      message: `Carte cadeau créée ! Code : ${card.code}`,
    });
  } catch (error) {
    console.error("Gift card creation error:", error);
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
