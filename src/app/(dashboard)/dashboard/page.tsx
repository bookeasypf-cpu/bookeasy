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
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
  });

  if (!merchant) {
    return (
      <div className="text-center py-16 animate-fade-in-up">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Configurez votre profil
        </h2>
        <p className="text-gray-500 mb-6">
          Pour commencer &agrave; recevoir des rendez-vous, cr&eacute;ez votre profil professionnel.
        </p>
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-[#0066FF]/25 transition-all duration-300"
        >
          Cr&eacute;er mon profil
        </Link>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().split("T")[0];

  const [todayBookings, weekBookings, monthBookings, reviews, upcomingBookings] =
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
    ]);

  const monthRevenue = monthBookings.reduce((s, b) => s + b.totalPrice, 0);
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const stats = [
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

  return (
    <div className="page-transition">
      <h1 className="text-2xl font-bold text-[#0C1B2A] mb-6 animate-fade-in-up">
        Bonjour, {session.user.name || "Pro"} !
      </h1>

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
                  <p className="text-2xl font-bold text-[#0C1B2A]">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's bookings */}
      <Card className="rounded-2xl border-0 shadow-sm animate-fade-in-up">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-[#0C1B2A]">
            Rendez-vous du jour
          </h2>
          <Link
            href="/dashboard/bookings"
            className="text-sm text-[#0066FF] font-medium hover:text-[#00B4D8] transition-colors"
          >
            Voir tout
          </Link>
        </div>
        <CardContent>
          {upcomingBookings.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between py-3 hover:bg-gray-50/50 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-500 min-w-[60px]">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTime(booking.startTime)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0C1B2A]">
                        {booking.client.name || "Client"}
                      </p>
                      <p className="text-xs text-gray-500">
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
            <p className="text-gray-500 text-sm py-4">
              Aucun rendez-vous pr&eacute;vu aujourd&apos;hui
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
