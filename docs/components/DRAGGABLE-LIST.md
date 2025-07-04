# DraggableList - Documentation

## Composant DraggableList

Un composant React pour créer des listes avec éléments réorganisables par drag & drop, utilisant @dnd-kit.

### Fonctionnalités

- ✅ Drag & drop fluide avec animations
- ✅ Support des orientations vertical, horizontal et grille
- ✅ Handle de glissement optionnel
- ✅ Accessibilité complète (clavier, lecteur d'écran)
- ✅ Callbacks pour tous les événements de drag
- ✅ Styles personnalisables
- ✅ Support mobile et tactile

### Utilisation de base

```tsx
import { DraggableList, DraggableListItem } from '@/components/ui/draggable-list';

const items: DraggableListItem[] = [
  { id: '1', content: 'Premier élément' },
  { id: '2', content: 'Deuxième élément' },
  { id: '3', content: 'Troisième élément' },
];

function MyComponent() {
  const [myItems, setMyItems] = useState(items);

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newItems = [...myItems];
    const [removed] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, removed);
    setMyItems(newItems);
  };

  return (
    <DraggableList
      items={myItems}
      onReorder={handleReorder}
    />
  );
}
```

### Props

#### DraggableListProps

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `items` | `DraggableListItem[]` | - | **Requis.** Liste des éléments à afficher |
| `onReorder` | `(fromIndex: number, toIndex: number) => void` | - | Callback appelé lors du réordonnancement |
| `onDragStart` | `(id: UniqueIdentifier) => void` | - | Callback appelé au début du drag |
| `onDragEnd` | `(id: UniqueIdentifier) => void` | - | Callback appelé à la fin du drag |
| `onDragOver` | `(id: UniqueIdentifier) => void` | - | Callback appelé lors du survol |
| `orientation` | `"vertical" \| "horizontal" \| "grid"` | `"vertical"` | Orientation de la liste |
| `strategy` | `"vertical" \| "horizontal" \| "rect"` | `"vertical"` | Stratégie de tri |
| `handle` | `boolean` | `false` | Utiliser un handle de glissement |
| `className` | `string` | - | Classes CSS pour le wrapper |
| `containerClassName` | `string` | - | Classes CSS pour le conteneur |
| `itemClassName` | `string` | - | Classes CSS pour les éléments |
| `ariaLabel` | `string` | `"Liste réorganisable"` | Label d'accessibilité |
| `ariaDescription` | `string` | - | Description d'accessibilité |

#### DraggableListItem

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | **Requis.** Identifiant unique de l'élément |
| `content` | `React.ReactNode` | **Requis.** Contenu à afficher |
| `disabled` | `boolean` | Désactiver le drag pour cet élément |

### Exemples avancés

#### Avec handle de glissement

```tsx
<DraggableList
  items={items}
  onReorder={handleReorder}
  handle={true}
/>
```

#### Orientation horizontale

```tsx
<DraggableList
  items={items}
  onReorder={handleReorder}
  orientation="horizontal"
/>
```

#### Disposition en grille

```tsx
<DraggableList
  items={items}
  onReorder={handleReorder}
  orientation="grid"
  strategy="rect"
/>
```

#### Avec contenu complexe

```tsx
const complexItems = [
  {
    id: 'task-1',
    content: (
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Tâche importante</div>
          <div className="text-sm text-muted-foreground">Assigné à Marie</div>
        </div>
        <Badge variant="destructive">Urgent</Badge>
      </div>
    )
  },
  // ...
];
```

### Accessibilité

Le composant respecte les bonnes pratiques d'accessibilité :

- **Clavier** : Navigation avec Tab, réorganisation avec flèches + Espace
- **Lecteur d'écran** : Annonces des changements d'ordre
- **Focus** : Indicateurs visuels clairs
- **ARIA** : Labels et descriptions appropriés

### Performances

- Rendu optimisé avec `React.memo` si nécessaire
- Gestion efficace des événements
- Animations fluides avec transitions CSS

### Styles personnalisés

```tsx
<DraggableList
  items={items}
  onReorder={handleReorder}
  className="my-custom-wrapper"
  containerClassName="my-custom-container"
  itemClassName="my-custom-item"
/>
```

### Intégration avec des formulaires

```tsx
function TaskForm() {
  const [tasks, setTasks] = useState([]);
  
  const handleReorder = (fromIndex: number, toIndex: number) => {
    // Logique de réorganisation
    // Mettre à jour le state du formulaire
  };

  return (
    <form>
      <DraggableList
        items={tasks}
        onReorder={handleReorder}
        ariaLabel="Liste des tâches du projet"
      />
    </form>
  );
}
```

## Composant DraggableItem

Composant interne utilisé par DraggableList pour rendre chaque élément draggable.

### Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `id` | `UniqueIdentifier` | - | **Requis.** Identifiant unique |
| `disabled` | `boolean` | `false` | Désactiver le drag |
| `handle` | `boolean` | `false` | Afficher le handle de glissement |
| `isActive` | `boolean` | `false` | État actif (en cours de drag) |
| `className` | `string` | - | Classes CSS personnalisées |
| `children` | `React.ReactNode` | - | Contenu de l'élément |

### Utilisation directe (rare)

```tsx
<DraggableItem
  id="item-1"
  handle={true}
  isActive={isDragging}
>
  <div>Mon contenu</div>
</DraggableItem>
```

## Dépendances

- `@dnd-kit/core` - Logique de drag & drop
- `@dnd-kit/sortable` - Stratégies de tri
- `@dnd-kit/utilities` - Utilitaires pour les transformations
- `lucide-react` - Icônes (GripVertical)

## Changelog

### v1.0.0 (Sprint 4)
- ✅ Implémentation initiale complète
- ✅ Support des orientations multiples
- ✅ Accessibilité intégrée
- ✅ Animations fluides
- ✅ Handle de glissement optionnel
- ✅ Documentation complète

## Prochaines améliorations

- [ ] Support des groupes de listes (multi-colonnes)
- [ ] Persistance automatique des changements
- [ ] Animations personnalisables
- [ ] Thèmes visuels prédéfinis
- [ ] Intégration avec des state managers
