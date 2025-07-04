#!/bin/bash

# Script de déploiement de la fonction dexchange-callback-handler avec variables d'environnement
# Ce script déploie la fonction webhook avec les variables nécessaires provenant du fichier .env ou définies ici

echo "🚀 Déploiement de la fonction dexchange-callback-handler avec variables d'environnement..."

# Charger les variables si un fichier .env existe
if [ -f ".env" ]; then
  echo "📄 Chargement des variables depuis le fichier .env..."
  source .env
fi

# Définir les variables si elles ne sont pas déjà définies
DEXCHANGE_API_KEY=${DEXCHANGE_API_KEY:-""}
RELAY_SECRET=${RELAY_SECRET:-""}
DEXCHANGE_WEBHOOK_SECRET=${DEXCHANGE_WEBHOOK_SECRET:-$WEBHOOK_SECRET}

# Vérifier les variables critiques
if [ -z "$DEXCHANGE_WEBHOOK_SECRET" ]; then
  echo "⚠️  AVERTISSEMENT: Aucun DEXCHANGE_WEBHOOK_SECRET ni WEBHOOK_SECRET défini!"
  echo "La validation de signature sera désactivée - déploiement en mode non sécurisé"
  read -p "Continuer quand même? (o/n): " confirmation
  if [[ $confirmation != "o" && $confirmation != "O" ]]; then
    echo "❌ Déploiement annulé."
    exit 1
  fi
else
  echo "✅ Secret webhook configuré"
fi

# Mettre à jour le fichier
echo "📝 Préparation du fichier pour le déploiement..."
cp supabase/functions/dexchange-callback-handler/index.ts.new supabase/functions/dexchange-callback-handler/index.ts

# Déployer la fonction avec les variables d'environnement
echo "🔄 Déploiement de la fonction avec les variables d'environnement..."

# Construire la commande avec toutes les variables définies
DEPLOY_CMD="supabase functions deploy dexchange-callback-handler --no-verify-jwt"

if [ ! -z "$DEXCHANGE_API_KEY" ]; then
  DEPLOY_CMD="$DEPLOY_CMD --env-file <(echo \"DEXCHANGE_API_KEY=$DEXCHANGE_API_KEY\")"
  echo "✓ Variable DEXCHANGE_API_KEY incluse"
fi

if [ ! -z "$RELAY_SECRET" ]; then
  DEPLOY_CMD="$DEPLOY_CMD --env-file <(echo \"RELAY_SECRET=$RELAY_SECRET\")"
  echo "✓ Variable RELAY_SECRET incluse"
fi

if [ ! -z "$DEXCHANGE_WEBHOOK_SECRET" ]; then
  DEPLOY_CMD="$DEPLOY_CMD --env-file <(echo \"DEXCHANGE_WEBHOOK_SECRET=$DEXCHANGE_WEBHOOK_SECRET\")"
  echo "✓ Variable DEXCHANGE_WEBHOOK_SECRET incluse"
fi

# Supabase utilise aussi le nom WEBHOOK_SECRET, on l'ajoute pour compatibilité
if [ ! -z "$DEXCHANGE_WEBHOOK_SECRET" ]; then
  DEPLOY_CMD="$DEPLOY_CMD --env-file <(echo \"WEBHOOK_SECRET=$DEXCHANGE_WEBHOOK_SECRET\")"
  echo "✓ Variable WEBHOOK_SECRET incluse (compatibilité)"
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
  echo "  - API Key DExchange: ${DEXCHANGE_API_KEY:0:5}... (${#DEXCHANGE_API_KEY} caractères)"
  echo "  - Secret Relais: ${RELAY_SECRET:0:5}... (${#RELAY_SECRET} caractères)"
  echo "  - Secret Webhook: ${DEXCHANGE_WEBHOOK_SECRET:0:5}... (${#DEXCHANGE_WEBHOOK_SECRET} caractères)"
  echo ""
  echo "🔗 URL du webhook: https://${SUPABASE_URL}/functions/v1/dexchange-callback-handler"
  echo ""
  echo "ℹ️  Informations à transmettre à DExchange:"
  echo "  - URL du webhook: https://${SUPABASE_URL}/functions/v1/dexchange-callback-handler"
  echo "  - Secret du webhook: $DEXCHANGE_WEBHOOK_SECRET"
else
  echo "❌ Échec du déploiement. Vérifiez les erreurs ci-dessus."
fi
