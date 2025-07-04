# CORRECTIONS À FAIRE

Ce document liste les corrections prioritaires à effectuer suite aux tests de la checklist front-end.

## 1. Modal de Paiement Dexchange (CRITIQUE)

**Problème**: Page blanche et erreurs console lors du clic sur "Payer"

**Fichiers concernés**:
- `/src/components/payments/DexchangePaymentModal.tsx`
- `/src/components/ui/safe-modal.tsx` 

**Causes probables**:
- Problèmes avec React.Children.only dans les composants imbriqués
- Erreurs dans l'utilisation du SafeModal
- Implémentation incomplète du `react-children-utils.ts`

**Solution**: 
1. Vérifier l'implémentation complète de `ensureSingleElement` dans `react-children-utils.ts`
2. S'assurer que le SafeModal est correctement utilisé dans DexchangePaymentModal
3. Tester avec les scripts de test de paiement

## 2. Interface Support (URGENT)

**Problème**: Interface mal proportionnée, navigation confuse, incohérence entre vues client et admin

**Fichiers concernés**:
- `/src/pages/admin/AdminSupport.tsx`
- `/src/pages/client/SupportClient.tsx`
- `/src/components/support/TicketsList.tsx` (si existant)

**Solution**:
1. Refondre les interfaces pour garantir une cohérence visuelle
2. Améliorer la navigation et clarifier les actions disponibles
3. Uniformiser le style des cartes de tickets entre admin et client

## 3. Harmonisation des Styles de Listes (IMPORTANT)

**Problème**: Styles incohérents entre les vues admin et client pour devis/factures

**Solution**:
1. Créer des composants communs pour l'affichage des listes
2. Uniformiser les designs pour une expérience cohérente
3. Préserver les fonctionnalités spécifiques à chaque rôle

## 4. Stabilisation des Animations (IMPORTANT)

**Problème**: Scintillement et instabilité dans certaines transitions

**Fichiers potentiellement concernés**:
- `/src/components/ui/animations.tsx`
- Composants utilisant Framer Motion

**Solution**:
1. Optimiser les animations pour éviter les scintillements
2. Simplifier les animations complexes qui causent des problèmes
3. Vérifier les dépendances cycliques ou les rendus inutiles

## 5. Fonctionnalités Admin Manquantes (À PLANIFIER)

- Modification de devis existants
- Suppression de devis et factures (système de corbeille)
- Historique des paiements par entreprise
- Amélioration du système d'assignation de tickets

## Plan d'Action

1. **Immédiat**: Correction du modal de paiement Dexchange
2. **Court terme**: Refonte des interfaces de support
3. **Moyen terme**: Harmonisation des styles et stabilisation des animations
4. **Long terme**: Implémentation des fonctionnalités manquantes

Nous continuerons à mettre à jour le fichier CHECKLIST-TEST-FRONT.md à mesure que les corrections sont apportées.
