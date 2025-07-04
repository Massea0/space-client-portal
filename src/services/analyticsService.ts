// src/services/analyticsService.ts
import { supabase } from '@/lib/supabaseClient';
import { formatDate } from '@/lib/utils';

/**
 * Service pour la récupération des données d'analyse et des prédictions IA
 */
export const analyticsService = {
  /**
   * Récupère les prédictions IA principales
   * @param timeRange - Période d'analyse ('7d', '30d', '90d', '1y')
   */
  async getPredictions(timeRange: string = '30d') {
    try {
      // Appel à la fonction Edge "ai-payment-prediction" pour des prédictions
      const { data, error } = await supabase.functions.invoke('ai-payment-prediction', {
        body: { timeRange }
      });

      if (error) {
        throw new Error(`Erreur lors de la récupération des prédictions: ${error.message}`);
      }

      return data || {
        predictions: [],
        confidence: 0,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur du service analytics (prédictions):', error);
      // Fallback avec des données simulées en cas d'erreur
      return {
        predictions: [
          {
            id: 'revenue',
            title: 'Prédiction Chiffre d\'affaires',
            current: 145000,
            predicted: 167250,
            confidence: 89,
            trend: 'up',
            change: 15.3,
            color: 'emerald'
          },
          // Autres prédictions fallback...
        ],
        confidence: 80,
        lastUpdated: new Date().toISOString()
      };
    }
  },

  /**
   * Récupère les insights et recommandations basés sur l'IA
   */
  async getInsights() {
    try {
      const { data, error } = await supabase.functions.invoke('recommend-services', {
        body: { includeAnalytics: true }
      });

      if (error) {
        throw new Error(`Erreur lors de la récupération des insights: ${error.message}`);
      }

      return data?.insights || [];
    } catch (error) {
      console.error('Erreur du service analytics (insights):', error);
      // Données de secours
      return [];
    }
  },

  /**
   * Récupère les KPIs de performance des modèles IA
   */
  async getAIPerformanceKPIs() {
    try {
      const { data, error } = await supabase
        .from('ai_performance_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      return data || null;
    } catch (error) {
      console.error('Erreur du service analytics (KPIs):', error);
      return null;
    }
  },

  /**
   * Récupère les données d'efficacité opérationnelle
   */
  async getEfficiencyMetrics() {
    try {
      const { data, error } = await supabase
        .from('operational_efficiency')
        .select('*')
        .order('date', { ascending: false })
        .limit(6);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erreur du service analytics (efficacité):', error);
      return [];
    }
  },

  /**
   * Récupère les données d'analyse des risques
   */
  async getRiskAnalysis() {
    try {
      // Appel à la fonction Edge d'analyse des risques
      const { data, error } = await supabase.functions.invoke('analyze-contract-compliance', {
        body: { analysisType: 'risk' }
      });

      if (error) throw error;

      return data || null;
    } catch (error) {
      console.error('Erreur du service analytics (risques):', error);
      return null;
    }
  },

  /**
   * Récupère les rapports générés par IA
   */
  async getReports(category: string = 'all') {
    try {
      let query = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erreur du service analytics (rapports):', error);
      return [];
    }
  }
};
