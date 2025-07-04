# Lib

Ce dossier contient les utilitaires, helpers, et configurations utilisés dans l'application.

## Structure

- `animation-utils.ts` : Utilitaires pour les animations et transitions
  - Fonctions d'aide pour Framer Motion et autres animations

- `cache.ts` : Fonctions pour la mise en cache locale
  - Mise en cache des résultats d'API, gestion du cache

- `diagnostics.ts` : Outils de diagnostic et de débogage
  - Logging, mesure de performance, etc.

- `errorReporter.ts` : Service de rapport d'erreurs
  - Capture et envoi des erreurs aux services de monitoring

- `layoutUtils.ts` : Fonctions utilitaires pour la mise en page
  - Calculs de position, gestion des dimensions, etc.

- `pdfGenerator.ts` : Génération de PDF pour les factures et devis
  - Création de documents imprimables

- `react-children-utils.tsx` : Utilitaires pour la manipulation des enfants React
  - Gestion et validation des children dans les composants

- `robustSupabaseClient.ts` : Client Supabase robuste avec gestion des erreurs
  - Amélioration du client Supabase standard 

- `supabaseClient.ts` : Initialisation et configuration du client Supabase
  - Point d'entrée principal pour Supabase

- `supabaseErrorHandler.ts` : Gestion des erreurs spécifiques à Supabase
  - Traduction et formatage des erreurs 

- `utils.ts` : Fonctions utilitaires générales
  - Formatage de dates, nombres, textes, etc.

## Conventions

1. **Organisation du code**:
   - Fonctions groupées par domaine ou fonctionnalité
   - Types et interfaces en haut du fichier
   - Export nommé (pas d'export par défaut)

2. **Documentation**:
   - JSDoc pour toutes les fonctions publiques
   - Commentaires explicatifs pour les parties complexes

3. **Bonnes pratiques**:
   - Fonctions pures quand c'est possible
   - Séparation des préoccupations
   - Tests unitaires pour les fonctions critiques

## Utilisation

Pour utiliser ces utilitaires dans les composants :

```typescript
// Importation de fonctions spécifiques
import { formatDate, formatCurrency } from '@/lib/utils';
import { ensureSingleElement } from '@/lib/react-children-utils';

// Utilisation de fonctions spécifiques à Supabase
import { supabase } from '@/lib/supabaseClient';
```
