#!/bin/bash

# Script de test pour les nouvelles variables d'environnement DExchange dans le webhook
# Ce script teste la disponibilité des variables et simule un webhook pour vérifier le fonctionnement

echo "🧪 Test des variables d'environnement DExchange et du webhook..."

# Charger les variables si un fichier .env existe
if [ -f ".env" ]; then
  echo "📄 Chargement des variables depuis le fichier .env..."
  source .env
fi

# URL de base de la fonction
if [ -z "$SUPABASE_URL" ]; then
  # Essayer de récupérer l'URL en demandant à supabase CLI
  SUPABASE_URL=$(supabase functions list | grep -o 'https://.*\.functions\.supabase\.co' | head -1)
  
  if [ -z "$SUPABASE_URL" ]; then
    read -p "Entrez l'URL de base Supabase (ex: abcdef.supabase.co): " SUPABASE_URL
    if [ -z "$SUPABASE_URL" ]; then
      echo "❌ URL Supabase requise pour le test"
      exit 1
    fi
  fi
fi

# Construire l'URL complète du webhook
WEBHOOK_URL="https://${SUPABASE_URL}/functions/v1/dexchange-callback-handler"

echo "🔍 Vérification des variables d'environnement..."
echo " - URL de la fonction: $WEBHOOK_URL"

# Vérifier DEXCHANGE_API_KEY
if [ -z "$DEXCHANGE_API_KEY" ]; then
  echo " - ❌ DEXCHANGE_API_KEY: Non définie"
else 
  echo " - ✅ DEXCHANGE_API_KEY: Définie (${#DEXCHANGE_API_KEY} caractères)"
fi

# Vérifier RELAY_SECRET
if [ -z "$RELAY_SECRET" ]; then
  echo " - ❌ RELAY_SECRET: Non définie"
else
  echo " - ✅ RELAY_SECRET: Définie (${#RELAY_SECRET} caractères)"
fi

# Vérifier DEXCHANGE_WEBHOOK_SECRET ou WEBHOOK_SECRET
WEBHOOK_SECRET=${DEXCHANGE_WEBHOOK_SECRET:-$WEBHOOK_SECRET}
if [ -z "$WEBHOOK_SECRET" ]; then
  echo " - ❌ WEBHOOK_SECRET: Non définie (la validation sera désactivée)"
else
  echo " - ✅ WEBHOOK_SECRET: Définie (${#WEBHOOK_SECRET} caractères)"
fi

echo ""
echo "🔄 Test de connexion de base au webhook..."
# Tester la connexion de base au webhook (ping)
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$WEBHOOK_URL")
if [ "$RESPONSE" == "200" ]; then
  echo "✅ Webhook accessible (HTTP 200)"
else
  echo "⚠️ Webhook renvoie HTTP $RESPONSE"
fi

echo ""
echo "🧪 Test de validation du secret webhook..."
# Tester avec secret valide
if [ ! -z "$WEBHOOK_SECRET" ]; then
  echo "🔑 Test avec secret valide..."
  RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "x-webhook-secret: $WEBHOOK_SECRET" \
    -d '{"event":"test_event", "type":"ping"}' \
    "$WEBHOOK_URL")
  
  echo "Réponse: $RESPONSE"
  
  echo ""
  echo "🔒 Test avec secret invalide..."
  RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "x-webhook-secret: invalid_secret" \
    -d '{"event":"test_event", "type":"ping"}' \
    "$WEBHOOK_URL")
  
  echo "Réponse: $RESPONSE"
else
  echo "⚠️ Impossible de tester la validation du secret car aucun secret n'est défini"
fi

echo ""
echo "📊 Test de simulation de paiement complet..."
# Générer un ID de facture de test
TEST_INVOICE_ID="test-$(date +%s)"

# Créer un payload de test simulant un paiement réussi
read -r -d '' TEST_PAYLOAD << EOM
{
  "event": "payment.succeeded",
  "type": "payment.succeeded",
  "data": {
    "id": "txn_$(date +%s)",
    "status": "succeeded",
    "amount": 5000,
    "currency": "XOF",
    "metadata": {
      "invoice_id": "$TEST_INVOICE_ID"
    },
    "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  }
}
EOM

# Envoyer le payload de test avec le secret
echo "🚀 Envoi du payload de test avec l'ID de facture $TEST_INVOICE_ID"
if [ ! -z "$WEBHOOK_SECRET" ]; then
  RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "x-webhook-secret: $WEBHOOK_SECRET" \
    -d "$TEST_PAYLOAD" \
    "$WEBHOOK_URL")
else
  RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$TEST_PAYLOAD" \
    "$WEBHOOK_URL")
fi

echo "Réponse: $RESPONSE"
echo ""
echo "✅ Tests terminés"
