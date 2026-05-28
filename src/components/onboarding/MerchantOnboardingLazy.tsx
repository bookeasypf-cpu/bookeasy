"use client";

import dynamic from "next/dynamic";

// Onboarding shows once per merchant (controlled internally by localStorage).
// Keeping it in the dashboard bundle ship ~50KB of unused JS to every page
// load. Deferring it with ssr: false keeps the LCP tight and lets the
// onboarding flow stream in only when actually needed.
const MerchantOnboarding = dynamic(
  () => import("./MerchantOnboarding"),
  { ssr: false }
);

export default function MerchantOnboardingLazy({
  isMedical,
}: {
  isMedical: boolean;
}) {
  return <MerchantOnboarding isMedical={isMedical} />;
}
