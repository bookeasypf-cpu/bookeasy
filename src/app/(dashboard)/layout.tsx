import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import {
  DashboardSidebar,
  DashboardMobileNav,
} from "@/components/layout/DashboardSidebar";
import MerchantOnboarding from "@/components/onboarding/MerchantOnboardingLazy";
import { MerchantProfileProvider } from "@/components/providers/MerchantProfileProvider";
import { isMedicalSectorName } from "@/lib/medical";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "MERCHANT") {
    redirect("/");
  }

  // Single fetch — shared via context to all dashboard sub-pages.
  // Tolerates null merchant: a brand-new MERCHANT user must be able
  // to reach /dashboard/profile to create their profile. Each page
  // decides what to render when merchantId is null.
  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      businessName: true,
      plan: true,
      sector: { select: { name: true, slug: true } },
    },
  });

  const isMedical = merchant ? isMedicalSectorName(merchant.sector?.name) : false;

  return (
    <MerchantProfileProvider
      value={{
        merchantId: merchant?.id ?? null,
        isMedical,
        plan: (merchant?.plan as "FREE" | "PRO") ?? "FREE",
        businessName: merchant?.businessName ?? "",
      }}
    >
      <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-gray-950">
        <Header />
        <DashboardMobileNav isMedical={isMedical} />
        <MerchantOnboarding isMedical={isMedical} />
        <div className="flex flex-1">
          <DashboardSidebar isMedical={isMedical} />
          <main className="flex-1 p-4 lg:p-8 page-transition">{children}</main>
        </div>
      </div>
    </MerchantProfileProvider>
  );
}
