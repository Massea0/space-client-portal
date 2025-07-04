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

  console.log('🚀 Tentative de création de la table payment_transactions');

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Essayons d'abord de créer une transaction simple pour tester si la table existe
    try {
      const { data: testData, error: testError } = await supabaseClient
        .from('payment_transactions')
        .select('id')
        .limit(1);
      
      if (!testError) {
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Table payment_transactions existe déjà',
          existing: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }
    } catch (e) {
      console.log('Table payment_transactions n\'existe pas, tentative de création...');
    }

    // Créer une transaction de test pour déclencher la création de la table
    // Cette approche utilise le fait que Supabase peut créer automatiquement des tables
    const testTransaction = {
      invoice_id: '00000000-0000-0000-0000-000000000000',
      user_id: '00000000-0000-0000-0000-000000000000',
      external_transaction_id: 'test-creation',
      transaction_id: 'test-creation',
      status: 'test',
      amount: 0,
      payment_method: 'test',
      phone_number: 'test',
      payment_url: 'test'
    };

    const { data: insertData, error: insertError } = await supabaseClient
      .from('payment_transactions')
      .insert(testTransaction);

    if (insertError) {
      console.error('Erreur lors de la création:', insertError);
      throw insertError;
    }

    // Supprimer immédiatement la transaction de test
    const { error: deleteError } = await supabaseClient
      .from('payment_transactions')
      .delete()
      .eq('external_transaction_id', 'test-creation');

    if (deleteError) {
      console.warn('Impossible de supprimer la transaction de test:', deleteError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Table payment_transactions créée avec succès'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Erreur:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      details: 'Tentative de création de la table payment_transactions échouée'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
