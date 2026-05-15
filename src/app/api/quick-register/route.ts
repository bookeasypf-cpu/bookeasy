import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signupLimiter, formatRateLimitError } from "@/lib/ratelimit";
import { quickRegisterSchema, zodFirstError } from "@/lib/validations";
import { sendMerchantWelcome } from "@/lib/email";

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
    const { name, email, phone, password } = parsed.data;
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

    // User chose their own password during signup — no random temp password,
    // no fragile email-only-credential flow.
    const passwordHash = await bcrypt.hash(password, 10);

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

    // Welcome email — no longer contains a password. If it fails, the user
    // still has their account and can log in immediately with their own
    // chosen password. Sent fire-and-forget AFTER unawaited because the
    // signup must not block on email delivery (we now know the user has
    // their credentials).
    sendMerchantWelcome(email, name).catch((err) => {
      console.error("[QUICK-REGISTER] Welcome email failed:", err instanceof Error ? err.message : err);
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
      message: "Compte créé ! Vous pouvez vous connecter maintenant.",
    });
  } catch (error) {
    console.error("Quick register error:", error);
    return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 });
  }
}
