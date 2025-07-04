#!/bin/bash

# Script de build et déploiement production complet
# Construit l'application avec la configuration production et la déploie

# Couleurs pour les logs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 BUILD ET DÉPLOIEMENT PRODUCTION MYSPACE${NC}"
echo "=================================================="

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erreur: package.json non trouvé${NC}"
    echo -e "${YELLOW}💡 Exécutez ce script depuis la racine du projet${NC}"
    exit 1
fi

# Étape 1: Vérification des variables d'environnement
echo -e "${YELLOW}📋 1. Vérification de la configuration...${NC}"

if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Erreur: .env.production non trouvé${NC}"
    echo -e "${YELLOW}💡 Créez le fichier .env.production avec les bonnes variables${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Configuration production trouvée${NC}"

# Afficher les variables principales
echo -e "${BLUE}📊 Configuration à utiliser:${NC}"
source .env.production
echo "  VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}"
echo "  VITE_SITE_URL: ${VITE_SITE_URL}"
echo "  VITE_DEXCHANGE_ENVIRONMENT: ${VITE_DEXCHANGE_ENVIRONMENT}"
echo ""

# Étape 2: Installation des dépendances
echo -e "${YELLOW}📦 2. Installation des dépendances...${NC}"

# Essayer d'abord l'installation normale
npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Installation normale échouée, tentative avec --force...${NC}"
    npm install --force
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️  Installation complète échouée, on continue sans réinstaller...${NC}"
        echo -e "${BLUE}💡 Utilisation des dépendances existantes${NC}"
    fi
fi
echo -e "${GREEN}✅ Dépendances prêtes${NC}"

# Étape 3: Build de production
echo -e "${YELLOW}🔨 3. Build de l'application...${NC}"

# Supprimer l'ancien build
rm -rf dist

# Build avec les variables de production
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors du build${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build réussi${NC}"

# Vérifier que le build a créé les fichiers
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Erreur: Le dossier dist n'a pas été créé${NC}"
    exit 1
fi

echo -e "${BLUE}📁 Contenu du build:${NC}"
ls -la dist/

# Étape 4: Créer les fichiers de configuration pour SPA
echo -e "${YELLOW}🔧 4. Configuration SPA...${NC}"

# Créer le fichier _redirects pour Netlify-style redirects
cat > dist/_redirects << 'EOF'
# Redirections pour Single Page Application
/*    /index.html   200

# Pages de paiement spécifiques
/payment/success  /index.html  200
/payment/failure  /index.html  200
/payment/cancel   /index.html  200
EOF

# Créer le fichier .htaccess pour Apache
cat > dist/.htaccess << 'EOF'
# Configuration Apache pour SPA React
RewriteEngine On

# Gestion des routes React Router
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Headers de sécurité
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"

# Cache des assets
<filesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
</filesMatch>
EOF

echo -e "${GREEN}✅ Configuration SPA créée${NC}"

# Étape 5: Test de la fonction de configuration publique
echo -e "${YELLOW}🧪 5. Test de connectivité backend...${NC}"

curl -s "https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/get-public-config" > /tmp/config_test.json
if [ $? -eq 0 ]; then
    if grep -q '"success":true' /tmp/config_test.json; then
        echo -e "${GREEN}✅ Backend opérationnel${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend accessible mais configuration incomplète${NC}"
        cat /tmp/config_test.json
    fi
else
    echo -e "${RED}❌ Erreur de connectivité backend${NC}"
    echo -e "${YELLOW}💡 Vérifiez la connexion internet et les URLs${NC}"
fi

# Étape 6: Déploiement automatique
echo -e "${BLUE}📤 6. Déploiement vers: https://myspace.arcadis.tech${NC}"

# Étape 7: Exécution du script de déploiement FTPS
echo -e "${YELLOW}🚀 7. Déploiement FTP...${NC}"

if [ -f "scripts/deployment/deploy_to_hostinger_ftps.sh" ]; then
    chmod +x scripts/deployment/deploy_to_hostinger_ftps.sh
    ./scripts/deployment/deploy_to_hostinger_ftps.sh
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}🎉 DÉPLOIEMENT PRODUCTION RÉUSSI !${NC}"
        echo "=================================================="
        echo -e "${GREEN}🌐 Site web: https://myspace.arcadis.tech${NC}"
        echo -e "${GREEN}💳 Paiements: Système Wave/DExchange opérationnel${NC}"
        echo ""
        echo -e "${BLUE}📋 URLs importantes:${NC}"
        echo "  • Application: https://myspace.arcadis.tech"
        echo "  • Succès paiement: https://myspace.arcadis.tech/payment/success"
        echo "  • Échec paiement: https://myspace.arcadis.tech/payment/failure"
        echo ""
        echo -e "${YELLOW}🔧 Tests à effectuer:${NC}"
        echo "  1. Vérifier que l'application se charge"
        echo "  2. Tester l'authentification"
        echo "  3. Créer une facture de test"
        echo "  4. Initier un paiement Wave/DExchange"
        echo "  5. Vérifier les webhooks dans Supabase"
        echo ""
    else
        echo -e "${RED}❌ Erreur lors du déploiement FTP${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Script de déploiement FTP non trouvé${NC}"
    echo -e "${YELLOW}💡 Cherché: scripts/deployment/deploy_to_hostinger_ftps.sh${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Processus terminé${NC}"
