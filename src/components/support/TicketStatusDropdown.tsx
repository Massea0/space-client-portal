// src/components/support/TicketStatusDropdown.tsx
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SafeSelectTrigger } from '@/components/ui/safe-triggers';
import { Ticket } from '@/types';

interface TicketStatusDropdownProps {
  currentStatus: Ticket['status'];
  onChange: (status: Ticket['status']) => void;
  disabled?: boolean;
}

/**
 * Dropdown pour modifier le statut d'un ticket
 */
const TicketStatusDropdown: React.FC<TicketStatusDropdownProps> = ({ 
  currentStatus, 
  onChange,
  disabled = false 
}) => {
  const statuses: Ticket['status'][] = [
    'open', 
    'in_progress', 
    'pending_client_response', 
    'pending_admin_response', 
    'resolved', 
    'closed'
  ];
  
  const statusLabels: Record<Ticket['status'], string> = {
    open: 'Ouvert',
    in_progress: 'En cours',
    pending_client_response: 'Attente client',
    pending_admin_response: 'Attente admin',
    resolved: 'Résolu',
    closed: 'Fermé'
  };

  return (
    <Select
      value={currentStatus}
      onValueChange={(value) => onChange(value as Ticket['status'])}
      disabled={disabled}
    >
      <SafeSelectTrigger className="w-full">
        <SelectValue placeholder="Sélectionner un statut" />
      </SafeSelectTrigger>
      <SelectContent>
        {statuses.map((status) => (
          <SelectItem key={status} value={status}>
            {statusLabels[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TicketStatusDropdown;
