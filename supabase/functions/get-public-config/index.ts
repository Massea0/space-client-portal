// get-public-config/index.ts
// Fonction pour exposer la configuration publique nécessaire côté client
// Cette fonction retourne uniquement les variables d'environnement publiques (non sensibles)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// En-têtes CORS pour les réponses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
}

// Configuration publique - variables non sensibles exposables côté client
function getPublicConfig() {
  return {
    // URLs DExchange selon l'environnement
    dexchange: {
      environment: Deno.env.get('DEXCHANGE_ENVIRONMENT') || 'sandbox',
      apiUrl: {
        production: Deno.env.get('DEXCHANGE_API_URL_PRODUCTION') || 'https://api-m.dexchange.sn/api/v1',
        sandbox: Deno.env.get('DEXCHANGE_API_URL_SANDBOX') || 'https://api-s.dexchange.sn/api/v1'
      },
      // URLs de callback pour les paiements
      successUrl: Deno.env.get('DEXCHANGE_SUCCESS_URL') || `${Deno.env.get('SITE_URL')}/payment/success`,
      failureUrl: Deno.env.get('DEXCHANGE_FAILURE_URL') || `${Deno.env.get('SITE_URL')}/payment/failure`,
      callbackUrl: Deno.env.get('DEXCHANGE_CALLBACK_URL') || `${Deno.env.get('SUPABASE_URL')}/functions/v1/dexchange-callback-handler`
    },
    
    // Configuration du relais GCP
    relay: {
      url: Deno.env.get('GCP_RELAY_URL') || ''
    },
    
    // URLs publiques
    site: {
      url: Deno.env.get('SITE_URL') || '',
      supabaseUrl: Deno.env.get('SUPABASE_URL') || '',
      supabaseAnonKey: Deno.env.get('SUPABASE_ANON_KEY') || ''
    },
    
    // Métadonnées
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  }
}

// Fonction principale
serve(async (req) => {
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  // Seules les requêtes GET sont autorisées
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Méthode non autorisée' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
  
  try {
    const config = getPublicConfig()
    
    // Vérifier que les variables critiques sont définies
    const missingVars = []
    
    if (!config.site.supabaseUrl) missingVars.push('SUPABASE_URL')
    if (!config.site.supabaseAnonKey) missingVars.push('SUPABASE_ANON_KEY')
    if (!config.site.url) missingVars.push('SITE_URL')
    
    if (missingVars.length > 0) {
      console.warn('Variables manquantes:', missingVars.join(', '))
      return new Response(
        JSON.stringify({ 
          error: 'Configuration incomplète', 
          missingVars,
          config: config // Retourner quand même la config partielle
        }),
        { 
          status: 200, // 200 car on retourne quand même des données utiles
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        config
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
    
  } catch (error) {
    console.error('Erreur lors de la génération de la configuration:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Erreur serveur lors de la génération de la configuration',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
