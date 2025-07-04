-- Migration pour ajouter la colonne currency à la table invoices
-- Cette colonne est nécessaire pour supporter les paiements multi-devises

ALTER TABLE invoices 
ADD COLUMN currency TEXT DEFAULT 'XOF' NOT NULL;

-- Ajouter un commentaire pour documenter
COMMENT ON COLUMN invoices.currency IS 'Code devise ISO 4217 (XOF, EUR, USD, etc.)';

-- Créer un index pour optimiser les requêtes par devise
CREATE INDEX idx_invoices_currency ON invoices(currency);

-- Mettre à jour les factures existantes qui n'ont pas de devise
UPDATE invoices 
SET currency = 'XOF' 
WHERE currency IS NULL;
