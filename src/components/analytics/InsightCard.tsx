// src/components/analytics/InsightCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, AlertTriangle, Info, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface InsightCardProps {
  type: string;
  title: string;
  description: string;
  impact: string;
  effort?: string;
  priority?: number;
  delay?: number;
}

const InsightCard: React.FC<InsightCardProps> = ({
  type,
  title,
  description,
  impact,
  effort,
  priority,
  delay = 0
}) => {
  const getTypeIcon = () => {
    switch (type.toLowerCase()) {
      case 'opportunity': return <Zap className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'info': return <Info className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getTypeColor = () => {
    switch (type.toLowerCase()) {
      case 'opportunity': return 'text-emerald-500 bg-emerald-50 border-emerald-200';
      case 'warning': return 'text-amber-500 bg-amber-50 border-amber-200';
      case 'info': return 'text-blue-500 bg-blue-50 border-blue-200';
      default: return 'text-purple-500 bg-purple-50 border-purple-200';
    }
  };

  const getImpactColor = () => {
    const impactLower = impact.toLowerCase();
    if (impactLower.includes('haut')) return 'text-red-600 bg-red-50 border-red-200';
    if (impactLower.includes('moyen')) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  const getEffortColor = () => {
    if (!effort) return '';
    
    const effortLower = effort.toLowerCase();
    if (effortLower.includes('haut')) return 'text-red-600 bg-red-50 border-red-200';
    if (effortLower.includes('moyen')) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.1 }}
    >
      <Card className="h-full hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-5 h-full">
          <div className="flex items-start gap-4 h-full">
            <div className={cn("p-2 rounded-lg", getTypeColor())}>
              {getTypeIcon()}
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold">{title}</h3>
                {priority && (
                  <Badge variant="outline" className="text-xs font-normal">
                    Priorité {priority}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
              <div className="flex items-center gap-2 pt-2">
                <Badge variant="outline" className={cn("text-xs font-normal", getImpactColor())}>
                  Impact: {impact}
                </Badge>
                {effort && (
                  <Badge variant="outline" className={cn("text-xs font-normal", getEffortColor())}>
                    Effort: {effort}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default InsightCard;
