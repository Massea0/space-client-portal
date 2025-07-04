#!/bin/bash

# Script pour créer un fichier .env template avec toutes les variables DExchange
# Ce script génère un template .env avec toutes les variables nécessaires

echo "📝 Création d'un fichier .env template pour DExchange..."

ENV_TEMPLATE=".env.template"
ENV_FILE=".env"

# Créer le template
cat > "$ENV_TEMPLATE" << 'EOF'
# Configuration DExchange - Variables d'environnement
# Copiez ce fichier vers .env et remplissez les valeurs

# === VARIABLES SUPABASE (CRITIQUES) ===
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_DB_URL=postgresql://...

# === VARIABLES DEXCHANGE ===
# Clé API DExchange (obligatoire pour les paiements)
DEXCHANGE_API_KEY=

# URLs de l'API DExchange selon l'environnement
DEXCHANGE_API_URL_PRODUCTION=https://api-m.dexchange.sn/api/v1
DEXCHANGE_API_URL_SANDBOX=https://api-s.dexchange.sn/api/v1

# Environnement DExchange (sandbox ou production)
DEXCHANGE_ENVIRONMENT=sandbox

# Secret partagé pour valider les webhooks (IMPORTANT pour la sécurité)
DEXCHANGE_WEBHOOK_SECRET=

# URLs de callback pour les paiements (générées automatiquement si vides)
DEXCHANGE_SUCCESS_URL=
DEXCHANGE_FAILURE_URL=
DEXCHANGE_CALLBACK_URL=

# === VARIABLES RELAIS GCP ===
# URL du relais GCP DExchange
GCP_RELAY_URL=

# Secret du relais GCP (doit correspondre au relais)
GCP_RELAY_SECRET=

# === VARIABLES DU SITE ===
# URL de base de votre site
SITE_URL=https://votre-site.com

# === VARIABLES OPTIONNELLES ===
# Clé API Gemini (pour IA si utilisée)
GEMINI_API_KEY=

# === COMPATIBILITÉ (DEPRECATED) ===
# Anciens noms de variables pour compatibilité
WEBHOOK_SECRET=$DEXCHANGE_WEBHOOK_SECRET
RELAY_SECRET=$GCP_RELAY_SECRET
EOF

echo "✅ Template créé: $ENV_TEMPLATE"

# Vérifier si .env existe déjà
if [ -f "$ENV_FILE" ]; then
  echo "⚠️  Le fichier .env existe déjà."
  read -p "Voulez-vous le sauvegarder et créer un nouveau fichier? (o/n): " backup
  
  if [[ $backup == "o" || $backup == "O" ]]; then
    BACKUP_FILE=".env.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$ENV_FILE" "$BACKUP_FILE"
    echo "💾 Sauvegarde créée: $BACKUP_FILE"
    
    cp "$ENV_TEMPLATE" "$ENV_FILE"
    echo "📝 Nouveau fichier .env créé à partir du template"
  else
    echo "ℹ️  Fichier .env existant conservé"
  fi
else
  # Créer .env à partir du template
  cp "$ENV_TEMPLATE" "$ENV_FILE"
  echo "📝 Fichier .env créé à partir du template"
fi

echo ""
echo "📋 Prochaines étapes:"
echo "1. Éditez le fichier .env avec vos vraies valeurs"
echo "2. Exécutez ./deploy-complete-dexchange.sh pour déployer"
echo "3. Exécutez ./test-dexchange-deployment.sh pour tester"
echo ""
echo "🔐 Variables critiques à configurer:"
echo "  - SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY"
echo "  - DEXCHANGE_API_KEY (pour les paiements)"
echo "  - DEXCHANGE_WEBHOOK_SECRET (pour la sécurité)"
echo "  - SITE_URL (pour les redirections)"
echo ""
echo "📄 Consultez CONFIGURATION-VARIABLES-DEXCHANGE.md pour plus de détails"
