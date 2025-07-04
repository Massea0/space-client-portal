#!/bin/bash

# Script de test manuel pour Wave - Scénarios divers
# Ce script permet de tester différents scénarios Wave de manière interactive

echo "🧪 Tests manuels Wave - Scénarios de paiement"

# Charger les variables
if [ -f ".env" ]; then
  source .env
fi

if [ -z "$SUPABASE_URL" ]; then
  echo "❌ SUPABASE_URL manquante"
  exit 1
fi

# URLs des fonctions
WAVE_CALLBACK_URL="${SUPABASE_URL}/functions/v1/wave-callback-handler"
TEST_WAVE_URL="${SUPABASE_URL}/functions/v1/test-wave-payment"
WEBHOOK_SECRET=${DEXCHANGE_WEBHOOK_SECRET:-${WEBHOOK_SECRET:-"test_secret"}}

echo "🔗 URLs utilisées:"
echo "  - Wave Callback: $WAVE_CALLBACK_URL"
echo "  - Test API: $TEST_WAVE_URL"
echo "  - Secret: ${WEBHOOK_SECRET:0:10}..."
echo ""

# Fonction pour afficher un menu
show_menu() {
  echo "📋 Choisissez un test:"
  echo "  1) Test de connectivité"
  echo "  2) Créer une facture de test"
  echo "  3) Simuler webhook de succès"
  echo "  4) Simuler webhook d'échec"
  echo "  5) Test d'auto-confirmation"
  echo "  6) Test complet du flux"
  echo "  7) Test avec signature invalide"
  echo "  8) Test sans signature"
  echo "  9) Voir l'aide de l'API"
  echo "  0) Quitter"
  echo ""
  read -p "Votre choix (0-9): " choice
}

# Fonction pour tester la connectivité
test_connectivity() {
  echo "🔌 Test de connectivité..."
  
  for url in "$WAVE_CALLBACK_URL" "$TEST_WAVE_URL"; do
    echo -n "  $(basename $url): "
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    if [ "$STATUS" != "000" ]; then
      echo "✅ HTTP $STATUS"
    else
      echo "❌ Non accessible"
    fi
  done
}

# Fonction pour créer une facture
create_test_invoice() {
  echo "📝 Création d'une facture de test..."
  read -p "Montant (défaut: 1000): " amount
  read -p "Email (défaut: test@example.com): " email
  
  amount=${amount:-1000}
  email=${email:-"test@example.com"}
  
  echo "Création facture: $amount XOF pour $email"
  
  RESPONSE=$(curl -s "$TEST_WAVE_URL?action=create&amount=$amount&email=$email")
  echo "Réponse: $RESPONSE"
  
  # Extraire l'ID de facture pour les tests suivants
  INVOICE_ID=$(echo "$RESPONSE" | jq -r '.invoice.id' 2>/dev/null)
  if [ "$INVOICE_ID" != "null" ] && [ "$INVOICE_ID" != "" ]; then
    echo ""
    echo "✅ Facture créée: $INVOICE_ID"
    echo "💾 ID sauvegardé pour les prochains tests"
    export LAST_INVOICE_ID="$INVOICE_ID"
  fi
}

# Fonction pour simuler un webhook de succès
simulate_success_webhook() {
  echo "✅ Simulation webhook de succès..."
  
  if [ -z "$LAST_INVOICE_ID" ]; then
    read -p "ID de facture: " invoice_id
  else
    read -p "ID de facture (défaut: $LAST_INVOICE_ID): " invoice_id
    invoice_id=${invoice_id:-$LAST_INVOICE_ID}
  fi
  
  if [ -z "$invoice_id" ]; then
    echo "❌ ID de facture requis"
    return
  fi
  
  transaction_id="txn_success_$(date +%s)"
  echo "Transaction ID: $transaction_id"
  
  RESPONSE=$(curl -s "$TEST_WAVE_URL?action=webhook&invoice=$invoice_id&transaction=$transaction_id&success=true")
  echo "Réponse: $RESPONSE"
}

# Fonction pour simuler un webhook d'échec
simulate_failure_webhook() {
  echo "❌ Simulation webhook d'échec..."
  
  if [ -z "$LAST_INVOICE_ID" ]; then
    read -p "ID de facture: " invoice_id
  else
    read -p "ID de facture (défaut: $LAST_INVOICE_ID): " invoice_id
    invoice_id=${invoice_id:-$LAST_INVOICE_ID}
  fi
  
  if [ -z "$invoice_id" ]; then
    echo "❌ ID de facture requis"
    return
  fi
  
  transaction_id="txn_failed_$(date +%s)"
  echo "Transaction ID: $transaction_id"
  
  RESPONSE=$(curl -s "$TEST_WAVE_URL?action=webhook&invoice=$invoice_id&transaction=$transaction_id&success=false")
  echo "Réponse: $RESPONSE"
}

# Fonction pour tester l'auto-confirmation
test_auto_confirmation() {
  echo "⏰ Test d'auto-confirmation..."
  
  if [ -z "$LAST_INVOICE_ID" ]; then
    read -p "ID de facture: " invoice_id
  else
    read -p "ID de facture (défaut: $LAST_INVOICE_ID): " invoice_id
    invoice_id=${invoice_id:-$LAST_INVOICE_ID}
  fi
  
  if [ -z "$invoice_id" ]; then
    echo "❌ ID de facture requis"
    return
  fi
  
  RESPONSE=$(curl -s "$TEST_WAVE_URL?action=check&invoice=$invoice_id")
  echo "Réponse: $RESPONSE"
}

# Fonction pour le test complet
test_full_flow() {
  echo "🌊 Test complet du flux Wave..."
  read -p "Montant (défaut: 2500): " amount
  amount=${amount:-2500}
  
  echo "Lancement du test complet avec $amount XOF..."
  RESPONSE=$(curl -s "$TEST_WAVE_URL?action=full&amount=$amount")
  echo "Réponse: $RESPONSE"
  
  # Analyser le résultat
  if echo "$RESPONSE" | jq . > /dev/null 2>&1; then
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success' 2>/dev/null)
    CONFIRMED=$(echo "$RESPONSE" | jq -r '.summary.paymentConfirmed' 2>/dev/null)
    INVOICE_ID=$(echo "$RESPONSE" | jq -r '.steps."1_create".invoice.id' 2>/dev/null)
    
    echo ""
    echo "📊 Résumé:"
    echo "  - Test réussi: $SUCCESS"
    echo "  - Paiement confirmé: $CONFIRMED"
    echo "  - ID Facture: $INVOICE_ID"
    
    if [ "$INVOICE_ID" != "null" ]; then
      export LAST_INVOICE_ID="$INVOICE_ID"
    fi
  fi
}

# Fonction pour tester avec signature invalide
test_invalid_signature() {
  echo "🚫 Test avec signature invalide..."
  
  webhook_payload='{
    "event": "payment.succeeded",
    "data": {
      "id": "txn_invalid_test",
      "status": "succeeded",
      "metadata": {
        "invoice_id": "test_invalid"
      }
    }
  }'
  
  echo "Envoi avec signature invalide..."
  RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "x-webhook-secret: invalid_signature_123" \
    -d "$webhook_payload" \
    "$WAVE_CALLBACK_URL")
  
  echo "Réponse: $RESPONSE"
}

# Fonction pour tester sans signature
test_no_signature() {
  echo "🔓 Test sans signature..."
  
  webhook_payload='{
    "event": "payment.succeeded",
    "data": {
      "id": "txn_no_sig_test",
      "status": "succeeded",
      "metadata": {
        "invoice_id": "test_no_signature"
      }
    }
  }'
  
  echo "Envoi sans signature..."
  RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$webhook_payload" \
    "$WAVE_CALLBACK_URL")
  
  echo "Réponse: $RESPONSE"
}

# Fonction pour afficher l'aide
show_api_help() {
  echo "📚 Aide de l'API de test..."
  RESPONSE=$(curl -s "$TEST_WAVE_URL?action=help")
  echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
}

# Boucle principale
while true; do
  echo ""
  show_menu
  
  case $choice in
    1) test_connectivity ;;
    2) create_test_invoice ;;
    3) simulate_success_webhook ;;
    4) simulate_failure_webhook ;;
    5) test_auto_confirmation ;;
    6) test_full_flow ;;
    7) test_invalid_signature ;;
    8) test_no_signature ;;
    9) show_api_help ;;
    0) 
      echo "👋 Au revoir!"
      exit 0
      ;;
    *)
      echo "❌ Choix invalide"
      ;;
  esac
  
  read -p "Appuyez sur Entrée pour continuer..."
done
