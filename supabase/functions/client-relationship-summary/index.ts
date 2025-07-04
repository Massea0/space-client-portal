// supabase/functions/client-relationship-summary/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RelationshipSummaryRequest {
  company_id: string;
}

interface FinancialMetrics {
  total_revenue: number;
  average_invoice_amount: number;
  payment_reliability: 'excellent' | 'good' | 'fair' | 'poor';
  outstanding_amount: number;
  last_payment_date: string | null;
}

interface ServiceMetrics {
  active_services: string[];
  recent_projects: string[];
  satisfaction_score: number;
  support_volume: 'low' | 'medium' | 'high';
}

interface ClientRelationshipSummary {
  company_overview: {
    name: string;
    industry: string;
    relationship_duration_months: number;
    client_since: string;
  };
  financial_health: FinancialMetrics;
  service_engagement: ServiceMetrics;
  support_insights: {
    ticket_volume: number;
    avg_resolution_time_hours: number;
    sentiment_trend: 'positive' | 'neutral' | 'negative';
    common_issues: string[];
  };
  ai_insights: {
    relationship_status: 'excellent' | 'good' | 'at_risk' | 'critical';
    key_strengths: string[];
    areas_for_improvement: string[];
    recommended_actions: string[];
    next_touchpoint_suggestion: string;
  };
  generated_at: string;
}

serve(async (req) => {
  // Gestion CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Vérifier la méthode HTTP
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialiser le client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Vérifier l'authentification et les droits admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier que l'utilisateur est admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData || userData.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parser la requête
    const request: RelationshipSummaryRequest = await req.json()
    
    if (!request.company_id) {
      return new Response(
        JSON.stringify({ error: 'Missing company_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Processing client relationship summary for company:', request.company_id)

    // Collecter toutes les données de l'entreprise
    const [companyData, invoicesData, devisData, ticketsData, usersData] = await Promise.all([
      // Données de base de l'entreprise
      supabase
        .from('companies')
        .select('*')
        .eq('id', request.company_id)
        .single(),

      // Toutes les factures
      supabase
        .from('invoices')
        .select('*')
        .eq('company_id', request.company_id)
        .order('created_at', { ascending: false }),

      // Tous les devis
      supabase
        .from('devis')
        .select('*')
        .eq('company_id', request.company_id)
        .order('created_at', { ascending: false }),

      // Tous les tickets avec messages pour analyse sentiment
      supabase
        .from('tickets')
        .select(`
          *,
          ticket_messages (
            content,
            created_at,
            sentiment_analysis
          )
        `)
        .eq('company_id', request.company_id)
        .order('created_at', { ascending: false }),

      // Utilisateurs de l'entreprise
      supabase
        .from('users')
        .select('id, first_name, last_name, email, role, created_at')
        .eq('company_id', request.company_id)
    ])

    if (companyData.error || !companyData.data) {
      return new Response(
        JSON.stringify({ error: 'Company not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const company = companyData.data
    const invoices = invoicesData.data || []
    const devis = devisData.data || []
    const tickets = ticketsData.data || []
    const users = usersData.data || []

    // Calculer les métriques financières
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0)
    const paidInvoices = invoices.filter(inv => inv.status === 'paid')
    const overdueInvoices = invoices.filter(inv => inv.status === 'late')
    const outstandingAmount = invoices
      .filter(inv => inv.status !== 'paid')
      .reduce((sum, inv) => sum + (inv.amount || 0), 0)

    const lastPayment = paidInvoices.length > 0 ? paidInvoices[0].created_at : null
    
    let paymentReliability: FinancialMetrics['payment_reliability'] = 'good'
    if (overdueInvoices.length === 0 && paidInvoices.length > invoices.length * 0.9) {
      paymentReliability = 'excellent'
    } else if (overdueInvoices.length > invoices.length * 0.3) {
      paymentReliability = 'poor'
    } else if (overdueInvoices.length > invoices.length * 0.1) {
      paymentReliability = 'fair'
    }

    // Calculer l'ancienneté de la relation
    const relationshipStartDate = new Date(company.created_at)
    const relationshipDurationMonths = Math.round(
      (new Date().getTime() - relationshipStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    )

    // Analyser les services et projets
    const recentProjects = devis
      .filter(d => d.status === 'approved')
      .slice(0, 5)
      .map(d => d.type || 'Projet non spécifié')

    const activeServices = [...new Set(devis.map(d => d.type).filter(Boolean))]

    // Analyser les tickets et sentiment
    const ticketVolume = tickets.length
    const avgResolutionTime = tickets
      .filter(t => t.status === 'closed')
      .reduce((sum, t, _, arr) => {
        const created = new Date(t.created_at)
        const closed = new Date(t.updated_at || t.created_at)
        const hoursToResolve = (closed.getTime() - created.getTime()) / (1000 * 60 * 60)
        return sum + hoursToResolve / arr.length
      }, 0)

    // Analyser le sentiment global des messages
    const allMessages = tickets.flatMap(t => t.ticket_messages || [])
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0, frustrated: 0 }
    
    allMessages.forEach(msg => {
      if (msg.sentiment_analysis) {
        const sentiment = msg.sentiment_analysis.sentiment || 'neutral'
        sentimentCounts[sentiment as keyof typeof sentimentCounts]++
      }
    })

    const totalSentiments = Object.values(sentimentCounts).reduce((a, b) => a + b, 0)
    let sentimentTrend: 'positive' | 'neutral' | 'negative' = 'neutral'
    
    if (totalSentiments > 0) {
      const positiveRatio = sentimentCounts.positive / totalSentiments
      const negativeRatio = (sentimentCounts.negative + sentimentCounts.frustrated) / totalSentiments
      
      if (positiveRatio > 0.6) sentimentTrend = 'positive'
      else if (negativeRatio > 0.4) sentimentTrend = 'negative'
    }

    // Problèmes courants
    const commonIssues = tickets
      .slice(0, 10)
      .map(t => t.subject)
      .filter(Boolean)

    // Construire le contexte pour Gemini
    const contextForAI = {
      company: {
        name: company.name,
        industry: company.industry,
        size: company.size,
        relationship_months: relationshipDurationMonths
      },
      financial: {
        total_revenue: totalRevenue,
        payment_reliability: paymentReliability,
        outstanding_amount: outstandingAmount,
        invoice_count: invoices.length
      },
      engagement: {
        active_services: activeServices.length,
        recent_projects: recentProjects.length,
        user_count: users.length,
        devis_count: devis.length
      },
      support: {
        ticket_volume: ticketVolume,
        sentiment_trend: sentimentTrend,
        avg_resolution_hours: Math.round(avgResolutionTime || 0)
      }
    }

    // Prompt pour Gemini
    const prompt = `Tu es un expert en analyse de relation client pour Arcadis Tech. Analyse les données suivantes et fournis des insights stratégiques.

DONNÉES CLIENT :
- Entreprise : ${contextForAI.company.name} (${contextForAI.company.industry})
- Taille : ${contextForAI.company.size}
- Relation depuis : ${contextForAI.company.relationship_months} mois

MÉTRIQUES FINANCIÈRES :
- Chiffre d'affaires total : ${contextForAI.financial.total_revenue}€
- Fiabilité paiement : ${contextForAI.financial.payment_reliability}
- Montant en attente : ${contextForAI.financial.outstanding_amount}€
- Nombre de factures : ${contextForAI.financial.invoice_count}

ENGAGEMENT :
- Services actifs : ${contextForAI.engagement.active_services}
- Projets récents : ${contextForAI.engagement.recent_projects}
- Utilisateurs : ${contextForAI.engagement.user_count}
- Devis : ${contextForAI.engagement.devis_count}

SUPPORT :
- Tickets : ${contextForAI.support.ticket_volume}
- Sentiment global : ${contextForAI.support.sentiment_trend}
- Temps résolution moyen : ${contextForAI.support.avg_resolution_hours}h

ANALYSE DEMANDÉE :
1. Statut de la relation (excellent/good/at_risk/critical)
2. Forces clés de la relation (3 points)
3. Axes d'amélioration (3 points)
4. Actions recommandées (3 actions concrètes)
5. Suggestion de prochain contact

RETOURNE UNIQUEMENT un objet JSON :
{
  "relationship_status": "good",
  "key_strengths": ["Force 1", "Force 2", "Force 3"],
  "areas_for_improvement": ["Amélioration 1", "Amélioration 2", "Amélioration 3"],
  "recommended_actions": ["Action 1", "Action 2", "Action 3"],
  "next_touchpoint_suggestion": "Suggestion de contact personnalisée"
}`

    // Récupérer la clé API Gemini
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Appel à l'API Gemini
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    )

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error:', geminiResponse.status, errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to generate AI insights with Gemini API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const geminiData = await geminiResponse.json()
    console.log('Gemini relationship analysis:', JSON.stringify(geminiData, null, 2))

    // Parser la réponse IA
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
    let aiInsights: ClientRelationshipSummary['ai_insights']

    try {
      const jsonMatch = generatedText?.match(/\{[\s\S]*\}/s)
      if (!jsonMatch) throw new Error('No JSON found')
      
      aiInsights = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('Failed to parse Gemini insights:', parseError)
      
      // Fallback basé sur les métriques
      let status: ClientRelationshipSummary['ai_insights']['relationship_status'] = 'good'
      if (paymentReliability === 'excellent' && sentimentTrend === 'positive') status = 'excellent'
      else if (paymentReliability === 'poor' || sentimentTrend === 'negative') status = 'at_risk'
      
      aiInsights = {
        relationship_status: status,
        key_strengths: [
          totalRevenue > 10000 ? 'Client à forte valeur' : 'Engagement régulier',
          paymentReliability === 'excellent' ? 'Paiements fiables' : 'Relation établie',
          activeServices.length > 3 ? 'Utilisation diversifiée' : 'Fidélité service'
        ],
        areas_for_improvement: [
          outstandingAmount > 0 ? 'Suivi des paiements' : 'Communication proactive',
          ticketVolume > 5 ? 'Réduction du support' : 'Satisfaction client',
          'Expansion des services'
        ],
        recommended_actions: [
          'Planifier un point de contact',
          'Proposer de nouveaux services',
          'Optimiser le support'
        ],
        next_touchpoint_suggestion: `Appel de courtoisie pour discuter des projets ${new Date().getFullYear() + 1}`
      }
    }

    // Construire la réponse finale
    const summary: ClientRelationshipSummary = {
      company_overview: {
        name: company.name,
        industry: company.industry || 'Non spécifié',
        relationship_duration_months: relationshipDurationMonths,
        client_since: company.created_at
      },
      financial_health: {
        total_revenue: totalRevenue,
        average_invoice_amount: invoices.length > 0 ? totalRevenue / invoices.length : 0,
        payment_reliability: paymentReliability,
        outstanding_amount: outstandingAmount,
        last_payment_date: lastPayment
      },
      service_engagement: {
        active_services: activeServices as string[],
        recent_projects: recentProjects,
        satisfaction_score: sentimentTrend === 'positive' ? 8.5 : sentimentTrend === 'negative' ? 4.2 : 6.5,
        support_volume: ticketVolume > 10 ? 'high' : ticketVolume > 3 ? 'medium' : 'low'
      },
      support_insights: {
        ticket_volume: ticketVolume,
        avg_resolution_time_hours: Math.round(avgResolutionTime || 0),
        sentiment_trend: sentimentTrend,
        common_issues: commonIssues.slice(0, 5)
      },
      ai_insights: aiInsights,
      generated_at: new Date().toISOString()
    }

    console.log('Final relationship summary:', summary)

    return new Response(
      JSON.stringify({
        success: true,
        company_id: request.company_id,
        summary
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error in client relationship summary:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
