#!/bin/bash

# Script de test complet pour toutes les fonctions DExchange
# Ce script teste les fonctions déployées et vérifie leur fonctionnement

echo "🧪 Test complet des fonctions DExchange..."

# Charger les variables si un fichier .env existe
if [ -f ".env" ]; then
  echo "📄 Chargement des variables depuis le fichier .env..."
  source .env
fi

# URL de base de Supabase
if [ -z "$SUPABASE_URL" ]; then
  # Essayer de récupérer l'URL via supabase CLI
  SUPABASE_URL=$(supabase functions list | grep -o 'https://.*\.functions\.supabase\.co' | head -1)
  
  if [ -z "$SUPABASE_URL" ]; then
    read -p "Entrez l'URL de base Supabase (ex: abcdef.supabase.co): " SUPABASE_URL
    if [ -z "$SUPABASE_URL" ]; then
      echo "❌ URL Supabase requise pour le test"
      exit 1
    fi
  fi
fi

# URLs des fonctions
GET_CONFIG_URL="https://${SUPABASE_URL}/functions/v1/get-public-config"
WEBHOOK_URL="https://${SUPABASE_URL}/functions/v1/dexchange-callback-handler"

echo "🔍 URLs testées:"
echo "  - Configuration publique: $GET_CONFIG_URL"
echo "  - Webhook DExchange: $WEBHOOK_URL"
echo ""

# Test 1: Fonction get-public-config
echo "📋 Test 1: Fonction get-public-config..."
CONFIG_RESPONSE=$(curl -s "$GET_CONFIG_URL")
CONFIG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$GET_CONFIG_URL")

if [ "$CONFIG_STATUS" == "200" ]; then
  echo "✅ get-public-config accessible (HTTP 200)"
  
  # Vérifier le contenu JSON
  if echo "$CONFIG_RESPONSE" | jq . > /dev/null 2>&1; then
    echo "✅ Réponse JSON valide"
    
    # Extraire et afficher la configuration
    echo "📄 Configuration récupérée:"
    echo "$CONFIG_RESPONSE" | jq '.config.dexchange' 2>/dev/null
    echo "$CONFIG_RESPONSE" | jq '.config.relay' 2>/dev/null
    echo "$CONFIG_RESPONSE" | jq '.config.site' 2>/dev/null
  else
    echo "⚠️ Réponse non JSON: $CONFIG_RESPONSE"
  fi
else
  echo "❌ get-public-config inaccessible (HTTP $CONFIG_STATUS)"
  echo "Réponse: $CONFIG_RESPONSE"
fi

echo ""

# Test 2: Webhook dexchange-callback-handler (ping)
echo "🔔 Test 2: Webhook dexchange-callback-handler (ping)..."
WEBHOOK_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$WEBHOOK_URL")

if [ "$WEBHOOK_STATUS" == "200" ]; then
  echo "✅ Webhook accessible (HTTP 200)"
  
  # Test ping avec body vide
  PING_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    "$WEBHOOK_URL")
  echo "📄 Réponse ping: $PING_RESPONSE"
else
  echo "❌ Webhook inaccessible (HTTP $WEBHOOK_STATUS)"
fi

echo ""

# Test 3: Validation du secret webhook
echo "🔐 Test 3: Validation du secret webhook..."
WEBHOOK_SECRET=${DEXCHANGE_WEBHOOK_SECRET:-$WEBHOOK_SECRET}

if [ ! -z "$WEBHOOK_SECRET" ]; then
  echo "🔑 Test avec secret valide..."
  VALID_SECRET_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "x-webhook-secret: $WEBHOOK_SECRET" \
    -d '{"event":"test_ping", "type":"ping"}' \
    "$WEBHOOK_URL")
  
  echo "Réponse (secret valide): $VALID_SECRET_RESPONSE"
  
  echo ""
  echo "🚫 Test avec secret invalide..."
  INVALID_SECRET_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "x-webhook-secret: invalid_secret_123" \
    -d '{"event":"test_ping", "type":"ping"}' \
    "$WEBHOOK_URL")
  
  echo "Réponse (secret invalide): $INVALID_SECRET_RESPONSE"
else
  echo "⚠️ Aucun secret configuré - validation désactivée"
fi

echo ""

# Test 4: Simulation de paiement complet
echo "💳 Test 4: Simulation de paiement complet..."
TEST_INVOICE_ID="test-invoice-$(date +%s)"
TEST_TRANSACTION_ID="txn-$(date +%s)"

# Payload de test simulant un paiement réussi
read -r -d '' PAYMENT_PAYLOAD << EOM
{
  "event": "payment.succeeded",
  "type": "payment.succeeded",
  "data": {
    "id": "$TEST_TRANSACTION_ID",
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

echo "🚀 Envoi du payload de paiement test..."
echo "  - ID Facture: $TEST_INVOICE_ID"
echo "  - ID Transaction: $TEST_TRANSACTION_ID"

if [ ! -z "$WEBHOOK_SECRET" ]; then
  PAYMENT_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "x-webhook-secret: $WEBHOOK_SECRET" \
    -d "$PAYMENT_PAYLOAD" \
    "$WEBHOOK_URL")
else
  PAYMENT_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$PAYMENT_PAYLOAD" \
    "$WEBHOOK_URL")
fi

echo "📄 Réponse paiement: $PAYMENT_RESPONSE"

echo ""

# Test 5: CORS (Options)
echo "🌐 Test 5: Support CORS..."
CORS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$WEBHOOK_URL")

if [ "$CORS_STATUS" == "200" ]; then
  echo "✅ CORS supporté (HTTP 200 pour OPTIONS)"
else
  echo "⚠️ CORS potentiellement non supporté (HTTP $CORS_STATUS pour OPTIONS)"
fi

echo ""
echo "🎯 Résumé des tests:"
echo "  - Configuration publique: $([ "$CONFIG_STATUS" == "200" ] && echo "✅ OK" || echo "❌ ÉCHEC")"
echo "  - Webhook accessible: $([ "$WEBHOOK_STATUS" == "200" ] && echo "✅ OK" || echo "❌ ÉCHEC")"
echo "  - Validation secret: $([ ! -z "$WEBHOOK_SECRET" ] && echo "✅ CONFIGURÉ" || echo "⚠️ DÉSACTIVÉ")"
echo "  - Support CORS: $([ "$CORS_STATUS" == "200" ] && echo "✅ OK" || echo "⚠️ PARTIEL")"
echo ""
echo "✅ Tests terminés"
