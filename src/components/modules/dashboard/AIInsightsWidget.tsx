// src/components/modules/dashboard/AIInsightsWidget.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Zap,
  RefreshCw,
  Eye,
  Lightbulb,
  Target,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface AIInsight {
  id: string;
  type: 'recommendation' | 'alert' | 'prediction' | 'analysis';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
  trend?: 'up' | 'down' | 'stable';
  value?: string;
  change?: string;
  timestamp: Date;
  actionable?: boolean;
}

interface AIInsightsWidgetProps {
  refreshInterval?: number;
  maxInsights?: number;
  showTrends?: boolean;
  darkMode?: boolean;
  onInsightClick?: (insight: AIInsight) => void;
  onTakeAction?: (insightId: string) => void;
}

const MOCK_INSIGHTS: AIInsight[] = [
  {
    id: '1',
    type: 'recommendation',
    title: 'Optimisation des factures',
    description: 'Les factures envoyées le mardi ont 23% plus de chances d\'être payées rapidement.',
    confidence: 87,
    impact: 'high',
    urgency: 'medium',
    trend: 'up',
    value: '+23%',
    change: 'vs. autres jours',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    actionable: true
  },
  {
    id: '2',
    type: 'alert',
    title: 'Risque de retard client',
    description: 'Le client TechCorp présente des signes de retard de paiement basés sur ses patterns historiques.',
    confidence: 92,
    impact: 'high',
    urgency: 'high',
    trend: 'down',
    value: '€15,240',
    change: 'à risque',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    actionable: true
  },
  {
    id: '3',
    type: 'prediction',
    title: 'Prévision revenus Q4',
    description: 'Basé sur les tendances actuelles, vos revenus Q4 devraient dépasser l\'objectif de 12%.',
    confidence: 78,
    impact: 'medium',
    urgency: 'low',
    trend: 'up',
    value: '+12%',
    change: 'vs. objectif',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    actionable: false
  },
  {
    id: '4',
    type: 'analysis',
    title: 'Performance support client',
    description: 'Le temps de résolution moyen a diminué de 18% ce mois-ci grâce aux nouvelles procédures.',
    confidence: 95,
    impact: 'medium',
    urgency: 'low',
    trend: 'up',
    value: '-18%',
    change: 'temps résolution',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    actionable: false
  }
];

export const AIInsightsWidget: React.FC<AIInsightsWidgetProps> = ({
  refreshInterval = 300000, // 5 minutes
  maxInsights = 4,
  showTrends = true,
  darkMode = true,
  onInsightClick,
  onTakeAction
}) => {
  const [insights, setInsights] = useState<AIInsight[]>(MOCK_INSIGHTS.slice(0, maxInsights));
  const [loading, setLoading] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

  const refreshInsights = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Rotate insights to simulate new data
    const shuffled = [...MOCK_INSIGHTS].sort(() => 0.5 - Math.random());
    setInsights(shuffled.slice(0, maxInsights));
    setLoading(false);
  };

  useEffect(() => {
    const interval = setInterval(refreshInsights, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'recommendation':
        return Lightbulb;
      case 'alert':
        return AlertTriangle;
      case 'prediction':
        return Target;
      case 'analysis':
        return Brain;
      default:
        return Zap;
    }
  };

  const getInsightColor = (type: AIInsight['type'], urgency: AIInsight['urgency']) => {
    if (urgency === 'high' && type === 'alert') return 'text-red-400';
    if (urgency === 'high') return 'text-orange-400';
    if (type === 'recommendation') return 'text-blue-400';
    if (type === 'prediction') return 'text-purple-400';
    if (type === 'analysis') return 'text-green-400';
    return 'text-gray-400';
  };

  const getBadgeVariant = (urgency: AIInsight['urgency']) => {
    switch (urgency) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `il y a ${hours}h`;
    return `il y a ${minutes}min`;
  };

  return (
    <div className={cn(
      "h-full flex flex-col",
      darkMode ? "text-gray-100" : "text-gray-900"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold text-sm">Insights IA</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshInsights}
          disabled={loading}
          className="h-8 w-8 p-0 hover:bg-gray-800/50"
        >
          <RefreshCw className={cn(
            "h-4 w-4",
            loading && "animate-spin"
          )} />
        </Button>
      </div>

      {/* Insights List */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {insights.map((insight, index) => {
            const IconComponent = getInsightIcon(insight.type);
            const iconColor = getInsightColor(insight.type, insight.urgency);
            
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 25 
                }}
                className={cn(
                  "relative p-3 rounded-lg border transition-all duration-200 cursor-pointer",
                  "bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/60 hover:border-gray-600/50",
                  selectedInsight === insight.id && "ring-2 ring-blue-500/30 border-blue-500/50"
                )}
                onClick={() => {
                  setSelectedInsight(selectedInsight === insight.id ? null : insight.id);
                  onInsightClick?.(insight);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-1.5 rounded-full",
                    insight.urgency === 'high' ? 'bg-red-500/20' :
                    insight.urgency === 'medium' ? 'bg-yellow-500/20' : 'bg-blue-500/20'
                  )}>
                    <IconComponent className={cn("h-4 w-4", iconColor)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium truncate">{insight.title}</h4>
                      {showTrends && insight.trend && (
                        <div className="flex items-center gap-1">
                          {insight.trend === 'up' ? 
                            <TrendingUp className="h-3 w-3 text-green-400" /> :
                            insight.trend === 'down' ?
                            <TrendingDown className="h-3 w-3 text-red-400" /> :
                            <div className="w-3 h-0.5 bg-gray-500 rounded" />
                          }
                          {insight.value && (
                            <span className={cn(
                              "text-xs font-medium",
                              insight.trend === 'up' ? 'text-green-400' : 
                              insight.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                            )}>
                              {insight.value}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-400 leading-relaxed mb-2">
                      {insight.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={getBadgeVariant(insight.urgency)}
                          className="text-xs h-5"
                        >
                          {insight.urgency}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(insight.timestamp)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Confidence indicator */}
                        <div className="flex items-center gap-1">
                          <div className="w-12 h-1 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              className={cn(
                                "h-full rounded-full",
                                insight.confidence >= 80 ? 'bg-green-500' :
                                insight.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              )}
                              initial={{ width: 0 }}
                              animate={{ width: `${insight.confidence}%` }}
                              transition={{ duration: 0.8, delay: index * 0.1 }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{insight.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded actions */}
                <AnimatePresence>
                  {selectedInsight === insight.id && insight.actionable && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 pt-3 border-t border-gray-700/50"
                    >
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTakeAction?.(insight.id);
                          }}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Appliquer
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-3 text-xs border-gray-600 hover:bg-gray-800/50"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle "learn more" action
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Détails
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Loading state */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center rounded-lg"
          >
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Analyse en cours...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIInsightsWidget;
