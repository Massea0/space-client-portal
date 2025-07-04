# Configuration Sage pour Arcadis Space

## Variables d'Environnement Requises

### Pour les Edge Functions Supabase (Secrets)
```bash
# Configuration Gemini AI pour le mapping des données
GEMINI_API_KEY=your_gemini_api_key_here

# Configuration Sage API
SAGE_API_BASE_URL=https://api.sage.com/v3  # ou URL spécifique selon version Sage
SAGE_API_KEY=your_sage_api_key
SAGE_CLIENT_ID=your_sage_client_id
SAGE_CLIENT_SECRET=your_sage_client_secret
SAGE_ACCESS_TOKEN=your_sage_access_token  # Optionnel si OAuth2

# Configuration spécifique selon la version Sage utilisée
SAGE_COMPANY_ID=your_sage_company_id
SAGE_DEFAULT_BANK_ACCOUNT=512000  # Code compte banque par défaut
SAGE_CUSTOMER_ACCOUNT_PREFIX=411  # Préfixe comptes clients
```

## Configuration par Version Sage

### Sage Business Cloud Accounting
- Base URL: `https://api.sage.com/v3.1`
- Authentification: OAuth2
- Endpoints principaux:
  - `/bank_deposits` - Dépôts bancaires
  - `/customer_receipts` - Recettes clients
  - `/journal_entries` - Écritures de journal

### Sage 100 Cloud
- Base URL: `https://api.sage100cloud.fr/v1`
- Authentification: API Key + OAuth2
- Endpoints principaux:
  - `/bank_transactions` - Transactions bancaires
  - `/customer_payments` - Paiements clients

### Sage X3
- Base URL: Configuration personnalisée
- Authentification: Token personnalisé
- Endpoints: WebService SOAP ou REST personnalisé

## Installation des Secrets Supabase

```bash
# Configurer les secrets pour les Edge Functions
supabase secrets set GEMINI_API_KEY=your_key
supabase secrets set SAGE_API_KEY=your_key
supabase secrets set SAGE_CLIENT_ID=your_id
supabase secrets set SAGE_CLIENT_SECRET=your_secret
supabase secrets set SAGE_API_BASE_URL=your_url
```

## Plan Comptable Standard

### Codes Comptables par Défaut
- **411000** - Clients
- **512000** - Banque
- **701000** - Ventes de marchandises
- **445571** - TVA collectée
- **758000** - Produits divers de gestion courante

### Mapping Automatique par l'IA
L'IA Gemini analysera automatiquement:
1. Le type de client et attribuera un code 411xxx approprié
2. La nature de la prestation pour le compte de produit
3. Le taux de TVA applicable selon la législation
4. Les codes de rapprochement bancaire

## Flux d'Intégration

1. **Paiement DExchange confirmé** → Handler DExchange
2. **Traitement IA** → `process-dexchange-payment-for-sage`
3. **Validation Admin** → Interface `SageIntegration.tsx`
4. **Export Sage** → `execute-sage-export`
5. **Confirmation** → Mise à jour statut facture

## Gestion des Erreurs

### Anomalies détectées par l'IA
- Montants incohérents
- Codes clients manquants
- Références incorrectes
- TVA non conforme

### Erreurs d'API Sage
- Token expiré
- Données invalides
- Quotas dépassés
- Serveur indisponible

## Sécurité

- Toutes les clés API sont stockées comme Secrets Supabase
- Authentification requise pour les actions d'export
- Validation des permissions admin obligatoire
- Logs détaillés pour audit

## Tests et Validation

### Test avec facture réelle
```bash
# Simuler un paiement DExchange pour test
curl -X POST "your_supabase_url/functions/v1/process-dexchange-payment-for-sage" \
  -H "Authorization: Bearer your_token" \
  -d '{"invoice_id": "uuid", "transaction_id": "dexchange_id"}'
```

### Vérification des données Sage
- Contrôler la cohérence comptable
- Vérifier les rapprochements bancaires
- Valider les écritures de journal
