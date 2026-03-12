import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getMerchant(userId: string) {
  return prisma.merchant.findUnique({ where: { userId } });
}

// GET: Liste des récompenses du commerçant
export async function GET() {
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
}

// POST: Créer une nouvelle récompense
export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const merchant = await getMerchant(session.user.id);
  if (!merchant)
    return NextResponse.json({ error: "No merchant profile" }, { status: 400 });

  const body = await request.json();

  if (!body.name || !body.xpCost || body.xpCost < 1) {
    return NextResponse.json(
      { error: "Nom et coût XP requis (minimum 1 XP)" },
      { status: 400 }
    );
  }

  const reward = await prisma.xpReward.create({
    data: {
      merchantId: merchant.id,
      name: body.name,
      description: body.description || null,
      xpCost: body.xpCost,
      type: body.type || "DISCOUNT",
      value: body.value || null,
      maxUses: body.maxUses || null,
    },
  });

  return NextResponse.json(reward);
}

// PUT: Modifier une récompense
export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const merchant = await getMerchant(session.user.id);
  if (!merchant)
    return NextResponse.json({ error: "No merchant profile" }, { status: 400 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id)
    return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await request.json();

  const reward = await prisma.xpReward.updateMany({
    where: { id, merchantId: merchant.id },
    data: {
      name: body.name,
      description: body.description,
      xpCost: body.xpCost,
      type: body.type,
      value: body.value,
      isActive: body.isActive,
      maxUses: body.maxUses,
    },
  });

  return NextResponse.json(reward);
}

// DELETE: Supprimer une récompense
export async function DELETE(request: NextRequest) {
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
}
