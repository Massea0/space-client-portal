-- Migration: Create AI tables for payment predictions and quote optimizations
-- File: supabase/migrations/20250627_create_ai_tables.sql

-- Table pour stocker les prédictions de paiement
CREATE TABLE IF NOT EXISTS payment_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    prediction_data JSONB NOT NULL,
    model_version TEXT NOT NULL DEFAULT 'gpt-4-v1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Table pour stocker les optimisations de devis
CREATE TABLE IF NOT EXISTS quote_optimizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES devis(id) ON DELETE CASCADE,
    optimization_data JSONB NOT NULL,
    model_version TEXT NOT NULL DEFAULT 'gpt-4-v1',
    applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Table pour stocker les alertes et recommandations IA
CREATE TABLE IF NOT EXISTS ai_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('payment_reminder', 'quote_optimization', 'client_analysis', 'revenue_prediction')),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('invoice', 'quote', 'company', 'global')),
    entity_id UUID,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'resolved')),
    created_for UUID REFERENCES auth.users(id), -- Utilisateur pour qui l'alerte est destinée
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Table pour l'analyse comportementale des clients
CREATE TABLE IF NOT EXISTS client_behavior_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    analysis_data JSONB NOT NULL,
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    predicted_ltv DECIMAL(15,2), -- Customer Lifetime Value
    model_version TEXT NOT NULL DEFAULT 'gpt-4-v1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_payment_predictions_invoice_id ON payment_predictions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_predictions_created_at ON payment_predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_optimizations_quote_id ON quote_optimizations(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_optimizations_created_at ON quote_optimizations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_alerts_entity ON ai_alerts(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_ai_alerts_status ON ai_alerts(status);
CREATE INDEX IF NOT EXISTS idx_ai_alerts_created_for ON ai_alerts(created_for);
CREATE INDEX IF NOT EXISTS idx_client_behavior_company_id ON client_behavior_analysis(company_id);

-- Fonctions pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_payment_predictions_updated_at 
    BEFORE UPDATE ON payment_predictions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quote_optimizations_updated_at 
    BEFORE UPDATE ON quote_optimizations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_behavior_analysis_updated_at 
    BEFORE UPDATE ON client_behavior_analysis 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) pour sécuriser l'accès aux données IA
ALTER TABLE payment_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_behavior_analysis ENABLE ROW LEVEL SECURITY;

-- Politique pour payment_predictions
CREATE POLICY "Users can view payment predictions for their company invoices" ON payment_predictions
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            -- Admin peut voir tout
            (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
            OR
            -- Client ne peut voir que les prédictions de ses factures
            EXISTS (
                SELECT 1 FROM invoices i 
                INNER JOIN users u ON u.company_id = i.company_id 
                WHERE i.id = payment_predictions.invoice_id 
                AND u.id = auth.uid()
            )
        )
    );

-- Politique pour quote_optimizations
CREATE POLICY "Users can view quote optimizations for their company quotes" ON quote_optimizations
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            -- Admin peut voir tout
            (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
            OR
            -- Client ne peut voir que les optimisations de ses devis
            EXISTS (
                SELECT 1 FROM devis d 
                INNER JOIN users u ON u.company_id = d.company_id 
                WHERE d.id = quote_optimizations.quote_id 
                AND u.id = auth.uid()
            )
        )
    );

-- Politique pour ai_alerts
CREATE POLICY "Users can view their AI alerts" ON ai_alerts
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            created_for = auth.uid()
            OR 
            (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
        )
    );

-- Politique pour client_behavior_analysis
CREATE POLICY "Admins can view all client behavior analysis" ON client_behavior_analysis
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

-- Politique pour permettre aux admins de créer/modifier les données IA
CREATE POLICY "Admins can manage AI data" ON payment_predictions
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Admins can manage quote optimizations" ON quote_optimizations
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Admins can manage AI alerts" ON ai_alerts
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Admins can manage client behavior analysis" ON client_behavior_analysis
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

-- Fonction pour générer automatiquement des alertes basées sur les prédictions
CREATE OR REPLACE FUNCTION generate_payment_alert()
RETURNS TRIGGER AS $$
DECLARE
    prediction_data JSONB;
    risk_level TEXT;
    invoice_record RECORD;
BEGIN
    prediction_data := NEW.prediction_data;
    risk_level := prediction_data->>'riskLevel';
    
    -- Récupérer les détails de la facture
    SELECT i.*, c.name as company_name 
    INTO invoice_record
    FROM invoices i 
    JOIN companies c ON c.id = i.company_id 
    WHERE i.id = NEW.invoice_id;
    
    -- Créer une alerte si le risque est élevé
    IF risk_level IN ('high', 'medium') THEN
        INSERT INTO ai_alerts (
            type,
            entity_type,
            entity_id,
            title,
            message,
            data,
            priority,
            created_for
        ) VALUES (
            'payment_reminder',
            'invoice',
            NEW.invoice_id,
            'Risque de retard de paiement détecté',
            'La facture ' || invoice_record.number || ' de ' || invoice_record.company_name || 
            ' présente un risque ' || risk_level || ' de retard de paiement.',
            jsonb_build_object(
                'invoice_id', NEW.invoice_id,
                'prediction_data', prediction_data,
                'invoice_amount', invoice_record.amount
            ),
            CASE WHEN risk_level = 'high' THEN 'high' ELSE 'medium' END,
            (SELECT id FROM users WHERE role = 'admin' LIMIT 1) -- Pour simplicité, assigner au premier admin
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement des alertes
CREATE TRIGGER trigger_generate_payment_alert
    AFTER INSERT ON payment_predictions
    FOR EACH ROW EXECUTE FUNCTION generate_payment_alert();

-- Commentaires pour la documentation
COMMENT ON TABLE payment_predictions IS 'Stockage des prédictions IA pour les paiements de factures';
COMMENT ON TABLE quote_optimizations IS 'Stockage des optimisations IA pour les devis';
COMMENT ON TABLE ai_alerts IS 'Système d''alertes générées par l''IA pour actions proactives';
COMMENT ON TABLE client_behavior_analysis IS 'Analyse comportementale IA des clients pour prédictions LTV';
