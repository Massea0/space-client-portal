// supabase/functions/ai-payment-prediction/index-optimized.ts
// Version optimisée avec cache, retry logic, et monitoring

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GeminiClient } from '../_shared/gemini-client.ts';

// Configuration optimisée
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Configuration cache et performance
const CACHE_TTL_MINUTES = parseInt(Deno.env.get('PREDICTION_CACHE_TTL') || '30');
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 seconde

interface PaymentPrediction {
  invoiceId: string;
  paymentProbability: number;
  predictedPaymentDate: string;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  confidence: number;
  reasoning?: string;
  paymentDelayEstimate?: number;
  factors?: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
}

interface CachedPrediction {
  prediction: PaymentPrediction;
  timestamp: number;
  ttl: number;
}

interface InvoiceHistoryData {
  invoice_id: string;
  company_id: string;
  amount: number;
  created_at: string;
  due_date: string;
  paid_at: string | null;
  status: string;
  company_name: string;
  payment_delay_days?: number;
  totalInvoices: number;
  paidInvoices: number;
  paymentRate: number;
  avgPaymentDelay: number;
  avgAmount: number;
  lastPaymentDate?: string;
}

interface PredictionMetrics {
  requestsTotal: number;
  cacheHits: number;
  cacheMisses: number;
  errors: number;
  avgResponseTime: number;
  lastUpdated: number;
}

// Cache en mémoire (pour démo, utiliser Redis en production)
const predictionCache = new Map<string, CachedPrediction>();
const metrics: PredictionMetrics = {
  requestsTotal: 0,
  cacheHits: 0,
  cacheMisses: 0,
  errors: 0,
  avgResponseTime: 0,
  lastUpdated: Date.now()
};

// Fonction de cache intelligent
function getCachedPrediction(invoiceId: string): PaymentPrediction | null {
  const cached = predictionCache.get(invoiceId);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > cached.ttl) {
    predictionCache.delete(invoiceId);
    return null;
  }
  
  return cached.prediction;
}

function setCachedPrediction(invoiceId: string, prediction: PaymentPrediction, customTTL?: number): void {
  const ttl = customTTL || (CACHE_TTL_MINUTES * 60 * 1000);
  predictionCache.set(invoiceId, {
    prediction,
    timestamp: Date.now(),
    ttl
  });
}

// TTL adaptatif basé sur le type de facture
function calculateAdaptiveTTL(invoice: any): number {
  const baseTTL = CACHE_TTL_MINUTES * 60 * 1000;
  
  // Factures récentes : TTL plus court
  const invoiceAge = Date.now() - new Date(invoice.created_at).getTime();
  const daysSinceCreated = invoiceAge / (1000 * 60 * 60 * 24);
  
  if (daysSinceCreated < 7) {
    return baseTTL * 0.5; // 15 minutes pour les factures récentes
  } else if (daysSinceCreated > 30) {
    return baseTTL * 2; // 1 heure pour les factures anciennes
  }
  
  return baseTTL;
}

// Retry logic avec exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>, 
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = RETRY_DELAY_BASE * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.warn(`Tentative ${attempt} échouée, retry dans ${delay}ms:`, error.message);
    }
  }
  
  throw lastError!;
}

// Mise à jour des métriques
function updateMetrics(responseTime: number, wasCacheHit: boolean, wasError: boolean): void {
  metrics.requestsTotal++;
  
  if (wasCacheHit) {
    metrics.cacheHits++;
  } else {
    metrics.cacheMisses++;
  }
  
  if (wasError) {
    metrics.errors++;
  }
  
  // Calcul moyenne mobile du temps de réponse
  metrics.avgResponseTime = (metrics.avgResponseTime * (metrics.requestsTotal - 1) + responseTime) / metrics.requestsTotal;
  metrics.lastUpdated = Date.now();
}

// Nettoyage périodique du cache
function cleanupCache(): void {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, cached] of predictionCache.entries()) {
    if (now - cached.timestamp > cached.ttl) {
      predictionCache.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 Cache cleanup: ${cleaned} entrées supprimées`);
  }
}

// Analyse de l'historique de paiement (optimisée)
async function analyzePaymentHistory(supabase: any, companyId: string): Promise<InvoiceHistoryData> {
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select(`
      id,
      company_id,
      amount,
      created_at,
      due_date,
      paid_at,
      status,
      companies(name)
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching payment history:', error);
    throw new Error('Failed to fetch payment history');
  }

  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  const paymentDelays = paidInvoices
    .filter(inv => inv.paid_at && inv.due_date)
    .map(inv => {
      const paidDate = new Date(inv.paid_at!);
      const dueDate = new Date(inv.due_date);
      return Math.ceil((paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    });

  const avgDelay = paymentDelays.length > 0 
    ? paymentDelays.reduce((sum, delay) => sum + delay, 0) / paymentDelays.length 
    : 30;

  const avgAmount = invoices.length > 0
    ? invoices.reduce((sum, inv) => sum + inv.amount, 0) / invoices.length
    : 0;

  return {
    invoice_id: '',
    company_id: companyId,
    amount: 0,
    created_at: '',
    due_date: '',
    paid_at: null,
    status: '',
    company_name: invoices[0]?.companies?.name || 'Entreprise inconnue',
    totalInvoices: invoices.length,
    paidInvoices: paidInvoices.length,
    paymentRate: invoices.length > 0 ? paidInvoices.length / invoices.length : 0.5,
    avgPaymentDelay: avgDelay,
    avgAmount: avgAmount,
    lastPaymentDate: paidInvoices[0]?.paid_at || undefined
  };
}

// Prédiction Gemini avec retry
async function callGeminiForPrediction(invoice: any, historyData: InvoiceHistoryData): Promise<PaymentPrediction> {
  return await withRetry(async () => {
    const geminiClient = new GeminiClient();
    
    const systemPrompt = `Tu es un expert en analyse financière et prédiction de paiements pour le marché B2B sénégalais. 
Tu dois analyser les données de facturation et l'historique de paiement pour prédire la probabilité et la date de paiement.

CONTEXTE ÉCONOMIQUE SÉNÉGAL:
- Délais de paiement B2B moyens: 45-60 jours
- Taux de défaut secteur privé: 15-20%
- Saisonnalité: ralentissement en juin-août et décembre-janvier

Réponds UNIQUEMENT en JSON valide avec la structure exacte demandée.`;

    const prompt = geminiClient.createOptimizedPrompt(
      'Prédiction de paiement B2B Sénégal',
      {
        facture: {
          id: invoice.id,
          numero: invoice.number,
          montant: invoice.amount,
          date_creation: invoice.created_at,
          date_echeance: invoice.due_date,
          entreprise: invoice.companies?.name || 'N/A',
          statut: invoice.status,
          age_facture_jours: Math.ceil((new Date().getTime() - new Date(invoice.created_at).getTime()) / (1000 * 60 * 60 * 24))
        },
        historique_entreprise: {
          nom: historyData.company_name,
          total_factures: historyData.totalInvoices,
          factures_payees: historyData.paidInvoices,
          taux_paiement: historyData.paymentRate,
          delai_moyen_paiement: historyData.avgPaymentDelay,
          montant_moyen: historyData.avgAmount,
          derniere_activite: historyData.lastPaymentDate
        }
      },
      `Analyse la probabilité de paiement et prédit la date de paiement la plus probable. 
      
      Facteurs à considérer:
      1. Historique de paiement de l'entreprise (40% du poids)
      2. Montant de la facture vs historique (20%)
      3. Délais habituels du secteur (20%) 
      4. Saisonnalité des paiements au Sénégal (20%)
      
      Format de réponse JSON requis:
      {
        "paymentProbability": number, // entre 0 et 1
        "predictedPaymentDate": "YYYY-MM-DD",
        "riskLevel": "low|medium|high",
        "recommendations": ["action1", "action2", "action3"],
        "confidence": number, // entre 0 et 1
        "reasoning": "explication détaillée de l'analyse",
        "paymentDelayEstimate": number, // jours estimés après échéance
        "factors": {
          "positive": ["facteur1", "facteur2"],
          "negative": ["facteur1", "facteur2"],
          "neutral": ["facteur1"]
        }
      }`
    );

    const response = await geminiClient.generateContent({
      prompt,
      systemPrompt,
      temperature: 0.3,
      maxTokens: 1500
    });

    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de l\'appel Gemini');
    }

    const aiResponse = geminiClient.parseJsonResponse(response.content!);
    
    if (aiResponse.error) {
      throw new Error('Format de réponse IA invalide');
    }

    return {
      invoiceId: invoice.id,
      paymentProbability: aiResponse.paymentProbability || 0.5,
      predictedPaymentDate: aiResponse.predictedPaymentDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      riskLevel: aiResponse.riskLevel || 'medium',
      recommendations: aiResponse.recommendations || ['Suivi standard recommandé'],
      confidence: aiResponse.confidence || 0.6,
      reasoning: aiResponse.reasoning || 'Analyse basée sur les données disponibles',
      paymentDelayEstimate: aiResponse.paymentDelayEstimate || 30,
      factors: aiResponse.factors || { positive: [], negative: [], neutral: [] }
    };
  });
}

// Fallback optimisé
function generateFallbackPrediction(invoice: any, historyData: InvoiceHistoryData): PaymentPrediction {
  const probability = Math.max(0.1, historyData.paymentRate || 0.5);
  const estimatedDays = Math.max(7, (historyData.avgPaymentDelay || 30) + 7);
  const predictedDate = new Date();
  predictedDate.setDate(predictedDate.getDate() + estimatedDays);

  return {
    invoiceId: invoice.id,
    paymentProbability: probability,
    predictedPaymentDate: predictedDate.toISOString().split('T')[0],
    riskLevel: probability > 0.7 ? 'low' : probability > 0.4 ? 'medium' : 'high',
    recommendations: [
      'Relance automatique programmée',
      'Suivi personnalisé recommandé',
      'Vérification du contact client'
    ],
    confidence: 0.6,
    reasoning: 'Prédiction basée sur l\'historique en mode fallback optimisé',
    paymentDelayEstimate: estimatedDays,
    factors: {
      positive: ['Historique disponible', 'Algorithme de fallback robuste'],
      negative: ['IA temporairement indisponible'],
      neutral: ['Analyse statistique standard']
    }
  };
}

serve(async (req) => {
  // Gestion CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();
  let wasCacheHit = false;
  let wasError = false;

  try {
    // Nettoyage périodique du cache (tous les 100 requests)
    if (metrics.requestsTotal % 100 === 0) {
      cleanupCache();
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);
    
    const { invoiceId, companyId, forceRefresh = false } = await req.json();

    if (!invoiceId) {
      wasError = true;
      return new Response(
        JSON.stringify({ error: 'invoiceId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier le cache en premier (sauf si forceRefresh)
    if (!forceRefresh) {
      const cachedPrediction = getCachedPrediction(invoiceId);
      if (cachedPrediction) {
        wasCacheHit = true;
        updateMetrics(Date.now() - startTime, wasCacheHit, wasError);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            prediction: cachedPrediction,
            cached: true,
            cacheHit: true,
            model: 'gemini-pro-cached',
            generated_at: new Date().toISOString(),
            metrics: {
              responseTime: Date.now() - startTime,
              cacheHitRate: (metrics.cacheHits / metrics.requestsTotal * 100).toFixed(1)
            }
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Récupérer les détails de la facture
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, companies(name)')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      wasError = true;
      return new Response(
        JSON.stringify({ error: 'Invoice not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Analyser l'historique avec retry
    const historyData = await withRetry(() => analyzePaymentHistory(supabase, invoice.company_id));

    // Générer la prédiction IA avec retry et fallback
    let prediction: PaymentPrediction;
    try {
      prediction = await callGeminiForPrediction(invoice, historyData);
    } catch (error) {
      console.warn('Fallback vers prédiction statistique:', error.message);
      prediction = generateFallbackPrediction(invoice, historyData);
    }

    // Mise en cache avec TTL adaptatif
    const adaptiveTTL = calculateAdaptiveTTL(invoice);
    setCachedPrediction(invoiceId, prediction, adaptiveTTL);

    // Sauvegarder la prédiction
    try {
      const { error: saveError } = await supabase
        .from('payment_predictions')
        .upsert({
          invoice_id: invoiceId,
          prediction_data: prediction,
          created_at: new Date().toISOString(),
          model_version: 'gemini-pro-optimized-v1'
        });

      if (saveError) {
        console.error('Error saving prediction:', saveError);
      }
    } catch (saveException) {
      console.warn('Table payment_predictions non disponible:', saveException);
    }

    // Mettre à jour les métriques
    updateMetrics(Date.now() - startTime, wasCacheHit, wasError);

    return new Response(
      JSON.stringify({ 
        success: true, 
        prediction,
        historyData: {
          company: historyData.company_name,
          totalInvoices: historyData.totalInvoices,
          paymentRate: historyData.paymentRate,
          avgDelay: historyData.avgPaymentDelay
        },
        cached: false,
        model: 'gemini-pro-optimized',
        generated_at: new Date().toISOString(),
        metrics: {
          responseTime: Date.now() - startTime,
          cacheHitRate: metrics.requestsTotal > 0 ? (metrics.cacheHits / metrics.requestsTotal * 100).toFixed(1) : '0.0',
          totalRequests: metrics.requestsTotal,
          avgResponseTime: Math.round(metrics.avgResponseTime)
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    wasError = true;
    console.error('Payment prediction error:', error);
    updateMetrics(Date.now() - startTime, wasCacheHit, wasError);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        metrics: {
          responseTime: Date.now() - startTime,
          errorRate: (metrics.errors / metrics.requestsTotal * 100).toFixed(1)
        }
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
