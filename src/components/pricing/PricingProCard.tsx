"use client";

import { useState } from "react";
import { Check, Star, Sparkles, Flame } from "lucide-react";
import { UpgradeButton } from "@/components/ui/UpgradeButton";
import {
  FOUNDER_PRICE_MONTHLY_XPF,
  FOUNDER_PRICE_YEARLY_XPF,
  MAX_FOUNDER_SLOTS,
  PRO_PRICE_MONTHLY_XPF,
  PRO_PRICE_YEARLY_XPF,
  type BillingCycle,
} from "@/lib/constants";

interface PricingProCardProps {
  founderSlotsLeft: number;
  features: string[];
}

function formatXpf(n: number): string {
  return n.toLocaleString("fr-FR").replace(/ /g, " ");
}

export function PricingProCard({
  founderSlotsLeft,
  features,
}: PricingProCardProps) {
  const [cycle, setCycle] = useState<BillingCycle>("MONTHLY");
  const founderAvailable = founderSlotsLeft > 0;
  const applyFounderPricing = founderAvailable;

  // Scarcité progressive — testée pour maximiser la conversion sans
  // déclencher de "compte rond = pas urgent" ni "personne n'a acheté
  // = produit pas validé". Source: A/B tests SaaS classiques sur le
  // framing de la rareté.
  //   10/10  → on cache le ratio, on annonce l'exclusivité
  //   7-9    → ratio visible (urgence émergente)
  //   1-6    → "X places !" avec animation pulse (peur de rater)
  //   0      → bloc retiré (géré par founderAvailable au render)
  function getFounderBanner(slotsLeft: number): {
    text: string;
    pulse: boolean;
  } | null {
    if (slotsLeft <= 0) return null;
    if (slotsLeft === MAX_FOUNDER_SLOTS) {
      return { text: "Tarif Fondateur — exclusif aux 10 premiers", pulse: false };
    }
    if (slotsLeft >= 7) {
      return { text: `Tarif Fondateur — plus que ${slotsLeft}/${MAX_FOUNDER_SLOTS}`, pulse: false };
    }
    return {
      text: `Tarif Fondateur — plus que ${slotsLeft} ${slotsLeft === 1 ? "place" : "places"} !`,
      pulse: true,
    };
  }
  const founderBanner = getFounderBanner(founderSlotsLeft);

  const standardPrice =
    cycle === "YEARLY" ? PRO_PRICE_YEARLY_XPF : PRO_PRICE_MONTHLY_XPF;
  const founderPrice =
    cycle === "YEARLY" ? FOUNDER_PRICE_YEARLY_XPF : FOUNDER_PRICE_MONTHLY_XPF;
  const finalPrice = founderAvailable ? founderPrice : standardPrice;
  const periodLabel = cycle === "YEARLY" ? "F CFP / an" : "F CFP / mois";

  return (
    <div className="relative rounded-2xl bg-white dark:bg-gray-900 p-6 sm:p-8 flex flex-col border-2 border-[#0066FF] shadow-xl shadow-[#0066FF]/10 scale-[1.02] md:scale-105">
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
        <span className="bg-[#0066FF] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
          Recommandé
        </span>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #0066FF15, #0066FF25)",
          }}
        >
          <Star className="h-5 w-5 text-[#0066FF]" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pro</h3>
      </div>

      {/* Toggle Mois / Année */}
      <div className="inline-flex items-center self-start bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-5">
        <button
          type="button"
          onClick={() => setCycle("MONTHLY")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            cycle === "MONTHLY"
              ? "bg-white dark:bg-gray-900 text-[#0066FF] shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
        >
          Mensuel
        </button>
        <button
          type="button"
          onClick={() => setCycle("YEARLY")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            cycle === "YEARLY"
              ? "bg-white dark:bg-gray-900 text-[#0066FF] shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
        >
          Annuel
          <span className="bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
            2 mois offerts
          </span>
        </button>
      </div>

      {/* Founder banner — scarcité progressive (cf. getFounderBanner).
          Disparait quand les 10 places sont prises. */}
      {founderBanner && (
        <div
          className={`mb-3 inline-flex items-center self-start gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border text-amber-800 dark:text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full ${
            founderBanner.pulse
              ? "border-amber-400 dark:border-amber-400/50 shadow-sm shadow-amber-300/40 animate-pulse"
              : "border-amber-200 dark:border-amber-500/20"
          }`}
        >
          <Flame className="h-3 w-3" />
          {founderBanner.text}
        </div>
      )}

      {/* Prix */}
      <div className="mb-2">
        {founderAvailable && (
          <span className="text-base text-gray-400 dark:text-gray-500 line-through mr-2 align-top">
            {formatXpf(standardPrice)}
          </span>
        )}
        <span className="text-4xl font-bold text-gray-900 dark:text-white">
          {formatXpf(finalPrice)}
        </span>
        <span className="text-gray-500 dark:text-gray-400 ml-1 text-sm">
          {periodLabel}
        </span>
      </div>
      {founderAvailable && (
        <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          -15% bloqué à vie sur ce cycle
        </p>
      )}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Pour les professionnels qui veulent se démarquer.
      </p>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300"
          >
            <Check className="h-4 w-4 shrink-0 mt-0.5 text-[#0066FF]" />
            {feature}
          </li>
        ))}
      </ul>

      <UpgradeButton
        cycle={cycle}
        applyFounderPricing={applyFounderPricing}
        label={
          founderAvailable
            ? "Devenir Fondateur"
            : cycle === "YEARLY"
              ? "Choisir Pro annuel"
              : "Choisir Pro"
        }
      />
    </div>
  );
}
