# Script PowerShell pour récupérer les informations complètes de Supabase
# Sans avoir besoin du mot de passe de la base de données

# Charger les variables d'environnement
$envContent = Get-Content -Path ".\.env.supabase"
$supabaseUrl = ($envContent | Where-Object { $_ -match "SUPABASE_URL=" }) -replace "SUPABASE_URL=",""
$supabaseServiceRoleKey = ($envContent | Where-Object { $_ -match "SUPABASE_SERVICE_ROLE_KEY=" }) -replace "SUPABASE_SERVICE_ROLE_KEY=",""
$supabaseProjectRef = ($envContent | Where-Object { $_ -match "SUPABASE_PROJECT_REF=" }) -replace "SUPABASE_PROJECT_REF=",""

Write-Host "=== SYNTHÈSE COMPLÈTE DU PROJET SUPABASE ===" -ForegroundColor Cyan
Write-Host "Projet: $supabaseProjectRef" -ForegroundColor Yellow
Write-Host "URL: $supabaseUrl" -ForegroundColor Yellow
Write-Host ""

# 1. Edge Functions déployées
Write-Host "=== 1. EDGE FUNCTIONS DÉPLOYÉES ===" -ForegroundColor Green
try {
    $functionsOutput = supabase functions list 2>&1
    Write-Host $functionsOutput
} catch {
    Write-Host "Erreur lors de la récupération des functions: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== 2. SECRETS ET VARIABLES D'ENVIRONNEMENT ===" -ForegroundColor Green
try {
    $secretsOutput = supabase secrets list 2>&1
    Write-Host $secretsOutput
} catch {
    Write-Host "Erreur lors de la récupération des secrets: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== 3. FICHIERS DE MIGRATION SQL LOCAUX ===" -ForegroundColor Green
Get-ChildItem -Path ".\supabase\migrations" -Filter "*.sql" | ForEach-Object {
    Write-Host "📄 $($_.Name)" -ForegroundColor Cyan
    Write-Host "   Taille: $([math]::Round($_.Length/1KB, 2)) KB"
    Write-Host "   Modifié: $($_.LastWriteTime)"
    
    # Afficher un aperçu du contenu
    $content = Get-Content -Path $_.FullName -TotalCount 5
    Write-Host "   Aperçu:" -ForegroundColor DarkGray
    $content | ForEach-Object { Write-Host "   > $_" -ForegroundColor DarkGray }
    Write-Host ""
}

Write-Host ""
Write-Host "=== 4. STRUCTURE DES EDGE FUNCTIONS LOCALES ===" -ForegroundColor Green
Get-ChildItem -Path ".\supabase\functions" -Directory | Where-Object { $_.Name -notlike "_*" } | ForEach-Object {
    Write-Host "🔧 $($_.Name)" -ForegroundColor Yellow
    $indexFile = Join-Path $_.FullName "index.ts"
    if (Test-Path $indexFile) {
        $content = Get-Content -Path $indexFile -TotalCount 10
        $description = $content | Where-Object { $_ -match "^//|^/\*" } | Select-Object -First 3
        if ($description) {
            $description | ForEach-Object { Write-Host "   $_" -ForegroundColor DarkGray }
        }
    }
    Write-Host ""
}

Write-Host ""
Write-Host "=== 5. SCHÉMAS DE TABLES (EXTRAITS DES MIGRATIONS) ===" -ForegroundColor Green
Get-ChildItem -Path ".\supabase\migrations" -Filter "*.sql" | ForEach-Object {
    $content = Get-Content -Path $_.FullName
    $createTableLines = $content | Where-Object { $_ -match "CREATE TABLE|ALTER TABLE|CREATE INDEX" }
    if ($createTableLines) {
        Write-Host "📋 Tables dans $($_.Name):" -ForegroundColor Cyan
        $createTableLines | ForEach-Object { 
            if ($_ -match "CREATE TABLE\s+(\w+\.)?(\w+)") {
                Write-Host "   🗂️  TABLE: $($Matches[2])" -ForegroundColor Green
            } elseif ($_ -match "ALTER TABLE\s+(\w+\.)?(\w+)") {
                Write-Host "   ⚙️   ALTER: $($Matches[2])" -ForegroundColor Yellow
            } elseif ($_ -match "CREATE INDEX\s+\w+\s+ON\s+(\w+\.)?(\w+)") {
                Write-Host "   📇  INDEX: $($Matches[2])" -ForegroundColor Blue
            }
        }
        Write-Host ""
    }
}

Write-Host ""
Write-Host "=== 6. RÈGLES RLS (EXTRAITS DES MIGRATIONS) ===" -ForegroundColor Green
Get-ChildItem -Path ".\supabase\migrations" -Filter "*.sql" | ForEach-Object {
    $content = Get-Content -Path $_.FullName
    $rlsLines = $content | Where-Object { $_ -match "CREATE POLICY|ALTER TABLE.*ENABLE ROW LEVEL SECURITY" }
    if ($rlsLines) {
        Write-Host "🔒 RLS dans $($_.Name):" -ForegroundColor Cyan
        $rlsLines | ForEach-Object { 
            if ($_ -match "ENABLE ROW LEVEL SECURITY") {
                Write-Host "   🛡️  RLS ENABLED: $_" -ForegroundColor Green
            } elseif ($_ -match 'CREATE POLICY "([^"]+)"') {
                Write-Host "   🔐  POLICY: $($Matches[1])" -ForegroundColor Yellow
            }
        }
        Write-Host ""
    }
}

Write-Host ""
Write-Host "=== 7. RÉSUMÉ DES FONCTIONNALITÉS IA ===" -ForegroundColor Green
$aiFunctions = @(
    "ai-payment-prediction",
    "ai-quote-optimization", 
    "ticket-sentiment-analysis",
    "recommend-services",
    "analyze-contract-compliance",
    "generate-contract-draft",
    "dynamic-content-generator",
    "client-relationship-summary"
)

$aiFunctions | ForEach-Object {
    $functionPath = ".\supabase\functions\$_\index.ts"
    if (Test-Path $functionPath) {
        Write-Host "🤖 $_" -ForegroundColor Magenta
        $content = Get-Content -Path $functionPath -TotalCount 20
        $description = $content | Where-Object { $_ -match "^//|^/\*" } | Select-Object -First 2
        if ($description) {
            $description | ForEach-Object { Write-Host "   $_" -ForegroundColor DarkGray }
        }
        
        # Vérifier si Gemini est utilisé
        $hasGemini = (Get-Content -Path $functionPath) -match "GeminiClient|gemini|GEMINI"
        if ($hasGemini) {
            Write-Host "   ✨ Utilise l'IA Gemini" -ForegroundColor Green
        }
        Write-Host ""
    }
}

Write-Host ""
Write-Host "=== 8. ÉTAT DU PROJET ===" -ForegroundColor Green
Write-Host "📊 Edge Functions actives: $(($functionsOutput -split "`n" | Where-Object { $_ -match "ACTIVE" }).Count)" -ForegroundColor Cyan
Write-Host "🗄️  Fichiers de migration: $(Get-ChildItem -Path ".\supabase\migrations" -Filter "*.sql" | Measure-Object | Select-Object -ExpandProperty Count)" -ForegroundColor Cyan
Write-Host "🤖 Fonctions IA: $($aiFunctions.Count)" -ForegroundColor Cyan
Write-Host "🔐 Variables d'environnement: $(($secretsOutput -split "`n" | Where-Object { $_ -match "\|" -and $_ -notmatch "NAME" -and $_ -notmatch "---" }).Count)" -ForegroundColor Cyan

Write-Host ""
Write-Host "=== RAPPORT TERMINÉ ===" -ForegroundColor Cyan
Write-Host "Toutes les informations ont été collectées avec succès !" -ForegroundColor Green
