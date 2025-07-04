# ===============================================================
# SCRIPT D'EXÉCUTION - CORRECTION RLS URGENTE
# ===============================================================
# Ce script guide l'exécution de la correction RLS dans Supabase
# ===============================================================

Write-Host "🚨 CORRECTION URGENTE - RÉCURSION INFINIE RLS" -ForegroundColor Red
Write-Host "=" * 60 -ForegroundColor Yellow

Write-Host "📋 ÉTAPES À SUIVRE :" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Ouvrir Supabase Dashboard" -ForegroundColor Green
Write-Host "   - Aller sur https://supabase.com/dashboard" -ForegroundColor White
Write-Host "   - Sélectionner votre projet" -ForegroundColor White
Write-Host ""

Write-Host "2️⃣  Accéder au SQL Editor" -ForegroundColor Green  
Write-Host "   - Cliquer sur 'SQL Editor' dans le menu latéral" -ForegroundColor White
Write-Host "   - Créer un nouveau query" -ForegroundColor White
Write-Host ""

Write-Host "3️⃣  Copier et exécuter le script SQL" -ForegroundColor Green
Write-Host "   - Ouvrir le fichier: CORRECTION_URGENTE_RLS_RECURSION.sql" -ForegroundColor White
Write-Host "   - Copier tout le contenu" -ForegroundColor White
Write-Host "   - Coller dans Supabase SQL Editor" -ForegroundColor White
Write-Host "   - Cliquer sur 'Run' (ou Ctrl+Enter)" -ForegroundColor White
Write-Host ""

Write-Host "4️⃣  Vérifier le résultat" -ForegroundColor Green
Write-Host "   - Le script doit s'exécuter sans erreur" -ForegroundColor White
Write-Host "   - Voir la ligne 'TEST RLS' avec le nombre d'employés" -ForegroundColor White
Write-Host ""

Write-Host "📁 FICHIERS UTILISÉS :" -ForegroundColor Cyan
Write-Host "   ✅ CORRECTION_URGENTE_RLS_RECURSION.sql (script principal)" -ForegroundColor White
Write-Host "   🛡️ DESACTIVER_RLS_URGENCE.sql (plan B si problème)" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  SI PROBLÈME PERSISTE :" -ForegroundColor Yellow
Write-Host "   - Exécuter DESACTIVER_RLS_URGENCE.sql" -ForegroundColor White
Write-Host "   - Cela désactive complètement RLS temporairement" -ForegroundColor White
Write-Host ""

Write-Host "🎯 OBJECTIF :" -ForegroundColor Cyan
Write-Host "   Éliminer l'erreur 'infinite recursion detected in policy'" -ForegroundColor White
Write-Host "   Permettre l'accès aux données RH depuis l'application" -ForegroundColor White
Write-Host ""

Write-Host "=" * 60 -ForegroundColor Yellow
Write-Host "📞 Prêt ? Appuyez sur une touche pour continuer..." -ForegroundColor Green
Read-Host

# Ouvrir le fichier SQL pour faciliter la copie
Write-Host "🔄 Ouverture du fichier SQL..." -ForegroundColor Blue
$sqlFile = ".\CORRECTION_URGENTE_RLS_RECURSION.sql"
if (Test-Path $sqlFile) {
    Start-Process notepad.exe $sqlFile
    Write-Host "✅ Fichier ouvert dans Notepad" -ForegroundColor Green
} else {
    Write-Host "❌ Fichier SQL introuvable: $sqlFile" -ForegroundColor Red
    Write-Host "Assurez-vous d'être dans le bon répertoire" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 ÉTAPES POST-EXÉCUTION :" -ForegroundColor Cyan
Write-Host "1. Vérifier que le script s'exécute sans erreur" -ForegroundColor White
Write-Host "2. Noter le nombre d'employés affiché" -ForegroundColor White
Write-Host "3. Revenir ici pour tester l'application" -ForegroundColor White
Write-Host ""
Write-Host "Terminé ? Appuyez sur Entrée..." -ForegroundColor Green
Read-Host

Write-Host "🚀 PROCHAINE ÉTAPE: TEST DE L'APPLICATION" -ForegroundColor Green
Write-Host "Démarrage du serveur de développement..." -ForegroundColor Blue

# Démarrer l'application pour test
npm run dev
