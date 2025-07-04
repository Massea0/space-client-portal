# Journal de Modifications des Animations de Cartes

## Date : 24 juin 2025

### Problème Identifié
Les cartes interactives dans les pages de Factures et Devis s'agrandissaient en affectant le positionnement des cartes dans les autres colonnes. L'objectif était de limiter l'impact de l'animation d'une carte uniquement aux cartes situées dans la même colonne.

### Solution Implémentée

1. **Suppression des `layoutId` de Framer Motion** :
   - Nous avons supprimé l'attribut `layoutId` des composants `InteractiveInvoiceCard` et `InteractiveQuoteCard`.
   - Le `layoutId` créait une animation globale qui affectait l'ensemble de la mise en page.

2. **Utilisation d'animations locales** :
   - Nous avons remplacé l'animation globale par une animation locale plus simple basée sur `scale` et `opacity`.
   - Ces animations sont confinées à chaque carte et n'affectent pas le flux de mise en page des autres éléments.

3. **Conservation de la distribution en colonnes** :
   - Le composant `InteractiveGrid` continue de répartir les cartes en colonnes en utilisant la fonction `distributeItemsInColumns` du fichier `layoutUtils.ts`.
   - Cette fonction garantit que chaque colonne est indépendante des autres.

### Fichiers Modifiés
- `/src/components/modules/quotes/InteractiveQuoteCard.tsx`
- `/src/components/quotes/InteractiveQuoteCard.tsx`

### Comment tester la solution
1. Exécuter le script de test :
   ```bash
   ./scripts/migration/test_card_animation.sh
   ```

2. Dans le navigateur ouvert, cliquer sur différentes cartes et observer :
   - Que l'expansion d'une carte n'affecte que les cartes situées en dessous dans la même colonne.
   - Que les cartes des autres colonnes restent stables et ne bougent pas.
   - Que l'expérience utilisateur reste fluide et intuitive.

### Remarques supplémentaires
- Cette solution permet une meilleure expérience utilisateur en évitant les mouvements de cartes distantes lors de l'expansion d'une carte.
- La mise en page est plus stable et prévisible.
- L'animation reste fluide et attrayante tout en étant localisée à chaque colonne.
