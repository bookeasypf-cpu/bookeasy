import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { createPaymentForm, PAYZEN_CONFIGURED } from "@/lib/payzen";
import { computeProPrice, getFounderSlotsLeft } from "@/lib/pricing";
import type { BillingCycle } from "@/lib/constants";
import { nanoid } from "nanoid";
import { z } from "zod";

const checkoutSchema = z.object({
  cycle: z.enum(["MONTHLY", "YEARLY"]).default("MONTHLY"),
  applyFounderPricing: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
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

    const body = await request.json().catch(() => ({}));
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Paramètres invalides" },
        { status: 400 }
      );
    }
    const cycle: BillingCycle = parsed.data.cycle;
    const wantsFounder = parsed.data.applyFounderPricing;

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

    // Vérif tarif fondateur — la validation finale est refaite côté IPN
    // pour rester race-safe (deux paiements simultanés peuvent réclamer
    // la dernière place; seule l'IPN décide qui l'obtient).
    let applyFounder = false;
    if (wantsFounder) {
      const slotsLeft = await getFounderSlotsLeft();
      applyFounder = slotsLeft > 0;
    }

    const amount = computeProPrice(cycle, applyFounder);

    const orderId = `PRO-${nanoid(10)}`;

    const { actionUrl, fields } = createPaymentForm({
      merchantId: merchant.id,
      merchantEmail: session.user.email!,
      amount,
      orderId,
      isSubscription: true,
      // Métadonnées lues par l'IPN pour appliquer cycle + fondateur
      extra: {
        cycle,
        founder: applyFounder ? "1" : "0",
      },
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
