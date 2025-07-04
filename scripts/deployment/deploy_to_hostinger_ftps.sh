#!/bin/bash

# Script de déploiement FTP vers Hostinger
# Déploie l'application React buildée vers le serveur de production

# Configuration FTP
FTP_HOST="82.25.113.114"
FTP_USER="u766960269"
FTP_PASS="Masse_a003"
FTP_DIR="/domains/arcadis.tech/public_html/myspace"
LOCAL_BUILD_DIR="./dist"

# Couleurs pour les logs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Déploiement vers Hostinger - MySpace Production${NC}"
echo "========================================================="

# Vérification des prérequis
echo -e "${YELLOW}📋 Vérification des prérequis...${NC}"

# Vérifier si le dossier build existe
if [ ! -d "$LOCAL_BUILD_DIR" ]; then
    echo -e "${RED}❌ Erreur: Le dossier $LOCAL_BUILD_DIR n'existe pas${NC}"
    echo -e "${YELLOW}💡 Exécutez d'abord: npm run build${NC}"
    exit 1
fi

# Vérifier si lftp est installé
if ! command -v lftp &> /dev/null; then
    echo -e "${RED}❌ Erreur: lftp n'est pas installé${NC}"
    echo -e "${YELLOW}💡 Installation automatique...${NC}"
    
    # Installer lftp automatiquement selon l'OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS - installer avec brew sans update automatique
        echo "Installation de lftp avec Homebrew..."
        HOMEBREW_NO_AUTO_UPDATE=1 brew install lftp
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux - installer avec apt
        echo "Installation de lftp avec apt..."
        sudo apt-get update && sudo apt-get install -y lftp
    else
        echo -e "${RED}❌ OS non supporté pour l'installation automatique${NC}"
        echo -e "${YELLOW}💡 Installation manuelle:${NC}"
        echo "  macOS: HOMEBREW_NO_AUTO_UPDATE=1 brew install lftp"
        echo "  Ubuntu: sudo apt-get install lftp"
        exit 1
    fi
    
    # Vérifier que l'installation a réussi
    if ! command -v lftp &> /dev/null; then
        echo -e "${RED}❌ Échec de l'installation automatique${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ lftp installé avec succès${NC}"
fi

echo -e "${GREEN}✅ Prérequis validés${NC}"

# Affichage des informations de déploiement
echo -e "${YELLOW}📊 Informations de déploiement:${NC}"
echo "  Serveur: $FTP_HOST"
echo "  Utilisateur: $FTP_USER"
echo "  Destination: $FTP_DIR"
echo "  Source locale: $LOCAL_BUILD_DIR"
echo ""

# Confirmation avant déploiement
read -p "🤔 Continuer le déploiement? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏹️ Déploiement annulé${NC}"
    exit 0
fi

echo -e "${YELLOW}📤 Démarrage du téléchargement...${NC}"

# Script LFTP pour le déploiement
lftp -c "
set ftp:ssl-allow no
set ftp:passive-mode on
set net:timeout 10
set net:max-retries 3
set net:reconnect-interval-base 5

open ftp://$FTP_USER:$FTP_PASS@$FTP_HOST

# Aller dans le répertoire de destination
cd $FTP_DIR

# Sauvegarder l'ancien déploiement (optionnel)
!echo 'Sauvegarde de l'ancien déploiement...'
mkdir -p backup-\$(date +%Y%m%d-%H%M%S) 2>/dev/null || true

# Supprimer les anciens fichiers (sauf backup)
!echo 'Nettoyage des anciens fichiers...'
rm -rf assets/ *.html *.js *.css *.ico *.txt *.svg *.png *.json _redirects .htaccess 2>/dev/null || true

# Télécharger tous les nouveaux fichiers
!echo 'Téléchargement des nouveaux fichiers...'
lcd $LOCAL_BUILD_DIR
mirror --reverse --delete --verbose --exclude-glob backup-* ./ ./

# Vérifier que les fichiers principaux sont présents
ls -la

quit
"

# Vérification du statut de déploiement
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Déploiement réussi!${NC}"
    echo -e "${GREEN}🌐 Site accessible à: https://myspace.arcadis.tech${NC}"
    echo -e "${GREEN}💰 Pages de paiement:${NC}"
    echo -e "   • https://myspace.arcadis.tech/payment/success"
    echo -e "   • https://myspace.arcadis.tech/payment/cancel"
    echo ""
    echo -e "${YELLOW}📝 Notes importantes:${NC}"
    echo -e "   • Les redirections SPA sont configurées (_redirects et .htaccess)"
    echo -e "   • Testez les URLs de paiement Wave après déploiement"
    echo -e "   • Vérifiez les logs Supabase pour diagnostiquer les problèmes"
else
    echo ""
    echo -e "${RED}❌ Erreur lors du déploiement${NC}"
    echo -e "${YELLOW}💡 Vérifiez:${NC}"
    echo -e "   • La connexion internet"
    echo -e "   • Les identifiants FTP"
    echo -e "   • Les permissions sur le serveur"
    exit 1
fi
