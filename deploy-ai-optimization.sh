#!/bin/bash

# Script de déploiement spécifique pour la fonction d'optimisation IA
echo "🧠 Déploiement de la fonction d'optimisation IA corrigée..."

# Aller dans le bon répertoire
cd /Users/a00/myspace

# Vérifier que la fonction existe
if [ ! -f "supabase/functions/ai-quote-optimization/index.ts" ]; then
    echo "❌ Erreur: Fonction ai-quote-optimization non trouvée"
    exit 1
fi

echo "📋 Fonction trouvée: supabase/functions/ai-quote-optimization/index.ts"
echo "🚀 Déploiement en cours..."

# Déployer la fonction
npx supabase functions deploy ai-quote-optimization --project-ref qlqgyrfqiflnqknbtycw

if [ $? -eq 0 ]; then
    echo "✅ Déploiement réussi!"
    echo "🔗 Fonction disponible à: https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/ai-quote-optimization"
else
    echo "❌ Erreur lors du déploiement"
    exit 1
fi
