"use client";

import { useState } from "react";
import { cancelBooking } from "@/actions/booking";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCancel() {
    if (!confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) return;
    setLoading(true);
    const result = await cancelBooking(bookingId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Rendez-vous annulé");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <Button
      variant="danger"
      size="sm"
      onClick={handleCancel}
      loading={loading}
    >
      Annuler
    </Button>
  );
}
