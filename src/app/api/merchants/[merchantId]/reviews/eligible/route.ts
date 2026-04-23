import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ merchantId: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ bookings: [] });
  }

  const { merchantId } = await params;

  const bookings = await prisma.booking.findMany({
    where: {
      clientId: session.user.id,
      merchantId,
      status: "COMPLETED",
      review: null,
    },
    include: {
      service: { select: { name: true } },
    },
    orderBy: { date: "desc" },
    take: 10,
  });

  return NextResponse.json({
    bookings: bookings.map((b) => ({
      id: b.id,
      serviceName: b.service.name,
      date: formatDate(b.date),
    })),
  });
}
