# Components

Ce dossier contient tous les composants React utilisés dans l'application, organisés par catégorie.

## Structure

- **admin/** : Composants spécifiques pour l'administration
  - **companies/** : Gestion des entreprises

- **auth/** : Composants d'authentification
  - `LoginForm.tsx`: Formulaire de connexion
  - `ForgotPasswordForm.tsx`: Formulaire de récupération de mot de passe

- **dashboard/** : Composants du tableau de bord
  - `RecentActivity.tsx`: Affiche les activités récentes
  - `StatsCard.tsx`: Carte pour afficher les statistiques

- **forms/** : Composants de formulaire réutilisables
  - `DevisForm.tsx`: Formulaire de création/édition de devis
  - `FactureForm.tsx`: Formulaire de création/édition de factures
  - `SharedFormComponents.tsx`: Composants partagés entre les formulaires
  - `FormStyles.ts`: Styles communs pour les formulaires
  - `index.ts`: Export de tous les composants de formulaires

- **invoices/** : Composants liés aux factures
  - `InteractiveInvoiceCard.tsx`: Carte interactive pour une facture
  - `InvoiceList.tsx`: Liste des factures
  - `InvoiceListView.tsx`: Vue combinée des factures
  - `index.ts`: Export de tous les composants de factures

- **layout/** : Composants de mise en page
  - `AppHeader.tsx`: En-tête de l'application
  - `AppSidebar.tsx`: Barre latérale de l'application
  - `AuthLayout.tsx`: Mise en page pour les pages d'authentification
  - `Layout.tsx`: Mise en page principale
  - `PageTransition.tsx`: Transitions entre les pages
  - `UserNav.tsx`: Navigation utilisateur

- **payments/** : Composants liés aux paiements
  - `AnimatedPaymentButton.tsx`: Bouton de paiement animé
  - `AnimatedPaymentCard.tsx`: Carte de paiement animée
  - `AnimatedPaymentModal.tsx`: Modal de paiement animé
  - `CountdownTimer.tsx`: Minuteur pour les paiements
  - `DexchangePaymentModal.tsx`: Modal de paiement Dexchange (déprécié)
  - `PaymentInstructions.tsx`: Instructions de paiement
  - `PaymentStatusBadge.tsx`: Badge de statut de paiement
  - `PaymentSuccess.tsx`: Confirmation de paiement réussi
  - `index.ts`: Export de tous les composants de paiement

- **quotes/** : Composants liés aux devis
  - `DeleteQuoteDialog.tsx`: Dialogue de suppression de devis
  - `EditQuoteModal.tsx`: Modal d'édition de devis
  - `InteractiveQuoteCard.tsx`: Carte interactive pour un devis
  - `QuoteList.tsx`: Liste des devis
  - `QuoteListView.tsx`: Vue combinée des devis
  - `index.ts`: Export de tous les composants de devis

- **support/** : Composants liés au support
  - `AdminAssignmentDropdown.tsx`: Dropdown pour l'assignation de tickets
  - `TicketCard.tsx`: Carte pour un ticket de support
  - `TicketCategoryDropdown.tsx`: Dropdown pour la catégorie de tickets
  - `TicketDetailView.tsx`: Vue détaillée d'un ticket
  - `TicketList.tsx`: Liste des tickets
  - `TicketPriorityBadge.tsx`: Badge de priorité pour les tickets
  - `TicketPriorityDropdown.tsx`: Dropdown pour la priorité des tickets
  - `TicketStatusBadge.tsx`: Badge de statut pour les tickets
  - `TicketStatusDropdown.tsx`: Dropdown pour le statut des tickets
  - `index.ts`: Export de tous les composants de support

- **theme/** : Composants liés au thème
  - `ThemeProvider.tsx`: Fournisseur de thème
  - `ThemeSwitcher.tsx`: Interrupteur de thème

- **ui/** : Composants d'interface utilisateur de base
  - Nombreux composants de base réutilisables
  - Basés sur shadcn/ui et personnalisés pour notre application

## Conventions

1. **Nommage des fichiers**:
   - PascalCase pour les noms de fichiers des composants (ex: `ButtonGroup.tsx`)
   - Éviter les suffixes comme `.component` dans les noms de fichiers

2. **Structure des composants**:
   - Types et interfaces en haut du fichier
   - Composant React après les définitions de types
   - Export par défaut à la fin

3. **Organisation du code**:
   - Imports groupés par catégorie (React, composants, hooks, utils, types)
   - Hooks utilisés au début du composant
   - Fonctions utilitaires locales avant le rendu JSX

4. **Réutilisation**:
   - Extraire les sous-composants complexes dans des fichiers séparés
   - Utiliser des fichiers index.ts pour faciliter les importations
