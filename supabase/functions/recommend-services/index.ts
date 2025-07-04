// supabase/functions/recommend-services/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ServiceRecommendation {
  service_name: string;
  category: string;
  description: string;
  justification: string;
  priority_score: number;
  estimated_value: string;
}

interface RecommendationResponse {
  recommendations: ServiceRecommendation[];
  user_profile_summary: string;
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

    // Initialiser le client Supabase avec la clé service_role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Vérifier l'authentification depuis le header Authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extraire le JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Processing service recommendations for user:', user.id)

    // Collecter les données du profil utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        companies (
          id,
          name,
          industry,
          size,
          created_at
        )
      `)
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Collecter l'historique des devis (6 derniers mois)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: devisData } = await supabase
      .from('devis')
      .select('*')
      .eq('company_id', userData.company_id)
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(20)

    // Collecter l'historique des factures (6 derniers mois)
    const { data: invoicesData } = await supabase
      .from('invoices')
      .select('*')
      .eq('company_id', userData.company_id)
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(20)

    // Collecter les tickets récents (3 derniers mois)
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    const { data: ticketsData } = await supabase
      .from('tickets')
      .select(`
        *,
        ticket_messages (
          content,
          created_at
        )
      `)
      .eq('company_id', userData.company_id)
      .gte('created_at', threeMonthsAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10)

    // Construire le profil client pour le prompt
    const clientProfile = {
      company: {
        name: userData.companies?.name || 'Non spécifié',
        industry: userData.companies?.industry || 'Non spécifié',
        size: userData.companies?.size || 'Non spécifié',
        age_months: userData.companies?.created_at ? 
          Math.round((new Date().getTime() - new Date(userData.companies.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0
      },
      user: {
        role: userData.role || 'user',
        created_at: userData.created_at
      },
      activity: {
        devis_count: devisData?.length || 0,
        recent_devis_types: devisData?.map(d => d.type).slice(0, 5) || [],
        invoices_count: invoicesData?.length || 0,
        total_spent: invoicesData?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0,
        tickets_count: ticketsData?.length || 0,
        recent_ticket_subjects: ticketsData?.map(t => t.subject).slice(0, 3) || []
      }
    }

    // Services disponibles chez Arcadis Tech
    const availableServices = [
      {
        name: "Développement Web Avancé",
        category: "développement",
        description: "Applications web sur mesure avec technologies modernes"
      },
      {
        name: "Optimisation SEO",
        category: "marketing",
        description: "Amélioration du référencement et visibilité en ligne"
      },
      {
        name: "Analyse de Données",
        category: "data",
        description: "Tableaux de bord et insights business intelligents"
      },
      {
        name: "Sécurité Informatique",
        category: "sécurité",
        description: "Audit et renforcement de la sécurité IT"
      },
      {
        name: "Cloud Migration",
        category: "infrastructure",
        description: "Migration et optimisation infrastructure cloud"
      },
      {
        name: "Formation Équipes",
        category: "formation",
        description: "Formation technique et accompagnement utilisateurs"
      },
      {
        name: "Maintenance Préventive",
        category: "maintenance",
        description: "Surveillance proactive et maintenance systèmes"
      },
      {
        name: "Automatisation Processus",
        category: "automatisation",
        description: "Optimisation et automatisation des workflows"
      }
    ]

    // Construire le prompt pour Gemini
    const prompt = `Tu es un expert en recommandations de services IT pour Arcadis Tech. Analyse le profil client suivant et recommande 2-3 services pertinents.

PROFIL CLIENT :
- Entreprise : ${clientProfile.company.name}
- Secteur : ${clientProfile.company.industry}
- Taille : ${clientProfile.company.size}
- Ancienneté client : ${clientProfile.company.age_months} mois
- Rôle utilisateur : ${clientProfile.user.role}

ACTIVITÉ RÉCENTE :
- Devis demandés : ${clientProfile.activity.devis_count} (types: ${clientProfile.activity.recent_devis_types.join(', ')})
- Factures : ${clientProfile.activity.invoices_count} (total: ${clientProfile.activity.total_spent}€)
- Tickets support : ${clientProfile.activity.tickets_count} (sujets: ${clientProfile.activity.recent_ticket_subjects.join(', ')})

SERVICES DISPONIBLES :
${availableServices.map(s => `- ${s.name} (${s.category}): ${s.description}`).join('\n')}

INSTRUCTIONS :
1. Recommande 2-3 services les plus pertinents basés sur le profil et l'activité
2. Justifie chaque recommandation avec des éléments concrets du profil
3. Attribue un score de priorité (1-10)
4. Estime une valeur business approximative

RETOURNE UNIQUEMENT un objet JSON avec cette structure :
{
  "recommendations": [
    {
      "service_name": "nom du service",
      "category": "catégorie",
      "description": "description courte",
      "justification": "pourquoi ce service est pertinent pour ce client",
      "priority_score": 8,
      "estimated_value": "5000-15000€"
    }
  ],
  "user_profile_summary": "résumé du profil client en 1-2 phrases"
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
        JSON.stringify({ error: 'Failed to generate recommendations with Gemini API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const geminiData = await geminiResponse.json()
    console.log('Gemini recommendations response:', JSON.stringify(geminiData, null, 2))

    // Extraire le texte de la réponse Gemini
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
    if (!generatedText) {
      console.error('No text generated by Gemini')
      return new Response(
        JSON.stringify({ error: 'No recommendations generated by Gemini' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parser la réponse JSON de Gemini
    let recommendationsResult: RecommendationResponse
    try {
      // Nettoyer le texte pour extraire seulement le JSON
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/s)
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response')
      }
      
      recommendationsResult = JSON.parse(jsonMatch[0])
      
      // Valider la structure
      if (!recommendationsResult.recommendations || !Array.isArray(recommendationsResult.recommendations)) {
        throw new Error('Invalid recommendations structure')
      }

    } catch (parseError) {
      console.error('Failed to parse Gemini recommendations:', parseError)
      console.error('Raw Gemini text:', generatedText)
      
      // Fallback : recommandations basiques basées sur l'activité
      const fallbackRecommendations: ServiceRecommendation[] = []
      
      if (clientProfile.activity.tickets_count > 3) {
        fallbackRecommendations.push({
          service_name: "Maintenance Préventive",
          category: "maintenance",
          description: "Surveillance proactive et maintenance systèmes",
          justification: "Nombre élevé de tickets support récents",
          priority_score: 8,
          estimated_value: "2000-5000€/mois"
        })
      }
      
      if (clientProfile.activity.total_spent > 10000) {
        fallbackRecommendations.push({
          service_name: "Analyse de Données",
          category: "data",
          description: "Tableaux de bord et insights business intelligents",
          justification: "Client avec investissement significatif",
          priority_score: 7,
          estimated_value: "5000-15000€"
        })
      }
      
      if (fallbackRecommendations.length === 0) {
        fallbackRecommendations.push({
          service_name: "Développement Web Avancé",
          category: "développement",
          description: "Applications web sur mesure avec technologies modernes",
          justification: "Service populaire adapté à la plupart des entreprises",
          priority_score: 6,
          estimated_value: "8000-25000€"
        })
      }
      
      recommendationsResult = {
        recommendations: fallbackRecommendations,
        user_profile_summary: `${clientProfile.company.name} - ${clientProfile.company.industry}`,
        generated_at: new Date().toISOString()
      }
    }

    // Ajouter la date de génération
    recommendationsResult.generated_at = new Date().toISOString()

    console.log('Final recommendations:', recommendationsResult)

    // Retourner les recommandations
    return new Response(
      JSON.stringify({
        success: true,
        user_id: user.id,
        company_id: userData.company_id,
        ...recommendationsResult
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error in service recommendations:', error)
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
