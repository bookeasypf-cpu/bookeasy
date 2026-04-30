import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createXpRewardSchema, updateXpRewardSchema, zodFirstError } from "@/lib/validations";

async function getMerchant(userId: string) {
  return prisma.merchant.findUnique({ where: { userId } });
}

// GET: Liste des récompenses du commerçant
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const merchant = await getMerchant(session.user.id);
    if (!merchant)
      return NextResponse.json({ error: "No merchant profile" }, { status: 400 });

    const rewards = await prisma.xpReward.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { redemptions: true } },
      },
    });

    return NextResponse.json(rewards);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST: Créer une nouvelle récompense
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const merchant = await getMerchant(session.user.id);
    if (!merchant)
      return NextResponse.json({ error: "No merchant profile" }, { status: 400 });

    const parsed = createXpRewardSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: zodFirstError(parsed.error) }, { status: 400 });
    }
    const { name, xpCost, description, type, value, maxUses } = parsed.data;

    const reward = await prisma.xpReward.create({
      data: {
        merchantId: merchant.id,
        name,
        description: description || null,
        xpCost,
        type,
        value: value || null,
        maxUses: maxUses || null,
      },
    });

    return NextResponse.json(reward);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT: Modifier une récompense
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const merchant = await getMerchant(session.user.id);
    if (!merchant)
      return NextResponse.json({ error: "No merchant profile" }, { status: 400 });

    const id = request.nextUrl.searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const parsed = updateXpRewardSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: zodFirstError(parsed.error) }, { status: 400 });
    }

    const reward = await prisma.xpReward.updateMany({
      where: { id, merchantId: merchant.id },
      data: parsed.data,
    });

    return NextResponse.json(reward);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE: Supprimer une récompense
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const merchant = await getMerchant(session.user.id);
    if (!merchant)
      return NextResponse.json({ error: "No merchant profile" }, { status: 400 });

    const id = request.nextUrl.searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.xpReward.deleteMany({
      where: { id, merchantId: merchant.id },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
