"use client";

import { createContext, useContext } from "react";

interface MerchantProfileContextValue {
  merchantId: string | null;
  isMedical: boolean;
  plan: "FREE" | "PRO";
  businessName: string;
}

const DEFAULT_VALUE: MerchantProfileContextValue = {
  merchantId: null,
  isMedical: false,
  plan: "FREE",
  businessName: "",
};

const MerchantProfileContext = createContext<MerchantProfileContextValue>(DEFAULT_VALUE);

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
 *
 * Returns DEFAULT_VALUE when no merchant exists yet (e.g. on
 * /dashboard/profile during initial setup) — pages that absolutely
 * require a merchant should check `merchantId !== null`.
 */
export function useMerchantProfile(): MerchantProfileContextValue {
  return useContext(MerchantProfileContext);
}
