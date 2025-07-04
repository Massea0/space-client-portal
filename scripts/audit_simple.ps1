# Script PowerShell simplifie pour audit Supabase
# Version sans caracteres speciaux problematiques

Write-Host "=== AUDIT SUPABASE ENTERPRISE OS ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verifier la structure des dossiers
Write-Host "=== 1. STRUCTURE DU PROJET ===" -ForegroundColor Green
Write-Host "Repertoire actuel: $(Get-Location)"

if (Test-Path ".\supabase") {
    Write-Host "Dossier supabase: TROUVE" -ForegroundColor Green
} else {
    Write-Host "Dossier supabase: NON TROUVE" -ForegroundColor Red
}

if (Test-Path ".\supabase\migrations") {
    Write-Host "Dossier migrations: TROUVE" -ForegroundColor Green
} else {
    Write-Host "Dossier migrations: NON TROUVE" -ForegroundColor Red
}

if (Test-Path ".\supabase\functions") {
    Write-Host "Dossier functions: TROUVE" -ForegroundColor Green
} else {
    Write-Host "Dossier functions: NON TROUVE" -ForegroundColor Red
}

Write-Host ""

# 2. Lister les migrations SQL
Write-Host "=== 2. FICHIERS DE MIGRATION SQL ===" -ForegroundColor Green
if (Test-Path ".\supabase\migrations") {
    $migrations = Get-ChildItem -Path ".\supabase\migrations" -Filter "*.sql"
    Write-Host "Nombre de migrations: $($migrations.Count)"
    Write-Host ""
    
    foreach ($migration in $migrations) {
        Write-Host "Migration: $($migration.Name)" -ForegroundColor Cyan
        Write-Host "  Taille: $([math]::Round($migration.Length/1KB, 2)) KB"
        Write-Host "  Date: $($migration.LastWriteTime.ToString('yyyy-MM-dd HH:mm'))"
        
        # Lire les premieres lignes pour identifier le contenu
        $content = Get-Content -Path $migration.FullName -TotalCount 10
        $tableCreations = $content | Where-Object { $_ -match "CREATE TABLE" }
        if ($tableCreations) {
            Write-Host "  Tables:" -ForegroundColor Yellow
            foreach ($table in $tableCreations) {
                if ($table -match "CREATE TABLE\s+(\w+)") {
                    Write-Host "    - $($Matches[1])" -ForegroundColor Green
                }
            }
        }
        Write-Host ""
    }
} else {
    Write-Host "Aucun fichier de migration trouve"
}

# 3. Lister les Edge Functions
Write-Host "=== 3. EDGE FUNCTIONS LOCALES ===" -ForegroundColor Green
if (Test-Path ".\supabase\functions") {
    $functions = Get-ChildItem -Path ".\supabase\functions" -Directory | Where-Object { $_.Name -notlike "_*" }
    Write-Host "Nombre de functions: $($functions.Count)"
    Write-Host ""
    
    foreach ($func in $functions) {
        Write-Host "Function: $($func.Name)" -ForegroundColor Yellow
        
        $indexFile = Join-Path $func.FullName "index.ts"
        if (Test-Path $indexFile) {
            Write-Host "  Fichier index.ts: TROUVE" -ForegroundColor Green
            
            # Verifier si c'est une fonction IA
            $content = Get-Content -Path $indexFile
            $hasGemini = $content | Where-Object { $_ -match "gemini|Gemini|GEMINI" }
            $hasOpenAI = $content | Where-Object { $_ -match "openai|OpenAI" }
            
            if ($hasGemini) {
                Write-Host "  Type: IA (Gemini)" -ForegroundColor Magenta
            } elseif ($hasOpenAI) {
                Write-Host "  Type: IA (OpenAI)" -ForegroundColor Magenta
            } else {
                Write-Host "  Type: Standard" -ForegroundColor Blue
            }
        } else {
            Write-Host "  Fichier index.ts: NON TROUVE" -ForegroundColor Red
        }
        Write-Host ""
    }
} else {
    Write-Host "Aucune function trouvee"
}

# 4. Analyser package.json pour les dependances
Write-Host "=== 4. DEPENDANCES PROJET ===" -ForegroundColor Green
if (Test-Path ".\package.json") {
    $packageJson = Get-Content -Path ".\package.json" | ConvertFrom-Json
    Write-Host "Nom du projet: $($packageJson.name)"
    Write-Host "Version: $($packageJson.version)"
    
    Write-Host ""
    Write-Host "Dependances principales:"
    $mainDeps = @("react", "typescript", "vite", "@supabase/supabase-js", "tailwindcss")
    foreach ($dep in $mainDeps) {
        if ($packageJson.dependencies.$dep) {
            Write-Host "  $dep : $($packageJson.dependencies.$dep)" -ForegroundColor Green
        } elseif ($packageJson.devDependencies.$dep) {
            Write-Host "  $dep : $($packageJson.devDependencies.$dep) (dev)" -ForegroundColor Yellow
        } else {
            Write-Host "  $dep : NON INSTALLE" -ForegroundColor Red
        }
    }
} else {
    Write-Host "package.json non trouve"
}

Write-Host ""

# 5. Verifier les variables d'environnement
Write-Host "=== 5. CONFIGURATION ENVIRONNEMENT ===" -ForegroundColor Green
$envFiles = @(".env", ".env.local", ".env.supabase")
foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        Write-Host "$envFile : TROUVE" -ForegroundColor Green
        $envContent = Get-Content -Path $envFile
        $supabaseVars = $envContent | Where-Object { $_ -match "SUPABASE|VITE_SUPABASE" }
        Write-Host "  Variables Supabase: $($supabaseVars.Count)"
    } else {
        Write-Host "$envFile : NON TROUVE" -ForegroundColor Yellow
    }
}

Write-Host ""

# 6. Executer commandes Supabase si possible
Write-Host "=== 6. ETAT SUPABASE CLI ===" -ForegroundColor Green
try {
    $supabaseStatus = supabase status 2>&1
    Write-Host "Commande supabase status:"
    Write-Host $supabaseStatus
} catch {
    Write-Host "Erreur supabase CLI: $_" -ForegroundColor Red
}

Write-Host ""
try {
    $supabaseFunctions = supabase functions list 2>&1
    Write-Host "Functions deployees:"
    Write-Host $supabaseFunctions
} catch {
    Write-Host "Erreur liste functions: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== RESUME AUDIT ===" -ForegroundColor Cyan
Write-Host "Audit termine avec succes !" -ForegroundColor Green
