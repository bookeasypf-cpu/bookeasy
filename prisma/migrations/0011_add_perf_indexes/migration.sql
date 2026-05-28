-- Sprint 1 performance indexes flagged by MANA audit.
-- All CREATE INDEX statements use IF NOT EXISTS for idempotent reruns.

-- merchant_photos: queries always filter by merchantId. No index → seq scan
-- once a merchant uploads more than ~5 photos and the table grows.
CREATE INDEX IF NOT EXISTS "merchant_photos_merchantId_idx"
  ON "merchant_photos"("merchantId");

-- bookings: /api/marketing/stats and analytics filter on createdAt windows
-- combined with status. Without this index every cron tick does a seq scan.
CREATE INDEX IF NOT EXISTS "bookings_createdAt_status_idx"
  ON "bookings"("createdAt", "status");

-- gift_cards: createBooking/cancelBooking/IPN all read with
-- WHERE status = 'ACTIVE' AND expiresAt > now(). Composite covers both predicates.
CREATE INDEX IF NOT EXISTS "gift_cards_status_expiresAt_idx"
  ON "gift_cards"("status", "expiresAt");

-- gift_cards: the @unique on code already creates a unique B-tree.
-- The redundant explicit index doubled write cost. Drop if present.
DROP INDEX IF EXISTS "gift_cards_code_idx";

-- webhook_events: GDPR cleanup cron deletes rows older than 90 days.
-- Without this the delete walks the whole table.
CREATE INDEX IF NOT EXISTS "webhook_events_createdAt_idx"
  ON "webhook_events"("createdAt");
