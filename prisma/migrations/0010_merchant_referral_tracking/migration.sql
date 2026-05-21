-- Merchant-to-merchant referral tracking for K-factor analytics.
-- ON DELETE SET NULL so deleting the referrer never cascades to wipe the
-- referee's account (would be both a UX disaster and an RGPD violation).
-- IF NOT EXISTS keeps this idempotent in case it's partially applied.

ALTER TABLE "merchants"
  ADD COLUMN IF NOT EXISTS "referredByMerchantId" TEXT;

CREATE INDEX IF NOT EXISTS "merchants_referredByMerchantId_idx"
  ON "merchants"("referredByMerchantId");

-- Self-referential FK; guard against re-adding it.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'merchants_referredByMerchantId_fkey'
  ) THEN
    ALTER TABLE "merchants"
      ADD CONSTRAINT "merchants_referredByMerchantId_fkey"
      FOREIGN KEY ("referredByMerchantId") REFERENCES "merchants"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
