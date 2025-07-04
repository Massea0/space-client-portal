#!/bin/bash

# Script de déploiement et test complet pour Wave
# Ce script déploie toutes les fonctions Wave et effectue des tests

echo "🌊 Déploiement et test complet du système Wave..."

# Charger les variables d'environnement
if [ -f ".env" ]; then
  echo "📄 Chargement des variables depuis .env..."
  source .env
fi

# Vérifier les variables essentielles
REQUIRED_VARS=("SUPABASE_URL" "SUPABASE_SERVICE_ROLE_KEY" "SUPABASE_ANON_KEY")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo "❌ Variables manquantes: ${MISSING_VARS[*]}"
  echo "Configurez ces variables dans .env avant de continuer"
  exit 1
fi

# Configuration Wave/DExchange
DEXCHANGE_WEBHOOK_SECRET=${DEXCHANGE_WEBHOOK_SECRET:-"wave_test_secret_$(date +%s)"}
DEXCHANGE_ENVIRONMENT=${DEXCHANGE_ENVIRONMENT:-"sandbox"}

echo "⚙️  Configuration Wave:"
echo "  - Environment: $DEXCHANGE_ENVIRONMENT"
echo "  - Webhook Secret: ${DEXCHANGE_WEBHOOK_SECRET:0:10}..."
echo "  - Supabase URL: $SUPABASE_URL"

# Créer le fichier d'environnement temporaire
ENV_FILE=$(mktemp)
cat > "$ENV_FILE" << EOF
DEXCHANGE_API_KEY=$DEXCHANGE_API_KEY
DEXCHANGE_API_URL_PRODUCTION=https://api-m.dexchange.sn/api/v1
DEXCHANGE_API_URL_SANDBOX=https://api-s.dexchange.sn/api/v1
DEXCHANGE_ENVIRONMENT=$DEXCHANGE_ENVIRONMENT
DEXCHANGE_WEBHOOK_SECRET=$DEXCHANGE_WEBHOOK_SECRET
WEBHOOK_SECRET=$DEXCHANGE_WEBHOOK_SECRET
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SITE_URL=${SITE_URL:-"https://example.com"}
EOF

echo ""
echo "🚀 Déploiement des fonctions Wave..."

# Déployer wave-callback-handler
echo "📡 Déploiement de wave-callback-handler..."
supabase functions deploy wave-callback-handler --no-verify-jwt

if [ $? -eq 0 ]; then
  echo "✅ wave-callback-handler déployée"
else
  echo "❌ Échec déploiement wave-callback-handler"
  rm -f "$ENV_FILE"
  exit 1
fi

# Déployer test-wave-payment
echo "🧪 Déploiement de test-wave-payment..."
supabase functions deploy test-wave-payment

if [ $? -eq 0 ]; then
  echo "✅ test-wave-payment déployée"
else
  echo "❌ Échec déploiement test-wave-payment"
  rm -f "$ENV_FILE"
  exit 1
fi

# Déployer check-wave-status (si pas déjà fait)
echo "🔍 Déploiement de check-wave-status..."
supabase functions deploy check-wave-status

if [ $? -eq 0 ]; then
  echo "✅ check-wave-status déployée"
else
  echo "⚠️  check-wave-status peut déjà être déployée"
fi

# Nettoyer le fichier temporaire
rm -f "$ENV_FILE"

echo ""
echo "🧪 Tests automatisés..."

# URLs des fonctions
WAVE_CALLBACK_URL="${SUPABASE_URL}/functions/v1/wave-callback-handler"
TEST_WAVE_URL="${SUPABASE_URL}/functions/v1/test-wave-payment"
CHECK_WAVE_URL="${SUPABASE_URL}/functions/v1/check-wave-status"

echo "📋 URLs déployées:"
echo "  - Wave Callback: $WAVE_CALLBACK_URL"
echo "  - Test Wave: $TEST_WAVE_URL"
echo "  - Check Wave: $CHECK_WAVE_URL"

echo ""
echo "🔌 Test 1: Connectivité des fonctions..."

# Test de connectivité
for url in "$WAVE_CALLBACK_URL" "$TEST_WAVE_URL" "$CHECK_WAVE_URL"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
  if [ "$STATUS" != "000" ]; then
    echo "✅ $(basename $url): HTTP $STATUS"
  else
    echo "❌ $(basename $url): Non accessible"
  fi
done

echo ""
echo "🧪 Test 2: Ping Wave callback..."
PING_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: $DEXCHANGE_WEBHOOK_SECRET" \
  "$WAVE_CALLBACK_URL" 2>/dev/null || echo "Error")

echo "Réponse ping: $PING_RESPONSE"

echo ""
echo "🧪 Test 3: Aide test Wave..."
HELP_RESPONSE=$(curl -s "$TEST_WAVE_URL?action=help" 2>/dev/null || echo "Error")
echo "API test Wave disponible: $(echo $HELP_RESPONSE | jq -r '.message' 2>/dev/null || echo 'Non accessible')"

echo ""
echo "🧪 Test 4: Test complet du flux..."
echo "Création d'une facture de test et simulation du paiement..."

FULL_TEST_RESPONSE=$(curl -s "$TEST_WAVE_URL?action=full&amount=2500" 2>/dev/null)

if echo "$FULL_TEST_RESPONSE" | jq . > /dev/null 2>&1; then
  SUCCESS=$(echo "$FULL_TEST_RESPONSE" | jq -r '.success' 2>/dev/null)
  PAYMENT_CONFIRMED=$(echo "$FULL_TEST_RESPONSE" | jq -r '.summary.paymentConfirmed' 2>/dev/null)
  
  if [ "$SUCCESS" == "true" ] && [ "$PAYMENT_CONFIRMED" == "true" ]; then
    echo "✅ Test complet réussi - Paiement Wave confirmé"
  else
    echo "⚠️  Test complet partiellement réussi"
    echo "Détails: $FULL_TEST_RESPONSE"
  fi
else
  echo "❌ Erreur lors du test complet"
  echo "Réponse: $FULL_TEST_RESPONSE"
fi

echo ""
echo "🎉 Déploiement Wave terminé!"
echo ""
echo "📋 Informations importantes:"
echo "  - URL Webhook Wave: $WAVE_CALLBACK_URL"
echo "  - Secret Webhook: $DEXCHANGE_WEBHOOK_SECRET"
echo "  - URL Tests: $TEST_WAVE_URL"
echo ""
echo "🔧 Commandes de test utiles:"
echo ""
echo "# Créer une facture de test:"
echo "curl '$TEST_WAVE_URL?action=create&amount=1000&email=test@example.com'"
echo ""
echo "# Simuler un webhook de succès:"
echo "curl '$TEST_WAVE_URL?action=webhook&invoice=INVOICE_ID&transaction=TXN_ID&success=true'"
echo ""
echo "# Test complet du flux:"
echo "curl '$TEST_WAVE_URL?action=full&amount=2000'"
echo ""
echo "# Vérifier une facture manuellement:"
echo "curl -X POST -H 'Content-Type: application/json' \\"
echo "  -H 'Authorization: Bearer $SUPABASE_ANON_KEY' \\"
echo "  -d '{\"invoiceId\":\"INVOICE_ID\",\"testMode\":true}' \\"
echo "  '$CHECK_WAVE_URL'"
echo ""
echo "⚠️  IMPORTANT pour la production:"
echo "  - Configurez DEXCHANGE_API_KEY avec votre vraie clé"
echo "  - Changez DEXCHANGE_WEBHOOK_SECRET pour un secret sécurisé"
echo "  - Configurez DEXCHANGE_ENVIRONMENT=production"
echo "  - Fournissez l'URL webhook à DExchange"
