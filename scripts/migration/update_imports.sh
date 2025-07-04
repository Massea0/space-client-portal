#!/bin/bash

# Script pour mettre à jour les imports après la restructuration des dossiers
# Utilisation: bash scripts/migration/update_imports.sh
# Ce script identifie et liste les imports à mettre à jour

echo "🔍 Recherche des imports à mettre à jour..."

# 1. Vérifier les imports d'assets
echo "📦 Imports d'assets à mettre à jour:"
grep -r '@/assets/' --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" src/ | grep -v '/images/' | grep -v '/icons/'

# 2. Vérifier les imports de components/payments
echo -e "\n🔄 Imports de composants payments à mettre à jour:"
grep -r '@/components/payments' --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" src/ | grep -v '@/components/modules/payments'

# 3. Vérifier les imports de components/invoices
echo -e "\n🔄 Imports de composants invoices à mettre à jour:"
grep -r '@/components/invoices' --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" src/ | grep -v '@/components/modules/invoices'

# 4. Vérifier les imports de components/quotes
echo -e "\n🔄 Imports de composants quotes à mettre à jour:"
grep -r '@/components/quotes' --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" src/ | grep -v '@/components/modules/quotes'

# 5. Vérifier les imports de components/dashboard
echo -e "\n🔄 Imports de composants dashboard à mettre à jour:"
grep -r '@/components/dashboard' --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" src/ | grep -v '@/components/modules/dashboard'

echo -e "\n✅ Recherche terminée. Voici les commandes pour remplacer ces imports:"

echo -e "\n# Exemple de commande pour remplacer les imports d'assets"
echo "find src -type f -name \"*.tsx\" -o -name \"*.ts\" | xargs sed -i '' 's|@/assets/wave.png|@/assets/images/wave.png|g'"

echo -e "\n# Exemple de commande pour remplacer les imports de components"
echo "find src -type f -name \"*.tsx\" -o -name \"*.ts\" | xargs sed -i '' 's|@/components/payments|@/components/modules/payments|g'"

echo -e "\n⚠️ ATTENTION: Exécutez ces commandes avec prudence et testez après chaque modification!"
