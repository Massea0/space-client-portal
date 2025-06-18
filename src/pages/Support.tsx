// src/pages/Support.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // AJOUTÉ
  DialogTrigger
} from '@/components/ui/dialog';
import { formatDateTime } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { ticketsApi, ticketCategoriesApi } from '@/services/api';
import { Ticket, TicketCategory } from '@/types';
import { Plus, Search, Filter, MessageSquare, Paperclip, Send, Eye as EyeIcon } from 'lucide-react';

const Support = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketDescription, setNewTicketDescription] = useState('');
  const [newTicketCategoryId, setNewTicketCategoryId] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [showNewTicketDialog, setShowNewTicketDialog] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
      const companyIdForRequest = user.companyId ?? '';

      const [ticketsData, categoriesData] = await Promise.all([
        user.role === 'admin'
            ? ticketsApi.getAll()
            : ticketsApi.getByCompany(companyIdForRequest),
        ticketCategoriesApi.getAll()
      ]);

      setTickets(ticketsData);
      setCategories(categoriesData);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données de support',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

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
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      pending_admin_response: 'bg-purple-100 text-purple-800',
      pending_client_response: 'bg-pink-100 text-pink-800',
    };
    const labels: { [key in Ticket['status']]: string } = {
      open: 'Ouvert',
      in_progress: 'En cours',
      resolved: 'Résolu',
      closed: 'Fermé',
      pending_admin_response: 'Attente Admin',
      pending_client_response: 'Attente Client',
    };
    return <Badge className={variants[status] || 'bg-slate-100 text-slate-800'}>{labels[status] || status}</Badge>;
  };

  const getPriorityBadge = (priority: Ticket['priority']) => {
    const variants = { low: 'bg-green-100 text-green-800', medium: 'bg-yellow-100 text-yellow-800', high: 'bg-orange-100 text-orange-800', urgent: 'bg-red-100 text-red-800' };
    const labels = { low: 'Faible', medium: 'Moyenne', high: 'Élevée', urgent: 'Urgente' };
    return <Badge className={variants[priority]}>{labels[priority]}</Badge>;
  };

  const handleCreateTicket = async () => {
    if (!newTicketSubject.trim() || !newTicketDescription.trim() || !user?.companyId || !newTicketCategoryId) {
      toast({ title: "Validation", description: "Sujet, description et catégorie sont requis.", variant: "warning" });
      return;
    }
    try {
      setActionLoading('create');
      await ticketsApi.create({
        subject: newTicketSubject,
        description: newTicketDescription,
        companyId: user.companyId,
        companyName: user.companyName || 'N/A',
        categoryId: newTicketCategoryId,
      });
      await loadTicketsAndCategories();
      setNewTicketSubject('');
      setNewTicketDescription('');
      setNewTicketCategoryId('');
      setShowNewTicketDialog(false);
      toast({ title: 'Succès', description: 'Ticket créé avec succès', variant: 'success' });
    } catch (error) {
      toast({ title: 'Erreur', description: (error as Error).message || 'Impossible de créer le ticket', variant: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket || !user) return;
    try {
      setActionLoading(`message-${selectedTicket.id}`);
      const updatedTicket = await ticketsApi.addMessage(selectedTicket.id, {
        content: newMessage,
        authorId: user.id,
        authorName: `${user.firstName} ${user.lastName}`.trim(),
        authorRole: user.role === 'admin' ? 'admin' : 'client'
      });
      setSelectedTicket(updatedTicket);
      setNewMessage('');
      setTickets(prevTickets => prevTickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
      toast({ title: 'Succès', description: 'Message envoyé', variant: 'success' });
    } catch (error) {
      toast({ title: 'Erreur', description: (error as Error).message || 'Impossible d\'envoyer le message', variant: 'error' });
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
      toast({ title: 'Succès', description: `Statut du ticket mis à jour.`, variant: 'success' });
    } catch (error) {
      toast({ title: 'Erreur', description: (error as Error).message || 'Impossible de mettre à jour le ticket', variant: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && tickets.length === 0) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arcadis-orange mx-auto"></div>
            <p className="mt-4 text-slate-600">Chargement des tickets...</p>
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
            <h1 className="text-3xl font-bold text-slate-900">
              {user?.role === 'admin' ? 'Gestion des Tickets' : 'Mes Tickets de Support'}
            </h1>
            <p className="text-slate-600 mt-1">
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
                  <DialogHeader>
                    <DialogTitle>Créer un nouveau ticket de support</DialogTitle>
                    <DialogDescription>
                      Veuillez décrire votre problème ou votre demande ci-dessous.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label htmlFor="newTicketSubject" className="block text-sm font-medium text-slate-700 mb-1">Sujet *</label>
                      <Input id="newTicketSubject" placeholder="Décrivez brièvement votre problème..." value={newTicketSubject} onChange={(e) => setNewTicketSubject(e.target.value)} required />
                    </div>
                    <div>
                      <label htmlFor="newTicketDescription" className="block text-sm font-medium text-slate-700 mb-1">Description détaillée *</label>
                      <Textarea id="newTicketDescription" placeholder="Décrivez votre problème en détail..." value={newTicketDescription} onChange={(e) => setNewTicketDescription(e.target.value)} rows={6} required />
                    </div>
                    <div>
                      <label htmlFor="newTicketCategory" className="block text-sm font-medium text-slate-700 mb-1">Catégorie *</label>
                      <Select value={newTicketCategoryId} onValueChange={setNewTicketCategoryId}>
                        <SelectTrigger id="newTicketCategory">
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <Button variant="outline" onClick={() => setShowNewTicketDialog(false)} disabled={actionLoading === 'create'}>Annuler</Button>
                      <Button onClick={handleCreateTicket} disabled={!newTicketSubject.trim() || !newTicketDescription.trim() || !newTicketCategoryId || actionLoading === 'create'}>
                        {actionLoading === 'create' ? 'Création...' : 'Créer le ticket'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
          )}
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
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
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="space-y-2 flex-grow">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-lg text-slate-900">Ticket #{ticket.number}</h3>
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                        {ticket.categoryName && (<Badge variant="outline" className="text-xs">{ticket.categoryName}</Badge>)}
                      </div>
                      <h4 className="text-slate-700 font-medium">{ticket.subject}</h4>
                      {user?.role === 'admin' && (<p className="text-sm text-slate-600"><strong>Entreprise:</strong> {ticket.companyName}</p>)}
                      <p className="text-sm text-slate-600 line-clamp-2">{ticket.description}</p>
                      <div className="flex flex-col md:flex-row md:items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>Créé le: {formatDateTime(ticket.createdAt)}</span>
                        <span>Dernière MàJ: {formatDateTime(ticket.updatedAt)}</span>
                        {ticket.assignedTo && (<span>Assigné à: {ticket.assignedTo}</span>)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 mt-2 sm:mt-0 flex-shrink-0">
                      <Dialog onOpenChange={(open) => { if (!open) setSelectedTicket(null); else setSelectedTicket(ticket); }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex items-center gap-2 w-full sm:w-auto"><EyeIcon className="h-4 w-4" />Voir détails</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                          <DialogHeader>
                            <DialogTitle className="flex items-center justify-between"><span>Ticket #{selectedTicket?.number} - {selectedTicket?.subject}</span></DialogTitle>
                            <DialogDescription>
                              Consultez les détails et la conversation pour ce ticket.
                            </DialogDescription>
                          </DialogHeader>
                          {selectedTicket && (
                              <div className="flex-grow overflow-y-auto space-y-6 pr-2">
                                <div className="bg-slate-50 p-4 rounded-lg">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><strong>Statut:</strong> {getStatusBadge(selectedTicket.status)}</div>
                                    <div><strong>Priorité:</strong> {getPriorityBadge(selectedTicket.priority)}</div>
                                    {selectedTicket.categoryName && (<div><strong>Catégorie:</strong> {selectedTicket.categoryName}</div>)}
                                    <div><strong>Créé le:</strong> {formatDateTime(selectedTicket.createdAt)}</div>
                                    <div><strong>Dernière MàJ:</strong> {formatDateTime(selectedTicket.updatedAt)}</div>
                                    {user?.role === 'admin' && <div><strong>Client:</strong> {selectedTicket.companyName}</div>}
                                  </div>
                                  <div className="mt-4"><strong>Description initiale:</strong><p className="text-slate-600 mt-1 whitespace-pre-wrap">{selectedTicket.description}</p></div>
                                </div>
                                <div className="space-y-4">
                                  <h4 className="font-medium text-slate-900">Conversation</h4>
                                  <div className="space-y-3 max-h-[300px] overflow-y-auto border rounded-md p-3 bg-white">
                                    {selectedTicket.messages.length === 0 && <p className="text-sm text-slate-500 text-center py-4">Aucun message.</p>}
                                    {selectedTicket.messages.map((message) => (
                                        <div key={message.id} className={`p-3 rounded-lg text-sm ${message.authorRole === (user?.role === 'admin' ? 'admin' : 'client') ? 'bg-blue-100 ml-auto max-w-[85%]' : 'bg-slate-100 mr-auto max-w-[85%]'}`}>
                                          <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold text-slate-800">{message.authorName} {message.authorRole === 'admin' && '(Support)'}</span>
                                            <span className="text-xs text-slate-500">{formatDateTime(message.createdAt)}</span>
                                          </div>
                                          <p className="text-slate-700 whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                    ))}
                                  </div>
                                </div>
                                {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                                    <div className="border-t pt-4">
                                      <label htmlFor="replyMessage" className="block text-sm font-medium text-slate-700 mb-1">Votre réponse</label>
                                      <Textarea id="replyMessage" placeholder="Tapez votre message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} rows={3} className="flex-1" />
                                      <div className="flex justify-end mt-2">
                                        <Button onClick={handleSendMessage} disabled={!newMessage.trim() || actionLoading === `message-${selectedTicket.id}`} className="flex items-center gap-2"><Send className="h-4 w-4" />{actionLoading === `message-${selectedTicket.id}` ? 'Envoi...' : 'Envoyer'}</Button>
                                      </div>
                                    </div>
                                )}
                                {user?.role === 'admin' && selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                                    <div className="flex gap-2 justify-end border-t pt-4">
                                      <Button size="sm" onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'resolved')} disabled={actionLoading === `status-${selectedTicket.id}`} className="bg-green-600 hover:bg-green-700">Marquer Résolu</Button>
                                      <Button size="sm" variant="outline" onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'closed')} disabled={actionLoading === `status-${selectedTicket.id}`}>Fermer le Ticket</Button>
                                    </div>
                                )}
                                {user?.role !== 'admin' && (selectedTicket.status === 'resolved' || selectedTicket.status === 'pending_client_response') && (
                                    <div className="flex gap-2 justify-end border-t pt-4">
                                      <Button size="sm" variant="outline" onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'closed')} disabled={actionLoading === `status-${selectedTicket.id}`}>Fermer le Ticket</Button>
                                    </div>
                                )}
                              </div>
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
            <Card><CardContent className="p-8 text-center"><MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" /><p className="text-slate-500">Aucun ticket trouvé.</p></CardContent></Card>
        )}
      </div>
  );
};

export default Support;