// src/pages/AnalyticsEfficiency.tsx - Page d'analyse d'efficacité opérationnelle
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Target,
  Settings,
  Users,
  DollarSign,
  FileText,
  Calendar,
  Gauge,
  CheckCircle,
  AlertTriangle,
  Timer,
  Cpu,
  Database,
  Server,
  Wifi,
  Battery,
  Layers,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  RefreshCw,
  Download,
  Filter,
  Search,
  Eye,
  Edit,
  MoreHorizontal,
  PlayCircle,
  PauseCircle,
  StopCircle,
  RotateCcw,
  FastForward
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

// Types pour l'analyse d'efficacité
interface EfficiencyMetric {
  id: string;
  category: string;
  name: string;
  current: number;
  target: number;
  benchmark: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  period: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  icon: React.ComponentType<any>;
  description: string;
}

interface ProcessAnalysis {
  process: string;
  department: string;
  efficiency: number;
  bottlenecks: string[];
  improvements: string[];
  timeSpent: number;
  timeTarget: number;
  costCurrent: number;
  costOptimized: number;
  automation: number;
  participants: number;
}

interface ResourceUtilization {
  resource: string;
  type: 'human' | 'system' | 'infrastructure';
  utilization: number;
  capacity: number;
  efficiency: number;
  costs: {
    current: number;
    optimal: number;
    waste: number;
  };
  recommendations: string[];
}

interface AutomationOpportunity {
  process: string;
  department: string;
  potential: number;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  timeToImplement: number;
  costSaving: number;
  riskLevel: 'low' | 'medium' | 'high';
  technologies: string[];
  roi: number;
}

const AnalyticsEfficiency: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [loading, setLoading] = useState(false);

  // Métriques d'efficacité
  const efficiencyMetrics: EfficiencyMetric[] = [
    {
      id: 'productivity',
      category: 'Performance',
      name: 'Productivité générale',
      current: 87,
      target: 90,
      benchmark: 85,
      unit: '%',
      trend: 'up',
      change: 5.2,
      period: 'vs mois dernier',
      status: 'good',
      icon: Zap,
      description: 'Productivité moyenne des équipes'
    },
    {
      id: 'response_time',
      category: 'Performance',
      name: 'Temps de réponse moyen',
      current: 2.8,
      target: 2.0,
      benchmark: 3.5,
      unit: 'heures',
      trend: 'down',
      change: -15.2,
      period: 'vs mois dernier',
      status: 'warning',
      icon: Clock,
      description: 'Délai moyen de traitement des demandes'
    },
    {
      id: 'automation_rate',
      category: 'Automatisation',
      name: 'Taux d\'automatisation',
      current: 65,
      target: 80,
      benchmark: 55,
      unit: '%',
      trend: 'up',
      change: 8.7,
      period: 'vs mois dernier',
      status: 'good',
      icon: Cpu,
      description: 'Pourcentage de processus automatisés'
    },
    {
      id: 'cost_efficiency',
      category: 'Coûts',
      name: 'Efficacité des coûts',
      current: 92,
      target: 95,
      benchmark: 88,
      unit: '%',
      trend: 'up',
      change: 3.1,
      period: 'vs mois dernier',
      status: 'excellent',
      icon: DollarSign,
      description: 'Ratio coût/valeur générée'
    },
    {
      id: 'system_uptime',
      category: 'Infrastructure',
      name: 'Disponibilité système',
      current: 99.7,
      target: 99.9,
      benchmark: 99.5,
      unit: '%',
      trend: 'stable',
      change: 0.1,
      period: 'vs mois dernier',
      status: 'excellent',
      icon: Server,
      description: 'Temps de fonctionnement des systèmes'
    },
    {
      id: 'employee_efficiency',
      category: 'Humain',
      name: 'Efficacité employés',
      current: 84,
      target: 88,
      benchmark: 82,
      unit: '%',
      trend: 'up',
      change: 2.8,
      period: 'vs mois dernier',
      status: 'good',
      icon: Users,
      description: 'Performance moyenne des collaborateurs'
    }
  ];

  // Analyses de processus
  const processAnalyses: ProcessAnalysis[] = [
    {
      process: 'Traitement des factures',
      department: 'Finance',
      efficiency: 78,
      bottlenecks: ['Validation manuelle', 'Saisie données'],
      improvements: ['Automatisation OCR', 'Workflow validation'],
      timeSpent: 120,
      timeTarget: 60,
      costCurrent: 4500,
      costOptimized: 2800,
      automation: 45,
      participants: 8
    },
    {
      process: 'Onboarding clients',
      department: 'Commercial',
      efficiency: 85,
      bottlenecks: ['Collecte documents', 'Formation utilisateur'],
      improvements: ['Portail client self-service', 'Tutoriels interactifs'],
      timeSpent: 240,
      timeTarget: 180,
      costCurrent: 2800,
      costOptimized: 2100,
      automation: 60,
      participants: 5
    },
    {
      process: 'Support technique',
      department: 'IT',
      efficiency: 92,
      bottlenecks: ['Escalade niveau 2'],
      improvements: ['Base de connaissances IA', 'Diagnostics automatiques'],
      timeSpent: 45,
      timeTarget: 30,
      costCurrent: 3200,
      costOptimized: 2500,
      automation: 75,
      participants: 12
    },
    {
      process: 'Recrutement',
      department: 'RH',
      efficiency: 68,
      bottlenecks: ['Tri CV manuel', 'Planification entretiens'],
      improvements: ['IA screening CV', 'Calendrier automatique'],
      timeSpent: 480,
      timeTarget: 300,
      costCurrent: 5600,
      costOptimized: 3500,
      automation: 35,
      participants: 6
    }
  ];

  // Utilisation des ressources
  const resourceUtilization: ResourceUtilization[] = [
    {
      resource: 'Équipe développement',
      type: 'human',
      utilization: 85,
      capacity: 100,
      efficiency: 88,
      costs: {
        current: 45000,
        optimal: 42000,
        waste: 3000
      },
      recommendations: [
        'Réduire les réunions non essentielles',
        'Améliorer la planification des sprints',
        'Automatiser les tests'
      ]
    },
    {
      resource: 'Serveurs production',
      type: 'infrastructure',
      utilization: 72,
      capacity: 100,
      efficiency: 91,
      costs: {
        current: 8500,
        optimal: 7200,
        waste: 1300
      },
      recommendations: [
        'Optimiser la répartition des charges',
        'Implémenter l\'auto-scaling',
        'Migrer vers des instances plus efficaces'
      ]
    },
    {
      resource: 'Licences logicielles',
      type: 'system',
      utilization: 64,
      capacity: 100,
      efficiency: 76,
      costs: {
        current: 12000,
        optimal: 9500,
        waste: 2500
      },
      recommendations: [
        'Audit d\'utilisation des licences',
        'Négocier des tarifs dégressifs',
        'Adopter des solutions open source'
      ]
    }
  ];

  // Opportunités d'automatisation
  const automationOpportunities: AutomationOpportunity[] = [
    {
      process: 'Rapports financiers',
      department: 'Finance',
      potential: 85,
      effort: 'medium',
      impact: 'high',
      timeToImplement: 8,
      costSaving: 15000,
      riskLevel: 'low',
      technologies: ['Power BI', 'Python', 'API'],
      roi: 280
    },
    {
      process: 'Tests qualité',
      department: 'IT',
      potential: 95,
      effort: 'low',
      impact: 'high',
      timeToImplement: 4,
      costSaving: 22000,
      riskLevel: 'low',
      technologies: ['Selenium', 'Jenkins', 'Docker'],
      roi: 420
    },
    {
      process: 'Suivi commandes',
      department: 'Logistique',
      potential: 78,
      effort: 'high',
      impact: 'medium',
      timeToImplement: 16,
      costSaving: 8500,
      riskLevel: 'medium',
      technologies: ['ERP', 'APIs', 'IoT'],
      roi: 180
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950 dark:border-yellow-800';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950';
      case 'high': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950';
      case 'low': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
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
                  Analyse d'efficacité
                </h1>
                <p className="text-muted-foreground mt-1">
                  Optimisation des processus et performance opérationnelle
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="quarter">Ce trimestre</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Button size="sm" onClick={() => setLoading(true)}>
                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                Actualiser
              </Button>
            </div>
          </motion.div>

          {/* Métriques principales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            {efficiencyMetrics.slice(0, 6).map((metric, index) => (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <metric.icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {metric.name}
                          </p>
                          <p className="text-2xl font-bold">
                            {metric.current}{metric.unit}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status === 'excellent' ? 'Excellent' :
                         metric.status === 'good' ? 'Bon' :
                         metric.status === 'warning' ? 'Attention' : 'Critique'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Objectif: {metric.target}{metric.unit}</span>
                        <span className={cn(
                          "flex items-center gap-1 font-medium",
                          metric.trend === 'up' ? 'text-green-600' : 
                          metric.trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
                        )}>
                          {metric.trend === 'up' ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : metric.trend === 'down' ? (
                            <TrendingDown className="h-3 w-3" />
                          ) : (
                            <Minus className="h-3 w-3" />
                          )}
                          {Math.abs(metric.change)}%
                        </span>
                      </div>
                      <Progress 
                        value={(metric.current / metric.target) * 100} 
                        className="h-2" 
                      />
                      <div className="text-xs text-muted-foreground">
                        Benchmark industrie: {metric.benchmark}{metric.unit}
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
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Vue d'ensemble
                </TabsTrigger>
                <TabsTrigger value="processes" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Processus
                </TabsTrigger>
                <TabsTrigger value="resources" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Ressources
                </TabsTrigger>
                <TabsTrigger value="automation" className="flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  Automatisation
                </TabsTrigger>
              </TabsList>

              {/* Vue d'ensemble */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Gauge className="h-5 w-5" />
                        Performance par département
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { dept: 'IT', efficiency: 89, trend: 'up', change: 4.2 },
                          { dept: 'Commercial', efficiency: 85, trend: 'up', change: 2.8 },
                          { dept: 'Finance', efficiency: 78, trend: 'stable', change: 0.5 },
                          { dept: 'RH', efficiency: 68, trend: 'down', change: -1.2 },
                          { dept: 'Logistique', efficiency: 82, trend: 'up', change: 3.1 }
                        ].map((dept) => (
                          <div key={dept.dept} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{dept.dept}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold">{dept.efficiency}%</span>
                                <div className={cn(
                                  "flex items-center gap-1 text-xs",
                                  dept.trend === 'up' ? 'text-green-600' : 
                                  dept.trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
                                )}>
                                  {dept.trend === 'up' ? (
                                    <TrendingUp className="h-3 w-3" />
                                  ) : dept.trend === 'down' ? (
                                    <TrendingDown className="h-3 w-3" />
                                  ) : (
                                    <Minus className="h-3 w-3" />
                                  )}
                                  {Math.abs(dept.change)}%
                                </div>
                              </div>
                            </div>
                            <Progress value={dept.efficiency} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Objectifs vs Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {efficiencyMetrics.slice(0, 4).map((metric) => (
                          <div key={metric.id} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>{metric.name}</span>
                              <span>
                                {metric.current}/{metric.target}{metric.unit}
                              </span>
                            </div>
                            <div className="relative">
                              <Progress 
                                value={(metric.current / metric.target) * 100} 
                                className="h-3" 
                              />
                              <div 
                                className="absolute top-0 w-1 h-3 bg-red-500" 
                                style={{ left: `${(metric.target / metric.target) * 100}%` }}
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {metric.current >= metric.target ? (
                                <span className="text-green-600">✓ Objectif atteint</span>
                              ) : (
                                <span className="text-orange-600">
                                  Écart: {(metric.target - metric.current).toFixed(1)}{metric.unit}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Actions recommandées */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Actions d'amélioration prioritaires
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {[
                        {
                          title: 'Automatiser le traitement des factures',
                          department: 'Finance',
                          impact: 'high',
                          effort: 'medium',
                          saving: '€1,700/mois',
                          timeline: '6-8 semaines'
                        },
                        {
                          title: 'Optimiser les serveurs de production',
                          department: 'IT',
                          impact: 'medium',
                          effort: 'low',
                          saving: '€1,300/mois',
                          timeline: '2-3 semaines'
                        },
                        {
                          title: 'Implémenter l\'IA pour le screening CV',
                          department: 'RH',
                          impact: 'high',
                          effort: 'high',
                          saving: '€2,100/mois',
                          timeline: '12-16 semaines'
                        },
                        {
                          title: 'Réduire les licences inutilisées',
                          department: 'IT',
                          impact: 'medium',
                          effort: 'low',
                          saving: '€2,500/mois',
                          timeline: '1-2 semaines'
                        }
                      ].map((action, index) => (
                        <div key={index} className="p-4 rounded-lg border">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium">{action.title}</h4>
                            <Badge variant="outline">{action.department}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Impact: </span>
                              <Badge className={getImpactColor(action.impact)}>
                                {action.impact === 'high' ? 'Élevé' : 
                                 action.impact === 'medium' ? 'Moyen' : 'Faible'}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Effort: </span>
                              <Badge className={getEffortColor(action.effort)}>
                                {action.effort === 'high' ? 'Élevé' : 
                                 action.effort === 'medium' ? 'Moyen' : 'Faible'}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Économie: </span>
                              <span className="font-medium text-green-600">{action.saving}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Délai: </span>
                              <span className="font-medium">{action.timeline}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analyse des processus */}
              <TabsContent value="processes" className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les départements</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="RH">RH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-6">
                  {processAnalyses
                    .filter(p => selectedDepartment === 'all' || p.department === selectedDepartment)
                    .map((process) => (
                      <Card key={process.process}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              <Settings className="h-5 w-5" />
                              {process.process}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{process.department}</Badge>
                              <Badge className={
                                process.efficiency >= 80 ? 'bg-green-100 text-green-700' :
                                process.efficiency >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }>
                                {process.efficiency}% efficace
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-6 lg:grid-cols-2">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Métriques actuelles</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Temps moyen: </span>
                                    <span className="font-medium">{process.timeSpent}min</span>
                                    <span className="text-red-600 ml-1">
                                      (+{process.timeSpent - process.timeTarget}min)
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Coût actuel: </span>
                                    <span className="font-medium">{formatCurrency(process.costCurrent)}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Participants: </span>
                                    <span className="font-medium">{process.participants} personnes</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Automatisation: </span>
                                    <span className="font-medium">{process.automation}%</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Goulots d'étranglement</h4>
                                <ul className="space-y-1">
                                  {process.bottlenecks.map((bottleneck, index) => (
                                    <li key={index} className="flex items-center gap-2 text-sm">
                                      <AlertTriangle className="h-3 w-3 text-red-600" />
                                      {bottleneck}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Potentiel d'optimisation</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span>Temps cible</span>
                                    <span className="font-medium text-green-600">
                                      {process.timeTarget}min (-{((process.timeSpent - process.timeTarget) / process.timeSpent * 100).toFixed(0)}%)
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span>Économie potentielle</span>
                                    <span className="font-medium text-green-600">
                                      {formatCurrency(process.costCurrent - process.costOptimized)}/mois
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Améliorations suggérées</h4>
                                <ul className="space-y-1">
                                  {process.improvements.map((improvement, index) => (
                                    <li key={index} className="flex items-center gap-2 text-sm">
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                      {improvement}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>

                          <Separator className="my-4" />

                          <div className="flex items-center gap-2">
                            <Button size="sm">
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Lancer l'optimisation
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-2" />
                              Analyser en détail
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier le processus
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              {/* Utilisation des ressources */}
              <TabsContent value="resources" className="space-y-6">
                <div className="grid gap-6">
                  {resourceUtilization.map((resource) => (
                    <Card key={resource.resource}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {resource.type === 'human' && <Users className="h-5 w-5" />}
                          {resource.type === 'system' && <Cpu className="h-5 w-5" />}
                          {resource.type === 'infrastructure' && <Server className="h-5 w-5" />}
                          {resource.resource}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6 lg:grid-cols-2">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-3">Utilisation actuelle</h4>
                              <div className="space-y-3">
                                <div>
                                  <div className="flex items-center justify-between text-sm mb-1">
                                    <span>Taux d'utilisation</span>
                                    <span className="font-medium">{resource.utilization}%</span>
                                  </div>
                                  <Progress value={resource.utilization} className="h-2" />
                                </div>
                                <div>
                                  <div className="flex items-center justify-between text-sm mb-1">
                                    <span>Efficacité</span>
                                    <span className="font-medium">{resource.efficiency}%</span>
                                  </div>
                                  <Progress value={resource.efficiency} className="h-2" />
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Analyse des coûts</h4>
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div className="text-center p-2 rounded bg-muted">
                                  <div className="font-medium">{formatCurrency(resource.costs.current)}</div>
                                  <div className="text-xs text-muted-foreground">Actuel</div>
                                </div>
                                <div className="text-center p-2 rounded bg-green-50">
                                  <div className="font-medium text-green-600">{formatCurrency(resource.costs.optimal)}</div>
                                  <div className="text-xs text-muted-foreground">Optimal</div>
                                </div>
                                <div className="text-center p-2 rounded bg-red-50">
                                  <div className="font-medium text-red-600">{formatCurrency(resource.costs.waste)}</div>
                                  <div className="text-xs text-muted-foreground">Gaspillage</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Recommandations d'optimisation</h4>
                            <ul className="space-y-2">
                              {resource.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                            
                            <div className="mt-4 p-3 rounded-lg bg-blue-50">
                              <div className="font-medium text-blue-700">Potentiel d'économie</div>
                              <div className="text-lg font-bold text-blue-600">
                                {formatCurrency(resource.costs.waste)}/mois
                              </div>
                              <div className="text-sm text-blue-600">
                                Soit {((resource.costs.waste / resource.costs.current) * 100).toFixed(1)}% de réduction
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Opportunités d'automatisation */}
              <TabsContent value="automation" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="h-5 w-5" />
                      Opportunités d'automatisation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {automationOpportunities
                        .sort((a, b) => b.roi - a.roi)
                        .map((opportunity) => (
                          <div key={opportunity.process} className="p-4 rounded-lg border">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h4 className="font-medium">{opportunity.process}</h4>
                                <p className="text-sm text-muted-foreground">{opportunity.department}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-600">
                                  ROI {opportunity.roi}%
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {formatCurrency(opportunity.costSaving)}/an
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <div className="text-sm text-muted-foreground">Potentiel</div>
                                <div className="font-medium">{opportunity.potential}%</div>
                                <Progress value={opportunity.potential} className="h-1 mt-1" />
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Effort</div>
                                <Badge className={getEffortColor(opportunity.effort)}>
                                  {opportunity.effort === 'high' ? 'Élevé' : 
                                   opportunity.effort === 'medium' ? 'Moyen' : 'Faible'}
                                </Badge>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Impact</div>
                                <Badge className={getImpactColor(opportunity.impact)}>
                                  {opportunity.impact === 'high' ? 'Élevé' : 
                                   opportunity.impact === 'medium' ? 'Moyen' : 'Faible'}
                                </Badge>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Délai</div>
                                <div className="font-medium">{opportunity.timeToImplement} semaines</div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Technologies:</span>
                                {opportunity.technologies.map((tech) => (
                                  <Badge key={tech} variant="outline" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button size="sm">
                                  <PlayCircle className="h-4 w-4 mr-2" />
                                  Démarrer
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Détails
                                </Button>
                              </div>
                            </div>
                          </div>
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

export default AnalyticsEfficiency;
