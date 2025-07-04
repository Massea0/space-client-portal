// supabase/functions/ai-quote-optimization/index.ts
// Migration vers Gemini AI - Version 2.0
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GeminiClient } from '../_shared/gemini-client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

interface QuoteOptimization {
  originalAmount: number;
  suggestedAmount: number;
  optimizationPercentage: number;
  reasoning: string;
  conversionProbability: number;
  recommendations: {
    pricing: string[];
    description: string[];
    terms: string[];
  };
  confidence: number;
  marketAnalysis?: {
    sectorAverage: number;
    competitivePosition: string;
    priceElasticity: number;
  };
  riskAssessment?: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
}

interface QuoteAnalysisData {
  quote: any;
  companyHistory: any[];
  sectorAverages: any;
  conversionRates: any;
}

// Analyser l'historique des devis de l'entreprise
async function analyzeQuoteHistory(supabase: any, companyId: string) {
  try {
    const { data: quotes, error } = await supabase
      .from('devis')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.warn('Table devis non disponible:', error.message);
      return {
        totalQuotes: 0,
        approvedQuotes: 0,
        rejectedQuotes: 0,
        conversionRate: 0.3, // Valeur par défaut
        avgAmount: 0,
        avgApprovedAmount: 0,
        lastQuoteDate: null
      };
    }

    const approvedQuotes = quotes.filter(q => q.status === 'approved');
    const rejectedQuotes = quotes.filter(q => q.status === 'rejected');
    
    const conversionRate = quotes.length > 0 ? approvedQuotes.length / quotes.length : 0.3;
    const avgAmount = quotes.length > 0 ? quotes.reduce((sum, q) => sum + (q.amount || 0), 0) / quotes.length : 0;
    const avgApprovedAmount = approvedQuotes.length > 0 ? approvedQuotes.reduce((sum, q) => sum + (q.amount || 0), 0) / approvedQuotes.length : 0;
    
    return {
      totalQuotes: quotes.length,
      approvedQuotes: approvedQuotes.length,
      rejectedQuotes: rejectedQuotes.length,
      conversionRate,
      avgAmount,
      avgApprovedAmount,
      lastQuoteDate: quotes[0]?.created_at || null
    };
  } catch (error) {
    console.warn('Erreur analyse historique devis:', error);
    return {
      totalQuotes: 0,
      approvedQuotes: 0,
      rejectedQuotes: 0,
      conversionRate: 0.3,
      avgAmount: 0,
      avgApprovedAmount: 0,
      lastQuoteDate: null
    };
  }
}

// Analyser les moyennes sectorielles
async function analyzeSectorData(supabase: any, sector: string) {
  try {
    // Essayer de récupérer des données sectorielles
    const { data: sectorData, error } = await supabase
      .from('companies')
      .select('id')
      .eq('industry', sector)
      .limit(10);

    if (error) {
      console.warn('Données sectorielles limitées:', error.message);
    }

    // Retourner des moyennes sectorielles par défaut
    const sectorMapping = {
      'technology': { avgConversion: 0.35, avgDelay: 15, competitiveness: 'high' },
      'construction': { avgConversion: 0.25, avgDelay: 30, competitiveness: 'medium' },
      'consulting': { avgConversion: 0.45, avgDelay: 20, competitiveness: 'high' },
      'manufacturing': { avgConversion: 0.30, avgDelay: 25, competitiveness: 'medium' },
      'services': { avgConversion: 0.40, avgDelay: 18, competitiveness: 'medium' }
    };

    return sectorMapping[sector] || { avgConversion: 0.35, avgDelay: 20, competitiveness: 'medium' };
  } catch (error) {
    return { avgConversion: 0.35, avgDelay: 20, competitiveness: 'medium' };
  }
}

// Appeler Gemini pour l'optimisation de devis
async function callGeminiForQuoteOptimization(analysisData: QuoteAnalysisData): Promise<QuoteOptimization> {
  const geminiClient = new GeminiClient();
  
  const systemPrompt = `Tu es un expert en stratégie commerciale et pricing pour le marché B2B sénégalais.
Tu dois analyser un devis et recommander des optimisations de prix et de présentation pour maximiser les chances d'acceptation.

CONTEXTE MARCHÉ SÉNÉGAL:
- Sensibilité au prix élevée
- Importance des relations personnelles
- Préférence pour les paiements échelonnés
- Concurrence locale forte
- Négociation culturellement attendue

Ton objectif: optimiser le devis pour maximiser la conversion tout en préservant la rentabilité.`;

  const prompt = geminiClient.createOptimizedPrompt(
    'Optimisation de devis B2B Sénégal',
    {
      devis: {
        montant_original: analysisData.quote.amount,
        description: analysisData.quote.description || 'Service professionnel',
        secteur: analysisData.quote.sector || 'services',
        client: analysisData.quote.company_name || 'Client B2B',
        duree_validite: analysisData.quote.validity_days || 30
      },
      historique_entreprise: {
        total_devis: analysisData.companyHistory.length,
        taux_conversion: analysisData.conversionRates.companyRate || 0.3,
        montant_moyen: analysisData.conversionRates.avgAmount || 0,
        dernier_devis: analysisData.companyHistory[0]?.created_at || null
      },
      marche: {
        taux_conversion_secteur: analysisData.sectorAverages.avgConversion || 0.35,
        competitivite: analysisData.sectorAverages.competitiveness || 'medium',
        delai_decision_moyen: analysisData.sectorAverages.avgDelay || 20
      }
    },
    `Analyse le devis et recommande des optimisations stratégiques.
    
    Considère:
    1. Psychologie des prix au Sénégal (prix ronds, rabais symboliques)
    2. Structuration de l'offre (packages, options)
    3. Conditions de paiement attractives
    4. Éléments de réassurance (garanties, références)
    5. Timing et urgence
    
    Format de réponse JSON requis:
    {
      "originalAmount": number,
      "suggestedAmount": number,
      "optimizationPercentage": number, // % de changement
      "reasoning": "explication détaillée de la stratégie",
      "conversionProbability": number, // entre 0 et 1
      "recommendations": {
        "pricing": ["conseil1", "conseil2"],
        "description": ["amélioration1", "amélioration2"],
        "terms": ["condition1", "condition2"]
      },
      "confidence": number, // entre 0 et 1
      "marketAnalysis": {
        "sectorAverage": number,
        "competitivePosition": "above|below|average",
        "priceElasticity": number // sensibilité au prix 0-1
      },
      "riskAssessment": {
        "level": "low|medium|high",
        "factors": ["facteur1", "facteur2"]
      }
    }`
  );

  try {
    const response = await geminiClient.generateContent({
      prompt,
      systemPrompt,
      temperature: 0.4,
      maxTokens: 2000
    });

    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de l\'appel Gemini');
    }

    const aiResponse = geminiClient.parseJsonResponse(response.content!);
    
    if (aiResponse.error) {
      throw new Error('Format de réponse IA invalide');
    }

    return {
      originalAmount: aiResponse.originalAmount || analysisData.quote.amount,
      suggestedAmount: aiResponse.suggestedAmount || analysisData.quote.amount * 0.95,
      optimizationPercentage: aiResponse.optimizationPercentage || -5,
      reasoning: aiResponse.reasoning || 'Optimisation basée sur l\'analyse de marché',
      conversionProbability: aiResponse.conversionProbability || 0.4,
      recommendations: aiResponse.recommendations || {
        pricing: ['Ajuster selon le marché'],
        description: ['Améliorer la présentation'],
        terms: ['Offrir des facilités de paiement']
      },
      confidence: aiResponse.confidence || 0.7,
      marketAnalysis: aiResponse.marketAnalysis,
      riskAssessment: aiResponse.riskAssessment
    };

  } catch (error) {
    console.error('Erreur optimisation Gemini:', error);
    return generateFallbackOptimization(analysisData);
  }
}

// Fonction de fallback pour l'optimisation
function generateFallbackOptimization(analysisData: QuoteAnalysisData): QuoteOptimization {
  const originalAmount = analysisData.quote.amount;
  const conversionRate = analysisData.conversionRates.companyRate || 0.3;
  
  // Logique d'optimisation basique
  let optimizationFactor = 1.0;
  
  if (conversionRate < 0.2) {
    optimizationFactor = 0.85; // Réduire le prix de 15%
  } else if (conversionRate > 0.5) {
    optimizationFactor = 1.05; // Augmenter le prix de 5%
  } else {
    optimizationFactor = 0.95; // Réduire légèrement de 5%
  }
  
  const suggestedAmount = Math.round(originalAmount * optimizationFactor);
  
  return {
    originalAmount,
    suggestedAmount,
    optimizationPercentage: (optimizationFactor - 1) * 100,
    reasoning: 'Optimisation basée sur l\'historique de conversion en mode fallback',
    conversionProbability: Math.min(0.8, conversionRate + 0.1),
    recommendations: {
      pricing: [
        'Ajuster le prix selon l\'historique de conversion',
        'Proposer des options de paiement échelonné',
        'Inclure une remise pour paiement rapide'
      ],
      description: [
        'Mettre en avant la valeur ajoutée',
        'Ajouter des témoignages clients',
        'Détailler les livrables'
      ],
      terms: [
        'Conditions de paiement flexibles',
        'Garantie de satisfaction',
        'Support inclus'
      ]
    },
    confidence: 0.6,
    marketAnalysis: {
      sectorAverage: originalAmount,
      competitivePosition: 'average',
      priceElasticity: 0.6
    },
    riskAssessment: {
      level: 'medium',
      factors: ['Données limitées', 'Analyse statistique standard']
    }
  };
}

serve(async (req) => {
  // Gestion CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);
    
    const { quoteId, companyId } = await req.json();

    if (!quoteId) {
      return new Response(
        JSON.stringify({ error: 'quoteId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer les détails du devis
    const { data: quote, error: quoteError } = await supabase
      .from('devis')
      .select('*, companies(name, industry)')
      .eq('id', quoteId)
      .single();

    if (quoteError) {
      // Si la table devis n'existe pas, utiliser des données de test
      const testQuote = {
        id: quoteId,
        amount: 500000, // 500k XOF
        description: 'Service de consultation technique',
        company_id: companyId,
        sector: 'technology',
        companies: { name: 'Entreprise Test', industry: 'technology' }
      };
      
      console.warn('Table devis non disponible, utilisation de données de test');
      
      const historyData = await analyzeQuoteHistory(supabase, companyId || 'test');
      const sectorData = await analyzeSectorData(supabase, testQuote.sector);
      
      const analysisData: QuoteAnalysisData = {
        quote: testQuote,
        companyHistory: [],
        sectorAverages: sectorData,
        conversionRates: {
          companyRate: historyData.conversionRate,
          avgAmount: historyData.avgAmount
        }
      };
      
      const optimization = await callGeminiForQuoteOptimization(analysisData);
      
      return new Response(
        JSON.stringify({
          success: true,
          optimization,
          quote: testQuote,
          model: 'gemini-pro',
          mode: 'test',
          generated_at: new Date().toISOString()
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Analyser l'historique de l'entreprise
    const historyData = await analyzeQuoteHistory(supabase, quote.company_id);
    const sectorData = await analyzeSectorData(supabase, quote.companies?.industry || 'services');

    const analysisData: QuoteAnalysisData = {
      quote,
      companyHistory: [],
      sectorAverages: sectorData,
      conversionRates: {
        companyRate: historyData.conversionRate,
        avgAmount: historyData.avgAmount
      }
    };

    // Générer l'optimisation avec Gemini
    const optimization = await callGeminiForQuoteOptimization(analysisData);

    // Sauvegarder l'optimisation
    try {
      const { error: saveError } = await supabase
        .from('quote_optimizations')
        .upsert({
          quote_id: quoteId,
          optimization_data: optimization,
          created_at: new Date().toISOString(),
          model_version: 'gemini-pro-v1'
        });

      if (saveError) {
        console.warn('Erreur sauvegarde optimisation:', saveError.message);
      }
    } catch (saveException) {
      console.warn('Table quote_optimizations non disponible');
    }

    return new Response(
      JSON.stringify({
        success: true,
        optimization,
        quote: {
          id: quote.id,
          originalAmount: quote.amount,
          company: quote.companies?.name
        },
        analysis: {
          conversionRate: historyData.conversionRate,
          sectorBenchmark: sectorData.avgConversion
        },
        model: 'gemini-pro',
        generated_at: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Quote optimization error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
