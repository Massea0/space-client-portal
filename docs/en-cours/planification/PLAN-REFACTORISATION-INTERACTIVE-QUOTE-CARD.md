# Plan de Refactorisation pour InteractiveQuoteCard

Le composant `InteractiveQuoteCard` est actuellement très volumineux (506 lignes) et effectue de nombreuses fonctions différentes. Nous allons le décomposer en sous-composants plus petits et plus faciles à maintenir.

## Analyse du composant

Le composant `InteractiveQuoteCard` gère :
1. L'affichage d'un devis sous forme de carte
2. L'état d'expansion/contraction de la carte
3. Les actions disponibles sur le devis (télécharger, voir les détails, modifier, supprimer, etc.)
4. L'affichage des différents statuts du devis
5. Animation d'expansion/contraction

## Plan de décomposition

### 1. Sous-composants à créer

1. **QuoteStatusBadge**
   - Responsabilité : Afficher le badge de statut approprié pour un devis
   - Propriétés : `status: DevisType['status']`
   
2. **QuoteCardHeader**
   - Responsabilité : Afficher l'en-tête de la carte avec le numéro de devis, le statut et la date
   - Propriétés : `quote: DevisType, isExpanded: boolean, onToggleExpand: () => void`

3. **QuoteCardDetails**
   - Responsabilité : Afficher les détails complets du devis (visible uniquement lorsque la carte est développée)
   - Propriétés : `quote: DevisType`

4. **QuoteCardActions**
   - Responsabilité : Afficher et gérer les boutons d'action pour un devis
   - Propriétés : Toutes les fonctions de callback (onDownloadPdf, onViewDetails, etc.)

### 2. Optimisations additionnelles

1. **Utilisation de `React.memo`**
   - Appliquer `React.memo` à tous les sous-composants pour éviter les rendus inutiles
   
2. **Utilisation de `useCallback`**
   - Appliquer `useCallback` aux gestionnaires d'événements pour éviter des recréations inutiles

3. **Utilisation de `useMemo`**
   - Appliquer `useMemo` aux calculs coûteux, comme le formatage des dates ou des montants

## Implémentation

Nous allons créer les sous-composants dans des fichiers séparés dans le même répertoire :

1. `src/components/modules/quotes/QuoteStatusBadge.tsx`
2. `src/components/modules/quotes/QuoteCardHeader.tsx`
3. `src/components/modules/quotes/QuoteCardDetails.tsx`
4. `src/components/modules/quotes/QuoteCardActions.tsx`

Ensuite, nous mettrons à jour `InteractiveQuoteCard.tsx` pour utiliser ces sous-composants.

## Bénéfices attendus

1. **Meilleure maintenabilité** : Chaque sous-composant a une responsabilité claire
2. **Performance améliorée** : Les rendus inutiles sont évités grâce à React.memo
3. **Code plus lisible** : Le composant principal devient beaucoup plus court et plus facile à comprendre
4. **Réutilisation facilitée** : Les sous-composants peuvent être réutilisés ailleurs si nécessaire
