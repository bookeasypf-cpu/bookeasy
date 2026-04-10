"use client";

import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

export function useUpdateChecker() {
  const lastVersionRef = useRef<string | null>(null);

  useEffect(() => {
    // Get initial version
    const getVersion = async () => {
      try {
        const res = await fetch("/sw-version.json?_=" + Date.now());
        const data = await res.json();
        return data.version;
      } catch (err) {
        console.warn("Failed to fetch version:", err);
        return null;
      }
    };

    // First fetch to establish baseline
    getVersion().then((version) => {
      if (version) {
        lastVersionRef.current = version;
      }
    });

    // Check for updates every 30 seconds
    const interval = setInterval(() => {
      getVersion().then((version) => {
        if (!version) return;

        // If version changed, new version is available
        if (lastVersionRef.current && version !== lastVersionRef.current) {
          lastVersionRef.current = version;

          // Show update notification
          toast.custom((t) => (
            <div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg flex items-center justify-between gap-4">
              <span>Nouvelle version disponible</span>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  window.location.reload();
                }}
                className="bg-white text-blue-500 px-4 py-2 rounded font-semibold hover:bg-gray-100 transition-colors"
              >
                Recharger
              </button>
            </div>
          ));
        }
      });
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, []);
}
