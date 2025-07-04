# Plan de Nettoyage du Code - Prochaine Phase

Suite aux actions de nettoyage initiales documentées dans `JOURNAL-NETTOYAGE-CODE.md`, voici les tâches planifiées pour la prochaine phase de refactoring du projet MySpace.

## Tâches prioritaires

### 1. Restructuration des dossiers selon la nouvelle architecture

- [ ] Création de la structure de dossiers conforme au plan :
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
  ```

- [ ] Migration des composants vers cette nouvelle structure
- [ ] Mise à jour des imports dans tout le projet

### 2. Consolidation des services API

- [ ] Vérification des fonctions d'API qui sont dupliquées entre `api.ts` et d'autres services
- [ ] Consolidation des fonctions liées aux factures dans `invoices-payment.ts`
- [ ] Consolidation des fonctions liées aux devis dans `quoteService.ts`
- [ ] Création de services dédiés pour les autres entités si nécessaire

### 3. Standardisation de la structure des composants

- [ ] Revue de tous les composants pour appliquer la structure standardisée :
  - Types et interfaces en haut du fichier
  - Exports nommés vs exports par défaut
  - Organisation cohérente des hooks et effets
  - Extraction des sous-composants dans des fichiers séparés quand approprié

- [ ] Ajout de JSDoc pour les fonctions et composants principaux

## Méthode

1. **Approche par module** : Traiter un module à la fois (invoices, quotes, payments, etc.)
2. **Tests constants** : Valider que l'application fonctionne après chaque modification
3. **Documentation continue** : Mettre à jour le journal des modifications pour chaque étape

## Objectifs à atteindre

- Code plus maintenable et organisé
- Structure de projet cohérente
- Documentation claire pour les nouveaux développeurs
- Réduction des bugs liés à la duplication de code

## Date de début prévue

1er juillet 2025
