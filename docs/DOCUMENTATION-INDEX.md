# 📚 Documentation Index - Enterprise OS

## 🎯 Vue d'Ensemble
Cette documentation couvre l'ensemble du projet **Enterprise OS** (anciennement Project Planner), une application de gestion d'entreprise modulaire et internationale avec fonctionnalités RH avancées.

## 🏗️ Architecture Actuelle

### ✅ Modules Implémentés
- **Système de Paramètres Globaux** (devise, contexte métier, entreprise)
- **Design System Unifié** (thème Twenty.com inspired)
- **Module Factures** (création, gestion, paiement Wave)
- **Module Devis** (génération, validation, conversion)
- **Dashboard Analytics** (métriques, graphiques, IA)
- **Système d'Authentification** (Supabase Auth)
- **Edge Functions IA** (Gemini intégré)

### ⏳ En Cours de Développement
- **Module Projet** (Kanban drag & drop, gestion tâches)
- **Module Équipes** (préparation pour RH)
- **Module Analytics Avancé** (prédictions, insights)

### 🚀 À Implémenter (Prochaines Phases)
- **Module RH Complet** (employés, contrats, onboarding, paie)
- **Système de Rôles Avancé** (admin/manager/employé/client)
- **Signature Numérique** (contrats, documents)
- **Module Formation** (e-learning, certifications)

## 📁 Organisation de la Documentation

### 📂 `/docs/en-cours/` - Documentation Active
Documents utilisés activement pour le développement et la maintenance.

#### 🔧 Configuration
- [`CONFIGURATION-INTERNATIONALE.md`](./en-cours/configuration/CONFIGURATION-INTERNATIONALE.md) - Paramètres globaux et internationalisation
- Configuration Supabase et variables d'environnement
- Configuration des APIs externes (Wave, Gemini)

#### 📋 Planification
- [`PLAN-ORGANISATION-DOCUMENTATION.md`](./en-cours/PLAN-ORGANISATION-DOCUMENTATION.md) - Ce document
- Plans de développement par module
- Roadmaps et sprints
- Estimation des tâches

#### 📖 Guidelines Techniques
- Standards de développement React/TypeScript
- Conventions de nommage et structure
- Guides d'implémentation des composants
- Procédures de test et déploiement

#### 📓 Journal de Développement
- Historique des modifications importantes
- Décisions techniques et architecturales
- Problèmes rencontrés et solutions
- Notes de progression par module

#### 🎯 Guides d'Utilisation
- Guides utilisateur par module
- Documentation des APIs
- Tutoriels d'utilisation du design system

### 📂 `/docs/archive/` - Historique
Documents complétés, résolus ou obsolètes conservés pour référence.

#### 🎖️ Missions Accomplies
- Rapports de missions terminées
- Résumés de réalisations
- Statuts de projets finalisés

#### 🔧 Corrections Résolues
- Bugs corrigés et solutions appliquées
- Harmonisations d'interface réalisées
- Optimisations implémentées

#### ✅ Tests Complétés
- Procédures de test exécutées
- Diagnostics résolus
- Validations système terminées

#### 📋 Checklists Finalisées
- Checklists de refonte terminées
- Vérifications d'interfaces accomplies
- Validations de composants

#### 🚀 Implémentations Terminées
- Modules complètement implémentés
- Finalisations de fonctionnalités
- Déploiements réussis

### 📂 `/docs/hr-integration/` - Module RH
Documentation spécifique au développement du module RH (prochaine phase majeure).

#### 📋 Planification RH
- [`PLAN-INTEGRATION-RH-COMPLET.md`](./hr-integration/PLAN-INTEGRATION-RH-COMPLET.md) - Plan complet d'intégration
- Architecture technique RH
- Spécifications fonctionnelles
- Roadmap d'implémentation

#### 🏗️ Architecture (À créer)
- Modèles de données RH
- Services et APIs
- Structure des composants
- Workflow des processus

#### 🗄️ Migrations (À créer)
- Scripts de migration base de données
- Structures des tables RH
- Procédures de déploiement

#### 📊 Spécifications (À créer)
- Cahier des charges détaillé
- Maquettes et wireframes
- Spécifications techniques

## 🛠️ Technologies Utilisées

### Frontend
- **React 18** avec TypeScript
- **Tailwind CSS** + Design System custom
- **React Router** pour la navigation
- **React Hook Form + Zod** pour les formulaires
- **Recharts** pour les graphiques
- **React Beautiful DnD** pour le drag & drop

### Backend
- **Supabase** (PostgreSQL + Auth + Storage + Edge Functions)
- **Row Level Security** pour les permissions
- **Real-time subscriptions** pour les mises à jour

### IA et Intégrations
- **Google Gemini** pour l'assistance IA
- **Wave API** pour les paiements mobiles
- **Edge Functions** pour la logique serveur

### Déploiement
- **Vite** pour le build
- **Supabase Hosting** pour le déploiement
- **Environment Variables** pour la configuration

## 🚀 Guide de Démarrage Rapide

### 1. Installation
```bash
cd myspace
npm install
```

### 2. Configuration
```bash
# Copier les variables d'environnement
cp .env.example .env.local

# Configurer Supabase
# Voir docs/en-cours/configuration/CONFIGURATION-INTERNATIONALE.md
```

### 3. Développement
```bash
npm run dev
# Application disponible sur http://localhost:5173
```

### 4. Tests
```bash
npm run test
npm run e2e
```

## 👥 Guide de Passation

### Pour un Nouvel Assistant/Développeur
1. **Lire cette documentation** complète
2. **Consulter** [`PLAN-INTEGRATION-RH-COMPLET.md`](./hr-integration/PLAN-INTEGRATION-RH-COMPLET.md)
3. **Examiner** les guidelines techniques dans `/docs/en-cours/guidelines/`
4. **Comprendre** l'architecture actuelle via le code source
5. **Suivre** le journal de développement pour le contexte

### Points d'Attention Critiques
- **Système de paramètres globaux** : Clé de l'internationalisation
- **Design system** : Cohérence visuelle Twenty.com inspired
- **Row Level Security** : Sécurité des données par utilisateur
- **Edge Functions** : Logique IA côté serveur
- **Migration progressive** : Ne pas casser l'existant

## 📞 Support et Contact

### Ressources Techniques
- **Code Source** : `/src/` avec TypeScript strict
- **Base de Données** : Schémas Supabase documentés
- **APIs** : Documentation dans `/src/services/`
- **Composants** : Storybook ou documentation inline

### Procédures d'Urgence
- **Rollback** : Utiliser git + Supabase migrations
- **Monitoring** : Logs Supabase + console erreurs
- **Support** : Documentation technique + GitHub issues

---

## 📈 Roadmap 2025

### Q1 2025 : Module RH Phase 1
- Gestion des employés
- Système de rôles avancé
- Contrats et onboarding basique

### Q2 2025 : Module RH Phase 2
- Paie et présences
- Signature numérique
- Analytics RH

### Q3 2025 : Modules Avancés
- Formation et développement
- Performance management
- Workflow automation

### Q4 2025 : Optimisation
- Mobile apps
- Intégrations tierces
- Scalabilité enterprise

---

**Dernière mise à jour** : 3 juillet 2025  
**Version** : 2.0.0 (Enterprise OS)  
**Statut** : Documentation organisée et prête pour intégration RH
