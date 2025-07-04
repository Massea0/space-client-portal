-- Migration: Mise en place du système d'analyse de sentiment automatique pour les tickets
-- Date: 2025-06-27
-- Description: Ajoute un trigger pour analyser automatiquement le sentiment des nouveaux messages de tickets

-- 1. Créer le type ENUM pour la priorité des tickets (si pas déjà existant)
-- Note: La table tickets utilise déjà des contraintes CHECK, nous allons les conserver

-- 2. S'assurer que l'extension pg_net est disponible pour les appels HTTP
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 3. Créer la fonction de trigger pour l'analyse de sentiment
CREATE OR REPLACE FUNCTION public.trigger_sentiment_analysis_on_new_message()
RETURNS TRIGGER AS $$
DECLARE
    supabase_url TEXT;
    supabase_anon_key TEXT;
    function_url TEXT;
    payload JSONB;
    response_id BIGINT;
BEGIN
    -- Récupérer l'URL et la clé depuis les variables d'environnement ou configuration
    -- En production, ces valeurs seront définies dans les secrets Supabase
    supabase_url := current_setting('app.settings.supabase_url', true);
    supabase_anon_key := current_setting('app.settings.supabase_anon_key', true);
    
    -- Si les paramètres ne sont pas définis, utiliser des valeurs par défaut
    -- (à configurer selon votre environnement)
    IF supabase_url IS NULL OR supabase_url = '' THEN
        supabase_url := 'https://qlqgyrfqiflnqknbtycw.supabase.co';
    END IF;
    
    IF supabase_anon_key IS NULL OR supabase_anon_key = '' THEN
        -- Cette clé devra être configurée dans les secrets Supabase
        supabase_anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDI0NTEsImV4cCI6MjA2NTY3ODQ1MX0.ODLjlo-8mvt_Y75LETySScpOQui-MaCBrszWRA2oyrE';
    END IF;
    
    -- Construire l'URL de la fonction Edge
    function_url := supabase_url || '/functions/v1/ticket-sentiment-analysis';
    
    -- Préparer le payload JSON
    payload := jsonb_build_object(
        'ticketId', NEW.ticket_id,
        'messageContent', NEW.content,
        'messageId', NEW.id
    );
    
    -- Log pour debug
    RAISE LOG 'Triggering sentiment analysis for ticket % with message %', NEW.ticket_id, NEW.id;
    
    -- Appel asynchrone à l'Edge Function via pg_net
    SELECT net.http_post(
        url := function_url,
        body := payload,
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || supabase_anon_key
        )
    ) INTO response_id;
    
    -- Log du response_id pour suivi
    RAISE LOG 'Sentiment analysis request sent with response_id: %', response_id;
    
    -- Retourner NEW pour continuer le processus d'insertion
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    -- En cas d'erreur, log l'erreur mais ne pas faire échouer l'insertion du message
    RAISE WARNING 'Failed to trigger sentiment analysis for ticket %: %', NEW.ticket_id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Créer le trigger sur la table ticket_messages
DROP TRIGGER IF EXISTS on_new_ticket_message ON public.ticket_messages;

CREATE TRIGGER on_new_ticket_message
    AFTER INSERT ON public.ticket_messages
    FOR EACH ROW 
    EXECUTE FUNCTION public.trigger_sentiment_analysis_on_new_message();

-- 5. Créer une fonction utilitaire pour configurer les paramètres
CREATE OR REPLACE FUNCTION public.configure_sentiment_analysis_settings(
    p_supabase_url TEXT,
    p_supabase_anon_key TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Configurer les paramètres pour l'analyse de sentiment
    PERFORM set_config('app.settings.supabase_url', p_supabase_url, false);
    PERFORM set_config('app.settings.supabase_anon_key', p_supabase_anon_key, false);
    
    RAISE NOTICE 'Sentiment analysis settings configured successfully';
END;
$$ LANGUAGE plpgsql;

-- 6. Ajouter des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_tickets_priority_status ON public.tickets(priority, status);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON public.ticket_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_content ON public.ticket_messages(ticket_id, created_at);

-- 7. Commentaires pour documentation
COMMENT ON FUNCTION public.trigger_sentiment_analysis_on_new_message() IS 
'Fonction trigger qui analyse automatiquement le sentiment des nouveaux messages de tickets et met à jour la priorité du ticket correspondant via l''Edge Function ticket-sentiment-analysis';

COMMENT ON TRIGGER on_new_ticket_message ON public.ticket_messages IS 
'Trigger qui déclenche l''analyse de sentiment automatique pour chaque nouveau message de ticket';

-- 8. Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION public.trigger_sentiment_analysis_on_new_message() TO postgres;
GRANT EXECUTE ON FUNCTION public.configure_sentiment_analysis_settings(TEXT, TEXT) TO postgres;

-- Message de confirmation
SELECT 'Migration terminée: Système d''analyse de sentiment automatique configuré' AS status;
