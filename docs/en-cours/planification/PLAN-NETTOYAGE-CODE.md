# Plan de Nettoyage du Code - Projet MySpace

## Objectifs

- Organiser et nettoyer la structure du projet
- Éliminer les fichiers et importations inutilisés
- Standardiser les conventions de nommage et la structure des composants
- Améliorer la lisibilité et la maintenabilité du code
- Optimiser les performances

## 1. Analyse de la structure actuelle

### Fichiers potentiellement obsolètes

- **Fichiers temporaires à identifier**
  - Vérifier tous les fichiers avec les suffixes `.temp`, `.fixed`, `.old`, etc.
  - Localiser les fichiers avec des noms similaires (ex: DexchangePaymentModal vs DexchangePaymentModalSimple)
  - Identifier les composants dupliqués avec des fonctionnalités similaires

- **Scripts de déploiement et de test**
  - Analyser les nombreux scripts présents à la racine du projet
  - Déterminer quels scripts sont actifs et lesquels sont obsolètes
  - Standardiser les noms et la documentation des scripts

### Problèmes de structure

- **Architecture des dossiers**
  - Organisation potentiellement incohérente des composants UI/fonctionnels
  - Segmentation insuffisante des modules principaux
  - Distinction floue entre composants, pages et services

- **Gestion des assets**
  - Organisation des images et autres ressources statiques
  - Normalisation des noms de fichiers

## 2. Plan d'action détaillé

### Phase 1: Audit et cartographie

1. **Inventaire complet des fichiers**
   - Liste de tous les fichiers du projet par type (.tsx, .ts, .js, .css, etc.)
   - Analyse des dépendances entre fichiers
   - Identification des fichiers inutilisés ou dupliqués

2. **Analyse d'utilisation des composants**
   - Traces d'utilisation de chaque composant
   - Liste des composants non utilisés
   - Identification des composants avec des fonctionnalités dupliquées

3. **Cartographie des services et APIs**
   - Documentation des services existants
   - Relevé des appels directs à l'API Supabase vs services dédiés
   - Identification des services pouvant être consolidés

### Phase 2: Restructuration des dossiers et fichiers

1. **Définition de la nouvelle structure**
   ```
   src/
     components/
       ui/             # Composants de base réutilisables
       forms/          # Composants de formulaire
       layouts/        # Layouts réutilisables
       modules/        # Composants spécifiques aux fonctionnalités
         payments/     # Composants liés au paiement
         invoices/     # Composants liés aux factures
         quotes/       # Composants liés aux devis
         companies/    # Composants liés aux entreprises
     pages/            # Pages de l'application
       admin/          # Pages d'administration
       client/         # Pages client
     hooks/            # Hooks personnalisés
     services/         # Services d'API
     utils/            # Fonctions utilitaires
     types/            # Définitions de types
     lib/              # Bibliothèques et configurations
     assets/           # Ressources statiques
   ```

2. **Migration des fichiers**
   - Déplacer chaque fichier vers son emplacement approprié
   - Mettre à jour les importations
   - Valider le fonctionnement après chaque déplacement

3. **Nettoyage des fichiers obsolètes**
   - Supprimer les versions temporaires et fichiers de test non utilisés
   - Consolider les variantes de composants similaires
   - Documenter les suppressions dans le journal de modifications

### Phase 3: Standardisation du code

1. **Convention de nommage**
   - PascalCase pour les composants React
   - camelCase pour les fonctions et variables
   - UPPER_SNAKE_CASE pour les constantes
   - kebab-case pour les fichiers CSS et assets

2. **Structure des composants**
   - Types et interfaces en haut du fichier
   - Exports nommés vs exports par défaut
   - Organisation cohérente des hooks et effets
   - Extraction des sous-composants dans des fichiers séparés quand approprié

3. **Documentation**
   - JSDoc pour les fonctions et composants principaux
   - Types bien définis pour toutes les props
   - Commentaires explicatifs pour les parties complexes

### Phase 4: Optimisation des performances

1. **Révision des rendus inutiles**
   - Utilisation appropriée de useCallback/useMemo
   - Memoization des composants avec React.memo quand nécessaire
   - Réduction des re-rendus avec une meilleure gestion d'état

2. **Chargement optimisé**
   - Dynamic imports pour les parties non critiques
   - Code splitting par route/fonctionnalité
   - Optimisation des assets (images, etc.)

3. **Gestion de l'état globale**
   - Révision de l'utilisation de l'état global
   - Éviter les props drilling excessifs

## 3. Tests et validation

1. **Tests unitaires**
   - S'assurer que tous les composants fonctionnent après refactoring
   - Ajouter des tests pour les composants critiques

2. **Tests fonctionnels**
   - Valider que toutes les fonctionnalités principales fonctionnent
   - Tester les flux complets (ex: création facture → paiement → confirmation)

3. **Audit de qualité**
   - Revue de code par pairs
   - Audit de performance avec les outils Chrome DevTools
   - Vérification d'accessibilité

## 4. Priorisation et calendrier

### Haute priorité (Semaine 1-2)
- Nettoyage des fichiers de composants liés au paiement (DexchangePaymentModal)
- Standardisation des services API avec migration des appels directs vers des services dédiés
- Élimination des fichiers dupliqués et temporaires

### Moyenne priorité (Semaine 3-4)
- Restructuration des dossiers selon la nouvelle architecture
- Standardisation de la structure des composants
- Optimisations de performances de base

### Basse priorité (Semaine 5-6)
- Documentation complète
- Optimisations avancées
- Tests complets

## 5. Documentation continue

- Maintenir un journal de toutes les modifications apportées
- Mettre à jour le guide de style et les conventions
- Documenter les décisions architecturales

Ce plan servira de feuille de route pour améliorer progressivement la qualité du code du projet MySpace sans perturber son fonctionnement. Chaque modification sera documentée et validée pour garantir une transition en douceur vers une base de code plus propre et maintenable.
