import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingReminder } from "@/lib/email";

/**
 * CRON endpoint – sends reminder emails to clients with bookings tomorrow.
 * Triggered daily at 18:00 (Tahiti time = UTC-10 → 04:00 UTC next day).
 *
 * Protected by CRON_SECRET to prevent unauthorized access.
 */
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Calculate tomorrow's date in Tahiti timezone (UTC-10)
    const now = new Date();
    // Tahiti is UTC-10
    const tahitiOffset = -10 * 60;
    const tahitiTime = new Date(now.getTime() + (tahitiOffset + now.getTimezoneOffset()) * 60000);
    const tomorrow = new Date(tahitiTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0]; // "YYYY-MM-DD"

    // Find all confirmed bookings for tomorrow
    const bookings = await prisma.booking.findMany({
      where: {
        date: tomorrowStr,
        status: "CONFIRMED",
      },
      include: {
        client: { select: { name: true, email: true } },
        merchant: { select: { businessName: true, address: true, city: true, phone: true } },
        service: { select: { name: true } },
      },
    });

    let sent = 0;
    let skipped = 0;

    for (const booking of bookings) {
      if (!booking.client.email) {
        skipped++;
        continue;
      }

      await sendBookingReminder({
        clientName: booking.client.name || "Client",
        clientEmail: booking.client.email,
        serviceName: booking.service.name,
        merchantName: booking.merchant.businessName,
        date: booking.date,
        startTime: booking.startTime,
        address: booking.merchant.address,
        city: booking.merchant.city,
        phone: booking.merchant.phone,
      });

      sent++;
    }

    console.log(`[CRON] Reminders: ${sent} sent, ${skipped} skipped (no email), date=${tomorrowStr}`);

    return NextResponse.json({
      success: true,
      date: tomorrowStr,
      totalBookings: bookings.length,
      sent,
      skipped,
    });
  } catch (err) {
    console.error("[CRON] Reminder error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
