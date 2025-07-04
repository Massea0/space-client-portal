// src/pages/AnalyticsOpportunities.tsx - Page d'analyse des opportunités business
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Lightbulb,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  DollarSign,
  Users,
  Globe,
  Building,
  Zap,
  Brain,
  Star,
  Sparkles,
  Rocket,
  Crown,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  RefreshCw,
  Download,
  Filter,
  Search,
  Settings,
  Map,
  Compass,
  Flag,
  Award,
  Gift,
  Briefcase,
  CreditCard,
  ShoppingCart,
  Smartphone,
  Monitor,
  Wifi,
  Database,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Fonction utilitaire pour les couleurs d'effort
const getEffortColor = (effort: 'low' | 'medium' | 'high') => {
  switch (effort) {
    case 'low':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

// Fonction utilitaire pour le formatage des devises
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Types pour l'analyse des opportunités
interface BusinessOpportunity {
  id: string;
  title: string;
  description: string;
  category: 'market' | 'product' | 'process' | 'technology' | 'partnership';
  priority: 'high' | 'medium' | 'low';
  maturity: 'discovery' | 'validation' | 'development' | 'launch';
  potential: {
    revenue: number;
    timeframe: string;
    probability: number;
    risk: 'low' | 'medium' | 'high';
  };
  investment: {
    initial: number;
    ongoing: number;
    payback: number;
  };
  kpis: {
    metric: string;
    current: number;
    target: number;
    unit: string;
  }[];
  requirements: string[];
  timeline: {
    phase: string;
    duration: string;
    deliverables: string[];
  }[];
  competitors: string[];
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

interface MarketAnalysis {
  segment: string;
  size: number;
  growth: number;
  competition: 'low' | 'medium' | 'high';
  barriers: 'low' | 'medium' | 'high';
  profitability: number;
  trends: string[];
  keyPlayers: string[];
  opportunity: number;
}

interface TechnologicalTrend {
  technology: string;
  adoptionRate: number;
  impact: 'transformational' | 'significant' | 'moderate';
  timeline: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  investment: number;
  roi: number;
  applications: string[];
  readiness: number;
}

interface PartnershipOpportunity {
  partner: string;
  type: 'strategic' | 'technology' | 'distribution' | 'financial';
  synergy: number;
  effort: 'low' | 'medium' | 'high';
  value: number;
  risks: string[];
  benefits: string[];
  status: 'identified' | 'contacted' | 'negotiating' | 'agreed';
}

const AnalyticsOpportunities: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Opportunités business principales
  const businessOpportunities: BusinessOpportunity[] = [
    {
      id: 'ai_powered_analytics',
      title: 'Plateforme d\'analytique IA avancée',
      description: 'Développement d\'une solution d\'analyse prédictive avec IA pour les clients enterprise',
      category: 'product',
      priority: 'high',
      maturity: 'validation',
      potential: {
        revenue: 2500000,
        timeframe: '18 mois',
        probability: 75,
        risk: 'medium'
      },
      investment: {
        initial: 450000,
        ongoing: 120000,
        payback: 14
      },
      kpis: [
        { metric: 'ARR', current: 0, target: 2500000, unit: '€' },
        { metric: 'Clients', current: 0, target: 50, unit: 'entreprises' },
        { metric: 'Marge', current: 0, target: 65, unit: '%' }
      ],
      requirements: [
        'Équipe de 8 développeurs IA/ML',
        'Infrastructure cloud scalable',
        'Certification sécurité SOC2',
        'Partenariats data'
      ],
      timeline: [
        {
          phase: 'MVP',
          duration: '6 mois',
          deliverables: ['Prototype fonctionnel', 'Tests pilotes', 'Feedback clients']
        },
        {
          phase: 'Développement',
          duration: '8 mois',
          deliverables: ['Version commerciale', 'Intégrations', 'Documentation']
        },
        {
          phase: 'Lancement',
          duration: '4 mois',
          deliverables: ['Go-to-market', 'Support client', 'Monitoring']
        }
      ],
      competitors: ['Tableau', 'Power BI', 'Qlik'],
      swot: {
        strengths: ['Expertise technique', 'Relation clients', 'Agilité'],
        weaknesses: ['Ressources limitées', 'Marque moins connue'],
        opportunities: ['Marché en croissance', 'Digitalisation'],
        threats: ['Concurrence établie', 'Évolution technologique']
      }
    },
    {
      id: 'international_expansion',
      title: 'Expansion internationale - Allemagne',
      description: 'Ouverture du marché allemand avec bureau local et équipe commerciale',
      category: 'market',
      priority: 'high',
      maturity: 'discovery',
      potential: {
        revenue: 1800000,
        timeframe: '24 mois',
        probability: 68,
        risk: 'high'
      },
      investment: {
        initial: 350000,
        ongoing: 180000,
        payback: 18
      },
      kpis: [
        { metric: 'Revenus Allemagne', current: 0, target: 1800000, unit: '€' },
        { metric: 'Clients locaux', current: 0, target: 30, unit: 'entreprises' },
        { metric: 'Part de marché', current: 0, target: 5, unit: '%' }
      ],
      requirements: [
        'Bureau à Berlin ou Munich',
        'Équipe commerciale locale',
        'Adaptation produit (langue, conformité)',
        'Partenaires distributeurs'
      ],
      timeline: [
        {
          phase: 'Étude de marché',
          duration: '3 mois',
          deliverables: ['Analyse concurrentielle', 'Étude réglementaire', 'Plan d\'entrée']
        },
        {
          phase: 'Implantation',
          duration: '6 mois',
          deliverables: ['Bureau opérationnel', 'Équipe recrutée', 'Produit localisé']
        },
        {
          phase: 'Commercialisation',
          duration: '15 mois',
          deliverables: ['Premiers clients', 'Réseau partenaires', 'Profitabilité']
        }
      ],
      competitors: ['SAP', 'Software AG', 'Datev'],
      swot: {
        strengths: ['Produit innovant', 'Expertise française'],
        weaknesses: ['Pas de présence locale', 'Méconnaissance marché'],
        opportunities: ['Marché mature', 'Digitalisation industrie 4.0'],
        threats: ['Concurrence locale forte', 'Barrières réglementaires']
      }
    },
    {
      id: 'automation_suite',
      title: 'Suite d\'automatisation RPA',
      description: 'Développement d\'outils d\'automatisation des processus pour PME',
      category: 'product',
      priority: 'medium',
      maturity: 'development',
      potential: {
        revenue: 1200000,
        timeframe: '15 mois',
        probability: 82,
        risk: 'low'
      },
      investment: {
        initial: 280000,
        ongoing: 80000,
        payback: 12
      },
      kpis: [
        { metric: 'Licences vendues', current: 0, target: 200, unit: 'licences' },
        { metric: 'MRR', current: 0, target: 100000, unit: '€' },
        { metric: 'Taux adoption', current: 0, target: 75, unit: '%' }
      ],
      requirements: [
        'Équipe de 5 développeurs',
        'Interface no-code/low-code',
        'Intégrations API',
        'Formation utilisateurs'
      ],
      timeline: [
        {
          phase: 'Finalisation',
          duration: '4 mois',
          deliverables: ['Version beta', 'Tests utilisateurs', 'Corrections']
        },
        {
          phase: 'Lancement',
          duration: '3 mois',
          deliverables: ['Version commerciale', 'Campagne marketing', 'Support']
        },
        {
          phase: 'Expansion',
          duration: '8 mois',
          deliverables: ['Nouvelles fonctionnalités', 'Intégrations', 'Croissance']
        }
      ],
      competitors: ['UiPath', 'Automation Anywhere', 'Microsoft Power Automate'],
      swot: {
        strengths: ['Focus PME', 'Prix compétitif', 'Support français'],
        weaknesses: ['Fonctionnalités limitées vs leaders'],
        opportunities: ['PME en digitalisation', 'Coûts main d\'œuvre'],
        threats: ['Giants tech', 'Solutions gratuites']
      }
    }
  ];

  // Analyses de marché
  const marketAnalyses: MarketAnalysis[] = [
    {
      segment: 'IA & Machine Learning',
      size: 850000000,
      growth: 23.5,
      competition: 'high',
      barriers: 'medium',
      profitability: 68,
      trends: ['AutoML', 'MLOps', 'Edge AI', 'Ethical AI'],
      keyPlayers: ['Google', 'Microsoft', 'Amazon', 'IBM'],
      opportunity: 87
    },
    {
      segment: 'RPA & Automatisation',
      size: 420000000,
      growth: 18.2,
      competition: 'medium',
      barriers: 'low',
      profitability: 72,
      trends: ['Intelligent automation', 'Citizen development', 'Cloud RPA'],
      keyPlayers: ['UiPath', 'Automation Anywhere', 'Blue Prism'],
      opportunity: 78
    },
    {
      segment: 'Analytics Cloud',
      size: 280000000,
      growth: 15.8,
      competition: 'high',
      barriers: 'high',
      profitability: 58,
      trends: ['Self-service BI', 'Embedded analytics', 'Real-time'],
      keyPlayers: ['Tableau', 'Power BI', 'Qlik', 'Looker'],
      opportunity: 65
    },
    {
      segment: 'Cybersécurité PME',
      size: 180000000,
      growth: 28.1,
      competition: 'medium',
      barriers: 'medium',
      profitability: 75,
      trends: ['Zero Trust', 'XDR', 'SASE', 'Security Mesh'],
      keyPlayers: ['CrowdStrike', 'SentinelOne', 'Fortinet'],
      opportunity: 82
    }
  ];

  // Tendances technologiques
  const technologicalTrends: TechnologicalTrend[] = [
    {
      technology: 'Intelligence Artificielle Générative',
      adoptionRate: 34,
      impact: 'transformational',
      timeline: 'immediate',
      investment: 120000,
      roi: 340,
      applications: ['Génération de code', 'Support client', 'Analyse de documents'],
      readiness: 78
    },
    {
      technology: 'Edge Computing',
      adoptionRate: 28,
      impact: 'significant',
      timeline: 'short-term',
      investment: 85000,
      roi: 220,
      applications: ['IoT industriel', 'Analyse temps réel', 'Latence réduite'],
      readiness: 65
    },
    {
      technology: 'Quantum Computing',
      adoptionRate: 8,
      impact: 'transformational',
      timeline: 'long-term',
      investment: 250000,
      roi: 150,
      applications: ['Optimisation', 'Cryptographie', 'Simulation'],
      readiness: 25
    },
    {
      technology: 'Blockchain Enterprise',
      adoptionRate: 22,
      impact: 'moderate',
      timeline: 'medium-term',
      investment: 95000,
      roi: 180,
      applications: ['Supply chain', 'Traçabilité', 'Smart contracts'],
      readiness: 55
    }
  ];

  // Opportunités de partenariats
  const partnershipOpportunities: PartnershipOpportunity[] = [
    {
      partner: 'Microsoft',
      type: 'technology',
      synergy: 85,
      effort: 'medium',
      value: 1500000,
      risks: ['Dépendance technologique', 'Concurrence indirecte'],
      benefits: ['Crédibilité', 'Écosystème Azure', 'Support commercial'],
      status: 'negotiating'
    },
    {
      partner: 'Accenture',
      type: 'distribution',
      synergy: 78,
      effort: 'high',
      value: 2200000,
      risks: ['Complexité relation', 'Marges réduites'],
      benefits: ['Accès grandes entreprises', 'Expertise métier', 'International'],
      status: 'identified'
    },
    {
      partner: 'BPI France',
      type: 'financial',
      synergy: 65,
      effort: 'low',
      value: 800000,
      risks: ['Contraintes administratives', 'Dilution capital'],
      benefits: ['Financement innovation', 'Crédibilité', 'Réseau'],
      status: 'contacted'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'transformational': return 'text-purple-600 bg-purple-50';
      case 'significant': return 'text-blue-600 bg-blue-50';
      case 'moderate': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Fonction utilitaire pour le formatage des devises
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredOpportunities = businessOpportunities.filter(opp => {
    const matchesCategory = filterCategory === 'all' || opp.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || opp.priority === filterPriority;
    const matchesSearch = searchTerm === '' || 
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesPriority && matchesSearch;
  });

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
                  Analyse des opportunités
                </h1>
                <p className="text-muted-foreground mt-1">
                  Identification et évaluation des opportunités de croissance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Rapport
              </Button>
              <Button size="sm" onClick={() => setLoading(true)}>
                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                Actualiser
              </Button>
            </div>
          </motion.div>

          {/* Métriques d'opportunités */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            {[
              {
                label: 'Opportunités identifiées',
                value: businessOpportunities.length,
                change: '+3',
                trend: 'up',
                icon: Lightbulb,
                color: 'text-yellow-600'
              },
              {
                label: 'Potentiel de revenus',
                value: formatCurrency(businessOpportunities.reduce((acc, opp) => acc + opp.potential.revenue, 0)),
                change: '+18%',
                trend: 'up',
                icon: DollarSign,
                color: 'text-green-600'
              },
              {
                label: 'ROI moyen',
                value: Math.round(businessOpportunities.reduce((acc, opp) => acc + (opp.potential.revenue / opp.investment.initial * 100), 0) / businessOpportunities.length) + '%',
                change: '+12%',
                trend: 'up',
                icon: Target,
                color: 'text-blue-600'
              },
              {
                label: 'Opportunités prioritaires',
                value: businessOpportunities.filter(opp => opp.priority === 'high').length,
                change: '+1',
                trend: 'up',
                icon: Star,
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
              <TabsList className="grid w-full grid-cols-5 bg-muted/50">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Vue d'ensemble
                </TabsTrigger>
                <TabsTrigger value="business" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Business
                </TabsTrigger>
                <TabsTrigger value="market" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Marchés
                </TabsTrigger>
                <TabsTrigger value="technology" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Technologies
                </TabsTrigger>
                <TabsTrigger value="partnerships" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Partenariats
                </TabsTrigger>
              </TabsList>

              {/* Vue d'ensemble */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5" />
                        Répartition par catégorie
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { category: 'Produit', count: businessOpportunities.filter(o => o.category === 'product').length, revenue: businessOpportunities.filter(o => o.category === 'product').reduce((acc, o) => acc + o.potential.revenue, 0), color: 'bg-blue-500' },
                          { category: 'Marché', count: businessOpportunities.filter(o => o.category === 'market').length, revenue: businessOpportunities.filter(o => o.category === 'market').reduce((acc, o) => acc + o.potential.revenue, 0), color: 'bg-green-500' },
                          { category: 'Technologie', count: businessOpportunities.filter(o => o.category === 'technology').length, revenue: businessOpportunities.filter(o => o.category === 'technology').reduce((acc, o) => acc + o.potential.revenue, 0), color: 'bg-purple-500' },
                          { category: 'Processus', count: businessOpportunities.filter(o => o.category === 'process').length, revenue: businessOpportunities.filter(o => o.category === 'process').reduce((acc, o) => acc + o.potential.revenue, 0), color: 'bg-orange-500' },
                          { category: 'Partenariat', count: businessOpportunities.filter(o => o.category === 'partnership').length, revenue: businessOpportunities.filter(o => o.category === 'partnership').reduce((acc, o) => acc + o.potential.revenue, 0), color: 'bg-pink-500' }
                        ].filter(cat => cat.count > 0).map((category) => (
                          <div key={category.category} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className={cn("w-3 h-3 rounded-full", category.color)} />
                                <span>{category.category}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{formatCurrency(category.revenue)}</span>
                                <Badge variant="outline">{category.count}</Badge>
                              </div>
                            </div>
                            <Progress value={(category.revenue / businessOpportunities.reduce((acc, o) => acc + o.potential.revenue, 0)) * 100} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Matrice Potentiel vs Probabilité
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative h-64 border rounded-lg p-4">
                        <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">
                          Faible probabilité
                        </div>
                        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                          Forte probabilité
                        </div>
                        <div className="absolute top-2 left-2 text-xs text-muted-foreground rotate-90 origin-center">
                          Fort potentiel
                        </div>
                        <div className="absolute bottom-2 left-2 text-xs text-muted-foreground rotate-90 origin-center">
                          Faible potentiel
                        </div>
                        
                        {businessOpportunities.map((opp) => (
                          <div
                            key={opp.id}
                            className={cn(
                              "absolute w-3 h-3 rounded-full cursor-pointer",
                              opp.priority === 'high' ? 'bg-red-500' :
                              opp.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            )}
                            style={{
                              left: `${opp.potential.probability}%`,
                              bottom: `${(opp.potential.revenue / 3000000) * 100}%`
                            }}
                            title={opp.title}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-center gap-4 text-xs mt-4">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          <span>Haute priorité</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                          <span>Moyenne priorité</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span>Faible priorité</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top opportunités */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Rocket className="h-5 w-5" />
                      Top opportunités prioritaires
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {businessOpportunities
                        .filter(opp => opp.priority === 'high')
                        .sort((a, b) => (b.potential.revenue * b.potential.probability / 100) - (a.potential.revenue * a.potential.probability / 100))
                        .map((opportunity, index) => (
                          <div key={opportunity.id} className="flex items-center gap-4 p-4 rounded-lg border">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{opportunity.title}</h4>
                              <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">
                                {formatCurrency(opportunity.potential.revenue)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {opportunity.potential.probability}% probabilité
                              </div>
                            </div>
                            <Badge className={getPriorityColor(opportunity.priority)}>
                              {opportunity.priority === 'high' ? 'Haute' :
                               opportunity.priority === 'medium' ? 'Moyenne' : 'Faible'}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Opportunités business */}
              <TabsContent value="business" className="space-y-6">
                {/* Filtres */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Rechercher une opportunité..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les catégories</SelectItem>
                          <SelectItem value="market">Marché</SelectItem>
                          <SelectItem value="product">Produit</SelectItem>
                          <SelectItem value="process">Processus</SelectItem>
                          <SelectItem value="technology">Technologie</SelectItem>
                          <SelectItem value="partnership">Partenariat</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterPriority} onValueChange={setFilterPriority}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes priorités</SelectItem>
                          <SelectItem value="high">Haute</SelectItem>
                          <SelectItem value="medium">Moyenne</SelectItem>
                          <SelectItem value="low">Faible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Liste des opportunités */}
                <div className="space-y-6">
                  {filteredOpportunities.map((opportunity) => (
                    <motion.div
                      key={opportunity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="flex items-center gap-2">
                                {opportunity.category === 'market' && <Globe className="h-5 w-5" />}
                                {opportunity.category === 'product' && <Gift className="h-5 w-5" />}
                                {opportunity.category === 'technology' && <Zap className="h-5 w-5" />}
                                {opportunity.category === 'process' && <Settings className="h-5 w-5" />}
                                {opportunity.category === 'partnership' && <Users className="h-5 w-5" />}
                                {opportunity.title}
                              </CardTitle>
                              <p className="text-muted-foreground mt-1">{opportunity.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getPriorityColor(opportunity.priority)}>
                                {opportunity.priority === 'high' ? 'Haute priorité' :
                                 opportunity.priority === 'medium' ? 'Moyenne priorité' : 'Faible priorité'}
                              </Badge>
                              <Badge variant="outline">
                                {opportunity.maturity === 'discovery' ? 'Découverte' :
                                 opportunity.maturity === 'validation' ? 'Validation' :
                                 opportunity.maturity === 'development' ? 'Développement' : 'Lancement'}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-6 lg:grid-cols-2">
                            {/* Potentiel financier */}
                            <div className="space-y-4">
                              <h4 className="font-medium">Potentiel financier</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Revenus potentiels: </span>
                                  <span className="font-medium text-green-600">
                                    {formatCurrency(opportunity.potential.revenue)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Délai: </span>
                                  <span className="font-medium">{opportunity.potential.timeframe}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Probabilité: </span>
                                  <span className="font-medium">{opportunity.potential.probability}%</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Risque: </span>
                                  <Badge className={getRiskColor(opportunity.potential.risk)}>
                                    {opportunity.potential.risk === 'high' ? 'Élevé' :
                                     opportunity.potential.risk === 'medium' ? 'Moyen' : 'Faible'}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div>
                                <h5 className="font-medium mb-2">Investissement requis</h5>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                  <div className="text-center p-2 rounded bg-muted">
                                    <div className="font-medium">{formatCurrency(opportunity.investment.initial)}</div>
                                    <div className="text-xs text-muted-foreground">Initial</div>
                                  </div>
                                  <div className="text-center p-2 rounded bg-muted">
                                    <div className="font-medium">{formatCurrency(opportunity.investment.ongoing)}</div>
                                    <div className="text-xs text-muted-foreground">Récurrent/an</div>
                                  </div>
                                  <div className="text-center p-2 rounded bg-green-50">
                                    <div className="font-medium text-green-600">{opportunity.investment.payback} mois</div>
                                    <div className="text-xs text-muted-foreground">Payback</div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* KPIs cibles */}
                            <div className="space-y-4">
                              <h4 className="font-medium">Objectifs mesurables</h4>
                              <div className="space-y-3">
                                {opportunity.kpis.map((kpi, index) => (
                                  <div key={index}>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                      <span>{kpi.metric}</span>
                                      <span className="font-medium">
                                        {kpi.target.toLocaleString()} {kpi.unit}
                                      </span>
                                    </div>
                                    <Progress value={(kpi.current / kpi.target) * 100} className="h-2" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <Separator className="my-6" />

                          {/* Timeline */}
                          <div className="space-y-4">
                            <h4 className="font-medium">Roadmap de mise en œuvre</h4>
                            <div className="grid gap-3 md:grid-cols-3">
                              {opportunity.timeline.map((phase, index) => (
                                <div key={index} className="p-3 rounded-lg border">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">
                                      {index + 1}
                                    </div>
                                    <span className="font-medium">{phase.phase}</span>
                                    <Badge variant="outline" className="text-xs">{phase.duration}</Badge>
                                  </div>
                                  <ul className="text-xs space-y-1">
                                    {phase.deliverables.map((deliverable, i) => (
                                      <li key={i} className="flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                        {deliverable}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Separator className="my-6" />

                          <div className="flex items-center gap-2">
                            <Button size="sm">
                              <Rocket className="h-4 w-4 mr-2" />
                              Lancer l'initiative
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-2" />
                              Analyse SWOT
                            </Button>
                            <Button size="sm" variant="outline">
                              <Calendar className="h-4 w-4 mr-2" />
                              Planifier
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Analyses de marché */}
              <TabsContent value="market" className="space-y-6">
                <div className="grid gap-6">
                  {marketAnalyses.map((market) => (
                    <Card key={market.segment}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="h-5 w-5" />
                          {market.segment}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6 lg:grid-cols-2">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-3">Données du marché</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Taille: </span>
                                  <span className="font-medium">{formatCurrency(market.size)}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Croissance: </span>
                                  <span className="font-medium text-green-600">+{market.growth}%/an</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Concurrence: </span>
                                  <span className={cn("font-medium", getCompetitionColor(market.competition))}>
                                    {market.competition === 'high' ? 'Élevée' :
                                     market.competition === 'medium' ? 'Modérée' : 'Faible'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Profitabilité: </span>
                                  <span className="font-medium">{market.profitability}%</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Score d'opportunité</h4>
                              <div className="flex items-center gap-3">
                                <Progress value={market.opportunity} className="flex-1 h-3" />
                                <span className="font-bold text-lg">{market.opportunity}/100</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Tendances clés</h4>
                              <div className="flex flex-wrap gap-2">
                                {market.trends.map((trend) => (
                                  <Badge key={trend} variant="outline" className="text-xs">
                                    {trend}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium">Acteurs clés</h4>
                              <div className="flex flex-wrap gap-2">
                                {market.keyPlayers.map((player) => (
                                  <Badge key={player} variant="secondary" className="text-xs">
                                    {player}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Tendances technologiques */}
                <TabsContent value="technology" className="space-y-6">
                <div className="grid gap-6">
                  {technologicalTrends.map((tech) => (
                    <Card key={tech.technology}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5" />
                            {tech.technology}
                          </CardTitle>
                          <Badge className={getImpactColor(tech.impact)}>
                            {tech.impact === 'transformational' ? 'Transformationnel' :
                             tech.impact === 'significant' ? 'Significatif' : 'Modéré'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6 lg:grid-cols-2">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-3">Maturité et adoption</h4>
                              <div className="space-y-3">
                                <div>
                                  <div className="flex items-center justify-between text-sm mb-1">
                                    <span>Taux d'adoption</span>
                                    <span className="font-medium">{tech.adoptionRate}%</span>
                                  </div>
                                  <Progress value={tech.adoptionRate} className="h-2" />
                                </div>
                                <div>
                                  <div className="flex items-center justify-between text-sm mb-1">
                                    <span>Maturité interne</span>
                                    <span className="font-medium">{tech.readiness}%</span>
                                  </div>
                                  <Progress value={tech.readiness} className="h-2" />
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Investissement</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Coût: </span>
                                  <span className="font-medium">{formatCurrency(tech.investment)}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">ROI: </span>
                                  <span className="font-medium text-green-600">{tech.roi}%</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Applications possibles</h4>
                              <ul className="text-sm space-y-1">
                                {tech.applications.map((app, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <Sparkles className="h-3 w-3 text-blue-600" />
                                    {app}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Timeline</h4>
                              <Badge variant="outline">
                                {tech.timeline === 'immediate' ? 'Immédiat' :
                                 tech.timeline === 'short-term' ? 'Court terme' :
                                 tech.timeline === 'medium-term' ? 'Moyen terme' : 'Long terme'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Opportunités de partenariats */}
              <TabsContent value="partnerships" className="space-y-6">
                <div className="grid gap-6">
                  {partnershipOpportunities.map((partnership) => (
                    <Card key={partnership.partner}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            {partnership.partner}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {partnership.type === 'strategic' ? 'Stratégique' :
                               partnership.type === 'technology' ? 'Technologie' :
                               partnership.type === 'distribution' ? 'Distribution' : 'Financier'}
                            </Badge>
                            <Badge className={
                              partnership.status === 'agreed' ? 'bg-green-100 text-green-700' :
                              partnership.status === 'negotiating' ? 'bg-blue-100 text-blue-700' :
                              partnership.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }>
                              {partnership.status === 'agreed' ? 'Accord signé' :
                               partnership.status === 'negotiating' ? 'En négociation' :
                               partnership.status === 'contacted' ? 'Contact établi' : 'Identifié'}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6 lg:grid-cols-2">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-3">Évaluation</h4>
                              <div className="space-y-3">
                                <div>
                                  <div className="flex items-center justify-between text-sm mb-1">
                                    <span>Synergie</span>
                                    <span className="font-medium">{partnership.synergy}%</span>
                                  </div>
                                  <Progress value={partnership.synergy} className="h-2" />
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Effort: </span>
                                    <Badge className={getEffortColor(partnership.effort)}>
                                      {partnership.effort === 'high' ? 'Élevé' :
                                       partnership.effort === 'medium' ? 'Moyen' : 'Faible'}
                                    </Badge>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Valeur: </span>
                                    <span className="font-medium text-green-600">
                                      {formatCurrency(partnership.value)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Bénéfices</h4>
                              <ul className="text-sm space-y-1">
                                {partnership.benefits.map((benefit, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Risques</h4>
                              <ul className="text-sm space-y-1">
                                {partnership.risks.map((risk, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <AlertTriangle className="h-3 w-3 text-red-600" />
                                    {risk}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="flex items-center gap-2">
                          <Button size="sm">
                            <Users className="h-4 w-4 mr-2" />
                            Initier contact
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Analyser en détail
                          </Button>
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            Dossier partenariat
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOpportunities;
