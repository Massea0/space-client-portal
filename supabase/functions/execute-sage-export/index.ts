// execute-sage-export/index.ts (version simplifiée pour test)
// Edge Function pour exécuter l'exportation finale vers Sage après validation admin

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// En-têtes CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

// Logging
function createLogger(requestId: string) {
  return {
    info: (message: string, data?: any) => {
      console.log(`[SAGE-EXPORT:${requestId}] ${message}`, data ? JSON.stringify(data) : '')
    },
    warn: (message: string, data?: any) => {
      console.warn(`[SAGE-EXPORT:${requestId}] ${message}`, data ? JSON.stringify(data) : '')
    },
    error: (message: string, data?: any) => {
      console.error(`[SAGE-EXPORT:${requestId}] ${message}`, data ? JSON.stringify(data) : '')
    },
    success: (message: string, data?: any) => {
      console.log(`[SAGE-EXPORT:${requestId}] ✅ ${message}`, data ? JSON.stringify(data) : '')
    }
  }
}

// Fonction pour simuler l'export vers Sage API (mode test)
function simulateSageApiExport(sageData: any): any {
  console.log('🧪 Mode test Sage - simulation de l\'export API');
  
  // Simuler un appel API réussi
  return {
    sage_transaction_id: `SAGE_TXN_${Date.now()}`,
    status: 'exported',
    exported_at: new Date().toISOString(),
    sage_response: {
      transaction_type: sageData.transaction_type,
      customer_code: sageData.customer_code,
      amount: sageData.amount,
      reference: sageData.invoice_reference,
      external_reference: sageData.external_reference
    }
  };
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
    // Pour les tests, on skip l'authentification admin
    logger.info('Mode test - authentification admin simulée')

    // Parser la requête
    const { invoice_id, action } = await req.json()

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

    logger.info('Export Sage initié', { invoice_id, action })

    // Récupérer la facture avec les données Sage
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, companies(*)')
      .eq('id', invoice_id)
      .single()

    if (invoiceError || !invoice) {
      throw new Error(`Facture non trouvée: ${invoice_id}`)
    }

    if (!invoice.sage_export_details) {
      throw new Error('Aucune donnée Sage à exporter - traitement IA requis')
    }

    if (invoice.sage_export_status === 'exported') {
      throw new Error('Facture déjà exportée vers Sage')
    }

    logger.info('Données Sage trouvées', {
      invoiceNumber: invoice.number,
      customerCode: invoice.sage_export_details.customer_code,
      amount: invoice.sage_export_details.amount
    })

    // Exporter vers Sage API (simulé)
    const exportResult = simulateSageApiExport(invoice.sage_export_details)

    logger.info('Export Sage simulé', {
      sageTransactionId: exportResult.sage_transaction_id
    })

    // Mettre à jour le statut dans la base de données
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        sage_export_status: 'exported',
        sage_export_at: exportResult.exported_at,
        sage_transaction_id: exportResult.sage_transaction_id,
        sage_processed_by: '9003705c-1234-4299-b8e6-14d24066b617' // ID utilisateur test qu'on a créé
      })
      .eq('id', invoice_id)

    if (updateError) {
      throw new Error(`Erreur de mise à jour: ${updateError.message}`)
    }

    logger.success('Export Sage terminé', {
      sageTransactionId: exportResult.sage_transaction_id,
      status: 'exported'
    })

    return new Response(JSON.stringify({
      success: true,
      status: 'exported',
      sage_transaction_id: exportResult.sage_transaction_id,
      exported_at: exportResult.exported_at,
      sage_response: exportResult.sage_response,
      requestId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    logger.error('Erreur lors de l\'export Sage', { error: error.message })

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
