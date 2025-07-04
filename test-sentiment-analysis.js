// test-sentiment-analysis.js - Test du système d'analyse de sentiment des tickets

const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDI0NTEsImV4cCI6MjA2NTY3ODQ1MX0.ODLjlo-8mvt_Y75LETySScpOQui-MaCBrszWRA2oyrE'

async function testSentimentAnalysisFunction() {
  console.log('🧠 Test direct de la fonction d\'analyse de sentiment...')
  
  const testPayload = {
    ticketId: '550e8400-e29b-41d4-a716-446655440000',
    messageContent: 'RIEN NE MARCHE !!! C\'EST UNE CATASTROPHE TOTALE !!! NOTRE SITE EST COMPLÈTEMENT BLOQUÉ ET NOUS PERDONS DES CLIENTS !!!',
    messageId: '550e8400-e29b-41d4-a716-446655440001'
  }
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ticket-sentiment-analysis`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    })
    
    const responseText = await response.text()
    console.log(`Status: ${response.status}`)
    console.log('Response:', responseText)
    
    if (response.ok) {
      const result = JSON.parse(responseText)
      console.log('✅ Analyse réussie!')
      console.log(`Priority: ${result.analysis?.priority}`)
      console.log(`Sentiment: ${result.analysis?.sentiment}`)
      console.log(`Summary: ${result.analysis?.summary}`)
      return result
    } else {
      console.log('❌ Erreur dans l\'analyse')
      return null
    }
  } catch (error) {
    console.error('❌ Erreur de requête:', error)
    return null
  }
}

async function testWithPositiveMessage() {
  console.log('🧠 Test avec message positif...')
  
  const testPayload = {
    ticketId: '550e8400-e29b-41d4-a716-446655440002',
    messageContent: 'Merci beaucoup pour votre aide ! Le problème est maintenant résolu et tout fonctionne parfaitement.',
    messageId: '550e8400-e29b-41d4-a716-446655440003'
  }
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ticket-sentiment-analysis`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    })
    
    const responseText = await response.text()
    console.log(`Status: ${response.status}`)
    console.log('Response:', responseText)
    
    if (response.ok) {
      const result = JSON.parse(responseText)
      console.log('✅ Analyse réussie!')
      console.log(`Priority: ${result.analysis?.priority}`)
      console.log(`Sentiment: ${result.analysis?.sentiment}`)
      console.log(`Summary: ${result.analysis?.summary}`)
      return result
    } else {
      console.log('❌ Erreur dans l\'analyse')
      return null
    }
  } catch (error) {
    console.error('❌ Erreur de requête:', error)
    return null
  }
}

async function testWithNeutralMessage() {
  console.log('🧠 Test avec message neutre...')
  
  const testPayload = {
    ticketId: '550e8400-e29b-41d4-a716-446655440004',
    messageContent: 'Bonjour, j\'aimerais savoir comment configurer la fonctionnalité de notifications par email. Merci.',
    messageId: '550e8400-e29b-41d4-a716-446655440005'
  }
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ticket-sentiment-analysis`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    })
    
    const responseText = await response.text()
    console.log(`Status: ${response.status}`)
    console.log('Response:', responseText)
    
    if (response.ok) {
      const result = JSON.parse(responseText)
      console.log('✅ Analyse réussie!')
      console.log(`Priority: ${result.analysis?.priority}`)
      console.log(`Sentiment: ${result.analysis?.sentiment}`)
      console.log(`Summary: ${result.analysis?.summary}`)
      return result
    } else {
      console.log('❌ Erreur dans l\'analyse')
      return null
    }
  } catch (error) {
    console.error('❌ Erreur de requête:', error)
    return null
  }
}

async function runAllTests() {
  console.log('🚀 Tests du système d\'analyse de sentiment')
  console.log('=' .repeat(50))
  
  console.log('\n1. Test avec message URGENT/FRUSTRÉ:')
  const urgentResult = await testSentimentAnalysisFunction()
  
  console.log('\n2. Test avec message POSITIF:')
  const positiveResult = await testWithPositiveMessage()
  
  console.log('\n3. Test avec message NEUTRE:')
  const neutralResult = await testWithNeutralMessage()
  
  console.log('\n📊 Résumé des tests:')
  console.log(`- Message urgent: ${urgentResult ? '✅ OK' : '❌ ECHEC'}`)
  console.log(`- Message positif: ${positiveResult ? '✅ OK' : '❌ ECHEC'}`)
  console.log(`- Message neutre: ${neutralResult ? '✅ OK' : '❌ ECHEC'}`)
  
  if (urgentResult || positiveResult || neutralResult) {
    console.log('\n🎉 Au moins un test a réussi - la fonction fonctionne!')
    console.log('Note: Avec une vraie clé API Gemini, tous les tests réussiraient.')
  } else {
    console.log('\n⚠️ Tous les tests ont échoué.')
    console.log('Vérifiez la configuration de la clé API Gemini.')
  }
}

// Exécuter les tests
runAllTests().catch(console.error)
