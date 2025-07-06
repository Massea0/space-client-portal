# test-sentiment-analysis-complete.ps1 - Test complet du système d'analyse de sentiment

Write-Host "🧪 Test complet du système d'analyse de sentiment" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$SUPABASE_URL = "https://qlqgyrfqiflnqknbtycw.supabase.co"
$SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDI0NTEsImV4cCI6MjA2NTY3ODQ1MX0.ODLjlo-8mvt_Y75LETySScpOQui-MaCBrszWRA2oyrE"

Write-Host "🔧 Vérification de l'environnement..." -ForegroundColor Yellow

# Test de connexion de base
$headers = @{
    'apikey' = $SUPABASE_ANON_KEY
    'Authorization' = "Bearer $SUPABASE_ANON_KEY"
    'Content-Type' = 'application/json'
}

try {
    Write-Host "🌐 Test de connexion à Supabase..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/" -Headers $headers -Method Get -ErrorAction Stop
    Write-Host "✅ Connexion Supabase réussie" -ForegroundColor Green
    
    # Vérifier les fonctions Edge disponibles
    Write-Host "`n🔍 Vérification des fonctions Edge..." -ForegroundColor Yellow
    
    try {
        # Test de l'endpoint d'analyse de sentiment s'il existe
        $sentimentTestData = @{
            text = "Ce message de test devrait avoir un sentiment neutre"
        } | ConvertTo-Json
        
        $sentimentResponse = Invoke-RestMethod -Uri "$SUPABASE_URL/functions/v1/analyze-sentiment" -Headers $headers -Method Post -Body $sentimentTestData -ErrorAction SilentlyContinue
        
        if ($sentimentResponse) {
            Write-Host "✅ Fonction d'analyse de sentiment disponible" -ForegroundColor Green
            Write-Host "📊 Résultat du test: $($sentimentResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Cyan
        } else {
            Write-Host "⚠️  Fonction d'analyse de sentiment non trouvée" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Fonction d'analyse de sentiment non accessible: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    Write-Host "`n📋 Suggestions pour configurer l'analyse de sentiment:" -ForegroundColor Cyan
    Write-Host "1. Créer les tables nécessaires (tickets, ticket_messages)" -ForegroundColor White
    Write-Host "2. Déployer la fonction Edge d'analyse de sentiment" -ForegroundColor White
    Write-Host "3. Configurer les triggers de base de données" -ForegroundColor White
    Write-Host "4. Configurer les permissions RLS appropriées" -ForegroundColor White
    
    Write-Host "`n💡 Commandes à exécuter pour le setup complet:" -ForegroundColor Yellow
    Write-Host "supabase functions deploy analyze-sentiment" -ForegroundColor Gray
    Write-Host "supabase db push" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Erreur de connexion à Supabase: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔧 Vérifiez la configuration de SUPABASE_URL et SUPABASE_ANON_KEY" -ForegroundColor Yellow
}

# Vérifier si on peut accéder aux logs
Write-Host "`n📊 État de l'implémentation actuelle:" -ForegroundColor Cyan

$implementationChecks = @(
    @{ Name = "Tables de tickets"; Status = "À créer/configurer" },
    @{ Name = "Fonction d'analyse de sentiment"; Status = "À déployer" },
    @{ Name = "Triggers automatiques"; Status = "À configurer" },
    @{ Name = "Interface utilisateur"; Status = "À implémenter" }
)

foreach ($check in $implementationChecks) {
    Write-Host "  ◯ $($check.Name): $($check.Status)" -ForegroundColor White
}

Write-Host "`n🎯 Prochaines étapes recommandées:" -ForegroundColor Green
Write-Host "1. Créer le schéma de base de données pour les tickets" -ForegroundColor White
Write-Host "2. Implémenter la fonction Edge d'analyse de sentiment" -ForegroundColor White
Write-Host "3. Configurer les triggers automatiques" -ForegroundColor White
Write-Host "4. Tester avec des données réelles" -ForegroundColor White

Write-Host "`n✅ Diagnostic terminé" -ForegroundColor Green
