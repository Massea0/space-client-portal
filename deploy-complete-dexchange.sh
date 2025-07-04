#!/bin/bash

# Script de déploiement complet pour toutes les fonctions DExchange
# Ce script déploie les fonctions avec les variables d'environnement correctes

echo "🚀 Déploiement complet des fonctions DExchange avec variables d'environnement..."

# Charger les variables si un fichier .env existe
if [ -f ".env" ]; then
  echo "📄 Chargement des variables depuis le fichier .env..."
  source .env
fi

# Définir toutes les variables DExchange si elles ne sont pas déjà définies
DEXCHANGE_API_KEY=${DEXCHANGE_API_KEY:-""}
DEXCHANGE_API_URL_PRODUCTION=${DEXCHANGE_API_URL_PRODUCTION:-"https://api-m.dexchange.sn/api/v1"}
DEXCHANGE_API_URL_SANDBOX=${DEXCHANGE_API_URL_SANDBOX:-"https://api-s.dexchange.sn/api/v1"}
DEXCHANGE_ENVIRONMENT=${DEXCHANGE_ENVIRONMENT:-"sandbox"}
DEXCHANGE_WEBHOOK_SECRET=${DEXCHANGE_WEBHOOK_SECRET:-$WEBHOOK_SECRET}
GCP_RELAY_SECRET=${GCP_RELAY_SECRET:-$RELAY_SECRET}
GCP_RELAY_URL=${GCP_RELAY_URL:-""}
SITE_URL=${SITE_URL:-""}

# Variables dérivées automatiquement si non définies
DEXCHANGE_SUCCESS_URL=${DEXCHANGE_SUCCESS_URL:-"${SITE_URL}/payment/success"}
DEXCHANGE_FAILURE_URL=${DEXCHANGE_FAILURE_URL:-"${SITE_URL}/payment/failure"}
DEXCHANGE_CALLBACK_URL=${DEXCHANGE_CALLBACK_URL:-"${SUPABASE_URL}/functions/v1/dexchange-callback-handler"}

echo "🔍 Vérification des variables critiques..."

# Variables critiques requises
CRITICAL_VARS=()
if [ -z "$SUPABASE_URL" ]; then CRITICAL_VARS+=("SUPABASE_URL"); fi
if [ -z "$SUPABASE_ANON_KEY" ]; then CRITICAL_VARS+=("SUPABASE_ANON_KEY"); fi
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then CRITICAL_VARS+=("SUPABASE_SERVICE_ROLE_KEY"); fi

if [ ${#CRITICAL_VARS[@]} -gt 0 ]; then
  echo "❌ Variables critiques manquantes: ${CRITICAL_VARS[*]}"
  echo "Ces variables sont requises pour le fonctionnement des fonctions."
  exit 1
fi

# Variables optionnelles avec avertissements
OPTIONAL_VARS=()
if [ -z "$DEXCHANGE_API_KEY" ]; then OPTIONAL_VARS+=("DEXCHANGE_API_KEY"); fi
if [ -z "$DEXCHANGE_WEBHOOK_SECRET" ]; then OPTIONAL_VARS+=("DEXCHANGE_WEBHOOK_SECRET"); fi
if [ -z "$GCP_RELAY_URL" ]; then OPTIONAL_VARS+=("GCP_RELAY_URL"); fi

if [ ${#OPTIONAL_VARS[@]} -gt 0 ]; then
  echo "⚠️  Variables optionnelles manquantes: ${OPTIONAL_VARS[*]}"
  echo "Les fonctions fonctionneront mais avec des fonctionnalités limitées."
fi

echo ""
echo "📋 Configuration à déployer:"
echo "  - Environment DExchange: $DEXCHANGE_ENVIRONMENT"
echo "  - API Key DExchange: ${DEXCHANGE_API_KEY:0:8}... (${#DEXCHANGE_API_KEY} caractères)"
echo "  - Webhook Secret: ${DEXCHANGE_WEBHOOK_SECRET:0:8}... (${#DEXCHANGE_WEBHOOK_SECRET} caractères)"
echo "  - URL du relais GCP: $GCP_RELAY_URL"
echo "  - URL du site: $SITE_URL"
echo ""

# Créer un fichier temporaire avec toutes les variables d'environnement
ENV_FILE=$(mktemp)
cat > "$ENV_FILE" << EOF
DEXCHANGE_API_KEY=$DEXCHANGE_API_KEY
DEXCHANGE_API_URL_PRODUCTION=$DEXCHANGE_API_URL_PRODUCTION
DEXCHANGE_API_URL_SANDBOX=$DEXCHANGE_API_URL_SANDBOX
DEXCHANGE_ENVIRONMENT=$DEXCHANGE_ENVIRONMENT
DEXCHANGE_SUCCESS_URL=$DEXCHANGE_SUCCESS_URL
DEXCHANGE_FAILURE_URL=$DEXCHANGE_FAILURE_URL
DEXCHANGE_CALLBACK_URL=$DEXCHANGE_CALLBACK_URL
DEXCHANGE_WEBHOOK_SECRET=$DEXCHANGE_WEBHOOK_SECRET
GCP_RELAY_SECRET=$GCP_RELAY_SECRET
GCP_RELAY_URL=$GCP_RELAY_URL
SITE_URL=$SITE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_URL=$SUPABASE_URL
GEMINI_API_KEY=$GEMINI_API_KEY
EOF

echo "🔄 Déploiement de la fonction dexchange-callback-handler..."
supabase functions deploy dexchange-callback-handler --no-verify-jwt --env-file "$ENV_FILE"

if [ $? -eq 0 ]; then
  echo "✅ dexchange-callback-handler déployée avec succès"
else
  echo "❌ Échec du déploiement de dexchange-callback-handler"
  rm -f "$ENV_FILE"
  exit 1
fi

echo ""
echo "🔄 Déploiement de la fonction get-public-config..."
supabase functions deploy get-public-config --env-file "$ENV_FILE"

if [ $? -eq 0 ]; then
  echo "✅ get-public-config déployée avec succès"
else
  echo "❌ Échec du déploiement de get-public-config"
  rm -f "$ENV_FILE"
  exit 1
fi

# Nettoyer le fichier temporaire
rm -f "$ENV_FILE"

echo ""
echo "🎉 Déploiement complet terminé avec succès!"
echo ""
echo "📋 Informations pour DExchange:"
echo "  - URL du webhook: $DEXCHANGE_CALLBACK_URL"
echo "  - Secret du webhook: $DEXCHANGE_WEBHOOK_SECRET"
echo "  - URL de succès: $DEXCHANGE_SUCCESS_URL"
echo "  - URL d'échec: $DEXCHANGE_FAILURE_URL"
echo ""
echo "📋 Informations pour le client:"
echo "  - URL de configuration publique: ${SUPABASE_URL}/functions/v1/get-public-config"
echo "  - URL du relais GCP: $GCP_RELAY_URL"
echo ""
echo "🧪 Pour tester le déploiement, exécutez:"
echo "  ./test-dexchange-deployment.sh"
