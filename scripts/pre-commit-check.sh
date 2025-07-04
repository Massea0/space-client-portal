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
    # Vérifie les balises JSX non auto-fermantes et non fermées
    OPEN_TAGS=$(grep -o '<[a-zA-Z][a-zA-Z0-9]*[^/]*[^>]*>' $FILE | grep -v '/>' | grep -v '</' | sed 's/<\([a-zA-Z][a-zA-Z0-9]*\).*/\1/' | sort)
    CLOSE_TAGS=$(grep -o '</[a-zA-Z][a-zA-Z0-9]*>' $FILE | sed 's/<\///' | sed 's/>//' | sort)
    
    # Compare le nombre de balises ouvertes non auto-fermantes et fermées
    OPEN_COUNT=$(echo "$OPEN_TAGS" | grep -v '^$' | wc -l)
    CLOSE_COUNT=$(echo "$CLOSE_TAGS" | grep -v '^$' | wc -l)
    
    if [ "$OPEN_COUNT" != "$CLOSE_COUNT" ]; then
      echo "❌ Possible problème de balises JSX non fermées dans $FILE"
      echo "Balises ouvertes: $OPEN_COUNT, Balises fermées: $CLOSE_COUNT"
      echo "Réviser attentivement ce fichier avant de commiter."
      exit 1
    fi
  done
fi

echo "✅ Vérification réussie !"
exit 0
