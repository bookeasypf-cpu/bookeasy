-- Add reminderSentAt to Booking to prevent double-sending reminders
-- when the cron retries on transient failure or is invoked twice.

ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "reminderSentAt" TIMESTAMP(3);
