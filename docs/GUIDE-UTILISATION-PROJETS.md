# GUIDE D'UTILISATION - SYSTÈME DE GESTION DE PROJET
*Arcadis Enterprise OS - Module Projets*

## 🎯 ACCÈS AU MODULE

### Navigation
1. Connectez-vous à l'application Arcadis Enterprise OS
2. Dans le menu principal, cliquez sur **"Projets"** (icône Kanban)
3. Vous arrivez sur la page de liste des projets

### URL directe
- Liste des projets : `http://localhost:8081/projects`
- Détail d'un projet : `http://localhost:8081/projects/{id}`

## 📋 FONCTIONNALITÉS PRINCIPALES

### 1. Gestion des Projets

#### Créer un nouveau projet
1. Sur la page des projets, cliquez sur **"Nouveau Projet"**
2. Remplissez les informations :
   - **Nom** : Titre du projet (requis)
   - **Description** : Description détaillée
   - **Client** : Sélectionnez l'entreprise cliente
   - **Dates** : Dates de début et fin
   - **Budget** : Budget prévisionnel
3. **🤖 Option IA** : Cliquez sur "Générer plan IA" pour une suggestion automatique
4. Cliquez sur **"Créer le projet"**

#### Consulter les projets
- **Vue tableau** : Liste détaillée avec filtres
- **Filtres disponibles** :
  - Recherche par nom/description
  - Statut (brouillon, actif, terminé, etc.)
  - Entreprise cliente
- **Actions** : Voir détails, modifier, supprimer

### 2. Gestion des Tâches (Vue Kanban)

#### Accéder aux tâches
1. Cliquez sur un projet dans la liste
2. Vous arrivez sur la vue détail avec le tableau Kanban

#### Colonnes du Kanban
- **À faire** : Tâches nouvelles ou planifiées
- **En cours** : Tâches en développement
- **Terminé** : Tâches finalisées
- **Bloqué** : Tâches avec des problèmes

#### Créer une tâche
1. Cliquez sur **"Nouvelle Tâche"**
2. Remplissez les informations :
   - **Titre** : Nom de la tâche (requis)
   - **Description** : Détails de la tâche
   - **Priorité** : Faible, Moyenne, Élevée, Urgente
   - **Assigné à** : Utilisateur responsable
   - **Durée estimée** : En heures
   - **Date d'échéance** : Date limite
3. **🤖 Option IA** : Cliquez sur "IA" à côté de "Assigné à" pour une suggestion automatique
4. Cliquez sur **"Créer la tâche"**

#### Gérer les tâches
- **Drag & Drop** : Déplacez les cartes entre les colonnes
- **Filtres** : Par statut, priorité, assigné
- **Vue tableau** : Alternative à la vue Kanban

### 3. Intelligence Artificielle

#### Planification de projet (IA)
- **Déclenchement** : Bouton "Générer plan IA" lors de la création
- **Fonctionnalité** : L'IA analyse la description et suggère :
  - Structure de tâches
  - Échéances réalistes
  - Répartition des responsabilités

#### Assignation de tâches (IA)
- **Déclenchement** : Bouton "IA" dans le formulaire de tâche
- **Analyse** :
  - Charge de travail actuelle des utilisateurs
  - Taux de réussite historique
  - Compétences et performances
- **Suggestion** : Recommandation d'assigné avec justification

## 📊 STATISTIQUES ET SUIVI

### Métriques de projet
- **Progression** : Pourcentage de tâches terminées
- **Charge de travail** : Répartition par utilisateur
- **Performances** : Taux de respect des délais

### Indicateurs visuels
- **Badges de statut** : Couleurs pour les différents états
- **Barres de progression** : Avancement visuel
- **Alertes** : Notifications pour les retards

## 🔧 FONCTIONNALITÉS AVANCÉES

### Recherche et filtres
- **Recherche globale** : Par nom, description, client
- **Filtres multiples** : Combinaison de critères
- **Tri** : Par date, statut, priorité

### Responsive Design
- **Mobile** : Interface adaptée aux smartphones
- **Tablette** : Optimisation pour tablettes
- **Desktop** : Expérience complète

## 🚨 DÉPANNAGE

### Problèmes courants

#### "Aucune suggestion IA"
- Vérifiez que les champs titre et description sont remplis
- Assurez-vous qu'il y a des utilisateurs actifs dans le système

#### "Erreur de chargement"
- Vérifiez votre connexion internet
- Actualisez la page (F5)
- Contactez l'administrateur si le problème persiste

#### "Projet non trouvé"
- Vérifiez l'URL
- Assurez-vous d'avoir les permissions nécessaires
- Le projet a peut-être été supprimé

### Support technique
- **Email** : support@arcadis-enterprise.com
- **Documentation** : Consultez les guides en ligne
- **Formation** : Sessions disponibles sur demande

## 🎓 BONNES PRATIQUES

### Organisation des projets
- **Noms clairs** : Utilisez des noms explicites
- **Descriptions détaillées** : Facilitent l'IA et la collaboration
- **Clients associés** : Toujours lier à une entreprise

### Gestion des tâches
- **Granularité** : Tâches de 1-8 heures idéalement
- **Assignation** : Une tâche = un responsable
- **Suivi régulier** : Mise à jour des statuts

### Utilisation de l'IA
- **Données qualitatives** : Plus d'informations = meilleures suggestions
- **Validation humaine** : Toujours vérifier les recommandations
- **Retour d'expérience** : Partagez les succès et améliorations

---
*Dernière mise à jour : 3 juillet 2025*
*Version du système : 2.0.0*
