"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { reviewSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function submitReview(data: {
  bookingId: string;
  rating: number;
  comment?: string;
}) {
  const user = await requireAuth();

  const result = reviewSchema.safeParse(data);
  if (!result.success) return { error: result.error.issues[0].message };

  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
    include: { review: true },
  });

  if (!booking) return { error: "Réservation introuvable" };
  if (booking.clientId !== user.id) return { error: "Non autorisé" };
  if (booking.status !== "COMPLETED")
    return { error: "Le rendez-vous doit être terminé" };
  if (booking.review)
    return { error: "Vous avez déjà laissé un avis" };

  // Les avis sont réservés aux commerçants Pro
  const merchant = await prisma.merchant.findUnique({
    where: { id: booking.merchantId },
    select: { plan: true },
  });
  if (merchant?.plan !== "PRO")
    return { error: "Les avis clients sont disponibles uniquement pour les commerçants Pro" };

  await prisma.review.create({
    data: {
      bookingId: data.bookingId,
      clientId: user.id,
      merchantId: booking.merchantId,
      rating: data.rating,
      comment: data.comment || null,
    },
  });

  revalidatePath(`/merchants/${booking.merchantId}`);
  revalidatePath("/dashboard/reviews");

  return { success: true };
}
