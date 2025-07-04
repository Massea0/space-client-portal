# Assets

Ce dossier contient toutes les ressources statiques utilisées dans l'application.

## Structure

- `images/` - Images utilisées dans l'application (logos, illustrations, photos, etc.)
- `icons/` - Icônes spécifiques à l'application (si non fournies par une bibliothèque comme lucide-react)

## Bonnes pratiques

### Images

- Utilisez des formats d'image optimisés (webp, svg quand possible)
- Respectez une convention de nommage cohérente : `nom-descriptif.extension`
- Pour les logos de partenaires ou services externes, préfixez avec leur nom : `partenaire-logo.webp`

### Icônes

- Préférez l'utilisation de la bibliothèque d'icônes Lucide (déjà intégrée)
- Utilisez ce dossier uniquement pour les icônes personnalisées qui ne sont pas disponibles dans la bibliothèque

### Import

Pour importer des assets dans vos composants :

```tsx
// Importation d'une image
import monImage from '@/assets/images/mon-image.webp';

// Utilisation
<img src={monImage} alt="Description" />

// Pour SVG en tant que composant React (si configuré)
import { ReactComponent as MonIcone } from '@/assets/icons/mon-icone.svg';

// Utilisation
<MonIcone className="h-6 w-6" />
```
