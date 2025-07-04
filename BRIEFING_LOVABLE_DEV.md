# 🤖 GUIDE LOVABLE DEV - BRIEFING COMPLET
*Instructions pour l'IA Développeur*

---

## 🎯 **MISSION & OBJECTIF**

### Rôle de l'IA
- **Vous êtes**: L'ingénieur développeur
- **Je suis**: L'architecte système  
- **Objectif**: Créer un SaaS B2B niveau Linear/Notion/Twenty CRM
- **Stack**: React 18 + TypeScript + Supabase + shadcn/ui

### Scope du Projet
**Module complet avec:**
- ✅ **Module RH** (8 employés de test déjà en base)
- ✅ **Module Business** (Devis, Factures, Projets, Contrats)
- ✅ **Module Support** (Tickets, Catégories, Messages)
- ✅ **Module Admin** (Entreprises, Utilisateurs, Rapports)
- ✅ **Dashboard IA** avec widgets prédictifs
- ✅ **Authentification & Permissions** (4 rôles utilisateur)

---

## 📋 **INSTRUCTIONS DE DÉVELOPPEMENT**

### 1. Architecture Obligatoire
```jsx
// Structure Layout imposée
<AppLayout>
  <Sidebar collapsible responsive />
  <MainContent>
    <Header sticky withSearch withNotifications />
    <PageContent>
      <Breadcrumbs />
      <PageHeader />
      <Content />
    </PageContent>
  </MainContent>
</AppLayout>
```

### 2. Design System Imposé
- **UI Library**: shadcn/ui (déjà installé)
- **Icons**: Lucide React (déjà installé)
- **Animations**: Framer Motion (déjà installé)
- **Charts**: Recharts (déjà installé)
- **Styling**: TailwindCSS avec CSS variables
- **Theme**: Dark/Light mode avec toggle

### 3. Patterns Obligatoires
```typescript
// Tous les composants doivent suivre ce pattern
interface ComponentProps {
  // Props typées avec TypeScript
}

const Component: React.FC<ComponentProps> = ({ ...props }) => {
  // Hooks en premier
  const [state, setState] = useState();
  const { data, isLoading } = useQuery();
  
  // Handlers groupés
  const handleAction = useCallback(() => {}, []);
  
  // Early returns
  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorBoundary />;
  
  // JSX avec animations
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Contenu */}
    </motion.div>
  );
};
```

---

## 🗂️ **STRUCTURE DES FICHIERS**

### Organisation Imposée
```
src/
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components  
│   ├── business/         # Business components
│   ├── hr/               # HR components
│   └── common/           # Shared components
├── pages/
│   ├── dashboard/        # Dashboard pages
│   ├── hr/               # HR pages
│   ├── business/         # Business pages
│   └── admin/            # Admin pages
├── services/
│   ├── api.ts            # API services (EXISTANT)
│   └── hr/               # HR specific services
├── hooks/
├── types/
├── lib/
└── utils/
```

### Naming Conventions
- **Components**: PascalCase (`EmployeeCard.tsx`)
- **Pages**: PascalCase (`EmployeeListPage.tsx`)
- **Hooks**: camelCase (`useEmployees.ts`)
- **Utils**: camelCase (`formatCurrency.ts`)

---

## 🔌 **INTÉGRATION API SUPABASE**

### Configuration Imposée
```typescript
// URL Supabase (déjà configuré)
const SUPABASE_URL = "https://qlqgyrfqiflnqknbtycw.supabase.co"

// Client déjà configuré dans src/lib/supabaseClient.ts
import { supabase } from '@/lib/supabaseClient';

// Services API existants dans src/services/api.ts
import { employeeSupabaseApi, devisApi, invoicesApi } from '@/services/api';
```

### Pattern API Obligatoire
```typescript
// Toujours utiliser React Query
const { data: employees, isLoading, error } = useQuery({
  queryKey: ['employees', filters],
  queryFn: () => employeeSupabaseApi.list(filters),
  staleTime: 5 * 60 * 1000, // 5min cache
});

// Mutations avec optimistic updates
const createMutation = useMutation({
  mutationFn: employeeSupabaseApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries(['employees']);
    toast.success('Employé créé avec succès');
  },
  onError: (error) => {
    toast.error(`Erreur: ${error.message}`);
  }
});
```

---

## 🎨 **STANDARDS UI/UX**

### 1. Tables de Données
```jsx
// Pattern obligatoire pour toutes les listes
<DataTable
  data={data}
  columns={columns}
  searchable
  filterable
  exportable
  loading={isLoading}
  error={error}
  emptyState={<EmptyState />}
  actions={<TableActions />}
/>
```

### 2. Forms
```jsx
// Pattern form avec validation
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="field"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Label</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit" loading={isSubmitting}>
      Sauvegarder
    </Button>
  </form>
</Form>
```

### 3. Layout Responsive
```jsx
// Grid responsive obligatoire
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <Card key={item.id} className="hover:shadow-lg transition-shadow">
      <CardContent>
        {/* Contenu */}
      </CardContent>
    </Card>
  ))}
</div>
```

---

## 🎭 **ANIMATIONS & INTERACTIONS**

### Transitions Obligatoires
```jsx
// Page transitions
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// List items stagger
const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Loading skeletons partout
if (isLoading) {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}
```

---

## 📊 **MODULES À DÉVELOPPER**

### 1. Module RH (PRIORITÉ 1)
**Pages requises:**
- `/hr/employees` - Liste employés avec recherche/filtres
- `/hr/employees/new` - Formulaire création employé
- `/hr/employees/:id` - Profil employé détaillé
- `/hr/employees/:id/edit` - Édition employé
- `/hr/organization` - Organigramme interactif
- `/hr/analytics` - Tableaux de bord RH

**Fonctionnalités:**
- ✅ CRUD employés complet
- ✅ Recherche avancée avec filtres
- ✅ Export PDF/Excel
- ✅ Organigramme drag & drop
- ✅ Métriques RH en temps réel

### 2. Module Business (PRIORITÉ 2)
**Pages requises:**
- `/business/quotes` - Gestion devis
- `/business/invoices` - Gestion factures
- `/business/contracts` - Gestion contrats
- `/business/projects` - Gestion projets

### 3. Dashboard IA (PRIORITÉ 3)
**Widgets obligatoires:**
- Métriques clés avec tendances
- Recommandations IA
- Pipeline visuel
- Alertes temps réel

---

## 🔐 **SÉCURITÉ & PERMISSIONS**

### Système de Rôles
```typescript
// 4 rôles définis
enum UserRole {
  ADMIN = 'admin',           // Accès total
  HR_MANAGER = 'hr_manager', // RH complet
  HR_SPECIALIST = 'hr_specialist', // RH opérationnel  
  CLIENT = 'client'          // Client standard
}

// Garde de route
<ProtectedRoute roles={['admin', 'hr_manager']}>
  <HRManagementPage />
</ProtectedRoute>
```

### Gestion Erreurs RLS
```typescript
// Pattern de gestion d'erreur RLS
try {
  const data = await api.call();
} catch (error) {
  if (error.code === '42P17') {
    // Erreur RLS - rediriger vers accès refusé
    navigate('/access-denied');
  }
  throw error;
}
```

---

## 🚀 **PERFORMANCE REQUIREMENTS**

### Métriques Obligatoires
- **Page Load**: < 2s
- **First Paint**: < 800ms
- **Interaction**: < 100ms
- **Table rendering**: < 500ms pour 1000 items

### Optimisations Requises
```jsx
// Virtualisation pour grandes listes
import { VirtualizedList } from '@/components/ui/virtualized-list';

// Lazy loading pour images
<img 
  src={src} 
  loading="lazy" 
  className="w-10 h-10 rounded-full" 
/>

// Memo pour composants lourds
const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});
```

---

## 📱 **RESPONSIVE DESIGN**

### Breakpoints Obligatoires
```css
/* TailwindCSS breakpoints */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */  
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Comportements Adaptatifs
- **Mobile**: Sidebar drawer, tables stacked
- **Tablet**: Sidebar overlay, tables scrollable
- **Desktop**: Sidebar fixed, tables full

---

## 🎯 **CRITÈRES DE RÉUSSITE**

### Fonctionnalités Requises
- [ ] Login/logout fonctionnel
- [ ] Navigation sidebar responsive
- [ ] Module RH complet (CRUD employés)
- [ ] Dashboard avec widgets
- [ ] Recherche globale (Cmd+K)
- [ ] Export de données (PDF/Excel)
- [ ] Thème dark/light
- [ ] Notifications toast
- [ ] Gestion d'erreurs gracieuse
- [ ] Loading states partout

### Qualité Code Requise
- [ ] TypeScript strict
- [ ] Components testables
- [ ] Pas de any types
- [ ] Interfaces définies
- [ ] Error boundaries
- [ ] Accessible (ARIA)

---

## 🛠️ **COMMANDES DÉVELOPPEMENT**

```bash
# Installation (déjà fait)
npm install

# Développement  
npm run dev

# Build
npm run build

# Linting
npm run lint

# Tests
npm run test
```

---

## 📞 **SUPPORT & QUESTIONS**

### En cas de problème
1. **API errors**: Vérifier les politiques RLS
2. **Auth issues**: Vérifier les tokens JWT  
3. **Performance**: Utiliser React DevTools
4. **UI bugs**: Vérifier shadcn/ui docs

### Resources
- **Supabase Docs**: https://supabase.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Framer Motion**: https://framer.com/motion

---

**🚀 Go build something amazing! L'architecture est prête, les données sont en place, à vous de créer la magie ! 🎨**
