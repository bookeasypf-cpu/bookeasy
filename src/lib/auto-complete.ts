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

  const pastBookings = await prisma.booking.findMany({
    where: {
      merchantId,
      status: "CONFIRMED",
      OR: [
        { date: { lt: todayStr } },
        { date: todayStr, endTime: { lte: nowTime } },
      ],
    },
    select: { id: true },
  });

  if (pastBookings.length === 0) return 0;

  const result = await prisma.booking.updateMany({
    where: { id: { in: pastBookings.map((b) => b.id) } },
    data: { status: "COMPLETED" },
  });

  return result.count;
}
