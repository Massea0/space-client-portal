// src/pages/SupportNew.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { ticketsApi, ticketCategoriesApi } from '@/services/api';
import { Ticket, TicketCategory } from '@/types';
import { Plus, Search, Filter } from 'lucide-react';
import { notificationManager } from '@/components/ui/notification-provider';
import { SafeDialogTrigger } from "@/components/ui/safe-dialog-trigger";
import { SafeSelectTrigger } from '@/components/ui/safe-triggers';
import { connectionDiagnostic } from '@/lib/connectionDiagnostic';
import { ConnectionTroubleshooter } from '@/components/diagnostics/ConnectionTroubleshooter';

// Import des composants interactifs pour la nouvelle version harmonisée
import InteractiveTicketCard from '@/components/modules/support/InteractiveTicketCard';
import { InteractiveSupportGrid } from '@/components/modules/support/InteractiveSupportGrid';
import { TicketDetailView, TicketCategoryDropdown, TicketPriorityDropdown } from '@/components/support';

// Import du nouveau composant proactif - Mission 3
import { ProactiveTickets } from '@/components/support/ProactiveTickets';
import { useActivityLogger } from '@/hooks/useActivityLogger';

const Support = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Hook pour le logging d'activité - Mission 3
  const { logPageView, logSearch, logFormError, logTicketView } = useActivityLogger();

  // États pour la gestion des tickets
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketCategories, setTicketCategories] = useState<TicketCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  // États pour la création d'un nouveau ticket
  const [showNewTicketDialog, setShowNewTicketDialog] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketDescription, setNewTicketDescription] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState<string>('');
  const [newTicketPriority, setNewTicketPriority] = useState<string>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Fonction pour charger les tickets et catégories
  const fetchTicketsAndCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      // Chargement parallèle des tickets et des catégories
      const [ticketsResponse, categoriesResponse] = await Promise.all([
        isAdmin ? ticketsApi.getAll() : ticketsApi.getByCompany(user?.companyId || ''),
        ticketCategoriesApi.getAll()
      ]);

      setTickets(ticketsResponse);
      setTicketCategories(categoriesResponse);
    } catch (error) {
      console.error("Erreur lors du chargement des tickets:", error);
      notificationManager.error('Erreur', { message: "Impossible de charger les tickets" });
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, user?.companyId]);

  // Effet pour charger les tickets au montage du composant
  useEffect(() => {
    fetchTicketsAndCategories();
    
    // Log de la visite de la page Support - Mission 3
    logPageView('/support', {
      is_admin: isAdmin,
      has_tickets: tickets.length > 0
    });
  }, [fetchTicketsAndCategories, logPageView, isAdmin, tickets.length]);

  // Fonction pour filtrer les tickets selon les critères
  const filteredTickets = useCallback(() => {
    return tickets.filter((ticket) => {
      // Filtre par recherche textuelle (sujet ou message)
      const matchesSearch = searchTerm === '' || 
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtre par statut
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      
      // Filtre par priorité
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      
      // Filtre par catégorie
      const matchesCategory = categoryFilter === 'all' || ticket.categoryId === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  // Gestionnaires pour les actions sur les tickets
  const handleViewDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    
    // Log de la visualisation du ticket - Mission 3
    logTicketView(ticket.id, 'view_details');
  };

  const handleReplyTicket = (ticket: Ticket) => {
    navigate(`/support/ticket/${ticket.id}`);
  };

  const handleCloseTicket = async (ticketId: string) => {
    setActionLoading(ticketId);
    try {
      await ticketsApi.updateStatus(ticketId, 'closed');
      setTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, status: 'closed' } : t
      ));
      notificationManager.success("Succès", { message: "Le ticket a été clôturé" });
    } catch (error) {
      console.error("Erreur lors de la clôture du ticket:", error);
      notificationManager.error("Erreur", { message: "Impossible de clôturer le ticket" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReopenTicket = async (ticketId: string) => {
    setActionLoading(ticketId);
    try {
      await ticketsApi.updateStatus(ticketId, 'open');
      setTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, status: 'open' } : t
      ));
      notificationManager.success("Succès", { message: "Le ticket a été réouvert" });
    } catch (error) {
      console.error("Erreur lors de la réouverture du ticket:", error);
      notificationManager.error("Erreur", { message: "Impossible de réouvrir le ticket" });
    } finally {
      setActionLoading(null);
    }
  };

  // Fonction pour créer un nouveau ticket
  const handleSubmitNewTicket = async () => {
    if (!newTicketSubject.trim() || !newTicketDescription.trim() || !newTicketCategory) {
      notificationManager.error("Erreur", { message: "Veuillez remplir tous les champs obligatoires" });
      return;
    }

    setIsSubmitting(true);

    try {
      const newTicketData = {
        subject: newTicketSubject,
        description: newTicketDescription,
        categoryId: newTicketCategory,
        priority: newTicketPriority as Ticket['priority'],
        companyId: user?.companyId || ''
      };

      const createdTicket = await ticketsApi.create(newTicketData);
      
      setTickets(prev => [createdTicket, ...prev]);
      setShowNewTicketDialog(false);
      resetNewTicketForm();
      notificationManager.success("Succès", { message: "Votre ticket a été créé avec succès" });
    } catch (error) {
      console.error("Erreur lors de la création du ticket:", error);
      notificationManager.error("Erreur", { message: "Impossible de créer le ticket" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetNewTicketForm = () => {
    setNewTicketSubject('');
    setNewTicketDescription('');
    setNewTicketCategory('');
    setNewTicketPriority('medium');
  };

  // États vides et chargement pour la grille de tickets
  const EmptyState = (
    <div className="col-span-full text-center py-12 border rounded-lg bg-muted/20">
      <div className="mx-auto h-12 w-12 text-muted-foreground">🔎</div>
      <h3 className="mt-4 text-lg font-medium">Aucun ticket trouvé</h3>
      <p className="mt-2 text-muted-foreground">
        {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all'
          ? "Aucun ticket ne correspond à vos critères de recherche."
          : isAdmin
            ? "Aucun ticket disponible dans le système."
            : "Vous n'avez pas encore créé de ticket de support."}
      </p>
      <div className="mt-6 flex flex-col gap-3 items-center">
        {!isAdmin && (
          <Button 
            onClick={() => setShowNewTicketDialog(true)} 
            className="mt-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            Créer un ticket
          </Button>
        )}
        
        {/* Bouton d'actualisation toujours visible */}
        <Button 
          variant="outline" 
          onClick={fetchTicketsAndCategories}
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <div className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}>⟳</div>
          Actualiser
        </Button>
        
        {/* Outil de diagnostic seulement visible quand il n'y a pas de filtre actif et aucun ticket */}
        {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && categoryFilter === 'all' && (
          <ConnectionTroubleshooter
            onReloadData={fetchTicketsAndCategories} 
            entityName="tickets"
          />
        )}
      </div>
    </div>
  );

  const LoadingState = (
    <div className="col-span-full flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <span className="ml-3 text-lg">Chargement des tickets...</span>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Support</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin 
              ? "Gérez les demandes de support de vos clients"
              : "Créez et suivez vos demandes de support"}
          </p>
        </div>
        
        {!isAdmin && (
          <Button onClick={() => setShowNewTicketDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau ticket
          </Button>
        )}
      </div>
      
      {/* Tickets proactifs - Mission 3 */}
      {!isAdmin && (
        <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-lg">
          <ProactiveTickets />
        </div>
      )}
      
      {/* Filtres */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Rechercher un ticket..."
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              setSearchTerm(value);
              
              // Log de la recherche si l'utilisateur tape plus de 2 caractères - Mission 3
              if (value.length > 2) {
                logSearch(value, 'support_tickets');
              }
            }}
          />
        </div>
        
        <div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SafeSelectTrigger className="w-full">
              <SelectValue placeholder="Statut" />
            </SafeSelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="open">Ouverts</SelectItem>
              <SelectItem value="closed">Clôturés</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SafeSelectTrigger className="w-full">
              <SelectValue placeholder="Priorité" />
            </SafeSelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les priorités</SelectItem>
              <SelectItem value="low">Faible</SelectItem>
              <SelectItem value="medium">Moyenne</SelectItem>
              <SelectItem value="high">Élevée</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grille de tickets avec composant interactif */}
      <InteractiveSupportGrid
        items={filteredTickets()}
        loading={isLoading}
        emptyState={EmptyState}
        loadingState={LoadingState}
        keyExtractor={(ticket) => ticket.id}
        renderItem={(ticket) => (
          <InteractiveTicketCard
            ticket={ticket}
            isAdmin={isAdmin}
            actionLoading={actionLoading}
            onViewDetails={handleViewDetails}
            onReplyTicket={handleReplyTicket}
            onCloseTicket={handleCloseTicket}
            onReopenTicket={handleReopenTicket}
          />
        )}
      />

      {/* Dialogue détail du ticket */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détails du ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{selectedTicket.number} - {selectedTicket.subject}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">Statut:</span> {selectedTicket.status}</div>
                <div><span className="font-medium">Priorité:</span> {selectedTicket.priority}</div>
                <div><span className="font-medium">Catégorie:</span> {selectedTicket.categoryName || 'Non catégorisé'}</div>
                <div><span className="font-medium">Date:</span> {selectedTicket.createdAt.toLocaleString()}</div>
              </div>
              <p className="text-gray-700 mt-2">{selectedTicket.description}</p>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setSelectedTicket(null)}
              >
                Fermer
              </Button>
              <Button 
                onClick={() => {
                  setSelectedTicket(null);
                  navigate(`/support/ticket/${selectedTicket.id}`);
                }}
              >
                Répondre
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialogue de création de ticket */}
      <Dialog open={showNewTicketDialog} onOpenChange={setShowNewTicketDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un nouveau ticket</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sujet</label>
              <Input
                placeholder="Décrivez brièvement votre problème"
                value={newTicketSubject}
                onChange={(e) => setNewTicketSubject(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Catégorie</label>
              <Select
                value={newTicketCategory}
                onValueChange={setNewTicketCategory}
              >
                <SafeSelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SafeSelectTrigger>
                <SelectContent>
                  {ticketCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Priorité</label>
              <Select
                value={newTicketPriority}
                onValueChange={setNewTicketPriority}
              >
                <SafeSelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionnez une priorité" />
                </SafeSelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Élevée</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Décrivez votre problème en détail..."
                className="min-h-[120px]"
                value={newTicketDescription}
                onChange={(e) => setNewTicketDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowNewTicketDialog(false);
                resetNewTicketForm();
              }}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSubmitNewTicket} 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Création..." : "Créer le ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* L'outil de diagnostic est maintenant intégré dans l'état vide, donc cette section n'est plus nécessaire */}
    </div>
  );
};

export default Support;
