import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { resetPasswordSchema, zodFirstError } from "@/lib/validations";
import { passwordResetLimiter, checkRateLimit, formatRateLimitError } from "@/lib/ratelimit";

export async function POST(req: Request) {
  try {
    const parsed = resetPasswordSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: zodFirstError(parsed.error) }, { status: 400 });
    }
    const { token, password } = parsed.data;

    // Bucket on a token prefix (never on the email — unknown at this point).
    // 8 chars give enough uniqueness per legitimate token while keeping a
    // single bucket per attacker trying many random tokens from the same IP.
    const { success, resetIn } = await checkRateLimit(
      passwordResetLimiter,
      `reset-use-${token.slice(0, 8)}`
    );
    if (!success) {
      return NextResponse.json(
        { error: formatRateLimitError(resetIn, "tentatives") },
        { status: 429 }
      );
    }

    // Find token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Lien invalide ou expiré. Veuillez refaire une demande." },
        { status: 400 }
      );
    }

    // Check expiry
    if (verificationToken.expires < new Date()) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.json(
        { error: "Ce lien a expiré. Veuillez refaire une demande." },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 400 }
      );
    }

    // Hash new password and update
    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.verificationToken.delete({
        where: { token },
      }),
    ]);

    return NextResponse.json({
      message: "Mot de passe modifié avec succès",
    });
  } catch (error) {
    console.error("[RESET-PASSWORD] Error:", error);
    return NextResponse.json(
      { error: "Erreur interne" },
      { status: 500 }
    );
  }
}
