import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptPatientNote } from "@/lib/patient-notes-crypto";
import { exportLimiter, checkRateLimit, formatRateLimitError } from "@/lib/ratelimit";

export async function GET() {
  const session = await getSession();
  if (!session?.user || !session.user.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = session.user.id;
  const userEmail = session.user.email;

  const { success, resetIn } = await checkRateLimit(exportLimiter, `export-${userId}`);
  if (!success) {
    return NextResponse.json(
      { error: formatRateLimitError(resetIn, "exports de données") },
      { status: 429 }
    );
  }

  // Strip gift card codes from booking.notes (legacy storage of secret codes)
  const stripGiftCardCodes = (notes: string | null) =>
    notes ? notes.replace(/\[Carte cadeau:\s*[A-Z0-9-]+\]/g, "[Carte cadeau utilisée]") : notes;

  const [user, bookings, reviews, xpTransactions, giftCards, favorites, referrals, notifications, patientNotes] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      }),
      prisma.booking.findMany({
        where: { clientId: userId },
        select: {
          id: true, date: true, startTime: true, endTime: true, status: true,
          totalPrice: true, notes: true, createdAt: true,
          service: { select: { name: true } },
          merchant: { select: { businessName: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.review.findMany({
        where: { clientId: userId },
        select: { rating: true, comment: true, createdAt: true, merchant: { select: { businessName: true } } },
      }),
      prisma.xpTransaction.findMany({
        where: { userId },
        select: { amount: true, type: true, reason: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.giftCard.findMany({
        where: { senderEmail: userEmail },
        // RGPD art. 20: le code est un secret cryptographique actif, hors scope portabilité.
        // On retourne un id + métadonnées, jamais le code.
        select: { id: true, amount: true, balance: true, status: true, recipientName: true, createdAt: true },
      }),
      prisma.favorite.findMany({
        where: { userId },
        select: { merchant: { select: { businessName: true } }, createdAt: true },
      }),
      prisma.referral.findMany({
        where: { referrerId: userId },
        select: { id: true, status: true, createdAt: true },
      }),
      prisma.notification.findMany({
        where: { userId },
        select: { type: true, title: true, message: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      // RGPD: notes médicales dont l'utilisateur est le sujet (droit d'accès)
      prisma.patientNote.findMany({
        where: { clientId: userId },
        select: {
          content: true,
          createdAt: true,
          updatedAt: true,
          merchant: { select: { businessName: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const exportData = {
    exportDate: new Date().toISOString(),
    user,
    bookings: bookings.map((b) => ({
      ...b,
      notes: stripGiftCardCodes(b.notes),
      service: b.service.name,
      merchant: b.merchant.businessName,
    })),
    reviews: reviews.map((r) => ({
      ...r,
      merchant: r.merchant.businessName,
    })),
    xpTransactions,
    giftCards,
    favorites: favorites.map((f) => ({
      merchant: f.merchant.businessName,
      createdAt: f.createdAt,
    })),
    referrals,
    notifications,
    patientNotes: patientNotes.map((p) => ({
      content: decryptPatientNote(p.content),
      merchant: p.merchant.businessName,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="bookeasy-export-${userId}.json"`,
    },
  });
}
