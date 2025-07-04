// Test de l'Edge Function dashboard-analytics avec authentification réelle
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qlqgyrfqiflnqknbtycw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDI0NTEsImV4cCI6MjA2NTY3ODQ1MX0.ODLjlo-8mvt_Y75LETySScpOQui-MaCBrszWRA2oyrE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testWithAuth() {
  try {
    console.log('🔐 Connexion avec un utilisateur test...')
    
    // Utilisons un utilisateur existant (vous devrez remplacer par de vrais identifiants)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'mdiouf@arcadis.tech', // Admin test
      password: 'Test123!' // Remplacez par le vrai mot de passe si connu
    })

    if (authError) {
      console.log('❌ Échec connexion, test avec token direct...')
      
      // Test direct avec fetch et token Bearer
      const response = await fetch('https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/dashboard-analytics-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + supabaseKey // Test avec clé anon d'abord
        },
        body: JSON.stringify({ period_days: 30 })
      })

      const result = await response.text()
      console.log('📊 Réponse Edge Function:', response.status, result)
      return
    }

    console.log('✅ Connexion réussie:', authData.user?.email)
    
    // Test de l'Edge Function avec session utilisateur
    const { data, error } = await supabase.functions.invoke('dashboard-analytics-generator', {
      body: { period_days: 30 }
    })

    if (error) {
      console.error('❌ Erreur Edge Function:', error)
    } else {
      console.log('✅ Réponse Edge Function:', data)
    }

  } catch (error) {
    console.error('❌ Erreur test:', error)
  }
}

testWithAuth()
