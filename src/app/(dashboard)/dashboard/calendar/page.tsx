"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Clock, User, Phone, Stethoscope, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { formatTime, cn } from "@/lib/utils";
import Link from "next/link";
import toast from "react-hot-toast";

// ── Types ──────────────────────────────────────────────

interface CalendarBooking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  clientName: string;
  clientPhone: string;
  serviceName: string;
}

// ── Helpers ────────────────────────────────────────────

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const MONTHS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function toMonthParam(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function statusLabel(status: string): { text: string; color: string } {
  switch (status) {
    case "CONFIRMED":
      return { text: "Confirmé", color: "bg-green-100 text-green-700" };
    case "PENDING":
      return { text: "En attente", color: "bg-amber-100 text-amber-700" };
    case "COMPLETED":
      return { text: "Terminé", color: "bg-gray-100 text-gray-600" };
    case "NO_SHOW":
      return { text: "Absent", color: "bg-red-100 text-red-700" };
    default:
      return { text: status, color: "bg-gray-100 text-gray-600" };
  }
}

// ── Component ──────────────────────────────────────────

export default function DashboardCalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMedical, setIsMedical] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  // ── Theme colors ─────────────────────────────────────
  const accent = isMedical ? "emerald" : "blue";
  const accentMap = useMemo(() => {
    if (isMedical) {
      return {
        ring: "ring-emerald-500",
        bgLight: "bg-emerald-50",
        bgPill: "bg-emerald-100",
        textPill: "text-emerald-700",
        textAccent: "text-emerald-600",
        bgAccent: "bg-emerald-500",
        hoverBg: "hover:bg-emerald-50",
        borderAccent: "border-emerald-200",
        spinnerBorder: "border-emerald-100",
        spinnerTop: "border-t-emerald-500",
      };
    }
    return {
      ring: "ring-[#0066FF]",
      bgLight: "bg-[#0066FF]/10",
      bgPill: "bg-[#0066FF]/10",
      textPill: "text-[#0066FF]",
      textAccent: "text-[#0066FF]",
      bgAccent: "bg-[#0066FF]",
      hoverBg: "hover:bg-blue-50",
      borderAccent: "border-blue-200",
      spinnerBorder: "border-blue-100",
      spinnerTop: "border-t-[#0066FF]",
    };
  }, [isMedical]);

  // ── Fetch profile (isMedical) ────────────────────────
  useEffect(() => {
    fetch("/api/dashboard/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.isMedical) setIsMedical(true);
      })
      .catch(() => {});
  }, []);

  // ── Fetch bookings ──────────────────────────────────
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/dashboard/calendar?month=${toMonthParam(currentYear, currentMonth)}`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch {
      toast.error("Impossible de charger le calendrier");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [currentYear, currentMonth]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // ── Calendar grid computation ────────────────────────
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = (() => {
    const d = new Date(currentYear, currentMonth, 1).getDay();
    return (d + 6) % 7; // Monday = 0
  })();

  const bookingsByDate = useMemo(() => {
    const map: Record<string, CalendarBooking[]> = {};
    bookings.forEach((b) => {
      if (!map[b.date]) map[b.date] = [];
      map[b.date].push(b);
    });
    return map;
  }, [bookings]);

  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Pacific/Tahiti' });
  }, []);

  // ── Navigation ───────────────────────────────────────
  function goToPrevMonth() {
    setPanelOpen(false);
    setSelectedDate(null);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    setPanelOpen(false);
    setSelectedDate(null);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  // ── Day click ────────────────────────────────────────
  function handleDayClick(dateStr: string) {
    if (selectedDate === dateStr && panelOpen) {
      setPanelOpen(false);
      setSelectedDate(null);
    } else {
      setSelectedDate(dateStr);
      setPanelOpen(true);
    }
  }

  // ── Selected day bookings ───────────────────────────
  const selectedBookings = selectedDate ? bookingsByDate[selectedDate] || [] : [];

  const selectedDateFormatted = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const monthLabel = `${capitalize(MONTHS_FR[currentMonth])} ${currentYear}`;

  // ── Render ───────────────────────────────────────────
  return (
    <div className="page-transition">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-6 animate-fade-in-up">
        <button
          onClick={goToPrevMonth}
          className={cn(
            "p-3 rounded-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-sm",
            accentMap.hoverBg
          )}
          aria-label="Mois précédent"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-2xl font-bold text-[#0C1B2A] dark:text-white">{monthLabel}</h1>
        <button
          onClick={goToNextMonth}
          className={cn(
            "p-3 rounded-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-sm",
            accentMap.hoverBg
          )}
          aria-label="Mois suivant"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Calendar grid */}
        <Card className="flex-1 rounded-2xl border-0 shadow-sm">
          <CardContent className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner
                  className={cn(accentMap.spinnerBorder, accentMap.spinnerTop)}
                />
              </div>
            ) : (
              <>
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DAYS_FR.map((d) => (
                    <div
                      key={d}
                      className="text-center text-xs font-semibold text-gray-500 py-2"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells before first day */}
                  {Array.from({ length: firstDayOfWeek }, (_, i) => (
                    <div key={`empty-${i}`} className="min-h-[80px]" />
                  ))}

                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const dayBookings = bookingsByDate[dateStr] || [];
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selectedDate;
                    const bookingCount = dayBookings.length;
                    const maxVisible = 2;

                    return (
                      <motion.div
                        key={day}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDayClick(dateStr)}
                        className={cn(
                          "min-h-[80px] p-1.5 rounded-xl border text-xs transition-all cursor-pointer select-none",
                          isToday && !isSelected &&
                            `${accentMap.bgLight} ring-2 ${accentMap.ring} border-transparent`,
                          isSelected &&
                            `${accentMap.bgLight} ring-2 ${accentMap.ring} border-transparent shadow-md`,
                          !isToday && !isSelected &&
                            "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={cn(
                              "font-semibold",
                              isToday || isSelected
                                ? accentMap.textAccent
                                : "text-gray-700 dark:text-gray-300"
                            )}
                          >
                            {day}
                          </span>
                          {bookingCount > 0 && (
                            <span
                              className={cn(
                                "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white",
                                accentMap.bgAccent
                              )}
                            >
                              {bookingCount}
                            </span>
                          )}
                        </div>

                        {/* Booking pills */}
                        {dayBookings.slice(0, maxVisible).map((b) => (
                          <div
                            key={b.id}
                            className={cn(
                              "rounded-md px-1 py-0.5 mb-0.5 truncate font-medium",
                              accentMap.bgPill,
                              accentMap.textPill
                            )}
                          >
                            {formatTime(b.startTime)}{" "}
                            {b.clientName.split(" ")[0]}
                          </div>
                        ))}

                        {bookingCount > maxVisible && (
                          <div className="text-gray-400 font-medium">
                            +{bookingCount - maxVisible}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Detail panel — desktop: right side, mobile: bottom sheet */}
        <AnimatePresence>
          {panelOpen && selectedDate && (
            <>
              {/* Mobile overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                onClick={() => {
                  setPanelOpen(false);
                  setSelectedDate(null);
                }}
              />

              {/* Panel */}
              <motion.div
                initial={{ opacity: 0, x: 40, y: 0 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={cn(
                  // Mobile: bottom sheet
                  "fixed bottom-0 left-0 right-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-2xl shadow-2xl",
                  // Desktop: side panel
                  "lg:static lg:w-96 lg:max-h-none lg:rounded-2xl lg:z-auto",
                  "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
                )}
              >
                {/* Panel header */}
                <div
                  className={cn(
                    "sticky top-0 bg-white dark:bg-gray-900 z-10 px-5 py-4 border-b border-gray-100 dark:border-gray-800 rounded-t-2xl flex items-center justify-between"
                  )}
                >
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {selectedDateFormatted}
                    </p>
                    <p className={cn("text-lg font-bold", accentMap.textAccent)}>
                      {selectedBookings.length}{" "}
                      {isMedical
                        ? selectedBookings.length > 1
                          ? "rendez-vous"
                          : "rendez-vous"
                        : selectedBookings.length > 1
                          ? "réservations"
                          : "réservation"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setPanelOpen(false);
                      setSelectedDate(null);
                    }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Fermer"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Drag handle for mobile */}
                <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mt-2 lg:hidden" />

                {/* Bookings list */}
                <div className="p-4 space-y-3">
                  {selectedBookings.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-sm">Aucun rendez-vous ce jour</p>
                    </div>
                  ) : (
                    selectedBookings.map((b, idx) => {
                      const st = statusLabel(b.status);
                      return (
                        <motion.div
                          key={b.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Link href="/dashboard/bookings">
                            <div
                              className={cn(
                                "rounded-xl border p-4 transition-all hover:shadow-md cursor-pointer",
                                accentMap.hoverBg,
                                "border-gray-100 dark:border-gray-800"
                              )}
                            >
                              {/* Time + Status */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Clock className={cn("w-4 h-4", accentMap.textAccent)} />
                                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                                    {formatTime(b.startTime)} - {formatTime(b.endTime)}
                                  </span>
                                </div>
                                <span
                                  className={cn(
                                    "text-xs font-medium px-2 py-0.5 rounded-full",
                                    st.color
                                  )}
                                >
                                  {st.text}
                                </span>
                              </div>

                              {/* Client */}
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-1">
                                <User className="w-3.5 h-3.5" />
                                <span>{b.clientName}</span>
                              </div>

                              {/* Service */}
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-1">
                                {isMedical ? (
                                  <Stethoscope className="w-3.5 h-3.5" />
                                ) : (
                                  <Briefcase className="w-3.5 h-3.5" />
                                )}
                                <span>{b.serviceName}</span>
                              </div>

                              {/* Phone */}
                              {b.clientPhone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>{b.clientPhone}</span>
                                </div>
                              )}
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
