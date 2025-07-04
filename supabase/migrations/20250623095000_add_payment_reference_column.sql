-- Migration pour ajouter la colonne payment_reference à la table invoices

-- Ajouter la colonne payment_reference
ALTER TABLE "public"."invoices" ADD COLUMN "payment_reference" text;

-- Commentaires explicatifs
COMMENT ON COLUMN "public"."invoices"."payment_reference" IS 'Référence du paiement fournie par le prestataire de paiement';
