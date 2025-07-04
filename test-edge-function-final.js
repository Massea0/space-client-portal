// Test direct de l'Edge Function avec token d'admin
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qlqgyrfqiflnqknbtycw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc'

async function testWithAdminToken() {
  try {
    console.log('🔑 Génération d\'un token JWT pour utilisateur admin...')
    
    // Simuler un token JWT pour l'utilisateur admin Massamba Diouf
    const adminUserId = '05abd360-84e0-44a9-b708-1537ec50b6cc'
    
    // Créer un client avec service role pour générer un token
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Générer un access token pour cet utilisateur
    const { data: tokenData, error: tokenError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: 'mdiouf@arcadis.tech'
    })

    if (tokenError) {
      console.error('❌ Erreur génération token:', tokenError)
      return
    }

    console.log('✅ Token généré, test Edge Function...')
    
    // Extraire le token de l'URL générée
    const urlParams = new URL(tokenData.properties.action_link).searchParams
    const accessToken = urlParams.get('access_token') || urlParams.get('token')
    
    if (!accessToken) {
      console.log('❌ Impossible d\'extraire le token')
      return
    }

    console.log('🚀 Test de l\'Edge Function avec token admin...')
    
    const response = await fetch('https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/dashboard-analytics-generator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDI0NTEsImV4cCI6MjA2NTY3ODQ1MX0.ODLjlo-8mvt_Y75LETySScpOQui-MaCBrszWRA2oyrE'
      },
      body: JSON.stringify({ period_days: 7 })
    })

    const responseText = await response.text()
    console.log('📊 Réponse Edge Function:', response.status)
    
    if (response.ok) {
      const data = JSON.parse(responseText)
      console.log('✅ Success! Analytics générées:')
      console.log('📝 Summary:', data.summary?.substring(0, 150) + '...')
      console.log('💡 Insights:', data.insights?.length, 'insights')
      console.log('🎯 Recommendations:', data.recommendations?.length, 'recommandations')
      console.log('🏆 Performance Score:', data.metrics?.performance_score)
    } else {
      console.log('❌ Erreur:', responseText)
    }

  } catch (error) {
    console.error('❌ Erreur test:', error)
  }
}

testWithAdminToken()
