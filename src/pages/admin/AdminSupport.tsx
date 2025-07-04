// src/pages/admin/AdminSupport.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger
} from '@/components/ui/select';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { formatDate, cn } from '@/lib/utils';
import { ticketsApi, ticketCategoriesApi } from '@/services/api';
import { Ticket, TicketCategory, TicketMessage } from '@/types';
import { 
  Search, Filter, Plus, MessageCircle, CheckCircle, XCircle, 
  AlertTriangle, Clock, FileText, LayoutGrid, LayoutList, RefreshCw,
  Eye
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { notificationManager } from '@/components/ui/notification-provider';
import { SafeSelectTrigger } from '@/components/ui/safe-triggers';
import { connectionDiagnostic } from '@/lib/connectionDiagnostic';
import { ConnectionTroubleshooter } from '@/components/diagnostics/ConnectionTroubleshooter';

// Importer les composants interactifs
import InteractiveTicketCard from '@/components/modules/support/InteractiveTicketCard';
import { InteractiveSupportGrid } from '@/components/modules/support/InteractiveSupportGrid';
import { TicketDetailView } from '@/components/support';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Type pour les modes d'affichage disponibles
type ViewMode = 'cards' | 'interactive' | 'list';

const AdminSupport = () => {
  const { user } = useAuth();
  // États pour la gestion des tickets
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('interactive');
  
  // États pour les détails et les actions
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);
  const [animationReady, setAnimationReady] = useState(false);
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);

  // Fonction pour charger les tickets et catégories
  const loadTicketsAndCategories = useCallback(async () => {
    try {
      setLoading(true);
      const [ticketsResult, categoriesResult] = await Promise.all([
        ticketsApi.getAll(),
        ticketCategoriesApi.getAll()
      ]);
      setTickets(ticketsResult);
      setCategories(categoriesResult);
    } catch (error) {
      notificationManager.error('Erreur', { message: 'Erreur lors du chargement des données' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTicketsAndCategories();
  }, [loadTicketsAndCategories]);

  // Déclencher l'animation après le chargement initial
  useEffect(() => {
    if (!loading && tickets.length > 0) {
      const timer = setTimeout(() => {
        setAnimationReady(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setAnimationReady(false);
    }
  }, [loading, tickets]);

  // Fonction pour filtrer les tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = searchTerm === '' || 
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'all' || ticket.categoryId === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  const handleSendReply = async (ticketId: string, content: string) => {
    if (!user) return;
    
    try {
      setActionLoading(`message-${ticketId}`);
      const optimisticMessage: TicketMessage = {
        id: `temp-${Date.now()}`, 
        ticketId: ticketId, 
        content: content,
        authorId: user.id, 
        authorName: `${user.firstName} ${user.lastName}`, 
        authorRole: 'admin',
        createdAt: new Date(), 
        attachments: []
      };
      
      setSelectedTicket(prev => prev ? { ...prev, messages: [...prev.messages, optimisticMessage] } : null);
      
      const updatedTicket = await ticketsApi.addMessage(ticketId, {
        content: content, 
        authorId: user.id, 
        authorName: `${user.firstName} ${user.lastName}`, 
        authorRole: 'admin'
      });
      
      setTickets(prevTickets => prevTickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
      setSelectedTicket(updatedTicket);
      notificationManager.success('Message envoyé', { message: 'Votre message a été envoyé avec succès' });
    } catch (error) {
      notificationManager.error('Erreur', { message: 'Erreur lors de l\'envoi du message' });
      if (selectedTicket) {
        const currentTicket = tickets.find(t => t.id === selectedTicket.id);
        setSelectedTicket(currentTicket || null);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateTicketDetails = async (
    ticketId: string,
    status: Ticket['status'],
    priority: Ticket['priority'],
    categoryId: string | undefined,
    assignedTo: string | undefined
  ) => {
    try {
      setActionLoading(`details-${ticketId}`);
      const updatedTicket = await ticketsApi.updateStatus(
        ticketId, 
        status,
        priority, 
        assignedTo, 
        categoryId
      );
      setTickets(prevTickets => prevTickets.map(t => t.id === ticketId ? updatedTicket : t));
      setSelectedTicket(updatedTicket);
      notificationManager.success('Ticket mis à jour', { message: 'Informations du ticket mises à jour avec succès' });
    } catch (error) {
      notificationManager.error('Erreur', { message: 'Erreur lors de la mise à jour du ticket' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;
    try {
      setActionLoading(`delete-${ticketToDelete.id}`);
      await ticketsApi.delete(ticketToDelete.id);
      setTickets(prevTickets => prevTickets.filter(t => t.id !== ticketToDelete.id));
      setSelectedTicket(null);
      setTicketToDelete(null);
      notificationManager.success('Ticket supprimé', { message: `Ticket N°${ticketToDelete.number} supprimé avec succès` });
    } catch (error) {
      notificationManager.error('Erreur', { message: 'Erreur lors de la suppression du ticket' });
    } finally {
      setActionLoading(null);
    }
  };

  // Fonction pour diagnostiquer les problèmes de connexion
  const runConnectionDiagnostic = async () => {
    setDiagnosticRunning(true);
    try {
      const diagResult = await connectionDiagnostic.checkSupabaseConnection();
      const autoFixed = await connectionDiagnostic.attemptAutoFix();
      
      if (autoFixed) {
        notificationManager.success("Connexion rétablie", {
          message: "La connexion a été rétablie. Actualisation des données..."
        });
        loadTicketsAndCategories();
      } else {
        let message = "Problèmes détectés:\n";
        if (!diagResult.connected) message += "• Impossible de se connecter à la base de données\n";
        if (!diagResult.authenticated) message += "• Session non authentifiée\n";
        if (!diagResult.userProfile) message += "• Profil utilisateur introuvable\n";
        
        notificationManager.warning("Diagnostic de connexion", { message });
      }
    } catch (e) {
      notificationManager.error("Erreur", {
        message: "Impossible de terminer le diagnostic. Veuillez contacter le support."
      });
    } finally {
      setDiagnosticRunning(false);
    }
  };

  // Fonction pour ouvrir la vue détaillée d'un ticket
  const handleViewDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  // Fonction pour clôturer un ticket
  const handleCloseTicket = async (ticketId: string) => {
    try {
      setActionLoading(`close-${ticketId}`);
      const updatedTicket = await ticketsApi.updateStatus(ticketId, 'closed');
      
      // Mettre à jour l'état local
      setTickets(tickets.map(t => t.id === ticketId ? updatedTicket : t));
      
      notificationManager.success('Succès', { message: 'Le ticket a été clôturé.' });
      
      // Si le ticket était sélectionné, mettre à jour la vue détaillée
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(updatedTicket);
      }
    } catch (error) {
      notificationManager.error('Erreur', { message: 'Impossible de clôturer le ticket.' });
    } finally {
      setActionLoading(null);
    }
  };

  // Fonction pour rouvrir un ticket
  const handleReopenTicket = async (ticketId: string) => {
    try {
      setActionLoading(`reopen-${ticketId}`);
      const updatedTicket = await ticketsApi.updateStatus(ticketId, 'open');
      
      // Mettre à jour l'état local
      setTickets(tickets.map(t => t.id === ticketId ? updatedTicket : t));
      
      notificationManager.success('Succès', { message: 'Le ticket a été rouvert.' });
      
      // Si le ticket était sélectionné, mettre à jour la vue détaillée
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(updatedTicket);
      }
    } catch (error) {
      notificationManager.error('Erreur', { message: 'Impossible de rouvrir le ticket.' });
    } finally {
      setActionLoading(null);
    }
  };

  // Fonction pour supprimer un ticket
  const handleDeleteTicketConfirm = async () => {
    if (!ticketToDelete) return;
    
    try {
      setActionLoading(`delete-${ticketToDelete.id}`);
      await ticketsApi.delete(ticketToDelete.id);
      
      // Mettre à jour l'état local
      setTickets(tickets.filter(t => t.id !== ticketToDelete.id));
      
      notificationManager.success('Succès', { message: 'Le ticket a été supprimé.' });
      
      // Si le ticket était sélectionné, fermer la vue détaillée
      if (selectedTicket?.id === ticketToDelete.id) {
        setSelectedTicket(null);
      }
      
      setTicketToDelete(null);
    } catch (error) {
      notificationManager.error('Erreur', { message: 'Impossible de supprimer le ticket.' });
    } finally {
      setActionLoading(null);
    }
  };

  // Fonction de rendu des cartes de tickets pour le composant InteractiveSupportGrid
  const renderTicketCard = React.useCallback((ticket: Ticket) => {
    return (
      <InteractiveTicketCard
        key={ticket.id}
        ticket={ticket}
        isAdmin={true}
        actionLoading={actionLoading}
        onViewDetails={handleViewDetails}
        onReplyTicket={handleViewDetails}
        onCloseTicket={handleCloseTicket}
        onReopenTicket={handleReopenTicket}
      />
    );
  }, [actionLoading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Chargement des tickets...</p>
        </div>
      </div>
    );
  }

  const availableStatuses: Ticket['status'][] = ['open', 'in_progress', 'resolved', 'closed', 'pending_admin_response', 'pending_client_response'];
  const availablePriorities: Ticket['priority'][] = ['low', 'medium', 'high', 'urgent'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tous les Tickets</h1>
          <p className="text-muted-foreground mt-1">Gérez tous les tickets de support</p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-4 p-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Rechercher par sujet, entreprise ou numéro..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap md:flex-nowrap">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SafeSelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Statut" />
            </SafeSelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {availableStatuses.map(status => (
                <SelectItem key={status} value={status} className="capitalize">
                  {status.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SafeSelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Priorité" />
            </SafeSelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes priorités</SelectItem>
              {availablePriorities.map(priority => (
                <SelectItem key={priority} value={priority} className="capitalize">
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SafeSelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Catégorie" />
            </SafeSelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center bg-muted/40 rounded-lg p-1 border shadow-sm ml-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={viewMode === 'interactive' ? "secondary" : "ghost"} 
                    size="sm" 
                    onClick={() => setViewMode('interactive')} 
                    className="px-3"
                  >
                    <LayoutGrid className="h-4 w-4 mr-1" />
                    <span className="sr-only sm:not-sr-only sm:inline-block">Cartes</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Vue en cartes interactives</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={viewMode === 'list' ? "secondary" : "ghost"} 
                    size="sm" 
                    onClick={() => setViewMode('list')} 
                    className="px-3"
                  >
                    <LayoutList className="h-4 w-4 mr-1" />
                    <span className="sr-only sm:not-sr-only sm:inline-block">Liste</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Vue en liste détaillée</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={loadTicketsAndCategories}
                    className="px-2 ml-1"
                    disabled={loading}
                  >
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Rafraîchir la liste</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Liste des tickets avec animation entre les modes de vue */}
      <div className="grid gap-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={animationReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              duration: 0.5, 
              ease: [0.22, 1, 0.36, 1],
              opacity: { duration: 0.4 },
              y: { type: "spring", stiffness: 100, damping: 15 }
            }}
          >
            {viewMode === 'interactive' && (
              <InteractiveSupportGrid
                items={filteredTickets}
                loading={loading}
                renderItem={renderTicketCard}
                isReady={animationReady}
              />
            )}
            
            {viewMode === 'list' && (
              <Card>
                <CardContent className="p-0">
                  <div className="relative w-full overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-muted/50">
                        <tr>
                          <th className="px-4 py-3">Numéro</th>
                          <th className="px-4 py-3">Sujet</th>
                          <th className="px-4 py-3 hidden md:table-cell">Entreprise</th>
                          <th className="px-4 py-3">Statut</th>
                          <th className="px-4 py-3 hidden md:table-cell">Priorité</th>
                          <th className="px-4 py-3 hidden md:table-cell">Créé le</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTickets.map((ticket) => (
                          <tr key={ticket.id} className="border-t hover:bg-muted/30">
                            <td className="px-4 py-3">#{ticket.number}</td>
                            <td className="px-4 py-3 font-medium">{ticket.subject}</td>
                            <td className="px-4 py-3 hidden md:table-cell">{ticket.companyName || '-'}</td>
                            <td className="px-4 py-3">
                              <span className={cn(
                                "px-2 py-1 text-xs rounded-full",
                                ticket.status === 'open' && "bg-blue-100 text-blue-800",
                                ticket.status === 'in_progress' && "bg-yellow-100 text-yellow-800",
                                ticket.status === 'resolved' && "bg-green-100 text-green-800",
                                ticket.status === 'closed' && "bg-gray-100 text-gray-800"
                              )}>
                                {ticket.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell capitalize">{ticket.priority}</td>
                            <td className="px-4 py-3 hidden md:table-cell">{formatDate(new Date(ticket.createdAt))}</td>
                            <td className="px-4 py-3 text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleViewDetails(ticket)}>
                                <Eye className="h-4 w-4 mr-1" /> Détails
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredTickets.length === 0 && (
                      <div className="py-12 text-center">
                        <p className="text-muted-foreground">Aucun ticket ne correspond à vos critères.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Vue détaillée du ticket */}
      <TicketDetailView
        ticket={selectedTicket}
        isAdmin={true}
        isOpen={!!selectedTicket}
        onOpenChange={(open) => {
          if (!open) setSelectedTicket(null);
        }}
        onSendMessage={handleSendReply}
        onUpdateDetails={handleUpdateTicketDetails}
        isSending={!!actionLoading && actionLoading.startsWith('message-')}
      />
      
      {/* Dialog de confirmation pour la suppression */}
      <ConfirmationDialog
        isOpen={!!ticketToDelete}
        onClose={() => setTicketToDelete(null)}
        onConfirm={handleDeleteTicket}
        title="Confirmer la suppression"
        description={`Êtes-vous sûr de vouloir supprimer le ticket ${ticketToDelete?.number} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        isLoading={!!actionLoading && actionLoading.startsWith('delete-')}
      />

      {/* Bouton pour supprimer le ticket actuel */}
      {selectedTicket && (
        <div className="fixed bottom-4 right-4">
          <Button 
            variant="destructive" 
            onClick={() => setTicketToDelete(selectedTicket)}
          >
            Supprimer ce ticket
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminSupport;
