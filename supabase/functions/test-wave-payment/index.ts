// test-wave-payment/index.ts
// Fonction pour tester les paiements Wave et simuler des callbacks
// Utile pour le debugging et les tests en développement

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

// Créer une facture de test
async function createTestInvoice(supabase: any, testData: any) {
  const invoiceData = {
    id: testData.invoiceId || `test_wave_${Date.now()}`,
    amount: testData.amount || 1000,
    status: 'pending',
    payment_method: 'wave',
    payment_status: 'pending',
    created_at: new Date().toISOString(),
    customer_email: testData.email || 'test@example.com',
    customer_name: testData.name || 'Test User',
    description: testData.description || 'Test payment Wave',
    currency: 'XOF'
  }
  
  const { data, error } = await supabase
    .from('invoices')
    .insert(invoiceData)
    .select()
    .single()
  
  if (error) throw new Error(`Erreur création facture: ${error.message}`)
  return data
}

// Simuler un webhook Wave
async function simulateWaveWebhook(invoiceId: string, transactionId: string, success: boolean = true) {
  const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/wave-callback-handler`
  const webhookSecret = Deno.env.get('DEXCHANGE_WEBHOOK_SECRET') || Deno.env.get('WEBHOOK_SECRET')
  
  const webhookPayload = {
    event: success ? 'payment.succeeded' : 'payment.failed',
    type: 'payment',
    data: {
      id: transactionId,
      status: success ? 'succeeded' : 'failed',
      amount: 1000,
      currency: 'XOF',
      metadata: {
        invoice_id: invoiceId
      },
      created_at: new Date().toISOString()
    }
  }
  
  const headers: any = {
    'Content-Type': 'application/json'
  }
  
  if (webhookSecret) {
    headers['x-webhook-secret'] = webhookSecret
  }
  
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(webhookPayload)
  })
  
  return {
    status: response.status,
    response: await response.text(),
    webhookPayload
  }
}

// Tester la vérification automatique
async function testAutoVerification(invoiceId: string) {
  const checkWaveUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/check-wave-status`
  
  const response = await fetch(checkWaveUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
    },
    body: JSON.stringify({
      invoiceId: invoiceId,
      testMode: true
    })
  })
  
  return {
    status: response.status,
    response: await response.text()
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  )
  
  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'help'
    
    switch (action) {
      case 'help':
        return new Response(JSON.stringify({
          message: 'Test Wave Payment API',
          actions: {
            'create': 'Créer une facture de test',
            'webhook': 'Simuler un webhook Wave',
            'check': 'Tester la vérification automatique',
            'full': 'Test complet du flux'
          },
          examples: {
            'create': '?action=create&amount=1000&email=test@example.com',
            'webhook': '?action=webhook&invoice=test_123&transaction=txn_456&success=true',
            'check': '?action=check&invoice=test_123',
            'full': '?action=full&amount=2000'
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
        
      case 'create':
        const createData = {
          amount: parseInt(url.searchParams.get('amount') || '1000'),
          email: url.searchParams.get('email') || 'test@example.com',
          name: url.searchParams.get('name') || 'Test User',
          description: url.searchParams.get('description') || 'Test Wave payment'
        }
        
        const invoice = await createTestInvoice(supabase, createData)
        
        return new Response(JSON.stringify({
          success: true,
          action: 'create',
          invoice,
          nextSteps: [
            `Test webhook: ?action=webhook&invoice=${invoice.id}&transaction=txn_${Date.now()}&success=true`,
            `Test check: ?action=check&invoice=${invoice.id}`
          ]
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
        
      case 'webhook':
        const invoiceId = url.searchParams.get('invoice')
        const transactionId = url.searchParams.get('transaction') || `txn_${Date.now()}`
        const success = url.searchParams.get('success') !== 'false'
        
        if (!invoiceId) {
          throw new Error('Parameter invoice required')
        }
        
        const webhookResult = await simulateWaveWebhook(invoiceId, transactionId, success)
        
        return new Response(JSON.stringify({
          success: true,
          action: 'webhook',
          invoiceId,
          transactionId,
          webhookSuccess: success,
          webhookResult
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
        
      case 'check':
        const checkInvoiceId = url.searchParams.get('invoice')
        
        if (!checkInvoiceId) {
          throw new Error('Parameter invoice required')
        }
        
        const checkResult = await testAutoVerification(checkInvoiceId)
        
        return new Response(JSON.stringify({
          success: true,
          action: 'check',
          invoiceId: checkInvoiceId,
          checkResult
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
        
      case 'full':
        // Test complet du flux
        const fullAmount = parseInt(url.searchParams.get('amount') || '1500')
        
        console.log('🚀 Test complet Wave - Étape 1: Création facture')
        const testInvoice = await createTestInvoice(supabase, { amount: fullAmount })
        
        console.log('🚀 Test complet Wave - Étape 2: Simulation webhook')
        const testTransactionId = `txn_full_${Date.now()}`
        const testWebhookResult = await simulateWaveWebhook(testInvoice.id, testTransactionId, true)
        
        // Attendre un peu pour la propagation
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        console.log('🚀 Test complet Wave - Étape 3: Vérification statut')
        const testCheckResult = await testAutoVerification(testInvoice.id)
        
        // Vérifier l'état final de la facture
        const { data: finalInvoice } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', testInvoice.id)
          .single()
        
        return new Response(JSON.stringify({
          success: true,
          action: 'full',
          steps: {
            '1_create': { invoice: testInvoice },
            '2_webhook': { 
              transactionId: testTransactionId,
              result: testWebhookResult 
            },
            '3_check': { result: testCheckResult },
            '4_final': { invoice: finalInvoice }
          },
          summary: {
            invoiceCreated: !!testInvoice,
            webhookProcessed: testWebhookResult.status === 200,
            finalStatus: finalInvoice?.status,
            paymentConfirmed: finalInvoice?.status === 'paid'
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
        
      default:
        throw new Error(`Action non reconnue: ${action}`)
    }
    
  } catch (error) {
    console.error('Erreur test Wave:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
