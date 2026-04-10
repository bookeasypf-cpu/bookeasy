"use client";

import { useEffect, useRef } from "react";
import { showUpdateNotification } from "@/components/UpdateNotification";

export function useUpdateChecker() {
  const lastVersionRef = useRef<string | null>(null);
  const notifiedRef = useRef(false);

  useEffect(() => {
    // Get initial version
    const getVersion = async () => {
      try {
        const res = await fetch("/sw-version.json?_=" + Date.now(), {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
        console.log("[UpdateChecker] Initial version:", version);
        lastVersionRef.current = version;
      }
    });

    // Check for updates every 30 seconds
    const interval = setInterval(() => {
      getVersion().then((version) => {
        if (!version) return;

        // Log every check
        console.log("[UpdateChecker] Current version:", version, "Last version:", lastVersionRef.current);

        // If version changed, new version is available
        if (lastVersionRef.current && version !== lastVersionRef.current && !notifiedRef.current) {
          console.log("[UpdateChecker] Version changed! Showing notification");
          lastVersionRef.current = version;
          notifiedRef.current = true;

          // Show update notification
          showUpdateNotification();
        }
      });
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, []);
}
