"use client";

import { useState, useMemo } from "react";
import { Search, X, Users, CalendarDays, Clock, Phone, Mail, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";
import PatientNotes from "./PatientNotes";

interface PatientBooking {
  id: string;
  date: string;
  startTime: string;
  status: string;
  serviceName: string;
  notes: string | null;
}

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
  bookings: PatientBooking[];
}

interface PatientListProps {
  patients: PatientData[];
  totalCount: number;
}

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

export default function PatientList({ patients, totalCount }: PatientListProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return patients;
    const q = query.toLowerCase().trim();
    return patients.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        p.email.toLowerCase().includes(q) ||
        (p.phone && p.phone.includes(q))
    );
  }, [patients, query]);

  return (
    <Card className="rounded-2xl border-0 shadow-sm animate-fade-in-up">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-[#0C1B2A]">
            Liste des patients ({totalCount})
          </h2>
        </div>
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom, email ou téléphone..."
            className="w-full pl-10 pr-10 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-colors bg-gray-50/50"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
        {query && (
          <p className="text-xs text-gray-400 mt-2">
            {filtered.length} résultat{filtered.length !== 1 ? "s" : ""} pour &quot;{query}&quot;
          </p>
        )}
      </div>
      <CardContent className="p-0">
        {filtered.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filtered.map((patient) => (
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
                        <span className="flex items-center gap-1 truncate max-w-[180px]">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{patient.email}</span>
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
                                {booking.serviceName}
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
        ) : query ? (
          <div className="text-center py-12 px-4">
            <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-1">Aucun patient trouvé</p>
            <p className="text-sm text-gray-400">
              Essayez avec un autre nom, email ou numéro
            </p>
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
  );
}
