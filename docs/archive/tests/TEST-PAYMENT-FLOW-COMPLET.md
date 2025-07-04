# Test du Flux de Paiement Wave Complet

## État actuel du système

✅ **Relay GCP** : Fonctionne parfaitement
- URL: `https://dexchange-api-relay-iba6qzqjtq-ew.a.run.app/relay`
- Secret validé: `4rNg02t+qdk5Jr/2+NT0kLCKavbtyWRUlM1prWAMNnU=`
- Format attendu: `{dexchangePath, dexchangeMethod, dexchangeBody}`
- Test direct réussi avec réponse 201 de DExchange

✅ **Fonction Edge** : Corrigée
- Mode test désactivé
- Utilise maintenant le relay réel
- Redéployée avec succès

✅ **Frontend** : Configuré
- WavePaymentModal force méthode "wave"
- Logs de débogage activés
- Intégration avec invoices-payment.ts

## Test 1: Appel direct à la fonction Edge

```bash
curl -X POST "https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/initiate-payment" \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_id": "TEST-INV-001",
    "amount": 1000,
    "currency": "XOF",
    "payment_method": "wave",
    "phone_number": "774123456",
    "success_url": "https://myspace.arcadis.tech/payment/success",
    "cancel_url": "https://myspace.arcadis.tech/payment/cancel"
  }'
```

## Test 2: Depuis l'interface utilisateur

1. Ouvrir http://localhost:8080
2. Aller sur la page Factures
3. Créer une facture de test ou sélectionner une existante
4. Cliquer sur "Payer" avec Wave
5. Vérifier les logs de la console

## Réponse attendue

```json
{
  "message": "Transaction initiated successfully",
  "transaction": {
    "success": true,
    "transactionId": "TIDK...",
    "externalTransactionId": "INV-...",
    "Status": "PENDING",
    "cashout_url": "https://pay.wave.com/c/...",
    "deepLink": "https://pay.dexchange.sn/wave/...",
    "successUrl": "https://myspace.arcadis.tech/payment/success",
    "cancelUrl": "https://myspace.arcadis.tech/payment/cancel"
  }
}
```

## Points de contrôle

1. ✅ Relay répond avec 201
2. ⏳ Fonction Edge appelle relay avec bon format
3. ⏳ Frontend reçoit URL de paiement Wave
4. ⏳ Redirection vers Wave fonctionne
5. ⏳ Callback handler reçoit webhook DExchange

## Logs à surveiller

- Console navigateur pour WavePaymentModal
- Logs fonction Edge initiate-payment
- Logs fonction Edge dexchange-callback-handler
- Logs relay GCP (si accessible)

## Commandes utiles

```bash
# Voir logs des fonctions Edge
supabase functions logs --function-name initiate-payment
supabase functions logs --function-name dexchange-callback-handler

# Tester fonction Edge directement
curl -X POST "https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/initiate-payment" ...

# Redéployer si nécessaire
supabase functions deploy initiate-payment
```
