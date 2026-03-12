import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Récupérer les paramètres XP du commerçant
export async function GET() {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      xpPerBooking: true,
      _count: {
        select: {
          xpRewards: { where: { isActive: true } },
          xpTransactions: true,
        },
      },
    },
  });

  if (!merchant)
    return NextResponse.json({ error: "No merchant profile" }, { status: 400 });

  // Stats XP
  const totalXpDistributed = await prisma.xpTransaction.aggregate({
    where: { merchantId: merchant.id, type: "EARNED" },
    _sum: { amount: true },
  });

  const totalRedemptions = await prisma.xpTransaction.count({
    where: { merchantId: merchant.id, type: "REDEEMED" },
  });

  return NextResponse.json({
    xpPerBooking: merchant.xpPerBooking,
    activeRewards: merchant._count.xpRewards,
    totalTransactions: merchant._count.xpTransactions,
    totalXpDistributed: totalXpDistributed._sum.amount || 0,
    totalRedemptions,
  });
}

// PUT: Modifier le nombre d'XP par réservation
export async function PUT(request: Request) {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  if (!body.xpPerBooking || body.xpPerBooking < 1 || body.xpPerBooking > 100) {
    return NextResponse.json(
      { error: "XP par réservation doit être entre 1 et 100" },
      { status: 400 }
    );
  }

  const merchant = await prisma.merchant.update({
    where: { userId: session.user.id },
    data: { xpPerBooking: body.xpPerBooking },
  });

  return NextResponse.json({ xpPerBooking: merchant.xpPerBooking });
}
