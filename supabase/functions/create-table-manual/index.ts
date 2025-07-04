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

    // Tentative de création de la table payment_transactions
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        invoice_id UUID NOT NULL,
        user_id UUID NOT NULL,
        external_transaction_id TEXT,
        transaction_id TEXT,
        status TEXT NOT NULL DEFAULT 'initiated',
        amount DECIMAL(10,2) NOT NULL,
        payment_method TEXT NOT NULL,
        phone_number TEXT,
        payment_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_invoice_id ON payment_transactions(invoice_id);
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_external_transaction_id ON payment_transactions(external_transaction_id);
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);
      
      ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
    `;

    // Utiliser une requête SQL directe pour créer la table
    const { data, error } = await supabaseClient.rpc('exec', { sql: createTableSQL });

    if (error) {
      console.error('Erreur lors de la création de la table:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.message,
        attempted_sql: createTableSQL 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Table payment_transactions créée avec succès',
      sql_executed: createTableSQL
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Erreur:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
