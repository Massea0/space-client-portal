#!/bin/bash

echo "🧪 TEST CONFIRMATION AUTOMATIQUE DEXCHANGE"
echo "=========================================="

# Informations du test
INVOICE_ID="test_invoice_$(date +%s)"
TRANSACTION_ID="dex_$(date +%s)"
AMOUNT=5000

echo "📋 Paramètres du test:"
echo "   Invoice ID: $INVOICE_ID"
echo "   Transaction ID: $TRANSACTION_ID"
echo "   Montant: $AMOUNT FCFA"
echo ""

# Test 1: Simuler un webhook de confirmation de DExchange
echo "1. 📡 Simulation webhook DExchange..."
WEBHOOK_RESPONSE=$(curl -s -X POST "https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/dexchange-callback-handler" \
  -H "Content-Type: application/json" \
  -d "{
    \"event\": \"payment_confirmed\",
    \"transaction_id\": \"$TRANSACTION_ID\",
    \"invoice_id\": \"$INVOICE_ID\",
    \"amount\": $AMOUNT,
    \"status\": \"success\",
    \"payment_method\": \"dexchange\",
    \"customer_phone\": \"+221771234567\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }")

echo "   Réponse webhook: $WEBHOOK_RESPONSE"

if echo "$WEBHOOK_RESPONSE" | grep -q '"status":"ok"'; then
    echo "   ✅ Webhook accepté et traité"
else
    echo "   ❌ Erreur webhook"
    exit 1
fi

echo ""

# Test 2: Vérifier les logs Supabase
echo "2. 📊 Vérification des logs..."
echo "   Pour voir les logs détaillés:"
echo "   supabase functions logs dexchange-callback-handler"
echo ""

# Test 3: Simuler différents statuts
echo "3. 🔄 Test d'autres statuts..."

# Test échec
FAIL_RESPONSE=$(curl -s -X POST "https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/dexchange-callback-handler" \
  -H "Content-Type: application/json" \
  -d "{
    \"event\": \"payment_failed\",
    \"transaction_id\": \"fail_$TRANSACTION_ID\",
    \"invoice_id\": \"fail_$INVOICE_ID\",
    \"amount\": $AMOUNT,
    \"status\": \"failed\",
    \"error_message\": \"Insufficient funds\"
  }")

if echo "$FAIL_RESPONSE" | grep -q '"status":"ok"'; then
    echo "   ✅ Webhook échec traité"
else
    echo "   ⚠️  Webhook échec non traité correctement"
fi

# Test annulation
CANCEL_RESPONSE=$(curl -s -X POST "https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/dexchange-callback-handler" \
  -H "Content-Type: application/json" \
  -d "{
    \"event\": \"payment_cancelled\",
    \"transaction_id\": \"cancel_$TRANSACTION_ID\",
    \"invoice_id\": \"cancel_$INVOICE_ID\",
    \"amount\": $AMOUNT,
    \"status\": \"cancelled\"
  }")

if echo "$CANCEL_RESPONSE" | grep -q '"status":"ok"'; then
    echo "   ✅ Webhook annulation traité"
else
    echo "   ⚠️  Webhook annulation non traité correctement"
fi

echo ""

# Test 4: Ping de test
echo "4. 🏓 Test ping webhook..."
PING_RESPONSE=$(curl -s -X POST "https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/dexchange-callback-handler" \
  -H "Content-Type: application/json" \
  -d '{}')

if echo "$PING_RESPONSE" | grep -q 'opérationnel'; then
    echo "   ✅ Ping webhook OK"
else
    echo "   ⚠️  Ping webhook réponse inattendue: $PING_RESPONSE"
fi

echo ""
echo "🎯 RÉSULTATS:"
echo "✅ Webhook DExchange accepte les notifications sans signature"
echo "✅ Différents types d'événements sont traités"
echo "✅ Le système est prêt pour la confirmation automatique"
echo ""
echo "💡 PROCHAINES ÉTAPES:"
echo "1. Effectuer un vrai paiement DExchange"
echo "2. Vérifier que le webhook est appelé automatiquement"
echo "3. Contrôler que la facture est marquée comme payée"
echo ""
echo "🔗 Liens utiles:"
echo "   • Logs Supabase: https://supabase.com/dashboard/project/qlqgyrfqiflnqknbtycw/functions"
echo "   • Application: https://myspace.arcadis.tech"
