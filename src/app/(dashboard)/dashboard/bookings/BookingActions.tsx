"use client";

import { useState, useEffect } from "react";
import {
  cancelBooking,
  confirmBooking,
  completeBooking,
} from "@/actions/booking";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function BookingActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) {
  const [loading, setLoading] = useState(false);
  const [isMedical, setIsMedical] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/dashboard/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data?.isMedical) setIsMedical(true);
      })
      .catch(() => {});
  }, []);

  async function handleAction(action: "confirm" | "cancel" | "complete") {
    setLoading(true);
    let result;
    if (action === "confirm") result = await confirmBooking(bookingId);
    else if (action === "complete") result = await completeBooking(bookingId);
    else result = await cancelBooking(bookingId);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        action === "confirm"
          ? "Confirmé"
          : action === "complete"
            ? "Terminé"
            : "Annulé"
      );
      router.refresh();
    }
    setLoading(false);
  }

  const confirmBg = isMedical
    ? "bg-emerald-500 hover:bg-emerald-600 hover:shadow-emerald-500/25"
    : "bg-[#0066FF] hover:bg-[#0055DD] hover:shadow-[#0066FF]/25";

  return (
    <div className="flex gap-2">
      {status === "PENDING" && (
        <>
          <button
            onClick={() => handleAction("confirm")}
            disabled={loading}
            className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg ${confirmBg} text-white shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50`}
          >
            Confirmer
          </button>
          <button
            onClick={() => handleAction("cancel")}
            disabled={loading}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-[#FF6B6B] text-white hover:bg-[#FF5252] shadow-sm hover:shadow-md hover:shadow-[#FF6B6B]/25 transition-all duration-200 disabled:opacity-50"
          >
            Refuser
          </button>
        </>
      )}
      {status === "CONFIRMED" && (
        <>
          <button
            onClick={() => handleAction("complete")}
            disabled={loading}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm hover:shadow-md hover:shadow-emerald-500/25 transition-all duration-200 disabled:opacity-50"
          >
            Terminé
          </button>
          <button
            onClick={() => handleAction("cancel")}
            disabled={loading}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-[#FF6B6B] text-white hover:bg-[#FF5252] shadow-sm hover:shadow-md hover:shadow-[#FF6B6B]/25 transition-all duration-200 disabled:opacity-50"
          >
            Annuler
          </button>
        </>
      )}
    </div>
  );
}
