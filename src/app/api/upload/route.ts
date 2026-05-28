import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { put } from "@vercel/blob";
import { uploadLimiter, formatRateLimitError } from "@/lib/ratelimit";

// Server-side direct upload. We deliberately moved away from
// @vercel/blob/client `handleUpload` (token-based client-direct flow):
// the v2 client was hanging silently on certain network paths, no
// recoverable error — just a 90s timeout. Server-side `put()` is one
// round-trip, fully observable. Our images are always compressed under
// 4 MB by processImageForUpload before they reach this route, so the
// 4.5 MB Vercel function body cap is never hit.
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 4 * 1024 * 1024;

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!["CLIENT", "MERCHANT"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const { success, reset } = await uploadLimiter.limit(`upload-${session.user.id}`);
      if (!success) {
        const resetIn = reset ? Math.ceil((reset - Date.now()) / 1000) : 0;
        return NextResponse.json(
          { error: formatRateLimitError(resetIn, "uploads") },
          { status: 429 }
        );
      }
    } catch (e) {
      console.warn("Rate limiter unavailable, allowing upload:", e);
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Format non supporté (${file.type}). Utilisez JPG, PNG ou WebP.` },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} MB). Max: 4 MB après compression.` },
        { status: 413 }
      );
    }

    // addRandomSuffix:true — two users uploading IMG_0001.jpg never
    // collide (default changed to false in @vercel/blob v2).
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("[upload] Error:", error);
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { error: `Erreur lors de l'upload: ${message}` },
      { status: 500 }
    );
  }
}
