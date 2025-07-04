// Edge Function pour la création proactive de tickets
// Mission 3: Support Prédictif et Tickets Proactifs
// Fichier: /supabase/functions/proactive-ticket-creator/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProactiveRequest {
  user_id: string;
  trigger_reason: string;
  activity_logs?: any[];
  company_id?: string;
}

interface GeminiAnalysisResult {
  problemDetected: boolean;
  ticketSubject: string;
  ticketDescription: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  confidence: number;
  reasoning: string;
}

serve(async (req) => {
  // Gestion CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Création du client Supabase avec service_role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id, trigger_reason, activity_logs = [], company_id }: ProactiveRequest = await req.json()

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`🔍 Analyse proactive démarrée pour utilisateur ${user_id}, raison: ${trigger_reason}`)

    // Récupération des informations utilisateur et entreprise
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select(`
        id, email, first_name, last_name,
        companies!inner(id, name, sector, activity_type)
      `)
      .eq('id', user_id)
      .single()

    if (userError || !userData) {
      console.error('❌ Erreur récupération utilisateur:', userError)
      return new Response(
        JSON.stringify({ error: 'Utilisateur non trouvé' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const company = userData.companies
    const actualCompanyId = company_id || company.id

    // Récupération de l'historique d'activité récent (7 derniers jours)
    const { data: recentActivity, error: activityError } = await supabaseAdmin
      .from('client_activity_logs')
      .select('*')
      .eq('user_id', user_id)
      .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false })
      .limit(50)

    if (activityError) {
      console.error('❌ Erreur récupération activité:', activityError)
    }

    // Récupération des tickets récents pour contexte
    const { data: recentTickets, error: ticketsError } = await supabaseAdmin
      .from('tickets')
      .select('id, subject, status, priority, created_at')
      .eq('company_id', actualCompanyId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10)

    if (ticketsError) {
      console.error('❌ Erreur récupération tickets:', ticketsError)
    }

    // Construction du prompt pour Gemini
    const activitySummary = (recentActivity || []).map(log => 
      `${log.timestamp}: ${log.activity_type} - ${JSON.stringify(log.details)}`
    ).join('\n')

    const ticketsSummary = (recentTickets || []).map(ticket =>
      `${ticket.created_at}: ${ticket.subject} (${ticket.status}, ${ticket.priority})`
    ).join('\n')

    const prompt = `
Tu es un expert en support client pour Arcadis Space, une plateforme de services professionnels.

ANALYSE PRÉDICTIVE DE PROBLÈMES CLIENT

Informations Client:
- Nom: ${userData.first_name} ${userData.last_name}
- Email: ${userData.email}
- Entreprise: ${company.name} (${company.sector})
- Déclencheur: ${trigger_reason}

Activité Récente (7 derniers jours):
${activitySummary || 'Aucune activité enregistrée'}

Tickets Récents (30 derniers jours):
${ticketsSummary || 'Aucun ticket récent'}

Logs Déclencheurs:
${activity_logs.map(log => `${log.timestamp}: ${log.activity_type} - ${JSON.stringify(log.details)}`).join('\n')}

MISSION:
Analyse ces données pour détecter si un problème client est probable et si un ticket proactif devrait être créé.

Critères de détection:
- Erreurs répétées (form_error, login_failed, error_occurred)
- Patterns de comportement suspects (timeouts, recherches FAQ fréquentes)
- Dégradation de l'expérience utilisateur
- Signaux faibles indiquant une frustration croissante

Réponds UNIQUEMENT avec un JSON valide dans ce format:
{
  "problemDetected": boolean,
  "ticketSubject": "Titre clair et professionnel du problème détecté",
  "ticketDescription": "Description détaillée du problème potentiel basée sur l'analyse des données, avec suggestion de résolution proactive",
  "priority": "low|medium|high|urgent",
  "category": "technique|compte|facturation|fonctionnalité|autre",
  "confidence": 0.0-1.0,
  "reasoning": "Explication courte de pourquoi ce problème a été détecté"
}

Si aucun problème significatif n'est détecté, retourne problemDetected: false.
`

    console.log('🧠 Appel à Gemini pour analyse prédictive...')

    // Appel à l'API Gemini
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY non configurée')
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    )

    if (!geminiResponse.ok) {
      throw new Error(`Erreur Gemini API: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()
    const generatedText = geminiData.candidates[0].content.parts[0].text

    console.log('📝 Réponse brute Gemini:', generatedText)

    // Extraction et parsing du JSON
    let analysis: GeminiAnalysisResult
    try {
      const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/) || [null, generatedText]
      const jsonText = jsonMatch[1] || generatedText
      analysis = JSON.parse(jsonText.trim())
    } catch (parseError) {
      console.log('⚠️ Erreur parsing JSON, utilisation du fallback')
      
      // Fallback basique basé sur les types d'activité
      const criticalCount = activity_logs.filter(log => 
        ['form_error', 'login_failed', 'error_occurred', 'timeout_occurred'].includes(log.activity_type)
      ).length

      analysis = {
        problemDetected: criticalCount >= 3,
        ticketSubject: 'Problèmes techniques détectés - Assistance proactive',
        ticketDescription: `Notre système a détecté ${criticalCount} incidents techniques récents sur votre compte. Notre équipe souhaite vous aider à résoudre ces problèmes pour améliorer votre expérience.`,
        priority: criticalCount >= 5 ? 'urgent' : criticalCount >= 3 ? 'high' : 'medium',
        category: 'technique',
        confidence: 0.7,
        reasoning: `Fallback activé: ${criticalCount} activités critiques détectées`
      }
    }

    console.log('🎯 Analyse terminée:', analysis)

    // Si aucun problème détecté
    if (!analysis.problemDetected) {
      console.log('✅ Aucun problème détecté, pas de ticket créé')
      return new Response(
        JSON.stringify({ 
          success: true, 
          problemDetected: false,
          message: 'Analyse terminée, aucun problème significatif détecté'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Création du ticket proactif
    const { data: ticketData, error: ticketError } = await supabaseAdmin
      .from('tickets')
      .insert([{
        company_id: actualCompanyId,
        subject: analysis.ticketSubject,
        description: analysis.ticketDescription,
        priority: analysis.priority,
        category: analysis.category,
        status: 'suggested', // Statut spécial pour tickets proactifs
        is_proactive: true,
        proactive_analysis: {
          confidence: analysis.confidence,
          reasoning: analysis.reasoning,
          trigger_reason,
          activity_logs_count: activity_logs.length,
          gemini_analysis: analysis,
          created_by_ai: true,
          analysis_timestamp: new Date().toISOString()
        }
      }])
      .select()

    if (ticketError) {
      console.error('❌ Erreur création ticket:', ticketError)
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création du ticket', details: ticketError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const createdTicket = ticketData[0]
    console.log('✅ Ticket proactif créé:', createdTicket.id)

    // Création d'une alerte IA pour l'équipe support
    await supabaseAdmin
      .from('ai_alerts')
      .insert([{
        entity_type: 'ticket',
        entity_id: createdTicket.id,
        alert_type: 'proactive_ticket_created',
        message: `Ticket proactif créé pour ${company.name} - ${analysis.ticketSubject}`,
        priority: analysis.priority,
        data: {
          ticket_id: createdTicket.id,
          company_name: company.name,
          user_email: userData.email,
          confidence: analysis.confidence,
          trigger_reason
        }
      }])

    return new Response(
      JSON.stringify({
        success: true,
        problemDetected: true,
        ticket: {
          id: createdTicket.id,
          subject: createdTicket.subject,
          priority: createdTicket.priority,
          category: createdTicket.category
        },
        analysis: {
          confidence: analysis.confidence,
          reasoning: analysis.reasoning
        },
        message: 'Ticket proactif créé avec succès'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Erreur dans proactive-ticket-creator:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur serveur', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
