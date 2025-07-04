// src/components/support/TicketPriorityDropdown.tsx
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

interface TicketPriorityDropdownProps {
  currentPriority: Ticket['priority'];
  onChange: (priority: Ticket['priority']) => void;
  disabled?: boolean;
}

/**
 * Dropdown pour modifier la priorité d'un ticket
 */
const TicketPriorityDropdown: React.FC<TicketPriorityDropdownProps> = ({ 
  currentPriority, 
  onChange,
  disabled = false
}) => {
  const priorities: Ticket['priority'][] = ['low', 'medium', 'high', 'urgent'];
  
  const priorityLabels: Record<Ticket['priority'], string> = {
    low: 'Faible',
    medium: 'Moyenne',
    high: 'Élevée',
    urgent: 'Urgente'
  };

  return (
    <Select
      value={currentPriority}
      onValueChange={(value) => onChange(value as Ticket['priority'])}
      disabled={disabled}
    >
      <SafeSelectTrigger className="w-full">
        <SelectValue placeholder="Sélectionner une priorité" />
      </SafeSelectTrigger>
      <SelectContent>
        {priorities.map((priority) => (
          <SelectItem key={priority} value={priority}>
            {priorityLabels[priority]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TicketPriorityDropdown;
