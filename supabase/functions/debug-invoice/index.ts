import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const url = new URL(req.url);
    const invoiceId = url.searchParams.get('invoiceId') || 'INV-20241230-001';

    console.log(`[debug-invoice] Début debug pour facture: ${invoiceId}`);

    // Récupérer les détails de la facture
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (invoiceError) {
      console.log(`[debug-invoice] Erreur facture:`, invoiceError);
      return new Response(JSON.stringify({ error: 'Facture non trouvée', details: invoiceError }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });
    }

    console.log(`[debug-invoice] Facture trouvée:`, invoice);

    // Vérifier la table payment_transactions
    let paymentTransactions = null;
    let hasPaymentTransactionsTable = true;

    try {
      const { data: transactions, error: transError } = await supabaseClient
        .from('payment_transactions')
        .select('*')
        .eq('invoice_id', invoiceId);

      if (transError && transError.message.includes('does not exist')) {
        hasPaymentTransactionsTable = false;
        console.log(`[debug-invoice] Table payment_transactions n'existe pas`);
      } else if (transError) {
        console.log(`[debug-invoice] Erreur payment_transactions:`, transError);
      } else {
        paymentTransactions = transactions;
        console.log(`[debug-invoice] Transactions trouvées:`, transactions);
      }
    } catch (e) {
      hasPaymentTransactionsTable = false;
      console.log(`[debug-invoice] Exception table payment_transactions:`, e.message);
    }

    // Calculer les conditions de payment-status
    const conditions = {
      invoiceStatusNotPaid: invoice.status !== 'paid',
      paymentMethodIsWave: invoice.payment_method === 'wave',
      shouldCallCheckWaveStatus: invoice.status !== 'paid' && invoice.payment_method === 'wave',
      hasPaymentTransactionsTable,
      paymentTransactionCount: paymentTransactions ? paymentTransactions.length : 0
    };

    console.log(`[debug-invoice] Conditions:`, conditions);

    const result = {
      invoice: {
        id: invoice.id,
        status: invoice.status,
        payment_method: invoice.payment_method,
        amount: invoice.amount,
        created_at: invoice.created_at
      },
      paymentTransactions,
      hasPaymentTransactionsTable,
      conditions,
      explanation: {
        whyNotCallingCheckWaveStatus: !conditions.shouldCallCheckWaveStatus ? 
          `Status: ${invoice.status} (should be !== 'paid'), Payment method: '${invoice.payment_method}' (should be 'wave')` : 
          'Conditions remplies pour appeler check-wave-status'
      }
    };

    return new Response(JSON.stringify(result, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('[debug-invoice] Erreur:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
