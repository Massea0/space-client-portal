// wave-callback-handler/index.ts
// Fonction spécialisée pour recevoir les callbacks de paiement Wave
// Cette fonction gère à la fois les webhooks DExchange et la vérification automatique Wave

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// En-têtes CORS pour les réponses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret, x-signature, x-wave-signature'
}

// Configuration Wave et DExchange
const DEXCHANGE_API_BASE_URL = Deno.env.get('DEXCHANGE_API_URL_PRODUCTION') || 'https://api-m.dexchange.sn/api/v1';
const DEXCHANGE_API_KEY = Deno.env.get('DEXCHANGE_API_KEY');
const WEBHOOK_SECRET = Deno.env.get('DEXCHANGE_WEBHOOK_SECRET') || Deno.env.get('WEBHOOK_SECRET');
const ENVIRONMENT = Deno.env.get('DEXCHANGE_ENVIRONMENT') || 'sandbox';

// Logging avec ID unique par requête
function createLogger(requestId: string) {
  return {
    info: (message: string, data?: any) => {
      console.log(`[WAVE:${requestId}] ${message}`, data ? JSON.stringify(data, null, 2) : '')
    },
    warn: (message: string, data?: any) => {
      console.warn(`[WAVE:${requestId}] ${message}`, data ? JSON.stringify(data, null, 2) : '')
    },
    error: (message: string, data?: any) => {
      console.error(`[WAVE:${requestId}] ${message}`, data ? JSON.stringify(data, null, 2) : '')
    },
    success: (message: string, data?: any) => {
      console.log(`[WAVE-SUCCESS:${requestId}] ${message}`, data ? JSON.stringify(data, null, 2) : '')
    }
  }
}

// Valider la signature du webhook
function validateSignature(signature: string | null): boolean {
  if (!WEBHOOK_SECRET) {
    console.warn('[WAVE] Aucun secret configuré - validation désactivée')
    return true
  }
  
  if (!signature) return false
  
  // Support des formats : "Bearer xxx", "xxx", ou hachage
  const cleanSignature = signature.startsWith('Bearer ') ? signature.substring(7) : signature
  return cleanSignature === WEBHOOK_SECRET
}

// Vérifier le statut d'un paiement Wave via l'API DExchange
async function checkWavePaymentStatus(transactionId: string, logger: any): Promise<{
  confirmed: boolean,
  status: string,
  data?: any
}> {
  logger.info(`Vérification statut Wave transaction: ${transactionId}`)
  
  if (!DEXCHANGE_API_KEY) {
    logger.warn('DEXCHANGE_API_KEY manquante - impossible de vérifier le statut')
    return { confirmed: false, status: 'api_key_missing' }
  }
  
  try {
    const apiUrl = ENVIRONMENT === 'production' 
      ? DEXCHANGE_API_BASE_URL 
      : (Deno.env.get('DEXCHANGE_API_URL_SANDBOX') || 'https://api-s.dexchange.sn/api/v1')
      
    const response = await fetch(`${apiUrl}/transactions/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DEXCHANGE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      logger.info(`Réponse API DExchange:`, data)
      
      const isConfirmed = 
        data.status === 'completed' || 
        data.status === 'succeeded' || 
        data.state === 'COMPLETED' ||
        data.state === 'SUCCESS'
      
      return {
        confirmed: isConfirmed,
        status: data.status || data.state || 'unknown',
        data
      }
    } else {
      logger.warn(`Erreur API DExchange (${response.status}): ${await response.text()}`)
      return { confirmed: false, status: 'api_error' }
    }
  } catch (error) {
    logger.error(`Exception lors de la vérification API:`, { error: error.message })
    return { confirmed: false, status: 'exception' }
  }
}

// Marquer une facture comme payée
async function markInvoiceAsPaid(supabase: any, invoiceId: string, transactionId: string, paymentData: any, logger: any) {
  logger.info(`Marquage facture comme payée: ${invoiceId}`)
  
  try {
    // Vérifier si la facture existe et n'est pas déjà payée
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id, status, amount, payment_method')
      .eq('id', invoiceId)
      .single()
    
    if (fetchError) {
      throw new Error(`Facture non trouvée: ${fetchError.message}`)
    }
    
    if (invoice.status === 'paid') {
      logger.info(`Facture ${invoiceId} déjà payée`)
      return { success: true, already_paid: true, invoice }
    }
    
    // Mettre à jour la facture
    const updateData = {
      status: 'paid',
      payment_status: 'completed',
      payment_method: 'wave',
      payment_date: new Date().toISOString(),
      paid_at: new Date().toISOString(),
      payment_reference: transactionId,
      dexchange_transaction_id: transactionId,
      payment_metadata: paymentData || {}
    }
    
    const { error: updateError } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', invoiceId)
    
    if (updateError) {
      throw new Error(`Erreur mise à jour facture: ${updateError.message}`)
    }
    
    // Mettre à jour payment_transactions si existe
    const { error: txError } = await supabase
      .from('payment_transactions')
      .update({
        status: 'completed',
        external_transaction_id: transactionId,
        updated_at: new Date().toISOString(),
        response_data: paymentData || {}
      })
      .eq('invoice_id', invoiceId)
    
    if (txError) {
      logger.warn(`Impossible de mettre à jour payment_transactions: ${txError.message}`)
    }
    
    // Mettre à jour les statistiques
    await updatePaymentStatistics(supabase, invoice.amount, logger)
    
    logger.success(`Facture ${invoiceId} marquée comme payée avec succès`)
    return { success: true, invoice, updated: true }
    
  } catch (error) {
    logger.error(`Erreur lors du marquage de la facture:`, { error: error.message })
    return { success: false, error: error.message }
  }
}

// Mettre à jour les statistiques de paiement
async function updatePaymentStatistics(supabase: any, amount: number, logger: any) {
  const today = new Date().toISOString().split('T')[0]
  
  try {
    const { data: stats } = await supabase
      .from('payment_statistics')
      .select('*')
      .eq('date', today)
      .maybeSingle()
    
    if (stats) {
      await supabase
        .from('payment_statistics')
        .update({
          wave_payments: (stats.wave_payments || 0) + 1,
          wave_amount: (stats.wave_amount || 0) + amount,
          successful_payments: (stats.successful_payments || 0) + 1,
          total_amount: (stats.total_amount || 0) + amount,
          auto_marked_count: (stats.auto_marked_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('date', today)
    } else {
      await supabase
        .from('payment_statistics')
        .insert({
          date: today,
          wave_payments: 1,
          wave_amount: amount,
          successful_payments: 1,
          total_payments: 1,
          total_amount: amount,
          auto_marked_count: 1,
          failed_payments: 0,
          webhook_received_count: 1
        })
    }
  } catch (error) {
    logger.warn(`Erreur mise à jour statistiques: ${error.message}`)
  }
}

// Auto-confirmation basée sur le temps
async function checkAutoConfirmation(supabase: any, invoiceId: string, logger: any): Promise<boolean> {
  try {
    const { data: invoice } = await supabase
      .from('invoices')
      .select('created_at, status, payment_method')
      .eq('id', invoiceId)
      .single()
    
    if (!invoice || invoice.status === 'paid' || invoice.payment_method !== 'wave') {
      return false
    }
    
    const now = new Date()
    const createdAt = new Date(invoice.created_at)
    const minutesElapsed = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60))
    
    logger.info(`Facture créée il y a ${minutesElapsed} minutes`)
    
    // Auto-confirmer après 3 minutes pour Wave (plus conservateur)
    if (minutesElapsed >= 3) {
      logger.info(`Auto-confirmation activée après ${minutesElapsed} minutes`)
      return true
    }
    
    return false
  } catch (error) {
    logger.error(`Erreur vérification auto-confirmation: ${error.message}`)
    return false
  }
}

// Fonction principale
serve(async (req) => {
  const requestId = crypto.randomUUID().slice(0, 8)
  const logger = createLogger(requestId)
  const timestamp = new Date().toISOString()
  
  // Client Supabase admin
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  )
  
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  logger.info(`Nouvelle requête Wave callback`, { method: req.method, timestamp })
  
  try {
    // Validation de la signature
    const signature = req.headers.get('x-webhook-secret') || 
                     req.headers.get('x-signature') || 
                     req.headers.get('x-wave-signature')
    
    if (!validateSignature(signature)) {
      logger.warn(`Signature invalide rejetée`)
      return new Response(
        JSON.stringify({ error: 'Signature invalide', requestId }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Lire le payload
    const body = await req.text()
    logger.info(`Payload reçu: ${body.length} caractères`)
    
    // Traiter les requêtes vides (ping)
    if (!body || body.trim() === '') {
      logger.info(`Ping détecté`)
      return new Response(
        JSON.stringify({ status: 'ok', message: 'Wave callback handler opérationnel', requestId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Parser le JSON
    let webhookData
    try {
      webhookData = JSON.parse(body)
      logger.info(`Webhook parsé`, webhookData)
    } catch (error) {
      logger.error(`Erreur parsing JSON: ${error.message}`)
      return new Response(
        JSON.stringify({ error: 'JSON invalide', requestId }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Extraire les informations de paiement
    const eventType = webhookData.event || webhookData.type || 'webhook'
    const paymentData = webhookData.data?.object || webhookData.data || webhookData
    
    // ID de transaction
    const transactionId = 
      paymentData.id || 
      paymentData.transaction_id || 
      paymentData.reference ||
      webhookData.transaction_id ||
      null
    
    // ID de facture
    const invoiceId = 
      paymentData.metadata?.invoice_id || 
      paymentData.invoice_id || 
      webhookData.invoice_id ||
      paymentData.external_id ||
      null
    
    logger.info(`Événement: ${eventType}, Transaction: ${transactionId}, Facture: ${invoiceId}`)
    
    if (!invoiceId) {
      logger.warn(`ID de facture manquant`)
      return new Response(
        JSON.stringify({ 
          error: 'ID de facture manquant', 
          requestId,
          transactionId 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Vérifier le statut du paiement
    let paymentConfirmed = false
    let confirmationSource = 'unknown'
    
    // 1. Vérifier selon l'événement webhook
    if (eventType.includes('success') || eventType.includes('completed') || 
        paymentData.status === 'completed' || paymentData.status === 'succeeded') {
      paymentConfirmed = true
      confirmationSource = 'webhook'
      logger.info(`Paiement confirmé par webhook`)
    }
    
    // 2. Si pas confirmé par webhook et qu'on a un transactionId, vérifier via API
    if (!paymentConfirmed && transactionId) {
      const apiCheck = await checkWavePaymentStatus(transactionId, logger)
      if (apiCheck.confirmed) {
        paymentConfirmed = true
        confirmationSource = 'api'
        logger.info(`Paiement confirmé par API DExchange`)
      }
    }
    
    // 3. Si toujours pas confirmé, vérifier l'auto-confirmation
    if (!paymentConfirmed) {
      const autoConfirm = await checkAutoConfirmation(supabase, invoiceId, logger)
      if (autoConfirm) {
        paymentConfirmed = true
        confirmationSource = 'auto'
        logger.info(`Paiement confirmé par auto-confirmation`)
      }
    }
    
    // Traiter la confirmation
    if (paymentConfirmed) {
      const result = await markInvoiceAsPaid(
        supabase, 
        invoiceId, 
        transactionId || `wave_${requestId}`, 
        { ...paymentData, confirmationSource, eventType },
        logger
      )
      
      if (result.success) {
        return new Response(
          JSON.stringify({
            status: 'ok',
            message: 'Paiement Wave confirmé et facture mise à jour',
            requestId,
            invoiceId,
            transactionId,
            confirmationSource,
            alreadyPaid: result.already_paid || false
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        return new Response(
          JSON.stringify({
            status: 'error',
            message: 'Erreur lors de la mise à jour de la facture',
            error: result.error,
            requestId,
            invoiceId,
            transactionId
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else {
      logger.info(`Paiement non confirmé - statut en attente`)
      return new Response(
        JSON.stringify({
          status: 'pending',
          message: 'Paiement en attente de confirmation',
          requestId,
          invoiceId,
          transactionId,
          eventType
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
  } catch (error) {
    logger.error(`Erreur générale:`, { error: error.message })
    return new Response(
      JSON.stringify({
        error: 'Erreur lors du traitement du callback Wave',
        details: error.message,
        requestId
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
