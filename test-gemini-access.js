// Test de l'Edge Function avec clé Gemini configurée
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qlqgyrfqiflnqknbtycw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testGeminiAccess() {
  try {
    console.log('🧪 Test de l\'accès à Gemini via Edge Function...')
    
    // Créer un utilisateur temporaire pour le test
    const testUser = {
      email: 'test@example.com',
      password: 'TestPassword123!'
    }
    
    // Ou utiliser un utilisateur existant
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'mdiouf@arcadis.tech',
      password: 'Test123!' // Mot de passe de test
    })

    if (authError) {
      console.log('⚠️ Connexion échouée, test direct de l\'API...')
      
      // Test direct de Gemini
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAbjeF0789Jv6ZyM4hbRp5UFzkEoBDDtDI`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: 'Test simple: réponds juste "OK" si tu reçois ce message.' }]
            }]
          })
        }
      )

      if (geminiResponse.ok) {
        const result = await geminiResponse.json()
        console.log('✅ Gemini API accessible:', result.candidates[0].content.parts[0].text)
      } else {
        console.log('❌ Erreur Gemini API:', geminiResponse.status, await geminiResponse.text())
      }
      return
    }

    console.log('✅ Connexion réussie, test Edge Function...')
    
    const { data, error } = await supabase.functions.invoke('dashboard-analytics-generator', {
      body: { period_days: 7 }
    })

    if (error) {
      console.error('❌ Erreur Edge Function:', error)
    } else {
      console.log('✅ Edge Function fonctionne avec Gemini:')
      console.log('📊 Summary:', data.summary?.substring(0, 100) + '...')
      console.log('💡 Insights:', data.insights?.length, 'insights générés')
      console.log('🎯 Recommendations:', data.recommendations?.length, 'recommandations')
    }

  } catch (error) {
    console.error('❌ Erreur test:', error)
  }
}

testGeminiAccess()
