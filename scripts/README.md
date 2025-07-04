# Scripts du Projet MySpace

Ce répertoire contient tous les scripts utilisés pour le développement, le test, le déploiement et la maintenance du projet MySpace.

## Structure des dossiers

- **deployment/** : Scripts utilisés pour le déploiement de l'application
  - `deploy_edge_functions.sh` : Déploie les fonctions Edge sur Supabase
  - `deploy_to_hostinger_scp.sh` : Déploie l'application sur l'hébergement Hostinger via SCP
  - `deploy_to_hostinger_ftps.sh` : Déploie l'application sur l'hébergement Hostinger via FTPS
  - `deploy_to_hostinger.sh` : Script principal de déploiement vers Hostinger

- **maintenance/** : Scripts utilitaires pour la maintenance et les corrections
  - `fix_api.sh`, `fix_api2.sh`, `fix_api3.sh` : Scripts de correction des problèmes liés à l'API
  - `update-invoice-status.js` : Mise à jour des statuts des factures
  - `reset-invoice-status.js` : Réinitialisation des statuts des factures

- **tests/** : Scripts pour tester les fonctionnalités du système
  - `test-complete-payment-flow.js` : Test du flux complet de paiement
  - `test-detection-payment-status.js` : Test de la détection de statut de paiement
  - `test-dexchange-real-format.js` : Test du format réel de Dexchange
  - `test-direct-invoke.js` : Test direct d'invocation des fonctions
  - `test-end-to-end-payment.js` : Test de bout en bout du processus de paiement
  - Autres tests spécifiques pour divers scénarios

- **install-hooks.sh** : Installation des hooks git
- **pre-commit-check.sh** : Vérifications exécutées avant chaque commit
- **quick-check.sh** : Vérification rapide du code
- **replace-select-triggers.sh** : Utilitaire pour remplacer les déclencheurs de sélection

## Utilisation

Pour exécuter un script, utilisez la commande suivante à partir de la racine du projet :

```bash
# Pour les scripts de déploiement
bash scripts/deployment/deploy_edge_functions.sh

# Pour les scripts de maintenance
node scripts/maintenance/update-invoice-status.js

# Pour les scripts de test
node scripts/tests/test-complete-payment-flow.js
```

## Notes importantes

- Assurez-vous que tous les scripts sont exécutables (`chmod +x script.sh`)
- Certains scripts nécessitent des variables d'environnement définies dans le fichier `.env`
- Les scripts de test supposent généralement qu'une instance de développement de Supabase est en cours d'exécution
- Documentez toute nouvelle fonctionnalité ajoutée aux scripts dans ce README
