// src/components/modules/dashboard/AIInsightsCard.tsx
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
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  priority?: number;
}

interface AIInsightsCardProps {
  title?: string;
  insights?: AIInsight[];
  maxInsights?: number;
  refreshInterval?: number;
  showTrends?: boolean;
  darkMode?: boolean;
  compact?: boolean;
  onInsightClick?: (insight: AIInsight) => void;
  onTakeAction?: (insightId: string) => void;
  onRefresh?: () => void;
  className?: string;
}

const MOCK_INSIGHTS: AIInsight[] = [
  {
    id: '1',
    type: 'recommendation',
    title: 'Optimisation des factures',
    description: 'Envoyer les factures le mardi augmente le taux de paiement de 23%. Pattern identifié sur 6 mois de données.',
    confidence: 87,
    impact: 'high',
    urgency: 'medium',
    trend: 'up',
    value: '+23%',
    change: 'vs. autres jours',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    actionable: true,
    priority: 1
  },
  {
    id: '2',
    type: 'alert',
    title: 'Risque de retard client',
    description: 'TechCorp Ltd présente des signaux de retard de paiement basés sur l\'historique comportemental.',
    confidence: 92,
    impact: 'high',
    urgency: 'high',
    trend: 'down',
    value: '€15,240',
    change: 'à risque',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    actionable: true,
    priority: 1
  },
  {
    id: '3',
    type: 'prediction',
    title: 'Prévision revenus Q4',
    description: 'Analyse prédictive indique un dépassement de 12% de l\'objectif Q4 basé sur la trajectoire actuelle.',
    confidence: 78,
    impact: 'medium',
    urgency: 'low',
    trend: 'up',
    value: '+12%',
    change: 'vs. objectif',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    actionable: false,
    priority: 2
  },
  {
    id: '4',
    type: 'analysis',
    title: 'Performance support optimisée',
    description: 'Réduction de 18% du temps de résolution grâce aux nouvelles procédures IA-assistées.',
    confidence: 95,
    impact: 'medium',  
    urgency: 'low',
    trend: 'up',
    value: '-18%',
    change: 'temps résolution',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    actionable: false,
    priority: 3
  }
];

export const AIInsightsCard: React.FC<AIInsightsCardProps> = ({
  title = "Insights IA",
  insights: propInsights,
  maxInsights = 3,
  refreshInterval = 300000, // 5 minutes
  showTrends = true,
  darkMode = false,
  compact = false,
  onInsightClick,
  onTakeAction,
  onRefresh,
  className
}) => {
  const [insights, setInsights] = useState<AIInsight[]>(
    (propInsights || MOCK_INSIGHTS)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .slice(0, maxInsights)
  );
  const [loading, setLoading] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

  const refreshInsights = async () => {
    setLoading(true);
    
    if (onRefresh) {
      onRefresh();
    } else {
      // Simulate API call with realistic delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Rotate insights to simulate new data
      const shuffled = [...MOCK_INSIGHTS].sort(() => 0.5 - Math.random());
      setInsights(shuffled.slice(0, maxInsights));
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(refreshInsights, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  useEffect(() => {
    if (propInsights) {
      setInsights(
        propInsights
          .sort((a, b) => (b.priority || 0) - (a.priority || 0))
          .slice(0, maxInsights)
      );
    }
  }, [propInsights, maxInsights]);

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
    if (urgency === 'high' && type === 'alert') return darkMode ? 'text-red-400' : 'text-red-600';
    if (urgency === 'high') return darkMode ? 'text-orange-400' : 'text-orange-600';
    if (type === 'recommendation') return darkMode ? 'text-blue-400' : 'text-blue-600';
    if (type === 'prediction') return darkMode ? 'text-purple-400' : 'text-purple-600';
    if (type === 'analysis') return darkMode ? 'text-green-400' : 'text-green-600';
    return darkMode ? 'text-gray-400' : 'text-gray-600';
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
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `il y a ${days}j`;
    if (hours > 0) return `il y a ${hours}h`;
    return `il y a ${minutes}min`;
  };

  const cardClasses = cn(
    "h-full",
    darkMode ? "bg-gray-900/95 border-gray-800/50 text-gray-100" : "bg-white border-gray-200",
    "backdrop-blur-sm shadow-lg transition-all duration-300",
    className
  );

  const contentClasses = cn(
    "space-y-3",
    compact ? "p-3" : "p-4"
  );

  return (
    <Card className={cardClasses}>
      <CardHeader className={cn(
        "flex flex-row items-center justify-between space-y-0",
        compact ? "p-3 pb-0" : "p-4 pb-0"
      )}>
        <CardTitle className={cn(
          "flex items-center gap-2",
          compact ? "text-sm" : "text-base"
        )}>
          <Brain className={cn(
            darkMode ? "text-blue-400" : "text-blue-600",
            compact ? "h-4 w-4" : "h-5 w-5"
          )} />
          {title}
          <Sparkles className={cn(
            "text-yellow-400 animate-pulse",
            compact ? "h-3 w-3" : "h-4 w-4"
          )} />
        </CardTitle>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshInsights}
          disabled={loading}
          className={cn(
            "h-8 w-8 p-0",
            darkMode ? "hover:bg-gray-800/50" : "hover:bg-gray-100"
          )}
        >
          <RefreshCw className={cn(
            "h-4 w-4",
            loading && "animate-spin"
          )} />
        </Button>
      </CardHeader>

      <CardContent className={contentClasses}>
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
                  "relative p-3 rounded-lg border transition-all duration-200 cursor-pointer group",
                  darkMode 
                    ? "bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/60 hover:border-gray-600/50" 
                    : "bg-gray-50/50 border-gray-200 hover:bg-gray-100/50 hover:border-gray-300",
                  selectedInsight === insight.id && (darkMode 
                    ? "ring-2 ring-blue-500/30 border-blue-500/50" 
                    : "ring-2 ring-blue-500/20 border-blue-500")
                )}
                onClick={() => {
                  setSelectedInsight(selectedInsight === insight.id ? null : insight.id);
                  onInsightClick?.(insight);
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Priority indicator */}
                  {insight.priority === 1 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                  
                  <div className={cn(
                    "p-1.5 rounded-full shrink-0",
                    insight.urgency === 'high' ? (darkMode ? 'bg-red-500/20' : 'bg-red-100') :
                    insight.urgency === 'medium' ? (darkMode ? 'bg-yellow-500/20' : 'bg-yellow-100') : 
                    (darkMode ? 'bg-blue-500/20' : 'bg-blue-100')
                  )}>
                    <IconComponent className={cn("h-4 w-4", iconColor)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={cn(
                        "font-medium truncate",
                        compact ? "text-xs" : "text-sm"
                      )}>
                        {insight.title}
                      </h4>
                      
                      {showTrends && insight.trend && (
                        <div className="flex items-center gap-1 shrink-0 ml-2">
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
                    
                    <p className={cn(
                      "leading-relaxed mb-2",
                      compact ? "text-xs" : "text-xs",
                      darkMode ? "text-gray-400" : "text-gray-600"
                    )}>
                      {compact ? 
                        insight.description.slice(0, 80) + (insight.description.length > 80 ? '...' : '') :
                        insight.description
                      }
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={getBadgeVariant(insight.urgency)}
                          className="text-xs h-5"
                        >
                          {insight.urgency}
                        </Badge>
                        <div className={cn(
                          "flex items-center gap-1 text-xs",
                          darkMode ? "text-gray-500" : "text-gray-500"
                        )}>
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(insight.timestamp)}
                        </div>
                      </div>
                      
                      {/* Confidence indicator */}
                      <div className="flex items-center gap-1">
                        <div className={cn(
                          "w-8 h-1 rounded-full overflow-hidden",
                          darkMode ? "bg-gray-700" : "bg-gray-200"
                        )}>
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
                        <span className={cn(
                          "text-xs",
                          darkMode ? "text-gray-500" : "text-gray-500"
                        )}>
                          {insight.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded actions */}
                <AnimatePresence>
                  {selectedInsight === insight.id && insight.actionable && !compact && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "mt-3 pt-3 border-t",
                        darkMode ? "border-gray-700/50" : "border-gray-200"
                      )}
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
                          className={cn(
                            "h-7 px-3 text-xs",
                            darkMode 
                              ? "border-gray-600 hover:bg-gray-800/50" 
                              : "border-gray-300 hover:bg-gray-100"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Détails
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hover effect arrow */}
                <motion.div
                  className={cn(
                    "absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}
                  initial={false}
                  animate={{ x: selectedInsight === insight.id ? 0 : -5 }}
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Loading overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                "absolute inset-0 flex items-center justify-center rounded-lg",
                darkMode ? "bg-gray-900/60" : "bg-white/60",
                "backdrop-blur-sm"
              )}
            >
              <div className={cn(
                "flex items-center gap-2 text-sm",
                darkMode ? "text-gray-300" : "text-gray-600"
              )}>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Analyse IA en cours...
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!loading && insights.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "text-center py-8",
              darkMode ? "text-gray-400" : "text-gray-500"
            )}
          >
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun insight disponible</p>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshInsights}
              className="mt-2"
            >
              Actualiser
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsightsCard;
