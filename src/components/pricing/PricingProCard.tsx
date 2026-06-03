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

      {/* Founder banner — n'apparaît QUE si des places restent */}
      {founderAvailable && (
        <div className="mb-3 inline-flex items-center self-start gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full">
          <Flame className="h-3 w-3" />
          Tarif Fondateur — plus que {founderSlotsLeft} / {MAX_FOUNDER_SLOTS} places
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
