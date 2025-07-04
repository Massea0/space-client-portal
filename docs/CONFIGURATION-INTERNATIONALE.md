# Système de Configuration Internationale

## Vue d'ensemble

Le système de configuration permet de personnaliser l'application pour différents pays, devises et secteurs d'activité. Il est composé de plusieurs éléments :

1. **Configuration de la devise** - Support de différentes monnaies
2. **Contexte métier** - Adaptation de l'IA selon le secteur
3. **Paramètres d'entreprise** - Informations utilisées dans les documents

## Configuration de la devise

### Paramètres disponibles
- `currency_symbol` : Symbole de la devise (ex: FCFA, €, $)
- `currency_code` : Code ISO de la devise (ex: XOF, EUR, USD)
- `currency_position` : Position du symbole (before/after)
- `currency_decimal_places` : Nombre de décimales (0, 2)
- `currency_thousand_separator` : Séparateur de milliers (espace, point, virgule)
- `currency_decimal_separator` : Séparateur décimal (virgule, point)
- `locale` : Locale pour le formatage (fr-FR, en-US, etc.)

### Utilisation dans le code

```typescript
// Dans un composant React
import { useSettings } from '@/context/SettingsContext';

const MyComponent = () => {
  const { formatCurrency } = useSettings();
  
  return <div>{formatCurrency(1234.56)}</div>; // Affiche "1 234,56 FCFA" par défaut
};

// Ou avec le hook simplifié
import { useCurrency } from '@/hooks/useCurrency';

const MyComponent = () => {
  const { formatAmount } = useCurrency();
  
  return <div>{formatAmount(1234.56)}</div>;
};
```

## Contexte métier

### Secteurs supportés
- `general` : Entreprise généraliste
- `btp` : Bâtiment et travaux publics
- `saas` : Logiciel en tant que service
- `ecommerce` : Commerce électronique
- `consulting` : Conseil
- `manufacturing` : Industrie

### Impact sur l'IA
Le contexte métier influence :
- La génération de plans de projets
- Les recommandations
- Les templates de documents
- Les analyses prédictives

### Utilisation

```typescript
import { useSettings } from '@/context/SettingsContext';

const MyComponent = () => {
  const { businessContext } = useSettings();
  
  // businessContext.context => 'btp', 'saas', etc.
  // businessContext.description => Description du secteur
  // businessContext.aiProjectContext => Contexte pour l'IA
};
```

## Configuration depuis l'interface admin

1. Accéder à **Admin > Paramètres**
2. Onglet **Devise** : Configurer le formatage des montants
3. Onglet **Contexte IA** : Définir le secteur et adapter l'IA
4. Onglet **Entreprise** : Informations utilisées dans les documents
5. Onglet **Aperçu** : Visualiser les changements

## API des paramètres

```typescript
import { settingsApi } from '@/services/settingsApi';

// Récupérer tous les paramètres
const settings = await settingsApi.getAll();

// Récupérer par catégorie
const currencySettings = await settingsApi.getCurrencySettings();
const businessContext = await settingsApi.getBusinessContext();

// Mettre à jour
await settingsApi.updateCurrencySettings({
  symbol: '€',
  position: 'before'
});
```

## Edge Function et IA

La Edge Function `project-planner-ai` récupère automatiquement les paramètres configurés :
- Utilise la devise configurée dans les estimations budgétaires
- Adapte le prompt selon le contexte métier
- Personnalise les recommandations selon le secteur

## Migration et rétrocompatibilité

L'ancienne fonction `formatCurrency` reste disponible pour la rétrocompatibilité mais est marquée comme dépréciée. Il est recommandé d'utiliser `useSettings().formatCurrency()` dans les nouveaux composants.

## Exemples de configuration

### Configuration pour une entreprise française
```sql
UPDATE app_settings SET value = '€' WHERE key = 'currency_symbol';
UPDATE app_settings SET value = 'EUR' WHERE key = 'currency_code';
UPDATE app_settings SET value = 'before' WHERE key = 'currency_position';
UPDATE app_settings SET value = '2' WHERE key = 'currency_decimal_places';
```

### Configuration pour une entreprise BTP
```sql
UPDATE app_settings SET value = 'btp' WHERE key = 'business_context';
UPDATE app_settings SET value = 'Entreprise de bâtiment et travaux publics' WHERE key = 'business_description';
```

Cette architecture permet une internationalisation complète de l'application tout en gardant une flexibilité maximale pour différents secteurs d'activité.
