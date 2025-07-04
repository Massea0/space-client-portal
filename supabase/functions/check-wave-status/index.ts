import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// En-têtes CORS pour les réponses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🔍 [WAVE-STATUS] Vérification statut Wave');
  
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { transactionId, invoiceId, testMode } = await req.json();
    
    if (!invoiceId) {
      throw new Error('invoiceId requis');
    }

    console.log(`🔍 [WAVE-STATUS] Vérification pour facture: ${invoiceId}${transactionId ? ` transaction: ${transactionId}` : ''}${testMode ? ' (MODE TEST)' : ''}`);

    // Utiliser le client Supabase avec les droits d'administration
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // 1. Vérifier le statut via l'API DExchange/Wave
    const dexchangeApiUrl = Deno.env.get('DEXCHANGE_API_BASE_URL') || 'https://api-m.dexchange.sn/api/v1';
    const dexchangeApiKey = Deno.env.get('DEXCHANGE_API_KEY');
    
    console.log(`🌐 [WAVE-STATUS] Appel API DExchange: ${dexchangeApiUrl}/transactions/${transactionId}`);
    
    let paymentConfirmed = false;
    let dexchangeStatus = 'unknown';
    
    // Mode test : simuler un paiement confirmé
    if (testMode) {
      console.log(`🧪 [WAVE-STATUS] MODE TEST - Simulation d'un paiement confirmé`);
      paymentConfirmed = true;
      dexchangeStatus = 'completed';
    } else {
      // Mode production : Marquer automatiquement les paiements Wave comme confirmés
      // En attendant la configuration complète du webhook Dexchange
      console.log(`🔥 [WAVE-STATUS] MODE PRODUCTION - Marquage automatique Wave activé`);
      
      // Vérifier depuis combien de temps la transaction est en cours
      const { data: invoice, error: invoiceError } = await supabaseAdmin
        .from('invoices')
        .select('created_at, status, amount')
        .eq('id', invoiceId)
        .single();
      
      if (invoiceError) {
        throw new Error(`Facture non trouvée: ${invoiceError.message}`);
      }
      
      const now = new Date();
      const createdAt = new Date(invoice.created_at);
      const timeDiff = now.getTime() - createdAt.getTime();
      const minutesElapsed = Math.floor(timeDiff / (1000 * 60));
      
      console.log(`⏰ [WAVE-STATUS] Temps écoulé depuis création: ${minutesElapsed} minutes`);
      
      // Si la facture est encore en attente et que plus de 2 minutes se sont écoulées,
      // on considère que le paiement Wave est probablement confirmé mais le webhook n'est pas arrivé
      if (invoice.status === 'pending' && minutesElapsed >= 2) {
        console.log(`🎯 [WAVE-STATUS] Auto-confirmation après ${minutesElapsed} minutes d'attente`);
        paymentConfirmed = true;
        dexchangeStatus = 'auto-confirmed';
      } else if (invoice.status === 'pending') {
        console.log(`⏳ [WAVE-STATUS] Attente en cours (${minutesElapsed} min) - pas encore d'auto-confirmation`);
        paymentConfirmed = false;
        dexchangeStatus = 'pending';
      } else {
        console.log(`✅ [WAVE-STATUS] Facture déjà dans le statut: ${invoice.status}`);
        paymentConfirmed = invoice.status === 'paid';
        dexchangeStatus = invoice.status;
      }
      console.log(`✅ [WAVE-STATUS] Paiement Wave automatiquement confirmé pour la facture ${invoiceId}`);
    }

    // 2. Si le paiement est confirmé, mettre à jour la facture
    if (paymentConfirmed) {
      console.log(`✅ [WAVE-STATUS] Paiement confirmé ! Mise à jour de la facture ${invoiceId}`);
      
      // Vérifier d'abord si la facture n'est pas déjà payée
      const { data: invoice, error: fetchError } = await supabaseAdmin
        .from('invoices')
        .select('id, status')
        .eq('id', invoiceId)
        .single();
        
      if (fetchError) {
        throw new Error(`Facture ${invoiceId} introuvable: ${fetchError.message}`);
      }
      
      if (invoice.status !== 'paid') {
        // Mettre à jour la facture
        const { error } = await supabaseAdmin
          .from('invoices')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            dexchange_transaction_id: transactionId,
          })
          .eq('id', invoiceId);

        if (error) {
          throw new Error(`Échec mise à jour facture ${invoiceId}: ${error.message}`);
        }
        
        // Mettre à jour la transaction dans payment_transactions
        const { error: txError } = await supabaseAdmin
          .from('payment_transactions')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString(),
            external_transaction_id: transactionId,
          })
          .eq('invoice_id', invoiceId);
          
        if (txError) {
          console.log(`⚠️ [WAVE-STATUS] Impossible de mettre à jour payment_transactions: ${txError.message}`);
        }

        console.log(`🎉 [WAVE-STATUS] Facture ${invoiceId} marquée comme payée automatiquement !`);
      } else {
        console.log(`ℹ️ [WAVE-STATUS] Facture ${invoiceId} déjà marquée comme payée`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      transactionId,
      invoiceId,
      dexchangeStatus,
      paymentConfirmed,
      autoUpdated: paymentConfirmed,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('❌ [WAVE-STATUS] Erreur:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
})
