/**
 * Pull funnel data from PostHog's HogQL Query API.
 *
 * We hit the generic /query endpoint with a HogQL SELECT so we get
 * server-side aggregation in one round-trip — no need for the dedicated
 * funnel API (which is more opinionated and tied to the UI's funnel
 * definitions).
 *
 * Funnel steps (last 30 days):
 *   1. $pageview                  → visits
 *   2. signup_completed           → signups
 *   3. booking_completed (first)  → first booking
 *   4. booking_completed (2+)     → repeat
 *
 * "Repeat" is computed in JS from the same payload — HogQL can do it
 * inline but the query would double its complexity for one extra row.
 *
 * Caching: the upstream /api/marketing/stats route already caches the
 * full response for 60 s, so this is called at most once per minute.
 */

interface HogQLRow {
  // `event` and `distinct_id_count` are the fields we SELECT.
  // PostHog returns them as a tuple in `results[i]` matching `columns`.
  [k: number]: string | number;
}

interface HogQLResponse {
  columns?: string[];
  results?: HogQLRow[];
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

export async function getPostHogFunnel(): Promise<FunnelData | null> {
  if (!POSTHOG_API_KEY || !POSTHOG_PROJECT_ID) return null;

  // HogQL: count distinct sessions per event in the last 30 days.
  // - $pageview              → unique visitors (visits)
  // - signup_completed       → unique users who signed up
  // - booking_completed      → unique users with ≥ 1 booking
  // - separate count of users with ≥ 2 bookings (repeat)
  const query = `
    SELECT
      countDistinctIf(distinct_id, event = '$pageview') AS visits,
      countDistinctIf(distinct_id, event = 'signup_completed') AS signups,
      countDistinctIf(distinct_id, event = 'booking_completed') AS first_booking,
      countDistinctIf(distinct_id, event = 'booking_completed' AND
        (SELECT count() FROM events e2 WHERE e2.distinct_id = events.distinct_id AND e2.event = 'booking_completed') >= 2
      ) AS repeat_users
    FROM events
    WHERE timestamp >= now() - INTERVAL 30 DAY
  `;

  try {
    const res = await fetch(`${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${POSTHOG_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: { kind: "HogQLQuery", query },
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`[posthog-metrics] API ${res.status}: ${res.statusText}`);
      return null;
    }

    const body = (await res.json()) as HogQLResponse;
    const row = body.results?.[0];
    if (!row) return null;

    // HogQL returns counts in the SELECT order: visits, signups, first_booking, repeat_users
    const visits = Number(row[0]) || 0;
    const signups = Number(row[1]) || 0;
    const firstBooking = Number(row[2]) || 0;
    const repeat = Number(row[3]) || 0;

    return { visits, signups, firstBooking, repeat };
  } catch (err) {
    console.error(
      "[posthog-metrics] Fetch failed:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}
