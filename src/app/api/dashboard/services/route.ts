import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getMerchant(userId: string) {
  return prisma.merchant.findUnique({ where: { userId } });
}

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json([], { status: 401 });
  const merchant = await getMerchant(session.user.id);
  if (!merchant) return NextResponse.json([]);
  const services = await prisma.service.findMany({
    where: { merchantId: merchant.id },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(services);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const merchant = await getMerchant(session.user.id);
  if (!merchant)
    return NextResponse.json({ error: "No merchant profile" }, { status: 400 });

  const body = await request.json();
  const service = await prisma.service.create({
    data: {
      merchantId: merchant.id,
      name: body.name,
      description: body.description,
      duration: body.duration,
      price: body.price,
    },
  });
  return NextResponse.json(service);
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id)
    return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await request.json();
  const service = await prisma.service.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      duration: body.duration,
      price: body.price,
    },
  });
  return NextResponse.json(service);
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id)
    return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.service.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
