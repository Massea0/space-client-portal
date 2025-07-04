# 🤖 Guide de Passation Assistant - Enterprise OS

## 🎯 Objectif de cette Passation
Ce document permet à un **nouvel assistant GitHub Copilot** de reprendre le développement du projet Enterprise OS à partir de l'état actuel, en comprenant rapidement l'architecture, les choix techniques, et les prochaines étapes.

## 📊 État Actuel du Projet (3 juillet 2025)

### ✅ Ce qui EST Implémenté et Fonctionne

#### 1. Architecture de Base
- ✅ **React 18 + TypeScript** : Configuration moderne et stricte
- ✅ **Vite** : Build rapide et HMR
- ✅ **Tailwind CSS** : Système de design avec variables CSS custom
- ✅ **Supabase** : Backend complet (Auth + DB + Storage + Edge Functions)

#### 2. Système de Paramètres Globaux (KRITIQUE)
- ✅ **Table `app_settings`** : Paramètres configurables (devise, contexte métier, entreprise)
- ✅ **SettingsContext** : Provider React global pour accès aux paramètres
- ✅ **API Settings** : CRUD complet des paramètres
- ✅ **Page Admin Settings** : Interface de configuration avec onglets
- ✅ **Internationalisation** : Support multi-devise et contexte métier dynamique

#### 3. Design System Unifié (KRITIQUE)
- ✅ **Variables CSS HSL** : Palette complète clair/sombre cohérente
- ✅ **Composants unifiés** : Cards, boutons, inputs, badges avec thème
- ✅ **Classes utilitaires** : Animations, layouts, typographie
- ✅ **Statuts Kanban** : Variables CSS pour drag & drop (préparé)
- ✅ **Thème Twenty.com inspired** : Modern et professionnel

#### 4. Modules Fonctionnels
- ✅ **Module Factures** : Création, gestion, paiement Wave intégré
- ✅ **Module Devis** : Génération, validation, conversion en facture
- ✅ **Dashboard Analytics** : Métriques, graphiques avec Recharts
- ✅ **Authentification** : Login/logout Supabase avec RLS

#### 5. Intelligence Artificielle
- ✅ **Edge Function IA** : Intégration Gemini avec context métier dynamique
- ✅ **Prompts contextuels** : Utilise devise et secteur depuis app_settings
- ✅ **Fallbacks intelligents** : Gestion des erreurs et valeurs par défaut

### ⏳ Ce qui est EN COURS

#### 1. Module Projet (80% fait)
- ⏳ **Kanban Board** : Structure de base créée, drag & drop à finaliser
- ⏳ **Gestion des tâches** : CRUD implémenté, interface à améliorer
- ⏳ **Assignation** : Système basique, à connecter avec futur module RH

#### 2. Préparation Module Équipes
- ⏳ **Structure** : Préparée pour intégration avec employés RH
- ⏳ **Composants** : Quelques composants de base créés

### 🚀 Ce qui DOIT être Implémenté (Priorité)

#### 1. Module RH Complet (PRIORITÉ 1)
**Voir le plan détaillé** : [`docs/hr-integration/PLAN-INTEGRATION-RH-COMPLET.md`](../hr-integration/PLAN-INTEGRATION-RH-COMPLET.md)

**Sprint 1 (Immédiat)** :
- [ ] Migrations base de données RH (employés, contrats, départements)
- [ ] Types TypeScript RH complets
- [ ] Services API employés de base
- [ ] Système de rôles (admin/manager/employé/client)

**Sprint 2** :
- [ ] Interface gestion des employés
- [ ] Profils employés complets
- [ ] Organigramme interactif

#### 2. Finalisation Module Projet (PRIORITÉ 2)
- [ ] Drag & drop Kanban complètement fonctionnel
- [ ] Interface mobile-friendly
- [ ] Intégration avec futurs employés RH

#### 3. Système de Rôles Avancé (PRIORITÉ 3)
- [ ] Permissions granulaires par module
- [ ] Interface admin de gestion des accès
- [ ] Composants RoleGuard et PermissionCheck

## 🏗️ Architecture Technique Actuelle

### Structure des Dossiers
```
src/
├── components/          # Composants React
│   ├── ui/             # Composants UI de base
│   ├── modules/        # Composants par module métier
│   └── layout/         # Layout et navigation
├── services/           # APIs et services externes
├── hooks/              # Hooks React custom
├── types/              # Types TypeScript
├── context/            # Contexts React (Settings très important)
├── pages/              # Pages principales
└── lib/                # Utilitaires et helpers
```

### Technologies et Dépendances Clés
```json
{
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "vite": "^4.4.0",
  "@supabase/supabase-js": "^2.33.1",
  "tailwindcss": "^3.3.0",
  "react-router-dom": "^6.14.0",
  "react-hook-form": "^7.45.0",
  "zod": "^3.21.0",
  "recharts": "^2.7.0",
  "react-beautiful-dnd": "^13.1.1"
}
```

### Base de Données (Supabase)
```sql
-- Tables Principales
- users                 # Authentification Supabase
- app_settings          # Paramètres globaux (KRITIQUE)
- invoices              # Factures
- quotes                # Devis  
- projects              # Projets
- tasks                 # Tâches
- analytics_data        # Données analytics

-- À Créer pour RH
- employees             # Employés (priorité 1)
- departments           # Départements
- positions             # Postes
- contracts             # Contrats
- employee_documents    # Documents
```

## 🔑 Points Kritiques à Comprendre

### 1. Système de Paramètres Globaux
**ABSOLUMENT KRITIQUE** - Tout le système d'internationalisation repose là-dessus.

```typescript
// Context utilisé partout dans l'app
const { settings } = useSettings();
console.log(settings.currency);     // "EUR", "USD", "XOF", etc.
console.log(settings.businessContext); // "construction", "tech", etc.

// Utilisé dans l'IA pour des réponses contextuelles
// Utilisé pour formatter les montants
// Utilisé pour adapter l'interface
```

**Localisation** : `src/context/SettingsContext.tsx` et `src/services/settingsApi.ts`

### 2. Design System et Variables CSS
Le thème utilise des **variables CSS HSL** pour une cohérence parfaite clair/sombre :

```css
:root {
  --primary: 217 91% 58%;        /* Bleu Arcadis */
  --card: 0 0% 100%;             /* Fond des cartes */
  --card-hover: 0 0% 97%;        /* Hover des cartes */
  /* ... 50+ variables pour tout le système */
}

.dark {
  --primary: 217 91% 65%;        /* Bleu plus clair en sombre */
  --card: 0 0% 7%;               /* Cartes sombres */
  /* ... versions sombres */
}
```

**Localisation** : `src/index.css` (lignes 1-600+)

### 3. Edge Functions et IA
L'IA utilise les paramètres globaux pour contextualiser les réponses :

```typescript
// supabase/functions/project-planner-ai/index.ts
const settings = await getAppSettings();
const prompt = `
Context métier: ${settings.businessContext}
Devise: ${settings.currency}
Entreprise: ${settings.companyName}

${userQuery}
`;
```

### 4. Row Level Security (RLS)
Toutes les tables utilisent RLS pour la sécurité multi-tenant.

## 🚀 Comment Commencer (Prochaines Actions)

### Étape 1 : Comprendre l'Existant (1-2h)
1. **Lancer l'app** : `npm run dev` et explorer l'interface
2. **Tester les paramètres** : Aller dans `/admin/settings` et changer devise/contexte
3. **Examiner le code** des modules existants : `src/components/modules/`
4. **Comprendre SettingsContext** : `src/context/SettingsContext.tsx`

### Étape 2 : Préparer le Module RH (Immédiat)
1. **Lire le plan complet** : [`docs/hr-integration/PLAN-INTEGRATION-RH-COMPLET.md`](../hr-integration/PLAN-INTEGRATION-RH-COMPLET.md)
2. **Créer les migrations** : Commencer par les tables employees/departments
3. **Créer les types** : `src/types/hr/` avec types Employee, Contract, etc.
4. **Créer les services** : `src/services/hr/` avec APIs de base

### Étape 3 : Implémenter Sprint 1 RH
**Objectif** : Avoir une gestion basique des employés en 1-2 semaines.

**Tâches prioritaires** :
```bash
1. Migration: CREATE TABLE employees (...) 
2. Types: Employee, Department, Position
3. API: employeeApi.ts avec CRUD
4. Component: EmployeeList.tsx basique
5. Page: /hr/employees avec liste et ajout
6. Rôles: Système basique admin/employé
```

## ⚠️ Pièges et Points d'Attention

### 1. Ne Jamais Casser l'Existant
- Les modules Factures/Devis/Analytics sont en production
- Toujours tester après modification du SettingsContext
- Les variables CSS sont utilisées partout, attention aux changements

### 2. Respecter l'Architecture
- Utiliser les services existants comme modèle
- Respecter la structure des dossiers
- Utiliser les hooks existants (useSettings, useCurrency)
- Suivre les conventions TypeScript strictes

### 3. Sécurité
- Toutes les nouvelles tables DOIVENT avoir RLS
- Utiliser les policies Supabase appropriées
- Valider côté client ET serveur avec Zod

### 4. Performance
- Utiliser React.memo pour les composants lourds
- Optimiser les requêtes Supabase avec select()
- Lazy loading pour les nouveaux modules

## 🔧 Commandes Utiles

### Développement
```bash
npm run dev          # Serveur dev
npm run build        # Build production
npm run preview      # Preview build
npm run type-check   # Vérification TypeScript
```

### Supabase
```bash
npx supabase gen types typescript --local > src/types/supabase.ts
npx supabase db push              # Appliquer migrations
npx supabase functions deploy     # Déployer Edge Functions
```

### Tests
```bash
npm run test         # Tests unitaires
npm run e2e          # Tests end-to-end
```

## 📞 En Cas de Problème

### Problèmes Fréquents et Solutions

#### 1. "Settings non chargés"
- Vérifier que SettingsProvider entoure l'app dans App.tsx
- Vérifier les permissions RLS sur table app_settings
- Console.log pour debug le loading

#### 2. "Thème cassé"
- Vérifier les variables CSS dans index.css
- S'assurer que Tailwind compile correctement
- Vérifier la classe `dark` sur `<html>`

#### 3. "Supabase connection failed"
- Vérifier les variables d'environnement (.env.local)
- Vérifier l'URL et anon key Supabase
- Tester la connexion avec un simple select

### Ressources de Debug
- **Console navigateur** : Erreurs TypeScript et runtime
- **Supabase Dashboard** : Logs des requêtes et erreurs
- **Network tab** : Requêtes API et réponses
- **React DevTools** : État des composants et contexts

## 📋 Checklist de Transition

### Pour le Nouvel Assistant
- [ ] J'ai lu et compris ce guide complet
- [ ] J'ai lancé l'application en local avec succès
- [ ] J'ai testé les fonctionnalités existantes (factures, devis, analytics)
- [ ] J'ai compris le système de paramètres globaux
- [ ] J'ai examiné le design system et les variables CSS
- [ ] J'ai lu le plan d'intégration RH complet
- [ ] J'ai identifié les prochaines tâches prioritaires
- [ ] Je suis prêt à commencer l'implémentation du module RH

### Première Mission : Module RH Sprint 1
**Deadline recommandée** : 2 semaines
**Objectif** : Gestion basique des employés avec interface admin

**Livrables attendus** :
- [ ] Tables de base de données RH créées
- [ ] Types TypeScript RH définis
- [ ] API employés fonctionnelle
- [ ] Interface de liste des employés
- [ ] Formulaire d'ajout/édition employé
- [ ] Système de rôles basique
- [ ] Tests unitaires de base
- [ ] Documentation mise à jour

---

**Bonne chance et bon développement !** 🚀

L'architecture est solide, le design system est robuste, et le plan RH est détaillé. Tu as toutes les cartes en main pour faire d'Enterprise OS un véritable système de gestion d'entreprise moderne.
