# Guide de conversion des composants Dialog en AnimatedModal

## Imports requis

```tsx
// Ancien import
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

// Nouvel import
import { AnimatedModal } from '@/components/ui/animated-modal';
```

## Conversion de base

### Avant

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-lg">
    <DialogHeader>
      <DialogTitle>Titre du modal</DialogTitle>
      <DialogDescription>Description optionnelle</DialogDescription>
    </DialogHeader>
    
    {/* Contenu du modal */}
    <div>Contenu ici</div>
    
    <DialogFooter>
      <Button variant="outline" onClick={onCancel}>Annuler</Button>
      <Button onClick={onConfirm}>Confirmer</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Après

```tsx
<AnimatedModal
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  title="Titre du modal"
  description="Description optionnelle"
  size="md"
  animationType="zoom"
  contentClassName="max-w-lg"
  footer={
    <>
      <Button variant="outline" onClick={onCancel}>Annuler</Button>
      <Button onClick={onConfirm}>Confirmer</Button>
    </>
  }
>
  {/* Contenu du modal */}
  <div>Contenu ici</div>
</AnimatedModal>
```

## Types d'animations disponibles

- `zoom` : Le modal apparaît avec un effet de zoom (par défaut)
- `slide` : Le modal glisse depuis le haut
- `fade` : Le modal apparaît en fondu
- `bounce` : Le modal rebondit légèrement
- `flip` : Le modal effectue une rotation 3D

## Tailles disponibles

- `sm` : Petit modal (max-w-sm)
- `md` : Taille moyenne (max-w-md)
- `lg` : Grand modal (max-w-lg)
- `xl` : Très grand modal (max-w-xl)
- `full` : Modal presque plein écran

## Options supplémentaires

- `withBlur` : Ajoute un effet de flou sur l'arrière-plan (true/false)
- `showClose` : Affiche le bouton de fermeture (true par défaut)
- `contentClassName` : Classes CSS supplémentaires pour le contenu
- `className` : Classes CSS supplémentaires pour le modal

## Bonnes pratiques

1. Choisir le type d'animation en fonction du contexte :
   - Modaux d'information : `zoom` ou `fade`
   - Modaux d'action : `slide` ou `bounce`
   - Modaux de confirmation : `zoom` avec focus
   - Modaux de succès : `bounce` avec confetti

2. Adapter la taille au contenu :
   - Formulaires complexes : `lg` ou `xl`
   - Messages simples : `sm` ou `md`

3. Ajouter des effets visuels pour les actions importantes :
   - Succès : Utiliser `useVisualEffect('confetti')` après une action réussie
   - Erreur : Utiliser des animations d'alerte avec `shake`
