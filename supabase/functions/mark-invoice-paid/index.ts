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
    // Utiliser la clé service pour avoir tous les droits
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Accepter l'ID de facture via query parameter ou body
    const url = new URL(req.url);
    let invoiceId = url.searchParams.get('invoiceId');
    
    if (!invoiceId && req.method === 'POST') {
      try {
        const body = await req.json();
        invoiceId = body.invoiceId;
      } catch (e) {
        // Ignorer l'erreur de parsing JSON si on a déjà l'ID via query param
      }
    }

    if (!invoiceId) {
      throw new Error('invoiceId requis (query param ?invoiceId=... ou JSON body)');
    }

    // Marquer la facture comme payée
    const { data: invoice, error: updateError } = await supabaseClient
      .from('invoices')
      .update({ 
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', invoiceId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Erreur mise à jour facture:', updateError);
      throw new Error(`Erreur mise à jour facture: ${updateError.message}`);
    }

    console.log(`✅ Facture ${invoiceId} marquée comme payée`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Facture ${invoiceId} marquée comme payée`,
        invoice
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('❌ Erreur:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur serveur',
        success: false 
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});
