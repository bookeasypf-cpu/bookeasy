-- Drop unique index on stripeCustomerId before dropping the column
DROP INDEX IF EXISTS "merchants_stripeCustomerId_key";

-- Drop Stripe columns from Merchant table
ALTER TABLE "merchants" DROP COLUMN IF EXISTS "stripeCustomerId";
ALTER TABLE "merchants" DROP COLUMN IF EXISTS "stripeSubscriptionId";
