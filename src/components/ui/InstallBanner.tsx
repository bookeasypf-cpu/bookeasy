"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showMiniButton, setShowMiniButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone
    ) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isiOS);

    // Check if banner was dismissed — show mini button instead
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < 1 * 24 * 60 * 60 * 1000) {
        // Dismissed recently — show mini button only
        setShowMiniButton(true);
        // Still capture the prompt for Android
        if (!isiOS) {
          const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
          };
          window.addEventListener("beforeinstallprompt", handler);
          return () => window.removeEventListener("beforeinstallprompt", handler);
        }
        return;
      }
    }

    if (isiOS) {
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android/Desktop: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      setShowMiniButton(false);
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    setShowMiniButton(true);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  // Don't render anything if already installed
  if (isInstalled) return null;

  // iOS guide modal
  if (showIOSGuide) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
        <div className="w-full max-w-md mx-4 mb-4 bg-white rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Installer BookEasy
            </h3>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0066FF]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-[#0066FF]">1</span>
              </div>
              <p className="text-sm text-gray-600">
                Appuyez sur le bouton{" "}
                <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 rounded text-xs font-medium">
                  Partager
                  <svg className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
                  </svg>
                </span>{" "}
                en bas de Safari
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0066FF]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-[#0066FF]">2</span>
              </div>
              <p className="text-sm text-gray-600">
                Faites défiler et appuyez sur{" "}
                <span className="font-medium text-gray-900">
                  &quot;Sur l&apos;écran d&apos;accueil&quot;
                </span>
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0066FF]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-[#0066FF]">3</span>
              </div>
              <p className="text-sm text-gray-600">
                Appuyez sur{" "}
                <span className="font-medium text-gray-900">
                  &quot;Ajouter&quot;
                </span>{" "}
                en haut à droite
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="w-full mt-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Plus tard
          </button>
        </div>
      </div>
    );
  }

  // Full banner
  if (showBanner) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-[9999] max-w-md mx-auto animate-in slide-in-from-bottom">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#00B4D8] flex items-center justify-center flex-shrink-0">
              <Smartphone className="h-6 w-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900">
                Installer BookEasy
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Accédez à l&apos;app directement depuis votre écran d&apos;accueil
              </p>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg hover:bg-gray-100 flex-shrink-0"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2 text-sm font-medium text-gray-500 rounded-xl hover:bg-gray-50"
            >
              Plus tard
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#0066FF] to-[#00B4D8] rounded-xl hover:opacity-90 flex items-center justify-center gap-1.5"
            >
              <Download className="h-4 w-4" />
              Installer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mini floating button (after dismissing the banner)
  if (showMiniButton) {
    return (
      <button
        onClick={handleInstall}
        className="fixed bottom-20 right-4 z-[9998] flex items-center gap-2 bg-white/90 backdrop-blur-md shadow-lg border border-gray-200 rounded-full pl-3 pr-4 py-2.5 hover:shadow-xl hover:scale-105 transition-all animate-in slide-in-from-right"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0066FF] to-[#00B4D8] flex items-center justify-center">
          <Download className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-xs font-semibold text-gray-700">Installer</span>
      </button>
    );
  }

  return null;
}
