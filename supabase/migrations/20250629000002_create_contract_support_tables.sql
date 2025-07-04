-- Migration: Création des tables supplémentaires pour les contrats
-- File: supabase/migrations/20250629000002_create_contract_support_tables.sql
-- Mission 1: Tables d'alertes et de templates pour les contrats

-- Table pour les alertes contractuelles
CREATE TABLE public.contract_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Relation avec le contrat
    contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    
    -- Type et sévérité de l'alerte
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN (
        'contract_expired',
        'contract_expiring_soon', 
        'contract_expiring',
        'renewal_overdue',
        'renewal_due_soon',
        'overdue_payments',
        'obligations_at_risk',
        'low_compliance_score',
        'manual_review_required'
    )),
    
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Contenu de l'alerte
    message TEXT NOT NULL,
    due_date DATE,
    
    -- Détails et métadonnées
    details JSONB DEFAULT '{}',
    
    -- Statut de l'alerte
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
    
    -- Horodatage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Qui a traité l'alerte
    acknowledged_by UUID REFERENCES auth.users(id),
    resolved_by UUID REFERENCES auth.users(id)
);

-- Table pour les templates de contrats
CREATE TABLE public.contract_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Informations de base
    name VARCHAR(200) NOT NULL,
    description TEXT,
    contract_type VARCHAR(50) NOT NULL CHECK (contract_type IN (
        'service', 'maintenance', 'consulting', 'license', 'partnership', 'other'
    )),
    
    -- Contenu du template
    template_content TEXT NOT NULL,
    
    -- Clauses par défaut (JSON)
    default_clauses JSONB DEFAULT '{}',
    
    -- Métadonnées IA
    ai_optimized BOOLEAN DEFAULT false,
    compliance_verified BOOLEAN DEFAULT false,
    
    -- Statut
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false, -- Un seul template par défaut par type
    
    -- Versioning
    version INTEGER DEFAULT 1,
    parent_template_id UUID REFERENCES public.contract_templates(id),
    
    -- Horodatage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    
    -- Contraintes
    UNIQUE(contract_type, is_default) DEFERRABLE INITIALLY DEFERRED
);

-- Table pour les obligations contractuelles détaillées
CREATE TABLE public.contract_obligations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Relation avec le contrat
    contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    
    -- Informations de l'obligation
    party VARCHAR(20) NOT NULL CHECK (party IN ('client', 'provider', 'both')),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    
    -- Échéances
    due_date DATE,
    reminder_days INTEGER DEFAULT 7, -- Rappel X jours avant
    
    -- Statut et suivi
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'completed', 'overdue', 'cancelled', 'deferred'
    )),
    
    -- Priorité
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    
    -- Métadonnées
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern VARCHAR(50), -- 'monthly', 'quarterly', 'yearly'
    auto_check BOOLEAN DEFAULT false, -- Vérification automatique possible
    
    -- Détails de completion
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES auth.users(id),
    completion_notes TEXT,
    
    -- Rappels
    last_reminder_sent TIMESTAMP WITH TIME ZONE,
    reminder_count INTEGER DEFAULT 0,
    
    -- Horodatage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index pour les performances
CREATE INDEX idx_contract_alerts_contract_id ON public.contract_alerts(contract_id);
CREATE INDEX idx_contract_alerts_status ON public.contract_alerts(status);
CREATE INDEX idx_contract_alerts_severity ON public.contract_alerts(severity);
CREATE INDEX idx_contract_alerts_alert_type ON public.contract_alerts(alert_type);
CREATE INDEX idx_contract_alerts_due_date ON public.contract_alerts(due_date);

CREATE INDEX idx_contract_templates_type ON public.contract_templates(contract_type);
CREATE INDEX idx_contract_templates_active ON public.contract_templates(is_active);
CREATE INDEX idx_contract_templates_default ON public.contract_templates(is_default);

CREATE INDEX idx_contract_obligations_contract_id ON public.contract_obligations(contract_id);
CREATE INDEX idx_contract_obligations_status ON public.contract_obligations(status);
CREATE INDEX idx_contract_obligations_due_date ON public.contract_obligations(due_date);
CREATE INDEX idx_contract_obligations_party ON public.contract_obligations(party);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contract_alerts_updated_at 
    BEFORE UPDATE ON public.contract_alerts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contract_templates_updated_at 
    BEFORE UPDATE ON public.contract_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contract_obligations_updated_at 
    BEFORE UPDATE ON public.contract_obligations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS pour contract_alerts
ALTER TABLE public.contract_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all contract alerts" ON public.contract_alerts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can view alerts for their company contracts" ON public.contract_alerts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.contracts c
            JOIN public.users u ON u.company_id = c.client_id
            WHERE c.id = contract_alerts.contract_id 
            AND u.id = auth.uid()
        )
    );

-- Politiques RLS pour contract_templates
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all contract templates" ON public.contract_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can view active templates" ON public.contract_templates
    FOR SELECT USING (is_active = true);

-- Politiques RLS pour contract_obligations
ALTER TABLE public.contract_obligations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all contract obligations" ON public.contract_obligations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can view obligations for their company contracts" ON public.contract_obligations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.contracts c
            JOIN public.users u ON u.company_id = c.client_id
            WHERE c.id = contract_obligations.contract_id 
            AND u.id = auth.uid()
        )
    );

-- Insertion de templates de base
INSERT INTO public.contract_templates (name, description, contract_type, template_content, default_clauses, is_default, ai_optimized) VALUES
(
    'Contrat de Services Informatiques Standard',
    'Template standard pour les contrats de services informatiques selon le droit OHADA',
    'service',
    '<h1>CONTRAT DE SERVICES INFORMATIQUES</h1>
    <h2>ENTRE</h2>
    <p><strong>ARCADIS TECH</strong>, société de droit sénégalais...</p>
    <h2>ET</h2>
    <p><strong>{{CLIENT_NAME}}</strong>, société...</p>
    <h2>Article 1 - OBJET</h2>
    <p>{{CONTRACT_OBJECT}}</p>
    <h2>Article 2 - PRESTATIONS</h2>
    <p>{{SERVICES_DETAILS}}</p>
    <h2>Article 3 - PRIX ET MODALITÉS DE PAIEMENT</h2>
    <p>Le montant total du présent contrat s''élève à {{AMOUNT}} FCFA...</p>',
    '{
        "service_clauses": ["Définition des prestations", "Modalités d''exécution", "Délais de livraison"],
        "payment_clauses": ["Prix ferme et définitif", "Facturation mensuelle", "Pénalités de retard"],
        "confidentiality_clauses": ["Non-divulgation", "Protection des données", "Propriété intellectuelle"],
        "liability_clauses": ["Limitation de responsabilité", "Assurance professionnelle", "Force majeure"],
        "termination_clauses": ["Résiliation pour faute", "Préavis", "Transfert des données"]
    }',
    true,
    true
),
(
    'Contrat de Maintenance Informatique',
    'Template pour les contrats de maintenance et support technique',
    'maintenance',
    '<h1>CONTRAT DE MAINTENANCE INFORMATIQUE</h1>
    <h2>Article 1 - OBJET</h2>
    <p>Maintenance préventive et corrective des systèmes informatiques...</p>',
    '{
        "service_clauses": ["Maintenance préventive", "Support technique", "Temps de réponse"],
        "payment_clauses": ["Forfait mensuel", "Interventions exceptionnelles"],
        "liability_clauses": ["Garantie de disponibilité", "Sauvegardes"]
    }',
    true,
    true
);

-- Commentaires sur les tables
COMMENT ON TABLE public.contract_alerts IS 'Alertes et notifications automatiques pour le suivi des contrats';
COMMENT ON TABLE public.contract_templates IS 'Templates réutilisables pour la génération de contrats';
COMMENT ON TABLE public.contract_obligations IS 'Suivi détaillé des obligations contractuelles';

COMMENT ON COLUMN public.contract_alerts.alert_type IS 'Type d''alerte pour classification et traitement automatique';
COMMENT ON COLUMN public.contract_alerts.severity IS 'Niveau de priorité pour le triage des alertes';
COMMENT ON COLUMN public.contract_templates.ai_optimized IS 'Template optimisé par IA pour la conformité légale';
COMMENT ON COLUMN public.contract_obligations.auto_check IS 'Obligation vérifiable automatiquement par le système';
