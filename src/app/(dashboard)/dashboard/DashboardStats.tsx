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
  TrendingUp,
  TrendingDown,
  Minus,
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

export interface RevenueDetails {
  monthLabel: string;
  total: number;
  pendingRevenue: number;
  prevTotal: number;
  bookingCount: number;
  avgTicket: number;
  byService: { name: string; count: number; revenue: number }[];
  byStatus: { status: string; count: number; revenue: number }[];
  daily: { date: string; revenue: number }[];
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
  revenueDetails: RevenueDetails;
}

type ModalKind = "today" | "week" | "revenue" | null;

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
  revenueDetails,
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
          clickable: true,
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
      : modal === "week"
        ? "Cette semaine"
        : `Revenu · ${revenueDetails.monthLabel}`;

  const modalBookings =
    modal === "today" ? todayBookings : modal === "week" ? weekBookings : [];
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
            <div
              key={stat.key}
              role="button"
              tabIndex={0}
              onClick={() => setModal(stat.key as ModalKind)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setModal(stat.key as ModalKind);
              }}
              className="focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 rounded-2xl"
            >
              {content}
            </div>
          ) : (
            <div key={stat.key}>{content}</div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {modal && (
          <motion.div
            key={`backdrop-${modal}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setModal(null)}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              key={`modal-${modal}`}
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
                  {modal !== "revenue" && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {modalBookings.length} rendez-vous
                      {!isMedical && modalBookings.length > 0 && (
                        <> · {formatPrice(modalTotal)}</>
                      )}
                    </p>
                  )}
                  {modal === "revenue" && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {revenueDetails.bookingCount} réservations ·{" "}
                      {formatPrice(revenueDetails.avgTicket)} / RDV
                    </p>
                  )}
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
                {modal === "revenue" && (
                  <RevenueBreakdown details={revenueDetails} />
                )}
              </div>

              {modal !== "revenue" && (
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
              )}
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

function RevenueBreakdown({ details }: { details: RevenueDetails }) {
  const { total, pendingRevenue, prevTotal, bookingCount, byService, byStatus, daily } = details;

  const deltaPct =
    prevTotal > 0
      ? ((total - prevTotal) / prevTotal) * 100
      : total > 0
        ? 100
        : 0;
  const deltaIsZero = prevTotal === 0 && total === 0;
  const deltaUp = deltaPct > 0;

  const maxService = Math.max(1, ...byService.map((s) => s.revenue));
  const maxDaily = Math.max(1, ...daily.map((d) => d.revenue));

  const statusColorMap: Record<string, string> = {
    CONFIRMED: "bg-green-500",
    PENDING: "bg-yellow-500",
    COMPLETED: "bg-blue-500",
    NO_SHOW: "bg-gray-400",
    CANCELLED_BY_CLIENT: "bg-red-400",
    CANCELLED_BY_MERCHANT: "bg-red-400",
  };

  if (bookingCount === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <DollarSign className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">Aucun revenu ce mois-ci</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-5 bg-gradient-to-br from-violet-500 to-purple-600 text-white">
        <p className="text-xs uppercase tracking-wider text-white/70 font-medium">
          Total du mois
        </p>
        <p className="text-3xl font-bold mt-1">{formatPrice(total)}</p>
        {pendingRevenue > 0 && (
          <p className="text-sm text-white/80 mt-1">
            + {formatPrice(pendingRevenue)} en attente de paiement
          </p>
        )}
        <div className="flex items-center gap-2 mt-3 text-xs">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-medium ${
              deltaIsZero
                ? "bg-white/20 text-white/80"
                : deltaUp
                  ? "bg-emerald-400/25 text-emerald-50"
                  : "bg-red-400/25 text-red-50"
            }`}
          >
            {deltaIsZero ? (
              <Minus className="h-3 w-3" />
            ) : deltaUp ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {deltaIsZero
              ? "—"
              : `${deltaUp ? "+" : ""}${deltaPct.toFixed(1)}%`}
          </span>
          <span className="text-white/70">
            vs mois dernier ({formatPrice(prevTotal)})
          </span>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-[#0C1B2A] dark:text-white mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-violet-600" />
          Évolution quotidienne
        </h4>
        <div className="flex items-end gap-1 h-24 px-1 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3">
          {daily.map((d) => {
            const h = d.revenue > 0 ? (d.revenue / maxDaily) * 100 : 0;
            const day = new Date(`${d.date}T00:00:00`).getDate();
            return (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center gap-1 group relative"
                title={`${day} · ${formatPrice(d.revenue)}`}
              >
                <div className="w-full flex items-end justify-center h-full">
                  <div
                    className={`w-full rounded-t-sm transition-all ${
                      d.revenue > 0
                        ? "bg-gradient-to-t from-violet-500 to-purple-400 group-hover:from-violet-600 group-hover:to-purple-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                    style={{ height: `${Math.max(h, d.revenue > 0 ? 4 : 2)}%` }}
                  />
                </div>
                {d.revenue > 0 && (
                  <span className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold bg-[#0C1B2A] text-white px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                    {formatPrice(d.revenue)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
          <span>1</span>
          <span>{daily.length}</span>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-[#0C1B2A] dark:text-white mb-3 flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-violet-600" />
          Top prestations
        </h4>
        <div className="space-y-2">
          {byService.slice(0, 5).map((s, idx) => {
            const pct = (s.revenue / maxService) * 100;
            return (
              <div key={s.name} className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-medium text-[#0C1B2A] dark:text-white truncate">
                      {s.name}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[#0C1B2A] dark:text-white ml-2 shrink-0">
                    {formatPrice(s.revenue)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 shrink-0">
                    {s.count} RDV
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-[#0C1B2A] dark:text-white mb-3 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-violet-600" />
          Répartition par statut
        </h4>
        <div className="space-y-2">
          {byStatus.map((s) => {
            const totalBookings = byStatus.reduce((sum, st) => sum + st.count, 0);
            const pct = totalBookings > 0 ? (s.count / totalBookings) * 100 : 0;
            const isRevenue = s.status === "COMPLETED";
            return (
              <div
                key={s.status}
                className="flex items-center gap-3 rounded-lg p-2.5 bg-gray-50 dark:bg-gray-800/50"
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    statusColorMap[s.status] || "bg-gray-400"
                  }`}
                />
                <span className="text-sm text-[#0C1B2A] dark:text-white flex-1">
                  {BOOKING_STATUS_LABELS[s.status] || s.status}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {s.count} · {pct.toFixed(0)}%
                </span>
                {isRevenue ? (
                  <span className="text-sm font-medium text-[#0C1B2A] dark:text-white min-w-[80px] text-right">
                    {formatPrice(s.revenue)}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 min-w-[80px] text-right italic">
                    non encaissé
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
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
