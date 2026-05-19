-- Reminders cron speedup: composite index on the exact WHERE clause
-- used by /api/cron/reminders (date + status + reminderSentAt IS NULL).
-- IF NOT EXISTS keeps the migration idempotent so reruns are safe.
CREATE INDEX IF NOT EXISTS "bookings_date_status_reminderSentAt_idx"
  ON "bookings"("date", "status", "reminderSentAt");
