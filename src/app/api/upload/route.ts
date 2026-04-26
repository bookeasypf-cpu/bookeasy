import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { uploadLimiter, formatRateLimitError } from "@/lib/ratelimit";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

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
      onUploadCompleted: async ({ blob }) => {
        console.log("Upload completed:", blob.url);
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
