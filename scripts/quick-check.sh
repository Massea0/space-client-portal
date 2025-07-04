#!/bin/bash

# Script pour vérifier rapidement les erreurs de compilation/type
# Utile pour vérifier les erreurs sans lancer l'application complète

echo "Vérification des erreurs de compilation TypeScript..."
npx tsc --noEmit

if [ $? -eq 0 ]; then
  echo "✅ Pas d'erreurs TypeScript détectées!"
else
  echo "❌ Des erreurs TypeScript ont été détectées."
  exit 1
fi

# Vérification ESLint (si configuré)
if [ -f ".eslintrc" ] || [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ] || [ -f "eslint.config.js" ]; then
  echo "Vérification des erreurs ESLint..."
  npx eslint 'src/**/*.{js,jsx,ts,tsx}'
  
  if [ $? -eq 0 ]; then
    echo "✅ Pas d'erreurs ESLint détectées!"
  else
    echo "❌ Des erreurs ESLint ont été détectées."
    exit 1
  fi
fi

echo "✅ Toutes les vérifications sont passées!"
exit 0
