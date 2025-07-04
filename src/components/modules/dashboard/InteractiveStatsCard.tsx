// src/components/modules/dashboard/InteractiveStatsCard.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideProps } from 'lucide-react';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InteractiveStatsCardProps {
  title: string;
  value: string;
  icon: React.ElementType<LucideProps>;
  description?: string;
  details?: React.ReactNode;
  color?: 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  onClick?: () => void;
  className?: string;
  actions?: React.ReactNode;
}

const InteractiveStatsCard: React.FC<InteractiveStatsCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  details,
  color = 'default',
  onClick,
  className,
  actions
}) => {
  const [expanded, setExpanded] = useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  
  // Gestionnaire pour fermer la carte quand on clique en dehors
  React.useEffect(() => {
    if (!expanded) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setExpanded(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expanded]);
  
  // Couleurs pour les différentes variantes
  const colorVariants = {
    default: "bg-white border-slate-200 hover:border-slate-300",
    blue: "bg-blue-50 border-blue-200 hover:border-blue-300",
    green: "bg-green-50 border-green-200 hover:border-green-300",
    yellow: "bg-yellow-50 border-yellow-200 hover:border-yellow-300",
    red: "bg-red-50 border-red-200 hover:border-red-300",
    purple: "bg-purple-50 border-purple-200 hover:border-purple-300"
  };
  
  const iconColorVariants = {
    default: "text-slate-800",
    blue: "text-blue-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
    purple: "text-purple-600"
  };

  return (
    <motion.div
      // Animation locale pour éviter d'affecter les autres cartes
      animate={{ 
        opacity: 1,
        scale: 1
      }}
      initial={{ 
        opacity: 0,
        scale: 0.95
      }}
      exit={{ 
        opacity: 0,
        scale: 0.95
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      ref={cardRef}
    >
      <Card 
        className={cn(
          "overflow-hidden transition-all duration-300 hover:shadow-md rounded-xl h-full flex flex-col",
          expanded ? "shadow-md border-primary/50" : "cursor-pointer hover:scale-[1.01]",
          colorVariants[color],
          className
        )}
        onClick={expanded ? undefined : () => {
          if (onClick) {
            onClick();
          } else {
            setExpanded(true);
          }
        }}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Icon className={cn("h-5 w-5", iconColorVariants[color])} />
            {expanded && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full" 
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(false);
                }}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1">
          <div className="text-2xl font-bold">{value}</div>
          {description && !expanded && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          
          <AnimatePresence initial={false}>
            {expanded && details && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="mt-4"
              >
                <CardDescription className="text-sm mb-4">{description}</CardDescription>
                {details}
                
                {actions && (
                  <div className="flex items-center justify-end gap-2 mt-4">
                    {actions}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default InteractiveStatsCard;
