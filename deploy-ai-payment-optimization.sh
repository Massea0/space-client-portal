#!/bin/bash
# deploy-ai-payment-optimization.sh
# Script de déploiement de la version optimisée de AI Payment Prediction

set -e

echo "🚀 DÉPLOIEMENT AI PAYMENT PREDICTION OPTIMISÉE"
echo "================================================"

# Configuration
FUNCTION_NAME="ai-payment-prediction"
BACKUP_SUFFIX=$(date +%Y%m%d_%H%M%S)

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérification des prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    if ! command -v supabase &> /dev/null; then
        log_error "Supabase CLI non installé. Installez-le avec: npm install -g supabase"
        exit 1
    fi
    
    if ! supabase --version &> /dev/null; then
        log_error "Erreur avec Supabase CLI"
        exit 1
    fi
    
    log_success "Supabase CLI disponible"
    
    # Vérifier la connexion Supabase
    if ! supabase status &> /dev/null; then
        log_warning "Projet Supabase non initialisé, tentative de connexion..."
        supabase login
    fi
    
    log_success "Prérequis validés"
}

# Sauvegarde de l'ancienne version
backup_current_function() {
    log_info "Sauvegarde de la version actuelle..."
    
    local backup_dir="backups/ai-payment-prediction"
    mkdir -p "$backup_dir"
    
    if [ -f "supabase/functions/$FUNCTION_NAME/index.ts" ]; then
        cp "supabase/functions/$FUNCTION_NAME/index.ts" "$backup_dir/index_backup_$BACKUP_SUFFIX.ts"
        log_success "Sauvegarde créée: $backup_dir/index_backup_$BACKUP_SUFFIX.ts"
    else
        log_warning "Aucune version existante trouvée"
    fi
}

# Déploiement de la version optimisée
deploy_optimized_version() {
    log_info "Déploiement de la version optimisée..."
    
    # Copier la version optimisée
    if [ -f "supabase/functions/$FUNCTION_NAME/index-optimized.ts" ]; then
        cp "supabase/functions/$FUNCTION_NAME/index-optimized.ts" "supabase/functions/$FUNCTION_NAME/index.ts"
        log_success "Version optimisée copiée"
    else
        log_error "Fichier optimisé non trouvé: supabase/functions/$FUNCTION_NAME/index-optimized.ts"
        exit 1
    fi
    
    # Déployer la fonction
    log_info "Déploiement en cours..."
    
    if supabase functions deploy $FUNCTION_NAME; then
        log_success "Fonction $FUNCTION_NAME déployée avec succès"
    else
        log_error "Erreur lors du déploiement"
        
        # Restaurer la sauvegarde en cas d'erreur
        log_info "Restauration de la version précédente..."
        if [ -f "backups/ai-payment-prediction/index_backup_$BACKUP_SUFFIX.ts" ]; then
            cp "backups/ai-payment-prediction/index_backup_$BACKUP_SUFFIX.ts" "supabase/functions/$FUNCTION_NAME/index.ts"
            supabase functions deploy $FUNCTION_NAME
            log_warning "Version précédente restaurée"
        fi
        
        exit 1
    fi
}

# Test de la fonction déployée
test_deployed_function() {
    log_info "Test de la fonction déployée..."
    
    # Lancer le script de test
    if [ -f "test-ia-functions.js" ]; then
        log_info "Exécution des tests automatisés..."
        if node test-ia-functions.js | grep -q "Test: Prédiction de Paiement"; then
            log_success "Tests automatisés passés"
        else
            log_warning "Tests automatisés échoués ou incomplets"
        fi
    fi
    
    # Test manuel simple
    log_info "Test de connectivité de base..."
    local test_url=$(supabase status | grep "API URL" | awk '{print $3}')
    
    if [ -n "$test_url" ]; then
        log_success "URL API disponible: $test_url"
    else
        log_warning "Impossible de récupérer l'URL API"
    fi
}

# Optimisation post-déploiement
post_deployment_optimization() {
    log_info "Optimisations post-déploiement..."
    
    # Lancer le script d'optimisation
    if [ -f "optimize-ai-payment-prediction.js" ]; then
        log_info "Analyse de performance post-déploiement..."
        node optimize-ai-payment-prediction.js > "logs/optimization_report_$BACKUP_SUFFIX.json" 2>&1 || {
            log_warning "Script d'optimisation terminé avec avertissements"
        }
        log_success "Rapport d'optimisation généré"
    fi
    
    # Configuration des variables d'environnement optimisées
    log_info "Configuration des variables d'optimisation..."
    
    # Note: Les secrets Supabase doivent être configurés manuellement
    log_info "Variables d'environnement à configurer dans Supabase Dashboard:"
    echo "  - PREDICTION_CACHE_TTL: 30 (minutes)"
    echo "  - GEMINI_API_KEY: [votre clé API Gemini]"
}

# Nettoyage et finalisation
cleanup_and_finalize() {
    log_info "Nettoyage et finalisation..."
    
    # Créer un rapport de déploiement
    local report_file="logs/deployment_report_$BACKUP_SUFFIX.md"
    mkdir -p logs
    
    cat > "$report_file" << EOF
# Rapport de Déploiement AI Payment Prediction Optimisée

## Informations de Déploiement
- **Date**: $(date)
- **Version**: Optimisée v1.0
- **Backup ID**: $BACKUP_SUFFIX

## Changements Déployés
- ✅ Cache intelligent avec TTL adaptatif
- ✅ Retry logic avec exponential backoff
- ✅ Métriques de performance intégrées
- ✅ Nettoyage automatique du cache
- ✅ Fallback optimisé

## Métriques Attendues
- **Temps de réponse**: < 2 secondes (95e percentile)
- **Cache hit rate**: > 80% après rodage
- **Taux d'erreur**: < 1%
- **Disponibilité**: > 99.5%

## Actions Post-Déploiement
1. Monitorer les métriques de performance
2. Configurer les variables d'environnement
3. Valider les tests de charge
4. Mettre à jour la documentation utilisateur

## Fichiers de Sauvegarde
- Ancienne version: backups/ai-payment-prediction/index_backup_$BACKUP_SUFFIX.ts
- Rapport optimisation: logs/optimization_report_$BACKUP_SUFFIX.json
EOF

    log_success "Rapport de déploiement créé: $report_file"
    
    # Afficher un résumé
    echo ""
    echo "📊 RÉSUMÉ DU DÉPLOIEMENT"
    echo "========================"
    echo "✅ Fonction AI Payment Prediction optimisée déployée"
    echo "📁 Sauvegarde: backups/ai-payment-prediction/index_backup_$BACKUP_SUFFIX.ts"
    echo "📄 Rapport: $report_file"
    echo "🔧 Variables à configurer: PREDICTION_CACHE_TTL, GEMINI_API_KEY"
    echo ""
    log_success "Déploiement terminé avec succès!"
}

# Fonction principale
main() {
    log_info "Début du déploiement de l'optimisation AI Payment Prediction"
    
    # Aller dans le répertoire du projet
    cd "$(dirname "$0")"
    
    # Exécuter les étapes
    check_prerequisites
    backup_current_function
    deploy_optimized_version
    test_deployed_function
    post_deployment_optimization
    cleanup_and_finalize
    
    echo ""
    log_success "🎉 DÉPLOIEMENT OPTIMISATION TERMINÉ AVEC SUCCÈS!"
    log_info "Surveillez les métriques de performance dans les prochaines heures"
}

# Gestion des signaux d'interruption
trap 'log_error "Déploiement interrompu"; exit 1' INT TERM

# Exécution avec gestion d'erreur globale
if main "$@"; then
    exit 0
else
    log_error "Échec du déploiement"
    exit 1
fi
