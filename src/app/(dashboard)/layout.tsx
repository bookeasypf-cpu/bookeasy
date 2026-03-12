import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import {
  DashboardSidebar,
  DashboardMobileNav,
} from "@/components/layout/DashboardSidebar";

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Header />
      <DashboardMobileNav />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-4 lg:p-8 page-transition">{children}</main>
      </div>
    </div>
  );
}
