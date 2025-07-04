import React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import { Ticket } from '@/types';
import { AnimatedTicket } from '@/components/ui/animated-ticket';
import { Building, Calendar, MessageSquare, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface TicketListProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
  getStatusBadge: (status: Ticket['status']) => React.ReactNode;
  getPriorityBadge: (priority: Ticket['priority']) => React.ReactNode;
  showCompanyName?: boolean;
}

export const TicketList: React.FC<TicketListProps> = ({
  tickets,
  onSelectTicket,
  getStatusBadge,
  getPriorityBadge,
  showCompanyName = false
}) => {
  return (
    <div className="grid gap-4">
      {tickets.map((ticket, index) => (
        <AnimatedTicket
          key={ticket.id}
          status={ticket.status}
          priority={ticket.priority}
          delay={0.05 * index}
          index={index}
          onClick={() => onSelectTicket(ticket)}
          className="cursor-pointer"
        >
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="space-y-2 flex-grow">
              <div className="flex items-start gap-3 flex-wrap">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <motion.h3 
                    className="font-semibold text-lg text-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    {ticket.subject}
                  </motion.h3>
                  <motion.p 
                    className="text-sm text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 + index * 0.05 }}
                  >
                    #{ticket.number}
                  </motion.p>
                </div>
              </div>
              
              <motion.div 
                className="flex flex-col md:flex-row md:items-center gap-x-4 gap-y-1 text-sm text-muted-foreground"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                {showCompanyName && (
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span>{ticket.companyName}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Créé le {formatDateTime(ticket.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{ticket.messages.length} message(s)</span>
                </div>
                {ticket.assignedTo && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>Assigné à: {ticket.assignedTo}</span>
                  </div>
                )}
              </motion.div>
            </div>
            
            <motion.div 
              className="flex items-center gap-2 pt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 + index * 0.05 }}
            >
              {ticket.categoryName && (
                <Badge variant="outline" className="text-xs">
                  {ticket.categoryName}
                </Badge>
              )}
              {getStatusBadge(ticket.status)}
              {getPriorityBadge(ticket.priority)}
            </motion.div>
          </div>
        </AnimatedTicket>
      ))}
    </div>
  );
};

export default TicketList;
