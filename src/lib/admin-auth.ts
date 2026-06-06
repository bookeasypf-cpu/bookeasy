import crypto from "crypto";
import type { NextRequest } from "next/server";

/**
 * Constant-time comparison of the X-Admin-Key header against
 * ADMIN_API_KEY. Uses a fixed-size buffer so the comparison cost
 * does not leak the expected key length.
 *
 * ADMIN_API_KEY must be a dedicated secret (never reuse NEXTAUTH_SECRET
 * which signs every session JWT — leaking it through admin endpoint
 * logs would compromise every user session).
 */
export function isValidAdminKey(req: NextRequest): boolean {
  const provided = req.headers.get("x-admin-key");
  const expected = process.env.ADMIN_API_KEY;
  if (!provided || !expected) return false;

  const a = Buffer.alloc(64);
  const b = Buffer.alloc(64);
  Buffer.from(provided).copy(a, 0, 0, Math.min(provided.length, 64));
  Buffer.from(expected).copy(b, 0, 0, Math.min(expected.length, 64));

  return provided.length === expected.length && crypto.timingSafeEqual(a, b);
}
