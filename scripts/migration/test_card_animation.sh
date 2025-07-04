#!/bin/bash

# Script pour tester les animations des cartes interactives
# Auteur: GitHub Copilot
# Date: 24 juin 2025

echo "🧪 Lancement des tests d'animation pour les cartes interactives..."

# Démarrer le serveur de développement en arrière-plan
echo "🚀 Démarrage du serveur de développement..."
npm run dev &

# Attendre que le serveur soit prêt
echo "⏳ Attente du démarrage du serveur..."
sleep 10

# Ouvrir le navigateur sur les pages concernées
echo "🌐 Ouverture des pages pour test..."

# Pour macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
  open http://localhost:5173/factures
  sleep 2
  open http://localhost:5173/devis
else
  # Pour Linux
  xdg-open http://localhost:5173/factures
  sleep 2
  xdg-open http://localhost:5173/devis
fi

echo """
✅ Test prêt ! 

Instructions de test:
1. Dans la page Factures et Devis, cliquez sur différentes cartes 
   pour vérifier que l'expansion n'affecte que les cartes de la même colonne.
2. Essayez avec différentes tailles d'écran pour vérifier le comportement avec 1, 2 ou 3 colonnes.
3. Une fois terminé, fermez les navigateurs et appuyez sur Ctrl+C pour arrêter le serveur.

"""

# Attendre que l'utilisateur tue le processus avec Ctrl+C
trap "echo '🛑 Arrêt des tests'; pkill -f 'vite'" SIGINT
wait
