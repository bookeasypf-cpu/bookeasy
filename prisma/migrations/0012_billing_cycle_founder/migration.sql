-- Ajout du cycle de facturation Pro (mensuel/annuel) et du flag tarif
-- fondateur (-15% à vie pour les 10 premiers commerçants Pro).
-- IF NOT EXISTS pour la ré-exécution idempotente sur prod.

ALTER TABLE "merchants"
  ADD COLUMN IF NOT EXISTS "billingCycle" TEXT,
  ADD COLUMN IF NOT EXISTS "isFounderPricing" BOOLEAN NOT NULL DEFAULT false;

-- Index sur isFounderPricing pour les requêtes "combien de slots restants"
-- (cron + pricing page). Filtré uniquement true via partial index pour
-- garder un coût d'écriture quasi nul sur les non-fondateurs.
CREATE INDEX IF NOT EXISTS "merchants_isFounderPricing_idx"
  ON "merchants"("isFounderPricing")
  WHERE "isFounderPricing" = true;
