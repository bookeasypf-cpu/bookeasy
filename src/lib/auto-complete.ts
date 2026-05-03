import { prisma } from "./prisma";

/**
 * Auto-complete CONFIRMED bookings whose date+endTime is in the past (Tahiti time).
 * Called on page load so the UI always reflects the real state.
 */
export async function autoCompleteBookings(merchantId: string): Promise<number> {
  const tahitiNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Pacific/Tahiti" })
  );
  const todayStr = tahitiNow.toLocaleDateString("en-CA");
  const nowTime = `${String(tahitiNow.getHours()).padStart(2, "0")}:${String(tahitiNow.getMinutes()).padStart(2, "0")}`;

  // Single atomic updateMany — eliminates race window between findMany
  // and updateMany where another process could re-modify these bookings.
  const result = await prisma.booking.updateMany({
    where: {
      merchantId,
      status: "CONFIRMED",
      OR: [
        { date: { lt: todayStr } },
        { date: todayStr, endTime: { lte: nowTime } },
      ],
    },
    data: { status: "COMPLETED" },
  });

  return result.count;
}
