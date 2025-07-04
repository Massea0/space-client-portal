import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

class AppError extends Error {
  statusCode;
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    // Utiliser la clé service pour avoir accès complet
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    // Accepter les paramètres POST ou GET
    let transactionId, invoiceId, testMode;
    
    if (req.method === 'POST') {
      const body = await req.json();
      transactionId = body.transactionId;
      invoiceId = body.invoiceId;
      testMode = body.testMode;
    } else {
      const url = new URL(req.url);
      transactionId = url.searchParams.get('transactionId');
      invoiceId = url.searchParams.get('invoiceId');
      testMode = url.searchParams.get('testMode') === 'true';
    }
    
    console.log('[payment-status] Requête reçue:', { transactionId, invoiceId, testMode, method: req.method });
    
    if (!transactionId && !invoiceId) {
      throw new AppError('transactionId ou invoiceId requis', 400);
    }

    // D'abord, essayer de récupérer les informations de la table payment_transactions
    let transaction: any = null;
    let hasPaymentTransactionsTable = true;
    
    try {
      if (transactionId) {
        const { data, error } = await supabaseClient
          .from('payment_transactions')
          .select('*')
          .eq('transaction_id', transactionId)
          .single();
        if (error && !error.message.includes('does not exist')) {
          throw new AppError('Transaction non trouvée', 404);
        }
        if (error && error.message.includes('does not exist')) {
          hasPaymentTransactionsTable = false;
        } else {
          transaction = data;
        }
      } else if (invoiceId) {
        const { data, error } = await supabaseClient
          .from('payment_transactions')
          .select('*')
          .eq('invoice_id', invoiceId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (error && !error.message.includes('does not exist')) {
          throw new AppError('Transaction non trouvée pour cette facture', 404);
        }
        if (error && error.message.includes('does not exist')) {
          hasPaymentTransactionsTable = false;
        } else {
          transaction = data;
        }
      }
    } catch (tableError) {
      console.log('[payment-status] Table payment_transactions non disponible:', tableError.message);
      hasPaymentTransactionsTable = false;
    }

    // Si la table n'existe pas ou qu'aucune transaction n'a été trouvée, utiliser les données de facture
    if (!hasPaymentTransactionsTable || !transaction) {
      console.log('[payment-status] Utilisation des données de facture uniquement');
      
      const targetInvoiceId = invoiceId || (transaction ? transaction.invoice_id : null);
      if (!targetInvoiceId) {
        throw new AppError('Impossible de déterminer l\'ID de la facture', 400);
      }

      const { data: invoice, error: invoiceError } = await supabaseClient
        .from('invoices')
        .select('id, status, amount, payment_method')
        .eq('id', targetInvoiceId)
        .single();
      
      if (invoiceError) {
        throw new AppError('Facture non trouvée', 404);
      }

      console.log(`[payment-status] Statut de la facture ${invoice.id}: ${invoice.status}`);
      
      // Si c'est un paiement Wave en attente, essayer de vérifier automatiquement le statut
      let finalInvoiceStatus = invoice.status;
      let autoCheckAttempted = false;
      
      if (invoice.status !== 'paid' && invoice.payment_method === 'wave') {
        console.log(`[payment-status] Tentative de vérification automatique Wave pour la facture ${invoice.id}`);
        autoCheckAttempted = true;
        
        try {
          // Appeler la fonction check-wave-status
          const checkResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/check-wave-status`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
            },
            body: JSON.stringify({
              invoiceId: invoice.id,
              testMode: testMode
            })
          });
          
          if (checkResponse.ok) {
            const checkResult = await checkResponse.json();
            console.log(`[payment-status] Résultat de la vérification automatique:`, checkResult);
            
            // Si le statut a été mis à jour, récupérer le nouveau statut
            if (checkResult.success && checkResult.updated) {
              const { data: updatedInvoice } = await supabaseClient
                .from('invoices')
                .select('status')
                .eq('id', invoice.id)
                .single();
              
              if (updatedInvoice) {
                finalInvoiceStatus = updatedInvoice.status;
                console.log(`[payment-status] Statut mis à jour automatiquement: ${finalInvoiceStatus}`);
              }
            }
          } else {
            console.log(`[payment-status] Échec de la vérification automatique: ${checkResponse.status}`);
          }
        } catch (autoCheckError) {
          console.log(`[payment-status] Erreur lors de la vérification automatique:`, autoCheckError.message);
        }
      }
      
      return new Response(
        JSON.stringify({
          status: finalInvoiceStatus === 'paid' ? 'paid' : 'pending',
          invoiceStatus: finalInvoiceStatus,
          transactionId: transactionId || 'unknown',
          externalTransactionId: null,
          paymentMethod: invoice.payment_method || 'unknown',
          autoCheckAttempted: autoCheckAttempted
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200
        }
      );
    }

    // Si la transaction existe, vérifier également la facture pour cohérence
    if (transaction) {
      const { data: invoice, error: invoiceError } = await supabaseClient
        .from('invoices')
        .select('id, status')
        .eq('id', transaction.invoice_id)
        .single();
      
      if (invoiceError) {
        throw new AppError('Facture non trouvée', 404);
      }
      
      // La facture est la source de vérité finale
      let finalStatus = invoice.status === 'paid' ? 'paid' : transaction.status;
      let finalInvoiceStatus = invoice.status;
      let autoCheckAttempted = false;
      
      // Si c'est un paiement Wave en attente, essayer de vérifier automatiquement le statut
      if (invoice.status !== 'paid' && transaction.payment_method === 'wave' && transaction.status !== 'paid') {
        console.log(`[payment-status] Tentative de vérification automatique Wave pour la transaction ${transaction.transaction_id}`);
        autoCheckAttempted = true;
        
        try {
          // Appeler la fonction check-wave-status
          const checkResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/check-wave-status`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
            },
            body: JSON.stringify({
              invoiceId: invoice.id,
              transactionId: transaction.transaction_id,
              testMode: testMode
            })
          });
          
          if (checkResponse.ok) {
            const checkResult = await checkResponse.json();
            console.log(`[payment-status] Résultat de la vérification automatique:`, checkResult);
            
            // Si le statut a été mis à jour, récupérer le nouveau statut
            if (checkResult.success && checkResult.updated) {
              const { data: updatedInvoice } = await supabaseClient
                .from('invoices')
                .select('status')
                .eq('id', invoice.id)
                .single();
              
              if (updatedInvoice) {
                finalInvoiceStatus = updatedInvoice.status;
                finalStatus = updatedInvoice.status === 'paid' ? 'paid' : transaction.status;
                console.log(`[payment-status] Statut mis à jour automatiquement: ${finalInvoiceStatus}`);
              }
            }
          } else {
            console.log(`[payment-status] Échec de la vérification automatique: ${checkResponse.status}`);
          }
        } catch (autoCheckError) {
          console.log(`[payment-status] Erreur lors de la vérification automatique:`, autoCheckError.message);
        }
      }
      
      console.log(`[payment-status] Statut final pour invoice ${invoice.id}: ${finalStatus} (transaction: ${transaction.status}, invoice: ${finalInvoiceStatus})`);
      
      return new Response(
        JSON.stringify({
          status: finalStatus,
          invoiceStatus: finalInvoiceStatus,
          transactionId: transaction.transaction_id,
          externalTransactionId: transaction.external_transaction_id || null,
          paymentMethod: transaction.payment_method,
          autoCheckAttempted: autoCheckAttempted
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200
        }
      );
    }

    // Si aucune transaction trouvée, retourner une erreur
    throw new AppError('Aucune transaction ou facture trouvée', 404);
  } catch (error) {
    console.error('[payment-status] Erreur:', error.message);
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return new Response(
      JSON.stringify({ error: error.message || 'Erreur serveur' }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: statusCode
      }
    );
  }
});
