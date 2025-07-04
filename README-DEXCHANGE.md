# Système de Paiement DExchange - Guide Complet

Ce repository contient l'implémentation complète du système de paiement DExchange avec webhook et configuration automatisée.

## 🚀 Démarrage Rapide

### 1. Configuration Initiale
```bash
# Créer le fichier de configuration
./create-env-template.sh

# Éditer le fichier .env avec vos vraies valeurs
nano .env
```

### 2. Validation
```bash
# Valider que tout est prêt
./validate-dexchange-setup.sh
```

### 3. Déploiement
```bash
# Déployer toutes les fonctions
./deploy-complete-dexchange.sh
```

### 4. Tests
```bash
# Tester le déploiement
./test-dexchange-deployment.sh
```

## 📁 Structure du Projet

```
myspace/
├── supabase/functions/
│   ├── dexchange-callback-handler/     # Webhook DExchange
│   │   └── index.ts
│   └── get-public-config/              # Configuration publique
│       └── index.ts
├── scripts/
│   ├── create-env-template.sh          # Création template .env
│   ├── deploy-complete-dexchange.sh    # Déploiement complet
│   ├── test-dexchange-deployment.sh    # Tests automatisés
│   └── validate-dexchange-setup.sh     # Validation système
├── docs/
│   ├── IMPLEMENTATION-COMPLETE-DEXCHANGE.md
│   └── CONFIGURATION-VARIABLES-DEXCHANGE.md
├── .env.template                       # Template variables
└── .env                               # Vos variables (privé)
```

## 🔧 Fonctions Déployées

### `dexchange-callback-handler`
- **Rôle** : Réception des webhooks DExchange
- **Sécurité** : Validation de signature obligatoire
- **Fonctionnalités** : Mise à jour automatique des factures, logging, alertes

### `get-public-config`
- **Rôle** : Configuration publique pour le client
- **Contenu** : URLs DExchange, configuration relais, variables publiques

## 🔐 Variables d'Environnement

### Critiques (Obligatoires)
- `SUPABASE_URL` - URL de votre projet Supabase
- `SUPABASE_ANON_KEY` - Clé publique Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Clé service Supabase
- `DEXCHANGE_API_KEY` - Clé API DExchange
- `DEXCHANGE_WEBHOOK_SECRET` - Secret webhook
- `SITE_URL` - URL de votre site

### Optionnelles
- `DEXCHANGE_ENVIRONMENT` - sandbox ou production (défaut: sandbox)
- `GCP_RELAY_URL` - URL du relais GCP
- `GEMINI_API_KEY` - Clé API Gemini

## 📋 Informations pour DExchange

Une fois déployé, fournissez ces informations à DExchange :

```
URL du webhook : https://[projet].supabase.co/functions/v1/dexchange-callback-handler
Secret webhook : [votre DEXCHANGE_WEBHOOK_SECRET]
URL de succès : https://[site]/payment/success
URL d'échec : https://[site]/payment/failure
```

## 🧪 Tests

### Test Manuel Webhook
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: [votre-secret]" \
  -d '{"event":"payment.succeeded","data":{"id":"test_123","status":"succeeded","metadata":{"invoice_id":"test_invoice"}}}' \
  https://[projet].supabase.co/functions/v1/dexchange-callback-handler
```

### Test Configuration Publique
```bash
curl https://[projet].supabase.co/functions/v1/get-public-config
```

## 🔄 Flux de Paiement

1. **Initiation** : Client demande un paiement
2. **Redirection** : Vers DExchange avec paramètres
3. **Traitement** : DExchange traite le paiement
4. **Webhook** : DExchange notifie le résultat
5. **Mise à jour** : Facture marquée comme payée
6. **Redirection** : Client redirigé vers succès/échec

## 📊 Monitoring

### Tables de Suivi
- `payment_statistics` - Statistiques quotidiennes
- `payment_alerts` - Alertes et erreurs
- `invoices` - Statuts des factures

### Logs
Chaque requête webhook génère des logs avec :
- ID unique de requête
- Métadonnées détaillées
- Statut de traitement
- Erreurs éventuelles

## 🛠️ Résolution de Problèmes

### Webhook ne fonctionne pas
1. Vérifiez que `DEXCHANGE_WEBHOOK_SECRET` est configuré
2. Vérifiez que DExchange utilise le bon secret
3. Consultez les logs de la fonction
4. Utilisez `./test-dexchange-deployment.sh`

### Variables manquantes
1. Exécutez `./validate-dexchange-setup.sh`
2. Configurez les variables manquantes dans `.env`
3. Redéployez avec `./deploy-complete-dexchange.sh`

### Problèmes de CORS
Les en-têtes CORS sont configurés automatiquement pour supporter :
- Requêtes OPTIONS
- Headers personnalisés (`x-webhook-secret`, etc.)
- Domaines externes

## 📚 Documentation Détaillée

- **[IMPLEMENTATION-COMPLETE-DEXCHANGE.md](IMPLEMENTATION-COMPLETE-DEXCHANGE.md)** - Vue d'ensemble technique
- **[CONFIGURATION-VARIABLES-DEXCHANGE.md](CONFIGURATION-VARIABLES-DEXCHANGE.md)** - Guide des variables
- **[.env.template](.env.template)** - Template de configuration

## 🤝 Support

Pour toute question ou problème :
1. Consultez la documentation ci-dessus
2. Exécutez les scripts de diagnostic
3. Vérifiez les logs des fonctions Supabase
4. Consultez les tables de monitoring

## ✅ Checklist de Déploiement

- [ ] Variables d'environnement configurées
- [ ] Scripts de validation passés
- [ ] Fonctions déployées avec succès
- [ ] Tests automatisés validés
- [ ] Informations fournies à DExchange
- [ ] Monitoring configuré
- [ ] Documentation à jour

---

**Note** : Ce système est conçu pour être robuste, sécurisé et facilement maintenable. Tous les composants sont testés et documentés.
