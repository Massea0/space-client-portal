#!/usr/bin/env node

import dotenv from 'dotenv'

dotenv.config()

async function debugWebhookVars() {
  console.log('🔍 DIAGNOSTIC DES VARIABLES WEBHOOK')
  console.log('=' .repeat(40))
  
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  console.log('📋 Variables locales (.env):')
  console.log('  DEXCHANGE_WEBHOOK_SECRET:', process.env.DEXCHANGE_WEBHOOK_SECRET)
  console.log('  WEBHOOK_SECRET:', process.env.WEBHOOK_SECRET)
  
  console.log('\n🧪 Test avec la variable locale...')
  
  const payload = {
    status: 'SUCCESS',
    invoice_id: 'debug-test-123',
    transaction_id: 'TXN-DEBUG-' + Date.now(),
    amount: 1000,
    currency: 'XOF'
  }
  
  try {
    // Test 1: Avec DEXCHANGE_WEBHOOK_SECRET
    console.log('\n🔐 Test 1: DEXCHANGE_WEBHOOK_SECRET')
    const response1 = await fetch(`${supabaseUrl}/functions/v1/dexchange-callback-handler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-DExchange-Signature': process.env.DEXCHANGE_WEBHOOK_SECRET
      },
      body: JSON.stringify(payload)
    })
    
    const result1 = await response1.json()
    console.log('📨 Résultat:', result1)
    
    // Test 2: Avec Bearer prefix
    console.log('\n🔐 Test 2: Bearer + DEXCHANGE_WEBHOOK_SECRET')
    const response2 = await fetch(`${supabaseUrl}/functions/v1/dexchange-callback-handler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-DExchange-Signature': `Bearer ${process.env.DEXCHANGE_WEBHOOK_SECRET}`
      },
      body: JSON.stringify(payload)
    })
    
    const result2 = await response2.json()
    console.log('📨 Résultat:', result2)
    
    // Test 3: Appel de diagnostic à la fonction
    console.log('\n🩺 Test 3: Diagnostic direct')
    const response3 = await fetch(`${supabaseUrl}/functions/v1/dexchange-callback-handler`, {
      method: 'GET'
    })
    
    const result3 = await response3.json()
    console.log('📨 Résultat:', result3)
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

debugWebhookVars()
