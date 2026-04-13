import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client once
const redis = Redis.fromEnv();

// ────────────────────────────────────────
// RATE LIMITERS (granular by endpoint)
// ────────────────────────────────────────

/**
 * Photo upload rate limit
 * Prevents spam/abuse of photo uploads
 * Limit: 5 uploads per minute per user
 */
export const uploadLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
});

/**
 * XP redemption rate limit
 * Prevents rapid generation of reward codes
 * Limit: 10 codes per hour per user
 */
export const xpRedeemLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
});

/**
 * XP code validation rate limit
 * Prevents rapid validation of codes
 * Limit: 20 validations per hour per user
 */
export const xpValidateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 h"),
  analytics: true,
});

/**
 * User signup/registration rate limit
 * Prevents brute force and spam signups
 * Limit: 3 signup attempts per hour per IP
 */
export const signupLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  analytics: true,
});

/**
 * Booking creation rate limit
 * Prevents rapid booking spam
 * Limit: 10 bookings per hour per user
 */
export const bookingLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
});

/**
 * Gift card creation rate limit
 * Prevents spam creation of gift cards
 * Limit: 5 gift cards per hour per user
 */
export const giftCardLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: true,
});

/**
 * Login rate limit
 * Prevents brute force password attacks
 * Limit: 5 attempts per 15 minutes per email
 */
export const loginLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
});

// ────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────

/**
 * Check if a user has exceeded rate limit
 * @param limiter - The Ratelimit instance to check against
 * @param identifier - Unique identifier (user ID or IP)
 * @returns Object with success boolean and resetIn (seconds)
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{
  success: boolean;
  resetIn: number;
}> {
  try {
    const { success, reset } = await limiter.limit(identifier);
    // reset is a timestamp in milliseconds, convert to seconds until reset
    const resetIn = reset ? Math.max(1, Math.ceil((reset - Date.now()) / 1000)) : 0;
    return { success, resetIn };
  } catch (error) {
    console.error("Rate limit check error:", error);
    // Fail open - allow request if Redis is down
    return { success: true, resetIn: 0 };
  }
}

/**
 * Format rate limit error message with reset time
 * @param resetIn - Seconds until rate limit resets
 * @param action - Human-readable action name
 * @returns Formatted error message
 */
export function formatRateLimitError(resetIn: number, action: string): string {
  if (resetIn <= 60) {
    return `Trop de ${action}. Réessayez dans ${resetIn} secondes.`;
  }
  const minutes = Math.ceil(resetIn / 60);
  return `Trop de ${action}. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.`;
}
