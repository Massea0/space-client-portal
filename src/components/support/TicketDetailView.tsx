// src/components/support/TicketDetailView.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Ticket, TicketMessage } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDate, formatTime, formatDateLong } from '@/lib/utils';
import { Send, Loader2 } from 'lucide-react';
import { SafeModal } from '@/components/ui/safe-modal';
import TicketStatusDropdown from './TicketStatusDropdown';
import TicketPriorityDropdown from './TicketPriorityDropdown';
import TicketCategoryDropdown from './TicketCategoryDropdown';
import AdminAssignmentDropdown from './AdminAssignmentDropdown';

interface TicketDetailViewProps {
  ticket: Ticket | null;
  isAdmin: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSendMessage: (ticketId: string, content: string) => Promise<void>;
  onUpdateDetails?: (
    ticketId: string, 
    status: Ticket['status'], 
    priority: Ticket['priority'], 
    categoryId: string | undefined,
    assignedTo: string | undefined
  ) => Promise<void>;
  isSending: boolean;
}

/**
 * Vue détaillée d'un ticket pour les interfaces admin et client
 * Utilise une mise en page optimisée avec panneau d'information et conversation
 */
const TicketDetailView: React.FC<TicketDetailViewProps> = ({
  ticket,
  isAdmin,
  isOpen,
  onOpenChange,
  onSendMessage,
  onUpdateDetails,
  isSending
}) => {
  const [messageContent, setMessageContent] = useState('');
  const [status, setStatus] = useState<Ticket['status']>('open');
  const [priority, setPriority] = useState<Ticket['priority']>('medium');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [assignedTo, setAssignedTo] = useState<string | undefined>();
  const [isUpdatingDetails, setIsUpdatingDetails] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mettre à jour les champs lorsque le ticket change
  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status);
      setPriority(ticket.priority);
      setCategoryId(ticket.categoryId);
      setAssignedTo(ticket.assignedTo);
    }
  }, [ticket]);

  // Défiler jusqu'au dernier message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ticket?.messages]);

  const handleSendMessage = async () => {
    if (!ticket || !messageContent.trim()) return;
    
    try {
      await onSendMessage(ticket.id, messageContent);
      setMessageContent('');
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    }
  };

  const handleUpdateDetails = async () => {
    if (!ticket || !onUpdateDetails) return;
    
    try {
      setIsUpdatingDetails(true);
      await onUpdateDetails(ticket.id, status, priority, categoryId, assignedTo);
    } catch (error) {
      console.error("Erreur lors de la mise à jour des détails:", error);
    } finally {
      setIsUpdatingDetails(false);
    }
  };

  return (
    <SafeModal
      title={ticket ? `Ticket #${ticket.id.slice(0, 8)} - ${ticket.subject}` : 'Détails du ticket'}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
    >
      {ticket && (
        <div className="grid grid-cols-12 gap-4">
          {/* Panneau d'information (4 colonnes) */}
          <div className="col-span-12 md:col-span-4 space-y-4 md:border-r pr-0 md:pr-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Client</h3>
              <p className="text-base">{ticket.companyName}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Statut</h3>
              {isAdmin ? (
                <TicketStatusDropdown 
                  currentStatus={status} 
                  onChange={setStatus}
                  disabled={isUpdatingDetails} 
                />
              ) : (
                <div className="mt-1">{status.replace('_', ' ')}</div>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Priorité</h3>
              {isAdmin ? (
                <TicketPriorityDropdown 
                  currentPriority={priority} 
                  onChange={setPriority}
                  disabled={isUpdatingDetails} 
                />
              ) : (
                <div className="mt-1">{priority}</div>
              )}
            </div>
            
            {isAdmin && (
              <>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Catégorie</h3>
                  <TicketCategoryDropdown 
                    currentCategory={categoryId} 
                    onChange={setCategoryId}
                    disabled={isUpdatingDetails} 
                  />
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Assigné à</h3>
                  <AdminAssignmentDropdown 
                    currentAssignee={assignedTo || null}
                    ticketId={ticket.id}
                    onChange={(value) => setAssignedTo(value || undefined)}
                    disabled={isUpdatingDetails} 
                  />
                </div>
              </>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Créé le</h3>
              <p className="text-base">{formatDateLong(ticket.createdAt)}</p>
            </div>

            {isAdmin && onUpdateDetails && (
              <div className="pt-4">
                <Button 
                  onClick={handleUpdateDetails}
                  disabled={isUpdatingDetails}
                  className="w-full"
                >
                  {isUpdatingDetails ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    'Mettre à jour'
                  )}
                </Button>
              </div>
            )}
          </div>
          
          {/* Conversation (8 colonnes) */}
          <div className="col-span-12 md:col-span-8 space-y-4">
            {/* Messages existants */}
            <div className="max-h-96 overflow-y-auto space-y-3 p-2 border rounded-md">
              {ticket.messages.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Aucun message dans ce ticket.</p>
              ) : (
                ticket.messages.map((message) => (
                  <div 
                    key={message.id}
                    className={`rounded-lg p-3 ${
                      message.authorRole === 'admin'
                        ? "bg-blue-50 ml-6" 
                        : "bg-gray-50 mr-6"
                    }`}
                  >
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>{message.authorRole === 'admin' ? "Support" : "Client"}</span>
                      <span>{formatTime(message.createdAt)}</span>
                    </div>
                    <p className="text-gray-800">{message.content}</p>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Formulaire de réponse */}
            {ticket.status !== 'closed' && (
              <div className="border-t pt-3">
                <Textarea 
                  value={messageContent} 
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Votre réponse..."
                  rows={3}
                  className="mb-2"
                  disabled={isSending}
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSendMessage}
                    disabled={messageContent.trim().length === 0 || isSending}
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Envoyer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </SafeModal>
  );
};

export default TicketDetailView;
