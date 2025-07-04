# Script PowerShell pour analyser toutes les tables dans les migrations
# Version simplifiee sans caracteres speciaux

Write-Host "=== ANALYSE COMPLETE DES TABLES SUPABASE ===" -ForegroundColor Cyan
Write-Host ""

$allTables = @{}

if (Test-Path ".\supabase\migrations") {
    Write-Host "=== ANALYSE DES MIGRATIONS SQL ===" -ForegroundColor Green
    Write-Host ""
    
    # Parcourir toutes les migrations
    Get-ChildItem -Path ".\supabase\migrations" -Filter "*.sql" | Sort-Object Name | ForEach-Object {
        $migrationFile = $_
        Write-Host "Analyse de: $($migrationFile.Name)" -ForegroundColor Yellow
        
        $content = Get-Content -Path $migrationFile.FullName
        
        # Rechercher CREATE TABLE
        $createTablePattern = 'CREATE TABLE.*?(\w+)\s*\('
        foreach ($line in $content) {
            if ($line -match $createTablePattern) {
                $tableName = ""
                
                # Essayer differents patterns pour extraire le nom de table
                if ($line -match 'CREATE TABLE\s+IF\s+NOT\s+EXISTS\s+public\.(\w+)') {
                    $tableName = $Matches[1]
                } elseif ($line -match 'CREATE TABLE\s+public\.(\w+)') {
                    $tableName = $Matches[1]
                } elseif ($line -match 'CREATE TABLE\s+(\w+)') {
                    $tableName = $Matches[1]
                }
                
                if ($tableName -and $tableName -ne "") {
                    if (-not $allTables.ContainsKey($tableName)) {
                        $allTables[$tableName] = @{
                            "migration" = $migrationFile.Name
                            "found" = $true
                        }
                    }
                    Write-Host "  TABLE trouvee: $tableName" -ForegroundColor Green
                }
            }
        }
        Write-Host ""
    }
    
    Write-Host "=== RESUME DES TABLES TROUVEES ===" -ForegroundColor Cyan
    Write-Host "Nombre total de tables: $($allTables.Count)" -ForegroundColor Yellow
    Write-Host ""
    
    # Lister toutes les tables trouvees
    $allTables.GetEnumerator() | Sort-Object Name | ForEach-Object {
        $tableName = $_.Key
        $tableInfo = $_.Value
        Write-Host "TABLE: $tableName" -ForegroundColor Green
        Write-Host "  Migration: $($tableInfo.migration)" -ForegroundColor Gray
        Write-Host ""
    }
    
    # Analyser par categories
    Write-Host "=== CATEGORISATION DES TABLES ===" -ForegroundColor Cyan
    
    # Tables core system
    Write-Host "TABLES CORE SYSTEM:" -ForegroundColor Blue
    $coreTables = @("users", "app_settings", "companies", "profiles")
    foreach ($table in $coreTables) {
        if ($allTables.ContainsKey($table)) {
            Write-Host "  TROUVE: $table" -ForegroundColor Green
        } else {
            Write-Host "  MANQUE: $table" -ForegroundColor Red
        }
    }
    Write-Host ""
    
    # Tables business
    Write-Host "TABLES BUSINESS:" -ForegroundColor Blue
    $businessTables = @("invoices", "quotes", "projects", "tasks", "companies")
    foreach ($table in $businessTables) {
        if ($allTables.ContainsKey($table)) {
            Write-Host "  TROUVE: $table" -ForegroundColor Green
        } else {
            Write-Host "  MANQUE: $table" -ForegroundColor Red
        }
    }
    Write-Host ""
    
    # Tables RH (a creer)
    Write-Host "TABLES RH (Module a implémenter):" -ForegroundColor Blue
    $hrTables = @("employees", "departments", "positions", "contracts", "employee_documents", "payroll", "attendance", "leave_requests")
    foreach ($table in $hrTables) {
        if ($allTables.ContainsKey($table)) {
            Write-Host "  DEJA EXISTE: $table" -ForegroundColor Green
        } else {
            Write-Host "  A CREER: $table" -ForegroundColor Yellow
        }
    }
    Write-Host ""
    
    # Tables paiement
    Write-Host "TABLES PAIEMENT:" -ForegroundColor Blue
    $paymentTables = @("payment_transactions", "payment_alerts", "webhooks")
    foreach ($table in $paymentTables) {
        if ($allTables.ContainsKey($table)) {
            Write-Host "  TROUVE: $table" -ForegroundColor Green
        } else {
            Write-Host "  MANQUE: $table" -ForegroundColor Red
        }
    }
    Write-Host ""
    
    # Tables IA et analytics
    Write-Host "TABLES IA ET ANALYTICS:" -ForegroundColor Blue
    $aiTables = @("ai_predictions", "analytics_data", "ai_insights", "sentiment_analysis")
    foreach ($table in $aiTables) {
        if ($allTables.ContainsKey($table)) {
            Write-Host "  TROUVE: $table" -ForegroundColor Green
        } else {
            Write-Host "  MANQUE: $table" -ForegroundColor Red
        }
    }
    Write-Host ""
    
} else {
    Write-Host "ERREUR: Dossier migrations non trouve" -ForegroundColor Red
}

# Analyser le schema le plus recent
Write-Host "=== ANALYSE DU SCHEMA LE PLUS RECENT ===" -ForegroundColor Cyan
$latestMigration = Get-ChildItem -Path ".\supabase\migrations" -Filter "*.sql" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($latestMigration) {
    Write-Host "Migration la plus recente: $($latestMigration.Name)" -ForegroundColor Yellow
    Write-Host "Date: $($latestMigration.LastWriteTime)" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Contenu de la migration (premiers lignes):" -ForegroundColor Gray
    $content = Get-Content -Path $latestMigration.FullName -TotalCount 20
    $content | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
}

Write-Host ""
Write-Host "=== RECOMMANDATIONS POUR MODULE RH ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tables RH prioritaires a creer:" -ForegroundColor Yellow
Write-Host "1. employees - Gestion des employes" -ForegroundColor Green
Write-Host "2. departments - Departements/services" -ForegroundColor Green  
Write-Host "3. positions - Postes/fonctions" -ForegroundColor Green
Write-Host "4. contracts - Contrats d'embauche" -ForegroundColor Green
Write-Host ""
Write-Host "L'infrastructure Supabase est prete pour l'integration RH !" -ForegroundColor Green

Write-Host ""
Write-Host "=== ANALYSE TERMINEE ===" -ForegroundColor Cyan
