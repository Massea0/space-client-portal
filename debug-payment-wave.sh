#!/bin/bash

# Script pour tester et déboguer le système de paiement Wave
# Ce script simule différents scénarios de webhook et de confirmation

echo "🔧 DEBUG SYSTÈME PAIEMENT WAVE"
echo "==============================="

# Configuration
SUPABASE_URL="https://qlqgyrfqiflnqknbtycw.supabase.co"
SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Test de la fonction payment-status${NC}"
curl -X POST "$SUPABASE_URL/functions/v1/payment-status" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -d '{
    "transactionId": "TIDKT48GL70DQO",
    "invoiceId": "65b9e429-86a8-4b43-971c-d2258f8135d4"
  }' | jq '.'

echo -e "\n${BLUE}2. Test de simulation de paiement confirmé${NC}"
curl -X POST "$SUPABASE_URL/functions/v1/check-wave-status" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -d '{
    "invoiceId": "65b9e429-86a8-4b43-971c-d2258f8135d4",
    "transactionId": "TIDKT48GL70DQO",
    "testMode": true
  }' | jq '.'

echo -e "\n${BLUE}3. Simulation d'un webhook DExchange de confirmation${NC}"
curl -X POST "$SUPABASE_URL/functions/v1/dexchange-callback-handler" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "x-webhook-secret: test-secret" \
  -d '{
    "event": "payment_success",
    "transaction_id": "TIDKT48GL70DQO",
    "invoice_id": "65b9e429-86a8-4b43-971c-d2258f8135d4",
    "status": "completed",
    "amount": 200,
    "currency": "XOF",
    "payment_method": "wave",
    "external_transaction_id": "wave_12345",
    "metadata": {
      "test": true,
      "source": "debug_script"
    }
  }' | jq '.'

echo -e "\n${BLUE}4. Vérification du statut final${NC}"
curl -X POST "$SUPABASE_URL/functions/v1/payment-status" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -d '{
    "transactionId": "TIDKT48GL70DQO",
    "invoiceId": "65b9e429-86a8-4b43-971c-d2258f8135d4"
  }' | jq '.'

echo -e "\n${GREEN}✅ Tests de débogage terminés${NC}"
echo -e "${YELLOW}💡 Si le paiement n'est toujours pas confirmé, il y a un problème dans le flux de webhook${NC}"
