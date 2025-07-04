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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Creating payment_transactions table...');

    // Créer la table directement
    const { data, error } = await supabaseClient
      .from('_dummy')
      .select('1');

    // Tenter de créer la table via une requête brute PostgreSQL 
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.payment_transactions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        transaction_id TEXT UNIQUE NOT NULL,
        external_transaction_id TEXT,
        invoice_id UUID NOT NULL,
        user_id UUID NOT NULL,
        payment_method TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency TEXT DEFAULT 'XOF' NOT NULL,
        status TEXT DEFAULT 'pending' NOT NULL,
        phone_number TEXT,
        payment_url TEXT,
        payment_code TEXT,
        payment_instructions TEXT,
        expires_at TIMESTAMPTZ,
        paid_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
      
      ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "payment_transactions_select_policy" ON public.payment_transactions;
      DROP POLICY IF EXISTS "payment_transactions_insert_policy" ON public.payment_transactions;
      DROP POLICY IF EXISTS "payment_transactions_update_policy" ON public.payment_transactions;
      
      CREATE POLICY "payment_transactions_select_policy" ON public.payment_transactions
        FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');
      
      CREATE POLICY "payment_transactions_insert_policy" ON public.payment_transactions
        FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');
      
      CREATE POLICY "payment_transactions_update_policy" ON public.payment_transactions
        FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');
    `;

    // Essayer d'insérer un enregistrement test pour voir si la table existe
    try {
      const { data: testInsert, error: testError } = await supabaseClient
        .from('payment_transactions')
        .insert({
          transaction_id: 'test-' + Math.random(),
          invoice_id: '00000000-0000-0000-0000-000000000000',
          user_id: '00000000-0000-0000-0000-000000000000',
          payment_method: 'test',
          amount: 0
        });

      if (testError && testError.message.includes('does not exist')) {
        throw new Error('Table does not exist');
      }

      // Si l'insertion fonctionne, supprimer l'enregistrement test
      await supabaseClient
        .from('payment_transactions')
        .delete()
        .eq('payment_method', 'test');

      console.log('Table payment_transactions already exists');
      
      return new Response(
        JSON.stringify({ message: 'Table payment_transactions already exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );

    } catch (insertError) {
      console.log('Table does not exist, trying to create...');
      
      return new Response(
        JSON.stringify({ 
          error: 'Cannot create table via Edge Function. Please create manually via Supabase Dashboard.',
          sql: createTableSQL 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
