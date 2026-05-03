import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateReferralCode, getReferralLink } from "@/lib/referral";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // Get or generate referral code
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { referralCode: true },
  });

  let referralCode = dbUser?.referralCode;
  if (!referralCode) {
    referralCode = await generateReferralCode(user.id);
  }

  // Get referrals sent by this user (no email — masked for RGPD)
  const referrals = await prisma.referral.findMany({
    where: { referrerId: user.id },
    include: {
      referee: {
        select: { name: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate XP earned from referrals + milestone bonuses (parallel)
  const [xpTransactions, milestoneXp] = await Promise.all([
    prisma.xpTransaction.findMany({
      where: { userId: user.id, reason: { startsWith: "Parrainage" } },
      select: { amount: true },
    }),
    prisma.xpTransaction.findMany({
      where: { userId: user.id, reason: { startsWith: "Palier parrainage" } },
      select: { amount: true },
    }),
  ]);

  const totalXpFromReferrals =
    xpTransactions.reduce((sum, tx) => sum + tx.amount, 0) +
    milestoneXp.reduce((sum, tx) => sum + tx.amount, 0);

  const totalReferrals = referrals.length;
  const activeReferrals = referrals.filter(
    (r) => r.status === "FIRST_BOOKING" || r.status === "COMPLETED"
  ).length;

  // Next milestone
  let nextMilestone = null;
  if (totalReferrals < 5) {
    nextMilestone = { target: 5, current: totalReferrals, bonus: 20 };
  } else if (totalReferrals < 10) {
    nextMilestone = { target: 10, current: totalReferrals, bonus: 30 };
  }

  return NextResponse.json({
    referralCode,
    referralLink: getReferralLink(referralCode),
    stats: {
      totalReferrals,
      activeReferrals,
      xpEarned: totalXpFromReferrals,
      nextMilestone,
    },
    referrals: referrals.map((r) => ({
      id: r.id,
      refereeName: r.referee.name,
      status: r.status,
      createdAt: r.createdAt,
    })),
  });
}
