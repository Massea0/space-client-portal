#!/bin/bash

# Script de test complet pour la fonction dexchange-callback-handler
# sans authentification JWT

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# URL de la fonction et configuration
SUPABASE_URL="https://qlqgyrfqiflnqknbtycw.supabase.co"
WEBHOOK_URL="$SUPABASE_URL/functions/v1/dexchange-callback-handler"
WEBHOOK_SECRET="dexchange-webhooks-secret-2025" # Doit correspondre à DEXCHANGE_WEBHOOK_SECRET

# Générer des IDs uniques pour les tests
INVOICE_ID="INV_TEST_$(date +%s)"
TRANSACTION_ID="TRX_TEST_$(date +%s)"

echo -e "${BLUE}=== TEST DE LA FONCTION WEBHOOK DEXCHANGE ===${NC}"
echo -e "${BLUE}Date: $(date)${NC}"
echo -e "${BLUE}URL: $WEBHOOK_URL${NC}\n"

# Test 1: Requête OPTIONS (CORS)
echo -e "${YELLOW}Test 1: Requête OPTIONS (CORS)${NC}"
curl -X OPTIONS "$WEBHOOK_URL" \
  -H "Origin: https://test.com" \
  -H "Access-Control-Request-Method: POST" \
  -v 2>&1 | grep -E "< access-control-allow|< http"

echo -e "\n${YELLOW}Test 2: Requête sans signature (devrait accepter si WEBHOOK_SECRET n'est pas configuré)${NC}"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "ping",
    "test": true
  }' | jq '.'

echo -e "\n${YELLOW}Test 3: Requête avec signature valide${NC}"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: $WEBHOOK_SECRET" \
  -d '{
    "event": "ping",
    "test": true
  }' | jq '.'

echo -e "\n${YELLOW}Test 4: Requête avec signature invalide (devrait être rejetée)${NC}"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: invalid-secret" \
  -d '{
    "event": "ping",
    "test": true
  }' | jq '.'

echo -e "\n${YELLOW}Test 5: Simulation d'un paiement confirmé (avec signature valide)${NC}"
echo -e "${BLUE}Invoice ID: $INVOICE_ID${NC}"
echo -e "${BLUE}Transaction ID: $TRANSACTION_ID${NC}"

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: $WEBHOOK_SECRET" \
  -d '{
    "event": "payment.succeeded",
    "type": "payment.succeeded",
    "data": {
      "object": {
        "id": "'$TRANSACTION_ID'",
        "status": "succeeded",
        "amount": 5000,
        "currency": "XOF",
        "payment_method": "wave",
        "metadata": {
          "invoice_id": "'$INVOICE_ID'"
        }
      }
    }
  }' | jq '.'

echo -e "\n${YELLOW}Test 6: Format alternatif de webhook (structure différente)${NC}"
TRANSACTION_ID_ALT="TRX_ALT_$(date +%s)"
INVOICE_ID_ALT="INV_ALT_$(date +%s)"

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "x-dexchange-signature: $WEBHOOK_SECRET" \
  -d '{
    "event": "payment_success",
    "transaction_id": "'$TRANSACTION_ID_ALT'",
    "invoice_id": "'$INVOICE_ID_ALT'",
    "status": "completed",
    "amount": 10000,
    "currency": "XOF",
    "payment_method": "wave"
  }' | jq '.'

echo -e "\n${GREEN}Tests terminés!${NC}"
echo -e "${GREEN}Vérifiez les logs de la fonction pour voir les détails complets.${NC}"
echo -e "${BLUE}Dashboard: https://supabase.com/dashboard/project/qlqgyrfqiflnqknbtycw/functions/dexchange-callback-handler/logs${NC}"
