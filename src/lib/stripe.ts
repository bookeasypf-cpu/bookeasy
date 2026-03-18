import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("⚠️ STRIPE_SECRET_KEY not set — Stripe disabled");
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" })
  : null;

// Prix de l'abonnement Pro en F CFP (6 900 F CFP ≈ 57.84 EUR)
// Stripe utilise les centimes → 5784 centimes
export const PRO_PRICE_EUR_CENTS = 5784;
export const PRO_PRICE_DISPLAY = "6 900 F CFP";

export async function createCheckoutSession({
  merchantId,
  merchantEmail,
  stripeCustomerId,
}: {
  merchantId: string;
  merchantEmail: string;
  stripeCustomerId?: string | null;
}) {
  if (!stripe) throw new Error("Stripe not configured");

  const baseUrl = process.env.NEXTAUTH_URL || "https://bookeasy-eta.vercel.app";

  // Créer ou réutiliser le customer Stripe
  let customerId = stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: merchantEmail,
      metadata: { merchantId },
    });
    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: "BookEasy Pro",
            description: "Abonnement mensuel Pro — Services illimités, badge vérifié, mise en avant",
          },
          unit_amount: PRO_PRICE_EUR_CENTS,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/dashboard/profile?upgrade=success`,
    cancel_url: `${baseUrl}/pricing`,
    metadata: { merchantId },
  });

  return { sessionUrl: session.url, customerId };
}

export async function createPortalSession(stripeCustomerId: string) {
  if (!stripe) throw new Error("Stripe not configured");

  const baseUrl = process.env.NEXTAUTH_URL || "https://bookeasy-eta.vercel.app";

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${baseUrl}/dashboard/profile`,
  });

  return session.url;
}
