#!/bin/bash
# test-ai-functions.sh - Test des fonctions IA avec curl

echo "🚀 Test des fonctions IA avec curl"
echo "=================================="

SUPABASE_URL="https://qlqgyrfqiflnqknbtycw.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDI0NTEsImV4cCI6MjA2NTY3ODQ1MX0.ODLjlo-8mvt_Y75LETySScpOQui-MaCBrszWRA2oyrE"

echo "🧠 Test 1: Prédiction de paiement IA"
echo "-----------------------------------"
curl -X POST \
  "$SUPABASE_URL/functions/v1/ai-payment-prediction" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"invoiceId": "550e8400-e29b-41d4-a716-446655440000"}' \
  -w "\n\nStatus: %{http_code}\n"

echo ""
echo "🧠 Test 2: Optimisation de devis IA"
echo "-----------------------------------"
curl -X POST \
  "$SUPABASE_URL/functions/v1/ai-quote-optimization" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"quoteId": "550e8400-e29b-41d4-a716-446655440001"}' \
  -w "\n\nStatus: %{http_code}\n"

echo ""
echo "✅ Tests terminés"
