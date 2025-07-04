# Résolution du problème des webhooks DExchange

## Problème diagnostiqué

Depuis environ 2 jours, les logs de la fonction Edge `dexchange-callback-handler` sont vides, ce qui indique qu'aucun webhook de DExchange n'est reçu dans notre système. Après diagnostic, nous avons identifié que :

1. **La fonction est active et déployée** (version 44 selon `supabase functions list`)
2. **La fonction est accessible via son URL** (`https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/dexchange-callback-handler`)
3. **Le problème principal : La fonction requiert une authentification JWT** (status 401 "Missing authorization header" ou "Invalid JWT")

Les webhooks envoyés par DExchange n'incluent PAS de token JWT Supabase, ils utilisent plutôt un système de signature spécifique à DExchange (header `x-webhook-secret` ou similaire). Par conséquent, toutes les requêtes webhook sont rejetées par Supabase avant même d'atteindre notre fonction.

## Solution implémentée

Nous avons recodé la fonction `dexchange-callback-handler` pour être déployée avec l'option `--no-verify-jwt`. Cette option permet à la fonction de recevoir des requêtes sans authentification JWT Supabase, tout en maintenant la sécurité via notre propre système de validation de signature dans le code.

### Améliorations apportées

1. **Déploiement sans vérification JWT** : Permet aux webhooks externes d'atteindre notre fonction
2. **Validation de signature robuste** : Supporte plusieurs formats d'en-têtes de signature utilisés par DExchange
3. **Logging amélioré** : Chaque requête a un ID unique pour un meilleur suivi
4. **Gestion d'erreurs structurée** : Messages clairs et traçabilité complète
5. **Flexibilité du format** : Support de différentes structures de données possibles dans les webhooks
6. **Alertes de sécurité** : Création automatique d'alertes en cas de tentatives non autorisées
7. **Statistiques** : Mise à jour des statistiques de paiement pour le monitoring

### Script de déploiement

Un script `deploy-webhook-no-auth.sh` a été créé pour simplifier le déploiement de la fonction sans authentification JWT. Il gère également la configuration d'un secret de webhook pour la sécurité.

## Configuration requise chez DExchange

Pour que les webhooks fonctionnent correctement, il faut s'assurer que DExchange est configuré avec :

1. **URL de webhook correcte** : `https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/dexchange-callback-handler`
2. **Secret webhook** : Doit correspondre à la valeur définie dans la variable d'environnement `DEXCHANGE_WEBHOOK_SECRET` de la fonction
3. **Format des données** : Le webhook doit inclure :
   - Un identifiant de transaction unique
   - Un identifiant de facture (dans le corps ou les métadonnées)
   - Un statut du paiement (completed, succeeded, etc.)

## Tests et validation

Après déploiement, vous pouvez vérifier que la fonction fonctionne correctement en :

1. Exécutant le script `diagnostic-webhook-dexchange.sh` pour tester la connectivité
2. Vérifiant les logs de la fonction après une tentative de webhook
3. Consultant les tables `payment_statistics` et `payment_alerts` pour voir les événements enregistrés

## Remarques importantes

- **Sécurité** : La fonction est désormais publiquement accessible, mais protégée par validation de signature
- **Monitoring** : Un monitoring régulier des logs et alertes est recommandé pour détecter tout problème
- **Tests périodiques** : Exécuter occasionnellement `diagnostic-webhook-dexchange.sh` pour valider que tout fonctionne

## Prochaines étapes recommandées

1. **Validation avec DExchange** : Confirmer que leurs webhooks sont bien envoyés à notre URL
2. **Monitoring des webhooks** : Mettre en place une alerte si aucun webhook n'est reçu pendant X heures
3. **Dashboard** : Ajouter une section dans l'interface admin pour suivre les statistiques de webhooks
