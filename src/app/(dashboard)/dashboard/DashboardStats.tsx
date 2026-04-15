"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  DollarSign,
  Star,
  Users,
  Clock,
  Stethoscope,
  X,
  User,
  Briefcase,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { formatPrice, formatTime } from "@/lib/utils";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from "@/lib/constants";
import Link from "next/link";

export interface BookingLite {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number;
  clientName: string | null;
  serviceName: string;
}

interface Props {
  isMedical: boolean;
  todayCount: number;
  weekCount: number;
  monthRevenue: number;
  avgRating: number;
  patientsCount: number;
  todayBookings: BookingLite[];
  weekBookings: BookingLite[];
}

type ModalKind = "today" | "week" | null;

const DAYS_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const MONTHS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function formatLongDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
}

export function DashboardStats({
  isMedical,
  todayCount,
  weekCount,
  monthRevenue,
  avgRating,
  patientsCount,
  todayBookings,
  weekBookings,
}: Props) {
  const [modal, setModal] = useState<ModalKind>(null);

  const stats = isMedical
    ? [
        {
          key: "today" as const,
          label: "Consultations du jour",
          value: todayCount,
          icon: Stethoscope,
          gradient: "from-emerald-500/10 to-teal-500/10",
          iconColor: "text-emerald-600",
          clickable: true,
        },
        {
          key: "week" as const,
          label: "Cette semaine",
          value: weekCount,
          icon: CalendarDays,
          gradient: "from-blue-500/10 to-cyan-500/10",
          iconColor: "text-blue-600",
          clickable: true,
        },
        {
          key: "patients" as const,
          label: "Total patients",
          value: patientsCount,
          icon: Users,
          gradient: "from-violet-500/10 to-purple-500/10",
          iconColor: "text-violet-600",
          clickable: false,
        },
        {
          key: "rating" as const,
          label: "Note moyenne",
          value: avgRating > 0 ? `${avgRating.toFixed(1)} / 5` : "\u2014",
          icon: Star,
          gradient: "from-amber-400/10 to-orange-400/10",
          iconColor: "text-amber-500",
          clickable: false,
        },
      ]
    : [
        {
          key: "today" as const,
          label: "RDV aujourd'hui",
          value: todayCount,
          icon: CalendarDays,
          gradient: "from-[#0066FF]/10 to-[#00B4D8]/10",
          iconColor: "text-[#0066FF]",
          clickable: true,
        },
        {
          key: "week" as const,
          label: "Cette semaine",
          value: weekCount,
          icon: Users,
          gradient: "from-emerald-500/10 to-teal-500/10",
          iconColor: "text-emerald-600",
          clickable: true,
        },
        {
          key: "revenue" as const,
          label: "Revenu du mois",
          value: formatPrice(monthRevenue),
          icon: DollarSign,
          gradient: "from-violet-500/10 to-purple-500/10",
          iconColor: "text-violet-600",
          clickable: false,
        },
        {
          key: "rating" as const,
          label: "Note moyenne",
          value: avgRating > 0 ? `${avgRating.toFixed(1)} / 5` : "\u2014",
          icon: Star,
          gradient: "from-amber-400/10 to-orange-400/10",
          iconColor: "text-amber-500",
          clickable: false,
        },
      ];

  const weekGrouped = useMemo(() => {
    const map = new Map<string, BookingLite[]>();
    for (const b of weekBookings) {
      if (!map.has(b.date)) map.set(b.date, []);
      map.get(b.date)!.push(b);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [weekBookings]);

  const modalTitle =
    modal === "today"
      ? isMedical
        ? "Consultations d'aujourd'hui"
        : "Rendez-vous d'aujourd'hui"
      : "Cette semaine";

  const modalBookings = modal === "today" ? todayBookings : weekBookings;
  const modalTotal = modalBookings.reduce((s, b) => s + b.totalPrice, 0);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        {stats.map((stat) => {
          const content = (
            <Card
              className={`rounded-2xl border-0 shadow-sm h-full transition-all duration-300 ${
                stat.clickable
                  ? "cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:ring-2 hover:ring-[#0066FF]/20"
                  : "card-hover"
              }`}
            >
              <CardContent className="py-5 px-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient}`}
                  >
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-bold text-[#0C1B2A] dark:text-white truncate">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      {stat.label}
                      {stat.clickable && (
                        <span className="text-[10px] text-gray-400">→</span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );

          return stat.clickable ? (
            <button
              key={stat.key}
              type="button"
              onClick={() =>
                setModal(stat.key === "today" ? "today" : "week")
              }
              className="text-left focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 rounded-2xl"
            >
              {content}
            </button>
          ) : (
            <div key={stat.key}>{content}</div>
          );
        })}
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setModal(null)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-2xl bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="font-bold text-lg text-[#0C1B2A] dark:text-white">
                    {modalTitle}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {modalBookings.length}{" "}
                    {modalBookings.length > 1 ? "rendez-vous" : "rendez-vous"}
                    {!isMedical && modalBookings.length > 0 && (
                      <> · {formatPrice(modalTotal)}</>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setModal(null)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-4">
                {modal === "today" && (
                  <TodayList bookings={todayBookings} isMedical={isMedical} />
                )}
                {modal === "week" && (
                  <WeekList grouped={weekGrouped} isMedical={isMedical} />
                )}
              </div>

              <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <Link
                  href={modal === "week" ? "/dashboard/calendar" : "/dashboard/bookings"}
                  onClick={() => setModal(null)}
                  className={`block w-full text-center py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isMedical
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25"
                      : "bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white hover:shadow-lg hover:shadow-[#0066FF]/25"
                  }`}
                >
                  {modal === "week" ? "Voir le calendrier complet" : "Voir tous les rendez-vous"}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function TodayList({
  bookings,
  isMedical,
}: {
  bookings: BookingLite[];
  isMedical: boolean;
}) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <CalendarDays className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">
          {isMedical
            ? "Aucune consultation aujourd'hui"
            : "Aucun rendez-vous aujourd'hui"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {bookings.map((b) => (
        <BookingRow key={b.id} booking={b} isMedical={isMedical} />
      ))}
    </div>
  );
}

function WeekList({
  grouped,
  isMedical,
}: {
  grouped: [string, BookingLite[]][];
  isMedical: boolean;
}) {
  if (grouped.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <CalendarDays className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">Aucun rendez-vous cette semaine</p>
      </div>
    );
  }

  const todayStr = new Date().toLocaleDateString("en-CA", {
    timeZone: "Pacific/Tahiti",
  });

  return (
    <div className="space-y-5">
      {grouped.map(([date, items]) => {
        const isToday = date === todayStr;
        const dayTotal = items.reduce((s, b) => s + b.totalPrice, 0);
        return (
          <div key={date}>
            <div className="flex items-center justify-between mb-2 sticky top-0 bg-white dark:bg-gray-900 py-1.5 z-10">
              <div className="flex items-center gap-2">
                <h4
                  className={`text-sm font-semibold ${
                    isToday
                      ? isMedical
                        ? "text-emerald-600"
                        : "text-[#0066FF]"
                      : "text-[#0C1B2A] dark:text-white"
                  }`}
                >
                  {formatLongDate(date)}
                </h4>
                {isToday && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isMedical
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-[#0066FF]/10 text-[#0066FF]"
                    }`}
                  >
                    AUJOURD&apos;HUI
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {items.length} RDV{!isMedical && ` · ${formatPrice(dayTotal)}`}
              </span>
            </div>
            <div className="space-y-2">
              {items.map((b) => (
                <BookingRow key={b.id} booking={b} isMedical={isMedical} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BookingRow({
  booking,
  isMedical,
}: {
  booking: BookingLite;
  isMedical: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/60 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      <div className="flex flex-col items-center justify-center min-w-[64px] py-1.5 px-2 rounded-lg bg-white dark:bg-gray-900 shadow-sm">
        <Clock className="h-3 w-3 text-gray-400 mb-0.5" />
        <span className="text-xs font-semibold text-[#0C1B2A] dark:text-white">
          {formatTime(booking.startTime)}
        </span>
        <span className="text-[10px] text-gray-400">
          {formatTime(booking.endTime)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <p className="text-sm font-medium text-[#0C1B2A] dark:text-white truncate">
            {booking.clientName || (isMedical ? "Patient" : "Client")}
          </p>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Briefcase className="h-3 w-3 text-gray-400 shrink-0" />
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {booking.serviceName}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        {!isMedical && (
          <span className="text-sm font-semibold text-[#0C1B2A] dark:text-white">
            {formatPrice(booking.totalPrice)}
          </span>
        )}
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
            BOOKING_STATUS_COLORS[booking.status] || ""
          }`}
        >
          {BOOKING_STATUS_LABELS[booking.status] || booking.status}
        </span>
      </div>
    </div>
  );
}
