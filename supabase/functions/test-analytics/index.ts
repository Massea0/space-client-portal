// Edge Function de test simple pour diagnostiquer
// /supabase/functions/test-analytics/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gestion CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🧪 Test Edge Function démarrée')

    // Création du client Supabase avec service_role (bypass RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('📊 Test de connexion à la base de données...')

    // Test simple de requête
    const { data: companiesTest, error: companiesError } = await supabaseAdmin
      .from('companies')
      .select('id, name')
      .limit(5)

    if (companiesError) {
      throw new Error(`Erreur companies: ${companiesError.message}`)
    }

    const { data: usersTest, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name, role')
      .limit(5)

    if (usersError) {
      throw new Error(`Erreur users: ${usersError.message}`)
    }

    const { data: ticketsTest, error: ticketsError } = await supabaseAdmin
      .from('tickets')
      .select('id, status, priority')
      .limit(5)

    if (ticketsError) {
      throw new Error(`Erreur tickets: ${ticketsError.message}`)
    }

    const { data: invoicesTest, error: invoicesError } = await supabaseAdmin
      .from('invoices')
      .select('id, status, amount')
      .limit(5)

    if (invoicesError) {
      throw new Error(`Erreur invoices: ${invoicesError.message}`)
    }

    console.log('✅ Toutes les requêtes de test réussies')

    const testResult = {
      status: 'success',
      message: 'Edge Function test réussie',
      data: {
        companies_count: companiesTest?.length || 0,
        users_count: usersTest?.length || 0,
        tickets_count: ticketsTest?.length || 0,
        invoices_count: invoicesTest?.length || 0,
        sample_data: {
          companies: companiesTest,
          users: usersTest,
          tickets: ticketsTest,
          invoices: invoicesTest
        }
      },
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(testResult),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Erreur dans test-analytics:', error)
    return new Response(
      JSON.stringify({ 
        status: 'error',
        error: 'Erreur serveur', 
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
