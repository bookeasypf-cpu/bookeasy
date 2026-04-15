import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { geocodeAddress } from "@/lib/geocode";

// One-time endpoint to geocode all merchants missing coordinates
// GET /api/admin/geocode-all (requires Bearer CRON_SECRET)
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const merchants = await prisma.merchant.findMany({
      where: {
        OR: [{ latitude: null }, { longitude: null }],
      },
      select: {
        id: true,
        businessName: true,
        address: true,
        city: true,
        postalCode: true,
      },
    });

    const results: { name: string; status: string; coords?: { lat: number; lng: number } }[] = [];

    for (const m of merchants) {
      // Nominatim rate limit: 1 req/sec
      await new Promise((r) => setTimeout(r, 1100));

      const coords = await geocodeAddress(
        m.address || "",
        m.city || "",
        m.postalCode
      );

      if (coords) {
        await prisma.merchant.update({
          where: { id: m.id },
          data: { latitude: coords.latitude, longitude: coords.longitude },
        });
        results.push({
          name: m.businessName,
          status: "geocoded",
          coords: { lat: coords.latitude, lng: coords.longitude },
        });
      } else {
        // Fallback: assign approximate Papeete/Tahiti coordinates with small random offset
        const baseLat = -17.535;
        const baseLng = -149.569;
        const offset = () => (Math.random() - 0.5) * 0.05; // ~2.5km radius
        const fallbackLat = baseLat + offset();
        const fallbackLng = baseLng + offset();

        await prisma.merchant.update({
          where: { id: m.id },
          data: { latitude: fallbackLat, longitude: fallbackLng },
        });
        results.push({
          name: m.businessName,
          status: "fallback (Papeete area)",
          coords: { lat: fallbackLat, lng: fallbackLng },
        });
      }
    }

    return NextResponse.json({
      total: merchants.length,
      processed: results.length,
      results,
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
