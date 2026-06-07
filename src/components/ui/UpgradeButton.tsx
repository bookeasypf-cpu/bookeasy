"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageCircle, Mail, X } from "lucide-react";
import toast from "react-hot-toast";
import type { BillingCycle } from "@/lib/constants";

interface UpgradeButtonProps {
  className?: string;
  cycle?: BillingCycle;
  applyFounderPricing?: boolean;
  label?: string;
}

// Support contacts — kept in sync with CGU / footer / .env
const SUPPORT_WHATSAPP = "68989700305";
const SUPPORT_EMAIL = "bookeasy.pf@gmail.com";

export function UpgradeButton({
  className = "",
  cycle = "MONTHLY",
  applyFounderPricing = false,
  label = "Choisir Pro",
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showProInquiry, setShowProInquiry] = useState(false);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/payzen/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cycle, applyFounderPricing }),
      });
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
        // Non-merchants must first create an account via QuickRegisterForm
        router.push("/pricing#inscription-pro");
      } else if (typeof data.error === "string" && data.error.includes("n'est pas encore configuré")) {
        // Payment not configured yet → open inquiry modal instead of native alert
        setShowProInquiry(true);
        setLoading(false);
      } else {
        toast.error(data.error || "Erreur lors du paiement");
        setLoading(false);
      }
    } catch {
      toast.error("Erreur de connexion. Réessayez.");
      setLoading(false);
    }
  }

  const cycleLabel = cycle === "MONTHLY" ? "mensuel" : "annuel";
  const founderTag = applyFounderPricing ? " — tarif Fondateur" : "";
  const inquiryMessage = `Bonjour, je souhaite souscrire au plan Pro BookEasy (${cycleLabel}${founderTag}). Merci de me contacter pour finaliser l'inscription.`;
  const whatsappUrl = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(inquiryMessage)}`;
  const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Demande Plan Pro BookEasy")}&body=${encodeURIComponent(inquiryMessage)}`;

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
          label
        )}
      </button>

      {showProInquiry && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setShowProInquiry(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pro-inquiry-title"
        >
          <div
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowProInquiry(false)}
              aria-label="Fermer"
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>

            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#0066FF]/10 to-[#00B4D8]/10 mx-auto mb-4">
              <MessageCircle className="h-7 w-7 text-[#0066FF]" />
            </div>

            <h3
              id="pro-inquiry-title"
              className="text-lg sm:text-xl font-bold text-[#0C1B2A] dark:text-white text-center mb-2"
            >
              Souscrire au plan Pro
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
              Le paiement automatique sera bientôt disponible. En attendant, contactez-nous
              directement et nous activons votre compte Pro sous 24h.
            </p>

            <div className="flex flex-col gap-2.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-xl bg-[#25D366] text-white font-semibold text-sm hover:bg-[#1faa52] transition-colors shadow-md"
              >
                <MessageCircle className="h-4 w-4" />
                Contacter via WhatsApp
              </a>
              <a
                href={mailtoUrl}
                className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-xl bg-[#0066FF] text-white font-semibold text-sm hover:bg-[#0052CC] transition-colors shadow-md"
              >
                <Mail className="h-4 w-4" />
                Envoyer un email
              </a>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-5">
              Plan {cycleLabel}{founderTag}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
