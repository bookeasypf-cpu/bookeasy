-- Add explicit CGU acceptance timestamp on users (RGPD Art. 7 + Code conso Art. L.221-11)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "acceptedCguAt" TIMESTAMP(3);
