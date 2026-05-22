/**
 * Pull aggregate email metrics from Resend's REST API for the personal
 * marketing dashboard. Cached upstream by the route that calls this
 * (60 s); Resend allows 100 req/min so we're 60x under.
 *
 * Open/click rates require Resend tracking to be enabled (Dashboard →
 * Settings → Tracking). Without it, last_event tops out at "delivered"
 * and the rates stay at 0 — even if the emails are actually being read.
 */

interface ResendEmailEvent {
  id: string;
  to?: string[];
  from?: string;
  subject?: string;
  created_at?: string;
  last_event?:
    | "sent"
    | "delivered"
    | "delivery_delayed"
    | "opened"
    | "clicked"
    | "bounced"
    | "complained";
}

interface ResendListResponse {
  data?: ResendEmailEvent[];
}

export interface EmailMetrics {
  avgOpenRate: number;    // %
  avgClickRate: number;   // %
  sequencesActive: number; // distinct email "types" detected this month
  sentThisMonth: number;
}

const RESEND_BASE = "https://api.resend.com";

/**
 * Returns null on any failure — the route falls back to displaying "—"
 * for these KPIs rather than fabricating numbers.
 */
export async function getResendMetrics(): Promise<EmailMetrics | null> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  try {
    // Most recent 100 emails — Resend's max per page. At BookEasy's
    // early-stage volume this typically covers 1-2 weeks of activity,
    // which is enough for a directional dashboard signal.
    // TODO Phase 3: paginate to get true 30-day stats once volume > 100/wk.
    const res = await fetch(`${RESEND_BASE}/emails?limit=100`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      // Don't let Next.js cache this — the upstream route already caches
      // the full /api/marketing/stats response for 60 s.
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`[resend-metrics] API ${res.status}: ${res.statusText}`);
      return null;
    }

    const body = (await res.json()) as ResendListResponse;
    const emails = body.data ?? [];

    // Current calendar month — first day at 00:00 local time.
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const thisMonth = emails.filter((e) => {
      if (!e.created_at) return false;
      return new Date(e.created_at) >= monthStart;
    });

    // Open/click rates are computed against DELIVERED, not SENT — bounces
    // and spam-rejects shouldn't deflate the open rate (industry standard).
    const delivered = thisMonth.filter((e) =>
      ["delivered", "opened", "clicked"].includes(e.last_event || "")
    ).length;
    const opened = thisMonth.filter((e) =>
      ["opened", "clicked"].includes(e.last_event || "")
    ).length;
    const clicked = thisMonth.filter((e) => e.last_event === "clicked").length;

    // "Types actifs" = distinct first character of subject. Our subjects
    // start with an emoji that identifies the template (🎉 bienvenue,
    // ✅ confirmation, ⏰ rappel, ❌ annulation, 🎁 carte cadeau / parrain,
    // 🔐 password / credentials, 📅 nouveau RDV pro). If a type stops
    // appearing — e.g. zero ⏰ rappels this week — the dashboard surfaces
    // it visually.
    const distinctTypes = new Set(
      thisMonth
        .map((e) => (e.subject || "").trim().slice(0, 2))
        .filter((s) => s.length > 0)
    );

    return {
      avgOpenRate:
        delivered > 0 ? Math.round((opened / delivered) * 1000) / 10 : 0,
      avgClickRate:
        delivered > 0 ? Math.round((clicked / delivered) * 1000) / 10 : 0,
      sequencesActive: distinctTypes.size,
      sentThisMonth: thisMonth.length,
    };
  } catch (err) {
    console.error(
      "[resend-metrics] Fetch failed:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}
