#!/bin/bash

# Script pour configurer les secrets Supabase
# Les variables d'environnement doivent être configurées comme secrets dans Supabase

echo "🔐 Configuration des secrets Supabase pour Wave..."

# Charger les variables
if [ -f ".env" ]; then
  source .env
fi

# Vérifier que les variables essentielles existent
if [ -z "$DEXCHANGE_WEBHOOK_SECRET" ]; then
  echo "❌ DEXCHANGE_WEBHOOK_SECRET manquant dans .env"
  exit 1
fi

echo "📋 Variables à configurer comme secrets Supabase:"
echo "  - DEXCHANGE_API_KEY: ${DEXCHANGE_API_KEY:-"(non définie)"}"
echo "  - DEXCHANGE_WEBHOOK_SECRET: ${DEXCHANGE_WEBHOOK_SECRET:0:10}..."
echo "  - DEXCHANGE_ENVIRONMENT: $DEXCHANGE_ENVIRONMENT"
echo "  - SITE_URL: $SITE_URL"

echo ""
echo "🔧 Configuration des secrets..."

# Configurer les secrets via supabase CLI
if command -v supabase &> /dev/null; then
  echo "Tentative de configuration automatique des secrets..."
  
  # Note: La CLI Supabase ne supporte pas encore la configuration des secrets
  # Il faut les configurer manuellement via le dashboard
  echo "⚠️  La configuration automatique n'est pas encore disponible"
  echo "Configurez manuellement via le dashboard Supabase:"
  echo ""
  echo "1. Allez sur: https://supabase.com/dashboard/project/[votre-projet]/settings/edge-functions"
  echo "2. Dans la section 'Environment variables', ajoutez:"
  echo ""
  
  if [ ! -z "$DEXCHANGE_API_KEY" ]; then
    echo "   DEXCHANGE_API_KEY = $DEXCHANGE_API_KEY"
  fi
  echo "   DEXCHANGE_WEBHOOK_SECRET = $DEXCHANGE_WEBHOOK_SECRET"
  echo "   DEXCHANGE_ENVIRONMENT = $DEXCHANGE_ENVIRONMENT"
  echo "   DEXCHANGE_API_URL_PRODUCTION = https://api-m.dexchange.sn/api/v1"
  echo "   DEXCHANGE_API_URL_SANDBOX = https://api-s.dexchange.sn/api/v1"
  echo "   SITE_URL = $SITE_URL"
  echo "   WEBHOOK_SECRET = $DEXCHANGE_WEBHOOK_SECRET"
  
else
  echo "❌ Supabase CLI non trouvé"
fi

echo ""
echo "📝 Script de configuration pour le dashboard Supabase:"

# Créer un script pour copier-coller dans le dashboard
cat > supabase-secrets.txt << EOF
# Variables d'environnement à configurer dans le dashboard Supabase
# Copiez ces lignes dans: Project Settings > Edge Functions > Environment Variables

DEXCHANGE_API_KEY=${DEXCHANGE_API_KEY:-}
DEXCHANGE_WEBHOOK_SECRET=$DEXCHANGE_WEBHOOK_SECRET
DEXCHANGE_ENVIRONMENT=$DEXCHANGE_ENVIRONMENT
DEXCHANGE_API_URL_PRODUCTION=https://api-m.dexchange.sn/api/v1
DEXCHANGE_API_URL_SANDBOX=https://api-s.dexchange.sn/api/v1
SITE_URL=$SITE_URL
WEBHOOK_SECRET=$DEXCHANGE_WEBHOOK_SECRET
EOF

echo "✅ Configuration sauvegardée dans: supabase-secrets.txt"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Ouvrez le dashboard Supabase"
echo "2. Allez dans Project Settings > Edge Functions > Environment Variables"
echo "3. Ajoutez les variables listées dans supabase-secrets.txt"
echo "4. Lancez ./deploy-wave-complete.sh"

echo ""
echo "🌐 Liens utiles:"
echo "  - Dashboard: https://supabase.com/dashboard"
echo "  - Variables: https://supabase.com/dashboard/project/$(echo $SUPABASE_URL | sed 's/.*\/\/\([^.]*\).*/\1/')/settings/edge-functions"
