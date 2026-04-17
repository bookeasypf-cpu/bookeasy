import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { geocodeAddress } from "@/lib/geocode";
import { isMedicalSectorName } from "@/lib/medical";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const merchant = await prisma.merchant.findUnique({
      where: { userId: session.user.id },
      include: { sector: true },
    });

    if (!merchant) return NextResponse.json({ error: "No profile" });

    const medical = isMedicalSectorName(merchant.sector?.name);
    return NextResponse.json({ ...merchant, isMedical: medical });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "MERCHANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Partial update: paymentPolicy only
    if (body.paymentPolicy && Object.keys(body).length === 1) {
      if (!["NONE", "FLEXIBLE", "ONLINE_ONLY"].includes(body.paymentPolicy)) {
        return NextResponse.json({ error: "Mode invalide" }, { status: 400 });
      }
      const updated = await prisma.merchant.update({
        where: { userId: session.user.id },
        data: { paymentPolicy: body.paymentPolicy },
      });
      return NextResponse.json(updated);
    }

    const { businessName, description, phone, address, city, postalCode, sectorId } =
      body;

    if (!businessName || !sectorId) {
      return NextResponse.json(
        { error: "Nom et secteur requis" },
        { status: 400 }
      );
    }

    const existing = await prisma.merchant.findUnique({
      where: { userId: session.user.id },
    });

    // Geocode address to get lat/lng for the map
    let latitude = existing?.latitude ?? null;
    let longitude = existing?.longitude ?? null;

    // Only geocode if address or city changed
    const addressChanged =
      !existing ||
      existing.address !== address ||
      existing.city !== city ||
      existing.postalCode !== postalCode;

    if (addressChanged && (address || city)) {
      const coords = await geocodeAddress(address || "", city || "", postalCode);
      if (coords) {
        latitude = coords.latitude;
        longitude = coords.longitude;
      }
    }

    const merchantData = {
      businessName,
      description,
      phone,
      address,
      city,
      postalCode,
      sectorId,
      latitude,
      longitude,
    };

    if (existing) {
      const updated = await prisma.merchant.update({
        where: { userId: session.user.id },
        data: merchantData,
      });
      return NextResponse.json(updated);
    } else {
      const created = await prisma.merchant.create({
        data: {
          userId: session.user.id,
          ...merchantData,
        },
      });
      return NextResponse.json(created);
    }
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
