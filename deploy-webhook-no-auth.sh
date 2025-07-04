#!/bin/bash

# Script pour déployer la fonction dexchange-callback-handler sans authentification JWT
# Cela permet aux webhooks externes de DExchange d'être reçus correctement

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== DÉPLOIEMENT DE LA FONCTION WEBHOOK DEXCHANGE =====${NC}"

# 1. Demander confirmation
echo -e "${YELLOW}ATTENTION: Ce script va déployer la fonction dexchange-callback-handler${NC}"
echo -e "${YELLOW}sans authentification JWT, ce qui la rend accessible publiquement.${NC}"
echo -e "${YELLOW}La sécurité est assurée par la validation de signature dans le code.${NC}"
echo -e "${YELLOW}Continuer? (y/n)${NC}"
read -r CONFIRM

if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo -e "${RED}Déploiement annulé.${NC}"
  exit 1
fi

# 2. Remplacer le fichier existant par la nouvelle version
echo "Remplacement du fichier index.ts..."
if [ -f "supabase/functions/dexchange-callback-handler/index.ts.new" ]; then
  mv supabase/functions/dexchange-callback-handler/index.ts.new supabase/functions/dexchange-callback-handler/index.ts
  echo -e "${GREEN}✅ Fichier remplacé avec succès.${NC}"
else
  echo -e "${RED}❌ Fichier index.ts.new non trouvé!${NC}"
  exit 1
fi

# 3. Déployer la fonction sans JWT auth
echo "Déploiement de la fonction avec l'option --no-verify-jwt..."

# Vérifier si la variable DEXCHANGE_WEBHOOK_SECRET est définie
if [ -z "$DEXCHANGE_WEBHOOK_SECRET" ]; then
  echo -e "${YELLOW}⚠️ Variable DEXCHANGE_WEBHOOK_SECRET non définie!${NC}"
  echo -e "${YELLOW}Voulez-vous définir un secret webhook pour la sécurité? (recommandé) (y/n)${NC}"
  read -r SET_SECRET
  
  if [[ "$SET_SECRET" == "y" || "$SET_SECRET" == "Y" ]]; then
    echo "Entrez un secret webhook (valeur aléatoire recommandée):"
    read -r WEBHOOK_SECRET
    export DEXCHANGE_WEBHOOK_SECRET="$WEBHOOK_SECRET"
    echo -e "${GREEN}Secret défini: $DEXCHANGE_WEBHOOK_SECRET${NC}"
  else
    echo -e "${YELLOW}⚠️ Aucun secret webhook défini. La fonction acceptera tous les webhooks!${NC}"
  fi
fi

# Déployer la fonction avec l'option --no-verify-jwt
echo "Déploiement en cours..."
supabase functions deploy dexchange-callback-handler --no-verify-jwt

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Fonction déployée avec succès sans vérification JWT!${NC}"
  
  # Tester la fonction
  echo "Test de la fonction..."
  SUPABASE_URL=$(grep "SUPABASE_URL" .env 2>/dev/null | cut -d '=' -f2)
  
  if [ -z "$SUPABASE_URL" ]; then
    SUPABASE_URL="https://qlqgyrfqiflnqknbtycw.supabase.co"
  fi
  
  # Test simple sans authentification
  echo "Envoi d'un ping test..."
  curl -X POST "$SUPABASE_URL/functions/v1/dexchange-callback-handler" \
    -H "Content-Type: application/json" \
    -d '{"test": "ping"}' \
    -w "\nStatus: %{http_code}\n"
  
  echo -e "\n${GREEN}====== DÉPLOIEMENT TERMINÉ ======${NC}"
  echo -e "${BLUE}La fonction dexchange-callback-handler est maintenant configurée pour${NC}"
  echo -e "${BLUE}recevoir des webhooks sans authentification JWT.${NC}"
  echo -e "${YELLOW}URL du webhook: ${SUPABASE_URL}/functions/v1/dexchange-callback-handler${NC}"
  
  if [ -n "$DEXCHANGE_WEBHOOK_SECRET" ]; then
    echo -e "${YELLOW}Secret webhook: $DEXCHANGE_WEBHOOK_SECRET${NC}"
    echo -e "${YELLOW}Assurez-vous de configurer ce même secret dans DExchange!${NC}"
  else
    echo -e "${RED}⚠️ ATTENTION: Aucun secret webhook défini. Configurez DEXCHANGE_WEBHOOK_SECRET${NC}"
    echo -e "${RED}dans les variables d'environnement de la fonction pour plus de sécurité.${NC}"
  fi
else
  echo -e "${RED}❌ Échec du déploiement de la fonction.${NC}"
fi
