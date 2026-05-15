-- Self-healing version: clean up any pre-existing duplicate XP rows BEFORE
-- creating the unique index. Without this DELETE, CREATE UNIQUE INDEX fails
-- on prod databases that already have legacy double-awards.
-- We keep the OLDEST row per (bookingId, userId, type) — the first award.

DELETE FROM "xp_transactions" a
USING "xp_transactions" b
WHERE a."createdAt" > b."createdAt"
  AND a."bookingId" IS NOT NULL
  AND a."bookingId" = b."bookingId"
  AND a."userId"    = b."userId"
  AND a."type"      = b."type";

-- Prevent double-XP races on the same booking + user + type.
-- PostgreSQL allows multiple rows where bookingId IS NULL, so referral and
-- gift-card XP transactions (which have no bookingId) are unaffected.
CREATE UNIQUE INDEX IF NOT EXISTS "xp_transactions_bookingId_userId_type_key"
  ON "xp_transactions"("bookingId", "userId", "type");
