import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sectors = await prisma.sector.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(sectors);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
