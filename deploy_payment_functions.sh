#!/bin/bash

# Script pour déployer les Edge Functions de paiement avec configuration locale

echo "🚀 Déploiement des Edge Functions de paiement..."

# Vérifier que la CLI Supabase est installée
if ! command -v npx supabase &> /dev/null; then
    echo "❌ Erreur: Supabase CLI n'est pas installée."
    echo "   Installez avec: npm install -g supabase"
    exit 1
fi

# Naviguer vers le répertoire des fonctions
cd "$(dirname "$0")/supabase/functions" || exit 1

echo "📂 Répertoire de travail: $(pwd)"
echo "📋 Configuration actuelle:"
cat config.toml

echo ""
echo "🔧 Déploiement des fonctions de paiement..."

# Déployer les fonctions de paiement une par une
echo "  → initiate-payment"
npx supabase functions deploy initiate-payment

echo "  → payment-status" 
npx supabase functions deploy payment-status

echo "  → get-payment-url"
npx supabase functions deploy get-payment-url

echo "  → dexchange-callback-handler"
npx supabase functions deploy dexchange-callback-handler

echo ""
echo "✅ Déploiement terminé!"
echo ""
echo "🔍 Vérification des fonctions déployées:"
npx supabase functions list

echo ""
echo "🌍 URLs des fonctions:"
echo "  • initiate-payment: https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/initiate-payment"
echo "  • payment-status: https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/payment-status"
echo "  • get-payment-url: https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/get-payment-url"
echo "  • dexchange-callback-handler: https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/dexchange-callback-handler"

echo ""
echo "⚠️  IMPORTANT:"
echo "   La configuration SITE_URL est actuellement: http://localhost:8080"
echo "   Ceci permet les tests en local mais doit être changé pour la production."
echo "   Pour changer: modifiez config.toml et redéployez."
