import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
    include: { sector: true },
  });

  return NextResponse.json(merchant || { error: "No profile" });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "MERCHANT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { businessName, description, phone, address, city, postalCode, sectorId } =
    body;

  if (!businessName || !sectorId) {
    return NextResponse.json(
      { error: "Nom et secteur requis" },
      { status: 400 }
    );
  }

  const existing = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
  });

  if (existing) {
    const updated = await prisma.merchant.update({
      where: { userId: session.user.id },
      data: {
        businessName,
        description,
        phone,
        address,
        city,
        postalCode,
        sectorId,
      },
    });
    return NextResponse.json(updated);
  } else {
    const created = await prisma.merchant.create({
      data: {
        userId: session.user.id,
        businessName,
        description,
        phone,
        address,
        city,
        postalCode,
        sectorId,
      },
    });
    return NextResponse.json(created);
  }
}
