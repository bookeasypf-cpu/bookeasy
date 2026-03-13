import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getMerchant(userId: string) {
  return prisma.merchant.findUnique({ where: { userId } });
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json([], { status: 401 });
    const merchant = await getMerchant(session.user.id);
    if (!merchant) return NextResponse.json([]);
    const services = await prisma.service.findMany({
      where: { merchantId: merchant.id },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(services);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const merchant = await getMerchant(session.user.id);
    if (!merchant)
      return NextResponse.json({ error: "No merchant profile" }, { status: 400 });

    const body = await request.json();

    if (!body.name || !body.duration || body.price == null) {
      return NextResponse.json({ error: "Nom, durée et prix requis" }, { status: 400 });
    }

    const xpAmount = body.xpAmount ? Math.max(1, Math.floor(Number(body.xpAmount))) : null;

    const service = await prisma.service.create({
      data: {
        merchantId: merchant.id,
        name: body.name,
        description: body.description,
        duration: Math.max(5, Math.floor(Number(body.duration))),
        price: Math.max(0, Number(body.price)),
        xpAmount,
      },
    });
    return NextResponse.json(service);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = request.nextUrl.searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const merchant = await getMerchant(session.user.id);
    if (!merchant)
      return NextResponse.json({ error: "No merchant profile" }, { status: 400 });

    // Verify ownership
    const existing = await prisma.service.findFirst({ where: { id, merchantId: merchant.id } });
    if (!existing)
      return NextResponse.json({ error: "Service non trouvé" }, { status: 404 });

    const body = await request.json();
    const xpAmount = body.xpAmount !== undefined
      ? (body.xpAmount ? Math.max(1, Math.floor(Number(body.xpAmount))) : null)
      : undefined;

    const service = await prisma.service.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        duration: body.duration ? Math.max(5, Math.floor(Number(body.duration))) : undefined,
        price: body.price != null ? Math.max(0, Number(body.price)) : undefined,
        xpAmount,
      },
    });
    return NextResponse.json(service);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

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

    // Verify ownership before deleting
    const existing = await prisma.service.findFirst({ where: { id, merchantId: merchant.id } });
    if (!existing)
      return NextResponse.json({ error: "Service non trouvé" }, { status: 404 });

    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
