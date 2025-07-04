#!/usr/bin/env node

import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

const WEBHOOK_SECRET = process.env.DEXCHANGE_WEBHOOK_SECRET
const SUPABASE_URL = process.env.SUPABASE_URL

async function testValidWebhook() {
  console.log('🔐 TEST WEBHOOK AVEC SIGNATURE VALIDE')
  console.log('=' .repeat(45))
  
  const payload = {
    status: 'SUCCESS',
    invoice_id: 'test-invoice-123',
    transaction_id: 'TXN-' + Date.now(),
    amount: 2500,
    currency: 'XOF',
    payment_method: 'dexchange'
  }
  
  const payloadString = JSON.stringify(payload)
  
  // Générer la signature HMAC
  const signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payloadString)
    .digest('hex')
  
  console.log('📝 Payload:', payloadString)
  console.log('🔑 Secret:', WEBHOOK_SECRET?.substring(0, 10) + '...')
  console.log('✍️  Signature:', signature)
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/dexchange-callback-handler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-DExchange-Signature': signature
      },
      body: payloadString
    })
    
    const result = await response.json()
    
    console.log('\n📨 Résultat webhook:')
    console.log('✅ Statut:', response.status)
    console.log('🎯 Succès:', result.success)
    console.log('💬 Message:', result.message || result.error)
    
    if (result.success) {
      console.log('\n🎉 WEBHOOK AVEC SIGNATURE VALIDE FONCTIONNE!')
    } else {
      console.log('\n⚠️  Webhook nécessite des ajustements')
    }
    
  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error.message)
  }
}

testValidWebhook()
