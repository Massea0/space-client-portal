// Edge Function simplifiée pour diagnostic
// /supabase/functions/dashboard-analytics-simple/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🧪 Test simple Edge Function...')

    // Authentification basique
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Pas d\'authentification' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Client admin pour accès base
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('📊 Test requête simple...')

    // Test simple : compter les utilisateurs
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .limit(5)

    if (usersError) {
      console.error('❌ Erreur users:', usersError)
      throw new Error(`Erreur users: ${usersError.message}`)
    }

    console.log('✅ Utilisateurs trouvés:', users?.length || 0)

    // Test factures
    const { data: invoices, error: invoicesError } = await supabaseAdmin
      .from('invoices')
      .select('id, number, status, amount')
      .limit(5)

    if (invoicesError) {
      console.error('❌ Erreur factures:', invoicesError)
      throw new Error(`Erreur factures: ${invoicesError.message}`)
    }

    console.log('✅ Factures trouvées:', invoices?.length || 0)

    // Réponse simple
    const result = {
      success: true,
      message: 'Test réussi !',
      data: {
        users_count: users?.length || 0,
        invoices_count: invoices?.length || 0,
        sample_users: users?.map(u => ({ id: u.id, email: u.email, role: u.role })) || [],
        sample_invoices: invoices?.map(i => ({ id: i.id, number: i.number, status: i.status })) || []
      }
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Erreur test simple:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erreur test', 
        details: error.message,
        stack: error.stack 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
