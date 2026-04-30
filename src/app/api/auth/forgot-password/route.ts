import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { passwordResetLimiter } from "@/lib/ratelimit";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email requis" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limit: 3 reset requests per hour per email
    try {
      const { success } = await passwordResetLimiter.limit(
        `reset-${normalizedEmail}`
      );
      if (!success) {
        return NextResponse.json(
          { error: "Trop de demandes. Réessayez dans quelques minutes." },
          { status: 429 }
        );
      }
    } catch {
      // Fail open if Redis unavailable
    }

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, email: true, passwordHash: true },
    });

    if (user && user.passwordHash) {
      // Only send reset for users with a password (not OAuth-only)
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Delete any existing tokens for this email
      await prisma.verificationToken.deleteMany({
        where: { identifier: normalizedEmail },
      });

      // Create new token
      await prisma.verificationToken.create({
        data: {
          identifier: normalizedEmail,
          token,
          expires,
        },
      });

      // Send email (non-blocking)
      sendPasswordResetEmail(
        normalizedEmail,
        user.name || "Utilisateur",
        token
      ).catch(() => {});
    }

    // Always return success (prevent email enumeration)
    return NextResponse.json({
      message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
    });
  } catch (error) {
    console.error("[FORGOT-PASSWORD] Error:", error);
    return NextResponse.json(
      { error: "Erreur interne" },
      { status: 500 }
    );
  }
}
