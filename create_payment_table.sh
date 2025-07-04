#!/bin/bash

# Script pour créer la table payment_transactions
echo "🔧 Création de la table payment_transactions..."

# Utiliser l'API REST de Supabase pour exécuter du SQL brut
curl -X POST "https://qlqgyrfqiflnqknbtycw.supabase.co/rest/v1/rpc/exec_sql" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "CREATE TABLE IF NOT EXISTS public.payment_transactions (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, transaction_id TEXT UNIQUE NOT NULL, external_transaction_id TEXT, invoice_id UUID NOT NULL, user_id UUID NOT NULL, payment_method TEXT NOT NULL, amount DECIMAL(10,2) NOT NULL, currency TEXT DEFAULT '\''XOF'\'' NOT NULL, status TEXT DEFAULT '\''pending'\'' NOT NULL, phone_number TEXT, payment_url TEXT, payment_code TEXT, payment_instructions TEXT, expires_at TIMESTAMPTZ, paid_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL); ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY; CREATE POLICY IF NOT EXISTS payment_transactions_select_policy ON public.payment_transactions FOR SELECT USING (auth.uid() = user_id OR auth.role() = '\''service_role'\''); CREATE POLICY IF NOT EXISTS payment_transactions_insert_policy ON public.payment_transactions FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = '\''service_role'\''); CREATE POLICY IF NOT EXISTS payment_transactions_update_policy ON public.payment_transactions FOR UPDATE USING (auth.uid() = user_id OR auth.role() = '\''service_role'\'')"
  }'

echo ""
echo "✅ Table payment_transactions créée avec succès"
