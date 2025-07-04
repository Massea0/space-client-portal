-- Migration pour la table de logs d'activité client
-- Fichier: 20250627000003_add_client_activity_logs.sql
-- Mission 3: Support Prédictif et Tickets Proactifs

-- Création de la table public.client_activity_logs
CREATE TABLE public.client_activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'page_view',
        'faq_search', 
        'form_error',
        'service_access',
        'login_attempt',
        'login_failed',
        'support_search',
        'ticket_view',
        'error_occurred',
        'timeout_occurred'
    )),
    details JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes fréquentes
CREATE INDEX idx_client_activity_user_time ON public.client_activity_logs (user_id, timestamp DESC);
CREATE INDEX idx_client_activity_type ON public.client_activity_logs (activity_type);
CREATE INDEX idx_client_activity_timestamp ON public.client_activity_logs (timestamp DESC);

-- Politique RLS pour sécuriser les données
ALTER TABLE public.client_activity_logs ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres logs
CREATE POLICY "Users can view their own activity logs"
ON public.client_activity_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Les admins peuvent voir tous les logs
CREATE POLICY "Admins can view all activity logs"
ON public.client_activity_logs
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- Le système peut insérer des logs (service_role)
CREATE POLICY "System can insert activity logs"
ON public.client_activity_logs
FOR INSERT
WITH CHECK (true);

-- Trigger pour nettoyer automatiquement les anciens logs (garde 30 jours)
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM public.client_activity_logs 
    WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ajout d'une colonne pour les tickets proactifs
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS is_proactive BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS proactive_analysis JSONB DEFAULT NULL;

-- Commentaires pour la documentation
COMMENT ON TABLE public.client_activity_logs IS 'Logs des activités client pour analyse prédictive IA';
COMMENT ON COLUMN public.client_activity_logs.activity_type IS 'Type d''activité: page_view, faq_search, form_error, etc.';
COMMENT ON COLUMN public.client_activity_logs.details IS 'Données contextuelles en JSON';
COMMENT ON COLUMN public.tickets.is_proactive IS 'Ticket créé proactivement par l''IA';
COMMENT ON COLUMN public.tickets.proactive_analysis IS 'Analyse IA ayant conduit à la création du ticket';
