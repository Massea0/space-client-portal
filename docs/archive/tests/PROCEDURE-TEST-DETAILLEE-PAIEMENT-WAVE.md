# 🧪 PROCÉDURE DE TEST DÉTAILLÉE - Flux Paiement Wave

## ✅ Étapes de Test avec Diagnostic Avancé

### 1. Préparer l'Environnement de Test

#### A. Rafraîchir la page
```
F5 ou Ctrl+R pour recharger les modifications du code
```

#### B. Ouvrir la console développeur
```
F12 > Console
```

#### C. Vérifier les données de test
Dans la console, coller et exécuter :
```javascript
// Copier le contenu de check_test_data.js
```

### 2. Test du Flux de Paiement

#### A. Naviguer vers les factures
```
URL: http://localhost:8080/factures
```

#### B. Identifier une facture testable
- Statut : `sent`, `pending`, `late`, `overdue`, `partially_paid`, `pending_payment`
- Noter l'ID de la facture (visible dans les logs console)

#### C. Cliquer sur "Payer"
- Observer les logs en temps réel dans la console
- Le modal Wave doit s'ouvrir

#### D. Remplir le formulaire
- **Numéro** : `221777777777` (format Sénégal valide)
- **Cliquer** : "Initier le paiement"

### 3. Analyse des Logs

#### Logs Attendus dans la Console (Succès)
```
🚀 [PaymentAPI] Appel initiate-payment avec: {invoiceId: "...", paymentMethod: "wave", ...}
📡 [PaymentAPI] Statut HTTP: 200
📥 [PaymentAPI] Réponse brute: {"paymentUrl": "...", "transactionId": "..."}
✅ [PaymentAPI] Données parsées: {...}
```

#### Logs d'Erreur (Échec)
```
❌ [PaymentAPI] Erreur fetch directe: HTTP 400: {"error": "..."}
🔄 [PaymentAPI] Fallback vers supabase.functions.invoke...
❌ [PaymentAPI] Erreur Edge Function: ...
```

### 4. Diagnostic par Type d'Erreur

#### Erreur 401 - Authentification
```
❌ Cause: Token JWT invalide ou expiré
🔧 Solution: Se reconnecter ou vérifier la session
```

#### Erreur 400 - Données invalides
```
❌ Cause: invoice_id inexistant ou droits insuffisants
🔧 Solution: Vérifier l'ID facture et les permissions utilisateur
```

#### Erreur 500 - Edge Function
```
❌ Cause: Problème interne (variables d'env, relay GCP, etc.)
🔧 Solution: Vérifier les logs Supabase Dashboard
```

### 5. Vérification Dashboard Supabase

#### Accès aux logs en temps réel
```
URL: https://supabase.com/dashboard/project/qlqgyrfqiflnqknbtycw/functions/initiate-payment
Onglet: Logs
```

#### Logs Edge Function Attendus
```
🚀 [initiate-payment] Nouvelle requête POST à [timestamp]
🔧 Variables d'environnement: SITE_URL: http://localhost:8080
📥 Request body reçu: {"invoice_id": "...", "payment_method": "wave", ...}
👤 Authentification: {hasUser: true, error: undefined}
```

### 6. Actions Selon les Résultats

#### ✅ Succès (Statut 200)
```
1. ✅ Flux Wave fonctionne en local !
2. Tester la redirection si URL retournée
3. Vérifier le polling du statut
4. Valider la mise à jour de la facture
```

#### ❌ Échec Persistant (400/401/500)
```
1. Copier les logs complets (console + Supabase)
2. Identifier l'erreur exacte dans les logs Edge Function
3. Vérifier l'authentification utilisateur
4. Contrôler les permissions sur la facture
5. Tester avec une autre facture/utilisateur
```

### 7. Test Alternatif (Si échec UI)

#### Test direct via console
```javascript
// Utiliser le contenu de test_auth_payment.js
// Remplacer 'test-invoice-id' par un ID réel depuis check_test_data.js
```

### 8. Debugging Avancé

#### Si l'erreur vient du relay GCP
```
🔍 Vérifier: https://dexchange-relay-442117.europe-west1.run.app/health
🔍 Logs: Google Cloud Console > Cloud Run > dexchange-relay
```

#### Si l'erreur vient de DExchange
```
🔍 API Status: Contacter l'équipe DExchange
🔍 Credentials: Vérifier DEXCHANGE_API_KEY dans config.toml
```

---

## 🎯 Objectifs du Test

1. **Identifier la cause exacte** de l'erreur 400
2. **Valider les corrections CORS** et configuration locale
3. **Confirmer l'authentification** et les permissions
4. **Tester le flux complet** jusqu'à la réponse DExchange

## 📋 Résultats Attendus

- **🟢 Succès** : Réponse 200 avec `paymentUrl` et `transactionId`
- **🟡 Succès partiel** : Pas d'erreur 400 mais problème downstream
- **🔴 Échec** : Erreur 400 persistante (nécessite investigation plus poussée)

**⏱️ Durée estimée** : 15-20 minutes  
**📊 Criticité** : Bloquante pour validation flux paiement local
