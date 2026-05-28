import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Users,
  UserCheck,
  CalendarDays,
  Activity,
} from "lucide-react";
import PatientList from "@/components/dashboard/PatientSearch";
import { isMedicalSectorName } from "@/lib/medical";

export const dynamic = "force-dynamic";

export default async function PatientsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
    include: { sector: { select: { name: true } } },
  });
  if (!merchant) redirect("/dashboard/profile");

  // Gate: notes patients only for medical sector pros
  if (!isMedicalSectorName(merchant.sector?.name)) {
    return (
      <div className="page-transition max-w-2xl mx-auto px-4 py-8">
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="py-8 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-[#0C1B2A] dark:text-white mb-2">
              Fonctionnalité réservée
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              La gestion des notes patients est réservée aux professionnels de santé
              (médecins, kinés, dentistes, infirmiers, etc.).
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3 ans max — RGPD retention
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
  const dateFloor = threeYearsAgo.toISOString().slice(0, 10);
  const today = new Date().toISOString().split("T")[0];

  // Agrégations par patient (DB-side, une seule query)
  type PatientStatRow = {
    clientId: string;
    totalBookings: bigint;
    completedBookings: bigint;
    cancelledBookings: bigint;
    totalSpent: number | null;
    firstVisit: string;
    lastVisit: string | null;
  };

  // 5 derniers bookings par patient via window function — bornage explicite
  type RecentBookingRow = {
    clientId: string;
    id: string;
    date: string;
    startTime: string;
    status: string;
    notes: string | null;
    serviceName: string;
  };

  type GlobalStatRow = {
    todayBookings: bigint;
    totalBookings: bigint;
    cancelledBookings: bigint;
  };

  const [patientStats, recentBookingsRows, globalStatsRows] = await Promise.all([
    prisma.$queryRaw<PatientStatRow[]>`
      SELECT
        "clientId",
        COUNT(*)::bigint AS "totalBookings",
        COUNT(*) FILTER (WHERE status = 'COMPLETED')::bigint AS "completedBookings",
        COUNT(*) FILTER (WHERE status IN ('CANCELLED_BY_CLIENT', 'CANCELLED_BY_MERCHANT'))::bigint AS "cancelledBookings",
        COALESCE(SUM("totalPrice") FILTER (WHERE status = 'COMPLETED'), 0)::float AS "totalSpent",
        MIN(date) AS "firstVisit",
        MAX(date) FILTER (WHERE status = 'COMPLETED') AS "lastVisit"
      FROM bookings
      WHERE "merchantId" = ${merchant.id}
        AND date >= ${dateFloor}
      GROUP BY "clientId"
    `,
    prisma.$queryRaw<RecentBookingRow[]>`
      SELECT "clientId", id, date, "startTime", status, notes, "serviceName"
      FROM (
        SELECT
          b."clientId", b.id, b.date, b."startTime", b.status, b.notes,
          s.name AS "serviceName",
          ROW_NUMBER() OVER (
            PARTITION BY b."clientId"
            ORDER BY b.date DESC, b."startTime" DESC
          ) AS rn
        FROM bookings b
        JOIN services s ON s.id = b."serviceId"
        WHERE b."merchantId" = ${merchant.id}
          AND b.date >= ${dateFloor}
      ) ranked
      WHERE rn <= 5
    `,
    prisma.$queryRaw<GlobalStatRow[]>`
      SELECT
        COUNT(*) FILTER (
          WHERE date = ${today}
            AND status NOT IN ('CANCELLED_BY_CLIENT', 'CANCELLED_BY_MERCHANT')
        )::bigint AS "todayBookings",
        COUNT(*)::bigint AS "totalBookings",
        COUNT(*) FILTER (
          WHERE status IN ('CANCELLED_BY_CLIENT', 'CANCELLED_BY_MERCHANT')
        )::bigint AS "cancelledBookings"
      FROM bookings
      WHERE "merchantId" = ${merchant.id}
        AND date >= ${dateFloor}
    `,
  ]);

  const clientIds = patientStats.map((p) => p.clientId);
  const users = clientIds.length
    ? await prisma.user.findMany({
        where: { id: { in: clientIds } },
        select: { id: true, name: true, email: true, phone: true, image: true },
      })
    : [];
  const userById = new Map(users.map((u) => [u.id, u]));

  // Index recent bookings par clientId
  const recentByClient = new Map<string, RecentBookingRow[]>();
  for (const row of recentBookingsRows) {
    const arr = recentByClient.get(row.clientId) ?? [];
    arr.push(row);
    recentByClient.set(row.clientId, arr);
  }

  const patients = patientStats
    .map((p) => {
      const user = userById.get(p.clientId);
      const recent = recentByClient.get(p.clientId) ?? [];
      return {
        id: p.clientId,
        name: user?.name ?? null,
        email: user?.email ?? "",
        phone: user?.phone ?? null,
        image: user?.image ?? null,
        totalBookings: Number(p.totalBookings),
        completedBookings: Number(p.completedBookings),
        cancelledBookings: Number(p.cancelledBookings),
        lastVisit: p.lastVisit,
        firstVisit: p.firstVisit,
        totalSpent: p.totalSpent ?? 0,
        bookings: recent.map((r) => ({
          id: r.id,
          date: r.date,
          startTime: r.startTime,
          status: r.status,
          serviceName: r.serviceName,
          notes: r.notes,
        })),
      };
    })
    .sort((a, b) => b.totalBookings - a.totalBookings);

  const totalPatients = patients.length;
  const regularPatients = patients.filter((p) => p.totalBookings >= 3).length;
  const globalRow = globalStatsRows[0];
  const todayBookings = Number(globalRow?.todayBookings ?? 0);
  const globalTotal = Number(globalRow?.totalBookings ?? 0);
  const globalCancelled = Number(globalRow?.cancelledBookings ?? 0);
  const noShowRate = globalTotal > 0
    ? Math.round((globalCancelled / globalTotal) * 100)
    : 0;

  return (
    <div className="page-transition">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1B2A] dark:text-white animate-fade-in-up">
            Mes patients
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Suivi et historique de vos patients
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        <Card className="rounded-2xl card-hover border-0 shadow-sm">
          <CardContent className="py-5 px-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0C1B2A] dark:text-white">
                  {totalPatients}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total patients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl card-hover border-0 shadow-sm">
          <CardContent className="py-5 px-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0C1B2A] dark:text-white">
                  {regularPatients}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Patients réguliers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl card-hover border-0 shadow-sm">
          <CardContent className="py-5 px-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10">
                <CalendarDays className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0C1B2A] dark:text-white">
                  {todayBookings}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">RDV aujourd&apos;hui</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl card-hover border-0 shadow-sm">
          <CardContent className="py-5 px-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400/10 to-orange-400/10">
                <Activity className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0C1B2A] dark:text-white">
                  {100 - noShowRate}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Taux d&apos;honoration</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient List with Search */}
      <PatientList patients={patients} totalCount={totalPatients} />
    </div>
  );
}
