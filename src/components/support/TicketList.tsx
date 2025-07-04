// src/components/support/TicketList.tsx
import React from 'react';
import { Ticket } from '@/types';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { EyeIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import TicketStatusBadge from './TicketStatusBadge';
import TicketPriorityBadge from './TicketPriorityBadge';

interface TicketListProps {
  tickets: Ticket[];
  isAdmin?: boolean;
  onTicketClick: (ticketId: string) => void;
}

/**
 * Composant de liste de tickets partagé entre les interfaces admin et client
 * Utilise un style tabulaire cohérent pour l'affichage
 */
const TicketList: React.FC<TicketListProps> = ({ 
  tickets, 
  isAdmin = false, 
  onTicketClick 
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Sujet</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Priorité</TableHead>
            <TableHead>Date de création</TableHead>
            {isAdmin && <TableHead>Client</TableHead>}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.length === 0 && (
            <TableRow>
              <TableCell colSpan={isAdmin ? 7 : 6} className="h-24 text-center">
                Aucun ticket trouvé.
              </TableCell>
            </TableRow>
          )}
          {tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell className="font-medium">#{ticket.id.slice(0, 8)}</TableCell>
              <TableCell>{ticket.subject}</TableCell>
              <TableCell>
                <TicketStatusBadge status={ticket.status} />
              </TableCell>
              <TableCell>
                <TicketPriorityBadge priority={ticket.priority} />
              </TableCell>
              <TableCell>{formatDate(ticket.createdAt)}</TableCell>
              {isAdmin && <TableCell>{ticket.companyName}</TableCell>}
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onTicketClick(ticket.id)}
                >
                  <EyeIcon className="mr-2 h-4 w-4" />
                  Voir détails
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TicketList;
