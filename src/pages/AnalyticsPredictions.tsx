// src/pages/AnalyticsPredictions.tsx - Page des prévisions et analyses prédictives IA
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Brain,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Zap,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  FileText,
  Sparkles,
  Eye,
  Settings,
  Download,
  RefreshCw,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  Equal,
  Percent,
  Globe,
  Building,
  Lightbulb,
  Shield,
  Gauge
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import PredictionCard from '@/components/analytics/PredictionCard';
import { analyticsService } from '@/services/analyticsService';

// Types pour les prédictions
interface Prediction {
  id: string;
  category: string;
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  value?: string;
  trend: 'up' | 'down' | 'stable';
  factors: string[];
  recommendations: string[];
}

interface TrendData {
  period: string;
  actual: number;
  predicted: number;
  confidence: number;
}

interface RiskFactor {
  factor: string;
  probability: number;
  impact: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  mitigation: string;
}

const AnalyticsPredictions: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('revenue');
  const [timeframe, setTimeframe] = useState('3months');
  const [loading, setLoading] = useState(true);
  const [predictionData, setPredictionData] = useState<any[]>([]);

  // Chargement des prédictions via le service
  useEffect(() => {
    async function loadPredictions() {
      setLoading(true);
      try {
        const data = await analyticsService.getPredictions(timeframe === '3months' ? '90d' : timeframe === '1year' ? '1y' : '30d');
        
        // Mapping des icônes aux prédictions
        const predictionsWithIcons = data.predictions.map((pred: any) => {
          // Attribution des icônes en fonction de l'ID
          let icon = Activity;
          if (pred.id.includes('revenue') || pred.id.includes('ca')) icon = DollarSign;
          else if (pred.id.includes('conversion')) icon = Target;
          else if (pred.id.includes('risk') || pred.id.includes('risque')) icon = AlertTriangle;
          else if (pred.id.includes('efficiency')) icon = Gauge;
          else if (pred.id.includes('client') || pred.id.includes('customer')) icon = Users;
          else if (pred.id.includes('market') || pred.id.includes('marché')) icon = Globe;
          else if (pred.id.includes('cost') || pred.id.includes('coût')) icon = DollarSign;
          
          return { ...pred, icon };
        });
        
        setPredictionData(predictionsWithIcons);
      } catch (error) {
        console.error("Erreur lors du chargement des prédictions:", error);
        // Fallback aux données mockées en cas d'erreur
        setPredictionData([
          {
            id: 'revenue_q4',
            title: 'Croissance du chiffre d\'affaires Q4',
            current: 145000,
            predicted: 171100,
            confidence: 87,
            trend: 'up',
            change: 18,
            icon: DollarSign,
            color: 'emerald'
          },
          {
            id: 'churn_increase',
            title: 'Risque d\'augmentation du churn',
            current: 3.7,
            predicted: 6.0,
            confidence: 73,
            trend: 'up',
            change: 2.3,
            icon: Users,
            color: 'red'
          },
          {
            id: 'cost_optimization',
            title: 'Optimisation des coûts opérationnels',
            current: 42000,
            predicted: 36960,
            confidence: 91,
            trend: 'down',
            change: -12,
            icon: DollarSign,
            color: 'blue'
          },
          {
            id: 'market_share',
            title: 'Part de marché segment PME',
            current: 8.3,
            predicted: 10.5,
            confidence: 78,
            trend: 'up',
            change: 2.2,
            icon: Globe,
            color: 'purple'
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    loadPredictions();
  }, [timeframe]);

  // Fonction pour rafraîchir les données
  const refreshData = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getPredictions(timeframe === '3months' ? '90d' : timeframe === '1year' ? '1y' : '30d');
      
      const predictionsWithIcons = data.predictions.map((pred: any) => {
        // Attribution des icônes en fonction de l'ID
        let icon = Activity;
        if (pred.id.includes('revenue') || pred.id.includes('ca')) icon = DollarSign;
        else if (pred.id.includes('conversion')) icon = Target;
        else if (pred.id.includes('risk') || pred.id.includes('risque')) icon = AlertTriangle;
        else if (pred.id.includes('efficiency')) icon = Gauge;
        else if (pred.id.includes('client') || pred.id.includes('customer')) icon = Users;
        else if (pred.id.includes('market') || pred.id.includes('marché')) icon = Globe;
        else if (pred.id.includes('cost') || pred.id.includes('coût')) icon = DollarSign;
        
        return { ...pred, icon };
      });
      
      setPredictionData(predictionsWithIcons);
    } catch (error) {
      console.error("Erreur lors de l'actualisation des prédictions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Prédictions principales (données mockées par défaut)
  const defaultPredictions: Prediction[] = [
    {
      id: 'revenue_q4',
      category: 'Revenus',
      title: 'Croissance du chiffre d\'affaires Q4',
      description: 'Augmentation prévue de 18% du CA pour le Q4 2024',
      confidence: 87,
      impact: 'high',
      timeframe: '3 mois',
      value: '+18%',
      trend: 'up',
      factors: [
        'Saisonnalité historique forte',
        'Pipeline commercial robuste',
        'Nouveaux contrats signés'
      ],
      recommendations: [
        'Renforcer l\'équipe commerciale',
        'Préparer la montée en charge',
        'Sécuriser la trésorerie'
      ]
    },
    {
      id: 'churn_increase',
      category: 'Clients',
      title: 'Risque d\'augmentation du churn',
      description: 'Probabilité d\'augmentation du taux de désabonnement',
      confidence: 73,
      impact: 'medium',
      timeframe: '2 mois',
      value: '+2.3%',
      trend: 'up',
      factors: [
        'Baisse des scores de satisfaction',
        'Concurrence accrue',
        'Changements tarifaires récents'
      ],
      recommendations: [
        'Améliorer l\'onboarding',
        'Programme de rétention',
        'Analyse des retours clients'
      ]
    },
    {
      id: 'cost_optimization',
      category: 'Coûts',
      title: 'Optimisation des coûts opérationnels',
      description: 'Potentiel de réduction des coûts identifié',
      confidence: 91,
      impact: 'high',
      timeframe: '1 mois',
      value: '-12%',
      trend: 'down',
      factors: [
        'Inefficacités détectées',
        'Automatisation possible',
        'Renégociation fournisseurs'
      ],
      recommendations: [
        'Automatiser les processus',
        'Renégocier les contrats',
        'Optimiser les ressources'
      ]
    },
    {
      id: 'market_expansion',
      category: 'Marché',
      title: 'Opportunité d\'expansion géographique',
      description: 'Nouveau marché identifié avec fort potentiel',
      confidence: 65,
      impact: 'high',
      timeframe: '6 mois',
      value: '+25%',
      trend: 'up',
      factors: [
        'Demande croissante identifiée',
        'Faible concurrence locale',
        'Réglementation favorable'
      ],
      recommendations: [
        'Étude de marché approfondie',
        'Partenariats locaux',
        'Plan de déploiement progressif'
      ]
    }
  ];

  // Données de tendances
  const trendData: TrendData[] = [
    { period: 'Jan', actual: 120000, predicted: 118000, confidence: 95 },
    { period: 'Fév', actual: 135000, predicted: 132000, confidence: 92 },
    { period: 'Mar', actual: 128000, predicted: 130000, confidence: 89 },
    { period: 'Avr', actual: 142000, predicted: 145000, confidence: 87 },
    { period: 'Mai', actual: 158000, predicted: 155000, confidence: 91 },
    { period: 'Juin', actual: 0, predicted: 168000, confidence: 84 },
    { period: 'Juil', actual: 0, predicted: 175000, confidence: 78 },
    { period: 'Août', actual: 0, predicted: 162000, confidence: 75 }
  ];

  // Facteurs de risque
  const riskFactors: RiskFactor[] = [
    {
      factor: 'Pénurie de talents tech',
      probability: 78,
      impact: 85,
      severity: 'high',
      mitigation: 'Programme de formation interne et partenariats écoles'
    },
    {
      factor: 'Récession économique',
      probability: 45,
      impact: 92,
      severity: 'critical',
      mitigation: 'Diversification clientèle et réserves de trésorerie'
    },
    {
      factor: 'Évolution réglementaire',
      probability: 62,
      impact: 55,
      severity: 'medium',
      mitigation: 'Veille réglementaire et adaptabilité produit'
    },
    {
      factor: 'Cyberattaque',
      probability: 35,
      impact: 88,
      severity: 'high',
      mitigation: 'Renforcement sécurité et plan de continuité'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/50 dark:border-red-800';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/50 dark:border-yellow-800';
      case 'low': return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/50 dark:border-green-800';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-300 dark:text-red-300 dark:bg-red-900/50 dark:border-red-700';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-300 dark:text-orange-300 dark:bg-orange-900/50 dark:border-orange-700';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-300 dark:text-yellow-300 dark:bg-yellow-900/50 dark:border-yellow-700';
      case 'low': return 'text-green-700 bg-green-100 border-green-300 dark:text-green-300 dark:bg-green-900/50 dark:border-green-700';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/analytics')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Prédictions IA
                </h1>
                <p className="text-muted-foreground mt-1">
                  Analyses prédictives et insights stratégiques basés sur l'IA
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">1 mois</SelectItem>
                  <SelectItem value="3months">3 mois</SelectItem>
                  <SelectItem value="6months">6 mois</SelectItem>
                  <SelectItem value="1year">1 an</SelectItem>
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
          </motion.div>

          {/* Indicateurs de performance IA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            {[
              {
                label: 'Précision moyenne',
                value: '89.3%',
                change: '+2.1%',
                trend: 'up',
                icon: Target,
                color: 'text-green-600'
              },
              {
                label: 'Prédictions actives',
                value: '24',
                change: '+6',
                trend: 'up',
                icon: Brain,
                color: 'text-blue-600'
              },
              {
                label: 'Alertes critiques',
                value: '3',
                change: '-2',
                trend: 'down',
                icon: AlertTriangle,
                color: 'text-orange-600'
              },
              {
                label: 'ROI prédictions',
                value: '342%',
                change: '+18%',
                trend: 'up',
                icon: TrendingUp,
                color: 'text-purple-600'
              }
            ].map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg bg-muted", metric.color)}>
                          <metric.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {metric.label}
                          </p>
                          <p className="text-2xl font-bold">{metric.value}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn(
                          "flex items-center gap-1 text-sm font-medium",
                          metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        )}>
                          {metric.trend === 'up' ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {metric.change}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Contenu principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-muted/50">
                <TabsTrigger value="revenue" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Revenus
                </TabsTrigger>
                <TabsTrigger value="customers" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Clients
                </TabsTrigger>
                <TabsTrigger value="operations" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Opérations
                </TabsTrigger>
                <TabsTrigger value="risks" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Risques
                </TabsTrigger>
              </TabsList>

              {/* Onglet Revenus */}
              <TabsContent value="revenue" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <LineChart className="h-5 w-5" />
                        Prévisions de revenus
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {predictionData
                          .filter(p => p.id.includes('revenue') || p.category === 'Revenus')
                          .map((prediction, index) => (
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
                              color={prediction.color || 'emerald'}
                              currencyFormat={prediction.id.includes('revenue') || prediction.id.includes('ca')}
                              percentFormat={prediction.id.includes('percent') || prediction.id.includes('taux')}
                              delay={index}
                            />
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Prédictions clés
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {predictionData.filter(p => p.category === 'Revenus').map((prediction) => (
                          <div key={prediction.id} className="p-4 rounded-lg border">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-medium mb-1">{prediction.title}</h4>
                                <p className="text-sm text-muted-foreground">{prediction.description}</p>
                              </div>
                              <Badge className={getConfidenceColor(prediction.confidence)}>
                                {prediction.confidence}% confiance
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 mb-3">
                              <Badge className={getImpactColor(prediction.impact)}>
                                Impact {prediction.impact === 'high' ? 'élevé' : prediction.impact === 'medium' ? 'moyen' : 'faible'}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-3 w-3" />
                                {prediction.timeframe}
                              </div>
                              {prediction.value && (
                                <div className={cn(
                                  "flex items-center gap-1 text-sm font-medium",
                                  prediction.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                )}>
                                  {prediction.trend === 'up' ? (
                                    <ArrowUpRight className="h-3 w-3" />
                                  ) : (
                                    <ArrowDownRight className="h-3 w-3" />
                                  )}
                                  {prediction.value}
                                </div>
                              )}
                            </div>

                            <Separator className="my-3" />

                            <div className="space-y-2">
                              <h5 className="text-sm font-medium">Facteurs clés:</h5>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {prediction.factors.slice(0, 2).map((factor, i) => (
                                  <li key={i} className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                                    {factor}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Onglet Clients */}
              <TabsContent value="customers" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Analyse comportementale
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { segment: 'Clients fidèles', count: 1247, trend: '+8%', retention: 94, color: 'bg-green-500' },
                          { segment: 'Clients à risque', count: 89, trend: '-12%', retention: 67, color: 'bg-red-500' },
                          { segment: 'Nouveaux clients', count: 156, trend: '+23%', retention: 78, color: 'bg-blue-500' },
                          { segment: 'Clients premium', count: 67, trend: '+15%', retention: 96, color: 'bg-purple-500' }
                        ].map((segment) => (
                          <div key={segment.segment} className="p-4 rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className={cn("w-3 h-3 rounded-full", segment.color)} />
                                <span className="font-medium">{segment.segment}</span>
                              </div>
                              <Badge variant="outline">{segment.count}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Évolution: </span>
                                <span className={cn(
                                  "font-medium",
                                  segment.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                                )}>
                                  {segment.trend}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Rétention: </span>
                                <span className="font-medium">{segment.retention}%</span>
                              </div>
                            </div>
                            <Progress value={segment.retention} className="mt-2 h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Recommandations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {predictionData.filter(p => p.category === 'Clients').map((prediction) => (
                          <div key={prediction.id} className="p-4 rounded-lg border">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-medium mb-1">{prediction.title}</h4>
                                <p className="text-sm text-muted-foreground">{prediction.description}</p>
                              </div>
                              <Badge className={getConfidenceColor(prediction.confidence)}>
                                {prediction.confidence}%
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <h5 className="text-sm font-medium">Actions recommandées:</h5>
                              <ul className="text-sm space-y-1">
                                {prediction.recommendations.map((rec, i) => (
                                  <li key={i} className="flex items-center gap-2">
                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Onglet Opérations */}
              <TabsContent value="operations" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Optimisations détectées
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {predictionData.filter(p => p.category === 'Coûts').map((prediction) => (
                          <div key={prediction.id} className="p-4 rounded-lg border">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-medium mb-1">{prediction.title}</h4>
                                <p className="text-sm text-muted-foreground">{prediction.description}</p>
                              </div>
                              <div className="text-right">
                                <Badge className={getConfidenceColor(prediction.confidence)}>
                                  {prediction.confidence}% confiance
                                </Badge>
                                {prediction.value && (
                                  <div className="mt-1 text-lg font-bold text-green-600">
                                    {prediction.value}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h5 className="text-sm font-medium mb-2">Facteurs identifiés:</h5>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {prediction.factors.map((factor, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                                      {factor}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium mb-2">Actions suggérées:</h5>
                                <ul className="text-sm space-y-1">
                                  {prediction.recommendations.map((rec, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                      <Zap className="h-3 w-3 text-blue-600" />
                                      {rec}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Nouvelles opportunités
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {predictionData
                          .filter(p => p.id.includes('market') || p.id.includes('marché') || p.category === 'Marché')
                          .map((prediction, index) => (
                            <PredictionCard
                              key={prediction.id}
                              id={prediction.id}
                              title={prediction.title}
                              current={prediction.current}
                              predicted={prediction.predicted}
                              confidence={prediction.confidence}
                              trend={prediction.trend}
                              change={prediction.change}
                              icon={prediction.icon || Globe}
                              color={prediction.color || 'purple'}
                              currencyFormat={prediction.id.includes('revenue') || prediction.id.includes('ca')}
                              percentFormat={prediction.id.includes('percent') || prediction.id.includes('taux') || prediction.id.includes('share')}
                              delay={index}
                            />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Onglet Risques */}
              <TabsContent value="risks" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Matrice des risques
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {riskFactors.map((risk, index) => (
                        <motion.div
                          key={risk.factor}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={cn(
                            "p-4 rounded-lg border-l-4",
                            getSeverityColor(risk.severity)
                          )}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{risk.factor}</h4>
                              <p className="text-sm text-muted-foreground">{risk.mitigation}</p>
                            </div>
                            <Badge className={getSeverityColor(risk.severity)}>
                              {risk.severity === 'critical' ? 'Critique' :
                               risk.severity === 'high' ? 'Élevé' :
                               risk.severity === 'medium' ? 'Moyen' : 'Faible'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span>Probabilité</span>
                                <span className="font-medium">{risk.probability}%</span>
                              </div>
                              <Progress value={risk.probability} className="h-2" />
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span>Impact</span>
                                <span className="font-medium">{risk.impact}%</span>
                              </div>
                              <Progress value={risk.impact} className="h-2" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPredictions;
