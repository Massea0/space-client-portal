# Script PowerShell pour récupérer les informations complètes de Supabase
# Version corrigée sans erreurs de syntaxe

# Vérifier si le fichier .env.supabase existe
if (-not (Test-Path ".\.env.supabase")) {
    Write-Host "Fichier .env.supabase non trouvé. Utilisation des variables d'environnement par défaut." -ForegroundColor Yellow
    $supabaseUrl = $env:VITE_SUPABASE_URL
    $supabaseProjectRef = "N/A"
} else {
    # Charger les variables d'environnement
    $envContent = Get-Content -Path ".\.env.supabase"
    $supabaseUrl = ($envContent | Where-Object { $_ -match "SUPABASE_URL=" }) -replace "SUPABASE_URL=",""
    $supabaseServiceRoleKey = ($envContent | Where-Object { $_ -match "SUPABASE_SERVICE_ROLE_KEY=" }) -replace "SUPABASE_SERVICE_ROLE_KEY=",""
    $supabaseProjectRef = ($envContent | Where-Object { $_ -match "SUPABASE_PROJECT_REF=" }) -replace "SUPABASE_PROJECT_REF=",""
}

Write-Host "=== SYNTHESE COMPLETE DU PROJET SUPABASE ===" -ForegroundColor Cyan
Write-Host "Projet: $supabaseProjectRef" -ForegroundColor Yellow
Write-Host "URL: $supabaseUrl" -ForegroundColor Yellow
Write-Host ""

# 1. Edge Functions déployées
Write-Host "=== 1. EDGE FUNCTIONS DEPLOYEES ===" -ForegroundColor Green
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
if (Test-Path ".\supabase\migrations") {
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
} else {
    Write-Host "Dossier migrations non trouvé" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== 4. STRUCTURE DES EDGE FUNCTIONS LOCALES ===" -ForegroundColor Green
if (Test-Path ".\supabase\functions") {
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
} else {
    Write-Host "Dossier functions non trouvé" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== 5. SCHEMAS DE TABLES (EXTRAITS DES MIGRATIONS) ===" -ForegroundColor Green
if (Test-Path ".\supabase\migrations") {
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
}

Write-Host ""
Write-Host "=== 6. REGLES RLS (EXTRAITS DES MIGRATIONS) ===" -ForegroundColor Green
if (Test-Path ".\supabase\migrations") {
    Get-ChildItem -Path ".\supabase\migrations" -Filter "*.sql" | ForEach-Object {
        $content = Get-Content -Path $_.FullName
        $rlsLines = $content | Where-Object { $_ -match "CREATE POLICY|ALTER TABLE.*ENABLE ROW LEVEL SECURITY" }
        if ($rlsLines) {
            Write-Host "🔒 RLS dans $($_.Name):" -ForegroundColor Cyan
            $rlsLines | ForEach-Object { 
                if ($_ -match "ENABLE ROW LEVEL SECURITY") {
                    Write-Host "   🛡️  RLS ENABLED: $_" -ForegroundColor Green
                } elseif ($_ -match "CREATE POLICY") {
                    $policyName = $_ -replace '.*CREATE POLICY\s+"?([^"]+)"?.*', '$1'
                    Write-Host "   🔐  POLICY: $policyName" -ForegroundColor Yellow
                }
            }
            Write-Host ""
        }
    }
}

Write-Host ""
Write-Host "=== 7. RESUME DES FONCTIONNALITES IA ===" -ForegroundColor Green
$aiFunctions = @(
    "ai-payment-prediction",
    "ai-quote-optimization", 
    "ticket-sentiment-analysis",
    "recommend-services",
    "analyze-contract-compliance",
    "generate-contract-draft",
    "dynamic-content-generator",
    "client-relationship-summary",
    "project-planner-ai"
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
Write-Host "=== 8. ETAT DU PROJET ===" -ForegroundColor Green
$migrationCount = 0
if (Test-Path ".\supabase\migrations") {
    $migrationCount = (Get-ChildItem -Path ".\supabase\migrations" -Filter "*.sql" | Measure-Object).Count
}
$functionCount = 0
if (Test-Path ".\supabase\functions") {
    $functionCount = (Get-ChildItem -Path ".\supabase\functions" -Directory | Where-Object { $_.Name -notlike "_*" } | Measure-Object).Count
}

Write-Host "🗄️  Fichiers de migration: $migrationCount" -ForegroundColor Cyan
Write-Host "🔧 Edge Functions locales: $functionCount" -ForegroundColor Cyan
Write-Host "🤖 Fonctions IA: $($aiFunctions.Count)" -ForegroundColor Cyan

Write-Host ""
Write-Host "=== 9. ETAT COMPLET DES TABLES ===" -ForegroundColor Green

# Analyser toutes les migrations pour extraire les schémas de tables
$allTables = @{}
$tableStructures = @{}

if (Test-Path ".\supabase\migrations") {
    Write-Host "Analyse des schémas de tables dans les migrations..." -ForegroundColor Yellow
    Write-Host ""
    
    Get-ChildItem -Path ".\supabase\migrations" -Filter "*.sql" | Sort-Object Name | ForEach-Object {
        $migrationFile = $_
        $content = Get-Content -Path $migrationFile.FullName
        
        # Rechercher les CREATE TABLE
        $inCreateTable = $false
        $currentTable = ""
        $currentTableDef = @()
        
        foreach ($line in $content) {
            # Détection du début d'un CREATE TABLE
            if ($line -match 'CREATE TABLE\s+(IF\s+NOT\s+EXISTS\s+)?["`]?(\w+)["`]?\s*\.["`]?(\w+)["`]?\s*\(' -or 
                $line -match 'CREATE TABLE\s+(IF\s+NOT\s+EXISTS\s+)?["`]?(\w+)["`]?\s*\(') {
                
                $inCreateTable = $true
                if ($Matches[3]) {
                    $currentTable = $Matches[3]  # Schema.table format
                } else {
                    $currentTable = $Matches[2]  # Simple table format
                }
                $currentTableDef = @()
                $currentTableDef += $line
                
                if (-not $allTables.ContainsKey($currentTable)) {
                    $allTables[$currentTable] = @{
                        "migration" = $migrationFile.Name
                        "columns" = @()
                        "indexes" = @()
                        "policies" = @()
                    }
                }
            }
            # Détection de la fin du CREATE TABLE
            elseif ($inCreateTable -and $line -match '^\s*\)\s*;?\s*$') {
                $inCreateTable = $false
                $currentTableDef += $line
                $tableStructures[$currentTable] = $currentTableDef -join "`n"
            }
            # Collecte des définitions de colonnes
            elseif ($inCreateTable) {
                $currentTableDef += $line
                # Extraire les colonnes
                if ($line -match '^\s*["`]?(\w+)["`]?\s+(\w+)') {
                    $columnName = $Matches[1]
                    $columnType = $Matches[2]
                    if ($columnName -notin @("CONSTRAINT", "PRIMARY", "FOREIGN", "UNIQUE", "CHECK")) {
                        $allTables[$currentTable]["columns"] += "$columnName ($columnType)"
                    }
                }
            }
            # Rechercher les INDEX
            elseif ($line -match 'CREATE\s+(UNIQUE\s+)?INDEX\s+(\w+)\s+ON\s+.*["`]?(\w+)["`]?') {
                $indexName = $Matches[2]
                $tableName = $Matches[3]
                if ($allTables.ContainsKey($tableName)) {
                    $indexType = if ($Matches[1]) { "UNIQUE INDEX" } else { "INDEX" }
                    $allTables[$tableName]["indexes"] += "$indexType: $indexName"
                }
            }
            # Rechercher les POLICIES
            elseif ($line -match 'CREATE POLICY\s+["`]?([^"`]+)["`]?\s+ON\s+.*["`]?(\w+)["`]?') {
                $policyName = $Matches[1]
                $tableName = $Matches[2]
                if ($allTables.ContainsKey($tableName)) {
                    $allTables[$tableName]["policies"] += $policyName
                }
            }
        }
    }
    
    # Afficher le résumé des tables
    Write-Host "=== RESUME DES TABLES TROUVEES ===" -ForegroundColor Cyan
    Write-Host "Nombre total de tables: $($allTables.Count)" -ForegroundColor Yellow
    Write-Host ""
    
    # Afficher chaque table avec ses détails
    $allTables.GetEnumerator() | Sort-Object Name | ForEach-Object {
        $tableName = $_.Key
        $tableInfo = $_.Value
        
        Write-Host "📋 TABLE: $tableName" -ForegroundColor Green
        Write-Host "   📄 Migration: $($tableInfo.migration)" -ForegroundColor Gray
        
        if ($tableInfo.columns.Count -gt 0) {
            Write-Host "   🗂️  Colonnes ($($tableInfo.columns.Count)):" -ForegroundColor Blue
            $tableInfo.columns | ForEach-Object { Write-Host "      - $_" -ForegroundColor DarkCyan }
        }
        
        if ($tableInfo.indexes.Count -gt 0) {
            Write-Host "   📇 Index ($($tableInfo.indexes.Count)):" -ForegroundColor Yellow
            $tableInfo.indexes | ForEach-Object { Write-Host "      - $_" -ForegroundColor DarkYellow }
        }
        
        if ($tableInfo.policies.Count -gt 0) {
            Write-Host "   🔐 Policies RLS ($($tableInfo.policies.Count)):" -ForegroundColor Magenta
            $tableInfo.policies | ForEach-Object { Write-Host "      - $_" -ForegroundColor DarkMagenta }
        }
        
        Write-Host ""
    }
    
    # Statistiques générales
    Write-Host "=== STATISTIQUES TABLES ===" -ForegroundColor Cyan
    $totalColumns = ($allTables.Values | ForEach-Object { $_.columns.Count } | Measure-Object -Sum).Sum
    $totalIndexes = ($allTables.Values | ForEach-Object { $_.indexes.Count } | Measure-Object -Sum).Sum
    $totalPolicies = ($allTables.Values | ForEach-Object { $_.policies.Count } | Measure-Object -Sum).Sum
    
    Write-Host "📊 Total colonnes: $totalColumns" -ForegroundColor Green
    Write-Host "📇 Total index: $totalIndexes" -ForegroundColor Yellow
    Write-Host "🔐 Total policies RLS: $totalPolicies" -ForegroundColor Magenta
    
    # Identifier les tables pour le module RH
    Write-Host ""
    Write-Host "=== TABLES EXISTANTES PAR MODULE ===" -ForegroundColor Cyan
    
    $coreTabes = @("users", "app_settings", "companies")
    $businessTables = @("invoices", "quotes", "projects", "tasks") 
    $hrTables = @("employees", "departments", "positions", "contracts", "employee_documents")
    $paymentTables = @("payment_transactions", "payment_alerts")
    
    Write-Host "🏗️  Tables Core:" -ForegroundColor Blue
    $coreTabes | ForEach-Object {
        if ($allTables.ContainsKey($_)) {
            Write-Host "   ✅ $_" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $_" -ForegroundColor Red
        }
    }
    
    Write-Host "💼 Tables Business:" -ForegroundColor Blue
    $businessTables | ForEach-Object {
        if ($allTables.ContainsKey($_)) {
            Write-Host "   ✅ $_" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $_" -ForegroundColor Red
        }
    }
    
    Write-Host "👥 Tables RH (à créer):" -ForegroundColor Blue
    $hrTables | ForEach-Object {
        if ($allTables.ContainsKey($_)) {
            Write-Host "   ✅ $_ (EXISTE DÉJÀ)" -ForegroundColor Green
        } else {
            Write-Host "   ⏳ $_ (À CRÉER)" -ForegroundColor Yellow
        }
    }
    
    Write-Host "💳 Tables Paiement:" -ForegroundColor Blue
    $paymentTables | ForEach-Object {
        if ($allTables.ContainsKey($_)) {
            Write-Host "   ✅ $_" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $_" -ForegroundColor Red
        }
    }
}

Write-Host ""

# ...existing code...
