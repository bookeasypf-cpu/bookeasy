import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import {
  DashboardSidebar,
  DashboardMobileNav,
} from "@/components/layout/DashboardSidebar";
import MerchantOnboarding from "@/components/onboarding/MerchantOnboarding";
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

  // Déterminer si c'est un professionnel de santé
  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
    include: { sector: { select: { name: true, slug: true } } },
  });

  const isMedical = merchant ? isMedicalSectorName(merchant.sector?.name) : false;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Header />
      <DashboardMobileNav isMedical={isMedical} />
      <MerchantOnboarding isMedical={isMedical} />
      <div className="flex flex-1">
        <DashboardSidebar isMedical={isMedical} />
        <main className="flex-1 p-4 lg:p-8 page-transition">{children}</main>
      </div>
    </div>
  );
}
