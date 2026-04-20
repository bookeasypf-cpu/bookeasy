"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { DAYS_OF_WEEK } from "@/lib/constants";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface ScheduleSlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export default function DashboardAvailabilityPage() {
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMedical, setIsMedical] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data?.isMedical) setIsMedical(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/dashboard/availability")
      .then((r) => r.json())
      .then((data) => {
        setSchedule(data || []);
        setLoading(false);
      });
  }, []);

  function addSlot(dayOfWeek: number) {
    setSchedule([
      ...schedule,
      { dayOfWeek, startTime: "09:00", endTime: "18:00", isActive: true },
    ]);
  }

  function removeSlot(index: number) {
    setSchedule(schedule.filter((_, i) => i !== index));
  }

  function updateSlot(
    index: number,
    field: string,
    value: string | boolean
  ) {
    const updated = [...schedule];
    updated[index] = { ...updated[index], [field]: value };
    setSchedule(updated);
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/dashboard/availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schedule }),
    });
    if (res.ok) toast.success("Horaires enregistrés !");
    else toast.error("Erreur");
    setSaving(false);
  }

  // Colors
  const btnGradient = isMedical
    ? "bg-gradient-to-r from-emerald-500 to-teal-500"
    : "bg-gradient-to-r from-[#0066FF] to-[#00B4D8]";
  const btnShadow = isMedical
    ? "hover:shadow-emerald-500/25"
    : "hover:shadow-[#0066FF]/25";
  const addColor = isMedical
    ? "text-emerald-600 hover:text-emerald-700"
    : "text-[#0066FF] hover:text-[#00B4D8]";
  const checkboxColor = isMedical
    ? "text-emerald-500 focus:ring-emerald-500/20 accent-emerald-500"
    : "text-[#0066FF] focus:ring-[#0066FF]/20 accent-[#0066FF]";
  const focusRing = isMedical
    ? "focus:ring-emerald-500/20 focus:border-emerald-500"
    : "focus:ring-[#0066FF]/20 focus:border-[#0066FF]";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="page-transition">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0C1B2A] dark:text-white animate-fade-in-up">Horaires</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-xl ${btnGradient} text-white hover:shadow-lg ${btnShadow} transition-all duration-300 disabled:opacity-50`}
        >
          {saving ? "..." : "Enregistrer"}
        </button>
      </div>

      <div className="space-y-4 stagger-children">
        {[1, 2, 3, 4, 5, 6, 0].map((day) => {
          const daySlots = schedule
            .map((s, i) => ({ ...s, originalIndex: i }))
            .filter((s) => s.dayOfWeek === day);
          return (
            <Card key={day} className="rounded-2xl border-0 shadow-sm card-hover">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-[#0C1B2A] dark:text-white">
                    {DAYS_OF_WEEK[day]}
                  </h3>
                  <button
                    onClick={() => addSlot(day)}
                    className={`flex items-center gap-1 text-sm ${addColor} font-medium transition-colors`}
                  >
                    <Plus className="h-4 w-4" /> Ajouter
                  </button>
                </div>
                {daySlots.length > 0 ? (
                  <div className="space-y-2">
                    {daySlots.map((slot) => (
                      <div
                        key={slot.originalIndex}
                        className="flex items-center gap-3"
                      >
                        <input
                          type="checkbox"
                          checked={slot.isActive}
                          onChange={(e) =>
                            updateSlot(
                              slot.originalIndex,
                              "isActive",
                              e.target.checked
                            )
                          }
                          className={`rounded border-gray-300 ${checkboxColor}`}
                        />
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) =>
                            updateSlot(
                              slot.originalIndex,
                              "startTime",
                              e.target.value
                            )
                          }
                          className={`rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white px-2 py-1 text-sm focus:ring-2 ${focusRing} transition-colors`}
                        />
                        <span className="text-gray-400">—</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) =>
                            updateSlot(
                              slot.originalIndex,
                              "endTime",
                              e.target.value
                            )
                          }
                          className={`rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white px-2 py-1 text-sm focus:ring-2 ${focusRing} transition-colors`}
                        />
                        <button
                          onClick={() => removeSlot(slot.originalIndex)}
                          className="text-gray-400 hover:text-[#FF6B6B] transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    {isMedical ? "Pas de consultations" : "Fermé"}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
