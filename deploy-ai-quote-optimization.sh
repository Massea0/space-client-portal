#!/bin/bash

echo "🚀 Déploiement edge function ai-quote-optimization..."

# Copier le fichier vers le bon emplacement temporaire
mkdir -p /tmp/supabase_deploy/functions/ai-quote-optimization
cp supabase/functions/ai-quote-optimization/index.ts /tmp/supabase_deploy/functions/ai-quote-optimization/
cp -r supabase/functions/_shared /tmp/supabase_deploy/functions/

# Créer un config.toml minimal
cat > /tmp/supabase_deploy/config.toml << 'EOF'
[functions]
ai-quote-optimization = { verify_jwt = false }
EOF

cd /tmp/supabase_deploy

# Déployer la fonction
npx supabase functions deploy ai-quote-optimization --project-ref qlqgyrfqiflnqknbtycw

echo "✅ Déploiement terminé"
