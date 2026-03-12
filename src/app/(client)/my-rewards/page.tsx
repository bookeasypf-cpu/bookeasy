"use client";

import { useState, useEffect } from "react";
import { Star, Gift, ChevronRight, Trophy, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface MerchantReward {
  id: string;
  name: string;
  description: string | null;
  xpCost: number;
  type: string;
  value: number | null;
}

interface XpBalance {
  merchantId: string;
  balance: number;
  merchant: {
    id: string;
    businessName: string;
    city: string | null;
    sector: { name: string; icon: string | null };
    xpRewards: MerchantReward[];
  } | null;
}

export default function MyRewardsPage() {
  const [balances, setBalances] = useState<XpBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [showCode, setShowCode] = useState<{
    code: string;
    reward: string;
    merchant: string;
  } | null>(null);

  async function fetchBalances() {
    const res = await fetch("/api/xp/balance");
    if (res.ok) {
      const data = await res.json();
      setBalances(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchBalances();
  }, []);

  async function handleRedeem(rewardId: string) {
    setRedeeming(rewardId);
    const res = await fetch("/api/xp/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rewardId }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Récompense obtenue !");
      setShowCode({
        code: data.code,
        reward: data.reward,
        merchant: data.merchant,
      });
      fetchBalances();
    } else {
      toast.error(data.error || "Erreur");
    }
    setRedeeming(null);
  }

  const totalXp = balances.reduce((sum, b) => sum + b.balance, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-2 border-[#0066FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#0C1B2A] to-[#132D46] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
          <h1 className="text-3xl font-bold mb-2">Mes Points XP</h1>
          <p className="text-white/60 mb-6">
            Accumulez des XP à chaque réservation et échangez-les contre des
            récompenses
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl">
            <Star className="h-6 w-6 text-yellow-400" />
            <span className="text-3xl font-bold">{totalXp}</span>
            <span className="text-white/60 text-sm">XP au total</span>
          </div>
        </div>
      </div>

      {/* Code modal */}
      {showCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center animate-fade-in-up">
            <Sparkles className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#0C1B2A] mb-2">
              Récompense obtenue !
            </h3>
            <p className="text-gray-500 mb-4">
              {showCode.reward} chez {showCode.merchant}
            </p>
            <div className="bg-gray-100 rounded-xl py-4 px-6 mb-4">
              <p className="text-xs text-gray-500 mb-1">Votre code</p>
              <p className="text-2xl font-mono font-bold text-[#0066FF] tracking-wider">
                {showCode.code}
              </p>
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Présentez ce code lors de votre prochaine visite. Valable 30
              jours.
            </p>
            <button
              onClick={() => setShowCode(null)}
              className="w-full py-3 px-4 rounded-xl bg-[#0066FF] text-white font-semibold hover:bg-[#0052CC] transition-colors"
            >
              Compris !
            </button>
          </div>
        </div>
      )}

      {/* Balances by merchant */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {balances.length === 0 ? (
          <div className="text-center py-16">
            <Star className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-400 mb-2">
              Pas encore de points XP
            </h2>
            <p className="text-gray-400">
              Réservez chez un professionnel pour commencer à gagner des XP !
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {balances.map((item) => (
              <div
                key={item.merchantId}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Merchant header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066FF]/10 to-[#00B4D8]/10 flex items-center justify-center text-lg">
                      {item.merchant?.sector.icon || "⭐"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0C1B2A]">
                        {item.merchant?.businessName || "Commerçant"}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {item.merchant?.sector.name} •{" "}
                        {item.merchant?.city || "Tahiti"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-full">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold text-yellow-700">
                      {item.balance} XP
                    </span>
                  </div>
                </div>

                {/* Rewards */}
                {item.merchant?.xpRewards &&
                item.merchant.xpRewards.length > 0 ? (
                  <div className="p-4 space-y-2">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-1 mb-2">
                      Récompenses disponibles
                    </p>
                    {item.merchant.xpRewards.map((reward) => {
                      const canRedeem = item.balance >= reward.xpCost;
                      const progress = Math.min(
                        (item.balance / reward.xpCost) * 100,
                        100
                      );
                      return (
                        <div
                          key={reward.id}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                            canRedeem
                              ? "border-[#0066FF]/20 bg-[#0066FF]/5"
                              : "border-gray-100 bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Gift
                              className={`h-5 w-5 ${canRedeem ? "text-[#0066FF]" : "text-gray-300"}`}
                            />
                            <div className="flex-1">
                              <p
                                className={`text-sm font-medium ${canRedeem ? "text-[#0C1B2A]" : "text-gray-500"}`}
                              >
                                {reward.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full max-w-[120px]">
                                  <div
                                    className="h-full bg-gradient-to-r from-[#0066FF] to-[#00B4D8] rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-400">
                                  {item.balance}/{reward.xpCost} XP
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRedeem(reward.id)}
                            disabled={!canRedeem || redeeming === reward.id}
                            className={`ml-3 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                              canRedeem
                                ? "bg-[#0066FF] text-white hover:bg-[#0052CC] hover:shadow-md"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {redeeming === reward.id ? (
                              "..."
                            ) : canRedeem ? (
                              <span className="flex items-center gap-1">
                                Échanger <ChevronRight className="h-3 w-3" />
                              </span>
                            ) : (
                              `${reward.xpCost - item.balance} XP manquants`
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-gray-400">
                      Ce commerçant n&apos;a pas encore de récompenses
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
