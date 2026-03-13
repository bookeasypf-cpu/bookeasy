"use client";

import { useState } from "react";
import {
  cancelBooking,
  confirmBooking,
  completeBooking,
} from "@/actions/booking";
import { Button } from "@/components/ui/Button";
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
  const router = useRouter();

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

  return (
    <div className="flex gap-2">
      {status === "PENDING" && (
        <>
          <button
            onClick={() => handleAction("confirm")}
            disabled={loading}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-[#0066FF] text-white hover:bg-[#0055DD] shadow-sm hover:shadow-md hover:shadow-[#0066FF]/25 transition-all duration-200 disabled:opacity-50"
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
