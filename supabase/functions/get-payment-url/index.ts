import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control, pragma, expires'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') || '' }
        }
      }
    );

    // Récupérer transactionId de l'URL ou du body
    let transactionId;
    const url = new URL(req.url);
    transactionId = url.searchParams.get('transactionId');

    if (!transactionId && req.method === 'POST') {
      try {
        const body = await req.json();
        transactionId = body.transactionId;
      } catch (e) {
        console.error('Erreur parsing body:', e);
      }
    }

    if (!transactionId) {
      return new Response(
        JSON.stringify({ error: 'transactionId requis', status: 'error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Récupérer la transaction depuis la base de données
    let transaction;
    try {
      const { data, error } = await supabaseClient
        .from('payment_transactions')
        .select('*')
        .eq('transaction_id', transactionId)
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({
            paymentUrl: '',
            status: 'error',
            error: 'Transaction non trouvée'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      
      transaction = data;
    } catch (error) {
      console.error('Erreur DB:', error);
      return new Response(
        JSON.stringify({ 
          paymentUrl: '', 
          status: 'error', 
          error: 'Erreur base de données' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // Vérifier si la transaction a expiré
    const expiresAt = new Date(transaction.created_at);
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minutes d'expiration
    
    // Récupérer l'URL de paiement
    const paymentUrl = transaction.payment_url || transaction.cashout_url || '';
    
    // Extraire les informations pertinentes de la transaction
    const paymentCode = transaction.payment_code || transaction.external_transaction_id || null;
    const paymentProvider = transaction.provider || 'mobile';
    const paymentReference = transaction.reference || transaction.transaction_id;
    const paymentInstructions = transaction.instructions || null;

    // Renvoyer toutes les informations utiles
    return new Response(JSON.stringify({ 
      paymentUrl,
      transactionId: transaction.transaction_id,
      status: transaction.status,
      expiresAt: expiresAt.toISOString(),
      paymentCode,
      paymentProvider,
      paymentReference,
      paymentInstructions,
      phoneNumber: transaction.phone_number
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });

  } catch (error) {
    console.error('Erreur générale:', error);
    
    return new Response(
      JSON.stringify({ 
        status: 'error',
        paymentUrl: '',
        error: error.message || 'Erreur serveur'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200 // On renvoie toujours 200 pour éviter les erreurs 500
      }
    );
  }
});
