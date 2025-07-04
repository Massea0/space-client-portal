// src/components/modules/support/InteractiveTicketCard.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket as TicketType } from '@/types';
import { 
  Card, CardContent, CardFooter, CardHeader,
  CardTitle, CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, cn } from '@/lib/utils';
import { 
  MessageCircle, CheckCircle, XCircle, AlertTriangle, 
  Clock, FileText, Send, Pencil, MoreHorizontal,
  ChevronDown, ChevronUp, User, MessageSquare, 
  ExternalLink, Lock, PanelLeftOpen
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface InteractiveTicketCardProps {
  ticket: TicketType;
  isAdmin?: boolean;
  actionLoading?: string | null;
  onViewDetails?: (ticket: TicketType) => void;
  onReplyTicket?: (ticket: TicketType) => void;
  onCloseTicket?: (ticketId: string) => Promise<void>;
  onReopenTicket?: (ticketId: string) => Promise<void>;
}

const InteractiveTicketCard: React.FC<InteractiveTicketCardProps> = ({
  ticket,
  isAdmin = false,
  actionLoading,
  onViewDetails,
  onReplyTicket,
  onCloseTicket,
  onReopenTicket
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
  
  const getStatusBadge = (status: TicketType['status']) => {
    const variants: { [key: string]: string } = {
      open: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100',
      closed: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200',
      waiting_client: 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-100',
    };
    const labels: { [key: string]: string } = {
      open: 'Ouvert',
      closed: 'Fermé',
      pending: 'En attente',
      in_progress: 'En traitement',
      waiting_client: 'Attente client',
    };
    const icons: { [key: string]: React.ElementType } = {
      open: MessageCircle,
      closed: Lock,
      pending: Clock,
      in_progress: AlertTriangle,
      waiting_client: User,
    };
    const Icon = icons[status] || FileText;
    
    return (
      <Badge 
        className={cn(
          variants[status] || 'bg-gray-100 text-gray-800', 
          'text-xs whitespace-nowrap flex items-center gap-1 animate-fade-in transition-all duration-300'
        )}
      >
        <Icon className="h-3 w-3" />
        {labels[status] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: TicketType['priority']) => {
    const variants: { [key: string]: string } = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    
    const labels: { [key: string]: string } = {
      low: 'Faible',
      medium: 'Moyenne',
      high: 'Haute',
      critical: 'Critique'
    };
    
    return (
      <Badge 
        className={cn(
          variants[priority] || 'bg-slate-100 text-slate-800', 
          'text-xs'
        )}
      >
        {labels[priority] || priority}
      </Badge>
    );
  };

  const canClose = ticket.status !== 'closed' && isAdmin;
  const canReopen = ticket.status === 'closed';

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
          "overflow-hidden transition-all duration-300 hover:shadow-md border-opacity-80 rounded-xl",
          expanded ? "shadow-md border-primary/50" : "cursor-pointer hover:scale-[1.01]",
          ticket.status === 'closed' && "opacity-80"
        )}
        onClick={expanded ? undefined : () => setExpanded(true)}
      >
        <CardHeader className="pb-2 relative">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg text-primary flex items-center gap-2">
                {ticket.number || `#TICKET-${ticket.id.substring(0, 8)}`}
                {!expanded && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          {getStatusBadge(ticket.status)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>État du ticket</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {ticket.subject}
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              {expanded && getStatusBadge(ticket.status)}
              
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
              
              {!expanded && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>{getPriorityBadge(ticket.priority)}</div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Priorité du ticket</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </CardHeader>
        
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <CardContent className="pb-3">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Entreprise :</span> {ticket.companyName || 'Non spécifiée'}
                    </div>
                    <div>
                      <span className="font-medium">Le :</span> {formatDate(new Date(ticket.createdAt))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Description</h4>
                    <p className="text-sm bg-muted/30 p-3 rounded-md whitespace-pre-wrap">
                      {ticket.description || "Aucune description fournie."}
                    </p>
                  </div>
                  
                  {ticket.updatedAt && (
                    <div className="flex items-center gap-3 pt-2 border-t border-dashed">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>SU</AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="text-muted-foreground">
                          Mis à jour le <span className="font-medium">{formatDate(new Date(ticket.updatedAt))}</span>
                        </p>
                        <p className="text-xs">{formatDate(new Date(ticket.createdAt))}</p>
                      </div>
                      {ticket.messages && ticket.messages.length > 0 && (
                        <Badge variant="outline" className="ml-auto flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {ticket.messages.length} messages
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between pt-0 pb-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onViewDetails) {
                      onViewDetails(ticket);
                    }
                  }}
                >
                  <PanelLeftOpen className="h-4 w-4 mr-1" /> Détails
                </Button>
                
                <div className="flex gap-2">
                  {ticket.status !== 'closed' && onReplyTicket && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReplyTicket(ticket);
                      }}
                      disabled={actionLoading === `reply-${ticket.id}`}
                    >
                      {actionLoading === `reply-${ticket.id}` ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <MessageCircle className="h-4 w-4 mr-1" />
                      )}
                      Répondre
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="px-2"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                      {canClose && onCloseTicket && (
                        <DropdownMenuItem
                          onClick={() => onCloseTicket(ticket.id)}
                          disabled={actionLoading === `close-${ticket.id}`}
                        >
                          <Lock className="h-4 w-4 mr-2 text-slate-500" />
                          Clôturer le ticket
                        </DropdownMenuItem>
                      )}
                      
                      {canReopen && onReopenTicket && (
                        <DropdownMenuItem
                          onClick={() => onReopenTicket(ticket.id)}
                          disabled={actionLoading === `reopen-${ticket.id}`}
                        >
                          <MessageCircle className="h-4 w-4 mr-2 text-green-500" />
                          Rouvrir le ticket
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default InteractiveTicketCard;
