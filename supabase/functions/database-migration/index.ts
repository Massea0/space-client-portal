import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variables Supabase manquantes')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { action } = await req.json()

    if (action === 'add_currency_column') {
      console.log('🔨 Ajout de la colonne currency...')
      
      // Vérifier d'abord si la colonne existe déjà
      try {
        const { data: testData, error: testError } = await supabase
          .from('invoices')
          .select('currency')
          .limit(1)
        
        if (!testError) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'La colonne currency existe déjà',
              existing: true 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      } catch (e) {
        console.log('La colonne currency n\'existe pas encore, ajout en cours...')
      }
      
      // Ajouter la colonne currency
      const { data, error } = await supabase
        .from('invoices')
        .select('id')
        .limit(0) // Ne pas récupérer de données, juste tester la requête
      
      if (error) {
        console.error('Erreur lors du test de la table:', error)
      }
      
      // Utiliser une requête SQL raw pour ajouter la colonne
      const addColumnQuery = `
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'invoices' 
            AND column_name = 'currency'
          ) THEN
            ALTER TABLE invoices ADD COLUMN currency TEXT DEFAULT 'XOF' NOT NULL;
            CREATE INDEX IF NOT EXISTS idx_invoices_currency ON invoices(currency);
          END IF;
        END $$;
      `
      
      try {
        const { data: sqlData, error: sqlError } = await supabase
          .rpc('exec_sql', { sql_query: addColumnQuery })
        
        if (sqlError) {
          throw sqlError
        }
        
        // Mettre à jour les factures existantes sans devise
        const { error: updateError } = await supabase
          .from('invoices')
          .update({ currency: 'XOF' })
          .is('currency', null)
        
        if (updateError) {
          console.warn('Avertissement lors de la mise à jour:', updateError)
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Colonne currency ajoutée avec succès',
            sqlExecuted: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
        
      } catch (sqlErr) {
        console.error('Erreur SQL:', sqlErr)
        
        // Dernière tentative : migration manuelle simple
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Impossible d\'ajouter la colonne currency',
            details: sqlErr.message,
            suggestion: 'Veuillez ajouter manuellement la colonne dans le dashboard Supabase'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Action non reconnue' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur dans database-migration:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
