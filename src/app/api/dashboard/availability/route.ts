import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateAvailabilitySchema, zodFirstError } from "@/lib/validations";

export async function GET() {
  try {
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
  } catch (err) {
    console.error("[availability GET] error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
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

    const parsed = updateAvailabilitySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: zodFirstError(parsed.error) }, { status: 400 });
    }
    const { schedule } = parsed.data;

    // Delete existing and recreate atomically
    await prisma.$transaction(async (tx) => {
      await tx.weeklySchedule.deleteMany({
        where: { merchantId: merchant.id },
      });

      if (schedule && schedule.length > 0) {
        await tx.weeklySchedule.createMany({
          data: schedule.map((s) => ({
            merchantId: merchant.id,
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            isActive: s.isActive,
          })),
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[availability PUT] error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
