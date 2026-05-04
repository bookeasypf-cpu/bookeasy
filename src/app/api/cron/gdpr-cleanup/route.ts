import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * RGPD cleanup cron — enforces the data retention durations declared
 * in legal/confidentialité (section 7).
 *
 * Schedule: daily (Vercel cron). Idempotent — safe to retry.
 *
 * Rules applied:
 *   1. Delete bookings older than 3 years (RGPD retention)
 *   2. Delete sessions expired
 *   3. Delete VerificationToken expired (password reset tokens)
 *   4. Delete WebhookEvent older than 90 days (operational logs)
 *   5. Delete Notifications older than 1 year
 *   6. Delete PatientNote older than 10 years (medical record obligation)
 *
 * Note: comptes inactifs (>3 ans) are NOT auto-deleted — that requires
 * a courtesy email warning first (best practice CNIL). Implement that
 * flow separately when production traffic justifies it.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const threeYearsAgo = new Date(now);
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const tenYearsAgo = new Date(now);
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

  try {
    const dateFloor3y = threeYearsAgo.toISOString().slice(0, 10);

    const [bookings, sessions, tokens, webhookEvents, notifications, patientNotes] =
      await Promise.all([
        prisma.booking.deleteMany({
          where: {
            date: { lt: dateFloor3y },
            // Keep cancelled/failed bookings short-term too
            status: { in: ["COMPLETED", "CANCELLED_BY_CLIENT", "CANCELLED_BY_MERCHANT"] },
          },
        }),
        prisma.session.deleteMany({
          where: { expires: { lt: now } },
        }),
        prisma.verificationToken.deleteMany({
          where: { expires: { lt: now } },
        }),
        prisma.webhookEvent.deleteMany({
          where: { createdAt: { lt: ninetyDaysAgo } },
        }),
        prisma.notification.deleteMany({
          where: { createdAt: { lt: oneYearAgo } },
        }),
        prisma.patientNote.deleteMany({
          where: { updatedAt: { lt: tenYearsAgo } },
        }),
      ]);

    console.log("[CRON] GDPR cleanup:", JSON.stringify({
      bookings: bookings.count,
      sessions: sessions.count,
      tokens: tokens.count,
      webhookEvents: webhookEvents.count,
      notifications: notifications.count,
      patientNotes: patientNotes.count,
    }));

    return NextResponse.json({
      success: true,
      bookings: bookings.count,
      sessions: sessions.count,
      tokens: tokens.count,
      webhookEvents: webhookEvents.count,
      notifications: notifications.count,
      patientNotes: patientNotes.count,
    });
  } catch (err) {
    console.error("[CRON] GDPR cleanup error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
