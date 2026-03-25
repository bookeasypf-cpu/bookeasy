"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { sendWelcomeEmail } from "@/lib/email";
import {
  generateReferralCode,
  REFERRAL_XP_SIGNUP,
  REFEREE_XP_SIGNUP,
  checkAndAwardMilestoneBonus,
} from "@/lib/referral";

export async function registerUser(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    role: formData.get("role") as string,
  };

  const referralCode = formData.get("referralCode") as string | null;

  const result = registerSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { name, email, password, role } = result.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Un compte avec cet email existe déjà" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
    },
  });

  // Generate a referral code for the new user
  generateReferralCode(newUser.id).catch(() => {});

  // Handle referral if a valid code was provided
  if (referralCode) {
    try {
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
        select: { id: true, name: true, email: true },
      });

      if (referrer && referrer.id !== newUser.id) {
        // Create Referral record
        await prisma.referral.create({
          data: {
            referrerId: referrer.id,
            refereeId: newUser.id,
            status: "REGISTERED",
          },
        });

        // Award XP to referrer (parrain)
        await prisma.xpTransaction.create({
          data: {
            userId: referrer.id,
            amount: REFERRAL_XP_SIGNUP,
            type: "EARNED",
            reason: `Parrainage : ${name} s'est inscrit(e)`,
          },
        });

        // Award XP to new user (filleul)
        await prisma.xpTransaction.create({
          data: {
            userId: newUser.id,
            amount: REFEREE_XP_SIGNUP,
            type: "EARNED",
            reason: "Bonus d'inscription par parrainage",
          },
        });

        // Check milestones
        await checkAndAwardMilestoneBonus(referrer.id);

        // Send notification email to referrer (async, non-blocking)
        const { sendReferralRewardEmail } = await import("@/lib/email");
        sendReferralRewardEmail(
          referrer.email!,
          referrer.name || "Parrain",
          REFERRAL_XP_SIGNUP,
          `${name} s'est inscrit(e) grâce à votre invitation`
        ).catch(() => {});
      }
    } catch {
      // Don't fail registration if referral processing fails
      console.error("[REFERRAL] Error processing referral code:", referralCode);
    }
  }

  // Send welcome email (async, non-blocking)
  sendWelcomeEmail(email, name).catch(() => {});

  return { success: true };
}
