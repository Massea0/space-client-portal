# Plan de Refactorisation des Services API

## Problème identifié
Le fichier `api.ts` est trop volumineux (environ 700 lignes) et contient plusieurs services différents, ce qui rend la maintenance difficile.

## Solution proposée
Extraire chaque service dans un fichier séparé tout en maintenant la compatibilité avec le code existant.

## Plan d'exécution

### Étape 1 : Analyser le fichier api.ts
- Identifier les différents services (devis, factures, tickets, etc.)
- Déterminer les interfaces communes

### Étape 2 : Créer de nouveaux fichiers de service
- `invoiceApi.ts` - Service pour les factures
- `devisApi.ts` - Service pour les devis
- `ticketApi.ts` - Service pour les tickets
- `companyApi.ts` - Service pour les entreprises
- `userApi.ts` - Service pour les utilisateurs

### Étape 3 : Migration progressive
Pour éviter de casser l'application existante, nous allons :
1. Créer les nouveaux services avec une nomenclature différente (ex: `invoiceApiV2`)
2. Mettre à jour le fichier `api.ts` pour qu'il utilise ces nouveaux services
3. Déprécier progressivement les anciens services

### Étape 4 : Mise à jour des imports dans le code client
Une fois que les nouveaux services fonctionnent correctement, nous mettrons à jour les imports dans les composants qui utilisent directement l'API.

## Nomenclature et structure
Chaque nouveau fichier de service suivra cette structure :
```typescript
// src/services/entityApi.ts
import { supabase } from '@/lib/supabaseClient';
import { Entity } from '@/types';

export const entityApiV2 = {
  // Méthodes du service
};

export default entityApiV2;
```
