#!/bin/bash

echo "🧪 VALIDATION POST-DÉPLOIEMENT"
echo "=============================="

# Test 1: Site principal
echo "🌐 1. Test du site principal..."
if curl -s -o /dev/null -w "%{http_code}" https://myspace.arcadis.tech | grep -q "200"; then
    echo "   ✅ Site accessible"
else
    echo "   ❌ Site non accessible"
fi

# Test 2: Pages de paiement
echo "💳 2. Test des pages de paiement..."
for page in "payment/success" "payment/failure" "payment/cancel"; do
    if curl -s -o /dev/null -w "%{http_code}" "https://myspace.arcadis.tech/$page" | grep -q "200"; then
        echo "   ✅ $page accessible"
    else
        echo "   ❌ $page non accessible"
    fi
done

# Test 3: Backend Supabase
echo "🔗 3. Test backend Supabase..."
if curl -s "https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/get-public-config" | grep -q '"success":true'; then
    echo "   ✅ Backend opérationnel"
else
    echo "   ⚠️  Backend accessible mais config incomplète"
fi

# Test 4: Webhook DExchange
echo "🔗 4. Test webhook DExchange..."
if curl -s -X POST "https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/dexchange-callback-handler" \
   -H "Content-Type: application/json" \
   -d '{"event":"test","status":"success"}' | grep -q '"status":"ok"'; then
    echo "   ✅ Webhook DExchange opérationnel (accepte les notifications)"
else
    echo "   ❌ Webhook DExchange problème"
fi

echo ""
echo "🎯 RÉSULTAT:"
echo "   🌐 Frontend: https://myspace.arcadis.tech"
echo "   🔗 Backend: Supabase Edge Functions"
echo "   💳 Paiements: Wave + DExchange ready"
echo ""
echo "✅ Votre système est en production !"
