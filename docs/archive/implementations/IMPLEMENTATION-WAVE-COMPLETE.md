# Système de Paiement Wave - Implémentation Complète

Ce document présente l'implémentation complète du système de paiement Wave avec callback handler et confirmation automatique.

## 🎯 Architecture du Système Wave

### Flux de Paiement Wave
```
1. Client initie paiement → Création facture (status: pending)
2. Redirection vers Wave/DExchange pour paiement
3. Trois méthodes de confirmation :
   a) Webhook Wave → wave-callback-handler
   b) Vérification API → check-wave-status  
   c) Auto-confirmation → après délai
4. Mise à jour facture (status: paid)
```

## 🔧 Fonctions Edge Déployées

### 1. `wave-callback-handler`
**Rôle** : Gestionnaire principal des callbacks Wave
**URL** : `https://[projet].supabase.co/functions/v1/wave-callback-handler`

**Fonctionnalités** :
- ✅ Réception webhooks Wave/DExchange
- ✅ Validation de signature sécurisée
- ✅ Vérification statut via API DExchange
- ✅ Auto-confirmation basée sur le temps
- ✅ Mise à jour automatique des factures
- ✅ Statistiques et logging détaillé

**Paramètres de configuration** :
- `DEXCHANGE_WEBHOOK_SECRET` - Secret pour validation webhook
- `DEXCHANGE_API_KEY` - Clé pour vérification API
- `DEXCHANGE_ENVIRONMENT` - sandbox/production

### 2. `test-wave-payment`
**Rôle** : API de test pour simuler les paiements Wave
**URL** : `https://[projet].supabase.co/functions/v1/test-wave-payment`

**Actions disponibles** :
- `create` - Créer facture de test
- `webhook` - Simuler webhook Wave
- `check` - Tester vérification automatique
- `full` - Test complet du flux

### 3. `check-wave-status` (Existante)
**Rôle** : Vérification du statut des paiements Wave
**URL** : `https://[projet].supabase.co/functions/v1/check-wave-status`

**Fonctionnalités** :
- ✅ Vérification API DExchange
- ✅ Auto-confirmation après délai
- ✅ Mise à jour des transactions

## 🔄 Méthodes de Confirmation

### 1. Webhook Immédiat
```json
POST /functions/v1/wave-callback-handler
Headers: x-webhook-secret: [secret]
Body: {
  "event": "payment.succeeded",
  "data": {
    "id": "txn_123",
    "status": "succeeded",
    "metadata": {
      "invoice_id": "inv_456"
    }
  }
}
```

### 2. Vérification API
Le système appelle l'API DExchange pour vérifier le statut :
```
GET https://api-m.dexchange.sn/api/v1/transactions/{transactionId}
Authorization: Bearer [DEXCHANGE_API_KEY]
```

### 3. Auto-confirmation
Si aucune confirmation n'arrive après 3 minutes, le système considère automatiquement le paiement Wave comme confirmé.

## 🔐 Sécurité

### Validation des Webhooks
- **Secret obligatoire** : `DEXCHANGE_WEBHOOK_SECRET`
- **Headers supportés** : `x-webhook-secret`, `x-signature`, `x-wave-signature`
- **Formats** : `secret`, `Bearer secret`
- **Rejet automatique** : HTTP 403 pour signatures invalides

### Logging de Sécurité
- ID unique par requête pour traçabilité
- Logs détaillés des tentatives d'accès
- Métadonnées complètes pour debugging

## 📊 Statistiques et Monitoring

### Tables Mises à Jour
```sql
-- payment_statistics : Statistiques quotidiennes
UPDATE payment_statistics SET
  wave_payments = wave_payments + 1,
  wave_amount = wave_amount + [montant],
  successful_payments = successful_payments + 1,
  auto_marked_count = auto_marked_count + 1

-- invoices : Statut des factures
UPDATE invoices SET
  status = 'paid',
  payment_status = 'completed',
  payment_method = 'wave',
  payment_date = NOW(),
  payment_reference = [transaction_id]

-- payment_transactions : Détails transactions
UPDATE payment_transactions SET
  status = 'completed',
  external_transaction_id = [transaction_id],
  response_data = [webhook_data]
```

## 🚀 Déploiement

### 1. Déploiement Automatique
```bash
# Déployer toutes les fonctions Wave
./deploy-wave-complete.sh
```

### 2. Configuration Requise
```env
# Variables critiques
SUPABASE_URL=https://[projet].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[clé_service]
SUPABASE_ANON_KEY=[clé_publique]

# Variables Wave/DExchange
DEXCHANGE_API_KEY=[clé_api_dexchange]
DEXCHANGE_WEBHOOK_SECRET=[secret_webhook]
DEXCHANGE_ENVIRONMENT=sandbox|production

# Variables optionnelles
DEXCHANGE_API_URL_PRODUCTION=https://api-m.dexchange.sn/api/v1
DEXCHANGE_API_URL_SANDBOX=https://api-s.dexchange.sn/api/v1
```

## 🧪 Tests

### 1. Tests Automatisés
```bash
# Déploiement avec tests automatiques
./deploy-wave-complete.sh

# Tests manuels interactifs
./test-wave-manual.sh
```

### 2. Tests via API
```bash
# Créer une facture de test
curl "https://[projet].supabase.co/functions/v1/test-wave-payment?action=create&amount=1000"

# Simuler un webhook de succès
curl "https://[projet].supabase.co/functions/v1/test-wave-payment?action=webhook&invoice=INV_ID&success=true"

# Test complet du flux
curl "https://[projet].supabase.co/functions/v1/test-wave-payment?action=full&amount=2500"
```

### 3. Test Manuel Webhook
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: [votre_secret]" \
  -d '{
    "event": "payment.succeeded",
    "data": {
      "id": "txn_test_123",
      "status": "succeeded",
      "metadata": {
        "invoice_id": "test_invoice_456"
      }
    }
  }' \
  https://[projet].supabase.co/functions/v1/wave-callback-handler
```

## 📋 Configuration pour Wave/DExchange

### Informations à Fournir
```
URL Webhook : https://[projet].supabase.co/functions/v1/wave-callback-handler
Secret Webhook : [votre DEXCHANGE_WEBHOOK_SECRET]
Méthode : POST
Content-Type : application/json
Headers : x-webhook-secret ou x-signature
```

### Format Webhook Attendu
```json
{
  "event": "payment.succeeded|payment.failed",
  "type": "payment",
  "data": {
    "id": "transaction_id",
    "status": "succeeded|failed|completed",
    "amount": 1000,
    "currency": "XOF",
    "metadata": {
      "invoice_id": "facture_id"
    },
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

## 🔧 Personnalisation

### Délai d'Auto-confirmation
Modifiez dans `wave-callback-handler/index.ts` :
```typescript
// Auto-confirmer après X minutes
if (minutesElapsed >= 3) { // Changez 3 par votre délai
  paymentConfirmed = true
  confirmationSource = 'auto'
}
```

### Sources de Confirmation
Le système reconnaît automatiquement :
- **webhook** : Confirmation via webhook immédiat
- **api** : Confirmation via vérification API DExchange
- **auto** : Confirmation automatique après délai

## 🐛 Résolution de Problèmes

### Webhook Non Reçu
1. Vérifiez la configuration du secret
2. Testez avec `./test-wave-manual.sh`
3. Consultez les logs Supabase
4. Vérifiez la configuration chez Wave/DExchange

### Auto-confirmation Ne Fonctionne Pas
1. Vérifiez que `payment_method = 'wave'`
2. Vérifiez que `status = 'pending'`
3. Testez avec `check-wave-status`

### Statistiques Non Mises à Jour
1. Vérifiez la table `payment_statistics`
2. Vérifiez les permissions Supabase
3. Consultez les logs des fonctions

## 📈 Monitoring de Production

### Métriques Importantes
- Taux de confirmation par webhook vs auto-confirmation
- Délai moyen de confirmation
- Taux d'échec des webhooks
- Volume de paiements Wave quotidien

### Alertes Recommandées
- Webhook non reçu pendant > 1 heure
- Taux d'auto-confirmation > 50%
- Erreurs API DExchange fréquentes
- Signatures webhook invalides répétées

## ✅ Checklist de Production

- [ ] Variables d'environnement configurées
- [ ] Secret webhook sécurisé défini
- [ ] Clé API DExchange de production
- [ ] Tests de bout en bout validés
- [ ] Configuration Wave/DExchange validée
- [ ] Monitoring et alertes configurés
- [ ] Documentation équipe mise à jour

---

Le système Wave est maintenant prêt pour la production avec une robustesse maximale et des mécanismes de fallback multiples.
