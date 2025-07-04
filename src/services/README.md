# Services

Ce dossier contient tous les services d'API et fonctions d'accès aux données utilisés dans l'application.

## Structure

- `api.ts` : Service principal contenant les fonctions d'API pour toutes les entités du système
  - Gestion des factures, devis, entreprises, utilisateurs, et tickets de support

- `dexchangeApi.ts` : Service dédié aux interactions avec l'API de paiement Dexchange
  - Initialisation des transactions, vérification des statuts, etc.

- `invoices-payment.ts` : Service spécifique pour les opérations de paiement des factures
  - Initiation des paiements, vérification des statuts, etc.

- `quoteService.ts` : Service spécifique pour les opérations liées aux devis
  - Gestion du cycle de vie des devis, conversion en factures, etc.

- `supabaseFunctions.ts` : Fonctions utilitaires pour interagir avec les functions Edge de Supabase
  - Appels aux fonctions de paiement, gestion des webhooks, etc.

- `index.ts` : Point d'entrée central pour tous les services

## Conventions

1. **Organisation du code**:
   - Imports au début du fichier
   - Types et interfaces spécifiques au service après les imports
   - Constantes et configuration
   - Fonctions utilitaires internes
   - Export des fonctions publiques

2. **Gestion des erreurs**:
   - Capturer et logger toutes les erreurs
   - Transformer les erreurs en formats cohérents avant de les renvoyer
   - Utiliser des types pour distinguer les différents types d'erreurs

3. **Documentation**:
   - JSDoc pour toutes les fonctions publiques
   - Commentaires explicatifs pour les parties complexes

4. **Bonnes pratiques**:
   - Pas d'état global dans les services (utiliser des fonctions pures)
   - Séparer les préoccupations dans des fonctions distinctes
   - Réutiliser les fonctions utilitaires entre les services

## Utilisation

Pour utiliser ces services dans les composants, importez-les depuis leur fichier ou via le point d'entrée central :

```typescript
// Import direct d'un service spécifique
import { invoicesPaymentApi } from '@/services/invoices-payment';

// OU via le point d'entrée central
import { invoicesPaymentApi } from '@/services';
```
