import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatTime } from "@/lib/utils";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
} from "@/lib/constants";
import {
  CalendarDays,
  DollarSign,
  Star,
  Users,
  Clock,
  Activity,
  UserCheck,
  Stethoscope,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { isMedicalSectorName } from "@/lib/medical";

/** Return the current date in Tahiti (UTC-10) as YYYY-MM-DD */
function getTahitiDate(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Pacific/Tahiti' });
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
    include: { sector: { select: { name: true } } },
  });

  if (!merchant) {
    return (
      <div className="text-center py-16 animate-fade-in-up">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Configurez votre profil
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Pour commencer à recevoir des rendez-vous, créez votre profil professionnel.
        </p>
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-[#0066FF]/25 transition-all duration-300"
        >
          Créer mon profil
        </Link>
      </div>
    );
  }

  const isMedical = isMedicalSectorName(merchant.sector?.name);

  const today = getTahitiDate();

  // Build a Date object anchored to the Tahiti "now"
  const tahitiNow = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Pacific/Tahiti' })
  );
  const weekStart = new Date(tahitiNow);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toLocaleDateString('en-CA', { timeZone: 'Pacific/Tahiti' });
  const monthStart = new Date(tahitiNow);
  monthStart.setDate(1);
  const monthStartStr = monthStart.toLocaleDateString('en-CA', { timeZone: 'Pacific/Tahiti' });

  const [todayBookings, weekBookings, monthBookings, reviews, upcomingBookings, uniquePatients] =
    await Promise.all([
      prisma.booking.count({
        where: {
          merchantId: merchant.id,
          date: today,
          status: { notIn: ["CANCELLED_BY_CLIENT", "CANCELLED_BY_MERCHANT"] },
        },
      }),
      prisma.booking.count({
        where: {
          merchantId: merchant.id,
          date: { gte: weekStartStr },
          status: { notIn: ["CANCELLED_BY_CLIENT", "CANCELLED_BY_MERCHANT"] },
        },
      }),
      prisma.booking.findMany({
        where: {
          merchantId: merchant.id,
          date: { gte: monthStartStr },
          status: { notIn: ["CANCELLED_BY_CLIENT", "CANCELLED_BY_MERCHANT"] },
        },
        select: { totalPrice: true },
      }),
      prisma.review.findMany({
        where: { merchantId: merchant.id },
        select: { rating: true },
      }),
      prisma.booking.findMany({
        where: {
          merchantId: merchant.id,
          date: today,
          status: { in: ["CONFIRMED", "PENDING"] },
        },
        include: {
          client: { select: { name: true } },
          service: { select: { name: true } },
        },
        orderBy: { startTime: "asc" },
        take: 10,
      }),
      // Nombre de patients uniques (seulement pour médical)
      isMedical
        ? prisma.booking.findMany({
            where: { merchantId: merchant.id },
            select: { clientId: true },
            distinct: ["clientId"],
          })
        : Promise.resolve([]),
    ]);

  const monthRevenue = monthBookings.reduce((s, b) => s + b.totalPrice, 0);
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  // Stats différentes selon le type
  const stats = isMedical
    ? [
        {
          label: "Consultations du jour",
          value: todayBookings,
          icon: Stethoscope,
          gradient: "from-emerald-500/10 to-teal-500/10",
          iconColor: "text-emerald-600",
        },
        {
          label: "Cette semaine",
          value: weekBookings,
          icon: CalendarDays,
          gradient: "from-blue-500/10 to-cyan-500/10",
          iconColor: "text-blue-600",
        },
        {
          label: "Total patients",
          value: uniquePatients.length,
          icon: Users,
          gradient: "from-violet-500/10 to-purple-500/10",
          iconColor: "text-violet-600",
        },
        {
          label: "Note moyenne",
          value: avgRating > 0 ? `${avgRating.toFixed(1)} / 5` : "\u2014",
          icon: Star,
          gradient: "from-amber-400/10 to-orange-400/10",
          iconColor: "text-amber-500",
        },
      ]
    : [
        {
          label: "RDV aujourd'hui",
          value: todayBookings,
          icon: CalendarDays,
          gradient: "from-[#0066FF]/10 to-[#00B4D8]/10",
          iconColor: "text-[#0066FF]",
        },
        {
          label: "Cette semaine",
          value: weekBookings,
          icon: Users,
          gradient: "from-emerald-500/10 to-teal-500/10",
          iconColor: "text-emerald-600",
        },
        {
          label: "Revenu du mois",
          value: formatPrice(monthRevenue),
          icon: DollarSign,
          gradient: "from-violet-500/10 to-purple-500/10",
          iconColor: "text-violet-600",
        },
        {
          label: "Note moyenne",
          value: avgRating > 0 ? `${avgRating.toFixed(1)} / 5` : "\u2014",
          icon: Star,
          gradient: "from-amber-400/10 to-orange-400/10",
          iconColor: "text-amber-500",
        },
      ];

  const greeting = isMedical ? "Docteur" : "Pro";

  return (
    <div className="page-transition">
      <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-[#0C1B2A] dark:text-white">
          Bonjour, {session.user.name || greeting} !
        </h1>
        {isMedical && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
            <Heart className="h-3 w-3" />
            {merchant.sector?.name}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        {stats.map((stat) => (
          <Card key={stat.label} className="rounded-2xl card-hover border-0 shadow-sm">
            <CardContent className="py-5 px-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0C1B2A] dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's bookings */}
      <Card className="rounded-2xl border-0 shadow-sm animate-fade-in-up">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold text-[#0C1B2A] dark:text-white">
            {isMedical ? "Consultations du jour" : "Rendez-vous du jour"}
          </h2>
          <Link
            href="/dashboard/bookings"
            className={`text-sm font-medium transition-colors ${
              isMedical
                ? "text-emerald-600 hover:text-emerald-700"
                : "text-[#0066FF] hover:text-[#00B4D8]"
            }`}
          >
            Voir tout
          </Link>
        </div>
        <CardContent>
          {upcomingBookings.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between py-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-500 min-w-[60px]">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTime(booking.startTime)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0C1B2A] dark:text-white">
                        {booking.client.name || (isMedical ? "Patient" : "Client")}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {booking.service.name}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${BOOKING_STATUS_COLORS[booking.status] || ""}`}
                  >
                    {BOOKING_STATUS_LABELS[booking.status] || booking.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm py-4">
              {isMedical
                ? "Aucune consultation prévue aujourd'hui"
                : "Aucun rendez-vous prévu aujourd'hui"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick links pour médical */}
      {isMedical && (
        <div className="grid grid-cols-2 gap-4 mt-6 animate-fade-in-up">
          <Link href="/dashboard/patients">
            <Card className="rounded-2xl border-0 shadow-sm card-hover cursor-pointer bg-gradient-to-br from-emerald-50 to-teal-50">
              <CardContent className="py-5 px-4 text-center">
                <Users className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-medium text-emerald-900 text-sm">Voir mes patients</p>
                <p className="text-xs text-emerald-600 mt-1">Historique et suivi</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/analytics">
            <Card className="rounded-2xl border-0 shadow-sm card-hover cursor-pointer bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardContent className="py-5 px-4 text-center">
                <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-blue-900 text-sm">Statistiques</p>
                <p className="text-xs text-blue-600 mt-1">Activité du cabinet</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}
    </div>
  );
}
