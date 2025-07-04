#!/bin/bash
# test-sentiment-trigger.sh - Tester le trigger d'analyse de sentiment

echo "🧪 Test du trigger d'analyse de sentiment"
echo "========================================="

SUPABASE_URL="https://qlqgyrfqiflnqknbtycw.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDI0NTEsImV4cCI6MjA2NTY3ODQ1MX0.ODLjlo-8mvt_Y75LETySScpOQui-MaCBrszWRA2oyrE"

echo "📝 Vérification de la structure de la base de données..."

# Vérifier que les tables et triggers existent
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "
SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.event_object_table
FROM information_schema.triggers t 
WHERE t.trigger_name = 'on_new_ticket_message';
"

echo ""
echo "🔍 Vérification de la fonction trigger..."

psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "
SELECT 
    p.proname as function_name,
    p.prosrc as function_source
FROM pg_proc p 
WHERE p.proname = 'trigger_sentiment_analysis_on_new_message';
"

echo ""
echo "✅ Tests terminés - Structure vérifiée"
