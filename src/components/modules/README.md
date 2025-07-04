# Modules de Composants

Ce dossier contient des composants organisés par module fonctionnel. Chaque module regroupe les composants liés à une fonctionnalité spécifique de l'application.

## Structure

- `payments/` - Composants liés au paiement et au traitement des transactions
- `invoices/` - Composants pour la gestion et l'affichage des factures
- `quotes/` - Composants pour la gestion et l'affichage des devis
- `dashboard/` - Composants du tableau de bord et visualisations

## Guide d'utilisation

Chaque module expose ses composants via un fichier `index.ts` pour faciliter l'importation. Pour utiliser un composant d'un module, importez-le de la manière suivante :

```tsx
// Importer directement depuis le module spécifique
import { ComponentName } from '@/components/modules/moduleName';

// Ou via le point d'entrée principal des modules
import { ComponentName } from '@/components/modules';
```

## Standardisation des composants

Tous les composants doivent suivre le standard défini dans `docs/guidelines/STANDARD-STRUCTURE-COMPOSANTS.md`.

## Ajout d'un nouveau module

Pour ajouter un nouveau module :

1. Créez un nouveau dossier avec le nom du module sous `/src/components/modules/`
2. Créez un fichier `index.ts` à la racine du dossier du module qui exporte tous les composants
3. Assurez-vous d'ajouter une exportation dans le fichier `index.ts` principal du dossier `modules`
4. Documentez le module dans ce README
