#!/bin/bash

# Script pour déployer la nouvelle version avec modèles de référence
echo "🚀 Déploiement de l'optimisation IA avec modèles de référence"

# 1. Sauvegarder l'ancienne version
echo "📦 Sauvegarde de l'ancienne version..."
cp supabase/functions/ai-quote-optimization/index.ts supabase/functions/ai-quote-optimization/index_backup_$(date +%Y%m%d_%H%M%S).ts

# 2. Déployer la nouvelle version
echo "🔄 Remplacement par la nouvelle version..."
cp supabase/functions/ai-quote-optimization/index_with_reference_models.ts supabase/functions/ai-quote-optimization/index.ts

# 3. Déployer vers Supabase
echo "☁️ Déploiement vers Supabase..."
npx supabase functions deploy ai-quote-optimization

if [ $? -eq 0 ]; then
    echo "✅ Déploiement réussi !"
    echo ""
    echo "📋 Prochaines étapes:"
    echo "1. Exécuter le script SQL pour créer les tables de référence"
    echo "2. Créer quelques modèles de référence via l'interface admin"
    echo "3. Tester l'optimisation IA avec contraintes"
    echo ""
    echo "🔗 Interface admin: https://myspace.arcadis.tech/admin/reference-quotes"
else
    echo "❌ Erreur lors du déploiement"
    exit 1
fi
