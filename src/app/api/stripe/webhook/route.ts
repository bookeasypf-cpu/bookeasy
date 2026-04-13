import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency: skip if already processed
  const existing = await prisma.webhookEvent.findUnique({
    where: { id: event.id },
  });
  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    await prisma.webhookEvent.create({
      data: { id: event.id, source: "stripe" },
    });

    switch (event.type) {
      // Abonnement créé ou paiement réussi → activer Pro
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const merchantId = session.metadata?.merchantId;
        if (merchantId && session.subscription) {
          await prisma.merchant.update({
            where: { id: merchantId },
            data: {
              plan: "PRO",
              stripeSubscriptionId: session.subscription as string,
              stripeCustomerId: session.customer as string,
            },
          });
          console.log(`✅ Merchant ${merchantId} upgraded to PRO`);
        }
        break;
      }

      // Renouvellement réussi
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as unknown as { subscription: string }).subscription;
        if (subId) {
          await prisma.merchant.updateMany({
            where: { stripeSubscriptionId: subId },
            data: { plan: "PRO" },
          });
        }
        break;
      }

      // Paiement échoué → avertir (on laisse un délai de grâce)
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const failedSubId = (invoice as unknown as { subscription: string }).subscription;
        console.warn(`⚠️ Payment failed for subscription ${failedSubId}`);
        break;
      }

      // Abonnement annulé ou expiré → rétrograder
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.merchant.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            plan: "FREE",
            stripeSubscriptionId: null,
          },
        });
        console.log(`🔄 Subscription ${subscription.id} cancelled — merchant downgraded to FREE`);
        break;
      }

      // Mise à jour d'abonnement (pause, changement, etc.)
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const isActive = ["active", "trialing"].includes(subscription.status);
        await prisma.merchant.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            plan: isActive ? "PRO" : "FREE",
          },
        });
        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
