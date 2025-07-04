# Correction de l'erreur d'importation dans AnimatedModal

## 26 juin 2025 - Correction de l'erreur d'exportation manquante

**Problème identifié :**
Une erreur bloquante apparaissait dans la console :
```
Uncaught SyntaxError: The requested module '/src/lib/react-children-utils.ts' does not provide an export named 'createNestedModalWrapper'
```

**Cause :**
Nous avions deux fichiers d'utilitaires React similaires mais distincts :
- `/src/lib/react-children-utils.ts`
- `/src/lib/react-children-utils.tsx` 

La fonction `createNestedModalWrapper` était référencée dans `animated-modal.tsx` mais n'existait pas dans le fichier importé.

**Solution appliquée :**
1. Ajout de la fonction `createNestedModalWrapper` au fichier `.tsx`
2. Correction de l'import dans `animated-modal.tsx` pour utiliser l'extension `.tsx` explicitement
3. Transformation du fichier `.ts` en un fichier de compatibilité qui réexporte tout depuis le fichier `.tsx`
4. Création d'un plan de fusion pour consolider ces utilitaires à long terme

**Avantages de cette approche :**
- Correction immédiate des erreurs bloquantes en production
- Maintien de la compatibilité avec le code existant
- Plan clair pour éviter les problèmes similaires à l'avenir

**Fichiers modifiés :**
- `/src/lib/react-children-utils.tsx` - ajout de la fonction manquante
- `/src/lib/react-children-utils.ts` - transformé en réexportation
- `/src/components/ui/animated-modal.tsx` - correction de l'import
- `/Users/a00/myspace/PLAN-FUSION-REACT-UTILS.md` - nouveau fichier documentant le plan de fusion
