// Edge Function pour l'enregistrement de l'activité client
// Mission 3: Support Prédictif et Tickets Proactifs
// Fichier: /supabase/functions/log-client-activity/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ActivityLog {
  user_id: string;
  activity_type: 'page_view' | 'faq_search' | 'form_error' | 'service_access' | 'login_attempt' | 'login_failed' | 'support_search' | 'ticket_view' | 'error_occurred' | 'timeout_occurred';
  details: Record<string, any>;
}

serve(async (req) => {
  // Gestion CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Création du client Supabase avec service_role pour bypasser RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Vérification de l'authentification utilisateur
    const authHeader = req.headers.get('Authorization')!
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      console.log('❌ Erreur authentification:', authError)
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { activity_type, details = {} }: Omit<ActivityLog, 'user_id'> = await req.json()

    if (!activity_type) {
      return new Response(
        JSON.stringify({ error: 'activity_type requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`📊 Logging activité pour utilisateur ${user.id}: ${activity_type}`)

    // Enrichissement automatique des détails
    const enrichedDetails = {
      ...details,
      user_agent: req.headers.get('User-Agent') || '',
      timestamp: new Date().toISOString(),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    }

    // Insertion du log d'activité
    const { data: logData, error: logError } = await supabaseAdmin
      .from('client_activity_logs')
      .insert([{
        user_id: user.id,
        activity_type,
        details: enrichedDetails
      }])
      .select()

    if (logError) {
      console.error('❌ Erreur insertion log:', logError)
      return new Response(
        JSON.stringify({ error: 'Erreur lors de l\'enregistrement', details: logError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Log d\'activité enregistré:', logData[0])

    // Vérification si nous devons déclencher une analyse proactive
    // (seulement pour certains types d'activité critiques)
    const criticalActivities = ['form_error', 'login_failed', 'error_occurred', 'timeout_occurred']
    
    if (criticalActivities.includes(activity_type)) {
      console.log(`🚨 Activité critique détectée: ${activity_type} - Déclenchement analyse proactive`)
      
      // Comptage des activités critiques récentes (dernières 24h)
      const { data: recentCriticalLogs, error: countError } = await supabaseAdmin
        .from('client_activity_logs')
        .select('id, activity_type, timestamp')
        .eq('user_id', user.id)
        .in('activity_type', criticalActivities)
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false })

      if (!countError && recentCriticalLogs && recentCriticalLogs.length >= 3) {
        console.log(`🚨 Seuil critique atteint: ${recentCriticalLogs.length} activités critiques en 24h`)
        
        // Déclenchement de l'analyse proactive via une autre Edge Function
        try {
          const proactiveResponse = await fetch(
            `${Deno.env.get('SUPABASE_URL')}/functions/v1/proactive-ticket-creator`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                user_id: user.id,
                trigger_reason: 'critical_activity_threshold',
                activity_logs: recentCriticalLogs
              })
            }
          )

          if (proactiveResponse.ok) {
            console.log('✅ Analyse proactive déclenchée avec succès')
          } else {
            console.log('⚠️ Erreur déclenchement analyse proactive:', await proactiveResponse.text())
          }
        } catch (proactiveError) {
          console.log('⚠️ Erreur appel analyse proactive:', proactiveError)
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        log_id: logData[0].id,
        message: 'Activité enregistrée avec succès'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Erreur dans log-client-activity:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur serveur', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
