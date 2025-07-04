// src/components/analytics/PredictionCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

interface PredictionCardProps {
  id: string;
  title: string;
  current: number;
  predicted: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  icon: React.ComponentType<any>;
  color?: string;
  currencyFormat?: boolean;
  percentFormat?: boolean;
  delay?: number;
  onClick?: () => void;
}

const PredictionCard: React.FC<PredictionCardProps> = ({
  id,
  title,
  current,
  predicted,
  confidence,
  trend,
  change,
  icon: Icon,
  color = 'blue',
  currencyFormat = false,
  percentFormat = false,
  delay = 0,
  onClick
}) => {
  const formatValue = (value: number) => {
    if (currencyFormat) return formatCurrency(value);
    if (percentFormat) return `${value.toFixed(1)}%`;
    return value.toLocaleString('fr-FR');
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-500/10 text-emerald-600';
      case 'red': return 'bg-red-500/10 text-red-600';
      case 'blue': return 'bg-blue-500/10 text-blue-600';
      case 'purple': return 'bg-purple-500/10 text-purple-600';
      case 'amber': return 'bg-amber-500/10 text-amber-600';
      default: return 'bg-blue-500/10 text-blue-600';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4" />;
      case 'down': return <TrendingDown className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendClass = () => {
    switch (trend) {
      case 'up': return 'text-emerald-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.1 }}
      className="h-full"
    >
      <Card 
        className={cn(
          "h-full border overflow-hidden",
          onClick ? "cursor-pointer hover:shadow-md transition-shadow duration-200" : ""
        )}
        onClick={onClick}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className={cn("p-2 rounded-lg", getColorClass(color))}>
                <Icon className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg font-medium">{title}</CardTitle>
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                "flex items-center gap-1 font-medium",
                confidence >= 80 ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
                confidence >= 60 ? "text-amber-600 bg-amber-50 border-amber-200" :
                "text-red-600 bg-red-50 border-red-200"
              )}
            >
              {confidence}% confiance
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-2 space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-muted-foreground">Actuel</p>
                <p className="text-2xl font-bold">{formatValue(current)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Prédiction</p>
                <p className="text-2xl font-bold text-blue-600">{formatValue(predicted)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className={cn("flex items-center gap-1", getTrendClass())}>
                {getTrendIcon()}
                <span className="text-sm font-medium">
                  {change > 0 ? '+' : ''}{percentFormat ? change : change.toFixed(1)}%
                </span>
              </p>
              {onClick && (
                <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PredictionCard;
