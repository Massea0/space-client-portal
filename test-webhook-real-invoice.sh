#!/bin/bash

# Script pour simuler un webhook DExchange avec curl
# Ce script utilise curl pour envoyer un webhook simulé à la fonction

# Configuration
SUPABASE_URL="https://qlqgyrfqiflnqknbtycw.supabase.co"
WEBHOOK_URL="$SUPABASE_URL/functions/v1/dexchange-callback-handler"
WEBHOOK_SECRET="dexchange-webhooks-secret-2025"
INVOICE_ID="65b9e429-86a8-4b43-971c-d2258f8135d4"  # Remplacez par un ID valide si nécessaire
TRANSACTION_ID="WAVE_TEST_$(date +%s)"

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== TEST WEBHOOK AVEC UNE VRAIE FACTURE ===${NC}"
echo -e "${YELLOW}URL: $WEBHOOK_URL${NC}"
echo -e "${YELLOW}Invoice ID: $INVOICE_ID${NC}"
echo -e "${YELLOW}Transaction ID: $TRANSACTION_ID${NC}"

# Envoyer le webhook
echo -e "\n${BLUE}Envoi du webhook...${NC}"
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

echo -e "\n${GREEN}Test terminé!${NC}"
echo -e "${YELLOW}Vérifiez l'état de la facture $INVOICE_ID dans la base de données.${NC}"
