# 🚀 Guide de Démarrage Immédiat - Sprint 1
## Implémentation Composants UI Twenty-Inspired

### ⚡ Action Immédiate Requise

**Objectif Sprint 1** : Implémenter les 3 composants fondamentaux en 5 jours
**Status** : 🔥 **PRÊT POUR DÉMARRAGE IMMÉDIAT**

## 📋 Checklist Pré-Démarrage (5 minutes)

### ✅ Vérifications Environnement
- [ ] Node.js 18+ installé et fonctionnel
- [ ] Workspace VS Code ouvert sur le projet
- [ ] Terminal prêt dans le répertoire `myspace`
- [ ] Git repository clean (pas de changements uncommitted)

### ✅ Dépendances à Installer (2 minutes)
```bash
npm install @radix-ui/react-select @radix-ui/react-checkbox @radix-ui/react-radio-group react-hook-form @hookform/resolvers zod
```

## 🎯 Sprint 1 - Jour 1-2 : Select/Dropdown Component

### 🔥 Tâche Priorité #1 : Créer le Select Component

#### Étape 1 : Structure de Base (30 minutes)
**Fichier** : `src/components/ui/select.tsx`

**Template de démarrage** :
```typescript
import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      // À compléter avec les styles Twenty-inspired
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      {/* Icône chevron */}
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))

// ... Autres composants
```

#### Étape 2 : Styling Twenty-Inspired (45 minutes)
**Classes Tailwind à utiliser** :
```css
/* Trigger Styles */
base: "flex h-10 w-full items-center justify-between rounded-md border border-gray-20 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"

/* Variants */
default: "border-gray-20 focus:ring-primary"
error: "border-error focus:ring-error"
success: "border-success focus:ring-success"
warning: "border-warning focus:ring-warning"

/* Sizes */
sm: "h-8 px-2 text-xs"
default: "h-10 px-3 text-sm"  
lg: "h-12 px-4 text-base"
```

#### Étape 3 : Variants et États (30 minutes)
**Props interface** :
```typescript
interface SelectTriggerProps {
  variant?: "default" | "error" | "success" | "warning"
  size?: "sm" | "default" | "lg"
}
```

### ⏱️ Timeline Jour 1-2 Détaillé

#### Jour 1 Matin (4h)
- [ ] **09:00-09:30** : Setup fichier `select.tsx` + structure Radix
- [ ] **09:30-10:15** : Styling de base + variants
- [ ] **10:15-10:30** : Break
- [ ] **10:30-11:30** : Implémentation tailles + états
- [ ] **11:30-12:30** : Tests de base + intégration

#### Jour 1 Après-midi (4h)
- [ ] **14:00-15:00** : Recherche intégrée (filtering)
- [ ] **15:00-16:00** : Multi-sélection avec chips
- [ ] **16:00-16:15** : Break
- [ ] **16:15-17:15** : Groupement d'options
- [ ] **17:15-18:00** : Documentation + exemples

#### Jour 2 Matin (4h)
- [ ] **09:00-10:00** : Navigation clavier complète
- [ ] **10:00-11:00** : Animations + transitions
- [ ] **11:00-11:15** : Break
- [ ] **11:15-12:30** : Accessibilité ARIA + tests

#### Jour 2 Après-midi (4h)
- [ ] **14:00-15:30** : Tests unitaires complets
- [ ] **15:30-16:30** : Intégration react-hook-form
- [ ] **16:30-16:45** : Break
- [ ] **16:45-17:30** : Polish + optimisations
- [ ] **17:30-18:00** : Demo + validation

## 📝 Checklist de Validation par Composant

### ✅ Select Component - Validation Criteria
- [ ] **Visuel** : Parfaitement aligné avec Twenty design
- [ ] **Responsive** : Fonctionne sur mobile/tablet/desktop
- [ ] **Performance** : <50ms ouverture dropdown
- [ ] **Accessibilité** : Tab navigation + screen reader
- [ ] **States** : Tous les variants + sizes opérationnels
- [ ] **Integration** : Compatible react-hook-form + zod
- [ ] **Tests** : >90% coverage + tests visuels
- [ ] **Documentation** : Exemples d'usage complets

## 🎯 Sprint 1 - Jour 3 : Checkbox/Radio Components

### 📋 Planning Jour 3
#### Matin (4h) - Checkbox Component
- [ ] **09:00-10:00** : Structure HTML sémantique + base styles
- [ ] **10:00-11:00** : Animation check + variants colorés
- [ ] **11:00-11:15** : Break
- [ ] **11:15-12:30** : État indéterminé + groupes

#### Après-midi (4h) - Radio Component
- [ ] **14:00-15:00** : Radio structure + styling
- [ ] **15:00-16:00** : Radio groups + layout
- [ ] **16:00-16:15** : Break
- [ ] **16:15-17:30** : Tests + documentation
- [ ] **17:30-18:00** : Validation croisée

## 🎯 Sprint 1 - Jour 4 : TitleInput Component

### 📋 Planning Jour 4
#### Matin (4h) - TitleInput Core
- [ ] **09:00-10:00** : Input inline éditable base
- [ ] **10:00-11:00** : Auto-focus + auto-resize
- [ ] **11:00-11:15** : Break
- [ ] **11:15-12:30** : Validation temps réel

#### Après-midi (4h) - TitleInput Polish
- [ ] **14:00-15:00** : Raccourcis clavier Escape/Enter
- [ ] **15:00-16:00** : Animations transitions
- [ ] **16:00-16:15** : Break
- [ ] **16:15-17:30** : Integration tests
- [ ] **17:30-18:00** : Documentation finale

## 🎯 Sprint 1 - Jour 5 : Intégration et Tests

### 📋 Planning Jour 5 - Finalisation
#### Matin (4h) - Tests d'Intégration
- [ ] **09:00-10:00** : Tests inter-composants
- [ ] **10:00-11:00** : React Hook Form integration
- [ ] **11:00-11:15** : Break
- [ ] **11:15-12:30** : Tests accessibilité complets

#### Après-midi (4h) - Showcase et Documentation
- [ ] **14:00-15:00** : Update page design-system-showcase
- [ ] **15:00-16:00** : Corrections bugs identifiés
- [ ] **16:00-16:15** : Break
- [ ] **16:15-17:30** : Documentation guide d'utilisation
- [ ] **17:30-18:00** : Sprint review + démonstration

## 🛠️ Outils et Ressources

### 📦 Dépendances Exactes à Installer
```json
{
  "@radix-ui/react-select": "^2.0.0",
  "@radix-ui/react-checkbox": "^1.0.4",
  "@radix-ui/react-radio-group": "^1.1.3",
  "react-hook-form": "^7.45.0",
  "@hookform/resolvers": "^3.1.1",
  "zod": "^3.21.4"
}
```

### 🎨 Design Tokens Référence
```css
/* Colors déjà configurés dans tailwind.config.ts */
primary: #3b82f6
success: #10b981
warning: #f59e0b
error: #ef4444

/* Spacing */
sm: 8px / 32px height
default: 12px / 40px height  
lg: 16px / 48px height

/* Animations */
transition-colors: 150ms ease
transition-transform: 200ms ease-out
```

### 📝 Code Snippets Utiles

#### Variant Helper Function
```typescript
const selectVariants = cva(
  "flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-gray-20 focus:ring-primary",
        error: "border-error focus:ring-error",
        success: "border-success focus:ring-success",
        warning: "border-warning focus:ring-warning",
      },
      size: {
        sm: "h-8 px-2 text-xs",
        default: "h-10 px-3 text-sm",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

## 🚀 Commandes de Démarrage Rapide

### 1. Installation Dépendances (1 minute)
```bash
npm install @radix-ui/react-select @radix-ui/react-checkbox @radix-ui/react-radio-group react-hook-form @hookform/resolvers zod
```

### 2. Créer Structure Fichiers (30 secondes)
```bash
mkdir -p src/components/ui/forms
touch src/components/ui/forms/select.tsx
touch src/components/ui/forms/checkbox.tsx  
touch src/components/ui/forms/radio.tsx
touch src/components/ui/forms/title-input.tsx
```

### 3. Lancer l'Application (30 secondes)
```bash
npm run dev
```

### 4. Ouvrir Checklist Interactive (15 secondes)
```bash
# Dans VS Code
# Ouvrir checklist-interactive-composants-twenty.html
# Clic droit > "Open with Live Server" ou prévisualisaton
```

## ✅ Critères de Succès Sprint 1

### 🎯 Objectifs Atteints
- [ ] **3 composants** créés et fonctionnels
- [ ] **Design cohérent** avec Twenty standards  
- [ ] **Tests passing** >90% coverage
- [ ] **Documentation** complète développeur
- [ ] **Demo** opérationnelle sur showcase
- [ ] **Integration** react-hook-form validée
- [ ] **Accessibilité** WCAG compliant
- [ ] **Performance** <100ms interactions

### 🏆 Livrable Sprint 1
- ✅ `src/components/ui/forms/select.tsx` - Complet
- ✅ `src/components/ui/forms/checkbox.tsx` - Complet  
- ✅ `src/components/ui/forms/radio.tsx` - Complet
- ✅ `src/components/ui/forms/title-input.tsx` - Complet
- ✅ Tests unitaires pour tous les composants
- ✅ Showcase mis à jour avec exemples
- ✅ Documentation développeur complète

---

**🚨 ACTION REQUISE** : Démarrer immédiatement le Sprint 1  
**⏰ Temps estimé** : 5 jours de développement intensif  
**📊 Progression** : Tracker via checklist interactive  
**🎯 Prochaine étape** : Sprint 2 - Composants de données
