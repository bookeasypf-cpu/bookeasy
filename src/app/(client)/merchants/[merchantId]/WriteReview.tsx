"use client";

import { useState, useEffect } from "react";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/Button";
import { submitReview } from "@/actions/review";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Pencil } from "lucide-react";

interface EligibleBooking {
  id: string;
  serviceName: string;
  date: string;
}

export function WriteReview({ merchantId }: { merchantId: string }) {
  const [eligible, setEligible] = useState<EligibleBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<string>("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/merchants/${merchantId}/reviews/eligible`)
      .then((r) => r.json())
      .then((data) => {
        if (data.bookings?.length > 0) {
          setEligible(data.bookings);
          setSelectedBooking(data.bookings[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [merchantId]);

  if (loading || eligible.length === 0) return null;

  async function handleSubmit() {
    if (rating === 0) {
      toast.error("Veuillez donner une note");
      return;
    }
    if (!selectedBooking) return;

    setSubmitting(true);
    const result = await submitReview({
      bookingId: selectedBooking,
      rating,
      comment: comment.trim() || undefined,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Merci pour votre avis !");
      setOpen(false);
      setRating(0);
      setComment("");
      setEligible((prev) => prev.filter((b) => b.id !== selectedBooking));
      router.refresh();
    }
    setSubmitting(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#0066FF] to-[#00B4D8] rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
      >
        <Pencil className="h-4 w-4" />
        Laisser un avis
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-[#0066FF]/20 shadow-sm p-5 animate-fade-in-up">
      <h4 className="text-sm font-semibold text-[#0C1B2A] dark:text-white mb-4">
        Donnez votre avis
      </h4>

      {eligible.length > 1 && (
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
            Pour quel rendez-vous ?
          </label>
          <select
            value={selectedBooking}
            onChange={(e) => setSelectedBooking(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-[#0C1B2A] dark:text-white focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/10"
          >
            {eligible.map((b) => (
              <option key={b.id} value={b.id}>
                {b.serviceName} — {b.date}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-4">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
          Votre note
        </p>
        <StarRating rating={rating} interactive onChange={setRating} size={32} />
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Partagez votre expérience (optionnel)..."
        className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-[#0C1B2A] dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-500 focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/10 resize-none transition-all"
        rows={3}
      />

      <div className="flex justify-end gap-2 mt-3">
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Annuler
        </Button>
        <Button
          variant="gradient"
          size="sm"
          onClick={handleSubmit}
          loading={submitting}
          disabled={rating === 0}
        >
          Publier
        </Button>
      </div>
    </div>
  );
}
