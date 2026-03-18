import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySignature, parseIPNData } from "@/lib/payzen";

/**
 * IPN (Instant Payment Notification) — PayZen envoie un POST ici
 * après chaque transaction (succès, échec, annulation).
 *
 * URL à configurer dans le back-office PayZen :
 * https://bookeasy-eta.vercel.app/api/payzen/ipn
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const body: Record<string, string> = {};
    formData.forEach((value, key) => {
      body[key] = value.toString();
    });

    // Vérifier la signature
    const receivedSignature = body.signature;
    if (!receivedSignature || !verifySignature(body, receivedSignature)) {
      console.error("❌ PayZen IPN: signature invalide");
      return new NextResponse("Invalid signature", { status: 400 });
    }

    const ipnData = parseIPNData(body);
    console.log("📥 PayZen IPN reçu:", ipnData);

    // Traiter selon le type de transaction
    if (ipnData.type === "PRO_SUBSCRIPTION") {
      switch (ipnData.transactionStatus) {
        case "AUTHORISED":
        case "CAPTURED": {
          // Paiement réussi → activer le plan Pro
          if (ipnData.merchantId) {
            await prisma.merchant.update({
              where: { id: ipnData.merchantId },
              data: {
                plan: "PRO",
                planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
              },
            });
            console.log(`✅ Merchant ${ipnData.merchantId} upgraded to PRO via PayZen`);

            // Créer une notification pour le commerçant
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
          console.warn(`⚠️ PayZen payment refused for merchant ${ipnData.merchantId}: ${ipnData.authResult}`);
          break;
        }

        case "CANCELLED": {
          console.log(`🔄 PayZen payment cancelled for merchant ${ipnData.merchantId}`);
          break;
        }

        case "EXPIRED": {
          // Abonnement expiré → rétrograder
          if (ipnData.merchantId) {
            await prisma.merchant.update({
              where: { id: ipnData.merchantId },
              data: { plan: "FREE" },
            });
            console.log(`🔄 Merchant ${ipnData.merchantId} downgraded to FREE (expired)`);
          }
          break;
        }
      }
    }

    // PayZen attend une réponse 200 avec le contenu spécifique
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("PayZen IPN error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
