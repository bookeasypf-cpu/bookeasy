import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Solde XP du client (par commerçant ou global)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const merchantId = request.nextUrl.searchParams.get("merchantId");

    if (merchantId) {
      // Solde pour un commerçant spécifique
      const result = await prisma.xpTransaction.aggregate({
        where: { userId: session.user.id, merchantId },
        _sum: { amount: true },
      });

      const availableRewards = await prisma.xpReward.findMany({
        where: { merchantId, isActive: true },
        orderBy: { xpCost: "asc" },
      });

      return NextResponse.json({
        merchantId,
        balance: result._sum.amount || 0,
        rewards: availableRewards,
      });
    }

    // Solde global par commerçant
    const transactions = await prisma.xpTransaction.groupBy({
      by: ["merchantId"],
      where: { userId: session.user.id },
      _sum: { amount: true },
    });

    const merchantIds = transactions.map((t) => t.merchantId);
    const merchants = await prisma.merchant.findMany({
      where: { id: { in: merchantIds } },
      select: {
        id: true,
        businessName: true,
        city: true,
        sector: { select: { name: true, icon: true } },
        xpRewards: {
          where: { isActive: true },
          orderBy: { xpCost: "asc" },
        },
      },
    });

    const balances = transactions
      .map((t) => {
        const merchant = merchants.find((m) => m.id === t.merchantId);
        return {
          merchantId: t.merchantId,
          balance: t._sum.amount || 0,
          merchant,
        };
      })
      .filter((b) => b.balance > 0)
      .sort((a, b) => b.balance - a.balance);

    return NextResponse.json(balances);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
