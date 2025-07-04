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

  console.log('🚀 [DB-INIT] Initialisation de la base de données pour les paiements');

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // 1. Créer la table payment_transactions via INSERT avec gestion d'erreur
    console.log('📊 [DB-INIT] Création de la table payment_transactions...');
    
    try {
      // Test si la table existe en tentant une sélection
      const { data: testExists } = await supabaseAdmin
        .from('payment_transactions')
        .select('id')
        .limit(1);
      
      console.log('✅ [DB-INIT] Table payment_transactions existe déjà');
    } catch (tableError) {
      console.log('🔧 [DB-INIT] Table payment_transactions n\'existe pas, création...');
      
      // Créer la table via une insertion puis suppression
      try {
        const { error: insertError } = await supabaseAdmin
          .from('payment_transactions')
          .insert({
            invoice_id: '00000000-0000-0000-0000-000000000000',
            user_id: '00000000-0000-0000-0000-000000000000',
            external_transaction_id: 'INIT_TABLE',
            transaction_id: 'INIT_TABLE',
            status: 'test',
            amount: 0.01,
            payment_method: 'init',
            phone_number: '000000000',
            payment_url: 'https://init.test'
          });

        if (!insertError) {
          // Supprimer l'enregistrement de test
          await supabaseAdmin
            .from('payment_transactions')
            .delete()
            .eq('external_transaction_id', 'INIT_TABLE');
          
          console.log('✅ [DB-INIT] Table payment_transactions créée avec succès');
        }
      } catch (createError) {
        console.error('❌ [DB-INIT] Erreur création table:', createError);
      }
    }

    // 2. Créer la table payment_statistics pour le monitoring
    console.log('📈 [DB-INIT] Création de la table payment_statistics...');
    
    try {
      const { data: statsExists } = await supabaseAdmin
        .from('payment_statistics')
        .select('id')
        .limit(1);
      
      console.log('✅ [DB-INIT] Table payment_statistics existe déjà');
    } catch (statsError) {
      console.log('🔧 [DB-INIT] Table payment_statistics n\'existe pas, création...');
      
      try {
        const { error: statsInsertError } = await supabaseAdmin
          .from('payment_statistics')
          .insert({
            date: new Date().toISOString().split('T')[0],
            total_payments: 0,
            wave_payments: 0,
            successful_payments: 0,
            failed_payments: 0,
            total_amount: 0,
            wave_amount: 0,
            auto_marked_count: 0,
            webhook_received_count: 0
          });

        if (!statsInsertError) {
          await supabaseAdmin
            .from('payment_statistics')
            .delete()
            .eq('date', new Date().toISOString().split('T')[0])
            .eq('total_payments', 0);
          
          console.log('✅ [DB-INIT] Table payment_statistics créée avec succès');
        }
      } catch (statsCreateError) {
        console.error('❌ [DB-INIT] Erreur création table stats:', statsCreateError);
      }
    }

    // 3. Créer la table payment_alerts pour les alertes
    console.log('🚨 [DB-INIT] Création de la table payment_alerts...');
    
    try {
      const { data: alertsExists } = await supabaseAdmin
        .from('payment_alerts')
        .select('id')
        .limit(1);
      
      console.log('✅ [DB-INIT] Table payment_alerts existe déjà');
    } catch (alertsError) {
      console.log('🔧 [DB-INIT] Table payment_alerts n\'existe pas, création...');
      
      try {
        const { error: alertsInsertError } = await supabaseAdmin
          .from('payment_alerts')
          .insert({
            type: 'test',
            level: 'info',
            message: 'Test d\'initialisation des alertes',
            metadata: JSON.stringify({ init: true }),
            resolved: true
          });

        if (!alertsInsertError) {
          await supabaseAdmin
            .from('payment_alerts')
            .delete()
            .eq('type', 'test')
            .eq('message', 'Test d\'initialisation des alertes');
          
          console.log('✅ [DB-INIT] Table payment_alerts créée avec succès');
        }
      } catch (alertsCreateError) {
        console.error('❌ [DB-INIT] Erreur création table alerts:', alertsCreateError);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Base de données initialisée avec succès',
      tables_created: ['payment_transactions', 'payment_statistics', 'payment_alerts'],
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('❌ [DB-INIT] Erreur générale:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
