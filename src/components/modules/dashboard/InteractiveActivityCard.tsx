// src/components/modules/dashboard/InteractiveActivityCard.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

export type ActivityItem = {
  id: string;
  title: string;
  description: string;
  date: Date | string;
  type: 'invoice' | 'quote' | 'ticket' | 'payment' | 'user' | 'company' | 'system';
  status?: string;
  link?: {
    url: string;
    label: string;
  };
};

interface InteractiveActivityCardProps {
  title: string;
  activities: ActivityItem[];
  emptyMessage?: string;
  maxItems?: number;
  className?: string;
  onViewAll?: () => void;
}

const ActivityTypeIcon = ({ type }: { type: ActivityItem['type'] }) => {
  const iconClass = "h-4 w-4";
  
  switch (type) {
    case 'invoice':
      return <span className={cn(iconClass, "text-blue-500")}>📄</span>;
    case 'quote':
      return <span className={cn(iconClass, "text-purple-500")}>📋</span>;
    case 'ticket':
      return <span className={cn(iconClass, "text-yellow-500")}>🎫</span>;
    case 'payment':
      return <span className={cn(iconClass, "text-green-500")}>💰</span>;
    case 'user':
      return <span className={cn(iconClass, "text-indigo-500")}>👤</span>;
    case 'company':
      return <span className={cn(iconClass, "text-orange-500")}>🏢</span>;
    case 'system':
      return <span className={cn(iconClass, "text-slate-500")}>⚙️</span>;
    default:
      return <span className={cn(iconClass, "text-gray-500")}>•</span>;
  }
};

const ActivityItemRow: React.FC<{ 
  activity: ActivityItem, 
  isExpanded: boolean, 
  toggleExpand: () => void 
}> = ({ activity, isExpanded, toggleExpand }) => {
  return (
    <div className="border-b border-slate-100 last:border-0">
      <div 
        className="flex items-start justify-between py-3 cursor-pointer hover:bg-slate-50 px-2 rounded-md transition-colors"
        onClick={toggleExpand}
      >
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <ActivityTypeIcon type={activity.type} />
          </div>
          <div>
            <h4 className="text-sm font-medium">{activity.title}</h4>
            <p className="text-xs text-muted-foreground">
              {formatDate(new Date(activity.date))}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activity.status && (
            <Badge 
              className={cn(
                "text-xs",
                activity.status === 'completed' && "bg-green-100 text-green-800",
                activity.status === 'pending' && "bg-yellow-100 text-yellow-800",
                activity.status === 'failed' && "bg-red-100 text-red-800"
              )}
            >
              {activity.status}
            </Badge>
          )}
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="px-9 pb-4"
          >
            <p className="text-sm text-slate-600 mb-2">{activity.description}</p>
            {activity.link && (
              <a 
                href={activity.link.url} 
                className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
              >
                {activity.link.label}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InteractiveActivityCard: React.FC<InteractiveActivityCardProps> = ({
  title,
  activities,
  emptyMessage = "Aucune activité récente",
  maxItems = 5,
  className,
  onViewAll
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  
  const displayedActivities = showAll 
    ? activities 
    : activities.slice(0, maxItems);
  
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle className="text-lg flex justify-between items-center">
          {title}
          {onViewAll && (
            <Button variant="outline" size="sm" onClick={onViewAll}>
              Tout voir
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-1">
            {displayedActivities.map((activity) => (
              <ActivityItemRow 
                key={activity.id}
                activity={activity}
                isExpanded={expandedId === activity.id}
                toggleExpand={() => toggleExpand(activity.id)}
              />
            ))}
          </div>
        )}
        
        {!onViewAll && activities.length > maxItems && (
          <div className="flex justify-center mt-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? (
                <>Afficher moins <ChevronUp className="ml-1 h-4 w-4" /></>
              ) : (
                <>Afficher plus <ChevronDown className="ml-1 h-4 w-4" /></>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InteractiveActivityCard;
