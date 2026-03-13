import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";

export default async function DashboardAnalyticsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
  });
  if (!merchant) redirect("/dashboard/profile");

  const allBookings = await prisma.booking.findMany({
    where: {
      merchantId: merchant.id,
      status: { notIn: ["CANCELLED_BY_CLIENT", "CANCELLED_BY_MERCHANT"] },
    },
    include: { service: { select: { name: true } } },
    orderBy: { date: "desc" },
  });

  const totalRevenue = allBookings.reduce((s, b) => s + b.totalPrice, 0);
  const totalBookings = allBookings.length;
  const completedBookings = allBookings.filter(
    (b) => b.status === "COMPLETED"
  ).length;

  const serviceCounts: Record<string, number> = {};
  allBookings.forEach((b) => {
    serviceCounts[b.service.name] =
      (serviceCounts[b.service.name] || 0) + 1;
  });
  const topServices = Object.entries(serviceCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  const last30Str = last30Days.toISOString().split("T")[0];
  const recentBookings = allBookings.filter((b) => b.date >= last30Str);
  const recentRevenue = recentBookings.reduce((s, b) => s + b.totalPrice, 0);

  return (
    <div className="page-transition">
      <h1 className="text-2xl font-bold text-[#0C1B2A] mb-6 animate-fade-in-up">Statistiques</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        <Card className="rounded-2xl border-0 shadow-sm card-hover">
          <CardContent className="py-5 text-center">
            <p className="text-2xl font-bold text-[#0C1B2A]">{totalBookings}</p>
            <p className="text-xs text-gray-500 mt-1">Total RDV</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-sm card-hover">
          <CardContent className="py-5 text-center">
            <p className="text-2xl font-bold text-[#0C1B2A]">
              {completedBookings}
            </p>
            <p className="text-xs text-gray-500 mt-1">Terminés</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-sm card-hover">
          <CardContent className="py-5 text-center">
            <p className="text-2xl font-bold bg-gradient-to-r from-[#0066FF] to-[#00B4D8] bg-clip-text text-transparent">
              {formatPrice(totalRevenue)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Revenu total</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-sm card-hover">
          <CardContent className="py-5 text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {formatPrice(recentRevenue)}
            </p>
            <p className="text-xs text-gray-500 mt-1">30 derniers jours</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm animate-fade-in-up">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-[#0C1B2A]">
            Services les plus populaires
          </h2>
        </div>
        <CardContent>
          {topServices.length > 0 ? (
            <div className="space-y-3">
              {topServices.map(([name, count], i) => (
                <div
                  key={name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0
                        ? "bg-gradient-to-br from-[#0066FF] to-[#00B4D8] text-white"
                        : i === 1
                          ? "bg-gradient-to-br from-[#0066FF]/20 to-[#00B4D8]/20 text-[#0066FF]"
                          : i === 2
                            ? "bg-gradient-to-br from-[#0066FF]/10 to-[#00B4D8]/10 text-[#0066FF]"
                            : "bg-gray-100 text-gray-600"
                    }`}>
                      {i + 1}
                    </span>
                    <span className="text-sm text-[#0C1B2A] font-medium">{name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-500">
                    {count} réservation{count > 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm py-4">
              Pas encore de données
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
