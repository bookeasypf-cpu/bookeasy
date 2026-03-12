import { prisma } from "./prisma";

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function addMinutes(time: string, mins: number): string {
  return minutesToTime(timeToMinutes(time) + mins);
}

export function generateCandidateSlots(
  schedules: { startTime: string; endTime: string; isActive: boolean }[],
  serviceDuration: number,
  interval: number = 15
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  for (const schedule of schedules) {
    if (!schedule.isActive) continue;

    let currentMins = timeToMinutes(schedule.startTime);
    const endMins = timeToMinutes(schedule.endTime);

    while (currentMins + serviceDuration <= endMins) {
      slots.push({
        startTime: minutesToTime(currentMins),
        endTime: minutesToTime(currentMins + serviceDuration),
      });
      currentMins += Math.min(interval, serviceDuration);
    }
  }

  return slots;
}

export function hasConflict(
  slotStart: string,
  slotEnd: string,
  bookings: { startTime: string; endTime: string }[]
): boolean {
  return bookings.some(
    (b) => slotStart < b.endTime && b.startTime < slotEnd
  );
}

export function isSlotBlocked(
  slotStart: string,
  slotEnd: string,
  blockedSlots: {
    startTime: string | null;
    endTime: string | null;
  }[]
): boolean {
  return blockedSlots.some((b) => {
    if (!b.startTime || !b.endTime) return true; // full day blocked
    return slotStart < b.endTime && b.startTime < slotEnd;
  });
}

export async function getAvailableSlots(
  merchantId: string,
  date: string,
  serviceId: string
): Promise<TimeSlot[]> {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) return [];

  const dayOfWeek = new Date(date + "T00:00:00").getDay();

  const [schedules, existingBookings, blockedSlots] = await Promise.all([
    prisma.weeklySchedule.findMany({
      where: { merchantId, dayOfWeek },
    }),
    prisma.booking.findMany({
      where: {
        merchantId,
        date,
        status: {
          notIn: ["CANCELLED_BY_CLIENT", "CANCELLED_BY_MERCHANT"],
        },
      },
      select: { startTime: true, endTime: true },
    }),
    prisma.blockedSlot.findMany({
      where: { merchantId, date },
      select: { startTime: true, endTime: true },
    }),
  ]);

  if (schedules.length === 0) return [];

  const candidates = generateCandidateSlots(schedules, service.duration);

  return candidates.filter(
    (slot) =>
      !hasConflict(slot.startTime, slot.endTime, existingBookings) &&
      !isSlotBlocked(slot.startTime, slot.endTime, blockedSlots)
  );
}

export async function checkSlotAvailable(
  merchantId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<boolean> {
  const conflicting = await prisma.booking.findFirst({
    where: {
      merchantId,
      date,
      status: {
        notIn: ["CANCELLED_BY_CLIENT", "CANCELLED_BY_MERCHANT"],
      },
      AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
    },
  });

  return !conflicting;
}
