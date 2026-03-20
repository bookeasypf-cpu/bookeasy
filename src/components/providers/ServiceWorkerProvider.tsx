"use client";

import { useEffect } from "react";

export function ServiceWorkerProvider() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          // Auto-update check every hour
          setInterval(() => reg.update(), 60 * 60 * 1000);
        })
        .catch((err) => console.warn("SW registration failed:", err));
    }
  }, []);

  return null;
}
