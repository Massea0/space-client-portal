# 🚀 Message d'Onboarding : Nouvel Assistant IA

## 🎯 Mission Principale

Tu vas reprendre le projet **Arcadis Enterprise OS** - une refonte complète de toutes les pages existantes d'Arcadis Space en utilisant **STRICTEMENT** les composants du design system showcase.

## 📋 RÈGLE FONDAMENTALE - "SHOWCASE-FIRST"

**OBLIGATION ABSOLUE** : Toute page doit être refondue en utilisant **EXCLUSIVEMENT** les composants exposés dans `/design-system`.

### Workflow Obligatoire 🔄
```
1. Ouvrir http://localhost:3000/design-system (page showcase)
2. Identifier les composants nécessaires pour la page à refondre
3. Si un composant manque → L'ajouter au showcase D'ABORD
4. Puis utiliser ce composant dans la page métier
5. AUCUNE EXCEPTION : showcase-first toujours
```

### Code Autorisé vs Interdit
```typescript
// ✅ AUTORISÉ : Composants du showcase
import { Card } from "@/components/ui/card"
import { InteractiveStatsCard } from "@/components/modules/dashboard/InteractiveStatsCard"
import { Table } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

// ❌ TOTALEMENT INTERDIT : Nouveau composant custom
const MyCustomCard = () => { ... }  // JAMAIS !
```

## 📚 Documents OBLIGATOIRES à Lire

### 1. **PLAN-REFONTE-ARCADIS-ENTERPRISE-OS.md** (CRITIQUE)
**Localisation** : `docs/PLAN-REFONTE-ARCADIS-ENTERPRISE-OS.md`
**Contenu** :
- Architecture showcase-first détaillée
- Inventaire complet des 15+ pages à refondre
- Roadmap de développement en 5 phases
- Checklists de validation par page
- Guide technique complet

### 2. **CHECKLISTS-DETAILLEES-ENTERPRISE-OS.md** (ESSENTIEL)
**Localisation** : `docs/CHECKLISTS-DETAILLEES-ENTERPRISE-OS.md`
**Contenu** :
- Checklists détaillées pour chaque page/module
- Critères de validation showcase-first
- Check-points techniques et UX

### 3. **RAPPORT-COMPARAISON-PLAN-IMPLEMENTATION.md** (CONTEXT)
**Localisation** : `docs/RAPPORT-COMPARAISON-PLAN-IMPLEMENTATION.md`
**Contenu** :
- État actuel vs plan initial (89% conformité)
- Métriques de qualité technique
- Points d'amélioration identifiés

### 4. **GUIDE-PASSATION-ENTERPRISE-OS.md** (SYNTHÈSE)
**Localisation** : `docs/GUIDE-PASSATION-ENTERPRISE-OS.md`
**Contenu** :
- Résumé exécutif du projet
- Points clés pour démarrage rapide
- Architecture et composants prioritaires

## 🏗️ État Technique Actuel

### ✅ Ce qui est DÉJÀ fait (À RÉUTILISER)
- **Design System Twenty.UI** : 98% conformité, showcase opérationnel
- **Composants UI** : Button, Card, Table, Dialog, Tabs, etc. (25+ composants)
- **Composants Interactifs** : WorkflowBuilder, InteractiveGrid, DraggableList
- **Pages existantes** : Dashboard, Factures, Devis, Support (à refondre)

### 🔧 Ce qui t'attend (TON TRAVAIL)
- **Refonte des pages** : 15+ pages à transformer avec composants showcase
- **Respect du design** : Enterprise OS moderne basé sur Twenty.UI
- **Performance** : Optimisation et tests de chaque page refondue
- **Documentation** : Maintenir la doc technique à jour

## 🚀 Plan d'Action Immédiat

### Phase 1 : Découverte (1-2 jours)
1. **Lire TOUS les documents** listés ci-dessus
2. **Explorer le showcase** : http://localhost:3000/design-system
3. **Analyser les pages existantes** : Dashboard, Factures, Devis, Support
4. **Comprendre l'architecture** : Components, modules, structure

### Phase 2 : Premier Sprint (Semaine 1)
1. **Dashboard Client** `/dashboard` (Priorité 1)
   - Audit showcase : Identifier composants nécessaires
   - Refonte avec InteractiveStatsCard, GridLayout, Charts
   - Tests et validation showcase-first
2. **Dashboard Admin** `/admin/dashboard` (Priorité 1)
   - Même process showcase-first
   - Utilisation DataTable, Metrics, Analytics

### Phase 3 : Modules Critiques (Semaines 2-3)
1. **Factures** `/factures` + `/admin/factures`
2. **Devis** `/devis` + `/admin/devis`
3. **Support** `/support` + `/admin/support`

## 🎯 Commandes de Démarrage

### 1. Exploration du Projet
```bash
# Démarrer l'application
npm run dev

# Ouvrir le showcase (RÉFÉRENCE ABSOLUE)
http://localhost:3000/design-system

# Tester les pages existantes
http://localhost:3000/dashboard
http://localhost:3000/factures
http://localhost:3000/admin
```

### 2. Lecture de la Documentation
```bash
# Ordre de lecture OBLIGATOIRE :
1. docs/PLAN-REFONTE-ARCADIS-ENTERPRISE-OS.md
2. docs/CHECKLISTS-DETAILLEES-ENTERPRISE-OS.md  
3. docs/RAPPORT-COMPARAISON-PLAN-IMPLEMENTATION.md
4. docs/GUIDE-PASSATION-ENTERPRISE-OS.md
```

### 3. Exploration du Code
```bash
# Structure à comprendre :
src/components/ui/          # Composants de base (showcase)
src/components/modules/     # Composants métier (showcase)
src/pages/                  # Pages à refondre
src/modules/                # Modules métier existants
```

## ✅ Checklist de Démarrage

### Découverte Technique
- [ ] Documentation complète lue et comprise
- [ ] Showcase exploré et composants identifiés
- [ ] Pages existantes testées et analysées
- [ ] Architecture technique comprise

### Premier Développement
- [ ] Dashboard client - Audit showcase fait
- [ ] Dashboard client - Composants identifiés
- [ ] Dashboard client - Refonte démarrée avec showcase-first
- [ ] Tests et validation première page

### Validation Process
- [ ] Workflow showcase-first maîtrisé
- [ ] Aucun composant custom créé hors showcase
- [ ] Documentation maintenue à jour
- [ ] Communication régulière sur l'avancement

## 🚨 Points d'Attention Critiques

### Erreurs à ÉVITER ABSOLUMENT
1. **Créer un composant sans le mettre dans showcase**
2. **Dupliquer du code existant** au lieu de réutiliser
3. **Ignorer les checklists** de validation
4. **Modifier le design system** sans validation

### Bonnes Pratiques OBLIGATOIRES
1. **Showcase-first** pour chaque page
2. **Tests systématiques** après chaque refonte
3. **Documentation à jour** des changements
4. **Communication** des blocages et questions

## 💬 Communication et Support

### Questions Techniques
- Référencer le document approprié (PLAN, CHECKLISTS, etc.)
- Expliquer le contexte showcase-first
- Proposer des solutions basées sur les composants existants

### Blocages
- Analyser si le composant nécessaire existe dans showcase
- Si manquant : proposer d'ajouter au showcase en premier
- Ne jamais créer de solution custom hors design system

### Reporting d'Avancement
- État des pages refondues vs planning
- Respect du workflow showcase-first
- Métriques de performance et qualité

---

## 🎯 Objectif Final

**Transformer Arcadis Space en Arcadis Enterprise OS** - une plateforme moderne, cohérente et performante où chaque page utilise exclusivement les composants validés du design system showcase.

**Succès = 100% des pages refondues avec 100% showcase-first + 0% composants custom.**

---

**Bonne chance et bienvenue dans l'équipe ! 🚀**

*Ce message contient tout ce dont tu as besoin pour démarrer. En cas de doute, reviens toujours à la règle showcase-first et consulte la documentation.*
