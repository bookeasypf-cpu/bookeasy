/**
 * Pull funnel data from PostHog's HogQL Query API.
 *
 * We split the funnel into two parallel queries instead of one big
 * correlated subquery — HogQL doesn't support `events e2` aliasing
 * inside a `countDistinctIf` predicate (it can't resolve the outer
 * `events` reference). Two small queries is faster anyway: PostHog
 * caches them independently.
 *
 * Funnel steps (last 30 days):
 *   1. $pageview                          → visits
 *   2. signup_completed                   → signups
 *   3. booking_completed (any user)       → first booking
 *   4. distinct_id with ≥2 booking_completed → repeat
 *
 * Caching: the upstream /api/marketing/stats route already caches the
 * full response for 60 s, so each query runs at most once per minute.
 */

interface HogQLResponse {
  results?: Array<Array<string | number | null>>;
  error?: string;
  detail?: string;
}

export interface FunnelData {
  visits: number;
  signups: number;
  firstBooking: number;
  repeat: number;
}

const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.posthog.com";
const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY;
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;

async function runHogQL(query: string): Promise<HogQLResponse | null> {
  const res = await fetch(
    `${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${POSTHOG_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: { kind: "HogQLQuery", query },
      }),
      cache: "no-store",
    }
  );

  const body = (await res.json()) as HogQLResponse;

  if (!res.ok) {
    // Surface the actual PostHog error so we don't debug blind next time.
    console.error(
      `[posthog-metrics] HogQL ${res.status}:`,
      body?.detail || body?.error || JSON.stringify(body).slice(0, 200)
    );
    return null;
  }

  return body;
}

export async function getPostHogFunnel(): Promise<FunnelData | null> {
  if (!POSTHOG_API_KEY || !POSTHOG_PROJECT_ID) return null;

  try {
    // Query 1: top-of-funnel counts (visits, signups, first booking).
    // countDistinctIf is fine here — no correlated subquery needed.
    const baseQuery = `
      SELECT
        countDistinctIf(distinct_id, event = '$pageview') AS visits,
        countDistinctIf(distinct_id, event = 'signup_completed') AS signups,
        countDistinctIf(distinct_id, event = 'booking_completed') AS first_booking
      FROM events
      WHERE timestamp >= now() - INTERVAL 30 DAY
    `;

    // Query 2: repeat = users with ≥ 2 booking_completed events.
    // GROUP BY + HAVING is the idiomatic HogQL way to do this.
    const repeatQuery = `
      SELECT count() AS repeat_users
      FROM (
        SELECT distinct_id
        FROM events
        WHERE event = 'booking_completed'
          AND timestamp >= now() - INTERVAL 30 DAY
        GROUP BY distinct_id
        HAVING count() >= 2
      )
    `;

    const [baseRes, repeatRes] = await Promise.all([
      runHogQL(baseQuery),
      runHogQL(repeatQuery),
    ]);

    if (!baseRes || !repeatRes) return null;

    const baseRow = baseRes.results?.[0];
    const repeatRow = repeatRes.results?.[0];
    if (!baseRow || !repeatRow) return null;

    return {
      visits: Number(baseRow[0]) || 0,
      signups: Number(baseRow[1]) || 0,
      firstBooking: Number(baseRow[2]) || 0,
      repeat: Number(repeatRow[0]) || 0,
    };
  } catch (err) {
    console.error(
      "[posthog-metrics] Fetch failed:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}
