import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getMerchant(userId: string) {
  return prisma.merchant.findUnique({ where: { userId } });
}

// POST: Valider un code de récompense (marquer comme utilisé)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const merchant = await getMerchant(session.user.id);
    if (!merchant)
      return NextResponse.json({ error: "No merchant profile" }, { status: 400 });

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: "Code requis" }, { status: 400 });
    }

    // Find the redemption by code and check it belongs to this merchant's rewards
    const redemption = await prisma.xpRedemption.findUnique({
      where: { code },
      include: {
        reward: {
          select: {
            name: true,
            merchantId: true,
            type: true,
            value: true,
            xpCost: true,
          },
        },
      },
    });

    if (!redemption) {
      return NextResponse.json({ error: "Code invalide" }, { status: 404 });
    }

    if (redemption.reward.merchantId !== merchant.id) {
      return NextResponse.json(
        { error: "Ce code n'appartient pas à votre établissement" },
        { status: 403 }
      );
    }

    if (redemption.status === "USED") {
      return NextResponse.json(
        { error: "Ce code a déjà été utilisé", usedAt: redemption.usedAt },
        { status: 400 }
      );
    }

    if (redemption.status === "EXPIRED" || (redemption.expiresAt && redemption.expiresAt < new Date())) {
      return NextResponse.json(
        { error: "Ce code a expiré" },
        { status: 400 }
      );
    }

    // Mark as used
    const updated = await prisma.xpRedemption.update({
      where: { id: redemption.id },
      data: {
        status: "USED",
        usedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      reward: redemption.reward.name,
      type: redemption.reward.type,
      value: redemption.reward.value,
      xpCost: redemption.reward.xpCost,
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// GET: Liste des codes pour ce commerçant
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const merchant = await getMerchant(session.user.id);
    if (!merchant)
      return NextResponse.json({ error: "No merchant profile" }, { status: 400 });

    const status = request.nextUrl.searchParams.get("status");

    const redemptions = await prisma.xpRedemption.findMany({
      where: {
        reward: { merchantId: merchant.id },
        ...(status ? { status } : {}),
      },
      include: {
        reward: { select: { name: true, type: true, value: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(redemptions);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
