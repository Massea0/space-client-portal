// src/services/aiService.ts
import { supabase } from '@/lib/supabaseClient';
import { errorReporter } from '@/lib/errorReporter';

export interface PaymentPrediction {
  invoiceId: string;
  paymentProbability: number;
  predictedPaymentDate: string;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  confidence: number;
}

export interface QuoteOptimization {
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
}

export interface AIAlert {
  id: string;
  type: 'payment_reminder' | 'quote_optimization' | 'client_analysis' | 'revenue_prediction';
  entityType: 'invoice' | 'quote' | 'company' | 'global';
  entityId?: string;
  title: string;
  message: string;
  data?: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'dismissed' | 'resolved';
  createdAt: Date;
  expiresAt?: Date;
}

export interface ClientBehaviorAnalysis {
  companyId: string;
  riskScore: number; // 0-100
  predictedLTV: number;
  analysisData: {
    paymentBehavior: {
      averagePaymentDelay: number;
      paymentReliability: number;
      totalTransactions: number;
    };
    businessPattern: {
      seasonality: string[];
      preferredServices: string[];
      growthTrend: 'positive' | 'stable' | 'declining';
    };
    recommendations: {
      retention: string[];
      upselling: string[];
      riskMitigation: string[];
    };
  };
  createdAt: Date;
}

class AIService {
  
  /**
   * Génère une prédiction de paiement pour une facture donnée
   */
  async predictPayment(invoiceId: string): Promise<PaymentPrediction> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-payment-prediction', {
        body: { invoiceId }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Échec de la prédiction de paiement');
      }

      return data.prediction;
    } catch (error) {
      errorReporter.captureException(error, {
        component: 'AIService',
        action: 'predictPayment',
        invoiceId
      });
      throw error;
    }
  }

  /**
   * Optimise un devis avec l'IA
   */
  async optimizeQuote(quoteId: string, applyOptimization: boolean = false): Promise<QuoteOptimization> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-quote-optimization', {
        body: { 
          quoteId,
          applyOptimization 
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Échec de l\'optimisation du devis');
      }

      return data.optimization;
    } catch (error) {
      errorReporter.captureException(error, {
        component: 'AIService',
        action: 'optimizeQuote',
        quoteId,
        applyOptimization
      });
      throw error;
    }
  }

  /**
   * Applique automatiquement les optimisations IA au devis
   */
  async applyQuoteOptimization(quoteId: string): Promise<QuoteOptimization> {
    return this.optimizeQuote(quoteId, true);
  }

  /**
   * Récupère les alertes IA actives pour l'utilisateur
   */
  async getActiveAlerts(): Promise<AIAlert[]> {
    try {
      const { data, error } = await supabase
        .from('ai_alerts')
        .select('*')
        .eq('status', 'active')
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(alert => ({
        id: alert.id,
        type: alert.type,
        entityType: alert.entity_type,
        entityId: alert.entity_id,
        title: alert.title,
        message: alert.message,
        data: alert.data,
        priority: alert.priority,
        status: alert.status,
        createdAt: new Date(alert.created_at),
        expiresAt: alert.expires_at ? new Date(alert.expires_at) : undefined
      }));
    } catch (error) {
      errorReporter.captureException(error, {
        component: 'AIService',
        action: 'getActiveAlerts'
      });
      throw error;
    }
  }

  /**
   * Marque une alerte comme résolue ou ignorée
   */
  async updateAlertStatus(alertId: string, status: 'dismissed' | 'resolved'): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_alerts')
        .update({ status })
        .eq('id', alertId);

      if (error) throw error;
    } catch (error) {
      errorReporter.captureException(error, {
        component: 'AIService',
        action: 'updateAlertStatus',
        alertId,
        status
      });
      throw error;
    }
  }

  /**
   * Récupère l'analyse comportementale d'un client
   */
  async getClientBehaviorAnalysis(companyId: string): Promise<ClientBehaviorAnalysis | null> {
    try {
      const { data, error } = await supabase
        .from('client_behavior_analysis')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Pas d'analyse trouvée
        }
        throw error;
      }

      return {
        companyId: data.company_id,
        riskScore: data.risk_score,
        predictedLTV: parseFloat(data.predicted_ltv),
        analysisData: data.analysis_data,
        createdAt: new Date(data.created_at)
      };
    } catch (error) {
      errorReporter.captureException(error, {
        component: 'AIService',
        action: 'getClientBehaviorAnalysis',
        companyId
      });
      throw error;
    }
  }

  /**
   * Génère des alertes personnalisées basées sur les prédictions
   */
  async generatePersonalizedReminders(invoiceId: string): Promise<void> {
    try {
      // Récupérer la prédiction existante ou en créer une nouvelle
      const prediction = await this.predictPayment(invoiceId);
      
      // La création d'alertes est gérée automatiquement par le trigger SQL
      // Cette méthode peut être étendue pour des alertes plus sophistiquées
      
      console.log(`Alerte générée pour la facture ${invoiceId} avec un risque ${prediction.riskLevel}`);
    } catch (error) {
      errorReporter.captureException(error, {
        component: 'AIService',
        action: 'generatePersonalizedReminders',
        invoiceId
      });
      throw error;
    }
  }

  /**
   * Analyse tous les devis en attente pour optimisation
   */
  async analyzePendingQuotes(): Promise<{ quoteId: string; optimization: QuoteOptimization }[]> {
    try {
      // Récupérer les devis en attente
      const { data: pendingQuotes, error } = await supabase
        .from('devis')
        .select('id')
        .in('status', ['draft', 'sent', 'pending']);

      if (error) throw error;

      const optimizations = [];

      // Analyser chaque devis (en série pour éviter de surcharger l'API)
      for (const quote of pendingQuotes) {
        try {
          const optimization = await this.optimizeQuote(quote.id);
          optimizations.push({
            quoteId: quote.id,
            optimization
          });
          
          // Petite pause entre les appels
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Erreur lors de l'optimisation du devis ${quote.id}:`, error);
        }
      }

      return optimizations;
    } catch (error) {
      errorReporter.captureException(error, {
        component: 'AIService',
        action: 'analyzePendingQuotes'
      });
      throw error;
    }
  }

  /**
   * Récupère les métriques de performance IA
   */
  async getAIPerformanceMetrics(): Promise<{
    predictionAccuracy: number;
    optimizationImpact: number;
    alertsGenerated: number;
    alertsResolved: number;
  }> {
    try {
      // Cette fonction peut être étendue avec des requêtes plus sophistiquées
      const [predictions, optimizations, alerts] = await Promise.all([
        supabase.from('payment_predictions').select('*', { count: 'exact' }),
        supabase.from('quote_optimizations').select('*', { count: 'exact' }),
        supabase.from('ai_alerts').select('*', { count: 'exact' })
      ]);

      const alertsResolved = await supabase
        .from('ai_alerts')
        .select('*', { count: 'exact' })
        .eq('status', 'resolved');

      return {
        predictionAccuracy: 0.85, // À calculer avec des données réelles
        optimizationImpact: 0.12, // Amélioration moyenne des taux de conversion
        alertsGenerated: alerts.count || 0,
        alertsResolved: alertsResolved.count || 0
      };
    } catch (error) {
      errorReporter.captureException(error, {
        component: 'AIService',
        action: 'getAIPerformanceMetrics'
      });
      throw error;
    }
  }

  /**
   * Applique l'optimisation de description sur un devis
   */
  async applyDescriptionOptimization(devisId: string, optimizedDescription: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('devis')
        .update({ object: optimizedDescription })
        .eq('id', devisId);

      if (error) {
        console.error('Erreur lors de l\'application de l\'optimisation de description:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur inattendue lors de l\'application de l\'optimisation de description:', error);
      return false;
    }
  }

  /**
   * Applique l'optimisation de prix sur un devis
   */
  async applyPricingOptimization(devisId: string, suggestedAmount: number): Promise<boolean> {
    try {
      // Récupère le devis actuel avec ses items
      const { data: currentDevis, error: fetchError } = await supabase
        .from('devis')
        .select('*, devis_items(*)')
        .eq('id', devisId)
        .single();

      if (fetchError) {
        console.error('Erreur lors de la récupération du devis:', fetchError);
        return false;
      }

      if (!currentDevis) {
        console.error('Devis non trouvé:', devisId);
        return false;
      }

      // Sauvegarder le montant original s'il n'existe pas encore
      if (!currentDevis.original_amount) {
        await supabase
          .from('devis')
          .update({ original_amount: currentDevis.amount })
          .eq('id', devisId);
      }

      // Utiliser le montant original pour calculer le facteur d'ajustement
      const originalAmount = currentDevis.original_amount || currentDevis.amount;
      const adjustmentFactor = suggestedAmount / originalAmount;

      // Met à jour les items avec les prix ajustés proportionnellement
      let updatedItems = [];
      
      // Vérifier si les items sont dans devis_items ou items
      const items = currentDevis.devis_items || currentDevis.items || [];
      
      if (Array.isArray(items) && items.length > 0) {
        updatedItems = items.map((item: any) => ({
          ...item,
          unit_price: Math.round(item.unit_price * adjustmentFactor * 100) / 100, // Arrondi à 2 décimales
          total: Math.round(item.unit_price * adjustmentFactor * item.quantity * 100) / 100
        }));
      } else {
        // Si pas d'items, on met juste à jour le montant total
        console.log('Aucun item trouvé, mise à jour du montant seulement');
      }

      const { error } = await supabase
        .from('devis')
        .update({ 
          amount: suggestedAmount
        })
        .eq('id', devisId);

      if (error) {
        console.error('Erreur lors de l\'application de l\'optimisation de prix:', error);
        return false;
      }

      // Si on a des items dans devis_items, les mettre à jour aussi
      if (updatedItems.length > 0 && currentDevis.devis_items) {
        for (const item of updatedItems) {
          const { error: itemError } = await supabase
            .from('devis_items')
            .update({
              unit_price: item.unit_price,
              total: item.total
            })
            .eq('id', item.id);
            
          if (itemError) {
            console.error('Erreur lors de la mise à jour de l\'item:', itemError);
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Erreur inattendue lors de l\'application de l\'optimisation de prix:', error);
      return false;
    }
  }

  /**
   * Applique l'optimisation des conditions sur un devis
   */
  async applyTermsOptimization(devisId: string, optimizedTerms: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('devis')
        .update({ notes: optimizedTerms })
        .eq('id', devisId);

      if (error) {
        console.error('Erreur lors de l\'application de l\'optimisation des conditions:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur inattendue lors de l\'application de l\'optimisation des conditions:', error);
      return false;
    }
  }

  /**
   * Applique toutes les optimisations sur un devis
   */
  async applyAllOptimizations(devisId: string, optimization: QuoteOptimization): Promise<boolean> {
    try {
      let allSuccess = true;

      // Applique l'optimisation de description si la première recommandation existe
      if (optimization.recommendations?.description?.[0]) {
        const descSuccess = await this.applyDescriptionOptimization(devisId, optimization.recommendations.description[0]);
        if (!descSuccess) allSuccess = false;
      }

      // Applique l'optimisation de prix si le montant suggéré diffère de l'original
      if (optimization.suggestedAmount !== optimization.originalAmount) {
        const priceSuccess = await this.applyPricingOptimization(devisId, optimization.suggestedAmount);
        if (!priceSuccess) allSuccess = false;
      }

      // Applique l'optimisation des conditions si la première recommandation existe
      if (optimization.recommendations?.terms?.[0]) {
        const termsSuccess = await this.applyTermsOptimization(devisId, optimization.recommendations.terms[0]);
        if (!termsSuccess) allSuccess = false;
      }

      return allSuccess;
    } catch (error) {
      console.error('Erreur lors de l\'application de toutes les optimisations:', error);
      return false;
    }
  }
}

export const aiService = new AIService();
