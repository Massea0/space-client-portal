# 🧪 GUIDE DE TEST - Flux de Paiement Wave Local

## ✅ État des Corrections

### Dernières Modifications (13:45)
1. **CORS Headers améliorés** : Ajout de `Access-Control-Allow-Methods`
2. **Logs de diagnostic étendus** : 
   - Variables d'environnement affichées
   - Body de requête détaillé
   - Statut d'authentification complet
3. **Edge Function redéployée** avec toutes les améliorations

## 🎯 Test Manuel à Effectuer

### 1. Accès à l'Application
```
URL: http://localhost:8080/login
```

### 2. Connexion
- **Email** : Utiliser un compte admin/client existant
- **Mot de passe** : Mot de passe correspondant

### 3. Navigation vers Factures
```
Menu > Factures
OU
URL directe: http://localhost:8080/factures
```

### 4. Test du Bouton Payer
1. **Identifier une facture** avec statut payable (`sent`, `pending`, `late`, `overdue`, `partially_paid`, `pending_payment`)
2. **Cliquer sur "Payer"** → Le modal Wave doit s'ouvrir
3. **Saisir un numéro** : Format `221777777777` (Sénégal)
4. **Cliquer "Initier le paiement"**

### 5. Observation des Logs
**Dans la console navigateur (F12)** :
- Observer les logs de `WavePaymentModal.tsx`
- Vérifier si l'erreur 400 persiste ou est résolue
- Noter les messages d'erreur spécifiques

**Dans le Dashboard Supabase** :
```
https://supabase.com/dashboard/project/qlqgyrfqiflnqknbtycw/functions/initiate-payment
```
- Onglet "Logs" pour voir les logs en temps réel
- Vérifier les variables d'environnement affichées
- Observer le processus d'authentification

## 🔍 Points de Diagnostic

### Logs Attendus (Console navigateur)
```
✅ Succès:
- "📊 Récupération analytics IA dashboard..."
- "✅ Analytics reçues..."
- Appel API sans erreur 400

❌ Problème persistant:
- "POST https://...initiate-payment 400 (Bad Request)"
- "Erreur paiement Wave: Error: Edge Function returned a non-2xx status code"
```

### Logs Attendus (Supabase Dashboard)
```
✅ Nouvelle requête détectée:
- "🚀 [initiate-payment] Nouvelle requête POST à [timestamp]"
- "🔧 Variables d'environnement: SITE_URL: http://localhost:8080"
- "📥 Request body reçu: {invoice_id: ..., payment_method: 'wave', ...}"
- "👤 Authentification: {hasUser: true, error: undefined}"

❌ Problème d'authentification:
- "❌ Erreur authentification: [détails]"
- "👤 Authentification: {hasUser: false, error: '...'}"
```

## 🚀 Actions Selon les Résultats

### Si Erreur 400 Persiste
1. **Vérifier l'authentification** :
   - L'utilisateur est-il bien connecté ?
   - Le token JWT est-il valide ?

2. **Vérifier le payload** :
   - `invoice_id` existe-t-il en base ?
   - Utilisateur a-t-il les droits sur cette facture ?

3. **Fallback - Test avec un script** :
   ```bash
   # Obtenir un token valide depuis l'app connectée
   # Modifier test_initiate_payment.sh avec ce token
   # Relancer le test
   ```

### Si Succès Partiel (pas d'erreur 400 mais autre problème)
1. **Observer les logs GCP Relay**
2. **Vérifier la réponse DExchange**
3. **Tester le polling du statut de paiement**

### Si Succès Complet
1. **✅ Flux Wave fonctionnel en local !**
2. **Tester le parcours complet** :
   - Initiation paiement
   - Redirection Wave (si URL retournée)
   - Callback webhook
   - Mise à jour statut facture

## 🔄 Actions de Nettoyage Post-Test

### Pour la Production
Une fois les tests validés, remettre la configuration production :

```toml
# Dans supabase/functions/config.toml
SITE_URL = "https://myspace.arcadis.tech"  # Production
```

### Puis redéployer :
```bash
npx supabase functions deploy initiate-payment --project-ref qlqgyrfqiflnqknbtycw
```

---

**🎯 Objectif** : Valider que le flux de paiement Wave fonctionne en local avec les corrections CORS et configuration  
**⏱️ Estimation** : 10-15 minutes de test  
**📋 Livrable** : Confirmation du fonctionnement ou diagnostic précis du blocage restant
