import { prisma } from "@/lib/prisma";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars (0/O, 1/I)

export async function generateReferralCode(userId: string): Promise<string> {
  let code: string;
  let exists = true;

  // Generate unique code with BK- prefix + 4 alphanumeric chars
  do {
    const random = Array.from({ length: 4 }, () =>
      CHARS.charAt(Math.floor(Math.random() * CHARS.length))
    ).join("");
    code = `BK-${random}`;
    const existing = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });
    exists = !!existing;
  } while (exists);

  // Save code to user
  await prisma.user.update({
    where: { id: userId },
    data: { referralCode: code },
  });

  return code;
}

export function getReferralLink(code: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || "https://bookeasy.me";
  return `${baseUrl}/register?ref=${code}`;
}

// XP Constants
export const REFERRAL_XP_SIGNUP = 2;
export const REFERRAL_XP_FIRST_BOOKING = 5;
export const REFEREE_XP_SIGNUP = 2;
export const MILESTONE_5_BONUS = 20;
export const MILESTONE_10_BONUS = 30;

export async function checkAndAwardMilestoneBonus(referrerId: string): Promise<void> {
  const count = await prisma.referral.count({
    where: { referrerId },
  });

  if (count === 5) {
    await prisma.xpTransaction.create({
      data: {
        userId: referrerId,
        amount: MILESTONE_5_BONUS,
        type: "EARNED",
        reason: "Palier parrainage : 5 filleuls",
      },
    });
  } else if (count === 10) {
    await prisma.xpTransaction.create({
      data: {
        userId: referrerId,
        amount: MILESTONE_10_BONUS,
        type: "EARNED",
        reason: "Palier parrainage : 10 filleuls",
      },
    });
  }
}
