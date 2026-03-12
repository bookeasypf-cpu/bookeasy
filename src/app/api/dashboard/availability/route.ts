import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json([], { status: 401 });
  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
  });
  if (!merchant) return NextResponse.json([]);
  const schedule = await prisma.weeklySchedule.findMany({
    where: { merchantId: merchant.id },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json(schedule);
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
  });
  if (!merchant)
    return NextResponse.json(
      { error: "No merchant profile" },
      { status: 400 }
    );

  const body = await request.json();
  const { schedule } = body;

  // Delete existing and recreate
  await prisma.weeklySchedule.deleteMany({
    where: { merchantId: merchant.id },
  });

  if (schedule && schedule.length > 0) {
    for (const s of schedule) {
      await prisma.weeklySchedule.create({
        data: {
          merchantId: merchant.id,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          isActive: s.isActive,
        },
      });
    }
  }

  return NextResponse.json({ success: true });
}
