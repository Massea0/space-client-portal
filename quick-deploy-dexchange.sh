#!/bin/bash

# Déploiement rapide avec configuration d'exemple pour test
# Ce script déploie les fonctions avec une configuration de base pour tester rapidement

echo "⚡ Déploiement rapide DExchange (configuration de test)..."

# Vérifier que les variables Supabase essentielles sont disponibles
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ Variables Supabase manquantes. Chargement depuis l'environnement..."
  
  # Essayer de charger .env si disponible
  if [ -f ".env" ]; then
    echo "📄 Chargement depuis .env..."
    source .env
  fi
  
  # Vérifier à nouveau
  if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Variables Supabase critiques manquantes:"
    echo "  - SUPABASE_URL"
    echo "  - SUPABASE_ANON_KEY" 
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    echo ""
    echo "💡 Créez un fichier .env avec ces variables ou définissez-les dans votre environnement"
    exit 1
  fi
fi

# Configuration de test par défaut
DEXCHANGE_API_KEY=${DEXCHANGE_API_KEY:-"test_api_key_sandbox"}
DEXCHANGE_WEBHOOK_SECRET=${DEXCHANGE_WEBHOOK_SECRET:-"test_webhook_secret_$(date +%s)"}
DEXCHANGE_ENVIRONMENT=${DEXCHANGE_ENVIRONMENT:-"sandbox"}
SITE_URL=${SITE_URL:-"https://example.com"}
GCP_RELAY_URL=${GCP_RELAY_URL:-""}

echo "🔧 Configuration de test:"
echo "  - Environment: $DEXCHANGE_ENVIRONMENT"
echo "  - Site URL: $SITE_URL"
echo "  - Webhook Secret: ${DEXCHANGE_WEBHOOK_SECRET:0:10}..."
echo "  - API Key: ${DEXCHANGE_API_KEY:0:10}..."

# Créer le fichier de variables temporaire
ENV_FILE=$(mktemp)
cat > "$ENV_FILE" << EOF
DEXCHANGE_API_KEY=$DEXCHANGE_API_KEY
DEXCHANGE_API_URL_PRODUCTION=https://api-m.dexchange.sn/api/v1
DEXCHANGE_API_URL_SANDBOX=https://api-s.dexchange.sn/api/v1
DEXCHANGE_ENVIRONMENT=$DEXCHANGE_ENVIRONMENT
DEXCHANGE_SUCCESS_URL=${SITE_URL}/payment/success
DEXCHANGE_FAILURE_URL=${SITE_URL}/payment/failure
DEXCHANGE_CALLBACK_URL=${SUPABASE_URL}/functions/v1/dexchange-callback-handler
DEXCHANGE_WEBHOOK_SECRET=$DEXCHANGE_WEBHOOK_SECRET
GCP_RELAY_URL=$GCP_RELAY_URL
SITE_URL=$SITE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_URL=$SUPABASE_URL
EOF

echo ""
echo "🚀 Déploiement de dexchange-callback-handler..."
supabase functions deploy dexchange-callback-handler --no-verify-jwt --env-file "$ENV_FILE"

if [ $? -eq 0 ]; then
  echo "✅ dexchange-callback-handler déployée"
else
  echo "❌ Échec du déploiement webhook"
  rm -f "$ENV_FILE"
  exit 1
fi

echo ""
echo "🚀 Déploiement de get-public-config..."
supabase functions deploy get-public-config --env-file "$ENV_FILE"

if [ $? -eq 0 ]; then
  echo "✅ get-public-config déployée"
else
  echo "❌ Échec du déploiement config"
  rm -f "$ENV_FILE"
  exit 1
fi

# Nettoyer
rm -f "$ENV_FILE"

echo ""
echo "🎉 Déploiement rapide terminé!"
echo ""
echo "🔗 URLs des fonctions:"
echo "  - Webhook: ${SUPABASE_URL}/functions/v1/dexchange-callback-handler"
echo "  - Config: ${SUPABASE_URL}/functions/v1/get-public-config"
echo ""
echo "🧪 Test rapide du webhook:"
echo "curl -X POST \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'x-webhook-secret: $DEXCHANGE_WEBHOOK_SECRET' \\"
echo "  -d '{}' \\"
echo "  ${SUPABASE_URL}/functions/v1/dexchange-callback-handler"
echo ""
echo "🧪 Test de la configuration:"
echo "curl ${SUPABASE_URL}/functions/v1/get-public-config"
echo ""
echo "⚠️  IMPORTANT: Utilisez des vraies valeurs pour la production!"
echo "   - Changez DEXCHANGE_API_KEY"
echo "   - Changez DEXCHANGE_WEBHOOK_SECRET"
echo "   - Configurez SITE_URL correctement"
