#!/bin/bash

# Configuration
HOST="myspace.arcadis.tech"
USER="user"  # Remplacer par votre nom d'utilisateur
DEST_PATH="/var/www/myspace"
SOURCE_PATH="dist/*"

# Afficher les informations de déploiement
echo "🚀 Déploiement vers $USER@$HOST:$DEST_PATH"

# Vérifier que le dossier dist existe
if [ ! -d "dist" ]; then
  echo "❌ Erreur: Le dossier dist n'existe pas. Exécutez npm run build d'abord."
  exit 1
fi

# Copier les fichiers vers l'hébergeur
echo "📦 Transfert des fichiers..."
scp -r $SOURCE_PATH $USER@$HOST:$DEST_PATH

# Vérifier si le transfert a réussi
if [ $? -eq 0 ]; then
  echo "✅ Déploiement réussi!"
else
  echo "❌ Échec du déploiement. Vérifiez votre connexion ou les permissions."
  exit 1
fi

echo "🌐 Site mis à jour: https://$HOST"
