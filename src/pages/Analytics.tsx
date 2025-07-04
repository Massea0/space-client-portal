// src/pages/Analytics.tsx - Page IA Analytics complète
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  Sparkles,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Zap,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  ArrowLeft,
  Gauge,
  DollarSign,
  Users,
  FileText,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

import { analyticsService } from '@/services/analyticsService';
import PredictionCard from '@/components/analytics/PredictionCard';
import InsightCard from '@/components/analytics/InsightCard';

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>({
    predictions: [],
    insights: [],
    kpis: []
  });

  // Chargement des données depuis les services IA
  useEffect(() => {
    async function loadAnalyticsData() {
      setLoading(true);
      try {
        // Récupération des prédictions
        const predictionsData = await analyticsService.getPredictions(timeRange);
        
        // Mapping des icônes aux prédictions
        const predictionsWithIcons = predictionsData.predictions.map((pred: any) => {
          // Attribution des icônes en fonction de l'ID
          let icon = Activity;
          if (pred.id.includes('revenue') || pred.id.includes('ca')) icon = DollarSign;
          else if (pred.id.includes('conversion')) icon = Target;
          else if (pred.id.includes('risk') || pred.id.includes('risque')) icon = AlertTriangle;
          else if (pred.id.includes('efficiency')) icon = Gauge;
          
          return { ...pred, icon };
        });

        // Récupération des insights
        const insights = await analyticsService.getInsights();

        // Récupération des KPIs
        const performanceData = await analyticsService.getAIPerformanceKPIs();
        
        // Construction des KPIs formatés
        const kpis = performanceData ? [
          { 
            label: 'Précision IA', 
            value: `${performanceData.accuracy.toFixed(1)}%`, 
            trend: performanceData.accuracy_change > 0 ? 'up' : 'down',
            change: (performanceData.accuracy_change > 0 ? '+' : '') + performanceData.accuracy_change.toFixed(1) + '%'
          },
          { 
            label: 'Temps d\'analyse', 
            value: `${performanceData.response_time.toFixed(1)}s`, 
            trend: performanceData.response_time_change < 0 ? 'up' : 'down',
            change: (performanceData.response_time_change < 0 ? '' : '+') + performanceData.response_time_change.toFixed(1) + 's'
          },
          { 
            label: 'Prédictions réalisées', 
            value: performanceData.predictions_count.toLocaleString('fr-FR'),
            trend: 'up',
            change: `+${performanceData.predictions_change}`
          },
          { 
            label: 'Recommandations appliquées', 
            value: `${performanceData.recommendations_adoption.toFixed(0)}%`,
            trend: performanceData.recommendations_adoption_change > 0 ? 'up' : 'down',
            change: (performanceData.recommendations_adoption_change > 0 ? '+' : '') + performanceData.recommendations_adoption_change.toFixed(1) + '%'
          }
        ] : [];

        setAnalyticsData({
          predictions: predictionsWithIcons,
          insights,
          kpis
        });
      } catch (error) {
        console.error("Erreur lors du chargement des données d'analytics:", error);
        // En cas d'erreur, utiliser des données de fallback
        setAnalyticsData({
          predictions: [
            {
              id: 'revenue',
              title: 'Prédiction Chiffre d\'affaires',
              current: 145000,
              predicted: 167250,
              confidence: 89,
              trend: 'up',
              change: 15.3,
              icon: DollarSign,
              color: 'emerald'
            },
            {
              id: 'conversion',
              title: 'Taux de Conversion',
              current: 23.5,
              predicted: 28.2,
              confidence: 76,
              trend: 'up',
              change: 4.7,
              icon: Target,
              color: 'blue'
            },
            {
              id: 'risk',
              title: 'Risque Impayés',
              current: 4.2,
              predicted: 2.8,
              confidence: 82,
              trend: 'down',
              change: -1.4,
              icon: AlertTriangle,
              color: 'red'
            },
            {
              id: 'efficiency',
              title: 'Efficacité Opérationnelle',
              current: 87.3,
              predicted: 94.1,
              confidence: 91,
              trend: 'up',
              change: 6.8,
              icon: Activity,
              color: 'purple'
            }
          ],
          insights: [
            {
              type: 'opportunity',
              title: 'Optimisation des relances',
              description: 'Automatiser les relances peut réduire les impayés de 35%',
              impact: 'Haut',
              effort: 'Moyen',
              priority: 1
            },
            {
              type: 'warning',
              title: 'Pic de charge prévu',
              description: 'Augmentation de 40% des demandes attendue en août',
              impact: 'Haut',
              effort: 'Faible',
              priority: 2
            },
            {
              type: 'info',
              title: 'Nouveau segment client',
              description: 'Potentiel de 25% de CA supplémentaire identifié',
              impact: 'Moyen',
              effort: 'Haut',
              priority: 3
            }
          ],
          kpis: [
            { label: 'Précision IA', value: '94.2%', trend: 'up', change: '+2.1%' },
            { label: 'Temps d\'analyse', value: '1.3s', trend: 'down', change: '-0.4s' },
            { label: 'Prédictions réalisées', value: '1,247', trend: 'up', change: '+156' },
            { label: 'Recommandations appliquées', value: '89%', trend: 'up', change: '+5.2%' }
          ]
        });
      } finally {
        setLoading(false);
      }
    }

    loadAnalyticsData();
  }, [timeRange]);

  const refreshData = async () => {
    setLoading(true);
    try {
      // Récupération des prédictions
      const predictionsData = await analyticsService.getPredictions(timeRange);
      
      // Mapping des icônes aux prédictions
      const predictionsWithIcons = predictionsData.predictions.map((pred: any) => {
        // Attribution des icônes en fonction de l'ID
        let icon = Activity;
        if (pred.id.includes('revenue') || pred.id.includes('ca')) icon = DollarSign;
        else if (pred.id.includes('conversion')) icon = Target;
        else if (pred.id.includes('risk') || pred.id.includes('risque')) icon = AlertTriangle;
        else if (pred.id.includes('efficiency')) icon = Gauge;
        
        return { ...pred, icon };
      });

      // Récupération des insights
      const insights = await analyticsService.getInsights();

      // Récupération des KPIs
      const performanceData = await analyticsService.getAIPerformanceKPIs();
      
      // Construction des KPIs formatés
      const kpis = performanceData ? [
        { 
          label: 'Précision IA', 
          value: `${performanceData.accuracy.toFixed(1)}%`, 
          trend: performanceData.accuracy_change > 0 ? 'up' : 'down',
          change: (performanceData.accuracy_change > 0 ? '+' : '') + performanceData.accuracy_change.toFixed(1) + '%'
        },
        { 
          label: 'Temps d\'analyse', 
          value: `${performanceData.response_time.toFixed(1)}s`, 
          trend: performanceData.response_time_change < 0 ? 'up' : 'down',
          change: (performanceData.response_time_change < 0 ? '' : '+') + performanceData.response_time_change.toFixed(1) + 's'
        },
        { 
          label: 'Prédictions réalisées', 
          value: performanceData.predictions_count.toLocaleString('fr-FR'),
          trend: 'up',
          change: `+${performanceData.predictions_change}`
        },
        { 
          label: 'Recommandations appliquées', 
          value: `${performanceData.recommendations_adoption.toFixed(0)}%`,
          trend: performanceData.recommendations_adoption_change > 0 ? 'up' : 'down',
          change: (performanceData.recommendations_adoption_change > 0 ? '+' : '') + performanceData.recommendations_adoption_change.toFixed(1) + '%'
        }
      ] : [];

      setAnalyticsData({
        predictions: predictionsWithIcons,
        insights,
        kpis
      });
    } catch (error) {
      console.error("Erreur lors de l'actualisation des données d'analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  IA Analytics Pro
                </h1>
                <p className="text-muted-foreground mt-1">
                  Intelligence artificielle et prédictions avancées
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 jours</SelectItem>
                  <SelectItem value="30d">30 jours</SelectItem>
                  <SelectItem value="90d">3 mois</SelectItem>
                  <SelectItem value="1y">1 an</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              
              <Button 
                onClick={refreshData}
                disabled={loading}
                size="sm"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                Actualiser
              </Button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-20"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Brain className="h-12 w-12 animate-pulse text-purple-500" />
                    <div className="absolute inset-0 h-12 w-12 border-2 border-purple-500/20 rounded-full animate-ping"></div>
                  </div>
                  <p className="text-muted-foreground">Analyse IA en cours...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* KPIs IA */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {analyticsData.kpis.map((kpi, index) => (
                    <motion.div
                      key={kpi.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">{kpi.label}</p>
                              <p className="text-2xl font-bold">{kpi.value}</p>
                              <div className={cn(
                                "flex items-center gap-1 text-sm",
                                kpi.trend === 'up' ? "text-green-600" : "text-red-600"
                              )}>
                                {kpi.trend === 'up' ? (
                                  <TrendingUp className="h-3 w-3" />
                                ) : (
                                  <TrendingDown className="h-3 w-3" />
                                )}
                                {kpi.change}
                              </div>
                            </div>
                            <Gauge className="h-8 w-8 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Prédictions principales */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {analyticsData.predictions.map((prediction, index) => (
                    <PredictionCard
                      key={prediction.id}
                      id={prediction.id}
                      title={prediction.title}
                      current={prediction.current}
                      predicted={prediction.predicted}
                      confidence={prediction.confidence}
                      trend={prediction.trend}
                      change={prediction.change}
                      icon={prediction.icon}
                      color={prediction.color || 'blue'}
                      currencyFormat={prediction.id.includes('revenue') || prediction.id.includes('ca')}
                      percentFormat={prediction.id.includes('percent') || prediction.id.includes('taux')}
                      delay={index}
                      onClick={() => navigate('/analytics/predictions')}
                    />
                  ))}
                </div>

                {/* Insights et recommandations */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        Recommandations IA
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {analyticsData.insights.map((insight, index) => (
                          <InsightCard
                            key={index}
                            type={insight.type}
                            title={insight.title}
                            description={insight.description}
                            impact={insight.impact}
                            effort={insight.effort}
                            priority={insight.priority}
                            delay={index}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Footer IA */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  className="text-center py-8"
                >
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      IA active
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Dernière analyse: {new Date().toLocaleTimeString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-3 w-3" />
                      Modèle v2.1.0
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
