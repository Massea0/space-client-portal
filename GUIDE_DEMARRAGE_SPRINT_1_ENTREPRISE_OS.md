# 🚀 GUIDE DE DÉMARRAGE - SPRINT 1 ENTREPRISE OS GENESIS

## 📋 **OBJECTIF SPRINT 1 : SETUP & ARCHITECTURE (SEMAINE 1)**

**Mission :** Établir les fondations techniques solides et le design system enterprise pour le nouveau projet.

**Livrable :** Base technique opérationnelle avec design system enterprise et architecture modulaire.

---

## 🎯 **JOUR 1-2 : INITIALISATION PROJET**

### **Étape 1 : Clonage et Configuration Base**
```bash
# 1. Cloner le projet de base Lovable
cd c:\Users\massa\
git clone [URL_LOVABLE_BASE] entreprise-os-genesis-framework
cd entreprise-os-genesis-framework

# 2. Configuration initiale
npm install
cp .env.example .env

# 3. Vérification de la base
npm run dev
# Vérifier que l'application démarre sur http://localhost:5173
```

### **Étape 2 : Migration Sélective des Assets**
```bash
# Depuis le projet principal myspace
# Copier les fichiers validés et testés :

# 1. Composants UI validés
cp -r ../myspace/myspace/src/components/ui/workflow-builder ./src/components/ui/
cp -r ../myspace/myspace/src/components/ui/draggable-list ./src/components/ui/
cp ../myspace/myspace/src/components/ui/data-table.tsx ./src/components/ui/
cp ../myspace/myspace/src/components/ui/kanban.tsx ./src/components/ui/

# 2. Services API testés
cp ../myspace/myspace/src/lib/api.ts ./src/lib/
cp ../myspace/myspace/src/lib/supabase.ts ./src/lib/

# 3. Types TypeScript validés
cp ../myspace/myspace/src/types/database.ts ./src/types/
cp ../myspace/myspace/src/types/supabase.ts ./src/types/

# 4. Hooks React Query opérationnels
cp -r ../myspace/myspace/src/hooks ./src/

# 5. Configuration Supabase
cp ../myspace/myspace/supabase/config.toml ./supabase/
```

### **Étape 3 : Configuration Environnement**
```bash
# .env configuration
VITE_SUPABASE_URL=https://qlqgyrfqiflnqknbtycw.supabase.co
VITE_SUPABASE_ANON_KEY=[CLEF_ANON_SUPABASE]
VITE_DEXCHANGE_API_KEY=[CLEF_DEXCHANGE]
VITE_DEXCHANGE_SECRET=[SECRET_DEXCHANGE]
VITE_GEMINI_API_KEY=[CLEF_GEMINI_AI]

# Vérification des Edge Functions disponibles (37 fonctions)
# Test de connexion à la base de données (24 tables, 8 employés test)
```

---

## 🎨 **JOUR 3-4 : DESIGN SYSTEM ENTERPRISE**

### **Étape 1 : Extension CSS Enterprise**
Modifier `src/index.css` pour ajouter les couleurs enterprise :

```css
/* === ENTERPRISE OS EXTENSIONS === */
:root {
  /* Couleurs Enterprise Business */
  --enterprise-primary: #0066CC;     /* Bleu professionnel */
  --enterprise-accent: #FF6B35;      /* Orange énergique */
  --enterprise-dark: #1A1D20;        /* Gris très sombre */
  --enterprise-success: #28A745;     /* Vert validation */
  --enterprise-warning: #FFC107;     /* Jaune attention */
  --enterprise-error: #DC3545;       /* Rouge erreur */

  /* Tons métier spécialisés */
  --financial-green: #059669;        /* Vert financier */
  --analytics-blue: #3B82F6;         /* Bleu analytics */
  --support-purple: #8B5CF6;         /* Violet support */
  --admin-orange: #F59E0B;           /* Orange admin */

  /* Typographie Enterprise */
  --font-enterprise: 'Inter', system-ui, sans-serif;
  --font-mono-enterprise: 'JetBrains Mono', 'Consolas', monospace;

  /* Shadows Enterprise */
  --shadow-enterprise-sm: 0 2px 8px rgba(0, 102, 204, 0.08);
  --shadow-enterprise-md: 0 8px 25px rgba(0, 102, 204, 0.12);
  --shadow-enterprise-lg: 0 15px 35px rgba(0, 102, 204, 0.15);
}

/* Classes utilitaires enterprise */
.bg-enterprise-primary { background-color: var(--enterprise-primary); }
.text-enterprise-primary { color: var(--enterprise-primary); }
.border-enterprise-primary { border-color: var(--enterprise-primary); }

.bg-enterprise-accent { background-color: var(--enterprise-accent); }
.text-enterprise-accent { color: var(--enterprise-accent); }

.shadow-enterprise { box-shadow: var(--shadow-enterprise-md); }
.shadow-enterprise-lg { box-shadow: var(--shadow-enterprise-lg); }
```

### **Étape 2 : Composants Enterprise de Base**
Créer `src/components/enterprise/ui/` :

#### **MetricsCard.tsx**
```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MetricsCardProps {
  title: string
  value: string | number
  trend?: {
    value: number
    isPositive: boolean
  }
  icon?: React.ReactNode
  variant?: "default" | "financial" | "analytics" | "admin"
}

export function MetricsCard({ 
  title, 
  value, 
  trend, 
  icon, 
  variant = "default" 
}: MetricsCardProps) {
  const variantStyles = {
    default: "border-enterprise-primary/20 bg-gradient-to-br from-white to-blue-50",
    financial: "border-financial-green/20 bg-gradient-to-br from-white to-green-50",
    analytics: "border-analytics-blue/20 bg-gradient-to-br from-white to-blue-50",
    admin: "border-admin-orange/20 bg-gradient-to-br from-white to-orange-50"
  }

  return (
    <Card className={`${variantStyles[variant]} shadow-enterprise transition-all hover:shadow-enterprise-lg`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-enterprise-primary">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-enterprise-dark">
          {value}
        </div>
        {trend && (
          <div className={`flex items-center text-xs ${
            trend.isPositive ? 'text-enterprise-success' : 'text-enterprise-error'
          }`}>
            {trend.isPositive ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

#### **ActionSheet.tsx**
```typescript
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

interface ActionSheetProps {
  trigger: React.ReactNode
  title: string
  description?: string
  children: React.ReactNode
  size?: "sm" | "default" | "lg" | "xl"
}

export function ActionSheet({ 
  trigger, 
  title, 
  description, 
  children, 
  size = "default" 
}: ActionSheetProps) {
  const sizeStyles = {
    sm: "max-w-sm",
    default: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl"
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent className={`${sizeStyles[size]} shadow-enterprise-lg`}>
        <SheetHeader>
          <SheetTitle className="text-enterprise-primary">
            {title}
          </SheetTitle>
          {description && (
            <SheetDescription>
              {description}
            </SheetDescription>
          )}
        </SheetHeader>
        <div className="mt-6">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

---

## 🏗️ **JOUR 5 : LAYOUT & NAVIGATION ENTERPRISE**

### **Étape 1 : EnterpriseLayout.tsx**
Créer `src/components/enterprise/layout/EnterpriseLayout.tsx` :

```typescript
import { useState } from "react"
import { Outlet } from "react-router-dom"
import { EnterpriseHeader } from "./EnterpriseHeader"
import { EnterpriseSidebar } from "./EnterpriseSidebar"
import { Breadcrumbs } from "./Breadcrumbs"

export function EnterpriseLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <EnterpriseSidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <EnterpriseHeader 
          onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        {/* Breadcrumbs */}
        <div className="px-6 py-3 bg-white border-b">
          <Breadcrumbs />
        </div>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

### **Étape 2 : EnterpriseHeader.tsx**
```typescript
import { Search, Bell, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface EnterpriseHeaderProps {
  onSidebarToggle: () => void
}

export function EnterpriseHeader({ onSidebarToggle }: EnterpriseHeaderProps) {
  return (
    <header className="bg-white border-b shadow-sm px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo et Search */}
        <div className="flex items-center space-x-4">
          <div className="text-xl font-bold text-enterprise-primary">
            Enterprise OS
          </div>
          
          {/* Recherche Globale */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Rechercher... (Ctrl+K)"
              className="pl-10 w-96"
            />
          </div>
        </div>

        {/* Actions Utilisateur */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuItem>
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
```

### **Étape 3 : EnterpriseSidebar.tsx**
```typescript
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  FolderOpen, 
  MessageSquare, 
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EnterpriseSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Ressources Humaines", href: "/hr", icon: Users },
  { name: "Business", href: "/business", icon: FileText },
  { name: "Projets", href: "/projects", icon: FolderOpen },
  { name: "Support", href: "/support", icon: MessageSquare },
  { name: "Administration", href: "/admin", icon: Settings },
]

export function EnterpriseSidebar({ collapsed, onToggle }: EnterpriseSidebarProps) {
  return (
    <div className={cn(
      "bg-white border-r shadow-sm transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Toggle Button */}
      <div className="p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="w-full"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.name}
              variant="ghost"
              className={cn(
                "w-full justify-start",
                collapsed ? "px-2" : "px-4"
              )}
            >
              <Icon className="h-5 w-5" />
              {!collapsed && (
                <span className="ml-3">{item.name}</span>
              )}
            </Button>
          )
        })}
      </nav>
    </div>
  )
}
```

---

## ✅ **VALIDATION SPRINT 1**

### **Tests de Fonctionnement**
1. **Base technique** : Application démarre sans erreur
2. **Design system** : Couleurs enterprise appliquées
3. **Composants** : MetricsCard, ActionSheet opérationnels
4. **Layout** : EnterpriseLayout responsive fonctionnel
5. **Navigation** : Sidebar collapsible opérationnelle

### **Checklist de Validation**
- [ ] Projet cloné et configuré
- [ ] Assets migrés avec succès
- [ ] Variables d'environnement configurées
- [ ] Design system enterprise implémenté
- [ ] Composants de base créés et testés
- [ ] Layout enterprise fonctionnel
- [ ] Navigation sidebar opérationnelle
- [ ] Mode responsive validé
- [ ] Tests TypeScript sans erreur
- [ ] Application fonctionnelle sur localhost

### **Critères de Réussite**
- **Performance** : Application charge en <2s
- **Design** : Cohérence visuelle enterprise
- **Code** : 0 erreur TypeScript
- **UX** : Navigation fluide et intuitive
- **Responsive** : Fonctionnel mobile/desktop

---

## 🚀 **PRÊT POUR SPRINT 2 !**

**Livrable Sprint 1 :** ✅ Base technique solide avec design system enterprise

**Prochain Sprint 2 :** Architecture modulaire avec services API centralisés

**État d'avancement :** Fondations établies, prêt pour le développement des modules métier

---

## 📞 **SUPPORT & RESSOURCES**

### **Documentation de Référence**
- Design system Twenty : https://twenty.com
- shadcn/ui : https://ui.shadcn.com
- Supabase : https://supabase.com/docs

### **Assets Disponibles**
- 37 Edge Functions prêtes (IA, paiements, analytics)
- 24 tables avec données de test
- Composants validés (WorkflowBuilder, DraggableList, Kanban)
- Services API testés

### **En Cas de Problème**
1. Vérifier les variables d'environnement
2. Contrôler la connexion Supabase
3. Valider les imports des composants migrés
4. Tester les types TypeScript

**Let's build the Enterprise OS foundation! 🔥**
