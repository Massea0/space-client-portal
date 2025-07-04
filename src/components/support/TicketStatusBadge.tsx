// src/components/support/TicketStatusBadge.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Ticket } from '@/types';

interface TicketStatusBadgeProps {
  status: Ticket['status'];
  className?: string;
}

/**
 * Affiche un badge coloré en fonction du statut du ticket
 */
const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({ status, className }) => {
  const variants: { [key in Ticket['status']]: string } = {
    open: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200',
    in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    pending_admin_response: 'bg-purple-100 text-purple-800 dark:bg-purple-600 dark:text-purple-100',
    pending_client_response: 'bg-pink-100 text-pink-800 dark:bg-pink-600 dark:text-pink-100'
  };

  const labels: { [key in Ticket['status']]: string } = {
    open: 'Ouvert', 
    in_progress: 'En cours', 
    resolved: 'Résolu', 
    closed: 'Fermé',
    pending_admin_response: 'Attente Admin', 
    pending_client_response: 'Attente Client'
  };

  return (
    <Badge className={cn(variants[status], className)}>
      {labels[status]}
    </Badge>
  );
};

export default TicketStatusBadge;
