"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { bookingSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function createBooking(data: {
  merchantId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}) {
  const user = await requireAuth();

  const result = bookingSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const service = await prisma.service.findUnique({
    where: { id: data.serviceId },
  });

  if (!service) {
    return { error: "Service introuvable" };
  }

  // Atomic booking creation with conflict check
  try {
    const booking = await prisma.$transaction(async (tx) => {
      // Check for conflicts
      const conflicting = await tx.booking.findFirst({
        where: {
          merchantId: data.merchantId,
          date: data.date,
          status: {
            notIn: ["CANCELLED_BY_CLIENT", "CANCELLED_BY_MERCHANT"],
          },
          AND: [
            { startTime: { lt: data.endTime } },
            { endTime: { gt: data.startTime } },
          ],
        },
      });

      if (conflicting) {
        throw new Error("TIME_SLOT_UNAVAILABLE");
      }

      return tx.booking.create({
        data: {
          clientId: user.id,
          merchantId: data.merchantId,
          serviceId: data.serviceId,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          totalPrice: service.price,
          notes: data.notes || null,
          status: "CONFIRMED",
        },
      });
    });

    // Create notification for merchant
    const merchant = await prisma.merchant.findUnique({
      where: { id: data.merchantId },
      select: { userId: true },
    });

    if (merchant) {
      await prisma.notification.create({
        data: {
          userId: merchant.userId,
          type: "NEW_BOOKING",
          title: "Nouveau rendez-vous",
          message: `${user.name || "Un client"} a réservé ${service.name} le ${data.date} à ${data.startTime}`,
          metadata: JSON.stringify({ bookingId: booking.id }),
        },
      });
    }

    revalidatePath("/my-bookings");
    revalidatePath("/dashboard/bookings");

    return { success: true, bookingId: booking.id };
  } catch (e) {
    if (e instanceof Error && e.message === "TIME_SLOT_UNAVAILABLE") {
      return { error: "Ce créneau n'est plus disponible. Veuillez en choisir un autre." };
    }
    return { error: "Erreur lors de la réservation. Veuillez réessayer." };
  }
}

export async function cancelBooking(bookingId: string, reason?: string) {
  const user = await requireAuth();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { merchant: { select: { userId: true } }, service: true },
  });

  if (!booking) {
    return { error: "Réservation introuvable" };
  }

  const isMerchant = booking.merchant.userId === user.id;
  const isClient = booking.clientId === user.id;

  if (!isMerchant && !isClient) {
    return { error: "Non autorisé" };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: isMerchant ? "CANCELLED_BY_MERCHANT" : "CANCELLED_BY_CLIENT",
      cancelledAt: new Date(),
      cancelReason: reason || null,
    },
  });

  // Notify the other party
  const notifyUserId = isMerchant ? booking.clientId : booking.merchant.userId;
  await prisma.notification.create({
    data: {
      userId: notifyUserId,
      type: "BOOKING_CANCELLED",
      title: "Rendez-vous annulé",
      message: `Le rendez-vous pour ${booking.service.name} le ${booking.date} à ${booking.startTime} a été annulé`,
      metadata: JSON.stringify({ bookingId }),
    },
  });

  revalidatePath("/my-bookings");
  revalidatePath("/dashboard/bookings");

  return { success: true };
}

export async function confirmBooking(bookingId: string) {
  const user = await requireAuth();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { merchant: { select: { userId: true } }, service: true },
  });

  if (!booking || booking.merchant.userId !== user.id) {
    return { error: "Non autorisé" };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CONFIRMED" },
  });

  await prisma.notification.create({
    data: {
      userId: booking.clientId,
      type: "BOOKING_CONFIRMED",
      title: "Rendez-vous confirmé",
      message: `Votre rendez-vous pour ${booking.service.name} le ${booking.date} à ${booking.startTime} est confirmé`,
      metadata: JSON.stringify({ bookingId }),
    },
  });

  revalidatePath("/dashboard/bookings");

  return { success: true };
}

export async function completeBooking(bookingId: string) {
  const user = await requireAuth();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { merchant: { select: { userId: true } } },
  });

  if (!booking || booking.merchant.userId !== user.id) {
    return { error: "Non autorisé" };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "COMPLETED" },
  });

  revalidatePath("/dashboard/bookings");

  return { success: true };
}
