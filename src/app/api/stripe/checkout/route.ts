import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const merchant = await prisma.merchant.findUnique({
      where: { userId: session.user.id },
      select: { id: true, plan: true, stripeCustomerId: true },
    });

    if (!merchant) {
      return NextResponse.json({ error: "Commerçant introuvable" }, { status: 404 });
    }

    if (merchant.plan === "PRO") {
      return NextResponse.json({ error: "Vous êtes déjà Pro !" }, { status: 400 });
    }

    const { sessionUrl, customerId } = await createCheckoutSession({
      merchantId: merchant.id,
      merchantEmail: session.user.email!,
      stripeCustomerId: merchant.stripeCustomerId,
    });

    // Sauvegarder le customer ID si nouveau
    if (!merchant.stripeCustomerId && customerId) {
      await prisma.merchant.update({
        where: { id: merchant.id },
        data: { stripeCustomerId: customerId },
      });
    }

    return NextResponse.json({ url: sessionUrl });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du paiement" },
      { status: 500 }
    );
  }
}
