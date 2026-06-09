"use server";

import { waitUntil } from "@vercel/functions";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { reviewSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { sendPushNotification } from "@/lib/push";

const XP_FOR_REVIEW = 2;

export async function submitReview(data: {
  bookingId: string;
  rating: number;
  comment?: string;
}) {
  const user = await requireAuth();

  const result = reviewSchema.safeParse(data);
  if (!result.success) return { error: result.error.issues[0].message };

  // Une seule query DB pour la garde — récupère le booking, sa review
  // existante (anti-double), et les infos merchant (plan + userId pour
  // la notif). Avant: 2 queries séquentielles.
  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
    include: {
      review: { select: { id: true } },
      merchant: { select: { plan: true, userId: true } },
    },
  });

  if (!booking) return { error: "Réservation introuvable" };
  if (booking.clientId !== user.id) return { error: "Non autorisé" };
  if (booking.status !== "COMPLETED")
    return { error: "Le rendez-vous doit être terminé" };
  if (booking.review)
    return { error: "Vous avez déjà laissé un avis" };
  if (booking.merchant.plan !== "PRO")
    return { error: "Les avis clients sont disponibles uniquement pour les commerçants Pro" };

  // Création de la review = SEUL appel bloquant sur le chemin critique.
  // Le client attend la confirmation que sa review est bien enregistrée
  // (sinon double-submit possible), mais rien de plus.
  await prisma.review.create({
    data: {
      bookingId: data.bookingId,
      clientId: user.id,
      merchantId: booking.merchantId,
      rating: data.rating,
      comment: data.comment || null,
    },
  });

  const xpEarned = data.rating >= 3 ? XP_FOR_REVIEW : 0;
  const merchantUserId = booking.merchant.userId;
  const merchantId = booking.merchantId;
  const clientName = user.name || "Un client";
  const stars = "★".repeat(data.rating) + "☆".repeat(5 - data.rating);
  const comment = data.comment;
  const rating = data.rating;

  // Tous les side-effects partent en background — la réponse retourne
  // immédiatement au client. Si Vercel kill le worker avant la fin,
  // waitUntil garantit la complétion. Gain perçu : 200-500 ms.
  waitUntil(
    Promise.all([
      // XP transaction (uniquement si note positive)
      xpEarned > 0
        ? prisma.xpTransaction.create({
            data: {
              userId: user.id,
              merchantId,
              bookingId: data.bookingId,
              amount: XP_FOR_REVIEW,
              type: "EARNED",
              reason: `Avis laissé (${rating} étoiles)`,
            },
          })
        : Promise.resolve(),
      // Notification in-app pour le marchand
      prisma.notification.create({
        data: {
          userId: merchantUserId,
          type: "NEW_REVIEW",
          title: `Nouvel avis ${stars}`,
          message: `${clientName} a laissé un avis ${rating}/5${comment ? ` : "${comment.substring(0, 80)}${comment.length > 80 ? "..." : ""}"` : ""}`,
          metadata: JSON.stringify({ bookingId: data.bookingId, rating }),
        },
      }),
      // Push notification au marchand (silencieuse si échoue)
      sendPushNotification(merchantUserId, {
        title: `Nouvel avis ${stars}`,
        body: `${clientName} vous a donné ${rating}/5`,
        url: "/dashboard/reviews",
      }).catch(() => {}),
    ]).catch((err) => {
      console.error("[REVIEW] background side-effect failed:", err instanceof Error ? err.message : err);
    })
  );

  // Revalidate les pages affectées — léger, n'attend pas le re-fetch.
  revalidatePath(`/merchants/${merchantId}`);
  revalidatePath("/dashboard/reviews");

  return { success: true, xpEarned };
}
