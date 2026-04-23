"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import Link from "next/link";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept() {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  }

  function refuse() {
    localStorage.setItem("cookie-consent", "refused");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9990] max-w-lg mx-auto animate-in slide-in-from-bottom">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0066FF]/10 flex items-center justify-center flex-shrink-0">
            <Cookie className="h-5 w-5 text-[#0066FF]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[#0C1B2A] dark:text-white">
              Cookies
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
              Ce site utilise des cookies essentiels au fonctionnement (authentification, préférences).
              Aucun cookie publicitaire n&apos;est utilisé.{" "}
              <Link
                href="/legal/confidentialite"
                className="text-[#0066FF] hover:underline"
              >
                En savoir plus
              </Link>
            </p>
          </div>
          <button
            onClick={refuse}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
            aria-label="Fermer"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={refuse}
            className="flex-1 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={accept}
            className="flex-1 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#0066FF] to-[#00B4D8] rounded-xl hover:opacity-90 transition-opacity"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
