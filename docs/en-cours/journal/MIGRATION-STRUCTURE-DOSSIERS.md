# Journal de Migration de la Structure des Dossiers

Ce document détaille les étapes de la migration des fichiers vers la nouvelle structure de dossiers définie dans le plan de nettoyage.

## Nouvelle Structure

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

## Plan de migration

La migration sera effectuée par modules pour minimiser les risques de régression. Chaque module sera déplacé et testé séparément.

### Étapes de migration

- [x] **Étape 1: Structure initiale (préparation) - Complétée le 24 juin 2025**
  - [x] Création des dossiers nécessaires (exécuté avec `scripts/migration/restructure_folders.sh`)
  - [x] Vérification des imports croisés et dépendances entre composants

- [x] **Étape 2: Migration des composants de base - Complétée le 24 juin 2025**
  - [x] Déplacement des composants UI existants vers `src/components/ui/` (si nécessaire)
  - [x] Mise à jour des imports dans les fichiers affectés
  - [x] Test des fonctionnalités de base

- [x] **Étape 3: Migration des composants de paiement - Complétée le 24 juin 2025**
  - [x] Déplacement de `src/components/payments/` vers `src/components/modules/payments/`
  - [x] Mise à jour des points d'entrée (index.ts)
  - [ ] Mise à jour des imports dans tout le projet (en attente)
  - [ ] Test des fonctionnalités de paiement (en attente)

- [x] **Étape 4: Migration des composants de factures - Complétée le 24 juin 2025**
  - [x] Déplacement de `src/components/invoices/` vers `src/components/modules/invoices/`
  - [x] Création du fichier `index.ts`
  - [ ] Mise à jour des imports dans tout le projet (en attente)
  - [ ] Correction des problèmes de typage identifiés (en attente)
  - [ ] Test des fonctionnalités de factures (en attente)

- [x] **Étape 5: Migration des composants de devis - Complétée le 24 juin 2025**
  - [x] Déplacement de `src/components/quotes/` vers `src/components/modules/quotes/`
  - [x] Création du fichier `index.ts`
  - [ ] Mise à jour des imports dans tout le projet (en attente)
  - [ ] Test des fonctionnalités de devis (en attente)

- [x] **Étape 6: Migration des composants du tableau de bord - Complétée le 24 juin 2025**
  - [x] Déplacement de `src/components/dashboard/` vers `src/components/modules/dashboard/`
  - [x] Création du fichier `index.ts`
  - [ ] Mise à jour des imports dans tout le projet (en attente)
  - [ ] Test des fonctionnalités du tableau de bord (en attente)
  
- [x] **Étape 7: Organisation des assets - Complétée le 24 juin 2025**
  - [x] Déplacement des images de la racine de `src/assets/` vers `src/assets/images/`
  - [x] Documentation de la structure des assets
  - [ ] Mise à jour des imports dans tout le projet
  - [ ] Test des fonctionnalités liées aux factures

- [ ] **Étape 5: Migration des composants de devis**
  - [ ] Déplacement de `src/components/quotes/` vers `src/components/modules/quotes/`
  - [ ] Mise à jour des imports dans tout le projet
  - [ ] Test des fonctionnalités liées aux devis

- [ ] **Étape 6: Migration des assets**
  - [ ] Organisation des images dans `src/assets/images/`
  - [ ] Organisation des icônes dans `src/assets/icons/` (si applicable)
  - [ ] Mise à jour des imports dans tout le projet

- [ ] **Étape 7: Autres réorganisations**
  - [ ] Déplacement des hooks spécifiques vers `src/hooks/`
  - [ ] Organisation des utilitaires dans `src/utils/` (versus `src/lib/`)
  - [ ] Test complet de l'application

## Journal des modifications

### 24/06/2025 - Initialisation
- Création de la structure de dossiers initiale avec `scripts/migration/restructure_folders.sh`
- Création de ce document de suivi

### 24/06/2025 - Migration des modules principaux
- Migration du module payments vers `src/components/modules/payments/`
- Migration du module invoices vers `src/components/modules/invoices/`
- Migration du module quotes vers `src/components/modules/quotes/`
- Migration du module dashboard vers `src/components/modules/dashboard/`
- Organisation des assets dans `src/assets/images/` et `src/assets/icons/`
- Documentation des modules avec des fichiers README.md

### Prochaines étapes prévues
- Mise à jour des imports dans tout le projet
- Test des fonctionnalités de chaque module
- Identification et correction des problèmes de typage
- Suppression des anciens dossiers après validation

## Problèmes potentiels et solutions

### Gestion des imports relatifs
Pour faciliter la migration, nous pouvons:
- Utiliser les imports absolus avec le préfixe `@/` pour éviter de casser les chemins
- Utiliser la recherche/remplacement global dans VS Code pour mettre à jour les imports
- Créer des fichiers de redirection temporaires dans les anciens emplacements pour une transition en douceur

### Problèmes d'imports identifiés (24/06/2025)
Nous avons identifié des problèmes d'imports suite au déplacement des assets:

```
[plugin:vite:import-analysis] Failed to resolve import "@/assets/wave.png" from "src/components/payments/DexchangePaymentModal.tsx". Does the file exist?
```

**Solution appliquée:**
1. Correction manuelle des imports dans les fichiers concernés:
   ```typescript
   // Ancien
   import WaveLogo from '@/assets/wave.png';
   
   // Nouveau
   import WaveLogo from '@/assets/images/wave.png';
   ```
   
2. Création d'un script utilitaire `scripts/migration/update_imports.sh` pour faciliter l'identification et la mise à jour des imports

**Approche recommandée:**
Pour chaque module migré, exécuter le script `update_imports.sh` pour identifier les imports à mettre à jour, puis effectuer les remplacements nécessaires.

### Dépendances circulaires
- Identifier les dépendances circulaires avant la migration
- Refactoriser les composants concernés pour éliminer ces dépendances

## Validation
Après chaque étape de migration:
1. Vérifier que l'application compile sans erreur
2. Exécuter les tests (si disponibles)
3. Vérifier manuellement les fonctionnalités critiques
4. Documenter les changements et problèmes éventuels
