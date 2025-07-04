// src/components/support/TicketCard.tsx
import React from 'react';
import { Ticket } from '@/types';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { 
  EyeIcon, 
  CalendarIcon,
  MessageSquare
} from 'lucide-react';
import { AnimatedCard } from '@/components/ui/animated-card';
import TicketStatusBadge from './TicketStatusBadge';
import TicketPriorityBadge from './TicketPriorityBadge';

interface TicketCardProps {
  ticket: Ticket; 
  onTicketClick: (ticketId: string) => void;
  className?: string;
}

/**
 * Composant de carte pour l'affichage des tickets côté client
 * Inclut une interface claire avec un bouton d'action visible
 */
const TicketCard: React.FC<TicketCardProps> = ({ 
  ticket, 
  onTicketClick,
  className 
}) => {
  return (
    <AnimatedCard className={`p-4 space-y-3 ${className || ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">#{ticket.id.slice(0, 8)}</h3>
        <TicketStatusBadge status={ticket.status} />
      </div>
      
      <p className="text-gray-800 font-medium">{ticket.subject}</p>
      
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center">
          <CalendarIcon className="mr-1 h-4 w-4" />
          <span>{formatDate(ticket.createdAt)}</span>
        </div>
        
        <div className="flex items-center">
          <MessageSquare className="mr-1 h-4 w-4" />
          <span>{ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-2">
        <TicketPriorityBadge priority={ticket.priority} />
        
        <Button 
          variant="outline" 
          onClick={() => onTicketClick(ticket.id)}
        >
          <EyeIcon className="mr-2 h-4 w-4" />
          Voir détails
        </Button>
      </div>
    </AnimatedCard>
  );
};

export default TicketCard;
