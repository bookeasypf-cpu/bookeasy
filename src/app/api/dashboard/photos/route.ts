import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addPhotoSchema, updateCoverSchema, zodFirstError } from "@/lib/validations";

export async function GET() {
  try {
    const session = await getSession();
    // GET aligned with PUT/POST/DELETE — only MERCHANT users have a
    // photos resource. A CLIENT hitting this route was returning their
    // (non-existent) merchant profile, an unintentional surface.
    if (!session?.user || session.user.role !== "MERCHANT") {
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
  } catch (err) {
    console.error("[photos GET] error:", err instanceof Error ? err.message : err);
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

    const parsed = updateCoverSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: zodFirstError(parsed.error) }, { status: 400 });
    }

    const merchant = await prisma.merchant.update({
      where: { userId: session.user.id },
      data: { coverImage: parsed.data.coverImage || null },
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

    const parsed = addPhotoSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: zodFirstError(parsed.error) }, { status: 400 });
    }
    const { url, caption } = parsed.data;

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
