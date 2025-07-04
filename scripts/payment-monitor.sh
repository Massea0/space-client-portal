#!/bin/bash

# Script de monitoring automatique des paiements Wave
# À exécuter toutes les heures via cron job : 0 * * * * /path/to/payment-monitor.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/payment-monitor.log"

# Configuration
SUPABASE_URL="https://qlqgyrfqiflnqknbtycw.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc"

# Fonction de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Fonction pour appeler une edge function
call_function() {
    local function_name=$1
    local response
    
    log "📞 Appel de la fonction $function_name..."
    
    response=$(curl -s -X POST "$SUPABASE_URL/functions/v1/$function_name" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
        -d '{}' 2>&1)
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        log "✅ $function_name: Succès"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        return 0
    else
        log "❌ $function_name: Échec (code $exit_code)"
        log "📝 Réponse: $response"
        return 1
    fi
}

# Fonction principale
main() {
    log "🚀 =========================================="
    log "🚀 Démarrage du monitoring automatique"
    log "🚀 =========================================="
    
    local success_count=0
    local total_functions=2
    
    # 1. Vérifier les alertes automatiques
    log "🚨 Vérification des alertes automatiques..."
    if call_function "payment-alerts-monitor"; then
        ((success_count++))
        log "📊 Alertes: Vérification terminée"
    else
        log "⚠️ Alertes: Problème détecté"
    fi
    
    echo ""
    
    # 2. Mettre à jour le dashboard (pour forcer le calcul des statistiques)
    log "📈 Mise à jour du dashboard de monitoring..."
    if call_function "payment-dashboard"; then
        ((success_count++))
        log "📊 Dashboard: Mise à jour réussie"
    else
        log "⚠️ Dashboard: Problème de mise à jour"
    fi
    
    echo ""
    
    # 3. Vérifier la santé du système de paiement Wave
    log "🔍 Vérification de la santé du système Wave..."
    wave_response=$(call_function "check-wave-status" 2>/dev/null || echo "")
    if [ $? -eq 0 ]; then
        log "💚 Système Wave: Opérationnel"
    else
        log "🟡 Système Wave: Vérification impossible ou aucune facture en attente"
    fi
    
    echo ""
    
    # Résumé final
    log "📋 =========================================="
    log "📋 RÉSUMÉ DU MONITORING"
    log "📋 =========================================="
    log "✅ Fonctions réussies: $success_count/$total_functions"
    log "🕐 Heure de fin: $(date '+%Y-%m-%d %H:%M:%S')"
    
    if [ $success_count -eq $total_functions ]; then
        log "🎉 Monitoring complet: SUCCÈS"
        exit 0
    else
        log "⚠️ Monitoring complet: PROBLÈMES DÉTECTÉS"
        exit 1
    fi
}

# Vérification des dépendances
check_dependencies() {
    local missing_deps=()
    
    if ! command -v curl &> /dev/null; then
        missing_deps+=("curl")
    fi
    
    if ! command -v jq &> /dev/null; then
        log "⚠️ jq n'est pas installé - les réponses JSON ne seront pas formatées"
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log "❌ Dépendances manquantes: ${missing_deps[*]}"
        log "💡 Installer avec: sudo apt-get install ${missing_deps[*]} (Ubuntu/Debian)"
        log "💡 Ou avec: brew install ${missing_deps[*]} (macOS)"
        exit 1
    fi
}

# Gestion des signaux
cleanup() {
    log "🛑 Arrêt du monitoring (signal reçu)"
    exit 1
}

trap cleanup SIGTERM SIGINT

# Point d'entrée principal
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    # Créer le fichier de log s'il n'existe pas
    touch "$LOG_FILE"
    
    # Rotation des logs (garder seulement les 1000 dernières lignes)
    if [ -f "$LOG_FILE" ] && [ $(wc -l < "$LOG_FILE") -gt 1000 ]; then
        tail -n 500 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
        log "🔄 Rotation des logs effectuée"
    fi
    
    # Vérifier les dépendances
    check_dependencies
    
    # Exécuter le monitoring
    main "$@"
fi
