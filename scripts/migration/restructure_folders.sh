#!/bin/bash

# Script pour restructurer les dossiers selon la nouvelle architecture
# Utilisation: bash scripts/migration/restructure_folders.sh
# Ce script aide à migrer vers la nouvelle structure de dossiers définie dans le plan de nettoyage

echo "🚀 Début de la restructuration des dossiers..."

# Création des nouveaux dossiers
echo "📂 Création des nouveaux dossiers..."

# Structure des composants
mkdir -p src/components/ui
mkdir -p src/components/forms
mkdir -p src/components/layouts
mkdir -p src/components/modules/payments
mkdir -p src/components/modules/invoices
mkdir -p src/components/modules/quotes
mkdir -p src/components/modules/companies

# Autres dossiers
mkdir -p src/pages/admin
mkdir -p src/pages/client
mkdir -p src/hooks
mkdir -p src/utils
mkdir -p src/assets/images
mkdir -p src/assets/icons

echo "✅ Structure de dossiers créée"

# Ce script ne déplace pas automatiquement les fichiers pour éviter des erreurs
# Mais il fournit des instructions pour les déplacements manuels
echo """
🔍 INSTRUCTIONS POUR LA MIGRATION MANUELLE:

1. Déplacer les composants UI:
   - Les composants de base (button.tsx, input.tsx, etc.) restent dans src/components/ui/

2. Déplacer les composants spécifiques:
   - Déplacer src/components/payments/ → src/components/modules/payments/
   - Déplacer src/components/invoices/ → src/components/modules/invoices/
   - Déplacer src/components/quotes/ → src/components/modules/quotes/

3. Déplacer les assets:
   - Déplacer src/assets/*.png → src/assets/images/
   
4. Mettre à jour les imports après chaque déplacement:
   - Pour les assets, exécutez: grep -r '@/assets/' --include="*.tsx" --include="*.ts" src/ | grep -v '/images/'
   - Mettez à jour manuellement les imports identifiés, par exemple:
     * '@/assets/wave.png' → '@/assets/images/wave.png'
   
   - Pour les composants, exécutez: 
     * grep -r '@/components/payments' --include="*.tsx" --include="*.ts" src/
     * Remplacez par '@/components/modules/payments'

⚠️ IMPORTANT: Après chaque déplacement de fichier, vérifiez que l'application fonctionne toujours !
"""

echo "📋 Pour commencer la migration manuelle, exécutez:"
echo "code docs/journal/MIGRATION-STRUCTURE-DOSSIERS.md"
