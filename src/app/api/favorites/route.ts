import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

// GET /api/favorites — list user's favorites (just merchant IDs)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ favorites: [] });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: { merchantId: true },
  });

  return NextResponse.json({
    favorites: favorites.map((f) => f.merchantId),
  });
}

// POST /api/favorites — toggle favorite
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const { merchantId } = await req.json();
  if (!merchantId) {
    return NextResponse.json({ error: "merchantId requis" }, { status: 400 });
  }

  // Check if already favorited
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_merchantId: {
        userId: session.user.id,
        merchantId,
      },
    },
  });

  if (existing) {
    // Remove favorite
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  } else {
    // Add favorite
    await prisma.favorite.create({
      data: {
        userId: session.user.id,
        merchantId,
      },
    });
    return NextResponse.json({ favorited: true });
  }
}
