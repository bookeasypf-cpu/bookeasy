"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function UpgradeButton({ className = "" }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/payzen/checkout", { method: "POST" });
      const data = await res.json();

      if (data.actionUrl && data.fields) {
        // PayZen: formulaire HTML qui redirige vers la page de paiement OSB
        const form = formRef.current;
        if (form) {
          form.action = data.actionUrl;
          form.innerHTML = "";
          for (const [key, value] of Object.entries(data.fields)) {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = value as string;
            form.appendChild(input);
          }
          form.submit();
        }
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
    <>
      <form ref={formRef} method="POST" className="hidden" />
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
    </>
  );
}
