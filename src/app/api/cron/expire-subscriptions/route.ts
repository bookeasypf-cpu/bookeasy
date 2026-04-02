import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * CRON endpoint – expires PRO subscriptions that have passed their expiry date.
 * Downgrades merchants from PRO to FREE when planExpiresAt < now.
 *
 * Protected by CRON_SECRET to prevent unauthorized access.
 */
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find and downgrade all expired PRO merchants
    const result = await prisma.merchant.updateMany({
      where: {
        plan: "PRO",
        planExpiresAt: {
          lt: now,
        },
      },
      data: {
        plan: "FREE",
      },
    });

    console.log(`[CRON] Expire subscriptions: ${result.count} merchant(s) downgraded to FREE`);

    return NextResponse.json({
      success: true,
      expiredCount: result.count,
    });
  } catch (err) {
    console.error("[CRON] Expire subscriptions error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
