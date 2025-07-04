// supabase/functions/ai-payment-prediction/index.ts
// Migration vers Gemini AI - Version 2.0
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GeminiClient } from '../_shared/gemini-client.ts';

// Configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

interface PaymentPrediction {
  invoiceId: string;
  paymentProbability: number; // 0-1
  predictedPaymentDate: string;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  confidence: number; // 0-1
  reasoning?: string;
  paymentDelayEstimate?: number;
  factors?: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
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

// Fonction pour analyser l'historique de paiement d'une entreprise
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
    return {
      invoice_id: '',
      company_id: companyId,
      amount: 0,
      created_at: '',
      due_date: '',
      paid_at: null,
      status: '',
      company_name: '',
      totalInvoices: 0,
      paidInvoices: 0,
      paymentRate: 0.5,
      avgPaymentDelay: 30,
      avgAmount: 0
    };
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

// Fonction pour appeler Gemini AI pour l'analyse prédictive
async function callGeminiForPrediction(invoice: any, historyData: InvoiceHistoryData): Promise<PaymentPrediction> {
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

  try {
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

  } catch (error) {
    console.error('Erreur prédiction Gemini:', error);
    return generateFallbackPrediction(invoice, historyData);
  }
}

// Fonction de fallback pour générer une prédiction basique
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
    reasoning: 'Prédiction basée sur l\'historique en mode fallback',
    paymentDelayEstimate: estimatedDays,
    factors: {
      positive: ['Historique disponible'],
      negative: ['Données IA limitées'],
      neutral: ['Analyse statistique standard']
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
    
    const { invoiceId, companyId } = await req.json();

    if (!invoiceId) {
      return new Response(
        JSON.stringify({ error: 'invoiceId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer les détails de la facture
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, companies(name)')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return new Response(
        JSON.stringify({ error: 'Invoice not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Analyser l'historique de paiement
    const historyData = await analyzePaymentHistory(supabase, invoice.company_id);

    // Générer la prédiction IA avec Gemini
    const prediction = await callGeminiForPrediction(invoice, historyData);

    // Sauvegarder la prédiction pour suivi
    try {
      const { error: saveError } = await supabase
        .from('payment_predictions')
        .upsert({
          invoice_id: invoiceId,
          prediction_data: prediction,
          created_at: new Date().toISOString(),
          model_version: 'gemini-pro-v1'
        });

      if (saveError) {
        console.error('Error saving prediction:', saveError);
      }
    } catch (saveException) {
      console.warn('Table payment_predictions non disponible:', saveException);
    }

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
        model: 'gemini-pro',
        generated_at: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Payment prediction error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
