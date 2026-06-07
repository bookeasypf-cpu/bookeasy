"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { CalendarDays, Lock, LockOpen } from "lucide-react";
import toast from "react-hot-toast";
import { useMerchantProfile } from "@/components/providers/MerchantProfileProvider";

interface HolidayItem {
  date: string;
  name: string;
  isPfSpecific: boolean;
  blocked: boolean;
}

function formatHolidayDate(iso: string): string {
  // iso = "YYYY-MM-DD" → on construit en UTC pour ne pas shifter d'un jour
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function HolidaysSection() {
  const { isMedical } = useMerchantProfile();
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  const accent = isMedical ? "text-emerald-600" : "text-[#0066FF]";
  const accentBg = isMedical ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-[#0066FF]/10";

  const fetchHolidays = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/availability/holidays");
      const data = await res.json();
      if (Array.isArray(data.holidays)) {
        setHolidays(data.holidays);
      }
    } catch {
      // silencieux — la section est non bloquante
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  async function toggle(h: HolidayItem) {
    const next = new Set(toggling);
    next.add(h.date);
    setToggling(next);

    const action = h.blocked ? "unblock" : "block";
    // Optimistic update — on inverse le statut tout de suite.
    setHolidays((prev) =>
      prev.map((x) => (x.date === h.date ? { ...x, blocked: !x.blocked } : x))
    );

    try {
      const res = await fetch("/api/dashboard/availability/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: h.date, name: h.name, action }),
      });
      if (!res.ok) {
        // Rollback en cas d'erreur serveur.
        setHolidays((prev) =>
          prev.map((x) => (x.date === h.date ? { ...x, blocked: h.blocked } : x))
        );
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Erreur lors de la mise à jour");
      } else {
        toast.success(action === "block" ? "Jour fermé" : "Jour rouvert");
      }
    } catch {
      setHolidays((prev) =>
        prev.map((x) => (x.date === h.date ? { ...x, blocked: h.blocked } : x))
      );
      toast.error("Erreur réseau");
    } finally {
      const after = new Set(toggling);
      after.delete(h.date);
      setToggling(after);
    }
  }

  if (loading) {
    return (
      <Card className="rounded-2xl border-0 shadow-sm mt-6">
        <CardContent className="py-8 flex justify-center">
          <Spinner className="h-6 w-6" />
        </CardContent>
      </Card>
    );
  }

  if (holidays.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-2xl border-0 shadow-sm mt-6">
      <CardContent className="py-5 px-5">
        <div className="flex items-center gap-2 mb-4">
          <div className={`p-2 rounded-lg ${accentBg}`}>
            <CalendarDays className={`h-4 w-4 ${accent}`} />
          </div>
          <div>
            <h2 className="font-semibold text-[#0C1B2A] dark:text-white">
              Jours fériés en Polynésie française
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Fermez en un clic les dates où vous ne travaillez pas. Vos clients ne pourront pas réserver ces jours-là.
            </p>
          </div>
        </div>

        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {holidays.map((h) => {
            const isToggling = toggling.has(h.date);
            return (
              <li
                key={h.date}
                className="flex items-center gap-3 py-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-[#0C1B2A] dark:text-white capitalize">
                      {formatHolidayDate(h.date)}
                    </span>
                    {h.isPfSpecific && (
                      <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400">
                        Spécifique PF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {h.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(h)}
                  disabled={isToggling}
                  className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                    h.blocked
                      ? "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/25"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                  aria-label={h.blocked ? `Rouvrir le ${h.name}` : `Fermer le ${h.name}`}
                >
                  {h.blocked ? (
                    <>
                      <Lock className="h-3 w-3" />
                      Fermé
                    </>
                  ) : (
                    <>
                      <LockOpen className="h-3 w-3" />
                      Ouvert
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
