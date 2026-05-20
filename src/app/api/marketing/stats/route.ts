import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { PRO_PRICE_XPF } from "@/lib/payzen";

/**
 * Marketing stats endpoint consumed by the personal command-center
 * dashboard (Mara @ localhost:4040). Auth via a single bearer token —
 * the dashboard is a single-tenant tool, so a static token is sufficient.
 *
 * Returns Phase-1 (DB-sourced) KPIs as live values. Phase-2/3/4 KPIs
 * (PostHog funnel, Resend metrics, social posts, PR mentions) come back
 * as `null` and the dashboard renders "—" for them until they're wired.
 *
 * Cached for 60 s — the dashboard polls every minute and we don't want
 * to hammer Neon for what is essentially a stable snapshot.
 */

export const dynamic = "force-dynamic";
export const revalidate = 60;

// Booking statuses that count toward "real" weekly bookings.
// PENDING_PAYMENT is included because the intent to book matters for
// the funnel; cancellations are excluded.
const COUNTED_BOOKING_STATUSES = ["PENDING", "PENDING_PAYMENT", "CONFIRMED", "COMPLETED"];
const REVENUE_BOOKING_STATUSES = ["CONFIRMED", "COMPLETED"];

interface MarketingStatsResponse {
  weeklyBookings: number;
  weeklyBookingsTrend: number;
  weeklyRevenueXPF: number;

  funnel: null;
  topPost: null;
  scheduledThisWeek: null;
  email: null;
  prMentionsThisMonth: null;

  kFactorMerchant: number;
  mrrPro: number;
  activeMerchants: number;

  generatedAt: string;
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export async function GET(request: Request) {
  // Static bearer token validation. Constant-time compare to avoid
  // length-based side-channel leakage of the secret.
  const expected = process.env.DASHBOARD_API_TOKEN;
  if (!expected) {
    console.error("[marketing/stats] DASHBOARD_API_TOKEN not set");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }
  const auth = request.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return unauthorized();
  const token = auth.slice(7);
  if (!timingSafeEqualStr(token, expected)) return unauthorized();

  try {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Parallel queries — these don't depend on each other.
    const [
      thisWeekCount,
      lastWeekCount,
      revenueAgg,
      proActiveCount,
      activeMerchantsCount,
      recentReferrals,
    ] = await Promise.all([
      prisma.booking.count({
        where: {
          createdAt: { gte: oneWeekAgo, lt: now },
          status: { in: COUNTED_BOOKING_STATUSES },
        },
      }),
      prisma.booking.count({
        where: {
          createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo },
          status: { in: COUNTED_BOOKING_STATUSES },
        },
      }),
      prisma.booking.aggregate({
        where: {
          createdAt: { gte: oneWeekAgo, lt: now },
          status: { in: REVENUE_BOOKING_STATUSES },
        },
        _sum: { totalPrice: true },
      }),
      prisma.merchant.count({
        where: {
          plan: "PRO",
          isActive: true,
          OR: [
            { planExpiresAt: null },
            { planExpiresAt: { gt: now } },
          ],
        },
      }),
      prisma.merchant.count({ where: { isActive: true } }),
      // Last 30 days of merchant-to-merchant referrals — used for
      // K = referrals_count / distinct_referrers_count.
      prisma.merchant.findMany({
        where: {
          referredByMerchantId: { not: null },
          createdAt: { gte: thirtyDaysAgo },
        },
        select: { referredByMerchantId: true },
      }),
    ]);

    // Trend: pure % change. 0 last-week base = "new", returned as 0
    // rather than +Infinity to keep the dashboard math sane.
    const weeklyBookingsTrend = lastWeekCount > 0
      ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100)
      : 0;

    const weeklyRevenueXPF = Math.round(revenueAgg._sum.totalPrice ?? 0);
    const mrrPro = proActiveCount * PRO_PRICE_XPF;

    // K-factor: average referrals brought per active referrer in the
    // last 30 d. Zero distinct referrers = zero K (not NaN).
    const distinctReferrers = new Set(
      recentReferrals
        .map((r) => r.referredByMerchantId)
        .filter((v): v is string => v !== null)
    ).size;
    const kFactorMerchant = distinctReferrers > 0
      ? Math.round((recentReferrals.length / distinctReferrers) * 10) / 10
      : 0;

    const payload: MarketingStatsResponse = {
      weeklyBookings: thisWeekCount,
      weeklyBookingsTrend,
      weeklyRevenueXPF,

      funnel: null,
      topPost: null,
      scheduledThisWeek: null,
      email: null,
      prMentionsThisMonth: null,

      kFactorMerchant,
      mrrPro,
      activeMerchants: activeMerchantsCount,

      generatedAt: now.toISOString(),
    };

    return NextResponse.json(payload, {
      headers: {
        // Allow the dashboard's Next.js revalidate to honor our 60 s
        // window, but never serve to public/CDN.
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (error) {
    console.error("[marketing/stats] Error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
