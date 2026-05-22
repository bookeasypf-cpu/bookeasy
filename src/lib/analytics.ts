/**
 * Client-side analytics wrapper around posthog-js.
 *
 * RGPD: PostHog is ONLY initialized after the user accepts the cookie
 * banner (localStorage["cookie-consent"] === "accepted"). Until then,
 * trackEvent() is a no-op — we don't queue, we don't ID, we don't send.
 *
 * Re-initialization happens automatically via the storage event when
 * the user clicks "Accepter" on the banner (no page reload needed).
 *
 * The 5 events we care about for the marketing funnel:
 *   - page_view            (auto-captured by posthog-js)
 *   - signup_started       (user lands on /register or /pricing form)
 *   - signup_completed     (user.create() returned successfully)
 *   - booking_started      (BookingFlow step 1 mounted)
 *   - booking_completed    (createBooking returned success)
 *
 * Everything else is opt-in via trackEvent(name, properties).
 */

import type { PostHog } from "posthog-js";

let posthogInstance: PostHog | null = null;
let initPromise: Promise<PostHog | null> | null = null;

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.posthog.com";

function hasConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("cookie-consent") === "accepted";
  } catch {
    return false;
  }
}

/**
 * Lazy-load posthog-js only when consent is granted and a key exists.
 * Caches the promise so concurrent callers share one init.
 */
async function ensurePostHog(): Promise<PostHog | null> {
  if (posthogInstance) return posthogInstance;
  if (!POSTHOG_KEY) return null;
  if (!hasConsent()) return null;

  if (!initPromise) {
    initPromise = import("posthog-js")
      .then(({ default: posthog }) => {
        posthog.init(POSTHOG_KEY, {
          api_host: POSTHOG_HOST,
          capture_pageview: true,        // page_view auto-captured
          capture_pageleave: true,       // duration tracking
          persistence: "localStorage",   // no third-party cookies
          autocapture: false,            // explicit events only (less noise)
          disable_session_recording: true, // RGPD: no replay until ROPA reviewed
          loaded: () => {
            posthogInstance = posthog;
          },
        });
        posthogInstance = posthog;
        return posthog;
      })
      .catch((err) => {
        console.error("[analytics] PostHog init failed:", err);
        initPromise = null; // allow retry
        return null;
      });
  }
  return initPromise;
}

/**
 * Fire-and-forget. Safe to call before consent — silently dropped.
 * Awaits PostHog init internally so the event isn't lost on the first
 * call after consent.
 */
export async function trackEvent(
  name: string,
  properties?: Record<string, string | number | boolean | null>
): Promise<void> {
  try {
    const ph = await ensurePostHog();
    if (!ph) return;
    ph.capture(name, properties);
  } catch {
    // Analytics must never break the user flow.
  }
}

/**
 * Called once on app boot from the PostHogProvider. Re-runs whenever
 * the consent state changes (via storage event from the banner).
 */
export async function bootAnalytics(): Promise<void> {
  await ensurePostHog();
}

/**
 * Called when the user revokes consent. Flushes any queued events,
 * stops the recorder, and clears the local identity.
 */
export function teardownAnalytics(): void {
  if (!posthogInstance) return;
  try {
    posthogInstance.reset();
    posthogInstance.opt_out_capturing();
  } catch {
    // ignore
  }
  posthogInstance = null;
  initPromise = null;
}

/**
 * Identify a logged-in user. Call after successful login/signup so
 * funnels can be deduplicated across sessions on the same email.
 * `userId` should be the Prisma User.id; never PII like email itself.
 */
export async function identifyUser(userId: string, role?: string): Promise<void> {
  try {
    const ph = await ensurePostHog();
    if (!ph) return;
    ph.identify(userId, role ? { role } : undefined);
  } catch {
    // ignore
  }
}
