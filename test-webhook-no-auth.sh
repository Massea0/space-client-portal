#!/bin/bash

# Test spécifique de la fonction dexchange-callback-handler 
# sans authentification JWT (comme DExchange l'enverrait)

echo "=== TEST WEBHOOK DEXCHANGE SANS AUTH ==="
echo "Date: $(date)"
echo ""

CALLBACK_URL="https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/dexchange-callback-handler"

# 1. Test de ping (body vide)
echo "1. Test ping (body vide):"
curl -X POST "$CALLBACK_URL" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w "\nStatus: %{http_code} | Temps: %{time_total}s\n" \
  -s
echo ""

# 2. Test avec webhook simulé sans auth
echo "2. Test webhook DExchange (format réel, sans auth):"
PAYMENT_ID="PAY_$(date +%s)"
WEBHOOK_PAYLOAD='{
  "event": "payment.completed",
  "data": {
    "object": {
      "id": "'$PAYMENT_ID'",
      "status": "succeeded",
      "amount": 1000,
      "currency": "XOF",
      "metadata": {
        "invoice_id": "INV_TEST_'$(date +%s)'"
      }
    }
  },
  "type": "payment.completed"
}'

echo "Payload:"
echo "$WEBHOOK_PAYLOAD" | jq .
echo ""

curl -X POST "$CALLBACK_URL" \
  -H "Content-Type: application/json" \
  -H "x-dexchange-signature: fake-signature-for-test" \
  -d "$WEBHOOK_PAYLOAD" \
  -w "\nStatus: %{http_code} | Temps: %{time_total}s\n" \
  -v
echo ""

# 3. Test avec secret webhook (si configuré)
echo "3. Test avec secret webhook potentiel:"
curl -X POST "$CALLBACK_URL" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: test-secret" \
  -d "$WEBHOOK_PAYLOAD" \
  -w "\nStatus: %{http_code} | Temps: %{time_total}s\n" \
  -s
echo ""

echo "=== ANALYSE ==="
echo "Si toutes les réponses sont 401 'Invalid JWT',"
echo "cela signifie que Supabase requiert une auth pour cette fonction."
echo "Il faudra configurer la fonction comme 'public' ou sans auth requise."
