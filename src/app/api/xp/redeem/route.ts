import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/push";
import { xpRedeemLimiter, checkRateLimit, formatRateLimitError } from "@/lib/ratelimit";
import { randomBytes } from "crypto";

// POST: Échanger des XP contre une récompense
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limiting: 10 redemptions per hour per user (fail-open if Redis down)
    const { success: rlSuccess, resetIn } = await checkRateLimit(
      xpRedeemLimiter,
      `redeem-${session.user.id}`
    );
    if (!rlSuccess) {
      return NextResponse.json(
        { error: formatRateLimitError(resetIn, "échanges XP") },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { rewardId } = body;

    if (!rewardId) {
      return NextResponse.json(
        { error: "ID de récompense requis" },
        { status: 400 }
      );
    }

    // Récupérer la récompense
    const reward = await prisma.xpReward.findUnique({
      where: { id: rewardId },
      include: { merchant: { select: { id: true, userId: true, businessName: true } } },
    });

    if (!reward || !reward.isActive) {
      return NextResponse.json(
        { error: "Récompense non disponible" },
        { status: 404 }
      );
    }

    // Vérifier si le max d'utilisations est atteint
    if (reward.maxUses && reward.usedCount >= reward.maxUses) {
      return NextResponse.json(
        { error: "Cette récompense n'est plus disponible (quota atteint)" },
        { status: 400 }
      );
    }

    // Générer un code unique pour la récompense
    const code = `BE-${randomBytes(4).toString("hex").toUpperCase()}`;

    // Transaction : vérifier solde + déduire les XP + créer le redemption (atomique)
    let balance: number;
    let redemption: { code: string; expiresAt: Date | null };
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Balance check INSIDE transaction to prevent race condition
        const balanceResult = await tx.xpTransaction.aggregate({
          where: { userId: session.user.id, merchantId: reward.merchantId },
          _sum: { amount: true },
        });

        const bal = balanceResult._sum.amount || 0;
        if (bal < reward.xpCost) {
          throw new Error(`XP_INSUFFICIENT:${bal}`);
        }

        await tx.xpTransaction.create({
          data: {
            userId: session.user.id,
            merchantId: reward.merchantId,
            amount: -reward.xpCost,
            type: "REDEEMED",
            reason: `Échange : ${reward.name}`,
          },
        });

        const red = await tx.xpRedemption.create({
          data: {
            rewardId: reward.id,
            userId: session.user.id,
            code,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
          },
        });

        await tx.xpReward.update({
          where: { id: reward.id },
          data: { usedCount: { increment: 1 } },
        });

        return { balance: bal, redemption: red };
      });

      balance = result.balance;
      redemption = result.redemption;
    } catch (e) {
      if (e instanceof Error && e.message.startsWith("XP_INSUFFICIENT:")) {
        const bal = parseInt(e.message.split(":")[1], 10);
        return NextResponse.json(
          { error: `XP insuffisants. Vous avez ${bal} XP, il en faut ${reward.xpCost}.` },
          { status: 400 }
        );
      }
      throw e;
    }

    // Notify merchant: client wants to use reward
    const clientName = session.user.name || "Un client";
    const notificationMessage = `${clientName} veut utiliser ${reward.name} – Code: ${redemption.code}`;

    await prisma.notification.create({
      data: {
        userId: reward.merchant.userId,
        type: "XP_REDEEMED",
        title: "Récompense demandée",
        message: notificationMessage,
        metadata: JSON.stringify({
          code: redemption.code,
          rewardId: reward.id,
          clientId: session.user.id,
          clientName,
        }),
      },
    }).catch(() => {});

    sendPushNotification(reward.merchant.userId, {
      title: "Récompense demandée",
      body: `${clientName} veut utiliser ${reward.name}`,
      url: "/dashboard/loyalty",
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      code: redemption.code,
      reward: reward.name,
      merchant: reward.merchant.businessName,
      expiresAt: redemption.expiresAt,
      newBalance: balance - reward.xpCost,
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
