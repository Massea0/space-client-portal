#!/bin/bash

# Script pour déployer les fonctions Edge mises à jour vers Supabase

echo "🚀 Début du déploiement des fonctions Edge..."

# Vérifie que supabase CLI est installé
if ! command -v npx supabase &> /dev/null; then
    echo "❌ Erreur: supabase CLI n'est pas installé. Installez-le avec 'npm install -g supabase'"
    exit 1
fi

# Corrige l'URL de callback dans initiate-payment.js
echo "🔄 Correction de l'URL de callback dans initiate-payment.js..."
SUPABASE_URL=$(grep VITE_SUPABASE_URL .env | cut -d '"' -f 2)

if [ -z "$SUPABASE_URL" ]; then
    echo "⚠️ Variable VITE_SUPABASE_URL non trouvée dans .env, utilisation de la valeur par défaut"
    SUPABASE_URL="https://qlqgyrfqiflnqknbtycw.supabase.co"
fi

echo "📌 URL Supabase détectée: $SUPABASE_URL"

# Remplacer l'URL de callback dans le fichier initiate-payment.js
sed -i.bak "s|callBackURL: \`\${SITE_URL}/api/payment-callback\`|callBackURL: \`${SUPABASE_URL}/functions/v1/dexchange-callback-handler\`|g" ./deployed_edge_functions/initiate-payment.js
echo "✅ URL de callback mise à jour"

# Copie les fichiers déployés mis à jour dans le dossier supabase/functions
echo "📋 Préparation des fichiers pour le déploiement..."

# Vérifier l'existence des dossiers de fonctions
for func in "initiate-payment" "dexchange-callback-handler" "payment-status"; do
    if [ ! -d "./supabase/functions/$func" ]; then
        echo "📁 Création du dossier pour $func..."
        mkdir -p "./supabase/functions/$func"
    fi
done

# Fonction pour copier et déployer
deploy_function() {
    local func_name=$1
    echo "🔄 Déploiement de $func_name..."
    
    # Vérifie si le fichier TypeScript existe déjà
    if [ -f "./supabase/functions/$func_name/index.ts" ]; then
        echo "📝 Un fichier index.ts existe déjà, sauvegarde..."
        mv "./supabase/functions/$func_name/index.ts" "./supabase/functions/$func_name/index.ts.bak"
    fi
    
    # Copie le fichier depuis deployed_edge_functions vers supabase/functions
    echo "📋 Copie de $func_name.js vers index.ts..."
    cp "./deployed_edge_functions/$func_name.js" "./supabase/functions/$func_name/index.ts"
    
    echo "📤 Lancement du déploiement vers Supabase..."
    # Déploie la fonction
    npx supabase functions deploy $func_name
    
    # Vérifie le statut
    if [ $? -eq 0 ]; then
        echo "✅ $func_name déployé avec succès"
    else
        echo "❌ Échec du déploiement de $func_name"
    fi
}

# Déploie les fonctions
deploy_function "initiate-payment"
deploy_function "dexchange-callback-handler"
deploy_function "payment-status"

echo "🎉 Déploiement terminé!"
echo "📋 Pour tester le webhook, exécutez: node test-webhook-simulation-direct.js 3ea15608-ed69-4a66-9c4f-2d30a2830ae0"
