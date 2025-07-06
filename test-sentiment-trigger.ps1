# test-sentiment-trigger.ps1 - Tester le trigger d'analyse de sentiment

Write-Host "🧪 Test du trigger d'analyse de sentiment" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$SUPABASE_URL = "https://qlqgyrfqiflnqknbtycw.supabase.co"
$SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDI0NTEsImV4cCI6MjA2NTY3ODQ1MX0.ODLjlo-8mvt_Y75LETySScpOQui-MaCBrszWRA2oyrE"

Write-Host "📝 Vérification de la structure de la base de données..." -ForegroundColor Yellow

# Vérifier si psql est disponible
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if ($psqlPath) {
    Write-Host "✅ PostgreSQL client trouvé" -ForegroundColor Green
    
    Write-Host "`n🔍 Vérification des triggers..." -ForegroundColor Yellow
    
    # Vérifier que les tables et triggers existent
    $triggerQuery = @"
SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.event_object_table
FROM information_schema.triggers t 
WHERE t.trigger_name = 'on_new_ticket_message';
"@

    try {
        psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -c $triggerQuery
    } catch {
        Write-Host "❌ Erreur lors de la vérification des triggers: $_" -ForegroundColor Red
    }

    Write-Host "`n🔍 Vérification de la fonction trigger..." -ForegroundColor Yellow

    $functionQuery = @"
SELECT 
    p.proname as function_name,
    p.prosrc as function_source
FROM pg_proc p 
WHERE p.proname = 'trigger_sentiment_analysis_on_new_message';
"@

    try {
        psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -c $functionQuery
    } catch {
        Write-Host "❌ Erreur lors de la vérification de la fonction: $_" -ForegroundColor Red
    }

} else {
    Write-Host "⚠️  PostgreSQL client (psql) non trouvé" -ForegroundColor Yellow
    Write-Host "💡 Alternative: Test via API REST Supabase" -ForegroundColor Cyan
    
    # Test via API REST si psql n'est pas disponible
    $headers = @{
        'apikey' = $SUPABASE_ANON_KEY
        'Authorization' = "Bearer $SUPABASE_ANON_KEY"
        'Content-Type' = 'application/json'
    }
    
    try {
        Write-Host "`n🌐 Test de connexion à Supabase..." -ForegroundColor Yellow
        $response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/" -Headers $headers -Method Get
        Write-Host "✅ Connexion Supabase réussie" -ForegroundColor Green
        
        # Tester l'accès aux tables des tickets
        Write-Host "`n📋 Vérification de l'accès aux tables..." -ForegroundColor Yellow
        
        try {
            $ticketsResponse = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/tickets?select=id&limit=1" -Headers $headers -Method Get
            Write-Host "✅ Table 'tickets' accessible" -ForegroundColor Green
        } catch {
            Write-Host "❌ Erreur d'accès à la table 'tickets': $_" -ForegroundColor Red
        }
        
        try {
            $messagesResponse = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/ticket_messages?select=id&limit=1" -Headers $headers -Method Get
            Write-Host "✅ Table 'ticket_messages' accessible" -ForegroundColor Green
        } catch {
            Write-Host "❌ Erreur d'accès à la table 'ticket_messages': $_" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ Erreur de connexion à Supabase: $_" -ForegroundColor Red
    }
}

Write-Host "`n✅ Tests terminés - Structure vérifiée" -ForegroundColor Green
