"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function UpgradeButton({ className = "" }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.error === "Non autorisé") {
        router.push("/register?role=MERCHANT&plan=pro");
      } else {
        alert(data.error || "Erreur lors du paiement");
        setLoading(false);
      }
    } catch {
      alert("Erreur de connexion");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={`w-full py-3 px-4 rounded-xl text-center font-semibold text-sm transition-all duration-200 bg-[#0066FF] text-white hover:bg-[#0052CC] shadow-lg shadow-[#0066FF]/25 disabled:opacity-50 flex items-center justify-center gap-2 ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Redirection...
        </>
      ) : (
        "Choisir Pro"
      )}
    </button>
  );
}
