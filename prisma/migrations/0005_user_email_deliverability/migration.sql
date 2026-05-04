-- Add email deliverability tracking fields, populated by Resend webhook
-- on email.bounced and email.complained events.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailBounced" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailComplained" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailLastEvent" TIMESTAMP(3);
