import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { isMedicalSectorName } from "@/lib/medical";
import {
  Users,
  CalendarDays,
  UserCheck,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { AnimatedChart } from "@/components/analytics/AnimatedChart";
import { AnimatedNumber } from "@/components/analytics/AnimatedNumber";
import { AnimatedCard, AnimatedProgress, AnimatedListItem } from "@/components/analytics/AnimatedCard";

export const dynamic = "force-dynamic";

export default async function DashboardAnalyticsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
    include: { sector: { select: { name: true } } },
  });
  if (!merchant) redirect("/dashboard/profile");

  const isMedical = isMedicalSectorName(merchant.sector?.name);

  const allBookings = await prisma.booking.findMany({
    where: { merchantId: merchant.id },
    include: {
      service: { select: { name: true } },
      client: { select: { id: true, name: true } },
    },
    orderBy: { date: "desc" },
  });

  const nonCancelledBookings = allBookings.filter(
    (b) => b.status !== "CANCELLED_BY_CLIENT" && b.status !== "CANCELLED_BY_MERCHANT"
  );
  const cancelledBookings = allBookings.filter(
    (b) => b.status === "CANCELLED_BY_CLIENT" || b.status === "CANCELLED_BY_MERCHANT"
  );

  const totalRevenue = nonCancelledBookings.reduce((s, b) => s + b.totalPrice, 0);
  const totalBookings = allBookings.length;
  const completedBookings = allBookings.filter(
    (b) => b.status === "COMPLETED"
  ).length;

  const uniqueClients = new Set(allBookings.map((b) => b.client.id)).size;

  const honorationRate =
    totalBookings > 0
      ? Math.round(((totalBookings - cancelledBookings.length) / totalBookings) * 100)
      : 100;

  const serviceCounts: Record<string, number> = {};
  nonCancelledBookings.forEach((b) => {
    serviceCounts[b.service.name] =
      (serviceCounts[b.service.name] || 0) + 1;
  });
  const topServices = Object.entries(serviceCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const tahitiNow = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Pacific/Tahiti' })
  );
  const last30Days = new Date(tahitiNow);
  last30Days.setDate(last30Days.getDate() - 30);
  const last30Str = last30Days.toLocaleDateString('en-CA', { timeZone: 'Pacific/Tahiti' });
  const recentBookings = nonCancelledBookings.filter((b) => b.date >= last30Str);
  const recentRevenue = recentBookings.reduce((s, b) => s + b.totalPrice, 0);

  const newPatientsLast30 = new Set(
    recentBookings.map((b) => b.client.id)
  ).size;

  const monthlyStats: { month: string; count: number; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
    const monthBookings = nonCancelledBookings.filter((b) => b.date.startsWith(monthStr));
    monthlyStats.push({
      month: monthLabel,
      count: monthBookings.length,
      revenue: monthBookings.reduce((s, b) => s + b.totalPrice, 0),
    });
  }

  const cancelledByClient = allBookings.filter((b) => b.status === "CANCELLED_BY_CLIENT").length;
  const cancelledByMerchant = allBookings.filter((b) => b.status === "CANCELLED_BY_MERCHANT").length;

  if (isMedical) {
    return (
      <div>
        <AnimatedCard>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#0C1B2A] dark:text-white">
              Statistiques du cabinet
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Vue d&apos;ensemble de votre activité médicale
            </p>
          </div>
        </AnimatedCard>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <AnimatedCard index={0}>
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="py-5 text-center">
                <Users className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                <AnimatedNumber value={uniqueClients} className="text-2xl font-bold text-[#0C1B2A] dark:text-white block" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Patients</p>
              </CardContent>
            </Card>
          </AnimatedCard>
          <AnimatedCard index={1}>
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="py-5 text-center">
                <CalendarDays className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <AnimatedNumber value={completedBookings} className="text-2xl font-bold text-[#0C1B2A] dark:text-white block" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Consultations effectuées</p>
              </CardContent>
            </Card>
          </AnimatedCard>
          <AnimatedCard index={2}>
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="py-5 text-center">
                <CheckCircle className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                <AnimatedNumber value={honorationRate} formatType="percent" className="text-2xl font-bold text-emerald-600 block" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Taux d&apos;honoration</p>
              </CardContent>
            </Card>
          </AnimatedCard>
          <AnimatedCard index={3}>
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="py-5 text-center">
                <UserCheck className="h-6 w-6 text-violet-600 mx-auto mb-2" />
                <AnimatedNumber value={newPatientsLast30} className="text-2xl font-bold text-violet-600 block" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Nouveaux patients (30j)</p>
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>

        <AnimatedCard index={4}>
          <Card className="rounded-2xl border-0 shadow-sm mb-6">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-semibold text-[#0C1B2A] dark:text-white">
                Activité mensuelle
              </h2>
            </div>
            <CardContent className="p-6">
              <AnimatedChart data={monthlyStats} color="emerald" />
            </CardContent>
          </Card>
        </AnimatedCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatedCard index={5}>
            <Card className="rounded-2xl border-0 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="font-semibold text-[#0C1B2A] dark:text-white">
                  Consultations les plus fréquentes
                </h2>
              </div>
              <CardContent>
                {topServices.length > 0 ? (
                  <div className="space-y-3">
                    {topServices.map(([name, count], i) => (
                      <AnimatedListItem key={name} index={i}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                i === 0
                                  ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white"
                                  : i === 1
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {i + 1}
                            </span>
                            <span className="text-sm text-[#0C1B2A] dark:text-white font-medium">
                              {name}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-500">
                            {count} consultation{count > 1 ? "s" : ""}
                          </span>
                        </div>
                      </AnimatedListItem>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm py-4">Pas encore de données</p>
                )}
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard index={6}>
            <Card className="rounded-2xl border-0 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="font-semibold text-[#0C1B2A] dark:text-white">
                  Résumé des annulations
                </h2>
              </div>
              <CardContent>
                <div className="space-y-4">
                  <AnimatedListItem index={0}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Annulations patient</span>
                      </div>
                      <AnimatedNumber value={cancelledByClient} className="font-semibold text-[#0C1B2A] dark:text-white" />
                    </div>
                  </AnimatedListItem>
                  <AnimatedListItem index={1}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Annulations praticien</span>
                      </div>
                      <AnimatedNumber value={cancelledByMerchant} className="font-semibold text-[#0C1B2A] dark:text-white" />
                    </div>
                  </AnimatedListItem>
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Taux de fiabilité</span>
                      <AnimatedNumber value={honorationRate} formatType="percent" className="font-bold text-emerald-600" />
                    </div>
                    <AnimatedProgress value={honorationRate} color="emerald" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // DASHBOARD ANALYTIQUES STANDARD
  // ─────────────────────────────────────────
  return (
    <div>
      <AnimatedCard>
        <h1 className="text-2xl font-bold text-[#0C1B2A] dark:text-white mb-6">Statistiques</h1>
      </AnimatedCard>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AnimatedCard index={0}>
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="py-5 text-center">
              <CalendarDays className="h-6 w-6 text-[#0066FF] mx-auto mb-2" />
              <AnimatedNumber value={totalBookings} className="text-2xl font-bold text-[#0C1B2A] dark:text-white block" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total RDV</p>
            </CardContent>
          </Card>
        </AnimatedCard>
        <AnimatedCard index={1}>
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="py-5 text-center">
              <CheckCircle className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
              <AnimatedNumber value={completedBookings} className="text-2xl font-bold text-[#0C1B2A] dark:text-white block" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Terminés</p>
            </CardContent>
          </Card>
        </AnimatedCard>
        <AnimatedCard index={2}>
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="py-5 text-center">
              <DollarSign className="h-6 w-6 text-[#00B4D8] mx-auto mb-2" />
              <AnimatedNumber value={totalRevenue} formatType="price" className="text-2xl font-bold bg-gradient-to-r from-[#0066FF] to-[#00B4D8] bg-clip-text text-transparent block" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Revenu total</p>
            </CardContent>
          </Card>
        </AnimatedCard>
        <AnimatedCard index={3}>
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="py-5 text-center">
              <TrendingUp className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
              <AnimatedNumber value={recentRevenue} formatType="price" className="text-2xl font-bold text-emerald-600 block" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">30 derniers jours</p>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      <AnimatedCard index={4}>
        <Card className="rounded-2xl border-0 shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-[#0C1B2A] dark:text-white">
              Activité mensuelle
            </h2>
          </div>
          <CardContent className="p-6">
            <AnimatedChart data={monthlyStats} color="blue" />
          </CardContent>
        </Card>
      </AnimatedCard>

      <AnimatedCard index={5}>
        <Card className="rounded-2xl border-0 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-[#0C1B2A] dark:text-white">
              Services les plus populaires
            </h2>
          </div>
          <CardContent>
            {topServices.length > 0 ? (
              <div className="space-y-3">
                {topServices.map(([name, count], i) => (
                  <AnimatedListItem key={name} index={i}>
                    <div className="flex items-center justify-between">
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
                        <span className="text-sm text-[#0C1B2A] dark:text-white font-medium">{name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-500">
                        {count} réservation{count > 1 ? "s" : ""}
                      </span>
                    </div>
                  </AnimatedListItem>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm py-4">
                Pas encore de données
              </p>
            )}
          </CardContent>
        </Card>
      </AnimatedCard>
    </div>
  );
}
