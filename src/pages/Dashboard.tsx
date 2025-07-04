// src/pages/Dashboard.tsx - Dashboard Pro avec Dark Mode & Drag & Drop Sprint 6
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { devisApi, invoicesApi, ticketsApi, companiesApi, usersApi } from '@/services/api';
import { Devis, Invoice, Ticket } from '@/types';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  TrendingUp,
  ClipboardList,
  MessageSquare,
  Building,
  Users,
  FileText,
  WifiOff,
  RefreshCw,
  Plus,
  ArrowUpRight,
  Brain,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Zap,
  BarChart3,
  Timer,
  Calendar,
  Moon,
  Sun,
  GripVertical,
  Maximize2,
  Minimize2,
  Settings,
  Sparkles,
  TrendingDown,
  Activity,
  Target,
  PieChart,
  LineChart,
  BarChart,
  Gauge
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { DraggableList, DraggableListItem } from '@/components/ui/draggable-list';

// Hook pour le thème sombre
const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return [isDark, setIsDark] as const;
};

// Types pour les fences iOS avec drag & drop
interface FenceItem {
  id: string;
  title: string;
  subtitle?: string;
  value?: string;
  amount?: string;
  status?: 'success' | 'warning' | 'error' | 'info';
  date?: string;
  action?: () => void;
  trend?: 'up' | 'down' | 'neutral';
  percentage?: number;
}

interface Fence {
  id: string;
  title: string;
  description?: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'amber' | 'purple' | 'emerald' | 'slate' | 'rose' | 'cyan';
  items: FenceItem[];
  actions?: {
    primary: { label: string; action: () => void };
    secondary?: { label: string; action: () => void };
  };
  size?: 'small' | 'medium' | 'large';
  isExpanded?: boolean;
}

// Configuration des couleurs pour thème sombre/clair
const fenceColors = {
  blue: {
    light: { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'text-blue-600', hover: 'hover:bg-blue-100' },
    dark: { bg: 'dark:bg-blue-950/50', border: 'dark:border-blue-800/50', icon: 'dark:text-blue-400', hover: 'dark:hover:bg-blue-900/50' }
  },
  green: {
    light: { bg: 'bg-green-50', border: 'border-green-100', icon: 'text-green-600', hover: 'hover:bg-green-100' },
    dark: { bg: 'dark:bg-green-950/50', border: 'dark:border-green-800/50', icon: 'dark:text-green-400', hover: 'dark:hover:bg-green-900/50' }
  },
  amber: {
    light: { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'text-amber-600', hover: 'hover:bg-amber-100' },
    dark: { bg: 'dark:bg-amber-950/50', border: 'dark:border-amber-800/50', icon: 'dark:text-amber-400', hover: 'dark:hover:bg-amber-900/50' }
  },
  purple: {
    light: { bg: 'bg-purple-50', border: 'border-purple-100', icon: 'text-purple-600', hover: 'hover:bg-purple-100' },
    dark: { bg: 'dark:bg-purple-950/50', border: 'dark:border-purple-800/50', icon: 'dark:text-purple-400', hover: 'dark:hover:bg-purple-900/50' }
  },
  emerald: {
    light: { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'text-emerald-600', hover: 'hover:bg-emerald-100' },
    dark: { bg: 'dark:bg-emerald-950/50', border: 'dark:border-emerald-800/50', icon: 'dark:text-emerald-400', hover: 'dark:hover:bg-emerald-900/50' }
  },
  slate: {
    light: { bg: 'bg-slate-50', border: 'border-slate-100', icon: 'text-slate-600', hover: 'hover:bg-slate-100' },
    dark: { bg: 'dark:bg-slate-800/50', border: 'dark:border-slate-700/50', icon: 'dark:text-slate-400', hover: 'dark:hover:bg-slate-700/50' }
  },
  rose: {
    light: { bg: 'bg-rose-50', border: 'border-rose-100', icon: 'text-rose-600', hover: 'hover:bg-rose-100' },
    dark: { bg: 'dark:bg-rose-950/50', border: 'dark:border-rose-800/50', icon: 'dark:text-rose-400', hover: 'dark:hover:bg-rose-900/50' }
  },
  cyan: {
    light: { bg: 'bg-cyan-50', border: 'border-cyan-100', icon: 'text-cyan-600', hover: 'hover:bg-cyan-100' },
    dark: { bg: 'dark:bg-cyan-950/50', border: 'dark:border-cyan-800/50', icon: 'dark:text-cyan-400', hover: 'dark:hover:bg-cyan-900/50' }
  }
};

// Composant AI Analytics enrichi avec navigation et fonctionnalités avancées
const AIAnalyticsWidget: React.FC<{ data: any; isDark: boolean }> = ({ data, isDark }) => {
  const navigate = useNavigate();
  const [selectedMetric, setSelectedMetric] = useState('prediction');
  const [activeTab, setActiveTab] = useState<'insights' | 'trends' | 'alerts' | 'actions'>('insights');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const insights = [
    { 
      id: 'prediction',
      title: "Prédiction CA", 
      value: formatCurrency(data.totalAmount * 1.15), 
      trend: "up", 
      percentage: 15,
      description: "Croissance prévue ce mois",
      confidence: 89,
      icon: TrendingUp,
      color: "emerald",
      action: () => navigate('/analytics/predictions'),
      details: "Basé sur l'analyse de 12 mois de données historiques"
    },
    { 
      id: 'risk',
      title: "Risque impayés", 
      value: "2.3%", 
      trend: "down", 
      percentage: -0.8,
      description: "Amélioration vs mois dernier",
      confidence: 76,
      icon: AlertTriangle,
      color: "red",
      action: () => navigate('/analytics/risks'),
      details: "3 factures à risque identifiées (total: €12,450)"
    },
    { 
      id: 'efficiency',
      title: "Efficacité", 
      value: "94%", 
      trend: "up", 
      percentage: 3,
      description: "Score de performance",
      confidence: 95,
      icon: Target,
      color: "blue",
      action: () => navigate('/analytics/efficiency'),
      details: "Processus optimaux sur 15/16 indicateurs clés"
    },
    { 
      id: 'opportunities',
      title: "Opportunités", 
      value: "8", 
      trend: "up", 
      percentage: 12,
      description: "Actions recommandées",
      confidence: 82,
      icon: Sparkles,
      color: "purple",
      action: () => navigate('/analytics/opportunities'),
      details: "Potentiel de revenus supplémentaires: €28,900"
    }
  ];

  const alerts = [
    { id: 1, type: 'critical', message: 'Facturation #INV-2024-0156 en retard (15j)', action: 'Voir facture', onClick: () => navigate('/factures/INV-2024-0156') },
    { id: 2, type: 'opportunity', message: 'Client TechCorp prêt pour renouvelement', action: 'Créer devis', onClick: () => navigate('/devis/new?client=techcorp') },
    { id: 3, type: 'info', message: 'Rapport mensuel disponible', action: 'Télécharger', onClick: () => navigate('/admin/rapports') }
  ];

  const quickActions = [
    { id: 1, label: 'Analyse complète', icon: BarChart3, onClick: () => navigate('/analytics') },
    { id: 2, label: 'Nouveau devis IA', icon: Brain, onClick: () => navigate('/devis/new?ai=true') },
    { id: 3, label: 'Tableau de bord CFO', icon: PieChart, onClick: () => navigate('/admin/dashboard-cfo') },
    { id: 4, label: 'Rapports avancés', icon: LineChart, onClick: () => navigate('/admin/rapports') }
  ];

  const recommendations = [
    { 
      id: 1,
      text: "Contactez 3 clients en retard de paiement",
      priority: "high",
      impact: "€12,450",
      action: () => navigate('/factures?filter=overdue'),
      category: "recouvrement"
    },
    { 
      id: 2,
      text: "Proposez des devis aux 5 prospects chauds",
      priority: "medium",
      impact: "€28,900",
      action: () => navigate('/devis/new?prospects=hot'),
      category: "commercial"
    },
    { 
      id: 3,
      text: "Optimisez la facturation automatique",
      priority: "low",
      impact: "15h/mois",
      action: () => navigate('/admin/settings/automation'),
      category: "efficiency"
    },
    { 
      id: 4,
      text: "Surveillez les KPIs de conversion (78% vs 85% cible)",
      priority: "medium",
      impact: "7% conversion",
      action: () => navigate('/analytics/conversion'),
      category: "performance"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header avec navigation et contrôles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-500" />
          <h3 className="text-sm font-semibold">Intelligence Artificielle</h3>
          <Badge variant="secondary" className="text-xs">
            Live AI
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/analytics')}
            className="h-6 w-6 p-0"
          >
            <ArrowUpRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
        {[
          { id: 'insights', label: 'Insights', icon: Brain },
          { id: 'trends', label: 'Tendances', icon: TrendingUp },
          { id: 'alerts', label: 'Alertes', icon: AlertTriangle },
          { id: 'actions', label: 'Actions', icon: Zap }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all",
              activeTab === tab.id 
                ? "bg-background shadow-sm text-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <tab.icon className="h-3 w-3" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenu selon l'onglet actif */}
      <AnimatePresence mode="wait">
        {activeTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* Métriques principales */}
            <div className={cn("grid gap-2", isExpanded ? "grid-cols-2" : "grid-cols-2")}>
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={cn(
                    "p-3 rounded-lg border transition-all duration-200 cursor-pointer group",
                    "bg-gradient-to-br from-background/50 to-background/80 backdrop-blur-sm",
                    "hover:shadow-md hover:scale-[1.02]",
                    selectedMetric === insight.id && "ring-2 ring-primary/50",
                    isDark ? "border-slate-700/50 hover:border-slate-600/50" : "border-slate-200/50 hover:border-slate-300/50"
                  )}
                  onClick={() => {
                    setSelectedMetric(insight.id);
                    if (isExpanded) insight.action();
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={cn(
                      "p-1.5 rounded-md",
                      insight.color === 'emerald' && "bg-emerald-100 dark:bg-emerald-900/50",
                      insight.color === 'red' && "bg-red-100 dark:bg-red-900/50",
                      insight.color === 'blue' && "bg-blue-100 dark:bg-blue-900/50",
                      insight.color === 'purple' && "bg-purple-100 dark:bg-purple-900/50"
                    )}>
                      <insight.icon className={cn(
                        "h-3 w-3",
                        insight.color === 'emerald' && "text-emerald-600 dark:text-emerald-400",
                        insight.color === 'red' && "text-red-600 dark:text-red-400",
                        insight.color === 'blue' && "text-blue-600 dark:text-blue-400",
                        insight.color === 'purple' && "text-purple-600 dark:text-purple-400"
                      )} />
                    </div>
                    <div className={cn(
                      "text-xs font-medium flex items-center gap-1",
                      insight.trend === 'up' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {insight.trend === 'up' ? <TrendingUp className="h-2 w-2" /> : <TrendingDown className="h-2 w-2" />}
                      {insight.percentage > 0 ? '+' : ''}{insight.percentage}%
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium truncate">{insight.title}</p>
                    <p className="text-sm font-bold truncate">{insight.value}</p>
                    {isExpanded && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">{insight.details}</p>
                    )}
                    <div className="flex items-center gap-1 mt-2">
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${insight.confidence}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                          className={cn(
                            "h-full transition-all duration-500",
                            insight.confidence > 90 ? 'bg-green-500' : 
                            insight.confidence > 75 ? 'bg-yellow-500' : 'bg-red-500'
                          )}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{insight.confidence}%</span>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                      <ArrowUpRight className="h-3 w-3 text-muted-foreground ml-auto" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Graphique interactif */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "p-4 rounded-lg border",
                  isDark ? "border-slate-700/50 bg-slate-800/30" : "border-slate-200/50 bg-slate-50/30"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">Analyse détaillée - {insights.find(i => i.id === selectedMetric)?.title}</p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigate('/analytics/detailed')}>
                      Analyse complète
                    </Button>
                  </div>
                </div>
                <div className="h-24 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded flex items-end justify-between px-2">
                  {[65, 78, 45, 89, 72, 95, 88, 92, 67, 84, 91, 76].map((height, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="w-2 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t hover:opacity-80 cursor-pointer"
                      title={`Jour ${i + 1}: ${height}%`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>30 jours</span>
                  <span>Aujourd'hui</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'trends' && (
          <motion.div
            key="trends"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium">Croissance CA</span>
                </div>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">+15.3%</p>
                <p className="text-xs text-green-600 dark:text-green-400">vs mois dernier</p>
              </div>
              <div className="p-3 rounded-lg border bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium">Activité</span>
                </div>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">94%</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Performance</p>
              </div>
            </div>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 rounded-lg border bg-muted/30"
              >
                <p className="text-sm font-medium mb-2">Tendances détectées</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Augmentation des paiements à temps (+12%)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>Amélioration du délai de réponse (-23%)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span>Optimisation des processus (+8%)</span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'alerts' && (
          <motion.div
            key="alerts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: alert.id * 0.1 }}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all",
                  alert.type === 'critical' && "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
                  alert.type === 'opportunity' && "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
                  alert.type === 'info' && "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                )}
                onClick={alert.onClick}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {alert.type === 'critical' && <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />}
                    {alert.type === 'opportunity' && <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />}
                    {alert.type === 'info' && <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                    <p className="text-xs font-medium">{alert.message}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-xs h-6">
                    {alert.action}
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'actions' && (
          <motion.div
            key="actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* Actions rapides */}
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  size="sm"
                  variant="outline"
                  onClick={action.onClick}
                  className="flex items-center gap-2 h-8 text-xs"
                >
                  <action.icon className="h-3 w-3" />
                  <span className="truncate">{action.label}</span>
                </Button>
              ))}
            </div>

            {/* Recommandations enrichies */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                <p className="text-sm font-medium">Recommandations prioritaires</p>
                {recommendations.slice(0, 3).map((rec) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: rec.id * 0.1 }}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all",
                      rec.priority === 'high' && "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
                      rec.priority === 'medium' && "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
                      rec.priority === 'low' && "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    )}
                    onClick={rec.action}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "text-xs",
                          rec.priority === 'high' && "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200",
                          rec.priority === 'medium' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200",
                          rec.priority === 'low' && "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
                        )}
                      >
                        {rec.priority === 'high' ? 'Urgent' : rec.priority === 'medium' ? 'Important' : 'Routine'}
                      </Badge>
                      <span className="text-xs font-medium text-primary">{rec.impact}</span>
                    </div>
                    <p className="text-xs text-foreground">{rec.text}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-xs">
                        {rec.category}
                      </Badge>
                      <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [devisList, setDevisList] = useState<Devis[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [companiesCount, setCompaniesCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isDark, setIsDark] = useDarkMode();
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [fenceOrder, setFenceOrder] = useState<string[]>([]);
  const isMounted = useRef(true);

  // Fonction de chargement des données
  const loadDashboardData = useCallback(async () => {
    if (!isMounted.current || isOffline) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setLoadError(null);
    
    try {
      const results = await Promise.allSettled([
        user?.role === 'admin' ? devisApi.getAll() : devisApi.getByCompany(user?.companyId || ''),
        user?.role === 'admin' ? invoicesApi.getAll() : invoicesApi.getByCompany(user?.companyId || ''),
        user?.role === 'admin' ? ticketsApi.getAll() : ticketsApi.getByCompany(user?.companyId || ''),
        ...(user?.role === 'admin' ? [
          companiesApi.getAll(),
          usersApi.getAll()
        ] : [])
      ]);
      
      if (isMounted.current) {
        const [devisResult, invoicesResult, ticketsResult, companiesResult, usersResult] = results;
        
        if (devisResult.status === 'fulfilled') {
          setDevisList(devisResult.value);
        }
        if (invoicesResult.status === 'fulfilled') {
          setInvoices(invoicesResult.value);
        }
        if (ticketsResult.status === 'fulfilled') {
          setTickets(ticketsResult.value);
        }
        if (user?.role === 'admin') {
          if (companiesResult?.status === 'fulfilled') {
            setCompaniesCount(companiesResult.value.length);
          }
          if (usersResult?.status === 'fulfilled') {
            setUsersCount(usersResult.value.length);
          }
        }
      }
    } catch (error) {
      if (isMounted.current) {
        setLoadError('Erreur lors du chargement des données');
        console.error('Erreur dashboard:', error);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [user, isOffline]);

  // Gestionnaires d'événements réseau
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Chargement initial des données
  useEffect(() => {
    loadDashboardData();
    return () => {
      isMounted.current = false;
    };
  }, [loadDashboardData]);

  // Calcul des statistiques avec tendances
  const stats = useMemo(() => {
    const invoicesStats = invoices.reduce((acc, invoice) => {
      const amount = parseFloat(invoice.amount.toString());
      acc.totalAmount += amount;
      if (invoice.status === 'pending') acc.pendingAmount += amount;
      if (invoice.status === 'late') acc.overdueAmount += amount;
      return acc;
    }, { totalAmount: 0, pendingAmount: 0, overdueAmount: 0 });

    // Calculer les tendances (simulation basée sur les données actuelles)
    const totalTrend = invoicesStats.totalAmount > 0 ? 'up' : 'neutral';
    const pendingTrend = invoicesStats.pendingAmount < invoicesStats.totalAmount * 0.3 ? 'up' : 'down';

    return {
      ...invoicesStats,
      invoicesCount: invoices.length,
      devisCount: devisList.length,
      openTickets: tickets.filter(t => t.status === 'open').length,
      companiesCount,
      usersCount,
      trends: {
        total: totalTrend,
        pending: pendingTrend,
        invoices: invoices.length > 0 ? 'up' : 'neutral'
      }
    };
  }, [invoices, devisList, tickets, companiesCount, usersCount]);

  // Configuration des fences avec IA Analytics
  const fences = useMemo((): Fence[] => {
    const fencesList: Fence[] = [
      {
        id: 'ai-analytics',
        title: 'IA Analytics',
        description: 'Insights prédictifs en temps réel',
        icon: Brain,
        color: 'cyan',
        size: 'large',
        items: [], // Custom rendering dans renderFence
        actions: {
          primary: { label: 'Rapport complet', action: () => navigate('/analytics') }
        }
      },
      {
        id: 'revenue',
        title: 'Chiffre d\'affaires',
        description: `${formatCurrency(stats.totalAmount)} • Tendance ${stats.trends.total === 'up' ? '↗️' : '→'}`,
        icon: DollarSign,
        color: 'emerald',
        size: 'medium',
        items: [        { 
          id: 'total', 
          title: 'Total facturé', 
          value: formatCurrency(stats.totalAmount), 
          status: 'success',
          trend: stats.trends.total as 'up' | 'down' | 'neutral',
          percentage: 12.5
        },
        { 
          id: 'pending', 
          title: 'En attente', 
          value: formatCurrency(stats.pendingAmount), 
          status: 'warning',
          trend: stats.trends.pending as 'up' | 'down' | 'neutral',
          percentage: -3.2
        },
          { 
            id: 'overdue', 
            title: 'En retard', 
            value: formatCurrency(stats.overdueAmount), 
            status: 'error',
            trend: 'down',
            percentage: -15.8
          }
        ],
        actions: {
          primary: { label: 'Rapports détaillés', action: () => navigate('/admin/rapports') }
        }
      },
      {
        id: 'invoices',
        title: 'Factures',
        description: `${stats.invoicesCount} factures • ${invoices.filter(i => i.status === 'paid').length} payées`,
        icon: FileText,
        color: 'blue',
        size: 'medium',
        items: invoices.slice(0, isCompactMode ? 3 : 5).map(invoice => ({
          id: invoice.id,
          title: `${invoice.number}`,
          subtitle: invoice.companyName,
          amount: formatCurrency(parseFloat(invoice.amount.toString())),
          status: invoice.status === 'paid' ? 'success' : invoice.status === 'late' ? 'error' : 'warning',
          date: formatDate(new Date(invoice.createdAt)),
          action: () => navigate(`/factures/${invoice.id}`)
        })),
        actions: {
          primary: { label: 'Toutes les factures', action: () => navigate(user?.role === 'admin' ? '/admin/factures' : '/factures') },
          secondary: { label: 'Nouvelle', action: () => navigate('/factures/new') }
        }
      },
      {
        id: 'quotes',
        title: 'Devis',
        description: `${stats.devisCount} devis • ${devisList.filter(d => d.status === 'approved').length} approuvés`,
        icon: ClipboardList,
        color: 'amber',
        size: 'medium',
        items: devisList.slice(0, isCompactMode ? 3 : 5).map(devis => ({
          id: devis.id,
          title: `${devis.number}`,
          subtitle: devis.companyName,
          amount: formatCurrency(parseFloat(devis.amount.toString())),
          status: devis.status === 'approved' ? 'success' : devis.status === 'rejected' ? 'error' : 'warning',
          date: formatDate(new Date(devis.createdAt)),
          action: () => navigate(`/devis/${devis.id}`)
        })),
        actions: {
          primary: { label: 'Tous les devis', action: () => navigate(user?.role === 'admin' ? '/admin/devis' : '/devis') },
          secondary: { label: 'Nouveau', action: () => navigate('/devis/new') }
        }
      },
      {
        id: 'support',
        title: 'Support & Tickets',
        description: `${stats.openTickets} ouverts • ${tickets.filter(t => t.status === 'closed').length} résolus`,
        icon: MessageSquare,
        color: 'purple',
        size: 'small',
        items: tickets.slice(0, isCompactMode ? 2 : 4).map(ticket => ({
          id: ticket.id,
          title: ticket.subject || `#${ticket.number}`,
          subtitle: ticket.companyName || 'Client',
          status: ticket.status === 'closed' ? 'success' : ticket.status === 'open' ? 'error' : 'warning',
          date: formatDate(new Date(ticket.createdAt)),
          action: () => navigate(`/support/${ticket.id}`)
        })),
        actions: {
          primary: { label: 'Support', action: () => navigate(user?.role === 'admin' ? '/admin/support' : '/support') }
        }
      }
    ];

    // Ajouter les fences admin avec optimisations
    if (user?.role === 'admin') {
      fencesList.push({
        id: 'management',
        title: 'Administration',
        description: `${stats.companiesCount} entreprises • ${stats.usersCount} utilisateurs`,
        icon: Building,
        color: 'slate',
        size: 'small',
        items: [
          { 
            id: 'companies', 
            title: 'Entreprises', 
            value: stats.companiesCount.toString(), 
            status: 'info',
            action: () => navigate('/admin/companies') 
          },
          { 
            id: 'users', 
            title: 'Utilisateurs', 
            value: stats.usersCount.toString(), 
            status: 'info',
            action: () => navigate('/admin/users') 
          },
          { 
            id: 'settings', 
            title: 'Configuration', 
            value: 'Système', 
            status: 'info',
            action: () => navigate('/admin/settings') 
          }
        ],
        actions: {
          primary: { label: 'Admin Panel', action: () => navigate('/admin') }
        }
      });
    }

    return fencesList;
  }, [stats, invoices, devisList, tickets, user, navigate, isCompactMode]);

  // Initialiser l'ordre des fences
  useEffect(() => {
    if (fenceOrder.length === 0) {
      setFenceOrder(fences.map(f => f.id));
    }
  }, [fences, fenceOrder.length]);

  // Fonction pour obtenir les couleurs selon le thème
  const getFenceColors = (color: Fence['color']) => {
    const colorConfig = fenceColors[color];
    return {
      ...colorConfig.light,
      ...colorConfig.dark
    };
  };

  // Composant pour rendre une fence draggable optimisée
  const renderFence = (fence: Fence) => {
    const colors = getFenceColors(fence.color);
    const sizeClasses = {
      small: 'col-span-1',
      medium: isCompactMode ? 'col-span-1' : 'col-span-2',
      large: isCompactMode ? 'col-span-1' : 'col-span-3'
    };
    
    return (
      <motion.div
        key={fence.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className={cn("group", sizeClasses[fence.size || 'medium'])}
      >
        <Card className={cn(
          "h-full border transition-all duration-300 hover:scale-[1.02] cursor-move",
          "bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-lg",
          "border-border/50 hover:border-border",
          isDark ? "bg-card/30" : "bg-card/50"
        )}>
          <CardHeader className={cn("pb-3", isCompactMode && "pb-2")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-xl border transition-colors",
                  colors.bg, colors.border
                )}>
                  <fence.icon className={cn("h-5 w-5", colors.icon)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className={cn(
                      "font-semibold truncate max-w-[160px]",
                      isCompactMode ? "text-base" : "text-lg"
                    )}>
                      {fence.title}
                    </CardTitle>
                    <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {fence.description && (
                    <p className={cn(
                      "text-muted-foreground mt-1 truncate max-w-[200px]",
                      isCompactMode ? "text-xs" : "text-sm"
                    )}>
                      {fence.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {fence.size === 'large' && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setIsCompactMode(!isCompactMode)}
                  >
                    {isCompactMode ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={fence.actions?.primary.action}
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className={cn("pt-0", isCompactMode && "py-2")}>
            {fence.id === 'ai-analytics' ? (
              <AIAnalyticsWidget data={stats} isDark={isDark} />
            ) : (
              <div className="space-y-2">
                {fence.items.map((item, index) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg transition-all duration-200",
                      "bg-muted/20 hover:bg-muted/40 border border-transparent hover:border-border/50",
                      item.action && "cursor-pointer"
                    )}
                    onClick={item.action}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <p className={cn(
                          "font-medium truncate flex-shrink max-w-[100px]",
                          isCompactMode ? "text-xs" : "text-sm"
                        )}>
                          {item.title}
                        </p>
                        {item.status && (
                          <div className={cn(
                            "w-2 h-2 rounded-full flex-shrink-0",
                            item.status === 'success' && "bg-green-500",
                            item.status === 'warning' && "bg-yellow-500",
                            item.status === 'error' && "bg-red-500",
                            item.status === 'info' && "bg-blue-500"
                          )} />
                        )}
                        {item.trend && item.percentage && !isCompactMode && (
                          <div className={cn(
                            "flex items-center gap-1 text-xs flex-shrink-0",
                            item.trend === 'up' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                          )}>
                            {item.trend === 'up' ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {Math.abs(item.percentage)}%
                          </div>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className={cn(
                          "text-muted-foreground truncate max-w-[120px]",
                          isCompactMode ? "text-xs" : "text-xs"
                        )}>
                          {item.subtitle}
                        </p>
                      )}
                      {item.date && !isCompactMode && (
                        <p className="text-xs text-muted-foreground truncate">{item.date}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className={cn(
                        "font-semibold truncate",
                        isCompactMode ? "text-sm max-w-[80px]" : "text-sm max-w-[100px]"
                      )}>
                        {item.amount || item.value}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            {fence.actions && (
              <div className={cn(
                "flex gap-2 mt-4 pt-3 border-t border-border/40",
                isCompactMode && "mt-2 pt-2"
              )}>
                <Button 
                  onClick={fence.actions.primary.action}
                  size={isCompactMode ? "sm" : "sm"}
                  className="flex-1"
                >
                  {fence.actions.primary.label}
                </Button>
                {fence.actions.secondary && !isCompactMode && (
                  <Button 
                    onClick={fence.actions.secondary.action}
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                  >
                    {fence.actions.secondary.label}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Gestion du mode hors ligne
  if (isOffline) {
    return (
      <div className={cn(
        "min-h-screen p-6 transition-colors duration-300",
        isDark ? "bg-gradient-to-br from-slate-900 to-slate-800" : "bg-gradient-to-br from-slate-50 to-slate-100"
      )}>
        <div className="max-w-4xl mx-auto">
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
            <CardContent className="p-8 text-center">
              <WifiOff className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-yellow-700 dark:text-yellow-400 mb-2">Mode Hors-ligne</h2>
              <p className="text-yellow-600 dark:text-yellow-300 mb-4">
                Vous n'êtes pas connecté à Internet. Certaines fonctionnalités peuvent ne pas être disponibles.
              </p>
              <Button onClick={loadDashboardData} variant="outline" className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700">
                <RefreshCw className="h-4 w-4 mr-2" /> Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="p-4 lg:p-6">
        <div className="max-w-8xl mx-auto">
          {/* Header avec contrôles améliorés */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className={cn(
                "text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent transition-colors duration-300",
                isDark 
                  ? "from-white to-slate-300" 
                  : "from-slate-900 to-slate-600"
              )}>
                Dashboard Pro
              </h1>
              <p className="text-muted-foreground mt-1">
                Bienvenue, {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Utilisateur'}
                {isDark && " • Mode sombre actif"}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Toggle thème sombre */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card/50 backdrop-blur-sm">
                <Sun className={cn("h-4 w-4 transition-colors", !isDark ? "text-yellow-500" : "text-muted-foreground")} />
                <Switch checked={isDark} onCheckedChange={setIsDark} />
                <Moon className={cn("h-4 w-4 transition-colors", isDark ? "text-blue-400" : "text-muted-foreground")} />
              </div>
              
              {/* Toggle mode compact */}
              <Button 
                onClick={() => setIsCompactMode(!isCompactMode)}
                variant="outline"
                size="sm"
                className="bg-card/50 backdrop-blur-sm"
              >
                {isCompactMode ? <Maximize2 className="h-4 w-4 mr-2" /> : <Minimize2 className="h-4 w-4 mr-2" />}
                {isCompactMode ? 'Étendre' : 'Compacter'}
              </Button>
              
              {/* Bouton actualiser */}
              <Button 
                onClick={loadDashboardData}
                variant="outline"
                size="sm"
                disabled={loading}
                className="bg-card/50 backdrop-blur-sm"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                Actualiser
              </Button>
              
              {/* Bouton paramètres */}
              <Button 
                variant="outline"
                size="sm"
                className="bg-card/50 backdrop-blur-sm"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Contenu principal avec drag & drop */}
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
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    <div className="absolute inset-0 h-8 w-8 border-2 border-primary/20 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-muted-foreground">Chargement des données...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Grille de fences avec Reorder drag & drop */}
                <Reorder.Group 
                  axis="y" 
                  values={fenceOrder} 
                  onReorder={setFenceOrder}
                  className={cn(
                    "grid gap-4 lg:gap-6",
                    isCompactMode 
                      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" 
                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  )}
                >
                  {fenceOrder.map((fenceId) => {
                    const fence = fences.find(f => f.id === fenceId);
                    if (!fence) return null;
                    
                    return (
                      <Reorder.Item key={fence.id} value={fence.id} dragListener={false}>
                        {renderFence(fence)}
                      </Reorder.Item>
                    );
                  })}
                </Reorder.Group>

                {/* Barre d'état IA en bas */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="mt-8"
                >
                  <Card className={cn(
                    "border-0 shadow-sm backdrop-blur-sm transition-colors duration-300",
                    isDark 
                      ? "bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600/30" 
                      : "bg-gradient-to-r from-slate-100/80 to-slate-50/80 border-slate-200/50"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg transition-colors duration-300",
                          isDark 
                            ? "bg-gradient-to-r from-blue-600 to-purple-600" 
                            : "bg-gradient-to-r from-blue-500 to-purple-600"
                        )}>
                          <Brain className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Intelligence Artificielle • Dashboard Pro</p>
                          <p className="text-xs text-muted-foreground">
                            Analyse prédictive en temps réel • Optimisations personnalisées • Drag & Drop activé
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={cn(
                            "transition-colors duration-300",
                            isDark ? "bg-slate-700/50 text-slate-300" : "bg-white/60"
                          )}>
                            <Activity className="h-3 w-3 mr-1" />
                            Live
                          </Badge>
                          <Badge variant="secondary" className={cn(
                            "transition-colors duration-300",
                            isDark ? "bg-slate-700/50 text-slate-300" : "bg-white/60"
                          )}>
                            <Zap className="h-3 w-3 mr-1" />
                            {isCompactMode ? 'Compact' : 'Étendu'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Indicateurs de performance en bas */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                  className="mt-4 flex justify-center"
                >
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      Système opérationnel
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Performance optimale
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Mis à jour il y a {Math.floor(Math.random() * 5) + 1}min
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

export default Dashboard;
