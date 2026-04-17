import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expired = await prisma.booking.updateMany({
    where: {
      status: "PENDING_PAYMENT",
      paymentExpiresAt: { lt: new Date() },
    },
    data: {
      status: "CANCELLED_BY_CLIENT",
      paymentStatus: "FAILED",
      cancelReason: "Délai de paiement expiré",
      cancelledAt: new Date(),
    },
  });

  return NextResponse.json({
    expired: expired.count,
    timestamp: new Date().toISOString(),
  });
}
