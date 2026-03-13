import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ merchantId: string }> }
) {
  try {
    const { merchantId } = await params;

    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId, isActive: true },
      select: {
        id: true,
        userId: true,
        businessName: true,
        description: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true,
        latitude: true,
        longitude: true,
        coverImage: true,
        isActive: true,
        xpPerBooking: true,
        createdAt: true,
        updatedAt: true,
        sector: true,
        services: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!merchant) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(merchant);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
