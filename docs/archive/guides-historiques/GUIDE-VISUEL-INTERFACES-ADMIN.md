# GUIDE VISUEL DES INTERFACES ADMINISTRATIVES

Ce guide définit les standards visuels précis pour toutes les interfaces administratives, avec pour référence la structure et le layout de Factures.tsx.

## Structure générale de l'interface

### Organisation des éléments visuels
```
+---------------------------------------------------+
|                                                   |
|  Titre principal (text-3xl font-bold)             |
|  Description (text-slate-600 mt-1)                |
|                                                   |
|  +-----------------------------------------------+|
|  |                                               ||
|  |  Barre de navigation des vues                 ||
|  |  (Cartes / Tableau / Standard + Refresh)      ||
|  |                                               ||
|  +-----------------------------------------------+|
|                                                   |
|  +-----------------------------------------------+|
|  |                                               ||
|  |  Barre de recherche et filtres                ||
|  |  (Recherche à gauche, filtres à droite)       ||
|  |                                               ||
|  +-----------------------------------------------+|
|                                                   |
|  +-----------------------------------------------+|
|  |                                               ||
|  |  Contenu principal                            ||
|  |  (Cartes / Tableau / Liste standard)          ||
|  |                                               ||
|  +-----------------------------------------------+|
|                                                   |
+---------------------------------------------------+
```

### Dimensions et espacements standards
- **Marges externes**: 1.5rem (24px) sur les côtés, 1rem (16px) en haut et bas
- **Espacement entre sections**: 1.5rem (24px)
- **Padding interne des cartes**: 1.25rem (20px)
- **Gap entre les cartes**: 1rem (16px)
- **Hauteur des en-têtes de section**: 3rem (48px)
- **Hauteur minimale des cartes**: 12rem (192px)

## Les 3 modes d'affichage alternatifs

### 1. Mode "Cartes interactives"
- **Structure**: Grille responsive de cartes
- **Colonnes**: 1 (mobile), 2 (tablette), 3 (desktop)
- **Animation**: Apparition staggered des cartes
- **Style des cartes**:
  ```
  +-------------------------------------------+
  |                                           |
  |  En-tête (bg-muted/20 py-3 px-4)         |
  |  Titre + Badge de statut                  |
  |                                           |
  +-------------------------------------------+
  |                                           |
  |  Contenu principal                        |
  |  2-3 lignes d'information                 |
  |  (display: flex, flex-direction: column)  |
  |                                           |
  +-------------------------------------------+
  |                                           |
  |  Actions (flex justify-between mt-auto)   |
  |  (Boutons d'action alignés à droite)      |
  |                                           |
  +-------------------------------------------+
  ```

### 2. Mode "Tableau"
- **Structure**: Tableau avec en-tête fixe
- **Colonnes**: Variables selon le type de données
- **Largeurs**: Définies selon le contenu (min-width définie)
- **Style**:
  ```
  +------+-------------+-----------+-----------+-------+
  |      |             |           |           |       |
  | No.  | Nom/Titre   | Date      | Statut    | Actions|
  |      |             |           |           |       |
  +------+-------------+-----------+-----------+-------+
  |      |             |           |           |       |
  | 001  | Item 1      | 01/01/25  | [Badge]   | [⋮]   |
  |      |             |           |           |       |
  +------+-------------+-----------+-----------+-------+
  |      |             |           |           |       |
  | 002  | Item 2      | 02/01/25  | [Badge]   | [⋮]   |
  |      |             |           |           |       |
  +------+-------------+-----------+-----------+-------+
  ```

### 3. Mode "Standard"
- **Structure**: Liste de cartes simples
- **Style des cartes**:
  ```
  +-------------------------------------------+
  |                                           |
  |  Titre (text-xl font-semibold)            |
  |  Sous-titre/Date (text-sm text-muted)     |
  |                                           |
  |  Contenu (mt-2)                           |
  |  Description et détails                   |
  |                                           |
  |  Badge de statut (mt-3)                   |
  |                                           |
  |  Actions (mt-4 flex justify-end gap-2)    |
  |                                           |
  +-------------------------------------------+
  ```

## Composants visuels standards

### Barre d'outils de changement de vue
```tsx
<TooltipProvider>
  <div className="flex items-center bg-muted/40 rounded-lg p-1 border shadow-sm">
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant={viewMode === 'interactive' ? "secondary" : "ghost"} 
          size="sm" 
          onClick={() => setViewMode('interactive')} 
          className="px-3"
        >
          <LayoutGrid className="h-4 w-4 mr-1" />
          <span className="sr-only sm:not-sr-only sm:inline-block">Cartes</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Vue en cartes interactives</p>
      </TooltipContent>
    </Tooltip>
    
    {/* Boutons pour les autres modes */}
    
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="ghost"
          size="sm"
          onClick={loadData}
          className="px-2 ml-1"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Rafraîchir la liste</p>
      </TooltipContent>
    </Tooltip>
  </div>
</TooltipProvider>
```

### Barre de recherche et filtres
```tsx
<div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
  <div className="w-full flex flex-1 items-center gap-2">
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input 
        type="search" 
        placeholder="Rechercher..." 
        className="pl-8 w-full md:w-[300px]" 
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
    <div className="w-[180px] hidden sm:block flex-shrink-0">
      <Select value={statusFilter} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Filtre</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous</SelectItem>
          {/* Autres options */}
        </SelectContent>
      </Select>
    </div>
  </div>
</div>
```

### État de chargement
```tsx
<div className="flex items-center justify-center h-64">
  <div className="text-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arcadis-orange mx-auto"></div>
    <p className="mt-4 text-slate-600">Chargement des données...</p>
  </div>
</div>
```

### État vide
```tsx
<div className="col-span-full text-center py-12 border rounded-lg bg-muted/20">
  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
  <h3 className="mt-4 text-lg font-medium">Aucun élément trouvé</h3>
  <p className="mt-2 text-muted-foreground">
    {searchTerm || statusFilter !== 'all' 
      ? "Aucun élément ne correspond à vos critères de recherche."
      : "Vous n'avez pas encore d'éléments."}
  </p>
  {!searchTerm && statusFilter === 'all' && (
    <ConnectionTroubleshooter
      onReloadData={loadData}
      entityName="éléments"
    />
  )}
</div>
```

## Styles visuels standards

### Badges de statut
- **Dimensions**: height: 1.25rem, padding-x: 0.5rem
- **Coins arrondis**: border-radius: 9999px (rounded-full)
- **Police**: text-xs font-medium
- **Couleurs** (selon le statut):
  - Succès: `bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100`
  - Erreur: `bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100`
  - En attente: `bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100`
  - Information: `bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200`

### Boutons d'action
- **Dimensions**: size="sm" pour les actions contextuelles
- **Espacement**: gap-2 entre les boutons
- **Icônes**: h-4 w-4, alignées avec mr-1 quand il y a du texte
- **Tooltips**: Obligatoires pour les boutons sans texte

### Cartes
- **Ombre**: shadow-sm hover:shadow-md
- **Coins arrondis**: rounded-lg
- **Bordure**: border border-muted
- **Transition**: transition-all duration-200
- **Background**: bg-card text-card-foreground

## Guide d'application par interface

### AdminFactures.tsx
- Reproduire l'exacte structure de Factures.tsx
- Adapter les 3 modes d'affichage pour les factures administratives
- Utiliser les composants visuels standards

### AdminDevis.tsx
- Reproduire la même structure que Factures.tsx
- Adapter les champs spécifiques aux devis
- Conserver les mêmes espacements et alignements

### AdminSupport.tsx
- Vérifier que la structure correspond à Factures.tsx
- Standardiser les tailles des cartes et leur contenu
- Assurer la cohérence des filtres et de la recherche

### Dashboard.tsx
- Adapter la structure générale tout en préservant les fonctionnalités spécifiques
- Uniformiser les dimensions des cartes
- Utiliser les mêmes animations staggered
