// src/components/support/TicketPriorityBadge.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Ticket } from '@/types';

interface TicketPriorityBadgeProps {
  priority: Ticket['priority'];
  className?: string;
}

/**
 * Affiche un badge coloré en fonction de la priorité du ticket
 */
const TicketPriorityBadge: React.FC<TicketPriorityBadgeProps> = ({ priority, className }) => {
  const variants: { [key in Ticket['priority']]: string } = {
    low: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-600 dark:text-orange-100',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'
  };

  const labels: { [key in Ticket['priority']]: string } = {
    low: 'Faible',
    medium: 'Moyenne',
    high: 'Élevée',
    urgent: 'Urgente'
  };

  return (
    <Badge className={cn(variants[priority], className)}>
      {labels[priority]}
    </Badge>
  );
};

export default TicketPriorityBadge;
