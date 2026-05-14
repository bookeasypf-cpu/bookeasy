-- Prevent double-XP races on the same booking + user + type.
-- PostgreSQL allows multiple rows where bookingId IS NULL, so referral and
-- gift-card XP transactions (which have no bookingId) are unaffected.
CREATE UNIQUE INDEX IF NOT EXISTS "xp_transactions_bookingId_userId_type_key"
  ON "xp_transactions"("bookingId", "userId", "type");
