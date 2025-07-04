// src/pages/AdminRapports.tsx - Rapports détaillés avec IA
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Calendar,
  Download,
  Filter,
  Search,
  RefreshCw,
  Brain,
  Target,
  Activity,
  PieChart,
  LineChart,
  Users,
  Building,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Sparkles,
  Eye,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

interface Report {
  id: string;
  title: string;
  type: 'financial' | 'performance' | 'users' | 'sales';
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
  description: string;
}

interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'trend' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  action?: string;
}

const AdminRapports: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data pour les rapports
  const [reports] = useState<Report[]>([
    {
      id: '1',
      title: 'Chiffre d\'affaires',
      type: 'financial',
      value: 125800,
      change: 12.5,
      trend: 'up',
      lastUpdated: new Date(),
      description: 'Revenus totaux générés'
    },
    {
      id: '2',
      title: 'Factures en attente',
      type: 'financial',
      value: 45200,
      change: -8.2,
      trend: 'down',
      lastUpdated: new Date(),
      description: 'Montant des factures impayées'
    },
    {
      id: '3',
      title: 'Conversion devis',
      type: 'performance',
      value: 68.5,
      change: 15.3,
      trend: 'up',
      lastUpdated: new Date(),
      description: 'Pourcentage de conversion'
    },
    {
      id: '4',
      title: 'Nouveaux clients',
      type: 'users',
      value: 24,
      change: 33.3,
      trend: 'up',
      lastUpdated: new Date(),
      description: 'Clients acquis ce mois'
    },
    {
      id: '5',
      title: 'Temps de réponse',
      type: 'performance',
      value: 2.4,
      change: -20.5,
      trend: 'up',
      lastUpdated: new Date(),
      description: 'Heures moyennes de réponse'
    },
    {
      id: '6',
      title: 'Ventes mensuelles',
      type: 'sales',
      value: 89300,
      change: 18.7,
      trend: 'up',
      lastUpdated: new Date(),
      description: 'Ventes du mois en cours'
    }
  ]);

  // Mock data pour les insights IA
  const [aiInsights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'opportunity',
      title: 'Opportunité de croissance',
      description: 'Les ventes du secteur B2B sont en hausse de 25%. Recommandation : augmenter les efforts marketing sur ce segment.',
      impact: 'high',
      confidence: 87,
      action: 'Planifier campagne B2B'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Délais de paiement',
      description: 'Les délais de paiement s\'allongent de 15% par rapport au trimestre précédent.',
      impact: 'medium',
      confidence: 92,
      action: 'Revoir politique de recouvrement'
    },
    {
      id: '3',
      type: 'trend',
      title: 'Tendance saisonnière',
      description: 'Pic d\'activité prévu en décembre basé sur les données historiques.',
      impact: 'medium',
      confidence: 78,
      action: 'Préparer ressources'
    },
    {
      id: '4',
      type: 'recommendation',
      title: 'Optimisation des prix',
      description: 'Analyse des prix concurrents suggère une marge d\'augmentation de 8% sur certains services.',
      impact: 'high',
      confidence: 84,
      action: 'Réviser grille tarifaire'
    }
  ]);

  useEffect(() => {
    // Simulation du chargement des données
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'financial': return DollarSign;
      case 'performance': return Target;
      case 'users': return Users;
      case 'sales': return TrendingUp;
      default: return Activity;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return Zap;
      case 'warning': return ArrowDownRight;
      case 'trend': return TrendingUp;
      case 'recommendation': return Brain;
      default: return Sparkles;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'text-emerald-400 bg-emerald-500/20';
      case 'warning': return 'text-amber-400 bg-amber-500/20';
      case 'trend': return 'text-blue-400 bg-blue-500/20';
      case 'recommendation': return 'text-purple-400 bg-purple-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesCategory = selectedCategory === 'all' || report.type === selectedCategory;
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto mb-4"
          />
          <p className="text-slate-300">Génération des rapports IA...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-10"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-muted-foreground hover:text-foreground"
              >
                ← Retour au Dashboard
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Rapports Détaillés</h1>
                  <p className="text-muted-foreground text-sm">Analyses & insights IA</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Rechercher dans les rapports..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                </div>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-[140px] bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="7d">7 jours</SelectItem>
                    <SelectItem value="30d">30 jours</SelectItem>
                    <SelectItem value="90d">90 jours</SelectItem>
                    <SelectItem value="1y">1 an</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[140px] bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="financial">Financier</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="users">Utilisateurs</SelectItem>
                    <SelectItem value="sales">Ventes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Insights IA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Insights IA</h2>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              {aiInsights.length} insights
            </Badge>
          </div>

          <div className="grid gap-4">
            {aiInsights.map((insight, index) => {
              const Icon = getInsightIcon(insight.type);
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", getInsightColor(insight.type))}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-white">{insight.title}</h3>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {insight.impact}
                              </Badge>
                              <span className="text-xs text-slate-400">{insight.confidence}% confiance</span>
                            </div>
                          </div>
                          <p className="text-slate-300 mb-3">{insight.description}</p>
                          {insight.action && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                              <Zap className="w-4 h-4 mr-2" />
                              {insight.action}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Rapports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Rapports Détaillés</h2>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              {filteredReports.length} rapports
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredReports.map((report, index) => {
              const Icon = getTypeIcon(report.type);
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-white text-base">{report.title}</CardTitle>
                            <p className="text-slate-400 text-sm">{report.description}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-2xl font-bold text-white">
                              {report.type === 'financial' || report.type === 'sales' 
                                ? formatCurrency(report.value)
                                : report.type === 'performance' && report.title.includes('Temps')
                                ? `${report.value}h`
                                : `${report.value}${report.type === 'performance' ? '%' : ''}`
                              }
                            </span>
                            <div className={cn(
                              "flex items-center gap-1 text-sm font-medium",
                              report.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                            )}>
                              {report.trend === 'up' ? (
                                <ArrowUpRight className="w-4 h-4" />
                              ) : (
                                <ArrowDownRight className="w-4 h-4" />
                              )}
                              {Math.abs(report.change)}%
                            </div>
                          </div>
                          <p className="text-slate-400 text-sm">vs période précédente</p>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Dernière mise à jour</span>
                          <span className="text-slate-300">{formatDate(report.lastUpdated)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminRapports;
