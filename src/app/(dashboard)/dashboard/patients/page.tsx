import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import {
  Users,
  UserCheck,
  CalendarDays,
  Clock,
  Search,
  Phone,
  Mail,
  ChevronRight,
  Activity,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import PatientNotes from "@/components/dashboard/PatientNotes";

interface PatientData {
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
    service: { name: string };
    notes: string | null;
  }[];
}

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
  const patientsMap = new Map<string, PatientData>();

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

    // Dernier et premier RDV
    if (!patient.lastVisit || booking.date > patient.lastVisit) {
      if (booking.status === "COMPLETED") {
        patient.lastVisit = booking.date;
      }
    }
    if (booking.date < patient.firstVisit) {
      patient.firstVisit = booking.date;
    }

    // Garder les 5 derniers RDV
    if (patient.bookings.length < 5) {
      patient.bookings.push({
        id: booking.id,
        date: booking.date,
        startTime: booking.startTime,
        status: booking.status,
        service: booking.service,
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

  function formatDate(dateStr: string) {
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
            Effectué
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            Confirmé
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
            En attente
          </span>
        );
      case "CANCELLED_BY_CLIENT":
      case "CANCELLED_BY_MERCHANT":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
            Annulé
          </span>
        );
      default:
        return null;
    }
  }

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

      {/* Patient List */}
      <Card className="rounded-2xl border-0 shadow-sm animate-fade-in-up">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-[#0C1B2A]">
            Liste des patients ({totalPatients})
          </h2>
        </div>
        <CardContent className="p-0">
          {patients.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="px-6 py-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {patient.name
                          ? patient.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()
                          : "?"}
                      </div>

                      <div className="min-w-0">
                        {/* Nom + badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-[#0C1B2A]">
                            {patient.name || "Patient anonyme"}
                          </h3>
                          {patient.totalBookings >= 5 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                              Fidèle
                            </span>
                          )}
                          {patient.totalBookings === 1 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">
                              Nouveau
                            </span>
                          )}
                        </div>

                        {/* Contact */}
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {patient.email}
                          </span>
                          {patient.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {patient.phone}
                            </span>
                          )}
                        </div>

                        {/* Infos RDV */}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {patient.totalBookings} consultation{patient.totalBookings > 1 ? "s" : ""}
                          </span>
                          {patient.lastVisit && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Dernière visite : {formatDate(patient.lastVisit)}
                            </span>
                          )}
                          {patient.cancelledBookings > 0 && (
                            <span className="flex items-center gap-1 text-amber-500">
                              <AlertCircle className="h-3 w-3" />
                              {patient.cancelledBookings} annulation{patient.cancelledBookings > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>

                        {/* Derniers RDV */}
                        {patient.bookings.length > 0 && (
                          <div className="mt-3 space-y-1.5">
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                              Derniers rendez-vous
                            </p>
                            {patient.bookings.slice(0, 3).map((booking) => (
                              <div
                                key={booking.id}
                                className="flex items-center gap-2 text-xs"
                              >
                                <span className="text-gray-500 font-mono min-w-[70px]">
                                  {formatDate(booking.date)}
                                </span>
                                <span className="text-gray-600 font-medium">
                                  {booking.service.name}
                                </span>
                                {getStatusBadge(booking.status)}
                                {booking.notes && (
                                  <span className="text-gray-400 truncate max-w-[200px]" title={booking.notes}>
                                    — {booking.notes}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Notes privées */}
                        <PatientNotes
                          clientId={patient.id}
                          patientName={patient.name || "Patient"}
                        />
                      </div>
                    </div>

                    {/* Montant total */}
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-sm font-semibold text-[#0C1B2A]">
                        {formatPrice(patient.totalSpent)}
                      </p>
                      <p className="text-[10px] text-gray-400">total honoraires</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-1">Aucun patient pour le moment</p>
              <p className="text-sm text-gray-400">
                Vos patients apparaîtront ici dès qu&apos;ils prendront rendez-vous
              </p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
