import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Client redemption history
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const redemptions = await prisma.xpRedemption.findMany({
      where: { userId: session.user.id },
      include: {
        reward: {
          select: {
            name: true,
            xpCost: true,
            type: true,
            value: true,
            merchant: {
              select: { businessName: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(redemptions);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
