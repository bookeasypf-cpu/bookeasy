"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Search, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface GiftCardVerifierProps {
  merchantId: string;
}

export function GiftCardVerifier({ merchantId }: GiftCardVerifierProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    valid: boolean;
    code: string;
    balanceXPF?: number;
    amountXPF?: number;
    merchantName?: string;
    expiresAt?: string;
    error?: string;
  } | null>(null);

  async function handleVerify() {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(
        `/api/gift-cards?code=${encodeURIComponent(code)}&merchantId=${merchantId}`
      );
      const data = await res.json();
      if (res.ok) {
        setResult({
          valid: true,
          code: data.code,
          balanceXPF: data.balanceXPF,
          amountXPF: data.amountXPF,
          merchantName: data.merchantName,
          expiresAt: data.expiresAt,
        });
      } else {
        setResult({
          valid: false,
          code: code.toUpperCase(),
          error: data.error,
        });
      }
    } catch {
      toast.error("Erreur de connexion");
    }
    setLoading(false);
  }

  return (
    <Card className="rounded-2xl border-0 shadow-sm mb-8">
      <CardContent className="p-6">
        <h3 className="font-semibold text-[#0C1B2A] dark:text-white mb-4">
          Vérifier une carte cadeau
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ex: BE-ABCD-1234-EFGH"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setResult(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white px-4 py-2.5 text-sm font-mono tracking-wider focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-colors"
          />
          <button
            onClick={handleVerify}
            disabled={loading || !code.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#0066FF] text-white font-semibold text-sm hover:bg-[#0052CC] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            {loading ? "..." : "Vérifier"}
          </button>
        </div>

        {result && (
          <div
            className={`mt-4 p-4 rounded-xl border ${
              result.valid
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            }`}
          >
            {result.valid ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-semibold text-green-700 dark:text-green-400">
                    Carte valide
                  </span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Code</span>
                    <span className="font-mono font-bold text-[#0066FF]">
                      {result.code}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Solde restant</span>
                    <span className="font-bold text-green-600 text-lg">
                      {result.balanceXPF?.toLocaleString()} F CFP
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Valable chez</span>
                    <span className="font-medium">{result.merchantName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Expire le</span>
                    <span>
                      {result.expiresAt &&
                        new Date(result.expiresAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                {result.error?.includes("expiré") ? (
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium text-red-700 dark:text-red-400">
                  {result.error}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
