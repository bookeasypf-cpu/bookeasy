import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUpcomingHolidaysPF } from "@/lib/holidays-pf";

// Préfixe stable utilisé pour distinguer un blocage créé par cette feature
// "jour férié" des blocages manuels (matinée, vacances, etc.). Le toggle
// "rouvrir" ne supprime que les blocs portant ce préfixe — un blocage
// manuel sur la même date est conservé.
const HOLIDAY_REASON_PREFIX = "[holiday] ";

async function requireMerchantId(): Promise<string | null> {
  const session = await getSession();
  if (!session?.user || session.user.role !== "MERCHANT") return null;
  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  return merchant?.id ?? null;
}

/**
 * GET — Liste les jours fériés PF à venir + statut "bloqué" pour ce merchant.
 *
 * Response:
 *   {
 *     holidays: [
 *       { date, name, isPfSpecific, blocked: boolean, blockReason?: string }
 *     ]
 *   }
 */
export async function GET() {
  const merchantId = await requireMerchantId();
  if (!merchantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const holidays = getUpcomingHolidaysPF(12);
  if (holidays.length === 0) {
    return NextResponse.json({ holidays: [] });
  }

  // 1 query pour récupérer tous les blocages full-day sur les dates
  // de jours fériés à venir (startTime + endTime null = journée entière).
  const dates = holidays.map((h) => h.date);
  const existingBlocks = await prisma.blockedSlot.findMany({
    where: {
      merchantId,
      date: { in: dates },
      startTime: null,
      endTime: null,
    },
    select: { date: true, reason: true },
  });
  const blockByDate = new Map<string, string | null>();
  for (const b of existingBlocks) blockByDate.set(b.date, b.reason);

  return NextResponse.json({
    holidays: holidays.map((h) => ({
      ...h,
      blocked: blockByDate.has(h.date),
      blockReason: blockByDate.get(h.date) ?? undefined,
    })),
  });
}

/**
 * POST — Toggle "fermer" ou "rouvrir" pour un jour férié donné.
 *
 * Body: { date: "YYYY-MM-DD", name: string, action: "block" | "unblock" }
 *
 * block   → crée un BlockedSlot full-day avec reason préfixé "[holiday] "
 *           (idempotent: pas de doublon si déjà bloqué via cette feature)
 * unblock → supprime UNIQUEMENT les blocs full-day préfixés "[holiday] "
 *           Les blocs manuels créés par ailleurs restent intacts.
 */
const toggleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide (YYYY-MM-DD)"),
  name: z.string().min(1).max(100),
  action: z.enum(["block", "unblock"]),
});

export async function POST(request: Request) {
  const merchantId = await requireMerchantId();
  if (!merchantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = toggleSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Paramètres invalides" },
      { status: 400 }
    );
  }
  const { date, name, action } = parsed.data;
  const reason = `${HOLIDAY_REASON_PREFIX}${name}`;

  if (action === "block") {
    // Idempotent : on ne crée qu'un seul bloc holiday par date par merchant.
    const existing = await prisma.blockedSlot.findFirst({
      where: {
        merchantId,
        date,
        startTime: null,
        endTime: null,
        reason: { startsWith: HOLIDAY_REASON_PREFIX },
      },
      select: { id: true },
    });
    if (!existing) {
      await prisma.blockedSlot.create({
        data: { merchantId, date, reason },
      });
    }
    return NextResponse.json({ ok: true, blocked: true });
  }

  // unblock: ne touche QUE les blocs créés via cette feature.
  await prisma.blockedSlot.deleteMany({
    where: {
      merchantId,
      date,
      startTime: null,
      endTime: null,
      reason: { startsWith: HOLIDAY_REASON_PREFIX },
    },
  });
  return NextResponse.json({ ok: true, blocked: false });
}
