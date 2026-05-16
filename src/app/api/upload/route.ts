import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { uploadLimiter, formatRateLimitError } from "@/lib/ratelimit";

// JPEG/PNG/WebP are the canonical web formats. HEIC/HEIF arrive only after
// client-side conversion via heic2any (see src/lib/image-compress.ts), so
// the server never has to deal with them directly.
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
// 25 MB lets a 4K photo from a recent phone go through even after a light
// quality bump. Vercel Blob itself supports up to 5 GB — this is our policy.
const MAX_SIZE = 25 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!["CLIENT", "MERCHANT"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting (fail-open)
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

    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Validate the upload before generating a token
        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_SIZE,
          tokenPayload: JSON.stringify({
            userId: session.user.id,
            pathname,
          }),
        };
      },
      onUploadCompleted: async () => {
        // Upload completed — URL is in the response, no need to log it
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { error: `Erreur lors de l'upload: ${message}` },
      { status: 500 }
    );
  }
}
