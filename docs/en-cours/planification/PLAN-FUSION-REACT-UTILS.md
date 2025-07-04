# Plan de Fusion des Utilitaires React

## Problème identifié - 26 juin 2025

Nous avons identifié un doublon dans notre base de code concernant les utilitaires React :

1. `/src/lib/react-children-utils.ts`
2. `/src/lib/react-children-utils.tsx`

Ces deux fichiers contiennent des fonctionnalités similaires mais avec des implémentations différentes, ce qui a conduit à des erreurs d'importation et des fonctionnalités manquantes.

## Plan de résolution

### Étape 1: Analyse des dépendances (déjà réalisée)
- ✅ Le fichier `.tsx` est utilisé par des composants critiques comme `animated-modal.tsx`
- ✅ Les deux fichiers ont des implémentations de `ensureSingleElement` et `AsChildSafeWrapper`
- ✅ Le fichier `.tsx` offre davantage de fonctionnalités et une meilleure gestion des cas d'erreur

### Étape 2: Plan de migration
1. Fusionner toutes les fonctionnalités uniques du fichier `.ts` dans le fichier `.tsx`
2. Corriger les imports dans tous les fichiers qui utilisent directement `react-children-utils.ts`
3. Remplacer le fichier `.ts` par un fichier qui exporte tout depuis le fichier `.tsx` pour maintenir la compatibilité
4. Test exhaustif pour s'assurer qu'il n'y a pas d'autres erreurs

### Étape 3: Documentation
1. Mettre à jour les guides de développement pour préciser que `react-children-utils.tsx` est le fichier à utiliser
2. Documenter toutes les fonctionnalités disponibles dans le fichier consolidé

### Étape 4: Clean-up
1. En fonction des tests, prévoir la suppression du fichier de compatibilité à une date ultérieure
2. Ajouter un message de dépréciation pour les applications qui utilisent encore l'ancien chemin d'import

## Avantages de cette approche
- Maintient la compatibilité avec le code existant
- Centralise la logique liée à la gestion des enfants React
- Évite les erreurs d'importation et les fonctionnalités manquantes
- Simplifie la maintenance future
