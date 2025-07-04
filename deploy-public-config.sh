#!/bin/bash

# Script de déploiement de la fonction get-public-config avec variables d'environnement
# Ce script déploie la fonction de configuration publique avec les variables nécessaires

echo "🚀 Déploiement de la fonction get-public-config avec variables d'environnement..."

# Charger les variables si un fichier .env existe
if [ -f ".env" ]; then
  echo "📄 Chargement des variables depuis le fichier .env..."
  source .env
fi

# Définir les variables si elles ne sont pas déjà définies
DEXCHANGE_ENVIRONMENT=${DEXCHANGE_ENVIRONMENT:-"sandbox"}
DEXCHANGE_API_URL_PRODUCTION=${DEXCHANGE_API_URL_PRODUCTION:-"https://api-m.dexchange.sn/api/v1"}
DEXCHANGE_API_URL_SANDBOX=${DEXCHANGE_API_URL_SANDBOX:-"https://api-sandbox.dexchange.sn/api/v1"}
SITE_URL=${SITE_URL:-""}
GCP_RELAY_URL=${GCP_RELAY_URL:-""}

# Vérifier les variables critiques
if [ -z "$SITE_URL" ]; then
  echo "⚠️  AVERTISSEMENT: SITE_URL non défini!"
  echo "Les URLs de callback seront incomplètes"
  read -p "Continuer quand même? (o/n): " confirmation
  if [[ $confirmation != "o" && $confirmation != "O" ]]; then
    echo "❌ Déploiement annulé."
    exit 1
  fi
else
  echo "✅ URL du site configurée: $SITE_URL"
fi

# Déployer la fonction avec les variables d'environnement
echo "🔄 Déploiement de la fonction avec les variables d'environnement..."

# Construire la commande avec toutes les variables définies
DEPLOY_CMD="supabase functions deploy get-public-config"

# Cette fonction n'a pas besoin de vérifier le JWT car elle est publique
DEPLOY_CMD="$DEPLOY_CMD --no-verify-jwt"

# Ajouter les variables d'environnement publiques
DEPLOY_CMD="$DEPLOY_CMD --env-file <(echo \"DEXCHANGE_ENVIRONMENT=$DEXCHANGE_ENVIRONMENT\")"
DEPLOY_CMD="$DEPLOY_CMD --env-file <(echo \"DEXCHANGE_API_URL_PRODUCTION=$DEXCHANGE_API_URL_PRODUCTION\")"
DEPLOY_CMD="$DEPLOY_CMD --env-file <(echo \"DEXCHANGE_API_URL_SANDBOX=$DEXCHANGE_API_URL_SANDBOX\")"
DEPLOY_CMD="$DEPLOY_CMD --env-file <(echo \"SITE_URL=$SITE_URL\")"

# Ajouter les URLs de callback si définies
if [ ! -z "$DEXCHANGE_CALLBACK_URL" ]; then
  DEPLOY_CMD="$DEPLOY_CMD --env-file <(echo \"DEXCHANGE_CALLBACK_URL=$DEXCHANGE_CALLBACK_URL\")"
  echo "✓ Variable DEXCHANGE_CALLBACK_URL incluse"
fi

if [ ! -z "$DEXCHANGE_SUCCESS_URL" ]; then
  DEPLOY_CMD="$DEPLOY_CMD --env-file <(echo \"DEXCHANGE_SUCCESS_URL=$DEXCHANGE_SUCCESS_URL\")"
  echo "✓ Variable DEXCHANGE_SUCCESS_URL incluse"
fi

if [ ! -z "$DEXCHANGE_FAILURE_URL" ]; then
  DEPLOY_CMD="$DEPLOY_CMD --env-file <(echo \"DEXCHANGE_FAILURE_URL=$DEXCHANGE_FAILURE_URL\")"
  echo "✓ Variable DEXCHANGE_FAILURE_URL incluse"
fi

if [ ! -z "$GCP_RELAY_URL" ]; then
  DEPLOY_CMD="$DEPLOY_CMD --env-file <(echo \"GCP_RELAY_URL=$GCP_RELAY_URL\")"
  echo "✓ Variable GCP_RELAY_URL incluse"
fi

# Exécuter la commande
echo "⚡ Exécution: $DEPLOY_CMD"
eval "$DEPLOY_CMD"

# Vérifier le résultat
if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Déploiement réussi!"
  echo ""
  echo "📋 Configuration déployée:"
  echo "  - Environnement DExchange: $DEXCHANGE_ENVIRONMENT"
  echo "  - URL API (${DEXCHANGE_ENVIRONMENT}): ${DEXCHANGE_ENVIRONMENT == 'production' ? DEXCHANGE_API_URL_PRODUCTION : DEXCHANGE_API_URL_SANDBOX}"
  echo "  - URL du site: $SITE_URL"
  echo ""
  echo "🔗 URL de la fonction: https://${SUPABASE_URL}/functions/v1/get-public-config"
  echo ""
  echo "🧪 Testez avec: curl https://${SUPABASE_URL}/functions/v1/get-public-config"
else
  echo "❌ Échec du déploiement. Vérifiez les erreurs ci-dessus."
fi
