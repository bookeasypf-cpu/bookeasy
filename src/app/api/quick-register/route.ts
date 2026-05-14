import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { signupLimiter, formatRateLimitError } from "@/lib/ratelimit";
import { quickRegisterSchema, zodFirstError } from "@/lib/validations";
import { sendMerchantCredentials } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 3 signup attempts per hour per IP
    const ipAddress = req.headers.get("x-forwarded-for") ||
                      req.headers.get("x-real-ip") ||
                      "unknown";
    const { success, reset } = await signupLimiter.limit(`signup-${ipAddress}`);
    if (!success) {
      const resetIn = reset ? Math.ceil((reset - Date.now()) / 1000) : 0;
      return NextResponse.json(
        {
          error: formatRateLimitError(resetIn, "tentatives d'inscription"),
        },
        { status: 429 }
      );
    }

    const parsed = quickRegisterSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: zodFirstError(parsed.error) }, { status: 400 });
    }
    const { name, email, phone } = parsed.data;
    const acceptedCguAt = new Date();
    // Always FREE — PRO plan requires PayZen checkout, no free upgrade
    const merchantPlan = "FREE" as const;

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
        acceptedCguAt,
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
          plan: merchantPlan,
        },
      });
    }

    // Send credentials by email (not in JSON response)
    sendMerchantCredentials(email, name, tempPassword).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Compte créé ! Vos identifiants de connexion ont été envoyés par email.",
    });
  } catch (error) {
    console.error("Quick register error:", error);
    return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 });
  }
}
