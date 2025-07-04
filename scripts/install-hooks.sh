#!/bin/bash

# Script d'installation pour le hook pre-commit
# Ce script installe le hook de vérification JSX/TS dans .git/hooks

echo "Installation du hook pre-commit pour la vérification JSX/TS..."

# Chemin vers le dossier des hooks git
HOOKS_DIR=".git/hooks"

# Vérifier si le dossier .git existe
if [ ! -d ".git" ]; then
  echo "❌ Aucun dossier .git trouvé. Ce script doit être exécuté depuis la racine du projet."
  exit 1
fi

# S'assurer que le dossier hooks existe
mkdir -p "$HOOKS_DIR"

# Copier le hook pre-commit
cp scripts/pre-commit-check.sh "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/pre-commit"

echo "✅ Hook pre-commit installé avec succès!"
echo "Le hook vérifiera les erreurs JSX/TS avant chaque commit."
exit 0
