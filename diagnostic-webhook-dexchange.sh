#!/bin/bash

# Diagnostic complet des webhooks DExchange
# Ce script v# 4. Vérifier la connectivité réseau
echo "4. Test de connectivité réseau:"
echo "Ping vers supabase.co:"
ping -c 3 qlqgyrfqiflnqknbtycw.supabase.co
echo ""

# 5. Vérifier les DNS
echo "5. Résolution DNS:"
nslookup qlqgyrfqiflnqknbtycw.supabase.co
echo ""

# 6. Test de la fonction payment-status pour comparaison
echo "6. Test fonction payment-status (pour comparaison):"
curl -X POST "https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/payment-status" \iguration et teste la réception des webhooks

echo "=== DIAGNOSTIC WEBHOOKS DEXCHANGE ==="
echo "Date: $(date)"
echo ""

# 1. Vérifier l'URL de la fonction callback
CALLBACK_URL="https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/dexchange-callback-handler"
echo "1. Test de l'URL callback:"
echo "URL: $CALLBACK_URL"
echo ""

# Test de ping de base
echo "Test ping de base:"
curl -s -o /dev/null -w "Status: %{http_code} | Temps: %{time_total}s\n" "$CALLBACK_URL"
echo ""

# 2. Test avec méthode POST (comme DExchange)
echo "2. Test POST (simulation webhook DExchange):"
echo "Test sans authentification:"
curl -X POST "$CALLBACK_URL" \
  -H "Content-Type: application/json" \
  -d '{"test": "diagnostic", "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"}' \
  -w "Status: %{http_code} | Temps: %{time_total}s\n" \
  -s
echo ""

# 3. Test avec l'authorization header requis
echo "Test avec Authorization (simulé):"
curl -X POST "$CALLBACK_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"test": "diagnostic", "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"}' \
  -w "Status: %{http_code} | Temps: %{time_total}s\n" \
  -s
echo ""

# 4. Simuler un vrai webhook DExchange
echo "3. Simulation webhook DExchange réel:"
PAYMENT_ID="PAY_$(date +%s)"
WEBHOOK_PAYLOAD='{
  "event": "payment.completed",
  "data": {
    "id": "'$PAYMENT_ID'",
    "status": "completed",
    "amount": 1000,
    "currency": "XOF",
    "reference": "TEST_'$(date +%s)'",
    "created_at": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
    "completed_at": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"
  },
  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"
}'

echo "Payload simulé:"
echo "$WEBHOOK_PAYLOAD" | jq .
echo ""

echo "Envoi du webhook simulé:"
curl -X POST "$CALLBACK_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d "$WEBHOOK_PAYLOAD" \
  -w "Status: %{http_code} | Temps: %{time_total}s\n" \
  -v
echo ""

# 5. Vérifier la connectivité réseau
echo "4. Test de connectivité réseau:"
echo "Ping vers supabase.co:"
ping -c 3 kxnwtgxbnbxfzofkoppp.supabase.co
echo ""

# 6. Vérifier les DNS
echo "5. Résolution DNS:"
nslookup kxnwtgxbnbxfzofkoppp.supabase.co
echo ""

# 7. Test de la fonction payment-status pour comparaison
echo "6. Test fonction payment-status (pour comparaison):"
curl -X POST "https://kxnwtgxbnbxfzofkoppp.supabase.co/functions/v1/payment-status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"payment_id": "test"}' \
  -w "Status: %{http_code} | Temps: %{time_total}s\n" \
  -s
echo ""

echo "=== FIN DU DIAGNOSTIC ==="
echo ""
echo "RECOMMANDATIONS:"
echo "1. Vérifier que DExchange a la bonne URL de webhook configurée"
echo "2. Vérifier l'authentification/secret côté DExchange"
echo "3. Vérifier que DExchange envoie bien les webhooks (logs côté DExchange)"
echo "4. Considérer l'ajout d'un health check endpoint"
echo ""
