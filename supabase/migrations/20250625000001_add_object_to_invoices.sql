-- Migration pour ajouter le champ 'object' à la table invoices
ALTER TABLE "public"."invoices" ADD COLUMN IF NOT EXISTS "object" text;

-- Remplir le champ pour les factures existantes avec une valeur par défaut
UPDATE "public"."invoices" SET "object" = CONCAT('Facture ', "number") WHERE "object" IS NULL;
