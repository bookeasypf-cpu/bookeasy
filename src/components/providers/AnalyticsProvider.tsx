"use client";

import { useEffect } from "react";
import { bootAnalytics, teardownAnalytics } from "@/lib/analytics";

/**
 * Mounts once at the root of the client tree. Boots PostHog when the
 * cookie banner is accepted (now or later) and tears it down if the
 * user revokes consent.
 *
 * The boot is a no-op if NEXT_PUBLIC_POSTHOG_KEY isn't set — keeps
 * local dev quiet for contributors who haven't connected analytics.
 */
export function AnalyticsProvider() {
  useEffect(() => {
    // Initial boot — handles the case where consent was given on a
    // previous visit (localStorage persists across sessions).
    bootAnalytics();

    // React to consent changes from THIS tab (CookieBanner dispatches
    // a synthetic storage event after writing localStorage).
    // Native storage events only fire from OTHER tabs, so we also
    // listen for our custom event below.
    const onConsentChange = (e: Event) => {
      const detail = (e as CustomEvent<{ value: string }>).detail;
      if (detail?.value === "accepted") {
        bootAnalytics();
      } else {
        teardownAnalytics();
      }
    };

    // Cross-tab: native storage event from another tab updating consent.
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "cookie-consent") return;
      if (e.newValue === "accepted") bootAnalytics();
      else teardownAnalytics();
    };

    window.addEventListener("cookie-consent-change", onConsentChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("cookie-consent-change", onConsentChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return null;
}
