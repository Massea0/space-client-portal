// src/pages/AdminDashboardCFO.tsx - Tableau de bord financier CFO
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  PieChart,
  BarChart3,
  LineChart,
  Calculator,
  Target,
  Calendar,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Banknote,
  Wallet,
  Activity,
  Eye,
  Download,
  Filter,
  RefreshCw,
  Zap,
  Building,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  Equal,
  Percent
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Types pour les données financières
interface FinancialMetric {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface CashFlowData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

interface BudgetCategory {
  category: string;
  budgeted: number;
  actual: number;
  percentage: number;
  status: 'under' | 'over' | 'on-track';
}

const AdminDashboardCFO: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('month');
  const [loading, setLoading] = useState(false);

  // Métriques financières principales
  const keyMetrics: FinancialMetric[] = [
    {
      label: 'Chiffre d\'affaires',
      value: '€1,247,500',
      change: 12.5,
      trend: 'up',
      period: 'vs mois dernier',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      label: 'Marge brute',
      value: '€523,950',
      change: 8.3,
      trend: 'up',
      period: 'vs mois dernier',
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      label: 'Charges opérationnelles',
      value: '€287,300',
      change: -3.2,
      trend: 'down',
      period: 'vs mois dernier',
      icon: Calculator,
      color: 'text-orange-600'
    },
    {
      label: 'Bénéfice net',
      value: '€236,650',
      change: 15.7,
      trend: 'up',
      period: 'vs mois dernier',
      icon: Target,
      color: 'text-purple-600'
    },
    {
      label: 'Trésorerie',
      value: '€892,340',
      change: 5.4,
      trend: 'up',
      period: 'vs fin mois dernier',
      icon: Wallet,
      color: 'text-cyan-600'
    },
    {
      label: 'Créances clients',
      value: '€345,680',
      change: -7.1,
      trend: 'down',
      period: 'vs mois dernier',
      icon: FileText,
      color: 'text-yellow-600'
    }
  ];

  // Données de flux de trésorerie
  const cashFlowData: CashFlowData[] = [
    { month: 'Jan', income: 980000, expenses: 720000, net: 260000 },
    { month: 'Fév', income: 1120000, expenses: 780000, net: 340000 },
    { month: 'Mar', income: 1050000, expenses: 740000, net: 310000 },
    { month: 'Avr', income: 1180000, expenses: 820000, net: 360000 },
    { month: 'Mai', income: 1250000, expenses: 850000, net: 400000 },
    { month: 'Juin', income: 1100000, expenses: 780000, net: 320000 }
  ];

  // Catégories de budget
  const budgetCategories: BudgetCategory[] = [
    {
      category: 'Personnel',
      budgeted: 450000,
      actual: 425000,
      percentage: 94.4,
      status: 'under'
    },
    {
      category: 'Marketing',
      budgeted: 120000,
      actual: 135000,
      percentage: 112.5,
      status: 'over'
    },
    {
      category: 'Opérations',
      budgeted: 200000,
      actual: 198000,
      percentage: 99.0,
      status: 'on-track'
    },
    {
      category: 'R&D',
      budgeted: 180000,
      actual: 165000,
      percentage: 91.7,
      status: 'under'
    },
    {
      category: 'Infrastructure',
      budgeted: 80000,
      actual: 85000,
      percentage: 106.3,
      status: 'over'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'under': return 'text-green-600 bg-green-50 border-green-200';
      case 'over': return 'text-red-600 bg-red-50 border-red-200';
      case 'on-track': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Tableau de bord CFO
                </h1>
                <p className="text-muted-foreground mt-1">
                  Vue financière complète et indicateurs de performance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Select value={timeframe} onValueChange={setTimeframe}>
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
            {keyMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card className="relative overflow-hidden">
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
                          metric.trend === 'up' ? 'text-green-600' : 
                          metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        )}>
                          {metric.trend === 'up' ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : metric.trend === 'down' ? (
                            <TrendingDown className="h-4 w-4" />
                          ) : (
                            <Minus className="h-4 w-4" />
                          )}
                          {Math.abs(metric.change)}%
                        </div>
                        <p className="text-xs text-muted-foreground">{metric.period}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Contenu principal avec onglets */}
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
                <TabsTrigger value="cashflow" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Flux de trésorerie
                </TabsTrigger>
                <TabsTrigger value="budget" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Budget vs Réalisé
                </TabsTrigger>
                <TabsTrigger value="forecasting" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Prévisions
                </TabsTrigger>
              </TabsList>

              {/* Vue d'ensemble */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5" />
                        Répartition des revenus
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { category: 'Services récurrents', amount: 748500, percentage: 60, color: 'bg-blue-500' },
                          { category: 'Projets ponctuels', amount: 373250, percentage: 30, color: 'bg-green-500' },
                          { category: 'Licences & Formation', amount: 124750, percentage: 10, color: 'bg-purple-500' }
                        ].map((item) => (
                          <div key={item.category} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className={cn("w-3 h-3 rounded-full", item.color)} />
                                <span>{item.category}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{formatCurrency(item.amount)}</span>
                                <Badge variant="outline">{item.percentage}%</Badge>
                              </div>
                            </div>
                            <Progress value={item.percentage} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Ratios financiers clés
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Marge brute', value: '42%', status: 'good' },
                          { label: 'Marge nette', value: '19%', status: 'good' },
                          { label: 'ROI', value: '24%', status: 'excellent' },
                          { label: 'DSO', value: '28j', status: 'warning' },
                          { label: 'Liquidité', value: '3.2', status: 'good' },
                          { label: 'Endettement', value: '15%', status: 'excellent' }
                        ].map((ratio) => (
                          <div key={ratio.label} className="p-3 rounded-lg border">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">{ratio.label}</span>
                              <Badge
                                variant={
                                  ratio.status === 'excellent' ? 'default' :
                                  ratio.status === 'good' ? 'secondary' :
                                  'destructive'
                                }
                                className={
                                  ratio.status === 'excellent' ? 'bg-green-100 text-green-700' :
                                  ratio.status === 'good' ? 'bg-blue-100 text-blue-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }
                              >
                                {ratio.status === 'excellent' ? 'Excellent' :
                                 ratio.status === 'good' ? 'Bon' : 'Attention'}
                              </Badge>
                            </div>
                            <p className="text-lg font-bold mt-1">{ratio.value}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Alertes financières */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Alertes et recommandations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        {
                          type: 'warning',
                          message: 'DSO en hausse - Délai de paiement clients à 28 jours (objectif: 25j)',
                          action: 'Relancer les impayés'
                        },
                        {
                          type: 'success',
                          message: 'Marge brute en amélioration +2.3% vs trimestre dernier',
                          action: 'Maintenir la stratégie'
                        },
                        {
                          type: 'info',
                          message: 'Opportunité d\'optimisation fiscale détectée sur les amortissements',
                          action: 'Consulter expert-comptable'
                        }
                      ].map((alert, index) => (
                        <div
                          key={index}
                          className={cn(
                            "p-4 rounded-lg border-l-4 flex items-center justify-between",
                            alert.type === 'warning' && "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
                            alert.type === 'success' && "border-l-green-500 bg-green-50 dark:bg-green-950/20",
                            alert.type === 'info' && "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                            {alert.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                            {alert.type === 'info' && <Eye className="h-4 w-4 text-blue-600" />}
                            <span className="text-sm">{alert.message}</span>
                          </div>
                          <Button size="sm" variant="outline">
                            {alert.action}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Flux de trésorerie */}
              <TabsContent value="cashflow" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Évolution de la trésorerie (6 derniers mois)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="h-64 bg-gradient-to-t from-muted/20 to-transparent rounded-lg p-4">
                        <div className="h-full flex items-end justify-between gap-2">
                          {cashFlowData.map((data, index) => (
                            <div key={data.month} className="flex-1 space-y-2">
                              <div className="text-xs text-center text-muted-foreground">{data.month}</div>
                              <div className="relative flex flex-col items-center gap-1">
                                <div
                                  className="w-full bg-green-500 rounded-t"
                                  style={{ height: `${(data.income / 1500000) * 150}px` }}
                                />
                                <div
                                  className="w-full bg-red-500 rounded-b"
                                  style={{ height: `${(data.expenses / 1500000) * 150}px` }}
                                />
                              </div>
                              <div className="text-xs text-center font-medium">
                                {formatCurrency(data.net)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">Entrées moyennes</span>
                          </div>
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(cashFlowData.reduce((acc, d) => acc + d.income, 0) / cashFlowData.length)}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium">Sorties moyennes</span>
                          </div>
                          <p className="text-lg font-bold text-red-600">
                            {formatCurrency(cashFlowData.reduce((acc, d) => acc + d.expenses, 0) / cashFlowData.length)}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Equal className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">Flux net moyen</span>
                          </div>
                          <p className="text-lg font-bold text-blue-600">
                            {formatCurrency(cashFlowData.reduce((acc, d) => acc + d.net, 0) / cashFlowData.length)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Budget vs Réalisé */}
              <TabsContent value="budget" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Analyse budgétaire par catégorie
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {budgetCategories.map((category) => (
                        <div key={category.category} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{category.category}</h4>
                            <Badge className={getBudgetStatusColor(category.status)}>
                              {category.status === 'under' && 'Sous budget'}
                              {category.status === 'over' && 'Dépassement'}
                              {category.status === 'on-track' && 'Dans les clous'}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Budgété: {formatCurrency(category.budgeted)}</span>
                              <span>Réalisé: {formatCurrency(category.actual)}</span>
                            </div>
                            <Progress 
                              value={category.percentage} 
                              className={cn(
                                "h-3",
                                category.status === 'over' && "[&>div]:bg-red-500",
                                category.status === 'under' && "[&>div]:bg-green-500",
                                category.status === 'on-track' && "[&>div]:bg-blue-500"
                              )}
                            />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{category.percentage.toFixed(1)}% du budget</span>
                              <span>
                                {category.status === 'over' ? '+' : ''}
                                {formatCurrency(category.actual - category.budgeted)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Prévisions */}
              <TabsContent value="forecasting" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Prévisions trimestrielles
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { metric: 'Chiffre d\'affaires', q1: '€3.8M', q2: '€4.2M', q3: '€4.5M', q4: '€4.1M' },
                          { metric: 'Bénéfice net', q1: '€720K', q2: '€840K', q3: '€900K', q4: '€820K' },
                          { metric: 'Trésorerie', q1: '€1.2M', q2: '€1.5M', q3: '€1.8M', q4: '€1.6M' }
                        ].map((forecast) => (
                          <div key={forecast.metric} className="p-4 rounded-lg border">
                            <h4 className="font-medium mb-3">{forecast.metric}</h4>
                            <div className="grid grid-cols-4 gap-2 text-sm">
                              <div className="text-center">
                                <div className="text-muted-foreground">Q1</div>
                                <div className="font-medium">{forecast.q1}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-muted-foreground">Q2</div>
                                <div className="font-medium">{forecast.q2}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-muted-foreground">Q3</div>
                                <div className="font-medium">{forecast.q3}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-muted-foreground">Q4</div>
                                <div className="font-medium">{forecast.q4}</div>
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
                        <Zap className="h-5 w-5" />
                        Actions recommandées
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          {
                            priority: 'high',
                            action: 'Réduire le DSO',
                            description: 'Mettre en place un processus de relance automatisé',
                            impact: '€95K de trésorerie supplémentaire'
                          },
                          {
                            priority: 'medium',
                            action: 'Optimiser les coûts marketing',
                            description: 'Revoir le ROI des canaux d\'acquisition',
                            impact: '€15K d\'économies mensuelles'
                          },
                          {
                            priority: 'low',
                            action: 'Renégocier les contrats fournisseurs',
                            description: 'Révision annuelle des tarifs',
                            impact: '€8K d\'économies mensuelles'
                          }
                        ].map((action, index) => (
                          <div
                            key={index}
                            className={cn(
                              "p-4 rounded-lg border-l-4",
                              action.priority === 'high' && "border-l-red-500 bg-red-50 dark:bg-red-950/20",
                              action.priority === 'medium' && "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
                              action.priority === 'low' && "border-l-green-500 bg-green-50 dark:bg-green-950/20"
                            )}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium">{action.action}</h4>
                              <Badge
                                variant={
                                  action.priority === 'high' ? 'destructive' :
                                  action.priority === 'medium' ? 'default' : 'secondary'
                                }
                              >
                                {action.priority === 'high' ? 'Urgent' :
                                 action.priority === 'medium' ? 'Important' : 'À planifier'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
                            <p className="text-sm font-medium text-green-600">{action.impact}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardCFO;
