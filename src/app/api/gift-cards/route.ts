import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { giftCardLimiter, formatRateLimitError } from "@/lib/ratelimit";

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
  // Rate limit gift card lookups to prevent code enumeration
  try {
    const ipAddress = req.headers.get("x-forwarded-for") ||
                      req.headers.get("x-real-ip") || "unknown";
    const { success } = await giftCardLimiter.limit(`giftcard-check-${ipAddress}`);
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
    // Rate limiting: 5 gift cards per hour per IP
    const ipAddress = req.headers.get("x-forwarded-for") ||
                      req.headers.get("x-real-ip") ||
                      "unknown";
    const { success, reset } = await giftCardLimiter.limit(
      `giftcard-${ipAddress}`
    );
    if (!success) {
      const resetIn = reset ? Math.ceil((reset - Date.now()) / 1000) : 0;
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
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
      },
    });

    const balanceXPF = Math.round(card.balance * 119.33);

    // Award XP to buyer: 1 XP per 1000 XPF
    const xpEarned = Math.floor(amountXPF / 1000);
    const session = await getServerSession(authOptions);
    if (session?.user?.id && xpEarned > 0 && merchantId) {
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
      message: `Carte cadeau créée ! Code : ${card.code}`,
    });
  } catch (error) {
    console.error("Gift card creation error:", error);
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
