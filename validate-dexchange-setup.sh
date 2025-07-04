#!/bin/bash

# Script de validation finale - Vérifie que tout est prêt pour le déploiement
# Ce script vérifie les fichiers, la configuration et les prérequis

echo "🔍 Validation finale du système DExchange..."

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Fonction d'affichage
print_status() {
  if [ "$1" == "OK" ]; then
    echo -e "  ${GREEN}✅ $2${NC}"
  elif [ "$1" == "WARN" ]; then
    echo -e "  ${YELLOW}⚠️  $2${NC}"
    ((WARNINGS++))
  elif [ "$1" == "ERROR" ]; then
    echo -e "  ${RED}❌ $2${NC}"
    ((ERRORS++))
  else
    echo -e "  ${BLUE}ℹ️  $2${NC}"
  fi
}

echo ""
echo "📁 Vérification des fichiers..."

# Vérifier les fichiers de fonction
if [ -f "supabase/functions/dexchange-callback-handler/index.ts" ]; then
  print_status "OK" "Fonction dexchange-callback-handler présente"
else
  print_status "ERROR" "Fonction dexchange-callback-handler manquante"
fi

if [ -f "supabase/functions/get-public-config/index.ts" ]; then
  print_status "OK" "Fonction get-public-config présente"
else
  print_status "ERROR" "Fonction get-public-config manquante"
fi

# Vérifier les scripts
SCRIPTS=("deploy-complete-dexchange.sh" "test-dexchange-deployment.sh" "create-env-template.sh")
for script in "${SCRIPTS[@]}"; do
  if [ -f "$script" ] && [ -x "$script" ]; then
    print_status "OK" "Script $script présent et exécutable"
  elif [ -f "$script" ]; then
    print_status "WARN" "Script $script présent mais pas exécutable"
  else
    print_status "ERROR" "Script $script manquant"
  fi
done

# Vérifier la documentation
DOCS=("IMPLEMENTATION-COMPLETE-DEXCHANGE.md" "CONFIGURATION-VARIABLES-DEXCHANGE.md")
for doc in "${DOCS[@]}"; do
  if [ -f "$doc" ]; then
    print_status "OK" "Documentation $doc présente"
  else
    print_status "WARN" "Documentation $doc manquante"
  fi
done

echo ""
echo "🔧 Vérification de la configuration..."

# Charger .env si disponible
if [ -f ".env" ]; then
  print_status "OK" "Fichier .env présent"
  source .env
else
  print_status "WARN" "Fichier .env manquant - utilisez ./create-env-template.sh"
fi

# Vérifier les variables critiques
CRITICAL_VARS=("SUPABASE_URL" "SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY")
for var in "${CRITICAL_VARS[@]}"; do
  if [ ! -z "${!var}" ]; then
    print_status "OK" "$var configurée"
  else
    print_status "ERROR" "$var manquante (critique)"
  fi
done

# Vérifier les variables DExchange importantes
IMPORTANT_VARS=("DEXCHANGE_API_KEY" "DEXCHANGE_WEBHOOK_SECRET" "SITE_URL")
for var in "${IMPORTANT_VARS[@]}"; do
  if [ ! -z "${!var}" ]; then
    print_status "OK" "$var configurée"
  else
    print_status "WARN" "$var manquante (importante)"
  fi
done

# Vérifier les variables optionnelles
OPTIONAL_VARS=("GCP_RELAY_URL" "DEXCHANGE_ENVIRONMENT")
for var in "${OPTIONAL_VARS[@]}"; do
  if [ ! -z "${!var}" ]; then
    print_status "OK" "$var configurée"
  else
    print_status "INFO" "$var non configurée (optionnelle)"
  fi
done

echo ""
echo "🛠️  Vérification des outils..."

# Vérifier que supabase CLI est disponible
if command -v supabase &> /dev/null; then
  SUPABASE_VERSION=$(supabase --version 2>/dev/null | head -1)
  print_status "OK" "Supabase CLI disponible ($SUPABASE_VERSION)"
else
  print_status "ERROR" "Supabase CLI non trouvé"
fi

# Vérifier que curl est disponible
if command -v curl &> /dev/null; then
  print_status "OK" "curl disponible"
else
  print_status "ERROR" "curl non trouvé (requis pour les tests)"
fi

# Vérifier que jq est disponible
if command -v jq &> /dev/null; then
  print_status "OK" "jq disponible (pour parsing JSON)"
else
  print_status "WARN" "jq non trouvé (recommandé pour les tests)"
fi

echo ""
echo "🔗 Test de connectivité Supabase..."

if [ ! -z "$SUPABASE_URL" ]; then
  # Tester la connectivité à Supabase
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL" 2>/dev/null || echo "000")
  
  if [ "$HTTP_STATUS" != "000" ]; then
    print_status "OK" "Supabase accessible (HTTP $HTTP_STATUS)"
  else
    print_status "ERROR" "Supabase non accessible"
  fi
else
  print_status "ERROR" "SUPABASE_URL non configurée - impossible de tester la connectivité"
fi

echo ""
echo "📊 Résumé de la validation..."

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}🎉 Validation réussie ! Tout est prêt pour le déploiement.${NC}"
  echo ""
  echo "🚀 Prochaines étapes :"
  echo "  1. ./deploy-complete-dexchange.sh"
  echo "  2. ./test-dexchange-deployment.sh"
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠️  Validation avec avertissements ($WARNINGS warnings).${NC}"
  echo "Le déploiement est possible mais certaines fonctionnalités peuvent être limitées."
  echo ""
  echo "🔧 Actions recommandées :"
  echo "  - Configurez les variables manquantes dans .env"
  echo "  - Consultez CONFIGURATION-VARIABLES-DEXCHANGE.md"
else
  echo -e "${RED}❌ Validation échouée ($ERRORS erreurs, $WARNINGS warnings).${NC}"
  echo ""
  echo "🛠️  Actions requises :"
  echo "  - Corrigez les erreurs critiques listées ci-dessus"
  echo "  - Configurez les variables manquantes"
  echo "  - Relancez ce script de validation"
  exit 1
fi

echo ""
echo "📚 Documentation disponible :"
echo "  - IMPLEMENTATION-COMPLETE-DEXCHANGE.md (vue d'ensemble)"
echo "  - CONFIGURATION-VARIABLES-DEXCHANGE.md (configuration détaillée)"
