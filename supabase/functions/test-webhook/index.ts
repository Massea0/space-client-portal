import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// En-têtes CORS pour les réponses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🧪 [TEST-WEBHOOK] Test endpoint appelé');
  console.log(`🧪 [TEST-WEBHOOK] URL: ${req.url}`);
  console.log(`🧪 [TEST-WEBHOOK] Méthode: ${req.method}`);
  
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Lire le corps de la requête s'il y en a un
    let body = '';
    if (req.method === 'POST') {
      body = await req.text();
      console.log(`🧪 [TEST-WEBHOOK] Corps reçu: ${body}`);
    }

    // Test d'appel du vrai callback handler
    console.log('🔗 [TEST-WEBHOOK] Test d\'appel du callback handler...');
    
    const callbackUrl = 'https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/dexchange-callback-handler';
    const testPayload = {
      type: 'payment.success',
      transaction: {
        id: 'test-transaction-' + Date.now(),
        status: 'succeeded',
        external_transaction_id: 'INV-test-webhook-12345'
      }
    };

    const response = await fetch(callbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': 'test-secret-123'
      },
      body: JSON.stringify(testPayload)
    });

    const responseText = await response.text();
    console.log(`📡 [TEST-WEBHOOK] Réponse callback: ${response.status} - ${responseText}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Test webhook endpoint fonctionnel',
      timestamp: new Date().toISOString(),
      callbackTest: {
        status: response.status,
        response: responseText
      },
      receivedBody: body
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('❌ [TEST-WEBHOOK] Erreur:', error);
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
