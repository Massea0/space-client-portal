#!/bin/bash

# Script d'analyse des composants React nécessitant une optimisation
# Ce script identifie les composants volumineux, les re-rendus potentiellement inutiles et autres opportunités d'optimisation

echo "🔍 Analyse des composants React pour opportunités d'optimisation..."

# Définir les seuils
SIZE_THRESHOLD=200  # Nombre de lignes à partir duquel un composant est considéré comme volumineux
COMPLEXITY_KEYWORDS=("useState" "useEffect" "useContext" "map(" "filter(" "reduce(" "sort(")

# 1. Trouver les composants volumineux
echo -e "\n📏 COMPOSANTS VOLUMINEUX (> $SIZE_THRESHOLD lignes):"
find src/components -type f -name "*.tsx" -not -path "*/node_modules/*" | xargs wc -l | sort -nr | grep -v "total" | head -10

# 2. Trouver les composants avec des états potentiellement inutiles
echo -e "\n🔄 COMPOSANTS AVEC ÉTATS MULTIPLES (potentiellement à optimiser):"
grep -r "useState(" --include="*.tsx" src/components | cut -d: -f1 | sort | uniq -c | sort -nr | head -10

# 3. Trouver les effets sans dépendances bien définies
echo -e "\n⚠️  EFFETS AVEC DÉPENDANCES POTENTIELLEMENT PROBLÉMATIQUES:"
grep -r "useEffect" --include="*.tsx" --after-context=2 src/components | grep -e "\[\]" -e ", \[\]" | cut -d: -f1 | sort | uniq -c | sort -nr

# 4. Chercher les composants qui pourraient bénéficier de mémoïsation
echo -e "\n💾 COMPOSANTS CANDIDATS POUR MÉMOÏSATION (fonctions complexes sans React.memo):"
grep -r -L "React.memo" --include="*.tsx" src/components | xargs grep -l "return (" | sort

# 5. Vérifier l'utilisation de React.memo, useCallback et useMemo
echo -e "\n📊 UTILISATION ACTUELLE DES TECHNIQUES D'OPTIMISATION:"
echo "- React.memo: $(grep -r "React.memo" --include="*.tsx" src/components | wc -l) occurrences"
echo "- useCallback: $(grep -r "useCallback" --include="*.tsx" src/components | wc -l) occurrences"
echo "- useMemo: $(grep -r "useMemo" --include="*.tsx" src/components | wc -l) occurrences"

# 6. Analyser la complexité des composants (heuristique basée sur des mots-clés)
echo -e "\n🧮 ANALYSE DE COMPLEXITÉ (basée sur useState, map, filter, etc.):"
for keyword in "${COMPLEXITY_KEYWORDS[@]}"
do
  count=$(grep -r "$keyword" --include="*.tsx" src/components | wc -l)
  echo "- $keyword: $count occurrences"
done

echo -e "\n✅ Analyse terminée. Utilisez ces informations pour prioriser les efforts d'optimisation."
echo "   Consultez docs/guidelines/GUIDE-OPTIMISATION-PERFORMANCES-REACT.md pour les techniques d'optimisation."
