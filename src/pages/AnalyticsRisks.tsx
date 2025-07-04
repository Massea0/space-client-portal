// src/pages/AnalyticsRisks.tsx - Page d'analyse et gestion des risques
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Activity,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Users,
  DollarSign,
  FileText,
  Zap,
  Brain,
  BarChart3,
  PieChart,
  LineChart,
  Eye,
  Settings,
  Download,
  RefreshCw,
  Filter,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  XCircle,
  Calendar,
  Building,
  Globe,
  Server,
  Smartphone,
  CreditCard,
  Lock,
  Unlock,
  Bell,
  Search
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

// Types pour l'analyse des risques
interface RiskAssessment {
  id: string;
  category: string;
  title: string;
  description: string;
  probability: number;
  impact: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'monitoring' | 'mitigated' | 'resolved';
  trend: 'increasing' | 'stable' | 'decreasing';
  lastUpdate: Date;
  mitigation: {
    current: string[];
    planned: string[];
    responsible: string;
    deadline?: Date;
  };
  kpis: {
    label: string;
    value: number;
    target: number;
    unit: string;
  }[];
}

interface RiskMatrix {
  probability: number;
  impact: number;
  count: number;
  risks: string[];
}

interface ComplianceCheck {
  domain: string;
  status: 'compliant' | 'partial' | 'non-compliant';
  score: number;
  lastAudit: Date;
  nextAudit: Date;
  issues: number;
  critical: number;
}

const AnalyticsRisks: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Évaluations des risques
  const riskAssessments: RiskAssessment[] = [
    {
      id: 'cyber_attack',
      category: 'Cybersécurité',
      title: 'Cyberattaque / Ransomware',
      description: 'Risque d\'attaque informatique compromettant les données et systèmes',
      probability: 85,
      impact: 95,
      severity: 'critical',
      status: 'active',
      trend: 'increasing',
      lastUpdate: new Date('2024-01-15'),
      mitigation: {
        current: [
          'Firewall avancé configuré',
          'Antivirus sur tous les postes',
          'Sauvegardes quotidiennes'
        ],
        planned: [
          'Formation cybersécurité équipes',
          'Audit de sécurité externe',
          'Mise en place 2FA généralisée'
        ],
        responsible: 'DSI',
        deadline: new Date('2024-03-01')
      },
      kpis: [
        { label: 'Incidents détectés', value: 12, target: 5, unit: '/mois' },
        { label: 'Temps de réponse', value: 4.2, target: 2.0, unit: 'heures' },
        { label: 'Couverture sécurité', value: 78, target: 95, unit: '%' }
      ]
    },
    {
      id: 'talent_shortage',
      category: 'Ressources Humaines',
      title: 'Pénurie de talents techniques',
      description: 'Difficulté à recruter et retenir les profils techniques',
      probability: 78,
      impact: 72,
      severity: 'high',
      status: 'monitoring',
      trend: 'increasing',
      lastUpdate: new Date('2024-01-12'),
      mitigation: {
        current: [
          'Partenariats écoles d\'ingénieurs',
          'Programme de formation interne',
          'Télétravail et avantages'
        ],
        planned: [
          'Augmentation budgets salaires',
          'Programme de cooptation',
          'Certification équipes existantes'
        ],
        responsible: 'DRH',
        deadline: new Date('2024-04-15')
      },
      kpis: [
        { label: 'Taux de rotation', value: 18, target: 10, unit: '%' },
        { label: 'Postes vacants', value: 8, target: 3, unit: 'postes' },
        { label: 'Temps de recrutement', value: 65, target: 45, unit: 'jours' }
      ]
    },
    {
      id: 'economic_downturn',
      category: 'Économique',
      title: 'Récession économique',
      description: 'Impact d\'un ralentissement économique sur l\'activité',
      probability: 45,
      impact: 88,
      severity: 'high',
      status: 'monitoring',
      trend: 'stable',
      lastUpdate: new Date('2024-01-10'),
      mitigation: {
        current: [
          'Diversification portefeuille clients',
          'Réserves de trésorerie',
          'Contrats récurrents sécurisés'
        ],
        planned: [
          'Plan de continuité activité',
          'Réduction coûts variables',
          'Développement nouveaux marchés'
        ],
        responsible: 'CFO',
        deadline: new Date('2024-02-28')
      },
      kpis: [
        { label: 'Dépendance client principal', value: 28, target: 20, unit: '%' },
        { label: 'Mois de trésorerie', value: 8, target: 12, unit: 'mois' },
        { label: 'Revenus récurrents', value: 65, target: 80, unit: '%' }
      ]
    },
    {
      id: 'regulatory_change',
      category: 'Réglementaire',
      title: 'Évolution réglementaire RGPD',
      description: 'Nouvelles obligations de conformité RGPD',
      probability: 65,
      impact: 55,
      severity: 'medium',
      status: 'mitigated',
      trend: 'decreasing',
      lastUpdate: new Date('2024-01-08'),
      mitigation: {
        current: [
          'DPO nommé et formé',
          'Procédures RGPD documentées',
          'Registre des traitements à jour'
        ],
        planned: [
          'Audit de conformité annuel',
          'Formation équipes métier',
          'Mise à jour politique confidentialité'
        ],
        responsible: 'Juridique',
        deadline: new Date('2024-06-01')
      },
      kpis: [
        { label: 'Score conformité', value: 92, target: 95, unit: '%' },
        { label: 'Incidents signalés', value: 0, target: 0, unit: '/an' },
        { label: 'Formations réalisées', value: 85, target: 100, unit: '%' }
      ]
    },
    {
      id: 'supply_chain',
      category: 'Opérationnel',
      title: 'Disruption chaîne d\'approvisionnement',
      description: 'Risque de rupture fournisseurs critiques',
      probability: 52,
      impact: 68,
      severity: 'medium',
      status: 'active',
      trend: 'stable',
      lastUpdate: new Date('2024-01-14'),
      mitigation: {
        current: [
          'Double sourcing fournisseurs clés',
          'Stocks de sécurité',
          'Contrats avec SLA stricts'
        ],
        planned: [
          'Diversification géographique',
          'Évaluation fournisseurs trimestrielle',
          'Plan de continuité métier'
        ],
        responsible: 'COO',
        deadline: new Date('2024-05-01')
      },
      kpis: [
        { label: 'Fournisseurs uniques', value: 15, target: 5, unit: '%' },
        { label: 'Délai moyen livraison', value: 12, target: 7, unit: 'jours' },
        { label: 'Taux de rupture', value: 3, target: 1, unit: '%' }
      ]
    }
  ];

  // Données de conformité
  const complianceChecks: ComplianceCheck[] = [
    {
      domain: 'RGPD',
      status: 'compliant',
      score: 92,
      lastAudit: new Date('2023-12-15'),
      nextAudit: new Date('2024-06-15'),
      issues: 2,
      critical: 0
    },
    {
      domain: 'ISO 27001',
      status: 'partial',
      score: 78,
      lastAudit: new Date('2023-11-20'),
      nextAudit: new Date('2024-05-20'),
      issues: 8,
      critical: 1
    },
    {
      domain: 'SOX',
      status: 'compliant',
      score: 95,
      lastAudit: new Date('2023-10-30'),
      nextAudit: new Date('2024-04-30'),
      issues: 1,
      critical: 0
    },
    {
      domain: 'Qualité ISO 9001',
      status: 'non-compliant',
      score: 65,
      lastAudit: new Date('2023-09-15'),
      nextAudit: new Date('2024-03-15'),
      issues: 15,
      critical: 3
    }
  ];

  // Matrice des risques pour visualisation
  const riskMatrix: RiskMatrix[] = [
    { probability: 20, impact: 20, count: 2, risks: ['Risque technique mineur', 'Retard livraison'] },
    { probability: 20, impact: 60, count: 1, risks: ['Panne système'] },
    { probability: 20, impact: 90, count: 0, risks: [] },
    { probability: 60, impact: 20, count: 3, risks: ['Turnover modéré', 'Concurrence', 'Inflation'] },
    { probability: 60, impact: 60, count: 2, risks: ['Évolution réglementaire', 'Supply chain'] },
    { probability: 60, impact: 90, count: 1, risks: ['Récession économique'] },
    { probability: 90, impact: 20, count: 1, risks: ['Mise à jour logicielle'] },
    { probability: 90, impact: 60, count: 1, risks: ['Pénurie talents'] },
    { probability: 90, impact: 90, count: 1, risks: ['Cyberattaque'] }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-300 dark:text-red-300 dark:bg-red-900/50 dark:border-red-700';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-300 dark:text-orange-300 dark:bg-orange-900/50 dark:border-orange-700';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-300 dark:text-yellow-300 dark:bg-yellow-900/50 dark:border-yellow-700';
      case 'low': return 'text-green-700 bg-green-100 border-green-300 dark:text-green-300 dark:bg-green-900/50 dark:border-green-700';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/50 dark:border-red-800';
      case 'monitoring': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/50 dark:border-yellow-800';
      case 'mitigated': return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/50 dark:border-blue-800';
      case 'resolved': return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/50 dark:border-green-800';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/50 dark:border-green-800';
      case 'partial': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/50 dark:border-yellow-800';
      case 'non-compliant': return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/50 dark:border-red-800';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getRiskScore = (probability: number, impact: number) => {
    return Math.round((probability * impact) / 100);
  };

  const filteredRisks = riskAssessments.filter(risk => {
    const matchesSeverity = filterSeverity === 'all' || risk.severity === filterSeverity;
    const matchesCategory = filterCategory === 'all' || risk.category === filterCategory;
    const matchesSearch = searchTerm === '' || 
      risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      risk.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSeverity && matchesCategory && matchesSearch;
  });

  const getMatrixCellColor = (probability: number, impact: number) => {
    const score = getRiskScore(probability, impact);
    if (score >= 70) return 'bg-red-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
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
                  Analyse des risques
                </h1>
                <p className="text-muted-foreground mt-1">
                  Évaluation, suivi et mitigation des risques business
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

          {/* Indicateurs de risque */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            {[
              {
                label: 'Risques critiques',
                value: riskAssessments.filter(r => r.severity === 'critical').length,
                change: '+1',
                trend: 'up',
                icon: ShieldAlert,
                color: 'text-red-600'
              },
              {
                label: 'Score risque global',
                value: Math.round(riskAssessments.reduce((acc, r) => acc + getRiskScore(r.probability, r.impact), 0) / riskAssessments.length),
                change: '-5',
                trend: 'down',
                icon: Shield,
                color: 'text-orange-600'
              },
              {
                label: 'Conformité moyenne',
                value: Math.round(complianceChecks.reduce((acc, c) => acc + c.score, 0) / complianceChecks.length) + '%',
                change: '+3%',
                trend: 'up',
                icon: ShieldCheck,
                color: 'text-green-600'
              },
              {
                label: 'Actions en cours',
                value: riskAssessments.filter(r => r.status === 'active' || r.status === 'monitoring').length,
                change: '+2',
                trend: 'up',
                icon: Activity,
                color: 'text-blue-600'
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
                          metric.trend === 'up' ? 'text-red-600' : 'text-green-600'
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
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Vue d'ensemble
                </TabsTrigger>
                <TabsTrigger value="assessment" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Évaluations
                </TabsTrigger>
                <TabsTrigger value="compliance" className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Conformité
                </TabsTrigger>
                <TabsTrigger value="mitigation" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Mitigation
                </TabsTrigger>
              </TabsList>

              {/* Vue d'ensemble */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5" />
                        Matrice des risques
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          <div></div>
                          <div className="font-medium">Faible</div>
                          <div className="font-medium">Moyen</div>
                          <div className="font-medium">Élevé</div>
                        </div>
                        
                        {[
                          { label: 'Élevée', probs: [90, 90, 90] },
                          { label: 'Moyenne', probs: [60, 60, 60] },
                          { label: 'Faible', probs: [20, 20, 20] }
                        ].map((row, rowIndex) => (
                          <div key={row.label} className="grid grid-cols-4 gap-2 items-center">
                            <div className="text-xs font-medium text-right pr-2">
                              {rowIndex === 1 && 'Probabilité'}
                            </div>
                            {row.probs.map((prob, colIndex) => {
                              const impact = [20, 60, 90][colIndex];
                              const cell = riskMatrix.find(m => m.probability === prob && m.impact === impact);
                              return (
                                <div
                                  key={`${prob}-${impact}`}
                                  className={cn(
                                    "aspect-square rounded-lg flex items-center justify-center text-white text-xs font-bold relative group cursor-pointer",
                                    getMatrixCellColor(prob, impact)
                                  )}
                                >
                                  {cell?.count || 0}
                                  {cell && cell.count > 0 && (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                        {cell.risks.join(', ')}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                        
                        <div className="flex items-center justify-center gap-4 text-xs mt-4">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-500 rounded" />
                            <span>Risque acceptable</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-500 rounded" />
                            <span>Attention requise</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-500 rounded" />
                            <span>Action immédiate</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <LineChart className="h-5 w-5" />
                        Évolution des risques
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { category: 'Cybersécurité', current: 85, previous: 78, trend: 'increasing' },
                          { category: 'Ressources Humaines', current: 75, previous: 70, trend: 'increasing' },
                          { category: 'Économique', current: 45, previous: 48, trend: 'stable' },
                          { category: 'Réglementaire', current: 40, previous: 55, trend: 'decreasing' },
                          { category: 'Opérationnel', current: 52, previous: 52, trend: 'stable' }
                        ].map((category) => (
                          <div key={category.category} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{category.category}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {category.previous} → {category.current}
                                </span>
                                {category.trend === 'increasing' && (
                                  <TrendingUp className="h-4 w-4 text-red-600" />
                                )}
                                {category.trend === 'decreasing' && (
                                  <TrendingDown className="h-4 w-4 text-green-600" />
                                )}
                                {category.trend === 'stable' && (
                                  <Minus className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                            <Progress 
                              value={category.current} 
                              className={cn(
                                "h-2",
                                category.current >= 70 && "[&>div]:bg-red-500",
                                category.current >= 40 && category.current < 70 && "[&>div]:bg-yellow-500",
                                category.current < 40 && "[&>div]:bg-green-500"
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top risques */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Top 5 des risques prioritaires
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {riskAssessments
                        .sort((a, b) => getRiskScore(b.probability, b.impact) - getRiskScore(a.probability, a.impact))
                        .slice(0, 5)
                        .map((risk, index) => (
                          <div key={risk.id} className="flex items-center gap-4 p-4 rounded-lg border">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{risk.title}</h4>
                              <p className="text-sm text-muted-foreground">{risk.category}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">{getRiskScore(risk.probability, risk.impact)}</div>
                              <div className="text-xs text-muted-foreground">Score risque</div>
                            </div>
                            <Badge className={getSeverityColor(risk.severity)}>
                              {risk.severity === 'critical' ? 'Critique' :
                               risk.severity === 'high' ? 'Élevé' :
                               risk.severity === 'medium' ? 'Moyen' : 'Faible'}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Évaluations détaillées */}
              <TabsContent value="assessment" className="space-y-6">
                {/* Filtres */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Rechercher un risque..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les sévérités</SelectItem>
                          <SelectItem value="critical">Critique</SelectItem>
                          <SelectItem value="high">Élevé</SelectItem>
                          <SelectItem value="medium">Moyen</SelectItem>
                          <SelectItem value="low">Faible</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les catégories</SelectItem>
                          <SelectItem value="Cybersécurité">Cybersécurité</SelectItem>
                          <SelectItem value="Ressources Humaines">Ressources Humaines</SelectItem>
                          <SelectItem value="Économique">Économique</SelectItem>
                          <SelectItem value="Réglementaire">Réglementaire</SelectItem>
                          <SelectItem value="Opérationnel">Opérationnel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Liste des risques */}
                <div className="space-y-4">
                  {filteredRisks.map((risk) => (
                    <motion.div
                      key={risk.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card>
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {/* En-tête */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold">{risk.title}</h3>
                                <p className="text-muted-foreground">{risk.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline">{risk.category}</Badge>
                                  <Badge className={getSeverityColor(risk.severity)}>
                                    {risk.severity === 'critical' ? 'Critique' :
                                     risk.severity === 'high' ? 'Élevé' :
                                     risk.severity === 'medium' ? 'Moyen' : 'Faible'}
                                  </Badge>
                                  <Badge className={getStatusColor(risk.status)}>
                                    {risk.status === 'active' ? 'Actif' :
                                     risk.status === 'monitoring' ? 'Surveillance' :
                                     risk.status === 'mitigated' ? 'Atténué' : 'Résolu'}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold">{getRiskScore(risk.probability, risk.impact)}</div>
                                <div className="text-sm text-muted-foreground">Score risque</div>
                              </div>
                            </div>

                            <Separator />

                            {/* Métriques */}
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <div className="flex items-center justify-between text-sm mb-2">
                                  <span>Probabilité</span>
                                  <span className="font-medium">{risk.probability}%</span>
                                </div>
                                <Progress value={risk.probability} className="h-2" />
                              </div>
                              <div>
                                <div className="flex items-center justify-between text-sm mb-2">
                                  <span>Impact</span>
                                  <span className="font-medium">{risk.impact}%</span>
                                </div>
                                <Progress value={risk.impact} className="h-2" />
                              </div>
                            </div>

                            {/* KPIs */}
                            {risk.kpis.length > 0 && (
                              <>
                                <Separator />
                                <div>
                                  <h4 className="font-medium mb-3">Indicateurs de suivi</h4>
                                  <div className="grid grid-cols-3 gap-4">
                                    {risk.kpis.map((kpi, index) => (
                                      <div key={index} className="text-center">
                                        <div className="text-lg font-bold">{kpi.value}{kpi.unit}</div>
                                        <div className="text-sm text-muted-foreground">{kpi.label}</div>
                                        <div className="text-xs">
                                          Objectif: {kpi.target}{kpi.unit}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}

                            {/* Actions de mitigation */}
                            <Separator />
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium mb-2">Mesures actuelles</h4>
                                <ul className="text-sm space-y-1">
                                  {risk.mitigation.current.map((measure, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                      {measure}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Actions planifiées</h4>
                                <ul className="text-sm space-y-1">
                                  {risk.mitigation.planned.map((action, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                      <Clock className="h-3 w-3 text-blue-600" />
                                      {action}
                                    </li>
                                  ))}
                                </ul>
                                <div className="mt-2 text-xs text-muted-foreground">
                                  Responsable: {risk.mitigation.responsible}
                                  {risk.mitigation.deadline && (
                                    <> • Échéance: {risk.mitigation.deadline.toLocaleDateString()}</>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Conformité */}
              <TabsContent value="compliance" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {complianceChecks.map((compliance) => (
                    <Card key={compliance.domain}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5" />
                            {compliance.domain}
                          </CardTitle>
                          <Badge className={getComplianceColor(compliance.status)}>
                            {compliance.status === 'compliant' ? 'Conforme' :
                             compliance.status === 'partial' ? 'Partiellement conforme' : 'Non conforme'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold mb-1">{compliance.score}%</div>
                            <div className="text-sm text-muted-foreground">Score de conformité</div>
                            <Progress value={compliance.score} className="mt-2" />
                          </div>

                          <Separator />

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="font-medium">Dernier audit</div>
                              <div className="text-muted-foreground">
                                {compliance.lastAudit.toLocaleDateString()}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">Prochain audit</div>
                              <div className="text-muted-foreground">
                                {compliance.nextAudit.toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <Separator />

                          <div className="flex items-center justify-between">
                            <div className="text-center">
                              <div className="text-lg font-bold">{compliance.issues}</div>
                              <div className="text-xs text-muted-foreground">Points d'amélioration</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-red-600">{compliance.critical}</div>
                              <div className="text-xs text-muted-foreground">Critiques</div>
                            </div>
                          </div>

                          <Button className="w-full" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Voir le détail
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Plans de mitigation */}
              <TabsContent value="mitigation" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Plans d'action prioritaires
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {riskAssessments
                        .filter(r => r.status === 'active' || r.status === 'monitoring')
                        .sort((a, b) => getRiskScore(b.probability, b.impact) - getRiskScore(a.probability, a.impact))
                        .map((risk) => (
                          <div key={risk.id} className="p-4 rounded-lg border">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium">{risk.title}</h4>
                                <p className="text-sm text-muted-foreground">{risk.category}</p>
                              </div>
                              <Badge className={getSeverityColor(risk.severity)}>
                                Score: {getRiskScore(risk.probability, risk.impact)}
                              </Badge>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <h5 className="text-sm font-medium mb-1">Actions en cours</h5>
                                <div className="space-y-1">
                                  {risk.mitigation.current.map((action, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm">
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                      {action}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h5 className="text-sm font-medium mb-1">Prochaines étapes</h5>
                                <div className="space-y-1">
                                  {risk.mitigation.planned.map((action, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm">
                                      <Clock className="h-3 w-3 text-blue-600" />
                                      {action}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>Responsable: {risk.mitigation.responsible}</span>
                                {risk.mitigation.deadline && (
                                  <span>Échéance: {risk.mitigation.deadline.toLocaleDateString()}</span>
                                )}
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

export default AnalyticsRisks;
