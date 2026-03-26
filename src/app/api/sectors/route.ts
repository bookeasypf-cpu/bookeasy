import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MEDICAL_SECTOR_SLUGS } from "@/lib/medical";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const medical = searchParams.get("medical");

    let where = {};
    if (medical === "true") {
      where = { slug: { in: MEDICAL_SECTOR_SLUGS } };
    } else if (medical === "false") {
      where = { slug: { notIn: MEDICAL_SECTOR_SLUGS } };
    }

    const sectors = await prisma.sector.findMany({
      where,
      orderBy: { name: "asc" },
    });
    return NextResponse.json(sectors);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
