"use client";

import { useState } from "react";
import { TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

export function ROICalculator() {
  const [clientsPerDay, setClientsPerDay] = useState(8);
  const [avgPrice, setAvgPrice] = useState(5000);
  const [noShowRate, setNoShowRate] = useState(15);

  const workDaysPerMonth = 22;
  const noShowsPerMonth = Math.round(
    clientsPerDay * workDaysPerMonth * (noShowRate / 100)
  );
  const lossPerMonth = noShowsPerMonth * avgPrice;
  const lossPerYear = lossPerMonth * 12;

  // With BookEasy: assume 70% reduction in no-shows
  const savedPerMonth = Math.round(lossPerMonth * 0.7);
  const savedPerYear = savedPerMonth * 12;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="bg-gradient-to-r from-[#0C1B2A] to-[#132D46] p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-[#00B4D8]" />
          </div>
          <h3 className="text-lg font-bold text-white">
            Calculateur de perte
          </h3>
        </div>
        <p className="text-white/50 text-sm">
          Estimez combien vous perdez chaque mois sans réservation en ligne
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Slider: Clients per day */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Clients par jour
            </label>
            <span className="text-sm font-bold text-[#0066FF]">
              {clientsPerDay}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            value={clientsPerDay}
            onChange={(e) => setClientsPerDay(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 accent-[#0066FF]"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1</span>
            <span>30</span>
          </div>
        </div>

        {/* Slider: Average price */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Prix moyen d&apos;une prestation
            </label>
            <span className="text-sm font-bold text-[#0066FF]">
              {avgPrice.toLocaleString()} F
            </span>
          </div>
          <input
            type="range"
            min={1000}
            max={30000}
            step={500}
            value={avgPrice}
            onChange={(e) => setAvgPrice(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 accent-[#0066FF]"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 000 F</span>
            <span>30 000 F</span>
          </div>
        </div>

        {/* Slider: No-show rate */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Taux de rendez-vous manqués
            </label>
            <span className="text-sm font-bold text-[#0066FF]">
              {noShowRate}%
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={40}
            value={noShowRate}
            onChange={(e) => setNoShowRate(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 accent-[#0066FF]"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>5%</span>
            <span>40%</span>
          </div>
        </div>

        {/* Results */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-6 space-y-4">
          {/* Loss */}
          <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-700 dark:text-red-400">
                Sans réservation en ligne
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                -{lossPerMonth.toLocaleString()} F
              </span>
              <span className="text-sm text-red-500">/mois</span>
            </div>
            <p className="text-xs text-red-500/70 mt-1">
              {noShowsPerMonth} rendez-vous manqués/mois ·{" "}
              <strong>-{lossPerYear.toLocaleString()} F/an</strong>
            </p>
          </div>

          {/* Savings */}
          <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Avec BookEasy (rappels + confirmation)
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                +{savedPerMonth.toLocaleString()} F
              </span>
              <span className="text-sm text-green-500">récupérés/mois</span>
            </div>
            <p className="text-xs text-green-500/70 mt-1">
              Réduction de 70% des no-shows ·{" "}
              <strong>+{savedPerYear.toLocaleString()} F/an</strong>
            </p>
          </div>
        </div>

        <Link
          href="/register?role=MERCHANT"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white font-semibold text-sm hover:shadow-lg hover:shadow-[#0066FF]/25 transition-all"
        >
          Commencer gratuitement
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
