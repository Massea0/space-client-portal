-- Migration: Création de la table contracts pour la gestion intelligente des contrats
-- File: supabase/migrations/20250629000001_create_contracts_table.sql
-- Mission 1: AI-Powered Contract Lifecycle Management

-- Création de la table contracts
CREATE TABLE public.contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Relations
    client_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    devis_id UUID REFERENCES public.devis(id) ON DELETE SET NULL,
    
    -- Informations de base
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    object TEXT NOT NULL,
    
    -- Statut et cycle de vie
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN (
        'draft',           -- Brouillon généré par IA
        'review',          -- En cours de révision
        'pending_client',  -- En attente de signature client
        'signed',          -- Signé et actif
        'expired',         -- Expiré
        'terminated',      -- Résilié
        'renewed'          -- Renouvelé
    )),
    
    -- Durée et dates
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    renewal_date DATE,
    signature_date DATE,
    
    -- Financier
    amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) DEFAULT 'XOF' NOT NULL,
    payment_terms VARCHAR(100), -- "Mensuel", "Trimestriel", etc.
    
    -- Stockage du contenu
    content_storage_url TEXT, -- URL vers Supabase Storage
    content_preview TEXT,     -- Prévisualisation courte
    
    -- Analyse IA des clauses
    clauses_summary JSONB DEFAULT '{}', -- Synthèse des clauses importantes
    risk_analysis JSONB DEFAULT '{}',   -- Analyse des risques par IA
    compliance_score INTEGER DEFAULT 0 CHECK (compliance_score >= 0 AND compliance_score <= 100),
    
    -- Type de contrat
    contract_type VARCHAR(50) DEFAULT 'service' CHECK (contract_type IN (
        'service',
        'maintenance',
        'consulting',
        'licensing',
        'partnership',
        'other'
    )),
    
    -- Obligations et monitoring
    obligations_monitoring JSONB DEFAULT '{}', -- Suivi des obligations
    next_review_date DATE,
    auto_renewal BOOLEAN DEFAULT FALSE,
    
    -- Métadonnées
    generated_by_ai BOOLEAN DEFAULT TRUE,
    ai_confidence_score INTEGER DEFAULT 0 CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 100),
    template_used VARCHAR(100),
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    last_modified_by UUID REFERENCES auth.users(id)
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_contracts_client_id ON public.contracts(client_id);
CREATE INDEX idx_contracts_devis_id ON public.contracts(devis_id);
CREATE INDEX idx_contracts_status ON public.contracts(status);
CREATE INDEX idx_contracts_dates ON public.contracts(start_date, end_date);
CREATE INDEX idx_contracts_renewal ON public.contracts(renewal_date) WHERE auto_renewal = TRUE;
CREATE INDEX idx_contracts_review ON public.contracts(next_review_date);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_contracts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.last_modified_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contracts_updated_at
    BEFORE UPDATE ON public.contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_contracts_updated_at();

-- Fonction pour générer un numéro de contrat unique
CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part TEXT;
    sequence_part INTEGER;
    new_number TEXT;
BEGIN
    -- Générer le numéro basé sur l'année courante
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Trouver le prochain numéro de séquence pour l'année
    SELECT COALESCE(MAX(
        CAST(
            SUBSTRING(contract_number FROM 'CT-' || year_part || '-(.*)') 
            AS INTEGER
        )
    ), 0) + 1
    INTO sequence_part
    FROM public.contracts
    WHERE contract_number LIKE 'CT-' || year_part || '-%';
    
    -- Formater le numéro final
    new_number := 'CT-' || year_part || '-' || LPAD(sequence_part::TEXT, 4, '0');
    
    NEW.contract_number := new_number;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_contract_number_trigger
    BEFORE INSERT ON public.contracts
    FOR EACH ROW
    WHEN (NEW.contract_number IS NULL)
    EXECUTE FUNCTION generate_contract_number();

-- Politiques RLS (Row Level Security)
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Les clients peuvent voir leurs propres contrats
CREATE POLICY "Clients can view their own contracts"
ON public.contracts
FOR SELECT
USING (
    client_id = (
        SELECT company_id FROM public.users 
        WHERE id = auth.uid()
    )
);

-- Les clients peuvent mettre à jour le statut de leurs contrats (signature)
CREATE POLICY "Clients can update their contract status"
ON public.contracts
FOR UPDATE
USING (
    client_id = (
        SELECT company_id FROM public.users 
        WHERE id = auth.uid()
    )
)
WITH CHECK (
    client_id = (
        SELECT company_id FROM public.users 
        WHERE id = auth.uid()
    )
    AND status IN ('signed', 'terminated') -- Seuls certains statuts autorisés
);

-- Les admins peuvent tout gérer
CREATE POLICY "Admins can manage all contracts"
ON public.contracts
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- Politique pour les Edge Functions (service_role)
CREATE POLICY "Service role can manage all contracts"
ON public.contracts
FOR ALL
USING (auth.role() = 'service_role');

-- Commentaires pour la documentation
COMMENT ON TABLE public.contracts IS 'Table pour la gestion intelligente des contrats et accords clients avec IA';
COMMENT ON COLUMN public.contracts.clauses_summary IS 'Synthèse automatique des clauses par IA (JSON)';
COMMENT ON COLUMN public.contracts.risk_analysis IS 'Analyse des risques contractuels par IA (JSON)';
COMMENT ON COLUMN public.contracts.compliance_score IS 'Score de conformité calculé par IA (0-100)';
COMMENT ON COLUMN public.contracts.obligations_monitoring IS 'Suivi automatique des obligations contractuelles (JSON)';

-- Vérification de création
SELECT 'Table contracts créée avec succès!' as message;
