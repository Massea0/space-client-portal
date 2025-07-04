#!/bin/bash

# Script pour récupérer automatiquement les variables Supabase
# Ce script utilise la CLI Supabase pour récupérer les variables nécessaires

echo "🔑 Configuration automatique des variables Supabase..."

# Vérifier que supabase CLI est disponible
if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI non trouvé. Installez-le avec:"
  echo "npm install -g supabase"
  exit 1
fi

# Récupérer les informations du projet
echo "📡 Récupération des informations du projet Supabase..."

# Essayer de récupérer le statut du projet
PROJECT_STATUS=$(supabase status 2>/dev/null)

if [ $? -eq 0 ]; then
  echo "✅ Projet Supabase trouvé localement"
  
  # Extraire les variables depuis le status
  SUPABASE_URL=$(echo "$PROJECT_STATUS" | grep "API URL" | awk '{print $3}')
  ANON_KEY=$(echo "$PROJECT_STATUS" | grep "anon key" | awk '{print $3}')
  SERVICE_KEY=$(echo "$PROJECT_STATUS" | grep "service_role key" | awk '{print $3}')
  
  if [ ! -z "$SUPABASE_URL" ] && [ ! -z "$ANON_KEY" ] && [ ! -z "$SERVICE_KEY" ]; then
    echo "✅ Variables récupérées avec succès"
    echo "  - URL: $SUPABASE_URL"
    echo "  - Anon Key: ${ANON_KEY:0:20}..."
    echo "  - Service Key: ${SERVICE_KEY:0:20}..."
  else
    echo "⚠️  Certaines variables n'ont pas pu être récupérées"
  fi
else
  echo "⚠️  Impossible de récupérer le statut du projet local"
  echo "Essayez de vous connecter avec: supabase login"
  echo "Puis initialisez le projet avec: supabase init"
fi

# Charger le fichier .env existant s'il existe
if [ -f ".env" ]; then
  echo "📄 Fichier .env existant trouvé"
  source .env
else
  echo "📝 Aucun fichier .env trouvé - création d'un nouveau"
fi

# Utiliser les valeurs récupérées ou demander à l'utilisateur
echo ""
echo "🔧 Configuration des variables..."

# SUPABASE_URL
if [ -z "$SUPABASE_URL" ]; then
  read -p "SUPABASE_URL (ex: https://abcdef.supabase.co): " SUPABASE_URL_INPUT
  SUPABASE_URL=${SUPABASE_URL_INPUT:-$SUPABASE_URL}
fi

# SUPABASE_ANON_KEY
if [ -z "$SUPABASE_ANON_KEY" ]; then
  if [ ! -z "$ANON_KEY" ]; then
    SUPABASE_ANON_KEY=$ANON_KEY
  else
    read -p "SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY
  fi
fi

# SUPABASE_SERVICE_ROLE_KEY
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  if [ ! -z "$SERVICE_KEY" ]; then
    SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY
  else
    read -p "SUPABASE_SERVICE_ROLE_KEY: " SUPABASE_SERVICE_ROLE_KEY
  fi
fi

# Variables Wave/DExchange avec valeurs par défaut
DEXCHANGE_WEBHOOK_SECRET=${DEXCHANGE_WEBHOOK_SECRET:-"wave_webhook_secret_$(date +%s)"}
DEXCHANGE_ENVIRONMENT=${DEXCHANGE_ENVIRONMENT:-"sandbox"}
SITE_URL=${SITE_URL:-"https://example.com"}

# Créer/mettre à jour le fichier .env
echo "💾 Mise à jour du fichier .env..."

cat > .env << EOF
# Variables Supabase (critiques)
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

# Variables DExchange/Wave
DEXCHANGE_API_KEY=${DEXCHANGE_API_KEY:-}
DEXCHANGE_WEBHOOK_SECRET=$DEXCHANGE_WEBHOOK_SECRET
DEXCHANGE_ENVIRONMENT=$DEXCHANGE_ENVIRONMENT

# URLs DExchange
DEXCHANGE_API_URL_PRODUCTION=https://api-m.dexchange.sn/api/v1
DEXCHANGE_API_URL_SANDBOX=https://api-s.dexchange.sn/api/v1

# Site et relais
SITE_URL=$SITE_URL
GCP_RELAY_URL=${GCP_RELAY_URL:-}

# Variables optionnelles
GEMINI_API_KEY=${GEMINI_API_KEY:-}

# Compatibilité
WEBHOOK_SECRET=$DEXCHANGE_WEBHOOK_SECRET
RELAY_SECRET=${RELAY_SECRET:-}
EOF

echo "✅ Fichier .env créé/mis à jour"

# Vérifier la configuration
echo ""
echo "🔍 Vérification de la configuration..."

missing_vars=()

if [ -z "$SUPABASE_URL" ]; then missing_vars+=("SUPABASE_URL"); fi
if [ -z "$SUPABASE_ANON_KEY" ]; then missing_vars+=("SUPABASE_ANON_KEY"); fi
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then missing_vars+=("SUPABASE_SERVICE_ROLE_KEY"); fi

if [ ${#missing_vars[@]} -eq 0 ]; then
  echo "✅ Configuration Supabase complète"
  
  # Test de connectivité
  echo "🔌 Test de connectivité..."
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL" 2>/dev/null)
  
  if [ "$STATUS" != "000" ]; then
    echo "✅ Supabase accessible (HTTP $STATUS)"
  else
    echo "⚠️  Supabase non accessible - vérifiez l'URL"
  fi
  
  echo ""
  echo "🎉 Configuration terminée!"
  echo ""
  echo "📋 Prochaines étapes:"
  echo "  1. Configurez DEXCHANGE_API_KEY si nécessaire"
  echo "  2. Lancez ./deploy-wave-complete.sh"
  echo "  3. Testez avec ./test-wave-manual.sh"
  
else
  echo "❌ Variables manquantes: ${missing_vars[*]}"
  echo "Veuillez les configurer manuellement dans .env"
fi

echo ""
echo "📄 Contenu de .env:"
echo "$(grep -v "KEY=" .env | sed 's/SECRET=.*/SECRET=[MASKED]/' | sed 's/KEY=.*/KEY=[MASKED]/')"
