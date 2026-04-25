import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createGiftCardPaymentForm, PAYZEN_CONFIGURED } from "@/lib/payzen";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  if (!PAYZEN_CONFIGURED) {
    return NextResponse.json({ error: "Paiement en ligne non disponible" }, { status: 503 });
  }

  const { giftCardId } = await req.json();

  const card = await prisma.giftCard.findUnique({
    where: { id: giftCardId },
    select: {
      id: true,
      senderEmail: true,
      status: true,
      payzenOrderId: true,
      amount: true,
      currency: true,
    },
  });

  if (!card || card.senderEmail !== session.user.email) {
    return NextResponse.json({ error: "Carte cadeau introuvable" }, { status: 404 });
  }

  if (card.status !== "PENDING_PAYMENT") {
    return NextResponse.json({ error: "Cette carte cadeau n'est pas en attente de paiement" }, { status: 400 });
  }

  const amountXPF = Math.round(card.amount * 119.33);

  const { actionUrl, fields } = createGiftCardPaymentForm({
    giftCardId: card.id,
    buyerEmail: session.user.email!,
    amount: amountXPF,
    orderId: card.payzenOrderId!,
  });

  return NextResponse.json({ actionUrl, fields });
}
