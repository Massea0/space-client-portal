#!/usr/bin/env node

async function testWithoutSecret() {
  console.log('🧪 TEST WEBHOOK SANS SECRET (MODE TEST)')
  console.log('=' .repeat(40))
  
  // Temporairement, testons avec une fonction modifiée qui n'exige pas de signature
  const supabaseUrl = 'https://qlqgyrfqiflnqknbtycw.supabase.co'
  
  const payload = {
    status: 'SUCCESS',
    invoice_id: 'test-no-secret-123',
    transaction_id: 'TXN-NO-SECRET-' + Date.now(),
    amount: 1500,
    currency: 'XOF',
    payment_method: 'test'
  }
  
  console.log('📝 Payload:', JSON.stringify(payload, null, 2))
  
  try {
    // Test sans en-tête de signature
    const response = await fetch(`${supabaseUrl}/functions/v1/dexchange-callback-handler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // Pas de X-DExchange-Signature
      },
      body: JSON.stringify(payload)
    })
    
    const result = await response.json()
    
    console.log('\n📨 Résultat:')
    console.log('✅ Statut HTTP:', response.status)
    console.log('🎯 Réponse:', JSON.stringify(result, null, 2))
    
    if (result.success) {
      console.log('\n🎉 FONCTION WEBHOOK FONCTIONNE EN MODE TEST!')
    } else {
      console.log('\n⚠️  Fonction nécessite des ajustements')
    }
    
    return result.success || false
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message)
    return false
  }
}

testWithoutSecret()
