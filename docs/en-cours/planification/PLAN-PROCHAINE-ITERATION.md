# Plan pour la prochaine itération - 24 juin 2025

Ce document présente le plan structuré de la prochaine itération de correction et d'amélioration du front-end de MySpace, basé sur l'analyse complète des documents existants et de l'état actuel du code.

## Priorités d'implémentation

### Phase 1: Résolution des problèmes critiques (3 jours) 🔴

#### ✅ 1.1 Correction du modal de paiement Dexchange (TERMINÉ)
- **Échéance**: Jour 1-2
- **Fichiers modifiés**: 
  - `src/components/payments/DexchangePaymentModal.tsx`
  - `src/services/invoices-payment.ts` (nouveau service créé)
  - `src/pages/Factures.tsx` (mise à jour des props)
- **Actions réalisées**:
  - ✅ Remplacement d'AnimatedModal par SafeModal
  - ✅ Création d'un service API dédié pour les paiements
  - ✅ Migration de tous les appels direct à Edge Functions vers le service
  - ✅ Suppression du prop animationType non supporté
  - ✅ Ajout du prop isOpen pour compatibilité
  - ✅ Tests préliminaires avec le nouveau script `test-dexchange-modal.js`

#### ✅ 1.2 Implémentation de la modification des devis (TERMINÉ)
- **Échéance**: Jour 2-3
- **Fichiers créés/modifiés**:
  - `src/components/quotes/EditQuoteModal.tsx`
  - `src/services/quoteService.ts` 
  - `src/components/forms/DevisForm.tsx` (ajout du mode édition)
- **Actions réalisées**:
  - ✅ Création du composant EditQuoteModal basé sur SafeModal
  - ✅ Adaptation du formulaire existant pour permettre l'édition
  - ✅ Développement du service quoteService.updateQuote()
  - ✅ Intégration des notifications de succès/erreur

#### ✅ 1.3 Implémentation de la suppression des devis (TERMINÉ)
- **Échéance**: Jour 3
- **Fichiers créés/modifiés**:
  - `src/components/quotes/DeleteQuoteDialog.tsx` 
  - `src/pages/admin/AdminDevis.tsx`
  - `src/services/quoteService.ts`
- **Actions réalisées**:
  - ✅ Ajout de boutons d'édition et de suppression dans la liste des devis
  - ✅ Utilisation de ConfirmationDialog pour la confirmation
  - ✅ Implémentation du service quoteService.deleteQuote()
  - ✅ Ajout des notifications et actualisation automatique de liste

### Phase 2: Améliorations de haute priorité (4 jours) 🟠

#### ✅ 2.1 Harmonisation des interfaces client/admin (PARTIELLEMENT TERMINÉ)
- **Échéance**: Jour 4-5
- **Fichiers créés/modifiés**:
  - `src/components/invoices/InvoiceList.tsx` (nouveau composant)
  - `src/components/quotes/QuoteList.tsx` (nouveau composant)
  - `src/pages/admin/AdminFactures.tsx` (intégration du composant InvoiceList)
  - `src/pages/admin/AdminDevis.tsx` (intégration du composant QuoteList)
  - `src/pages/Devis.tsx` (intégration du composant QuoteList)
- **Actions réalisées**:
  - ✅ Création des composants standardisés pour les listes de factures et devis
  - ✅ Uniformisation des interfaces entre vues client et admin
  - ✅ Intégration complète dans les pages admin et dans la page Devis client
  - ✅ Réduction de la duplication de code et amélioration de la maintenabilité
- **À compléter**:
  - ⏳ Intégration du composant InvoiceList dans la page Factures.tsx
  - ⏳ Ajout de fonctionnalités de tri et d'export avancées
- **Fichiers à modifier**:
  - `src/pages/admin/AdminFactures.tsx`
  - `src/pages/client/Factures.tsx` (ou équivalent)
  - `src/components/invoices/InvoiceList.tsx` (à créer si nécessaire)
- **Actions**:
  - Créer des composants partagés pour les listes de factures/devis
  - Uniformiser le style et la structure des listes
  - Standardiser les filtres et les actions entre interfaces

#### 2.2 Refonte des formulaires de gestion des entreprises
- **Échéance**: Jour 6-7
- **Fichiers à modifier/créer**:
  - `src/components/companies/CompanyForm.tsx`
  - `src/components/companies/AddCompanyModal.tsx`
  - `src/components/companies/EditCompanyModal.tsx`
- **Actions**:
  - Reconstruire les formulaires avec SafeModal
  - Implémenter la validation
  - Corriger les appels API

#### 2.3 Implémentation de l'historique des paiements
- **Échéance**: Jour 7-8
- **Fichiers à créer**:
  - `src/components/payments/PaymentHistory.tsx`
  - `src/components/payments/PaymentHistoryModal.tsx`
- **Actions**:
  - Créer une interface pour afficher l'historique des paiements par entreprise
  - Implémenter les requêtes API nécessaires
  - Ajouter filtres et exports si nécessaire

### Phase 3: Optimisations et améliorations (3 jours) 🟡

#### 3.1 Optimisation des animations
- **Échéance**: Jour 8-9
- **Fichiers concernés**:
  - Composants utilisant Framer Motion
  - `src/components/ui/animations.tsx` (si existant)
- **Actions**:
  - Auditer et optimiser les animations causant des scintillements
  - Standardiser les durées et courbes d'animation
  - Documenter les patterns d'animation recommandés

#### 3.2 Améliorations de l'expérience utilisateur
- **Échéance**: Jour 10
- **Actions**:
  - Ajouter des améliorations UX aux tickets (défilement auto, indicateur de lecture)
  - Optimiser les filtres et la recherche
  - Harmoniser la terminologie dans toute l'application

### Phase 4: Sprint 4 - Composants avancés et finalisation (5 jours) 🟢

#### 4.1 Développement des composants avancés DraggableList et DraggableItem
- **Échéance**: Jour 1-2
- **Fichiers à créer/modifier**:
  - `src/components/ui/draggable-list.tsx`
  - `src/components/ui/draggable-item.tsx`
  - `src/components/ui/providers.tsx` (mise à jour si nécessaire)
  - `src/pages/design-system-showcase.tsx` (ajout de la section de démonstration)
- **Actions**:
  - Implémenter DraggableList en utilisant @dnd-kit/core et @dnd-kit/sortable
  - Développer DraggableItem avec les styles cohérents du design system
  - Ajouter les animations de drag-and-drop fluides
  - Créer une API intuitive avec des props personnalisables
  - Documenter l'usage et les exemples dans le showcase
  - Tester la compatibilité mobile et desktop

#### 4.2 Implémentation du Workflow Builder
- **Échéance**: Jour 2-3
- **Fichiers à créer**:
  - `src/components/ui/workflow-builder/workflow-builder.tsx`
  - `src/components/ui/workflow-builder/workflow-node.tsx`
  - `src/components/ui/workflow-builder/workflow-controls.tsx`
  - `src/components/ui/workflow-builder/workflow-edge.tsx`
- **Actions**:
  - Intégrer ReactFlow comme base du Workflow Builder
  - Concevoir des nœuds et connexions personnalisés cohérents avec le design system
  - Implémenter les contrôles de création/suppression de nœuds
  - Ajouter la logique de validation des workflows
  - Créer des exemples de workflows dans le showcase
  - Documenter l'API et les cas d'utilisation

#### 4.3 Optimisation des performances et finalisation
- **Échéance**: Jour 3-4
- **Actions**:
  - Audit de performance des nouveaux composants
  - Optimisation du rendu avec React.memo et useMemo où nécessaire
  - Implémentation du lazy loading pour les composants lourds
  - Tests d'accessibilité (ARIA, navigation clavier)
  - Finalisation de la documentation technique

#### 4.4 Documentation et intégration au design system
- **Échéance**: Jour 4-5
- **Fichiers à modifier**:
  - `docs/GUIDE-UTILISATION-DESIGN-SYSTEM.md`
  - `docs/ROADMAP-IMPLEMENTATION-COMPOSANTS-TWENTY.md`
  - `checklist-sprint-4-composants-twenty.html` (à créer)
- **Actions**:
  - Mettre à jour la documentation du design system avec les nouveaux composants
  - Créer une checklist pour le Sprint 4
  - Mettre à jour la roadmap avec le statut des composants terminés
  - Préparer des exemples d'intégration pour les développeurs
  - Ajouter des conseils d'optimisation et de bonnes pratiques

## Méthode de travail

Nous adopterons une méthode de travail itérative et incrémentale, en suivant les étapes suivantes pour chaque fonctionnalité ou composant:

1. **Conception**: Création de maquettes et prototypes si nécessaire.
2. **Développement**: Codage des fonctionnalités en suivant les standards du design system.
3. **Revue**: Vérification du code par un pair, tests fonctionnels et d'intégration.
4. **Documentation**: Mise à jour de la documentation technique et des guides d'utilisation.
5. **Déploiement**: Publication des changements sur l'environnement de staging puis en production.
6. **Suivi**: Surveillance des performances et des erreurs, collecte des retours utilisateurs.

## Livrables attendus

À la fin de cette itération, nous devrions avoir:

- Tous les composants et fonctionnalités prévus dans le plan implémentés et testés.
- Une documentation à jour et complète.
- Un design system enrichi et optimisé, prêt pour de futures évolutions.
