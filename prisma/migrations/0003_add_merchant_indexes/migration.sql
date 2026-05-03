-- Add critical indexes for Merchant table to support common query patterns
-- isActive: filtered on EVERY public listing query (search, sectors, map, list)
-- (plan, planExpiresAt): expire-subscriptions cron filter
-- (isActive, sectorId): search/sectors page combined filter

CREATE INDEX IF NOT EXISTS "merchants_isActive_idx" ON "merchants"("isActive");
CREATE INDEX IF NOT EXISTS "merchants_isActive_sectorId_idx" ON "merchants"("isActive", "sectorId");
CREATE INDEX IF NOT EXISTS "merchants_plan_planExpiresAt_idx" ON "merchants"("plan", "planExpiresAt");
