/**
 * @deprecated Ce composant a été migré vers les composants de support.
 * Veuillez utiliser '@/components/support/TicketCard' à la place.
 */

import TicketCard from '@/components/support/TicketCard';
export { TicketCard };
export default TicketCard;

// Affichage d'un message de dépréciation pour faciliter le débogage
console.warn('[Deprecation] Le composant depuis @/components/tickets/TicketCard.tsx est obsolète. ' +
             'Utilisez @/components/support/TicketCard à la place.');
  onSelect,
  index = 0
}) => {
  // Obtenir le badge de statut
  const getStatusBadge = () => {
    const variants: { [key in Ticket['status']]: { bgColor: string, textColor: string, icon: React.ReactNode, label: string } } = {
      open: {
        bgColor: 'bg-blue-100 dark:bg-blue-900/30', 
        textColor: 'text-blue-800 dark:text-blue-300',
        icon: <FileQuestion className="h-3 w-3" />,
        label: 'Ouvert'
      },
      in_progress: {
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', 
        textColor: 'text-yellow-800 dark:text-yellow-300',
        icon: <Clock className="h-3 w-3" />,
        label: 'En cours'
      },
      resolved: {
        bgColor: 'bg-green-100 dark:bg-green-900/30', 
        textColor: 'text-green-800 dark:text-green-300',
        icon: <CheckCircle className="h-3 w-3" />,
        label: 'Résolu'
      },
      closed: {
        bgColor: 'bg-gray-100 dark:bg-gray-800/50', 
        textColor: 'text-gray-800 dark:text-gray-300',
        icon: <CheckCircle className="h-3 w-3" />,
        label: 'Fermé'
      },
      pending_admin_response: {
        bgColor: 'bg-orange-100 dark:bg-orange-900/30', 
        textColor: 'text-orange-800 dark:text-orange-300',
        icon: <Clock className="h-3 w-3" />,
        label: 'Attente admin'
      },
      pending_client_response: {
        bgColor: 'bg-purple-100 dark:bg-purple-900/30', 
        textColor: 'text-purple-800 dark:text-purple-300',
        icon: <Clock className="h-3 w-3" />,
        label: 'Attente client'
      },
    };

    const style = variants[ticket.status];
    return (
      <Badge className={cn(style.bgColor, style.textColor, "text-xs font-medium flex items-center gap-1")}>
        {style.icon}
        {style.label}
      </Badge>
    );
  };

  // Obtenir le badge de priorité
  const getPriorityBadge = () => {
    const variants: { [key in Ticket['priority']]: { bgColor: string, textColor: string, icon?: React.ReactNode, label: string } } = { 
      low: {
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-800 dark:text-green-300',
        label: 'Faible'
      },
      medium: {
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-yellow-800 dark:text-yellow-300',
        label: 'Moyenne'
      },
      high: {
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        textColor: 'text-orange-800 dark:text-orange-300',
        label: 'Élevée'
      },
      urgent: {
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-800 dark:text-red-300',
        icon: <AlertTriangle className="h-3 w-3" />,
        label: 'Urgente'
      }
    };

    const style = variants[ticket.priority];
    return (              <Badge className={cn(style.bgColor, style.textColor, "text-xs font-medium flex items-center gap-1")}>
        {style.icon}
        {style.label}
      </Badge>
    );
  };

  return (
    <AnimatedTicket 
      status={ticket.status}
      priority={ticket.priority}
      delay={0.05}
      index={index}
      onClick={() => onSelect(ticket)}
      className="cursor-pointer"
    >
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg">{ticket.subject}</h3>
          <div className="flex gap-1 flex-shrink-0">
            {getStatusBadge()}
            {getPriorityBadge()}
          </div>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Ticket #{ticket.number}</span>
          <span>{ticket.messages.length} message(s)</span>
        </div>
      </div>
    </AnimatedTicket>
  );
};

export default TicketCard;
