import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createBookingPaymentForm, PAYZEN_CONFIGURED } from "@/lib/payzen";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  if (!PAYZEN_CONFIGURED) {
    return NextResponse.json({ error: "Paiement en ligne non disponible" }, { status: 503 });
  }

  const { bookingId } = await req.json();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      clientId: true,
      status: true,
      payzenOrderId: true,
      totalPrice: true,
      giftCardAmount: true,
      paymentExpiresAt: true,
    },
  });

  if (!booking || booking.clientId !== session.user.id) {
    return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
  }

  if (booking.status !== "PENDING_PAYMENT") {
    return NextResponse.json({ error: "Cette réservation n'est pas en attente de paiement" }, { status: 400 });
  }

  if (booking.paymentExpiresAt && booking.paymentExpiresAt < new Date()) {
    return NextResponse.json({ error: "Le délai de paiement a expiré" }, { status: 400 });
  }

  const amountXPF = Math.round(booking.totalPrice - (booking.giftCardAmount || 0));

  const { actionUrl, fields } = createBookingPaymentForm({
    bookingId: booking.id,
    clientEmail: session.user.email!,
    amount: amountXPF,
    orderId: booking.payzenOrderId!,
  });

  return NextResponse.json({ actionUrl, fields });
}
