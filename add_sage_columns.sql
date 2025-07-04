-- Migration pour ajouter les colonnes Sage à la table invoices
-- Exécution : psql ou via Supabase SQL Editor

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS sage_export_status VARCHAR(50) DEFAULT 'not_processed',
ADD COLUMN IF NOT EXISTS sage_export_details JSONB,
ADD COLUMN IF NOT EXISTS sage_export_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sage_transaction_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS sage_account_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS sage_validation_needed BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS sage_anomalies JSONB,
ADD COLUMN IF NOT EXISTS sage_processed_by UUID REFERENCES auth.users(id);

-- Index pour optimiser les requêtes sur le statut Sage
CREATE INDEX IF NOT EXISTS idx_invoices_sage_export_status ON public.invoices(sage_export_status);

-- Commentaires pour la documentation
COMMENT ON COLUMN public.invoices.sage_export_status IS 'Statut export Sage: not_processed, ai_processed, pending_validation, validated, exported, failed';
COMMENT ON COLUMN public.invoices.sage_export_details IS 'Données formatées par IA pour API Sage (JSON)';
COMMENT ON COLUMN public.invoices.sage_export_at IS 'Date/heure export vers Sage';
COMMENT ON COLUMN public.invoices.sage_transaction_id IS 'ID transaction retournée par API Sage';
COMMENT ON COLUMN public.invoices.sage_account_code IS 'Code compte comptable Sage assigné';
COMMENT ON COLUMN public.invoices.sage_validation_needed IS 'Nécessite validation admin avant export';
COMMENT ON COLUMN public.invoices.sage_anomalies IS 'Anomalies détectées par IA (JSON array)';
COMMENT ON COLUMN public.invoices.sage_processed_by IS 'ID utilisateur qui a traité/validé pour Sage';
