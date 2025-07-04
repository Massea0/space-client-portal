// process-dexchange-payment-for-sage/index.ts (version simplifiée pour test)
// Edge Function pour traiter les paiements DExchange confirmés et les préparer pour Sage

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// En-têtes CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

// Logging amélioré
function createLogger(requestId: string) {
  return {
    info: (message: string, data?: any) => {
      console.log(`[SAGE-PROCESS:${requestId}] ${message}`, data ? JSON.stringify(data) : '')
    },
    warn: (message: string, data?: any) => {
      console.warn(`[SAGE-PROCESS:${requestId}] ${message}`, data ? JSON.stringify(data) : '')
    },
    error: (message: string, data?: any) => {
      console.error(`[SAGE-PROCESS:${requestId}] ${message}`, data ? JSON.stringify(data) : '')
    },
    success: (message: string, data?: any) => {
      console.log(`[SAGE-PROCESS:${requestId}] ✅ ${message}`, data ? JSON.stringify(data) : '')
    }
  }
}

// Fonction pour simuler le mapping Sage (mode test)
function mapPaymentDataForSage(invoiceData: any, transactionData: any, companyData: any): any {
  console.log('🧪 Mode test Sage - simulation du traitement IA');
    
  return {
    sage_data: {
      transaction_type: "customer_payment",
      customer_code: `CLIENT_${companyData.id?.slice(0, 8) || 'TEST'}`,
      invoice_reference: invoiceData.number,
      amount: invoiceData.amount,
      currency: "XOF",
      payment_date: invoiceData.paid_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      payment_method: "VIREMENT_DEXCHANGE",
      account_code_debit: "512000", // Banque
      account_code_credit: "411000", // Clients
      description: `Paiement facture ${invoiceData.number} via DExchange`,
      external_reference: transactionData.transaction_id,
      vat_amount: 0.00,
      vat_rate: 0.00,
      bank_account_id: "DEXCHANGE_BANK",
      sage_company_id: companyData.id
    },
    anomalies: [
      {
        level: "warning",
        message: "Données générées en mode test - vérification recommandée",
        field: "all",
        suggestion: "Configurer GEMINI_API_KEY pour un traitement IA réel"
      }
    ],
    validation_needed: true,
    confidence_score: 0.85
  };
}

// Fonction pour récupérer les données complètes de la facture et transaction
async function getInvoiceCompleteData(supabase: any, invoiceId: string, transactionId?: string) {
  // Récupérer la facture
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single()

  if (invoiceError || !invoice) {
    throw new Error(`Facture non trouvée: ${invoiceId}`)
  }

  // Récupérer l'entreprise
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('id', invoice.company_id)
    .single()

  if (companyError || !company) {
    throw new Error(`Entreprise non trouvée: ${invoice.company_id}`)
  }

  // Récupérer les détails de la transaction de paiement (optionnel)
  let transaction: any = null
  
  if (transactionId) {
    try {
      const { data: transactionData, error: transactionError } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('invoice_id', invoiceId)
        .eq('transaction_id', transactionId)
        .single()

      if (!transactionError && transactionData) {
        transaction = transactionData
      }
    } catch (e) {
      console.log('Table payment_transactions non disponible, utilisation de données simulées')
    }
  }
  
  // Si pas de transaction trouvée, créer des données simulées
  if (!transaction) {
    transaction = {
      id: `sim-${invoiceId.slice(0, 8)}`,
      transaction_id: transactionId || `DEXCHANGE-${Date.now()}`,
      external_transaction_id: `EXT-${invoice.number}`,
      invoice_id: invoiceId,
      user_id: '00000000-0000-0000-0000-000000000000',
      payment_method: 'dexchange',
      amount: invoice.amount,
      currency: invoice.currency || 'XOF',
      status: 'completed',
      created_at: invoice.paid_at || new Date().toISOString()
    }
  }

  return { invoice, company, transaction }
}

// Fonction principale
serve(async (req) => {
  // Générer un ID unique pour cette requête
  const requestId = crypto.randomUUID().slice(0, 8)
  const timestamp = new Date().toISOString()
  const logger = createLogger(requestId)
  
  // Vérifier la configuration Supabase
  if (!Deno.env.get('SUPABASE_URL') || !Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
    logger.error('Configuration Supabase manquante')
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Configuration serveur incomplète',
        requestId
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Client Supabase avec privilèges admin
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  )

  // Gérer les requêtes CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Méthode non autorisée' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const { invoice_id, transaction_id } = await req.json()

    if (!invoice_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'invoice_id requis',
        requestId
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    logger.info('Traitement Sage initié', { invoice_id, transaction_id: transaction_id || 'simulé' })

    // Récupérer les données complètes
    const { invoice, company, transaction } = await getInvoiceCompleteData(supabase, invoice_id, transaction_id)

    logger.info('Données récupérées', { 
      invoiceNumber: invoice.number,
      companyName: company.name,
      transactionAmount: transaction.amount
    })

    // Appeler le mapping IA (simulé)
    const mappingResult = mapPaymentDataForSage(invoice, transaction, company)

    logger.info('Mapping Sage généré', {
      customerCode: mappingResult.sage_data.customer_code,
      anomaliesCount: mappingResult.anomalies.length
    })

    // Sauvegarder le résultat dans la base de données
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        sage_export_status: 'ai_processed',
        sage_export_details: mappingResult.sage_data,
        sage_anomalies: mappingResult.anomalies,
        sage_validation_needed: mappingResult.validation_needed
      })
      .eq('id', invoice_id)

    if (updateError) {
      throw new Error(`Erreur de sauvegarde: ${updateError.message}`)
    }

    logger.success('Traitement Sage terminé', {
      status: 'ai_processed',
      validationNeeded: mappingResult.validation_needed
    })

    return new Response(JSON.stringify({
      success: true,
      status: 'ai_processed',
      sage_data: mappingResult.sage_data,
      anomalies: mappingResult.anomalies,
      validation_needed: mappingResult.validation_needed,
      confidence_score: mappingResult.confidence_score,
      requestId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    logger.error('Erreur lors du traitement Sage', { error: error.message })

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      requestId
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
