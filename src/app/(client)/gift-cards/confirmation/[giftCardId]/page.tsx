import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Gift, CreditCard, AlertTriangle, Home } from "lucide-react";
import Link from "next/link";
import GiftCardQR from "./GiftCardQR";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ giftCardId: string }>;
  searchParams: Promise<{ payment?: string }>;
}

export default async function GiftCardConfirmationPage({ params, searchParams }: Props) {
  const { giftCardId } = await params;
  const { payment } = await searchParams;

  const card = await prisma.giftCard.findUnique({
    where: { id: giftCardId },
    include: { merchant: { select: { businessName: true } } },
  });

  if (!card) notFound();

  const isPending = card.status === "PENDING_PAYMENT";
  const isActive = card.status === "ACTIVE";
  const isFailed = payment === "failed" || payment === "cancelled";
  const amountXPF = Math.round(card.amount * 119.33);

  return (
    <div className="page-transition min-h-screen bg-[#F8FAFC] dark:bg-gray-950 flex flex-col items-center justify-center px-4 sm:px-6 py-12">
      {/* Status icon */}
      <div className="animate-scale-in mb-6">
        <div className="relative w-24 h-24 mx-auto">
          {isFailed ? (
            <>
              <div className="absolute inset-0 rounded-full bg-red-100 animate-pulse-soft" />
              <div className="absolute inset-2 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>
            </>
          ) : isPending ? (
            <>
              <div className="absolute inset-0 rounded-full bg-orange-100 animate-pulse-soft" />
              <div className="absolute inset-2 rounded-full bg-orange-50 flex items-center justify-center">
                <CreditCard className="w-12 h-12 text-orange-500" />
              </div>
            </>
          ) : (
            <>
              <div className="absolute inset-0 rounded-full bg-emerald-100 animate-pulse-soft" />
              <div className="absolute inset-2 rounded-full bg-emerald-50 flex items-center justify-center">
                <Gift className="w-12 h-12 text-emerald-500" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status text */}
      <div className="animate-fade-in-up text-center mb-8">
        {isFailed ? (
          <>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0C1B2A] dark:text-white mb-2">
              Paiement échoué
            </h1>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Le paiement n&apos;a pas abouti. Vous pouvez réessayer.
            </p>
          </>
        ) : isPending ? (
          <>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0C1B2A] dark:text-white mb-2">
              Paiement en cours
            </h1>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Votre carte cadeau sera activée dès que le paiement sera confirmé. Cela peut prendre quelques instants.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0C1B2A] dark:text-white mb-2">
              Carte cadeau créée !
            </h1>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Partagez le code ou le QR code avec {card.recipientName}.
            </p>
          </>
        )}
      </div>

      {/* Card details */}
      <div className="animate-fade-in-up w-full max-w-md" style={{ animationDelay: "0.15s" }}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
          <div className={`px-5 py-4 ${
            isFailed
              ? "bg-gradient-to-r from-red-500 to-red-600"
              : isPending
                ? "bg-gradient-to-r from-orange-500 to-amber-500"
                : "bg-gradient-to-r from-[#0066FF] to-[#00B4D8]"
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-sm">
                  Carte Cadeau BookEasy
                </h2>
                <p className="text-xs text-white/70">
                  {card.merchant?.businessName || "Tous les partenaires"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Code */}
            {isActive && (
              <div className="text-center py-3">
                <p className="text-xs text-gray-400 mb-1">Code de la carte</p>
                <p className="font-mono text-2xl font-black text-[#0066FF] tracking-widest">
                  {card.code}
                </p>
              </div>
            )}

            {/* QR Code */}
            {isActive && <GiftCardQR code={card.code} />}

            {/* Details */}
            <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Montant</span>
                <span className="text-2xl font-black bg-gradient-to-r from-[#0066FF] to-[#00B4D8] bg-clip-text text-transparent">
                  {formatPrice(amountXPF)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">De</span>
                <span className="font-semibold text-[#0C1B2A] dark:text-white text-sm">
                  {card.senderName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Pour</span>
                <span className="font-semibold text-[#0C1B2A] dark:text-white text-sm">
                  {card.recipientName}
                </span>
              </div>
              {card.message && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                    &quot;{card.message}&quot;
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Expire le</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {new Date(card.expiresAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="animate-fade-in-up flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-md" style={{ animationDelay: "0.3s" }}>
        {isFailed && (
          <Link href="/gift-cards" className="flex-1">
            <button className="btn-press w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all text-sm">
              Réessayer
            </button>
          </Link>
        )}
        <Link href="/gift-cards" className="flex-1">
          <button className="btn-press w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all text-sm">
            <Gift className="h-4 w-4" />
            Offrir une autre carte
          </button>
        </Link>
        <Link href="/" className="flex-1">
          <button className="btn-press w-full inline-flex items-center justify-center gap-2 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-[#0C1B2A] dark:text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm">
            <Home className="h-4 w-4" />
            Accueil
          </button>
        </Link>
      </div>
    </div>
  );
}
