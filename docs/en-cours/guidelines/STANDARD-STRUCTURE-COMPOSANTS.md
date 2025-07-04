# Guide de Structure Standard des Composants

Ce document définit la structure standard à adopter pour tous les composants React dans le projet MySpace.

## Structure de base d'un composant

```tsx
// 1. Imports groupés par catégorie
// React et hooks
import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Types et interfaces
import type { SomeType, AnotherType } from '@/types';

// Composants UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Utilitaires et services
import { formatDate, cn } from '@/lib/utils';
import { someService } from '@/services';

// Assets et styles
import './OptionalComponentStyle.css';

// 2. Types et interfaces spécifiques au composant
interface ComponentProps {
  /** Description de la propriété avec JSDoc */
  propertyOne: string;
  /** Une autre propriété avec une description claire */
  propertyTwo?: number;
  /** Fonction de rappel déclenchée lors d'une action */
  onSomeAction: (value: string) => void;
}

/**
 * Composant qui fait XYZ.
 * Description complète de l'objectif et du fonctionnement du composant.
 * 
 * @example
 * ```tsx
 * <ComponentName 
 *   propertyOne="value"
 *   onSomeAction={(value) => console.log(value)} 
 * />
 * ```
 */
export const ComponentName: React.FC<ComponentProps> = ({
  propertyOne,
  propertyTwo = 0, // Valeur par défaut si propriété optionnelle
  onSomeAction,
}) => {
  // 3. Hooks d'état et d'effet
  const [state, setState] = useState<string>('');
  
  // 4. Handlers et fonctions
  const handleClick = useCallback(() => {
    setState('new value');
    onSomeAction(state);
  }, [state, onSomeAction]);
  
  // 5. Valeurs dérivées et memoization
  const derivedValue = useMemo(() => {
    return `${propertyOne}-${propertyTwo}`;
  }, [propertyOne, propertyTwo]);
  
  // 6. Effets
  useEffect(() => {
    // Effet avec nettoyage si nécessaire
    const timer = setTimeout(() => {
      // Action
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [propertyOne]);
  
  // 7. Rendu conditionnel dans des fonctions séparées
  const renderSomeConditionalElement = () => {
    if (propertyTwo > 10) {
      return <div>Valeur élevée</div>;
    }
    return null;
  };
  
  // 8. JSX principal du composant
  return (
    <div className="component-container">
      <h3>{propertyOne}</h3>
      <p>{derivedValue}</p>
      
      {renderSomeConditionalElement()}
      
      <Button onClick={handleClick}>
        Action
      </Button>
    </div>
  );
};

// 9. Export par défaut à la fin
export default ComponentName;
```

## Bonnes Pratiques

### 1. Organisation des imports

- Grouper les imports par catégorie
- Ordre recommandé : React, Types, Composants, Utilitaires, Assets

### 2. Types et Interfaces

- Définir les interfaces en haut du fichier, après les imports
- Utiliser JSDoc pour documenter chaque propriété
- Préfixer les interfaces de props avec le nom du composant (ex: `ButtonProps`)

### 3. Gestion des états et handlers

- Utiliser des noms clairs et descriptifs pour les états
- Préfixer les handlers avec `handle` (ex: `handleClick`)
- Utiliser `useCallback` pour les fonctions passées en props

### 4. Memoization

- Utiliser `useMemo` pour les valeurs dérivées complexes
- Utiliser `React.memo()` pour les composants qui reçoivent souvent les mêmes props

### 5. Extraction des sous-composants

- Extraire les parties complexes dans des sous-composants
- Utiliser des sous-composants pour le code qui se répète

### 6. Documentation

- Ajouter un bloc JSDoc pour chaque composant exporté
- Inclure au moins une description et un exemple d'utilisation
- Documenter les props non-évidentes

### 7. Exports

- Privilégier les exports nommés pour faciliter l'import sélectif
- Ajouter un export par défaut pour les composants principaux
- Centraliser les exports dans un fichier `index.ts` par dossier

## Exemple de sous-composant

Pour les composants complexes, extrayez les sous-parties dans des composants séparés :

```tsx
// Sous-composant interne, non exporté
const ComponentHeader: React.FC<{ title: string }> = ({ title }) => {
  return (
    <header className="component-header">
      <h2>{title}</h2>
    </header>
  );
};

// Composant principal qui utilise le sous-composant
export const MainComponent = () => {
  return (
    <div>
      <ComponentHeader title="Mon titre" />
      {/* Reste du composant */}
    </div>
  );
};
```

## Checklist de validation

Avant de finaliser un composant, vérifiez que :

- [ ] Les types et interfaces sont bien définis
- [ ] Les props sont documentées avec JSDoc
- [ ] Le composant a une documentation générale
- [ ] Les fonctions sont optimisées avec `useCallback` quand nécessaire
- [ ] Les valeurs dérivées sont optimisées avec `useMemo` quand approprié
- [ ] Le composant est accessible (aria-labels, rôles, etc.)
- [ ] Le code est formaté selon les standards du projet
