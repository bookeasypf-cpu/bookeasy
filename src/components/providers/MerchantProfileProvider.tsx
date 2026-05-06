"use client";

import { createContext, useContext } from "react";

interface MerchantProfileContextValue {
  merchantId: string;
  isMedical: boolean;
  plan: "FREE" | "PRO";
  businessName: string;
}

const MerchantProfileContext = createContext<MerchantProfileContextValue | null>(null);

export function MerchantProfileProvider({
  value,
  children,
}: {
  value: MerchantProfileContextValue;
  children: React.ReactNode;
}) {
  return (
    <MerchantProfileContext.Provider value={value}>
      {children}
    </MerchantProfileContext.Provider>
  );
}

/**
 * Read the merchant profile context (set in dashboard layout).
 * Eliminates redundant /api/dashboard/profile fetches that were
 * happening 5+ times across dashboard sub-pages.
 */
export function useMerchantProfile(): MerchantProfileContextValue {
  const ctx = useContext(MerchantProfileContext);
  if (!ctx) {
    throw new Error("useMerchantProfile must be used within MerchantProfileProvider");
  }
  return ctx;
}
