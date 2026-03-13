"use client";

import { useSession } from "next-auth/react";
import ClientOnboarding from "./ClientOnboarding";

export default function ClientOnboardingWrapper() {
  const { data: session } = useSession();

  // Only show for logged-in CLIENT users
  if (!session?.user || (session.user as { role?: string }).role === "MERCHANT") {
    return null;
  }

  return <ClientOnboarding />;
}
