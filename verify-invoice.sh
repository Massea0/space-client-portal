#!/bin/bash

# Script pour vérifier l'état d'une facture spécifique
# Utilise les fonctions Edge pour récupérer les informations

# Configuration
SUPABASE_URL="https://qlqgyrfqiflnqknbtycw.supabase.co"
SUPABASE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"
INVOICE_ID="65b9e429-86a8-4b43-971c-d2258f8135d4"  # ID de la facture à vérifier

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ -z "$SUPABASE_KEY" ]; then
  echo -e "${RED}Erreur: SUPABASE_SERVICE_ROLE_KEY non définie.${NC}"
  echo -e "${YELLOW}Utilisez: SUPABASE_SERVICE_ROLE_KEY=votre_clé ./verify-invoice.sh${NC}"
  exit 1
fi

echo -e "${BLUE}=== VÉRIFICATION DE LA FACTURE ===${NC}"
echo -e "${YELLOW}Invoice ID: $INVOICE_ID${NC}"

# Appel à Supabase pour récupérer les détails
echo -e "\n${BLUE}Récupération des détails de la facture...${NC}"
curl -s -X GET "$SUPABASE_URL/rest/v1/invoices?id=eq.$INVOICE_ID" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" | jq '.[0]'

echo -e "\n${GREEN}Vérification terminée!${NC}"
