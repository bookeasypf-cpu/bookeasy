import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const merchant = await prisma.merchant.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        coverImage: true,
        photos: {
          orderBy: { sortOrder: "asc" },
          select: { id: true, url: true, caption: true, sortOrder: true },
        },
      },
    });

    if (!merchant) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      coverImage: merchant.coverImage,
      photos: merchant.photos,
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT: update cover image
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "MERCHANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { coverImage } = body;

    const merchant = await prisma.merchant.update({
      where: { userId: session.user.id },
      data: { coverImage: coverImage || null },
      select: { coverImage: true },
    });

    return NextResponse.json(merchant);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST: add a new photo
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "MERCHANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url, caption } = body;

    if (!url) {
      return NextResponse.json({ error: "URL requise" }, { status: 400 });
    }

    const merchant = await prisma.merchant.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!merchant) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    // Get the next sort order
    const lastPhoto = await prisma.merchantPhoto.findFirst({
      where: { merchantId: merchant.id },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const photo = await prisma.merchantPhoto.create({
      data: {
        merchantId: merchant.id,
        url,
        caption: caption || null,
        sortOrder: (lastPhoto?.sortOrder ?? -1) + 1,
      },
      select: { id: true, url: true, caption: true, sortOrder: true },
    });

    return NextResponse.json(photo);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE: remove a photo by id
export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "MERCHANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get("id");

    if (!photoId) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    // Verify ownership
    const merchant = await prisma.merchant.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!merchant) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    const photo = await prisma.merchantPhoto.findFirst({
      where: { id: photoId, merchantId: merchant.id },
    });

    if (!photo) {
      return NextResponse.json({ error: "Photo introuvable" }, { status: 404 });
    }

    await prisma.merchantPhoto.delete({ where: { id: photoId } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
