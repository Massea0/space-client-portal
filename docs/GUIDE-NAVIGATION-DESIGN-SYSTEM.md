# Guide de Navigation - Design System

## 🎯 Accès à la Page Design System

### Routes Disponibles

#### Route Principale (Recommandée)
- **URL** : `/design-system`
- **Accès** : Tous les utilisateurs connectés (admin et clients)
- **Navigation** : Disponible dans la sidebar sous "Design System" avec l'icône palette

#### Route Admin (Alternative)
- **URL** : `/admin/design-system`
- **Accès** : Administrateurs uniquement
- **Navigation** : Menu admin

### Comment Accéder

#### 1. Via la Sidebar
1. Connectez-vous à l'application
2. Dans la sidebar de gauche, cliquez sur "Design System" (icône palette)
3. La page se charge avec tous les composants disponibles

#### 2. Via l'URL Directe
1. Connectez-vous à l'application
2. Tapez directement `/design-system` dans la barre d'adresse
3. Vous serez redirigé vers la page de démonstration

#### 3. Pour les Développeurs (Port Local)
- **URL Complète** : `http://localhost:8081/design-system`
- **Port par défaut** : 8081 (peut varier si 8080 est occupé)

## 🛡️ Protection des Routes

### Authentification Requise
- Toutes les routes du design system nécessitent une authentification
- Les utilisateurs non connectés sont redirigés vers `/login`
- L'URL de destination est sauvegardée pour redirection post-connexion

### Rôles et Permissions
- **Clients** : Accès à `/design-system`
- **Admins** : Accès à `/design-system` ET `/admin/design-system`

## 📱 Fonctionnalités de la Page

### Composants Disponibles (Sprint 1 & 2)
1. **Composants de Base**
   - Button (variants, tailles, états)
   - Input (types, validations)
   - Card (layouts, headers, footers)
   - Badge (variants, couleurs)

2. **Composants Avancés**
   - Select/Dropdown (multi-niveaux, groupes)
   - Checkbox (états, indéterminé)
   - Radio (groupes, orientations)
   - TitleInput (édition inline)

3. **Composants UI Complexes**
   - Dialog/Modal (confirmation, formulaires)
   - Table/DataTable (tri, pagination, actions)
   - Tabs (orientations, animations)

### Navigation Interactive
- Navigation par sections
- Prévisualisations en temps réel
- Code examples (à venir)
- Tests d'accessibilité intégrés

## 🚀 Prochaines Étapes

### Sprint 3 (En Cours de Planification)
- Kanban/Board components
- DataView (liste/grille)
- Sidebar avancée
- Toast/Notifications
- Loading States

### Sprint 4 (Futur)
- Dark mode complet
- Animations avancées
- Mobile responsiveness
- Storybook integration

## 🔧 Dépannage

### Problème : Page Non Trouvée (404)
1. Vérifiez que vous êtes connecté
2. Essayez l'URL directe : `/design-system`
3. Videz le cache du navigateur
4. Redémarrez le serveur de développement

### Problème : Sidebar Ne Montre Pas l'Option
1. Rechargez la page
2. Vérifiez votre rôle utilisateur
3. La sidebar peut être repliée sur mobile

### Problème : Erreurs de Compilation
1. Vérifiez que tous les packages sont installés : `npm install`
2. Redémarrez le serveur : `npm run dev`
3. Vérifiez la console pour les erreurs TypeScript

## 📞 Support

Pour toute question ou problème :
1. Consultez la documentation dans `/docs`
2. Vérifiez les logs de la console navigateur
3. Consultez les issues GitHub du projet

---

*Dernière mise à jour : Sprint 2 - Décembre 2024*
