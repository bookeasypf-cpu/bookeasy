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

export default async function PatientsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
  });
  if (!merchant) redirect("/dashboard/profile");

  // Récupérer tous les bookings avec les infos clients
  const allBookings = await prisma.booking.findMany({
    where: { merchantId: merchant.id },
    include: {
      client: {
        select: { id: true, name: true, email: true, phone: true, image: true },
      },
      service: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  });

  // Grouper par patient
  const patientsMap = new Map<string, {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    image: string | null;
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    lastVisit: string | null;
    firstVisit: string;
    totalSpent: number;
    bookings: {
      id: string;
      date: string;
      startTime: string;
      status: string;
      serviceName: string;
      notes: string | null;
    }[];
  }>();

  allBookings.forEach((booking) => {
    const clientId = booking.client.id;
    if (!patientsMap.has(clientId)) {
      patientsMap.set(clientId, {
        id: clientId,
        name: booking.client.name,
        email: booking.client.email,
        phone: booking.client.phone,
        image: booking.client.image,
        totalBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        lastVisit: null,
        firstVisit: booking.date,
        totalSpent: 0,
        bookings: [],
      });
    }

    const patient = patientsMap.get(clientId)!;
    patient.totalBookings++;

    if (booking.status === "COMPLETED") {
      patient.completedBookings++;
      patient.totalSpent += booking.totalPrice;
    }
    if (
      booking.status === "CANCELLED_BY_CLIENT" ||
      booking.status === "CANCELLED_BY_MERCHANT"
    ) {
      patient.cancelledBookings++;
    }

    if (!patient.lastVisit || booking.date > patient.lastVisit) {
      if (booking.status === "COMPLETED") {
        patient.lastVisit = booking.date;
      }
    }
    if (booking.date < patient.firstVisit) {
      patient.firstVisit = booking.date;
    }

    if (patient.bookings.length < 5) {
      patient.bookings.push({
        id: booking.id,
        date: booking.date,
        startTime: booking.startTime,
        status: booking.status,
        serviceName: booking.service.name,
        notes: booking.notes,
      });
    }
  });

  const patients = Array.from(patientsMap.values()).sort(
    (a, b) => b.totalBookings - a.totalBookings
  );

  // Stats globales
  const totalPatients = patients.length;
  const regularPatients = patients.filter((p) => p.totalBookings >= 3).length;
  const today = new Date().toISOString().split("T")[0];
  const todayBookings = allBookings.filter(
    (b) => b.date === today && b.status !== "CANCELLED_BY_CLIENT" && b.status !== "CANCELLED_BY_MERCHANT"
  ).length;
  const noShowRate =
    allBookings.length > 0
      ? Math.round(
          (allBookings.filter(
            (b) =>
              b.status === "CANCELLED_BY_CLIENT" ||
              b.status === "CANCELLED_BY_MERCHANT"
          ).length /
            allBookings.length) *
            100
        )
      : 0;

  return (
    <div className="page-transition">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1B2A] animate-fade-in-up">
            Mes patients
          </h1>
          <p className="text-sm text-gray-500 mt-1">
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
                <p className="text-2xl font-bold text-[#0C1B2A]">
                  {totalPatients}
                </p>
                <p className="text-xs text-gray-500">Total patients</p>
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
                <p className="text-2xl font-bold text-[#0C1B2A]">
                  {regularPatients}
                </p>
                <p className="text-xs text-gray-500">Patients réguliers</p>
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
                <p className="text-2xl font-bold text-[#0C1B2A]">
                  {todayBookings}
                </p>
                <p className="text-xs text-gray-500">RDV aujourd&apos;hui</p>
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
                <p className="text-2xl font-bold text-[#0C1B2A]">
                  {100 - noShowRate}%
                </p>
                <p className="text-xs text-gray-500">Taux d&apos;honoration</p>
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
