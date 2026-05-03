import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/slots";
import { publicEnumLimiter } from "@/lib/ratelimit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ merchantId: string }> }
) {
  try {
    // Rate limit per IP to prevent bulk scraping of merchant availability
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    try {
      const { success } = await publicEnumLimiter.limit(`avail-${ip}`);
      if (!success) {
        return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
      }
    } catch {
      // Fail open if Redis is down
    }

    const { merchantId } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const serviceId = searchParams.get("serviceId");

    if (!date || !serviceId) {
      return NextResponse.json(
        { error: "date and serviceId are required" },
        { status: 400 }
      );
    }

    const slots = await getAvailableSlots(merchantId, date, serviceId);

    return NextResponse.json({ slots });
  } catch (error) { console.error("[merchants/availability] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
