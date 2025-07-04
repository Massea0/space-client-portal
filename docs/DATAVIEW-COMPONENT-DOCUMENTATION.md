# 📊 DataView Component - Container Unifié de Vues

## 🎯 Objectif
Le composant DataView est un container intelligent qui unifie l'affichage de données à travers multiple vues (Table, Kanban, Liste, Grille) avec des fonctionnalités avancées de filtrage, recherche et actions bulk.

## ✨ Fonctionnalités Principales

### 1. **Vues Multiples**
- **Table** : Vue tabulaire avec tri et colonnes configurables
- **Liste** : Affichage linéaire compact
- **Grille** : Cartes en grille responsive 
- **Kanban** : Vue par colonnes de statut (optionnelle)

### 2. **Système de Filtrage Avancé**
- Recherche globale en temps réel
- Filtres par colonne (text, select, date, boolean)
- Persistence des états de filtres
- Interface de filtres repliable

### 3. **Actions Bulk & Sélection**
- Sélection multiple d'éléments
- Actions contextuelles selon la sélection
- Export de données
- Suppression en lot

### 4. **Toolbar Intelligent**
- Basculement de vues avec indicateurs visuels
- Zone de recherche persistante
- Gestion des colonnes visibles
- Actions rapides contextuelles

## 🛠️ API et Utilisation

### Import
```tsx
import { DataView, DataViewColumn } from '@/components/ui/data-view'
```

### Props Principales
```tsx
interface DataViewProps<T> {
  data: T[]                               // Données à afficher
  columns: DataViewColumn<T>[]           // Configuration des colonnes
  defaultView?: ViewType                 // Vue par défaut ('table' | 'kanban' | 'list' | 'grid')
  availableViews?: ViewType[]            // Vues disponibles
  enableSearch?: boolean                 // Activer la recherche
  enableFilters?: boolean                // Activer les filtres
  filters?: DataViewFilter[]             // Configuration des filtres
  bulkActions?: BulkAction[]             // Actions bulk disponibles
  onRowClick?: (item: T) => void         // Callback clic sur élément
  renderCard?: (item: T) => ReactNode    // Renderer grille personnalisé
  renderListItem?: (item: T) => ReactNode // Renderer liste personnalisé
  loading?: boolean                      // État de chargement
  emptyMessage?: string                  // Message état vide
}
```

### Configuration des Colonnes
```tsx
interface DataViewColumn<T> {
  id: string                    // Identifiant unique
  header: string               // Titre de la colonne
  accessorKey?: keyof T        // Clé d'accès aux données
  accessor?: (row: T) => ReactNode // Renderer personnalisé
  sortable?: boolean           // Colonne triable
  searchable?: boolean         // Inclus dans la recherche
  filterable?: boolean         // Filtrable
  visible?: boolean            // Visible par défaut
  width?: string              // Largeur fixe
  align?: 'left' | 'center' | 'right' // Alignement
}
```

## 📋 Exemples d'Utilisation

### 1. **Configuration de Base**
```tsx
const users = [
  { id: "1", name: "Alice", email: "alice@example.com", role: "Admin", status: "Active" },
  { id: "2", name: "Bob", email: "bob@example.com", role: "User", status: "Active" },
  // ...
]

const columns: DataViewColumn<User>[] = [
  {
    id: 'name',
    header: 'Nom',
    accessorKey: 'name',
    searchable: true,
    sortable: true
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
    searchable: true
  },
  {
    id: 'status',
    header: 'Statut',
    accessorKey: 'status',
    filterable: true,
    accessor: (user) => (
      <Badge variant={user.status === 'Active' ? 'success' : 'secondary'}>
        {user.status}
      </Badge>
    )
  }
]

<DataView
  data={users}
  columns={columns}
  availableViews={['table', 'list', 'grid']}
  enableSearch={true}
  enableFilters={true}
/>
```

### 2. **Avec Filtres Avancés**
```tsx
const filters: DataViewFilter[] = [
  {
    id: 'role',
    label: 'Rôle',
    type: 'select',
    options: [
      { label: 'Admin', value: 'Admin' },
      { label: 'Utilisateur', value: 'User' },
      { label: 'Manager', value: 'Manager' }
    ]
  },
  {
    id: 'status',
    label: 'Statut',
    type: 'select',
    options: [
      { label: 'Actif', value: 'Active' },
      { label: 'Inactif', value: 'Inactive' }
    ]
  }
]

<DataView
  data={users}
  columns={columns}
  filters={filters}
  enableFilters={true}
/>
```

### 3. **Avec Actions Bulk**
```tsx
const bulkActions = [
  {
    id: 'export',
    label: 'Exporter',
    icon: <Download className="h-4 w-4" />,
    action: (selectedIds) => {
      // Logique d'export
      console.log('Export:', selectedIds)
    }
  },
  {
    id: 'delete',
    label: 'Supprimer',
    icon: <Trash className="h-4 w-4" />,
    action: (selectedIds) => {
      // Logique de suppression
      console.log('Delete:', selectedIds)
    }
  }
]

<DataView
  data={users}
  columns={columns}
  bulkActions={bulkActions}
  enableBulkActions={true}
  onSelectionChange={(selectedIds) => {
    console.log('Sélection:', selectedIds)
  }}
/>
```

### 4. **Renderers Personnalisés**
```tsx
<DataView
  data={users}
  columns={columns}
  availableViews={['table', 'list', 'grid']}
  
  // Renderer pour la vue grille
  renderCard={(user) => (
    <div className="space-y-2">
      <div className="font-medium">{user.name}</div>
      <div className="text-sm text-muted-foreground">{user.email}</div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" size="sm">{user.role}</Badge>
        <Badge variant={user.status === 'Active' ? 'success' : 'secondary'} size="sm">
          {user.status}
        </Badge>
      </div>
    </div>
  )}
  
  // Renderer pour la vue liste
  renderListItem={(user) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-primary">
            {user.name.charAt(0)}
          </span>
        </div>
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" size="sm">{user.role}</Badge>
        <Badge variant={user.status === 'Active' ? 'success' : 'secondary'} size="sm">
          {user.status}
        </Badge>
      </div>
    </div>
  )}
/>
```

### 5. **Configuration Kanban (Optionnelle)**
```tsx
<DataView
  data={tasks}
  columns={taskColumns}
  availableViews={['table', 'kanban', 'list']}
  kanbanConfig={{
    statusField: 'status', // Champ qui détermine la colonne
    columns: [
      { id: 'todo', title: 'À faire', color: '#64748b' },
      { id: 'in-progress', title: 'En cours', color: '#3b82f6' },
      { id: 'done', title: 'Terminé', color: '#10b981' }
    ],
    onCardMove: (cardId, newStatus) => {
      // Logique de déplacement
      console.log(`Carte ${cardId} -> ${newStatus}`)
    }
  }}
/>
```

## 🎨 États et Comportements

### États de Chargement
```tsx
<DataView
  data={[]}
  columns={columns}
  loading={true} // Affiche des skeletons
/>
```

### État Vide avec Action
```tsx
<DataView
  data={[]}
  columns={columns}
  emptyMessage="Aucun utilisateur trouvé"
  emptyAction={{
    label: "Ajouter un utilisateur",
    action: () => console.log("Ajout d'utilisateur")
  }}
/>
```

### Gestion de la Sélection
```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([])

<DataView
  data={users}
  columns={columns}
  enableBulkActions={true}
  onSelectionChange={setSelectedIds}
  bulkActions={[
    {
      id: 'action1',
      label: `Action sur ${selectedIds.length} éléments`,
      action: (ids) => console.log('Action:', ids)
    }
  ]}
/>
```

## 🔧 Personnalisation Avancée

### Styles CSS Personnalisés
```tsx
<DataView
  className="custom-dataview"
  data={data}
  columns={columns}
/>
```

### Toolbar Personnalisée
Le toolbar s'adapte automatiquement selon :
- Les vues disponibles
- Les filtres configurés
- Les actions bulk définies
- L'état de sélection

### Performance et Optimisation
- **Recherche** : Débounce automatique
- **Filtres** : Application en temps réel
- **Tri** : Optimisé pour de gros datasets
- **Rendu** : Virtualization pour les grandes listes (à venir)

## 📊 Cas d'Usage Recommandés

### **Administration/CRM**
```tsx
// Gestion utilisateurs avec actions bulk
<DataView
  data={users}
  columns={userColumns}
  availableViews={['table', 'grid']}
  bulkActions={[editBulk, deleteBulk, exportBulk]}
  filters={userFilters}
/>
```

### **Gestion de Projets**
```tsx
// Tasks avec vue Kanban
<DataView
  data={tasks}
  columns={taskColumns}
  availableViews={['kanban', 'table', 'list']}
  defaultView="kanban"
  kanbanConfig={taskKanbanConfig}
/>
```

### **Catalogue Produits**
```tsx
// Produits avec vue grille
<DataView
  data={products}
  columns={productColumns}
  availableViews={['grid', 'table']}
  defaultView="grid"
  renderCard={ProductCard}
  filters={productFilters}
/>
```

## 🚀 Roadmap & Extensions

### Phase 1 (Terminé)
- [x] Container de base avec vues multiples
- [x] Système de filtrage et recherche
- [x] Actions bulk et sélection
- [x] Renderers personnalisés
- [x] Integration showcase

### Phase 2 (Planifié)
- [ ] Virtualisation pour grandes listes
- [ ] Sauvegarde des préférences utilisateur
- [ ] Export avancé (PDF, Excel)
- [ ] Tri multi-colonnes
- [ ] Filtres date/range avancés

### Phase 3 (Futur)
- [ ] Mode offline avec cache
- [ ] Synchronisation temps réel
- [ ] Templates de vues prédéfinis
- [ ] Analytics et métriques d'usage

---

*Dernière mise à jour : 2 juillet 2025*
*Auteur : GitHub Copilot - Sprint 3 Arcadis Enterprise OS*
