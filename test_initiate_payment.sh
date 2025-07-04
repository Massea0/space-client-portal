#!/bin/bash

# Script de test pour vérifier l'Edge Function initiate-payment

echo "🧪 Test de l'Edge Function initiate-payment..."

# Configuration
SUPABASE_URL="https://qlqgyrfqiflnqknbtycw.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDI0NTEsImV4cCI6MjA2NTY3ODQ1MX0.ODLjlo-8mvt_Y75LETySScpOQui-MaCBrszWRA2oyrE"

# Payload de test avec un ID facture existant
PAYLOAD='{
  "invoice_id": "550e8400-e29b-41d4-a716-446655440000",
  "payment_method": "wave",
  "phone_number": "221777777777"
}'

echo "📡 Envoi de la requête à l'Edge Function..."
echo "URL: ${SUPABASE_URL}/functions/v1/initiate-payment"
echo "Payload: $PAYLOAD"
echo ""

# Appel à l'Edge Function
curl -X POST \
  "${SUPABASE_URL}/functions/v1/initiate-payment" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -d "$PAYLOAD" \
  -v 2>&1 | head -50

echo ""
echo "✅ Test terminé. Vérifiez les logs dans le dashboard Supabase:"
echo "   https://supabase.com/dashboard/project/qlqgyrfqiflnqknbtycw/functions/initiate-payment"
