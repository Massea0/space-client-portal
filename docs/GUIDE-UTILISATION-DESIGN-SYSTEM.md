# Guide d'Utilisation - Design System Twenty-Inspired
## Arcadis Enterprise OS - Documentation Développeur

### 🎯 Objectif
Ce guide vous aide à utiliser efficacement le nouveau design system Twenty-inspired d'Arcadis Enterprise OS, transformé le 2 juillet 2025.

## 🚀 Démarrage Rapide

### 1. Accès à la Démonstration
Visitez la page showcase pour voir tous les composants en action :
```
http://localhost:8081/admin/design-system-showcase
```
xd
### 2. Structure du Design System
```
src/
├── index.css               # Variables CSS et design system
├── components/ui/
│   ├── button.tsx          # Composant Button avec 8 variants
│   ├── card.tsx           # Composant Card avec 5 variants
│   ├── input.tsx          # Composant Input avec 3 variants
│   └── badge.tsx          # Composant Badge avec 8 variants
└── tailwind.config.ts     # Configuration Tailwind étendue
```

## 🎨 Utilisation des Composants

### Button Component
```tsx
import { Button } from '@/components/ui/button'

// Variants disponibles
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="outline">Outline Style</Button>
<Button variant="ghost">Ghost Style</Button>
<Button variant="destructive">Delete Action</Button>
<Button variant="success">Success Action</Button>
<Button variant="warning">Warning Action</Button>
<Button variant="link">Link Style</Button>

// Tailles disponibles
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
<Button size="icon">Icon Only</Button>
```

### Card Component
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

// Variants disponibles
<Card variant="default">Standard Card</Card>
<Card variant="elevated">Elevated Card</Card>
<Card variant="interactive">Interactive Card</Card>
<Card variant="flat">Flat Card</Card>
<Card variant="outline">Outline Card</Card>

// Structure complète
<Card variant="elevated">
  <CardHeader>
    <CardTitle>Titre de la Carte</CardTitle>
    <CardDescription>Description élégante</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Contenu principal de la carte</p>
  </CardContent>
  <CardFooter>
    <Button size="sm">Action</Button>
  </CardFooter>
</Card>
```

### Input Component
```tsx
import { Input } from '@/components/ui/input'

// Variants disponibles
<Input variant="default" placeholder="Input standard" />
<Input variant="error" placeholder="Input avec erreur" />
<Input variant="success" placeholder="Input validé" />

// Tailles disponibles
<Input inputSize="sm" placeholder="Small input" />
<Input inputSize="default" placeholder="Default input" />
<Input inputSize="lg" placeholder="Large input" />
```

### Badge Component
```tsx
import { Badge } from '@/components/ui/badge'

// Variants disponibles
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="neutral">Neutral</Badge>

// Tailles disponibles
<Badge size="sm">Small</Badge>
<Badge size="default">Default</Badge>
<Badge size="lg">Large</Badge>
```

### Table Component (Variants de Densité)
```tsx
import { DataTable } from '@/components/ui/table'

// Variants de densité disponibles
<DataTable variant="default" data={data} columns={columns} />   // Standard (h-12, p-4)
<DataTable variant="compact" data={data} columns={columns} />   // Compacte (h-9, px-3 py-2)
<DataTable variant="dense" data={data} columns={columns} />     // Dense style Entra ID (h-7, px-2 py-1)

// Combinaisons avec autres options
<DataTable 
  variant="dense"
  data={largeDataset}
  columns={columns}
  sortable
  hoverable
  striped
/>

// Configuration complète
<DataTable 
  variant="compact"
  data={users}
  columns={userColumns}
  onRowClick={(user) => console.log(user)}
  emptyMessage="Aucun utilisateur trouvé"
  loading={false}
/>

// Cas d'usage recommandés
// - default: Dashboards, interfaces principales
// - compact: Modales, sidebars, dialogues
// - dense: Administration, reporting, style Microsoft
```

### Sidebar Component (Navigation)
```tsx
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarSearch, 
  SidebarGroup, 
  SidebarMenu, 
  SidebarFooter, 
  SidebarTrigger,
  type SidebarItem 
} from '@/components/ui/sidebar'

// Définition des éléments de navigation
const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    title: 'Tableau de bord',
    icon: HomeIcon,
    href: '/dashboard',
    isActive: true
  },
  {
    id: 'projects',
    title: 'Projets',
    icon: FolderIcon,
    badge: 8,
    children: [
      { id: 'all-projects', title: 'Tous les projets', href: '/projects' },
      { id: 'my-projects', title: 'Mes projets', href: '/projects/mine', badge: 3 },
    ]
  }
]

// Variants disponibles
<Sidebar variant="default" collapsible resizable searchable>
  <SidebarHeader showToggle={true}>
    <div className="flex items-center gap-2">
      <Logo />
      <div>
        <div className="font-semibold">Arcadis Enterprise</div>
        <div className="text-xs text-muted-foreground">Design System</div>
      </div>
    </div>
  </SidebarHeader>

  <SidebarContent>
    <SidebarSearch placeholder="Rechercher..." />
    
    <SidebarGroup title="Navigation">
      <SidebarMenu items={sidebarItems} />
    </SidebarGroup>
  </SidebarContent>

  <SidebarFooter>
    <UserProfile />
  </SidebarFooter>
</Sidebar>

// Variants de style
<Sidebar variant="default">Standard avec bordures</Sidebar>
<Sidebar variant="compact">Version dense compacte</Sidebar>
<Sidebar variant="floating">Sidebar flottante avec ombre</Sidebar>

// Contrôle d'état
const [isCollapsed, setIsCollapsed] = useState(false)
<Sidebar 
  isCollapsed={isCollapsed} 
  setIsCollapsed={setIsCollapsed}
  collapsible={true}
  resizable={true}
  searchable={true}
/>

// Cas d'usage recommandés
// - default: Navigation principale d'application
// - compact: Interfaces denses, administratives
// - floating: Overlays, modales, interfaces spécialisées
```

### Fonctionnalités Sidebar Avancées
```tsx
// Navigation hiérarchique avec sous-menus
const hierarchicalItems: SidebarItem[] = [
  {
    id: 'workspace',
    title: 'Espace de travail',
    icon: WorkspaceIcon,
    children: [
      { id: 'projects', title: 'Projets', badge: 12 },
      { id: 'team', title: 'Équipe', badge: 'Nouveau' },
    ]
  }
]

// Recherche intégrée avec filtrage
<SidebarSearch 
  placeholder="Rechercher dans la navigation..."
  // Filtrage automatique des items
/>

// Redimensionnement manuel
<Sidebar 
  resizable={true}
  defaultWidth={280}
  minWidth={200}
  maxWidth={400}
/>

// Gestion responsive mobile
<Sidebar 
  // Auto-collapse sur mobile
  // Overlay drawer sur petits écrans
  // Gestion tactile intégrée
/>

// Badges et notifications
const itemsWithBadges: SidebarItem[] = [
  { id: 'inbox', title: 'Messages', badge: 5 },
  { id: 'tasks', title: 'Tâches', badge: 'Urgent' },
  { id: 'notifications', title: 'Notifications', badge: 23 }
]

// Groupes collapsibles
<SidebarGroup title="Outils" collapsible={true}>
  <SidebarMenu items={toolsItems} />
</SidebarGroup>

// Trigger externe
<SidebarTrigger>
  <MenuIcon className="h-4 w-4" />
</SidebarTrigger>
```

## 🎨 Palette de Couleurs

### Couleurs Neutres (Twenty-Inspired)
```css
/* Variables CSS disponibles */
--gray-0: #ffffff    /* Blanc pur */
--gray-5: #fafafa    /* Background ultra-clair */
--gray-10: #f5f5f5   /* Background clair */
--gray-15: #ededed   /* Bordures subtiles */
--gray-20: #e5e5e5   /* Bordures standards */
--gray-25: #d6d6d6   /* Bordures hover */
--gray-30: #d1d1d1   /* Séparateurs */
--gray-40: #bababa   /* Texte désactivé */
--gray-50: #737373   /* Texte secondaire */
--gray-60: #616161   /* Texte tertiaire */
--gray-70: #424242   /* Texte sombre */
--gray-80: #262626   /* Texte très sombre */
--gray-90: #171717   /* Noir moderne */
```

### Classes Tailwind Étendues
```tsx
// Utilisation dans Tailwind
<div className="bg-neutral-5 border-neutral-15 text-neutral-70">
  Contenu avec palette Twenty-inspired
</div>
```

### Couleurs Sémantiques Arcadis
```css
/* Variables CSS */
--arcadis-blue: #3b82f6           /* Primary brand */
--arcadis-green: #16a34a          /* Success states */
--arcadis-orange: #ff7f00         /* Warning states */
--arcadis-red: #ef4444            /* Error states */

/* Versions subtiles pour backgrounds */
--arcadis-blue-subtle: #f0f6ff
--arcadis-green-subtle: #f0fdf4
--arcadis-orange-subtle: #fffbeb
--arcadis-red-subtle: #fef2f2
```

## 📝 Classes Utilitaires

### Typography Hiérarchisée
```tsx
<h1 className="text-display">Titre Principal</h1>
<h2 className="text-heading">Titre de Section</h2>
<h3 className="text-subheading">Sous-titre</h3>
<p className="text-body">Contenu principal</p>
<label className="text-label">Étiquette</label>
```

### Layouts Modernes
```tsx
// Containers responsives
<div className="layout-modern">Max-width 7xl avec padding</div>
<div className="layout-centered">Max-width 4xl centré</div>

// Grilles responsives
<div className="grid-modern">Grid avec gap généreux</div>
<div className="grid-cards">Grid de cartes responsive</div>
```

### Composants Utilitaires
```tsx
// Cartes modernes
<div className="card-modern">Carte avec style épuré</div>

// Inputs modernes
<input className="input-modern" placeholder="Input stylisé" />
```

## 🎭 Animations et Interactions

### Classes d'Animation
```tsx
// Animations d'entrée
<div className="animate-fade-in">Fade in subtle</div>
<div className="animate-slide-up">Slide from bottom</div>
<div className="animate-scale-in">Scale in smooth</div>

// Durations disponibles
<div className="transition-all duration-fast">150ms</div>
<div className="transition-all duration-normal">200ms</div>
<div className="transition-all duration-slow">300ms</div>

// Easing functions
<div className="ease-smooth">Cubic-bezier moderne</div>
```

### Focus States
```tsx
// Focus ring moderne
<button className="focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2">
  Bouton avec focus élégant
</button>
```

## 🔧 Bonnes Pratiques

### 1. Cohérence Visuelle
- Utilisez toujours les variants définis plutôt que des styles inline
- Respectez la hiérarchie typographique
- Maintenez l'espacement avec les classes layout-*

### 2. Performance
- Les composants sont optimisés avec cva (class-variance-authority)
- Les transitions sont limitées à 200ms pour la fluidité
- Les animations sont hardware-accelerated

### 3. Accessibilité
- Focus states automatiques sur tous les composants
- Contraste respecté selon WCAG
- Support screen readers intégré

### 4. Utilisation Correcte des Providers
- Le provider `ToastProvider` doit être à la racine de l'application (déjà inclus dans `App.tsx`)
- Si vous utilisez directement des composants comme `Toast`, `ToastWithProgress`, etc., vous devez les envelopper dans un `ToastProvider` local
- Inclure toujours la propriété `altText` pour les composants `ToastAction` pour l'accessibilité
- Les providers de contexte (SidebarProvider, ToastProvider) ne doivent être inclus qu'une fois pour éviter les conflits

### Bonnes Pratiques pour l'Utilisation des Composants Sidebar

```tsx
// 1. Utilisation avec le Provider et les hooks
import { 
  Sidebar, 
  SidebarProvider,
  SidebarContent, 
  useSidebar 
} from '@/components/ui/sidebar'

// Enveloppez toujours votre application avec SidebarProvider 
// si vous prévoyez d'utiliser useSidebar() ailleurs
function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  return (
    <SidebarProvider
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
    >
      <div className="flex">
        <Sidebar>
          {/* Contenu de la sidebar */}
        </Sidebar>
        <main>
          {/* Contenu principal */}
        </main>
      </div>
    </SidebarProvider>
  )
}

// 2. Utilisation des hooks uniquement à l'intérieur du Provider
function SidebarContent() {
  // Ce hook ne fonctionnera que si le composant
  // est rendu à l'intérieur d'un SidebarProvider
  const { toggle, state } = useSidebar()
  
  return (
    <button onClick={toggle}>
      {state === 'collapsed' ? 'Étendre' : 'Réduire'}
    </button>
  )
}

// 3. Cas d'erreurs à éviter
// ❌ N'utilisez JAMAIS le hook en dehors du Provider
function WrongComponent() {
  // Ceci génèrera une erreur:
  // "useSidebar must be used within a Sidebar component"
  const { toggle } = useSidebar() 
  
  return <button onClick={toggle}>Toggle</button>
}
```

## Notes importantes sur les Contextes React

### Utilisation correcte des Providers

Certains composants de notre design system utilisent des contextes React pour gérer leur état et leurs fonctionnalités. Ces composants doivent être utilisés à l'intérieur de leurs providers respectifs :

#### Toast et ToastProvider

Le système Toast nécessite obligatoirement un `ToastProvider` pour fonctionner correctement. Si vous utilisez directement les composants `Toast`, `ToastWithProgress`, etc., vous devez les encapsuler dans un `ToastProvider` local.

```tsx
// ❌ INCORRECT - Utilisation sans Provider
<Toast>
  <ToastTitle>Message</ToastTitle>
</Toast>

// ✅ CORRECT - Utilisation avec Provider local
<ToastProvider>
  <Toast>
    <ToastTitle>Message</ToastTitle>
  </Toast>
  <ToastViewport /> {/* N'oubliez pas le ToastViewport */}
</ToastProvider>
```

Pour les notifications générées par l'API `useToast()`, vous n'avez pas besoin d'ajouter un provider supplémentaire car l'application dispose déjà d'un ToastProvider global dans App.tsx.

#### Sidebar et SidebarProvider

De même, les composants du Sidebar doivent être utilisés à l'intérieur d'un `SidebarProvider` :

```tsx
// ❌ INCORRECT
<SidebarMenu>
  <SidebarMenuItem />
</SidebarMenu>

// ✅ CORRECT
<SidebarProvider>
  <Sidebar>
    <SidebarMenu>
      <SidebarMenuItem />
    </SidebarMenu>
  </Sidebar>
</SidebarProvider>
```

### Éviter les erreurs communes

1. **Erreur "must be used within a Provider"** : Cette erreur se produit lorsqu'un composant qui utilise un hook de contexte (comme `useToast()` ou `useSidebar()`) est utilisé en dehors de son provider.

2. **Nestage excessif de providers** : N'ajoutez pas de providers supplémentaires si un provider global existe déjà au niveau de l'application. Cela peut créer des conflits d'état.

3. **Oubli de composants obligatoires** : Certains providers nécessitent des composants supplémentaires pour fonctionner correctement, comme le `ToastViewport` pour le `ToastProvider`.

## 🚀 Extensibilité

### Ajouter de Nouveaux Variants
```tsx
// Dans button.tsx par exemple
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        // ...existing variants
        custom: "your-custom-classes"
      }
    }
  }
)
```

### Nouvelles Couleurs
```css
/* Dans index.css */
:root {
  --custom-color: hsl(value);
}
```

```typescript
// Dans tailwind.config.ts
extend: {
  colors: {
    custom: 'hsl(var(--custom-color))'
  }
}
```

## 📊 Performance et Maintenance

### Métriques Actuelles
- **CSS Bundle** : 99.89 kB (optimisé)
- **Composants** : 4 refondus, 25+ variants
- **Compilation** : 0 erreur, build en ~10s
- **Runtime** : Démarrage en 210ms

### Maintenance
- Variables CSS centralisées dans `index.css`
- Configuration Tailwind dans `tailwind.config.ts`
- Composants dans `src/components/ui/`
- Documentation à jour dans `/docs`

---

**Dernière Mise à Jour** : 2 juillet 2025  
**Version Design System** : 1.0.0 Twenty-Inspired  
**Maintenance** : IA Code Assistant + Équipe Arcadis

### Toast/Notification System

> ⚠️ **Important** : Le système Toast nécessite un `ToastProvider` parent pour fonctionner. Ce provider est déjà inclus au niveau de l'application, mais les composants Toast directs doivent être utilisés à l'intérieur d'un provider local.

#### Utilisation du Hook (Recommandé)
```tsx
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'

// Dans votre composant
const { toast, success, error, warning, info } = useToast()

// Variants disponibles
success({ title: "Action réussie", description: "Opération terminée avec succès" })
error({ title: "Erreur", description: "Impossible de compléter l'action" })
warning({ title: "Avertissement", description: "Cette action pourrait avoir des conséquences" })
info({ title: "Information", description: "Voici quelque chose que vous devriez savoir" })

// Actions dans les toasts
toast({
  title: "Fichier supprimé",
  description: "Le fichier a été déplacé dans la corbeille.",
  action: (
    <ToastAction onClick={() => undoDelete()} altText="Annuler la suppression">
      Annuler
    </ToastAction>
  )
})
```

#### Utilisation des Composants Directs (Avancé)
```tsx
import { ToastProvider, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast'

// Pour utiliser les composants Toast directement, vous devez les envelopper dans un ToastProvider
<ToastProvider>
  <Toast variant="success">
    <ToastTitle>Action réussie</ToastTitle>
    <ToastDescription>Opération terminée avec succès</ToastDescription>
  </Toast>
</ToastProvider>
```

## 📈 État d'Avancement du Design System

### Sprints Terminés
- ✅ **Sprint 1** - Mise en place de la structure de base et des composants fondamentaux (Button, Card, Input, Badge)
- ✅ **Sprint 2** - Implémentation des composants interactifs (Dialog, Table, Select, Checkbox, Radio, TitleInput)
- ✅ **Sprint 3** - Implémentation des composants avancés (Kanban, DataView, Sidebar, Toast, Loading States)

### Composants Disponibles
1. **Composants de Base**
   - Button, Card, Input, Badge

2. **Composants Interactifs**
   - Dialog, Select, Checkbox, Radio, TitleInput

3. **Composants de Navigation**
   - Sidebar, Tabs

4. **Composants de Données**
   - Table (avec variants de densité)
   - Kanban Board
   - DataView (container unifié)

5. **Composants d'État**
   - Toast/Notification
   - Loading States (Spinner, Progress, Skeleton)

### Prochaines Étapes
- **Optimisation** : Dark mode, responsive, animations
- **Documentation** : Storybook, exemples interactifs, guides de bonnes pratiques
- **Tests** : Accessibilité, performance, compatibilité
- **Intégration** : Applications existantes
- **Correction de bugs** : Résolution des problèmes d'utilisation comme les erreurs Toast/Provider
