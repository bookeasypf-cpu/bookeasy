"use client";

import dynamic from "next/dynamic";

// Homepage ships to every visitor (logged-out included). The client onboarding
// flow only triggers for newly-registered clients on their first session, so
// shipping its JS upfront hurts LCP for the 95% of visitors who don't need it.
const ClientOnboardingWrapper = dynamic(
  () => import("./ClientOnboardingWrapper"),
  { ssr: false }
);

export default function ClientOnboardingWrapperLazy() {
  return <ClientOnboardingWrapper />;
}
