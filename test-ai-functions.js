// test-ai-functions.js - Script de test pour les fonctions IA

const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDI0NTEsImV4cCI6MjA2NTY3ODQ1MX0.ODLjlo-8mvt_Y75LETySScpOQui-MaCBrszWRA2oyrE'

async function testPaymentPrediction() {
  console.log('🧠 Test de la prédiction de paiement IA...')
  
  const testInvoice = {
    id: 'test-invoice-1',
    number: 'FAC-2025-001',
    companyId: 'test-company-1',
    companyName: 'Entreprise Test',
    amount: 5000,
    status: 'sent',
    createdAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 jours
  }
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-payment-prediction`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ invoiceId: testInvoice.id })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`)
    }
    
    const result = await response.json()
    console.log('✅ Prédiction de paiement réussie:', result)
    return result
  } catch (error) {
    console.error('❌ Erreur prédiction de paiement:', error)
    return null
  }
}

async function testQuoteOptimization() {
  console.log('🧠 Test de l\'optimisation de devis IA...')
  
  const testQuote = {
    id: 'test-quote-1',
    number: 'DEV-2025-001',
    companyId: 'test-company-1',
    companyName: 'Entreprise Test',
    object: 'Développement application web',
    amount: 15000,
    status: 'draft',
    createdAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: '1',
        description: 'Développement frontend React',
        quantity: 1,
        unitPrice: 8000,
        total: 8000
      },
      {
        id: '2',
        description: 'Développement backend Node.js',
        quantity: 1,
        unitPrice: 7000,
        total: 7000
      }
    ]
  }
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-quote-optimization`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quoteId: testQuote.id })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`)
    }
    
    const result = await response.json()
    console.log('✅ Optimisation de devis réussie:', result)
    return result
  } catch (error) {
    console.error('❌ Erreur optimisation de devis:', error)
    return null
  }
}

async function runTests() {
  console.log('🚀 Démarrage des tests des fonctions IA')
  console.log('='  .repeat(50))
  
  const predictionResult = await testPaymentPrediction()
  console.log()
  
  const optimizationResult = await testQuoteOptimization()
  console.log()
  
  console.log('📊 Résumé des tests:')
  console.log(`- Prédiction de paiement: ${predictionResult ? '✅ OK' : '❌ ECHEC'}`)
  console.log(`- Optimisation de devis: ${optimizationResult ? '✅ OK' : '❌ ECHEC'}`)
  
  if (predictionResult && optimizationResult) {
    console.log('🎉 Tous les tests IA ont réussi!')
  } else {
    console.log('⚠️ Certains tests ont échoué. Vérifiez les logs ci-dessus.')
  }
}

// Exécuter les tests
runTests().catch(console.error)
