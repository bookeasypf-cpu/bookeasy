import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { createPaymentForm, PAYZEN_CONFIGURED, PRO_PRICE_XPF } from "@/lib/payzen";
import { nanoid } from "nanoid";

export async function POST() {
  try {
    if (!PAYZEN_CONFIGURED) {
      return NextResponse.json(
        { error: "Le paiement en ligne n'est pas encore configuré. Contactez-nous pour souscrire au plan Pro." },
        { status: 503 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const merchant = await prisma.merchant.findUnique({
      where: { userId: session.user.id },
      select: { id: true, plan: true },
    });

    if (!merchant) {
      return NextResponse.json({ error: "Commerçant introuvable" }, { status: 404 });
    }

    if (merchant.plan === "PRO") {
      return NextResponse.json({ error: "Vous êtes déjà Pro !" }, { status: 400 });
    }

    // Générer un orderId unique pour cette transaction
    const orderId = `PRO-${nanoid(10)}`;

    const { actionUrl, fields } = createPaymentForm({
      merchantId: merchant.id,
      merchantEmail: session.user.email!,
      amount: PRO_PRICE_XPF,
      orderId,
      isSubscription: true,
    });

    return NextResponse.json({ actionUrl, fields });
  } catch (error) {
    console.error("PayZen checkout error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du paiement" },
      { status: 500 }
    );
  }
}
