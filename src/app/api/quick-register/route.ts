import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, plan } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Nom et email requis" }, { status: 400 });
    }

    // Vérifier si l'email existe déjà
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé. Connectez-vous pour accéder à votre dashboard." },
        { status: 409 }
      );
    }

    // Générer un mot de passe temporaire
    const tempPassword = nanoid(10);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Créer l'utilisateur merchant
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        role: "MERCHANT",
      },
    });

    // Créer le profil merchant avec le premier secteur disponible
    const firstSector = await prisma.sector.findFirst();
    if (firstSector) {
      await prisma.merchant.create({
        data: {
          userId: user.id,
          businessName: name,
          phone: phone || null,
          sectorId: firstSector.id,
          plan: plan === "pro" ? "PRO" : "FREE",
        },
      });
    }

    return NextResponse.json({
      success: true,
      tempPassword,
      message: "Compte créé ! Utilisez ce mot de passe temporaire pour vous connecter, puis complétez votre profil.",
    });
  } catch (error) {
    console.error("Quick register error:", error);
    return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 });
  }
}
