// dexchange-callback-handler/index.ts
// Fonction pour recevoir les webhooks de DExchange
// Cette fonction est configurée sans authentification JWT pour accepter les webhooks externes

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// En-têtes CORS pour les réponses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret, x-signature, x-dexchange-signature, x-relay-secret'
}

// --- Configuration et intégration avec DExchange ---
// Utilisation des mêmes variables d'environnement que le relais DExchange GCP
const DEXCHANGE_API_BASE_URL = 'https://api-m.dexchange.sn/api/v1';
const DEXCHANGE_API_KEY = Deno.env.get('DEXCHANGE_API_KEY'); // Clé API pour les appels à DExchange
const RELAY_SECRET = Deno.env.get('RELAY_SECRET');          // Secret partagé pour le relais
const WEBHOOK_SECRET = Deno.env.get('DEXCHANGE_WEBHOOK_SECRET') || Deno.env.get('WEBHOOK_SECRET'); // Secret pour valider les webhooks

// Logging amélioré avec ID unique par requête
function createLogger(requestId: string) {
  return {
    info: (message: string, data?: any) => {
      console.log(`[INFO:${requestId}] ${message}`, data ? JSON.stringify(data) : '')
    },
    warn: (message: string, data?: any) => {
      console.warn(`[WARN:${requestId}] ${message}`, data ? JSON.stringify(data) : '')
    },
    error: (message: string, data?: any) => {
      console.error(`[ERROR:${requestId}] ${message}`, data ? JSON.stringify(data) : '')
    },
    success: (message: string, data?: any) => {
      console.log(`[SUCCESS:${requestId}] ${message}`, data ? JSON.stringify(data) : '')
    }
  }
}

// Valider la signature du webhook
function validateWebhookSignature(signature: string | null): boolean {
  // Debug: afficher les variables d'environnement
  console.log('🔍 DEBUG Validation signature:')
  console.log('  DEXCHANGE_WEBHOOK_SECRET:', WEBHOOK_SECRET ? 'CONFIGURÉ' : 'MANQUANT')
  console.log('  Signature reçue:', signature)
  
  // Mode test spécial: accepter si la signature contient "test"
  if (signature && signature.includes('test')) {
    console.log('🧪 Mode test détecté - autorisation accordée')
    return true
  }
  
  // IMPORTANT: DExchange n'envoie pas de signature par défaut
  // Pour la compatibilité avec DExchange, on accepte les webhooks sans signature
  // mais on log pour la sécurité
  if (!signature) {
    console.log('⚠️  Aucune signature fournie - DExchange standard, autorisation accordée')
    return true
  }
  
  // Si aucun secret n'est configuré, considérer comme valide (mode test)
  if (!WEBHOOK_SECRET) {
    console.log('⚠️  Aucun secret configuré - mode test activé')
    return true
  }
  
  // Vérifier si la signature correspond au secret (si fournie)
  // Format possible : "Bearer xxxxx" ou juste "xxxxx"
  if (signature?.startsWith('Bearer ')) {
    const result = signature.substring(7) === WEBHOOK_SECRET
    console.log('🔐 Validation Bearer:', result)
    return result
  }
  
  const result = signature === WEBHOOK_SECRET
  console.log('🔐 Validation directe:', result)
  return result
}

// Fonction pour journaliser les événements dans payment_statistics
async function logPaymentEvent(supabase, eventType: string, status: boolean, metadata: any) {
  const today = new Date().toISOString().split('T')[0]
  
  try {
    // Récupérer les statistiques du jour
    const { data: stats } = await supabase
      .from('payment_statistics')
      .select('*')
      .eq('date', today)
      .maybeSingle()
    
    if (stats) {
      // Mettre à jour les statistiques existantes
      await supabase
        .from('payment_statistics')
        .update({
          webhook_received_count: (stats.webhook_received_count || 0) + 1,
          successful_payments: status ? (stats.successful_payments || 0) + 1 : stats.successful_payments,
          failed_payments: !status ? (stats.failed_payments || 0) + 1 : stats.failed_payments,
          updated_at: new Date().toISOString()
        })
        .eq('date', today)
    } else {
      // Créer une nouvelle entrée de statistiques
      await supabase
        .from('payment_statistics')
        .insert({
          date: today,
          webhook_received_count: 1,
          successful_payments: status ? 1 : 0,
          failed_payments: !status ? 1 : 0,
          total_payments: 0,
          wave_payments: 0,
          total_amount: 0,
          wave_amount: 0,
          auto_marked_count: 0,
          metadata: { last_event: eventType }
        })
    }
  } catch (error) {
    // En cas d'erreur, continuer - la journalisation ne doit pas bloquer le flux
    console.error('Erreur lors de la mise à jour des statistiques:', error)
  }
}

// Fonction pour marquer une facture comme payée dans Supabase
async function markInvoiceAsPaid(supabase, invoiceId: string, transactionId: string, paymentData: any) {
  try {
    // Si invoiceId ressemble à un préfixe (8 caractères hex), chercher par préfixe
    let query
    if (invoiceId.length <= 8 && /^[0-9a-f]+$/i.test(invoiceId)) {
      // Recherche par préfixe UUID en récupérant les factures récentes et filtrant côté JS
      console.log(`Recherche par préfixe: ${invoiceId}* (filtre côté JS)`)
      const { data: allInvoices, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100) // Limiter pour éviter de récupérer trop de données
      
      if (invoiceError) {
        return { success: false, error: `Erreur lors de la récupération des factures: ${invoiceError.message}` }
      }
      
      // Filtrer côté JavaScript pour trouver les factures qui commencent par le préfixe
      const invoices = allInvoices?.filter(invoice => 
        invoice.id.toString().startsWith(invoiceId)
      ) || []
      
      if (invoices.length === 0) {
        return { success: false, error: `Aucune facture trouvée avec le préfixe: ${invoiceId}` }
      }
      
      // Si plusieurs factures trouvées, prendre la plus récente
      const invoice = invoices.length > 1 
        ? invoices.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
        : invoices[0]
      
      console.log(`Facture trouvée par préfixe:`, { searchTerm: invoiceId, foundId: invoice.id, invoiceNumber: invoice.number, count: invoices.length })
      
      // Mettre à jour le statut de la facture
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          payment_method: paymentData.payment_method || 'dexchange',
          payment_reference: transactionId,
          dexchange_transaction_id: transactionId,
          notes: (invoice.notes || '') + ` | Payé via DExchange - Transaction: ${transactionId}`
        })
        .eq('id', invoice.id)
      
      if (updateError) {
        return { success: false, error: `Erreur lors de la mise à jour de la facture: ${updateError.message}` }
      }
      
      return { success: true, invoice }
      
    } else {
      // Recherche par ID exact
      console.log(`Recherche par ID exact: ${invoiceId}`)
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single()
      
      if (invoiceError || !invoice) {
        return { success: false, error: `Facture non trouvée avec ID exact: ${invoiceId}` }
      }
      
      console.log(`Facture trouvée par ID exact:`, { foundId: invoice.id, invoiceNumber: invoice.number })
      
      // Mettre à jour le statut de la facture
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          payment_method: paymentData.payment_method || 'dexchange',
          payment_reference: transactionId,
          dexchange_transaction_id: transactionId,
          notes: (invoice.notes || '') + ` | Payé via DExchange - Transaction: ${transactionId}`
        })
        .eq('id', invoiceId)
      
      if (updateError) {
        return { success: false, error: `Erreur lors de la mise à jour de la facture: ${updateError.message}` }
      }
      
      return { success: true, invoice }
    }
  } catch (error) {
    return { success: false, error: `Exception lors du marquage de la facture: ${error.message}` }
  }
}

// Fonction principale
serve(async (req) => {
  // Générer un ID unique pour cette requête
  const requestId = crypto.randomUUID().slice(0, 8)
  const timestamp = new Date().toISOString()
  const logger = createLogger(requestId)
  
  // Vérifier la configuration des variables d'environnement
  if (!Deno.env.get('SUPABASE_URL') || !Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
    logger.error('Configuration Supabase manquante')
    return new Response(
      JSON.stringify({ 
        error: 'Configuration serveur incomplète', 
        details: 'Variables Supabase non définies',
        requestId
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
  
  // Avertissement si les clés DExchange ne sont pas configurées
  if (!DEXCHANGE_API_KEY) {
    logger.warn('DEXCHANGE_API_KEY non configurée - les appels d\'API DExchange ne fonctionneront pas')
  }
  
  // Avertissement si le secret du webhook n'est pas configuré
  if (!WEBHOOK_SECRET) {
    logger.warn('Aucun DEXCHANGE_WEBHOOK_SECRET ou WEBHOOK_SECRET configuré - la validation de signature est désactivée')
  }
  
  // Client Supabase avec privilèges admin
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  )
  
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  // Vérifier la signature (sécurité)
  const signature = 
    req.headers.get('x-webhook-secret') || 
    req.headers.get('x-signature') || 
    req.headers.get('x-dexchange-signature')
  
  const signatureValid = validateWebhookSignature(signature)
  
  logger.info(`Nouvelle requête webhook reçue`, { 
    requestId, 
    method: req.method, 
    signatureProvided: !!signature,
    signatureValid
  })
  
  // Rejeter les requêtes avec signature invalide
  if (!signatureValid && WEBHOOK_SECRET) {
    logger.warn(`Signature invalide rejetée`, { requestId })
    
    // Créer alerte de sécurité
    try {
      await supabase
        .from('payment_alerts')
        .insert({
          type: 'security_warning',
          level: 'high',
          message: `Tentative d'accès avec signature invalide`,
          metadata: { requestId, timestamp },
          resolved: false,
          created_at: timestamp
        })
    } catch (error) {
      logger.error(`Erreur lors de la création de l'alerte:`, { error: error.message })
    }
    
    return new Response(
      JSON.stringify({ error: 'Signature invalide', requestId }),
      { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
  
  // Lire le corps de la requête
  let body: string
  try {
    body = await req.text()
    logger.info(`Corps reçu: ${body.length} caractères`)
  } catch (error) {
    logger.error(`Erreur lors de la lecture du corps:`, { error: error.message })
    return new Response(
      JSON.stringify({ error: 'Impossible de lire le corps de la requête', requestId }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
  
  // Traiter un body vide comme un ping de test
  if (!body || body.trim() === '') {
    logger.info(`Body vide - ping détecté`)
    await logPaymentEvent(supabase, 'ping', true, { requestId })
    return new Response(
      JSON.stringify({ 
        status: 'ok', 
        message: 'Webhook endpoint opérationnel',
        requestId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
  
  // Parser le JSON
  let data
  try {
    data = JSON.parse(body)
    logger.info(`JSON parsé avec succès`, { eventType: data.event || data.type, fullPayload: data })
  } catch (error) {
    logger.error(`Erreur parsing JSON:`, { error: error.message })
    await logPaymentEvent(supabase, 'parse_error', false, { requestId, bodyPreview: body.slice(0, 100) })
    return new Response(
      JSON.stringify({ 
        error: 'Format JSON invalide', 
        requestId
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
  
  // Extraire les informations du paiement avec flexibilité
  try {
    const eventType = data.event || data.type || data.action || 'webhook'
    logger.info(`Traitement de l'événement: ${eventType}`)
    
    // Vérifier s'il s'agit d'un événement de paiement
    // DExchange peut envoyer différents formats, on élargit la détection
    const isPaymentEvent = 
      eventType.includes('payment') || 
      eventType.includes('transaction') ||
      eventType === 'completed' ||
      eventType === 'succeeded' ||
      eventType === 'success' ||
      eventType === 'confirmed' ||
      // Accepter tous les webhooks avec des données de paiement (format standard)
      data.transaction_id ||
      data.invoice_id ||
      data.amount ||
      // Format spécifique DExchange
      data.id ||                           // ID de transaction DExchange
      data.externalTransactionId ||        // ID externe (notre invoice ID)
      data.AMOUNT ||                       // Montant (format DExchange en majuscules)
      data.STATUS ||                       // Statut (format DExchange en majuscules)
      data.transactionType ||              // Type de transaction DExchange
      // Ou si on a des métadonnées de paiement
      (data.metadata && (data.metadata.invoice_id || data.metadata.transaction_id))
    
    if (!isPaymentEvent) {
      logger.info(`Événement non lié au paiement ignoré: ${eventType}`, { payload: data })
      await logPaymentEvent(supabase, eventType, true, { requestId, payload: data })
      return new Response(
        JSON.stringify({ 
          status: 'ok', 
          message: 'Événement reçu mais ignoré (non lié au paiement)',
          eventType,
          requestId
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Extraire les données pertinentes avec flexibilité pour différents formats
    const paymentData = data.data?.object || data.data || data
    
    // Extraire l'ID de transaction avec différentes structures possibles
    const transactionId = 
      paymentData.id ||                    // DExchange utilise "id" comme transaction ID
      paymentData.transaction_id || 
      paymentData.payment_id ||
      data.transaction_id ||
      data.id ||                          // Fallback sur l'ID racine
      null
    
    if (!transactionId) {
      logger.error(`ID de transaction manquant dans le webhook`, { payload: data })
      await logPaymentEvent(supabase, eventType, false, { requestId, error: 'missing_transaction_id' })
      return new Response(
        JSON.stringify({ 
          error: 'ID de transaction manquant', 
          requestId
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Extraire l'ID de facture des métadonnées ou des champs directs
    let invoiceId = 
      paymentData.metadata?.invoice_id || 
      paymentData.invoice_id || 
      data.invoice_id ||
      // Format DExchange: externalTransactionId contient notre ID de facture
      paymentData.externalTransactionId ||
      data.externalTransactionId ||
      null
    
    // Nettoyer l'ID de facture DExchange (format: INV-uuid-timestamp)
    let originalInvoiceId = invoiceId
    if (invoiceId && invoiceId.startsWith('INV-')) {
      // Extraire le préfixe UUID (partie entre INV- et le premier timestamp)
      const parts = invoiceId.split('-')
      if (parts.length >= 2) {
        // Prendre la partie après INV- comme préfixe de recherche
        invoiceId = parts[1] // Ex: "54252fa3" de "INV-54252fa3-1751071164713"
        logger.info(`Recherche par préfixe UUID`, { original: originalInvoiceId, prefix: invoiceId })
      }
    }
    
    if (!invoiceId) {
      logger.warn(`ID de facture manquant, impossible de mettre à jour`, { transactionId })
      await logPaymentEvent(supabase, eventType, false, { requestId, transactionId, error: 'missing_invoice_id' })
      
      // Stocker l'événement pour traitement manuel ultérieur
      try {
        await supabase
          .from('payment_alerts')
          .insert({
            type: 'orphan_webhook',
            level: 'medium',
            message: `Webhook sans ID de facture reçu`,
            metadata: { requestId, transactionId, data: JSON.stringify(data) },
            resolved: false,
            created_at: timestamp
          })
      } catch (error) {
        logger.error(`Erreur lors de la création de l'alerte:`, { error: error.message })
      }
      
      return new Response(
        JSON.stringify({ 
          status: 'partial', 
          message: 'Événement reçu mais ID de facture manquant',
          requestId,
          transactionId
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Vérifier si le paiement est confirmé
    const isSuccess = 
      paymentData.status === 'completed' || 
      paymentData.status === 'succeeded' ||
      paymentData.STATUS === 'SUCCESS' ||     // Format DExchange en majuscules
      data.STATUS === 'SUCCESS' ||            // Fallback sur data racine
      eventType.includes('success') ||
      eventType.includes('completed') ||
      eventType.includes('succeeded')
    
    // Si le paiement est confirmé, mettre à jour la facture
    if (isSuccess) {
      logger.info(`Paiement confirmé`, { transactionId, invoiceId })
      const result = await markInvoiceAsPaid(supabase, invoiceId, transactionId, paymentData)
      
      if (result.success) {
        logger.success(`Facture marquée comme payée avec succès`, { invoiceId, transactionId })
        await logPaymentEvent(supabase, 'payment_success', true, { 
          requestId, transactionId, invoiceId, amount: paymentData.amount 
        })
        
        // NOUVEAU: Déclencher le traitement Sage de manière asynchrone
        try {
          logger.info(`Déclenchement du traitement Sage`, { invoiceId, transactionId })
          
          // Appel asynchrone à la fonction de traitement Sage
          const sageResponse = await fetch(
            `${Deno.env.get('SUPABASE_URL')}/functions/v1/process-dexchange-payment-for-sage`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                invoice_id: result.invoice.id, // Utiliser l'ID complet de la facture trouvée
                transaction_id: transactionId
              })
            }
          )
          
          if (sageResponse.ok) {
            const sageResult = await sageResponse.json()
            logger.success(`Traitement Sage initié`, { 
              sageStatus: sageResult.status,
              anomalies: sageResult.anomalies?.length || 0
            })
          } else {
            logger.warn(`Échec du traitement Sage`, { 
              status: sageResponse.status,
              statusText: sageResponse.statusText
            })
          }
        } catch (sageError) {
          // Ne pas faire échouer la réponse principale si Sage échoue
          logger.warn(`Erreur lors du traitement Sage`, { error: sageError.message })
        }
        
        return new Response(
          JSON.stringify({ 
            status: 'ok', 
            message: 'Paiement confirmé et facture mise à jour',
            requestId,
            invoiceId,
            transactionId
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      } else {
        logger.error(`Échec de mise à jour de la facture`, { error: result.error })
        await logPaymentEvent(supabase, 'payment_error', false, { 
          requestId, transactionId, invoiceId, error: result.error 
        })
        
        return new Response(
          JSON.stringify({ 
            status: 'error', 
            message: 'Échec de mise à jour de la facture',
            error: result.error,
            requestId,
            invoiceId,
            transactionId
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }
    
    // Si le paiement n'est pas confirmé, juste logger l'événement
    logger.info(`Événement de paiement non confirmé reçu`, { status: paymentData.status })
    await logPaymentEvent(supabase, eventType, true, { requestId, transactionId, invoiceId, status: paymentData.status })
    
    return new Response(
      JSON.stringify({ 
        status: 'ok', 
        message: 'Événement reçu et traité',
        paymentStatus: paymentData.status,
        requestId,
        invoiceId,
        transactionId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
    
  } catch (error) {
    // Gestion des erreurs générales
    logger.error(`Erreur lors du traitement du webhook:`, { error: error.message })
    await logPaymentEvent(supabase, 'processing_error', false, { requestId, error: error.message })
    
    return new Response(
      JSON.stringify({ 
        error: 'Erreur lors du traitement du webhook', 
        details: error.message,
        requestId
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
