// supabase/functions/dynamic-content-generator/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContentGenerationRequest {
  context_type: 'dashboard' | 'support' | 'faq' | 'general';
  page_url?: string;
  user_context?: {
    recent_activity?: string[];
    current_services?: string[];
    company_industry?: string;
  };
  content_length?: 'short' | 'medium' | 'long';
}

interface GeneratedContent {
  type: 'tips' | 'faq' | 'articles' | 'announcements';
  title: string;
  content: string;
  category?: string;
  priority: number;
  call_to_action?: {
    text: string;
    url: string;
  };
}

interface ContentResponse {
  generated_content: GeneratedContent[];
  user_context_summary: string;
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

    // Vérifier l'authentification
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

    // Parser la requête
    const request: ContentGenerationRequest = await req.json()
    
    console.log('Processing dynamic content generation for user:', user.id)
    console.log('Request context:', request)

    // Collecter le contexte utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        companies (
          id,
          name,
          industry,
          size
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

    // Collecter l'activité récente (30 derniers jours)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [devisData, ticketsData] = await Promise.all([
      supabase
        .from('devis')
        .select('type, status, created_at')
        .eq('company_id', userData.company_id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .limit(10),
      
      supabase
        .from('tickets')
        .select('subject, priority, status, created_at')
        .eq('company_id', userData.company_id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .limit(5)
    ])

    // Construire le contexte enrichi
    const enhancedContext = {
      user: {
        role: userData.role,
        company: userData.companies?.name || 'Non spécifié',
        industry: userData.companies?.industry || 'Non spécifié',
        company_size: userData.companies?.size || 'Non spécifié'
      },
      activity: {
        recent_devis: devisData.data?.map(d => ({ type: d.type, status: d.status })) || [],
        recent_tickets: ticketsData.data?.map(t => ({ 
          subject: t.subject, 
          priority: t.priority, 
          status: t.status 
        })) || [],
        has_recent_activity: (devisData.data?.length || 0) + (ticketsData.data?.length || 0) > 0
      },
      request_context: request
    }

    // Construire le prompt pour Gemini selon le type de contenu
    let prompt = ''
    
    if (request.context_type === 'dashboard') {
      prompt = `Tu es un assistant IA expert pour Arcadis Tech. Génère du contenu dynamique personnalisé pour le tableau de bord d'un utilisateur.

CONTEXTE UTILISATEUR :
- Entreprise : ${enhancedContext.user.company} (${enhancedContext.user.industry})
- Taille : ${enhancedContext.user.company_size}
- Rôle : ${enhancedContext.user.role}

ACTIVITÉ RÉCENTE :
- Devis récents : ${enhancedContext.activity.recent_devis.length} (types: ${enhancedContext.activity.recent_devis.map(d => d.type).join(', ')})
- Tickets récents : ${enhancedContext.activity.recent_tickets.length} (priorités: ${enhancedContext.activity.recent_tickets.map(t => t.priority).join(', ')})

INSTRUCTIONS :
Génère 2-3 contenus personnalisés pour ce dashboard :
1. Un conseil/tip adapté à l'activité récente
2. Une suggestion d'optimisation basée sur le profil
3. (Optionnel) Une annonce ou mise à jour pertinente

Chaque contenu doit être :
- Personnalisé selon le contexte utilisateur
- Actionnable avec un CTA clair
- Concis et professionnel (max 2-3 phrases)`

    } else if (request.context_type === 'support') {
      prompt = `Tu es un assistant IA pour la section support d'Arcadis Tech. Génère du contenu d'aide personnalisé.

CONTEXTE UTILISATEUR :
- Entreprise : ${enhancedContext.user.company} (${enhancedContext.user.industry})
- Tickets récents : ${enhancedContext.activity.recent_tickets.map(t => t.subject).join(', ')}

INSTRUCTIONS :
Génère 2-3 éléments d'aide personnalisés :
1. FAQ basée sur les problèmes récents ou typiques du secteur
2. Guide rapide adapté au profil utilisateur
3. Ressource ou documentation recommandée

Contenu orienté résolution de problèmes et autonomie utilisateur.`

    } else {
      prompt = `Tu es un assistant IA pour Arcadis Tech. Génère du contenu adaptatif général.

CONTEXTE : ${request.context_type}
UTILISATEUR : ${enhancedContext.user.company} - ${enhancedContext.user.industry}

Génère 2-3 contenus pertinents et personnalisés.`
    }

    prompt += `

RETOURNE UNIQUEMENT un objet JSON avec cette structure :
{
  "generated_content": [
    {
      "type": "tips",
      "title": "Titre du contenu",
      "content": "Contenu personnalisé en français",
      "category": "catégorie",
      "priority": 8,
      "call_to_action": {
        "text": "Action suggérée",
        "url": "/lien-pertinent"
      }
    }
  ],
  "user_context_summary": "résumé du contexte utilisateur"
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
        JSON.stringify({ error: 'Failed to generate content with Gemini API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const geminiData = await geminiResponse.json()
    console.log('Gemini content response:', JSON.stringify(geminiData, null, 2))

    // Extraire et parser la réponse
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
    if (!generatedText) {
      console.error('No text generated by Gemini')
      return new Response(
        JSON.stringify({ error: 'No content generated by Gemini' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let contentResult: ContentResponse
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/s)
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response')
      }
      
      contentResult = JSON.parse(jsonMatch[0])
      
      if (!contentResult.generated_content || !Array.isArray(contentResult.generated_content)) {
        throw new Error('Invalid content structure')
      }

    } catch (parseError) {
      console.error('Failed to parse Gemini content:', parseError)
      console.error('Raw Gemini text:', generatedText)
      
      // Fallback : contenu générique basé sur le contexte
      const fallbackContent: GeneratedContent[] = []
      
      if (request.context_type === 'dashboard') {
        fallbackContent.push({
          type: 'tips',
          title: 'Optimisez votre utilisation',
          content: 'Consultez régulièrement votre tableau de bord pour suivre l\'évolution de vos projets et factures.',
          category: 'productivité',
          priority: 6,
          call_to_action: {
            text: 'Voir les statistiques',
            url: '/dashboard'
          }
        })
      } else if (request.context_type === 'support') {
        fallbackContent.push({
          type: 'faq',
          title: 'Besoin d\'aide ?',
          content: 'Notre équipe support est disponible pour vous accompagner dans l\'utilisation de la plateforme.',
          category: 'aide',
          priority: 7,
          call_to_action: {
            text: 'Créer un ticket',
            url: '/support/new'
          }
        })
      }

      if (fallbackContent.length === 0) {
        fallbackContent.push({
          type: 'tips',
          title: 'Découvrez nos services',
          content: 'Explorez notre gamme complète de services pour optimiser votre présence numérique.',
          category: 'services',
          priority: 5,
          call_to_action: {
            text: 'En savoir plus',
            url: '/services'
          }
        })
      }
      
      contentResult = {
        generated_content: fallbackContent,
        user_context_summary: `${enhancedContext.user.company} - ${enhancedContext.user.industry}`,
        generated_at: new Date().toISOString()
      }
    }

    // Ajouter la date de génération
    contentResult.generated_at = new Date().toISOString()

    console.log('Final content result:', contentResult)

    return new Response(
      JSON.stringify({
        success: true,
        user_id: user.id,
        company_id: userData.company_id,
        context_type: request.context_type,
        ...contentResult
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error in dynamic content generation:', error)
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
