#!/bin/bash

# Script de vérification pre-commit pour les erreurs JSX et TypeScript
# Placez ce fichier dans votre dossier .git/hooks/pre-commit et rendez-le exécutable

echo "Vérification des fichiers TypeScript et JSX..."

# Exécute tsc pour vérifier les erreurs de type
npx tsc --noEmit

if [ $? -ne 0 ]; then
  echo "❌ Erreurs TypeScript détectées. Commit rejeté."
  exit 1
fi

# Vérification syntaxique spécifique pour les fichiers JSX/TSX modifiés
FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(jsx|tsx)$')
if [ -n "$FILES" ]; then
  echo "Vérification des erreurs JSX dans les fichiers modifiés..."
  
  # Pour chaque fichier modifié
  for FILE in $FILES; do
    # Vérifie les balises non fermées avec une regex simple
    OPEN_TAGS=$(grep -o '<[a-zA-Z][a-zA-Z0-9]*' $FILE | grep -v '/>' | sed 's/<//' | sort)
    CLOSE_TAGS=$(grep -o '</[a-zA-Z][a-zA-Z0-9]*>' $FILE | sed 's/<\///' | sed 's/>//' | sort)
    
    # Compare les balises ouvertes et fermées (solution basique mais utile)
    if [ "$(echo "$OPEN_TAGS" | wc -l)" != "$(echo "$CLOSE_TAGS" | wc -l)" ]; then
      echo "❌ Possible problème de balises JSX non fermées dans $FILE"
      echo "Réviser attentivement ce fichier avant de commiter."
      exit 1
    fi
  done
fi

echo "✅ Vérification réussie !"
exit 0
