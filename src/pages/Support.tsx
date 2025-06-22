// src/pages/Support.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { formatDateTime, cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { ticketsApi, ticketCategoriesApi } from '@/services/api';
import { Ticket, TicketCategory } from '@/types';
import { Plus, Search, Filter, MessageSquare, Send, Eye as EyeIcon, Calendar, User as UserIcon } from 'lucide-react';
import { formStyles as styles } from '@/components/forms/FormStyles';
import { FormCard, FormSection } from '@/components/forms/SharedFormComponents';


const Support = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketDescription, setNewTicketDescription] = useState('');
  const [newTicketCategoryId, setNewTicketCategoryId] = useState<string>('');
  const [newTicketPriority, setNewTicketPriority] = useState<Ticket['priority']>('medium');

  const [newMessage, setNewMessage] = useState('');
  const [showNewTicketDialog, setShowNewTicketDialog] = useState(false);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<TicketCategory[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (selectedTicket?.messages.length) {
      scrollToBottom();
    }
  }, [selectedTicket?.messages.length, scrollToBottom]);


  useEffect(() => {
    if (location.state?.openCreateTicketDialog) {
      setShowNewTicketDialog(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const loadTicketsAndCategories = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const companyIdForRequests = user.companyId ?? '';
      const [ticketsData, categoriesData] = await Promise.all([
        user.role === 'admin'
            ? ticketsApi.getAll()
            : ticketsApi.getByCompany(companyIdForRequests),
        ticketCategoriesApi.getAll()
      ]);
      setTickets(ticketsData);
      setCategories(categoriesData);
    } catch (error) {
      toast.error('Erreur', { description: 'Impossible de charger les données de support' });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTicketsAndCategories();
  }, [loadTicketsAndCategories]);

  const filteredTickets = tickets.filter(ticket => {
    const companyName = ticket.companyName || '';
    const matchesSearch = ticket.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user?.role === 'admin' && companyName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || ticket.categoryId === categoryFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getStatusBadge = (status: Ticket['status']) => {
    const variants: { [key in Ticket['status']]: string } = {
      open: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200',
      in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100',
      closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      pending_admin_response: 'bg-purple-100 text-purple-800 dark:bg-purple-600 dark:text-purple-100',
      pending_client_response: 'bg-pink-100 text-pink-800 dark:bg-pink-600 dark:text-pink-100',
    };
    const labels: { [key in Ticket['status']]: string } = {
      open: 'Ouvert', in_progress: 'En cours', resolved: 'Résolu', closed: 'Fermé',
      pending_admin_response: 'Attente Admin', pending_client_response: 'Attente Client',
    };
    return <Badge className={cn(variants[status] || 'bg-slate-100 text-slate-800')}>{labels[status] || status}</Badge>;
  };

  const getPriorityBadge = (priority: Ticket['priority']) => {
    const variants = { low: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100', medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100', high: 'bg-orange-100 text-orange-800 dark:bg-orange-600 dark:text-orange-100', urgent: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100' };
    const labels = { low: 'Faible', medium: 'Moyenne', high: 'Élevée', urgent: 'Urgente' };
    return <Badge className={variants[priority]}>{labels[priority]}</Badge>;
  };

  const handleCreateTicket = async () => {
    if (!newTicketSubject.trim() || !newTicketDescription.trim() || !user?.companyId || !newTicketCategoryId || !newTicketPriority) {
      toast.warning("Validation", { description: "Sujet, description, catégorie et priorité sont requis." });
      return;
    }
    try {
      setActionLoading('create');
      await ticketsApi.create({
        subject: newTicketSubject,
        description: newTicketDescription,
        companyId: user.companyId,
        categoryId: newTicketCategoryId,
        priority: newTicketPriority,
      });
      await loadTicketsAndCategories();
      setNewTicketSubject('');
      setNewTicketDescription('');
      setNewTicketCategoryId('');
      setNewTicketPriority('medium');
      setShowNewTicketDialog(false);
      toast.success('Succès', { description: 'Ticket créé avec succès' });
    } catch (error) {
      toast.error('Erreur', { description: (error as Error).message || 'Impossible de créer le ticket' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket || !user) return;
    try {
      setActionLoading(`message-${selectedTicket.id}`);
      const updatedTicket = await ticketsApi.addMessage(selectedTicket.id, {
        content: newMessage, authorId: user.id, authorName: `${user.firstName} ${user.lastName}`.trim(),
        authorRole: user.role === 'admin' ? 'admin' : 'client'
      });
      setSelectedTicket(updatedTicket);
      setNewMessage('');
      setTickets(prevTickets => prevTickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
      toast.success('Succès', { description: 'Message envoyé' });
      scrollToBottom();
    } catch (error) {
      toast.error('Erreur', { description: (error as Error).message || 'Impossible d\'envoyer le message' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: Ticket['status']) => {
    try {
      setActionLoading(`status-${ticketId}`);
      const updatedTicket = await ticketsApi.updateStatus(ticketId, status);
      setTickets(prevTickets => prevTickets.map(t => t.id === ticketId ? updatedTicket : t));
      if (selectedTicket?.id === ticketId) setSelectedTicket(updatedTicket);
      toast.success('Succès', { description: `Statut du ticket mis à jour.` });
    } catch (error) {
      toast.error('Erreur', { description: (error as Error).message || 'Impossible de mettre à jour le ticket' });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && tickets.length === 0) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
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
            <h1 className="text-3xl font-bold text-foreground">
              {user?.role === 'admin' ? 'Gestion des Tickets' : 'Mes Tickets de Support'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {user?.role === 'admin' ? 'Visualisez et gérez tous les tickets clients.' : 'Suivez vos demandes et communiquez avec notre équipe.'}
            </p>
          </div>
          {user?.role !== 'admin' && (
              <Dialog open={showNewTicketDialog} onOpenChange={setShowNewTicketDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Nouveau Ticket
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <FormCard
                      title="Créer un nouveau ticket de support"
                      description="Veuillez décrire votre problème ou votre demande ci-dessous."
                  >
                    <FormSection>
                      <div className={styles.inputGroup}>
                        <Label htmlFor="newTicketSubject" className={styles.label}>Sujet *</Label>
                        <Input id="newTicketSubject" {...{ value: newTicketSubject, onChange: (e) => setNewTicketSubject(e.target.value) }} placeholder="Décrivez brièvement votre problème..." required />
                      </div>
                      <div className={styles.inputGroup}>
                        <Label htmlFor="newTicketDescription" className={styles.label}>Description détaillée *</Label>
                        <Textarea id="newTicketDescription" {...{ value: newTicketDescription, onChange: (e) => setNewTicketDescription(e.target.value) }} placeholder="Décrivez votre problème en détail..." rows={6} required />
                      </div>
                      <div className={styles.inputGroup}>
                        <Label htmlFor="newTicketCategory" className={styles.label}>Catégorie *</Label>
                        <Select value={newTicketCategoryId} onValueChange={setNewTicketCategoryId}>
                          <SelectTrigger id="newTicketCategory"><SelectValue placeholder="Sélectionner une catégorie" /></SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (<SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className={styles.inputGroup}>
                        <Label htmlFor="newTicketPriority" className={styles.label}>Priorité *</Label>
                        <Select value={newTicketPriority} onValueChange={(value: Ticket['priority']) => setNewTicketPriority(value)}>
                          <SelectTrigger id="newTicketPriority"><SelectValue placeholder="Sélectionner une priorité" /></SelectTrigger>
                          <SelectContent>
                            {availablePriorities.map(priority => (<SelectItem key={priority} value={priority} className="capitalize">{priority.charAt(0).toUpperCase() + priority.slice(1)}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                    </FormSection>
                    <div className={styles.buttonsWrapper}>
                      <Button variant="outline" onClick={() => setShowNewTicketDialog(false)} disabled={actionLoading === 'create'}>Annuler</Button>
                      <Button onClick={handleCreateTicket} disabled={!newTicketSubject.trim() || !newTicketDescription.trim() || !newTicketCategoryId || !newTicketPriority || actionLoading === 'create'}>
                        {actionLoading === 'create' ? 'Création...' : 'Créer le ticket'}
                      </Button>
                    </div>
                  </FormCard>
                </DialogContent>
              </Dialog>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 p-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder={user?.role === 'admin' ? "Rechercher par N°, sujet, entreprise..." : "Rechercher par N° ou sujet..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap md:flex-nowrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {availableStatuses.map(status => (<SelectItem key={status} value={status} className="capitalize">{status.replace(/_/g, ' ')}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Priorité" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes priorités</SelectItem>
                {availablePriorities.map(priority => (<SelectItem key={priority} value={priority} className="capitalize">{priority}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Catégorie" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map(category => (<SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 flex-grow">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-lg text-foreground">Ticket #{ticket.number}</h3>
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                        {ticket.categoryName && (<Badge variant="outline" className="text-xs">{ticket.categoryName}</Badge>)}
                      </div>
                      <h4 className="text-foreground font-medium">{ticket.subject}</h4>
                      {user?.role === 'admin' && (<p className="text-sm text-muted-foreground"><strong>Entreprise:</strong> {ticket.companyName}</p>)}
                      <div className="flex flex-col md:flex-row md:items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Créé le: {formatDateTime(ticket.createdAt)}</span>
                        <span>Dernière MàJ: {formatDateTime(ticket.updatedAt)}</span>
                        {ticket.assignedTo && (<span>Assigné à: {ticket.assignedTo}</span>)}
                      </div>
                    </div>
                    <div className="flex items-center justify-end flex-shrink-0 w-full sm:w-auto">
                      <Dialog onOpenChange={(open) => { if (!open) setSelectedTicket(null); else setSelectedTicket(ticket); }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex items-center gap-2 w-full sm:w-auto"><EyeIcon className="h-4 w-4" />Voir détails</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0">
                          <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
                            <DialogTitle className="flex items-center justify-between">
                              <span>Ticket #{selectedTicket?.number}</span>
                              <span className="text-base font-normal text-muted-foreground ml-4">{selectedTicket?.subject}</span>
                            </DialogTitle>
                            <DialogDescription>Consultez les détails et la conversation pour ce ticket.</DialogDescription>
                          </DialogHeader>
                          {selectedTicket && (
                              <>
                                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                                  {/* Section Détails du Ticket */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg text-sm">
                                    <div className="flex items-center gap-2">
                                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                                      <strong>Client:</strong> {selectedTicket.companyName}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                      <strong>Créé le:</strong> {formatDateTime(selectedTicket.createdAt)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <strong>Statut:</strong> {getStatusBadge(selectedTicket.status)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <strong>Priorité:</strong> {getPriorityBadge(selectedTicket.priority)}
                                    </div>
                                    {selectedTicket.categoryName && (
                                        <div className="flex items-center gap-2">
                                          <strong>Catégorie:</strong> <Badge variant="outline" className="text-xs">{selectedTicket.categoryName}</Badge>
                                        </div>
                                    )}
                                    {selectedTicket.assignedTo && (
                                        <div className="flex items-center gap-2">
                                          <strong>Assigné à:</strong> {selectedTicket.assignedTo}
                                        </div>
                                    )}
                                    <div className="col-span-full mt-2">
                                      <strong>Description initiale:</strong>
                                      <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{selectedTicket.description}</p>
                                    </div>
                                  </div>

                                  {/* Section Conversation */}
                                  <div className="space-y-4">
                                    <h4 className="font-medium text-foreground">Conversation</h4>
                                    <div className="space-y-3 border rounded-md p-3 bg-background max-h-[350px] overflow-y-auto">
                                      {selectedTicket.messages.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Aucun message.</p>}
                                      {selectedTicket.messages.map((message) => (
                                          <div key={message.id} className={cn(
                                              "p-3 rounded-lg text-sm",
                                              message.authorRole === (user?.role === 'admin' ? 'admin' : 'client') ? 'bg-primary/10 ml-auto max-w-[85%]' : 'bg-muted mr-auto max-w-[85%]'
                                          )}>
                                            <div className="flex justify-between items-center mb-1">
                                              <span className="font-semibold text-foreground">{message.authorName} {message.authorRole === 'admin' && '(Support)'}</span>
                                              <span className="text-xs text-muted-foreground">{formatDateTime(message.createdAt)}</span>
                                            </div>
                                            <p className="text-foreground whitespace-pre-wrap">{message.content}</p>
                                          </div>
                                      ))}
                                      <div ref={messagesEndRef} />
                                    </div>
                                  </div>

                                  {/* Section Réponse */}
                                  {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                                      <div className="pt-4 border-t">
                                        <Label htmlFor="replyMessage" className={styles.label}>Votre réponse</Label>
                                        <Textarea id="replyMessage" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Tapez votre message..." rows={3} className="flex-1 mt-1" />
                                        <div className="flex justify-end mt-2">
                                          <Button onClick={handleSendMessage} disabled={!newMessage.trim() || actionLoading === `message-${selectedTicket.id}`} className="flex items-center gap-2">
                                            <Send className="h-4 w-4" />
                                            {actionLoading === `message-${selectedTicket.id}` ? 'Envoi...' : 'Envoyer'}
                                          </Button>
                                        </div>
                                      </div>
                                  )}
                                </div>
                                {/* Footer pour actions client */}
                                {user?.role !== 'admin' && (selectedTicket.status === 'resolved' || selectedTicket.status === 'pending_client_response') && (
                                    <DialogFooter className="p-6 border-t flex-shrink-0">
                                      <Button size="sm" variant="outline" onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'closed')} disabled={actionLoading === `status-${selectedTicket.id}`}>Fermer le Ticket</Button>
                                    </DialogFooter>
                                )}
                              </>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>
        {filteredTickets.length === 0 && !loading && (
            <Card><CardContent className="p-8 text-center"><MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" /><p className="text-muted-foreground">Aucun ticket trouvé.</p></CardContent></Card>
        )}
      </div>
  );
};

export default Support;