"use client";

import { useState } from "react";
import { submitReview } from "@/actions/review";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { MessageSquare, X } from "lucide-react";

interface ReviewFormProps {
  bookingId: string;
  merchantName: string;
  serviceName: string;
}

export function ReviewForm({ bookingId, merchantName, serviceName }: ReviewFormProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit() {
    if (rating === 0) {
      toast.error("Veuillez donner une note");
      return;
    }
    setSubmitting(true);
    const result = await submitReview({
      bookingId,
      rating,
      comment: comment.trim() || undefined,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      if (result.xpEarned && result.xpEarned > 0) {
        toast.success(`Merci ! +${result.xpEarned} XP gagnés`);
      } else {
        toast.success("Merci pour votre avis !");
      }
      setOpen(false);
      router.refresh();
    }
    setSubmitting(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm text-[#0066FF] font-medium hover:text-[#0052CC] transition-colors"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        Laisser un avis
      </button>
    );
  }

  return (
    <div className="mt-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 animate-fade-in-up">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-[#0C1B2A] dark:text-white">
          Votre avis pour {merchantName}
        </h4>
        <button
          onClick={() => setOpen(false)}
          className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {serviceName}
      </p>

      {/* Star rating */}
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">Note</p>
        <StarRating
          rating={rating}
          interactive
          onChange={setRating}
          size={28}
        />
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Partagez votre expérience (optionnel)..."
        className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-[#0C1B2A] dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-500 focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/10 resize-none transition-all"
        rows={3}
      />

      {/* Actions */}
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
          Envoyer
        </Button>
      </div>
    </div>
  );
}
