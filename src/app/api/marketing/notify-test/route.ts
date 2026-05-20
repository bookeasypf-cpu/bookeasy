/**
 * Endpoint de test pour déclencher manuellement une notification admin.
 * Usage : POST /api/marketing/notify-test
 *   Body JSON : { merchantId: string, event: "welcome" | "upgrade" }
 *
 * Protégé : nécessite NEXTAUTH_SECRET en header X-Admin-Key
 * À utiliser depuis l'admin marketing pour tester le pipeline sans
 * créer de vrai signup ou attendre un vrai upgrade.
 */
import { NextRequest, NextResponse } from "next/server";
import { notifyAdminMarketingEvent, type MarketingEvent } from "@/lib/marketing/notify";

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key");
  if (!adminKey || adminKey !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { merchantId?: string; event?: MarketingEvent };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const { merchantId, event } = body;
  if (!merchantId || (event !== "welcome" && event !== "upgrade")) {
    return NextResponse.json({ error: "merchantId and event (welcome|upgrade) required" }, { status: 400 });
  }

  try {
    await notifyAdminMarketingEvent({ event, merchantId });
    return NextResponse.json({ success: true, sent: { event, merchantId } });
  } catch (err) {
    return NextResponse.json(
      { error: "notify failed", message: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
