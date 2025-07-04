# Configuration des variables d'environnement DExchange

Ce document explique comment configurer et harmoniser les variables d'environnement entre le relais DExchange et les fonctions Edge de Supabase.

## Variables d'environnement utilisées

Les fonctions utilisent désormais les mêmes variables d'environnement que le relais DExchange GCP :

| Variable | Description | Utilisation |
|----------|-------------|------------|
| `DEXCHANGE_API_KEY` | Clé API pour accéder à l'API DExchange | Authentification pour les appels à l'API DExchange |
| `RELAY_SECRET` | Secret partagé pour sécuriser les appels au relais | Validation des requêtes entre les services |
| `DEXCHANGE_WEBHOOK_SECRET` | Secret partagé avec DExchange pour valider les webhooks | Validation des webhooks entrants |
| `WEBHOOK_SECRET` | Alias pour `DEXCHANGE_WEBHOOK_SECRET` | Compatibilité avec l'ancienne configuration |

## Configuration des variables dans Supabase

Pour configurer les variables d'environnement dans les fonctions Edge de Supabase :

1. Créez un fichier `.env` à la racine du projet avec vos valeurs :

```bash
DEXCHANGE_API_KEY=votre_api_key
RELAY_SECRET=votre_relay_secret
DEXCHANGE_WEBHOOK_SECRET=votre_webhook_secret
```

2. Utilisez le script `deploy-dexchange-webhook-with-vars.sh` pour déployer la fonction avec les bonnes variables :

```bash
chmod +x deploy-dexchange-webhook-with-vars.sh
./deploy-dexchange-webhook-with-vars.sh
```

## Tests de la configuration

Pour vérifier que votre configuration est correcte, utilisez le script de test :

```bash
chmod +x test-dexchange-env-vars.sh
./test-dexchange-env-vars.sh
```

Ce script va :
- Vérifier la présence des variables d'environnement
- Tester la connexion au webhook
- Tester la validation du secret webhook
- Simuler un payload de paiement complet

## Communication avec DExchange

Pour que DExchange puisse envoyer des webhooks correctement, vous devez leur fournir :

1. **L'URL du webhook** : `https://[votre_projet].supabase.co/functions/v1/dexchange-callback-handler`
2. **Le secret du webhook** : La valeur que vous avez définie pour `DEXCHANGE_WEBHOOK_SECRET`

DExchange doit inclure ce secret dans l'en-tête HTTP `x-webhook-secret` ou `x-signature` ou `x-dexchange-signature` de chaque requête webhook.

## Vérification du fonctionnement

Une fois configuré, vous pouvez vérifier que les webhooks sont bien reçus et traités en consultant les tables :

- `payment_statistics` : Contient les statistiques de paiement par jour
- `payment_alerts` : Contient les alertes générées par la fonction webhook

## Sécurité

La fonction webhook vérifie maintenant la signature du webhook en comparant le secret reçu dans l'en-tête avec la variable d'environnement `DEXCHANGE_WEBHOOK_SECRET`. Si les secrets ne correspondent pas, la requête est rejetée avec une erreur 403 et une alerte de sécurité est générée.

Si la variable `DEXCHANGE_WEBHOOK_SECRET` n'est pas définie, la validation est désactivée (mode test).

## Résolution des problèmes

Si vous rencontrez des problèmes avec les webhooks :

1. Vérifiez que la fonction est bien déployée avec l'option `--no-verify-jwt`
2. Vérifiez que les variables d'environnement sont correctement définies
3. Vérifiez que DExchange envoie le bon secret dans l'en-tête HTTP
4. Consultez les logs de la fonction pour plus de détails sur les erreurs éventuelles
