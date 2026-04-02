import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - List active merchants for gift card selector
export async function GET() {
  try {
    const merchants = await prisma.merchant.findMany({
      where: { isActive: true },
      select: {
        id: true,
        businessName: true,
        sector: { select: { name: true } },
      },
      orderBy: { businessName: "asc" },
    });

    return NextResponse.json({
      merchants: merchants.map((m) => ({
        id: m.id,
        businessName: m.businessName,
        sector: m.sector?.name || "Autre",
      })),
    });
  } catch (error) {
    console.error("Error listing merchants:", error);
    return NextResponse.json({ merchants: [] });
  }
}
