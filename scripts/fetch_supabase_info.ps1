# Script PowerShell pour récupérer les informations de la base de données Supabase
# Ce script utilise la CLI Supabase à travers Docker

# Récupérer le contenu du fichier .env.supabase
$envContent = Get-Content -Path ".\.env.supabase"

# Extraire les variables
$supabaseUrl = ($envContent | Where-Object { $_ -match "SUPABASE_URL=" }) -replace "SUPABASE_URL=",""
$supabaseAnonKey = ($envContent | Where-Object { $_ -match "SUPABASE_ANON_KEY=" }) -replace "SUPABASE_ANON_KEY=",""
$supabaseServiceRoleKey = ($envContent | Where-Object { $_ -match "SUPABASE_SERVICE_ROLE_KEY=" }) -replace "SUPABASE_SERVICE_ROLE_KEY=",""
$supabaseProjectRef = ($envContent | Where-Object { $_ -match "SUPABASE_PROJECT_REF=" }) -replace "SUPABASE_PROJECT_REF=",""

Write-Host "=== Informations Supabase pour le projet: $supabaseProjectRef ==="
Write-Host ""

Write-Host "=== Liste des Edge Functions déployées ==="
# Pour cette opération, nous avons besoin de l'accès token, que nous n'avons pas encore
# Temporairement, nous allons lister les fichiers dans le répertoire supabase/functions
Write-Host "Edge Functions locales trouvées dans le répertoire supabase/functions :"
Get-ChildItem -Path ".\supabase\functions" -Directory | ForEach-Object { $_.Name }

Write-Host ""
Write-Host "=== Exploration de la structure du dossier edge functions ==="
Get-ChildItem -Path ".\supabase\functions" -Recurse -File | ForEach-Object { $_.FullName -replace [regex]::Escape((Get-Location).Path + "\"), "" }

Write-Host ""
Write-Host "=== Vérification des Edge Functions déployées ==="
Get-ChildItem -Path ".\deployed_edge_functions" -Recurse -File | ForEach-Object { $_.FullName -replace [regex]::Escape((Get-Location).Path + "\"), "" }

Write-Host ""
Write-Host "=== Connexion directe à Supabase via API REST ==="
Write-Host "Obtention de la liste des tables via API REST..."

$headers = @{
    "apikey" = $supabaseAnonKey
    "Authorization" = "Bearer $supabaseServiceRoleKey"
}

try {
    # Cette requête pourrait ne pas fonctionner directement sans module additionnel
    $tablesResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/?apikey=$supabaseAnonKey" -Headers $headers
    Write-Host "Tables trouvées : $($tablesResponse | ConvertTo-Json -Depth 1)"
} catch {
    Write-Host "Erreur lors de la récupération des tables : $_"
}

Write-Host ""
Write-Host "=== Recherche de fichiers de configuration Supabase dans le projet ==="
Get-ChildItem -Path "." -Recurse -Include "*.sql", "supabase.json", "schema.sql" -File | ForEach-Object { $_.FullName -replace [regex]::Escape((Get-Location).Path + "\"), "" }
