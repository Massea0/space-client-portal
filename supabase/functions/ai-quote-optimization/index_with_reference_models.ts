// supabase/functions/ai-quote-optimization/index.ts
// Version avec modèles de référence - Anti-dérive des prix
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
  referenceModel?: {
    id: string;
    title: string;
    priceOptimal: number;
    allowedRange: { min: number; max: number };
    usedAsReference: boolean;
  };
}

interface ReferenceQuote {
  id: string;
  title: string;
  description: string;
  price_min: number;
  price_max: number;
  price_optimal: number;
  variation_min: number;
  variation_max: number;
  target_sector: string;
  complexity_level: string;
  recommended_terms: any;
}

interface QuoteAnalysisData {
  quote: any;
  companyHistory: any[];
  sectorAverages: any;
  conversionRates: any;
  referenceModel?: ReferenceQuote;
}

// Trouver le modèle de référence le plus adapté
async function findBestReferenceModel(supabase: any, quote: any): Promise<ReferenceQuote | null> {
  try {
    console.log(`🔍 Recherche de modèle de référence pour devis de ${quote.amount} FCFA`);
    
    // Rechercher par fourchette de prix avec une marge de 30%
    const priceMin = quote.amount * 0.7;
    const priceMax = quote.amount * 1.3;
    
    const { data: models, error } = await supabase
      .from('reference_quotes')
      .select(`
        id, title, description, price_min, price_max, price_optimal,
        variation_min, variation_max, target_sector, complexity_level,
        recommended_terms, usage_count, success_rate
      `)
      .eq('is_active', true)
      .or(`price_min.lte.${quote.amount},price_max.gte.${quote.amount}`)
      .or(`price_optimal.gte.${priceMin},price_optimal.lte.${priceMax}`)
      .order('success_rate', { ascending: false })
      .order('usage_count', { ascending: false })
      .limit(5);

    if (error || !models || models.length === 0) {
      console.log('❌ Aucun modèle de référence trouvé');
      return null;
    }

    // Sélectionner le meilleur modèle basé sur plusieurs critères
    let bestModel = models[0];
    let bestScore = 0;

    for (const model of models) {
      let score = 0;
      
      // Score basé sur la proximité du prix
      const priceDiff = Math.abs(model.price_optimal - quote.amount) / quote.amount;
      score += (1 - priceDiff) * 40; // 40% du score
      
      // Score basé sur le taux de succès
      score += (model.success_rate || 50) * 0.3; // 30% du score
      
      // Score basé sur l'utilisation
      score += Math.min(model.usage_count || 0, 10) * 3; // 30% du score max
      
      if (score > bestScore) {
        bestScore = score;
        bestModel = model;
      }
    }

    console.log(`✅ Modèle de référence sélectionné: "${bestModel.title}" (score: ${bestScore.toFixed(1)})`);
    return bestModel;
    
  } catch (error) {
    console.error('Erreur lors de la recherche de modèle de référence:', error);
    return null;
  }
}

// Calculer le prix suggéré en respectant les contraintes du modèle
function calculateConstrainedPrice(originalAmount: number, referenceModel: ReferenceQuote | null): {
  suggestedAmount: number;
  optimizationPercentage: number;
  reasoning: string;
  withinConstraints: boolean;
} {
  if (!referenceModel) {
    // Pas de modèle de référence, utiliser la logique conservatrice
    const variation = (Math.random() - 0.5) * 10; // ±5% maximum
    const suggestedAmount = Math.round(originalAmount * (1 + variation / 100));
    
    return {
      suggestedAmount,
      optimizationPercentage: variation,
      reasoning: "Optimisation sans modèle de référence - variation conservatrice appliquée",
      withinConstraints: true
    };
  }

  // Avec modèle de référence
  const { price_optimal, variation_min, variation_max } = referenceModel;
  
  // Calculer les limites absolues
  const absoluteMin = price_optimal * (1 + variation_min / 100);
  const absoluteMax = price_optimal * (1 + variation_max / 100);
  
  // Déterminer le prix suggéré
  let suggestedAmount = price_optimal;
  let reasoning = `Prix optimal du modèle "${referenceModel.title}" appliqué`;
  
  // Si le prix original est très différent, ajuster graduellement
  const priceDiff = originalAmount - price_optimal;
  if (Math.abs(priceDiff) > price_optimal * 0.1) { // Plus de 10% de différence
    // Ajustement graduel vers le prix optimal (maximum 50% du chemin)
    const adjustmentFactor = 0.3; // 30% d'ajustement vers l'optimal
    suggestedAmount = originalAmount + (priceDiff * -adjustmentFactor);
    reasoning = `Ajustement graduel vers le prix optimal du modèle (${(adjustmentFactor * 100).toFixed(0)}% du chemin)`;
  }
  
  // Assurer que le prix reste dans les contraintes
  let withinConstraints = true;
  if (suggestedAmount < absoluteMin) {
    suggestedAmount = absoluteMin;
    reasoning += ` - Ajusté au minimum autorisé (${variation_min}%)`;
    withinConstraints = false;
  } else if (suggestedAmount > absoluteMax) {
    suggestedAmount = absoluteMax;
    reasoning += ` - Ajusté au maximum autorisé (+${variation_max}%)`;
    withinConstraints = false;
  }
  
  const optimizationPercentage = ((suggestedAmount - originalAmount) / originalAmount) * 100;
  
  return {
    suggestedAmount: Math.round(suggestedAmount),
    optimizationPercentage: Math.round(optimizationPercentage * 10) / 10,
    reasoning,
    withinConstraints
  };
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
        conversionRate: 0.3,
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
  // Pour l'instant, retourner des données par défaut
  return {
    avgConversion: 0.35,
    avgAmount: 750000,
    competitiveness: 'medium',
    avgDelay: 15
  };
}

// Appeler Gemini pour l'optimisation de devis avec contraintes de référence
async function callGeminiForQuoteOptimization(analysisData: QuoteAnalysisData): Promise<QuoteOptimization> {
  const geminiClient = new GeminiClient();
  
  const systemPrompt = `Tu es un expert en stratégie commerciale et pricing pour le marché B2B sénégalais.
Tu dois analyser un devis et recommander des optimisations CONTRAINTES par un modèle de référence.

CONTRAINTES STRICTES:
${analysisData.referenceModel ? `
- Modèle de référence: "${analysisData.referenceModel.title}"
- Prix optimal de référence: ${analysisData.referenceModel.price_optimal.toLocaleString()} FCFA
- Variation autorisée: ${analysisData.referenceModel.variation_min}% à +${analysisData.referenceModel.variation_max}%
- RESPECT OBLIGATOIRE de ces limites pour éviter la dérive des prix
` : '- Aucun modèle de référence - Variation limitée à ±10% maximum'}

CONTEXTE MARCHÉ SÉNÉGAL:
- Sensibilité au prix élevée
- Préférence pour les paiements échelonnés
- Négociation culturellement attendue

OBJECTIF: Optimiser dans les contraintes définies pour maintenir la cohérence tarifaire.`;

  const prompt = geminiClient.createOptimizedPrompt(
    'Optimisation contrainte de devis B2B Sénégal',
    {
      devis: {
        montant_original: analysisData.quote.amount,
        description: analysisData.quote.description || analysisData.quote.object || 'Service professionnel',
        client: analysisData.quote.company_name || 'Client B2B'
      },
      contraintes_reference: analysisData.referenceModel ? {
        titre_modele: analysisData.referenceModel.title,
        prix_optimal: analysisData.referenceModel.price_optimal,
        variation_min: analysisData.referenceModel.variation_min,
        variation_max: analysisData.referenceModel.variation_max,
        conditions_recommandees: analysisData.referenceModel.recommended_terms
      } : null,
      historique_entreprise: {
        taux_conversion: analysisData.conversionRates.companyRate || 0.3,
        montant_moyen: analysisData.conversionRates.avgAmount || 0
      }
    },
    `Analyse le devis et recommande des optimisations STRICTEMENT dans les contraintes définies.
    
    Si un modèle de référence existe, RESPECTER ABSOLUMENT:
    1. Les limites de variation de prix
    2. Les conditions commerciales recommandées
    3. Le positionnement tarifaire du modèle
    
    Format de réponse JSON requis:
    {
      "originalAmount": number,
      "suggestedAmount": number,
      "optimizationPercentage": number,
      "reasoning": "Explication de l'optimisation en respectant les contraintes",
      "conversionProbability": number,
      "recommendations": {
        "pricing": ["stratégies tarifaires"],
        "description": ["améliorations description"],
        "terms": ["conditions commerciales"]
      },
      "confidence": number,
      "marketAnalysis": {
        "sectorAverage": number,
        "competitivePosition": "below|average|above",
        "priceElasticity": number
      },
      "riskAssessment": {
        "level": "low|medium|high",
        "factors": ["facteurs de risque"]
      }
    }`
  );

  try {
    const response = await geminiClient.chat(systemPrompt, prompt);
    const aiResponse = JSON.parse(response);
    
    // Validation et contraintes sur la réponse IA
    let suggestedAmount = aiResponse.suggestedAmount;
    let optimizationPercentage = aiResponse.optimizationPercentage;
    let reasoning = aiResponse.reasoning;
    
    // Appliquer les contraintes de référence si elles existent
    if (analysisData.referenceModel) {
      const constrainedPrice = calculateConstrainedPrice(analysisData.quote.amount, analysisData.referenceModel);
      suggestedAmount = constrainedPrice.suggestedAmount;
      optimizationPercentage = constrainedPrice.optimizationPercentage;
      
      if (!constrainedPrice.withinConstraints) {
        reasoning = constrainedPrice.reasoning + " (Contraintes de référence appliquées)";
      }
    }

    return {
      originalAmount: analysisData.quote.amount,
      suggestedAmount,
      optimizationPercentage,
      reasoning,
      conversionProbability: aiResponse.conversionProbability || 0.4,
      recommendations: aiResponse.recommendations || {
        pricing: ['Ajuster selon le modèle de référence'],
        description: ['Améliorer la présentation'],
        terms: ['Appliquer les conditions du modèle de référence']
      },
      confidence: aiResponse.confidence || 0.7,
      marketAnalysis: aiResponse.marketAnalysis,
      riskAssessment: aiResponse.riskAssessment,
      referenceModel: analysisData.referenceModel ? {
        id: analysisData.referenceModel.id,
        title: analysisData.referenceModel.title,
        priceOptimal: analysisData.referenceModel.price_optimal,
        allowedRange: {
          min: Math.round(analysisData.referenceModel.price_optimal * (1 + analysisData.referenceModel.variation_min / 100)),
          max: Math.round(analysisData.referenceModel.price_optimal * (1 + analysisData.referenceModel.variation_max / 100))
        },
        usedAsReference: true
      } : undefined
    };

  } catch (error) {
    console.error('Erreur optimisation Gemini:', error);
    return generateConstrainedFallbackOptimization(analysisData);
  }
}

// Fonction de fallback avec contraintes de référence
function generateConstrainedFallbackOptimization(analysisData: QuoteAnalysisData): QuoteOptimization {
  const originalAmount = analysisData.quote.amount;
  const referenceModel = analysisData.referenceModel;
  
  // Utiliser les contraintes de référence ou une variation conservatrice
  const constrainedPrice = calculateConstrainedPrice(originalAmount, referenceModel);
  
  const pricingRecommendations = referenceModel 
    ? [`Alignement sur le modèle "${referenceModel.title}"`, 'Respect des contraintes de référence établies']
    : ['Optimisation conservatrice sans modèle de référence', 'Maintien de la cohérence tarifaire'];
    
  const descriptionRecommendations = referenceModel
    ? ['Adapter la description selon le modèle de référence', 'Mettre en avant la valeur proposée du modèle']
    : ['Améliorer la présentation générale', 'Optimiser le discours commercial'];
    
  const termsRecommendations = referenceModel && referenceModel.recommended_terms
    ? Object.values(referenceModel.recommended_terms).filter(term => typeof term === 'string')
    : ['Conditions de paiement flexibles', 'Garanties appropriées'];

  return {
    originalAmount,
    suggestedAmount: constrainedPrice.suggestedAmount,
    optimizationPercentage: constrainedPrice.optimizationPercentage,
    reasoning: constrainedPrice.reasoning + " (Optimisation fallback avec contraintes)",
    conversionProbability: 0.4,
    recommendations: {
      pricing: pricingRecommendations,
      description: descriptionRecommendations,
      terms: Array.isArray(termsRecommendations) ? termsRecommendations : ['Conditions standards applicables']
    },
    confidence: referenceModel ? 0.8 : 0.6,
    marketAnalysis: {
      sectorAverage: referenceModel?.price_optimal || originalAmount,
      competitivePosition: 'average',
      priceElasticity: 0.3
    },
    riskAssessment: {
      level: 'low',
      factors: [
        referenceModel ? `Basé sur modèle de référence validé: ${referenceModel.title}` : 'Optimisation conservatrice appliquée',
        'Contraintes de prix respectées'
      ]
    },
    referenceModel: referenceModel ? {
      id: referenceModel.id,
      title: referenceModel.title,
      priceOptimal: referenceModel.price_optimal,
      allowedRange: {
        min: Math.round(referenceModel.price_optimal * (1 + referenceModel.variation_min / 100)),
        max: Math.round(referenceModel.price_optimal * (1 + referenceModel.variation_max / 100))
      },
      usedAsReference: true
    } : undefined
  };
}

// Enregistrer l'utilisation du modèle de référence
async function logModelUsage(supabase: any, quoteId: string, referenceQuoteId: string, originalAmount: number, suggestedAmount: number) {
  try {
    await supabase
      .from('quote_model_usage')
      .insert({
        quote_id: quoteId,
        reference_quote_id: referenceQuoteId,
        original_amount: originalAmount,
        suggested_amount: suggestedAmount,
        applied_amount: suggestedAmount // Sera mis à jour si l'utilisateur applique
      });
      
    // Incrémenter le compteur d'utilisation du modèle
    await supabase
      .from('reference_quotes')
      .update({ usage_count: supabase.raw('usage_count + 1') })
      .eq('id', referenceQuoteId);
      
  } catch (error) {
    console.warn('Erreur lors de l\'enregistrement de l\'utilisation du modèle:', error);
  }
}

// [Fonctions d'application des optimisations - identiques à la version précédente]
async function applyOptimizationToQuote(supabase: any, quoteId: string, optimization: QuoteOptimization): Promise<boolean> {
  try {
    console.log(`🔄 Application des optimisations au devis ${quoteId}...`);
    
    const optimizedData: any = {
      amount: optimization.suggestedAmount,
      updated_at: new Date().toISOString(),
      optimization_applied: true,
      optimization_data: {
        original_amount: optimization.originalAmount,
        optimization_percentage: optimization.optimizationPercentage,
        ai_reasoning: optimization.reasoning,
        applied_at: new Date().toISOString(),
        model_version: 'gemini-pro-v2-constrained',
        reference_model_used: optimization.referenceModel?.id || null
      }
    };

    const { error: updateError } = await supabase
      .from('devis')
      .update(optimizedData)
      .eq('id', quoteId);

    if (updateError) {
      console.error('Erreur mise à jour devis:', updateError.message);
      return false;
    }

    console.log(`✅ Optimisations appliquées avec succès au devis ${quoteId}`);
    return true;

  } catch (error) {
    console.error('Erreur application optimisation:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);
    const { quoteId, companyId, applyOptimization } = await req.json();

    if (!quoteId) {
      return new Response(
        JSON.stringify({ success: false, error: 'ID du devis requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🚀 Optimisation du devis ${quoteId} avec modèles de référence`);

    // Récupérer les détails du devis
    const { data: quote, error: quoteError } = await supabase
      .from('devis')
      .select('*, companies(name, industry)')
      .eq('id', quoteId)
      .single();

    if (quoteError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Devis non trouvé' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rechercher le modèle de référence le plus adapté
    const referenceModel = await findBestReferenceModel(supabase, quote);
    
    if (referenceModel) {
      console.log(`📋 Modèle de référence trouvé: "${referenceModel.title}"`);
      console.log(`💰 Prix optimal: ${referenceModel.price_optimal.toLocaleString()} FCFA`);
      console.log(`📊 Variation autorisée: ${referenceModel.variation_min}% à +${referenceModel.variation_max}%`);
    } else {
      console.log('⚠️ Aucun modèle de référence trouvé - optimisation conservatrice');
    }

    // Analyser l'historique et les données sectorielles
    const historyData = await analyzeQuoteHistory(supabase, quote.company_id);
    const sectorData = await analyzeSectorData(supabase, 'services');

    const analysisData: QuoteAnalysisData = {
      quote: {
        ...quote,
        company_name: quote.companies?.name || 'Client'
      },
      companyHistory: [],
      sectorAverages: sectorData,
      conversionRates: {
        companyRate: historyData.conversionRate,
        avgAmount: historyData.avgAmount
      },
      referenceModel
    };

    // Générer l'optimisation avec contraintes
    const optimization = await callGeminiForQuoteOptimization(analysisData);

    // Enregistrer l'utilisation du modèle de référence
    if (referenceModel) {
      await logModelUsage(supabase, quoteId, referenceModel.id, optimization.originalAmount, optimization.suggestedAmount);
    }

    // Appliquer l'optimisation automatiquement si demandé
    let optimizationApplied = false;
    if (applyOptimization) {
      optimizationApplied = await applyOptimizationToQuote(supabase, quoteId, optimization);
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
        referenceModel: referenceModel ? {
          id: referenceModel.id,
          title: referenceModel.title,
          priceOptimal: referenceModel.price_optimal,
          constraintsApplied: true
        } : null,
        analysis: {
          conversionRate: historyData.conversionRate,
          sectorBenchmark: sectorData.avgConversion,
          modelUsed: referenceModel?.title || 'Aucun modèle de référence'
        },
        model: 'gemini-pro-v2-constrained',
        generated_at: new Date().toISOString(),
        applied: optimizationApplied
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur dans l\'optimisation IA:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de l\'optimisation du devis',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
