// src/pages/admin/AdminSupport.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Assurez-vous que cet import est correct
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // Ajouté pour l'accessibilité
  DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription as AlertDialogDescriptionComponent, // Renommé pour éviter conflit
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatDate, formatDateTime, cn } from '@/lib/utils'; // cn ajouté
import { useToast } from '@/hooks/useToast';
import { ticketsApi, ticketCategoriesApi } from '@/services/api';
import { Ticket, TicketCategory } from '@/types';
import { Search, MessageSquare, Building, Calendar, User, Send, Eye, Filter, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const AdminSupport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [editingTicketStatus, setEditingTicketStatus] = useState<Ticket['status'] | undefined>(undefined);
  const [editingTicketPriority, setEditingTicketPriority] = useState<Ticket['priority'] | undefined>(undefined);
  const [editingTicketCategoryId, setEditingTicketCategoryId] = useState<string | undefined>(undefined);
  const [editingTicketAssignedTo, setEditingTicketAssignedTo] = useState<string | undefined>(undefined);

  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);
  const [isModalFullScreen, setIsModalFullScreen] = useState(false);


  const loadTicketsAndCategories = useCallback(async () => {
    try {
      setLoading(true);
      const [ticketsData, categoriesData] = await Promise.all([
        ticketsApi.getAll(),
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
  }, [toast]);

  useEffect(() => {
    loadTicketsAndCategories();
  }, [loadTicketsAndCategories]);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || ticket.categoryId === categoryFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim() || !user) return;
    try {
      setActionLoading(`message-${selectedTicket.id}`);
      const updatedTicket = await ticketsApi.addMessage(selectedTicket.id, {
        content: replyMessage,
        authorId: user.id,
        authorName: `${user.firstName} ${user.lastName}`,
        authorRole: 'admin'
      });
      setSelectedTicket(updatedTicket);
      setReplyMessage('');
      setTickets(prevTickets => prevTickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
      toast({ title: 'Succès', description: 'Réponse envoyée', variant: 'success' });
    } catch (error) {
      toast({ title: 'Erreur', description: (error as Error).message || 'Impossible d\'envoyer la réponse', variant: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateTicketDetails = async () => {
    if (!selectedTicket) return;
    try {
      setActionLoading(`details-${selectedTicket.id}`);
      const updatedTicket = await ticketsApi.updateStatus(
          selectedTicket.id,
          editingTicketStatus || selectedTicket.status,
          editingTicketPriority || selectedTicket.priority,
          editingTicketAssignedTo,
          editingTicketCategoryId
      );
      setTickets(prevTickets => prevTickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
      setSelectedTicket(updatedTicket);
      toast({ title: 'Succès', description: 'Détails du ticket mis à jour.', variant: 'success' });
    } catch (error) {
      toast({ title: 'Erreur', description: (error as Error).message || 'Impossible de mettre à jour les détails du ticket.', variant: 'error' });
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
      toast({ title: 'Succès', description: `Ticket N°${ticketToDelete.number} supprimé.`, variant: 'success' });
    } catch (error) {
      toast({ title: 'Erreur', description: (error as Error).message || 'Impossible de supprimer le ticket.', variant: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const openTicketDetailsDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setEditingTicketStatus(ticket.status);
    setEditingTicketPriority(ticket.priority);
    setEditingTicketCategoryId(ticket.categoryId);
    setEditingTicketAssignedTo(ticket.assignedTo);
    setIsModalFullScreen(false); // Réinitialiser le mode plein écran à l'ouverture
  };


  const getStatusBadge = (status: Ticket['status']) => {
    const variants: { [key in Ticket['status']]: string } = { open: 'bg-blue-100 text-blue-800', in_progress: 'bg-yellow-100 text-yellow-800', resolved: 'bg-green-100 text-green-800', closed: 'bg-gray-100 text-gray-800', pending_admin_response: 'bg-purple-100 text-purple-800', pending_client_response: 'bg-pink-100 text-pink-800'};
    const labels: { [key in Ticket['status']]: string } = { open: 'Ouvert', in_progress: 'En cours', resolved: 'Résolu', closed: 'Fermé', pending_admin_response: 'Attente Admin', pending_client_response: 'Attente Client'};
    return <Badge className={variants[status] || 'bg-slate-100 text-slate-800'}>{labels[status] || status}</Badge>;
  };

  const getPriorityBadge = (priority: Ticket['priority']) => {
    const variants = { low: 'bg-green-100 text-green-800', medium: 'bg-yellow-100 text-yellow-800', high: 'bg-orange-100 text-orange-800', urgent: 'bg-red-100 text-red-800'};
    const labels = { low: 'Faible', medium: 'Moyenne', high: 'Élevée', urgent: 'Urgente'};
    return <Badge className={variants[priority] || 'bg-slate-100 text-slate-800'}>{labels[priority] || priority}</Badge>;
  };

  if (loading) {
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
            <h1 className="text-3xl font-bold text-slate-900">Tous les Tickets</h1>
            <p className="text-slate-600 mt-1">Gérez tous les tickets de support</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input placeholder="Rechercher par sujet, entreprise ou numéro..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
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

        <div className="grid gap-6">
          {filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="p-2 bg-arcadis-gradient rounded-lg"><MessageSquare className="h-5 w-5 text-white" /></div>
                        <div>
                          <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                          <p className="text-sm text-slate-600">{ticket.number}</p>
                        </div>
                        {ticket.categoryName && (<Badge variant="outline" className="text-xs">{ticket.categoryName}</Badge>)}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                        <div className="flex items-center gap-1"><Building className="h-4 w-4" /><span>{ticket.companyName}</span></div>
                        <div className="flex items-center gap-1"><Calendar className="h-4 w-4" /><span>Créé le {formatDate(new Date(ticket.createdAt))}</span></div>
                        <div className="flex items-center gap-1"><User className="h-4 w-4" /><span>{ticket.messages.length} message(s)</span></div>
                        {ticket.assignedTo && <div className="flex items-center gap-1"><User className="h-4 w-4 text-blue-500" /><span>Assigné à: {ticket.assignedTo}</span></div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                      <Dialog
                          open={selectedTicket?.id === ticket.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setSelectedTicket(null);
                              setIsModalFullScreen(false); // Réinitialiser si la modale est fermée
                            } else {
                              openTicketDetailsDialog(ticket);
                            }
                          }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-2" />Voir</Button>
                        </DialogTrigger>
                        <DialogContent className={cn(
                            "flex flex-col transition-all duration-300 ease-in-out",
                            isModalFullScreen
                                ? "fixed inset-0 z-[100] w-screen h-screen max-w-none max-h-none rounded-none"
                                : "max-w-4xl max-h-[90vh]"
                        )}>
                          <DialogHeader className="relative pr-12"> {/* Espace pour les boutons */}
                            <DialogTitle>Ticket {selectedTicket?.number}</DialogTitle>
                            <DialogDescription>
                              Détails et conversation pour le ticket {selectedTicket?.subject}.
                            </DialogDescription>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsModalFullScreen(!isModalFullScreen)}
                                className="absolute top-1 right-10 text-slate-500 hover:text-slate-700 h-8 w-8"
                                title={isModalFullScreen ? "Réduire" : "Agrandir"}
                            >
                              {isModalFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                            </Button>
                          </DialogHeader>
                          {selectedTicket && (
                              <div className="flex-grow overflow-y-auto space-y-6 pr-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                                  <div><Label className="text-xs font-medium text-slate-500">Sujet</Label><p className="text-sm text-slate-900">{selectedTicket.subject}</p></div>
                                  <div><Label className="text-xs font-medium text-slate-500">Entreprise</Label><p className="text-sm text-slate-900">{selectedTicket.companyName}</p></div>
                                  <div><Label className="text-xs font-medium text-slate-500">Créé le</Label><p className="text-sm text-slate-900">{formatDateTime(new Date(selectedTicket.createdAt))}</p></div>
                                  <div><Label className="text-xs font-medium text-slate-500">Dernière MàJ</Label><p className="text-sm text-slate-900">{formatDateTime(new Date(selectedTicket.updatedAt))}</p></div>

                                  <div>
                                    <Label htmlFor="ticketStatusAdmin" className="text-xs font-medium text-slate-500">Statut</Label>
                                    <Select value={editingTicketStatus} onValueChange={(val) => setEditingTicketStatus(val as Ticket['status'])} disabled={actionLoading === `details-${selectedTicket.id}`}>
                                      <SelectTrigger id="ticketStatusAdmin" className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                                      <SelectContent>{availableStatuses.map(s => (<SelectItem key={s} value={s} className="capitalize text-sm">{s.replace(/_/g, ' ')}</SelectItem>))}</SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="ticketPriorityAdmin" className="text-xs font-medium text-slate-500">Priorité</Label>
                                    <Select value={editingTicketPriority} onValueChange={(val) => setEditingTicketPriority(val as Ticket['priority'])} disabled={actionLoading === `details-${selectedTicket.id}`}>
                                      <SelectTrigger id="ticketPriorityAdmin" className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                                      <SelectContent>{availablePriorities.map(p => (<SelectItem key={p} value={p} className="capitalize text-sm">{p}</SelectItem>))}</SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="ticketCategoryAdmin" className="text-xs font-medium text-slate-500">Catégorie</Label>
                                    <Select value={editingTicketCategoryId || ''} onValueChange={setEditingTicketCategoryId} disabled={actionLoading === `details-${selectedTicket.id}`}>
                                      <SelectTrigger id="ticketCategoryAdmin" className="mt-1 h-9 text-sm"><SelectValue placeholder="Changer catégorie" /></SelectTrigger>
                                      <SelectContent>{categories.map(category => (<SelectItem key={category.id} value={category.id} className="text-sm">{category.name}</SelectItem>))}</SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="ticketAssignedToAdmin" className="text-xs font-medium text-slate-500">Assigné à</Label>
                                    <Input id="ticketAssignedToAdmin" value={editingTicketAssignedTo || ''} onChange={(e) => setEditingTicketAssignedTo(e.target.value)} placeholder="Nom de l'agent" className="mt-1 h-9 text-sm" disabled={actionLoading === `details-${selectedTicket.id}`} />
                                  </div>
                                </div>

                                <div className="mt-4"><strong className="text-sm">Description initiale:</strong><p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{selectedTicket.description}</p></div>
                                <div className="space-y-4">
                                  <h4 className="font-medium text-slate-900 text-sm">Conversation</h4>
                                  <div className="space-y-3 max-h-[250px] overflow-y-auto border rounded-md p-3 bg-white">
                                    {selectedTicket.messages.length === 0 && <p className="text-xs text-slate-500 text-center py-4">Aucun message.</p>}
                                    {selectedTicket.messages.map((message) => (
                                        <div key={message.id} className={`p-2.5 rounded-lg text-xs ${message.authorRole === 'admin' ? 'bg-blue-50 border-l-2 border-blue-400' : 'bg-gray-50'}`}>
                                          <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold text-slate-800">{message.authorName} {message.authorRole === 'admin' && '(Support)'}</span>
                                            <span className="text-xs text-slate-500">{formatDateTime(message.createdAt)}</span>
                                          </div>
                                          <p className="text-slate-700 whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                    ))}
                                  </div>
                                </div>
                                {selectedTicket.status !== 'closed' && (
                                    <div className="border-t pt-4">
                                      <Label htmlFor="replyMessageAdmin" className="block text-sm font-medium text-slate-700 mb-1">Votre réponse</Label>
                                      <Textarea id="replyMessageAdmin" placeholder="Tapez votre message..." value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} rows={3} className="flex-1 text-sm" />
                                      <div className="flex justify-end mt-2">
                                        <Button onClick={handleSendReply} disabled={!replyMessage.trim() || actionLoading === `message-${selectedTicket.id}`} className="flex items-center gap-2" size="sm"><Send className="h-3.5 w-3.5" />{actionLoading === `message-${selectedTicket.id}` ? 'Envoi...' : 'Envoyer'}</Button>
                                      </div>
                                    </div>
                                )}
                                <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row justify-between items-center gap-2">
                                  <div>
                                    <Button onClick={handleUpdateTicketDetails} size="sm" disabled={actionLoading === `details-${selectedTicket.id}`}>
                                      {actionLoading === `details-${selectedTicket.id}` ? 'Sauvegarde...' : 'Sauvegarder les détails'}
                                    </Button>
                                  </div>
                                  <div>
                                    <AlertDialog open={!!ticketToDelete && ticketToDelete.id === selectedTicket.id} onOpenChange={(open) => !open && setTicketToDelete(null)}>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setTicketToDelete(selectedTicket)}
                                            disabled={actionLoading === `details-${selectedTicket.id}`}
                                            className="flex items-center gap-1.5"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          Supprimer
                                        </Button>
                                      </AlertDialogTrigger>
                                      {ticketToDelete && ticketToDelete.id === selectedTicket.id && (
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                              <AlertDialogDescriptionComponent> {/* Utilisé le nom renommé */}
                                                Êtes-vous sûr de vouloir supprimer le ticket N°{ticketToDelete.number} ({ticketToDelete.subject}) ?
                                                Cette action est irréversible.
                                              </AlertDialogDescriptionComponent>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel onClick={() => setTicketToDelete(null)} disabled={actionLoading === `delete-${ticketToDelete.id}`}>
                                                Annuler
                                              </AlertDialogCancel>
                                              <AlertDialogAction
                                                  onClick={handleDeleteTicket}
                                                  disabled={actionLoading === `delete-${ticketToDelete.id}`}
                                                  className="bg-destructive hover:bg-destructive/90"
                                              >
                                                {actionLoading === `delete-${ticketToDelete.id}` ? 'Suppression...' : 'Confirmer la suppression'}
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                      )}
                                    </AlertDialog>
                                  </div>
                                </div>
                              </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
              </Card>
          ))}
        </div>
        {filteredTickets.length === 0 && !loading && (
            <Card><CardContent className="p-8 text-center"><MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" /><p className="text-slate-500">Aucun ticket trouvé</p></CardContent></Card>
        )}
      </div>
  );
};

export default AdminSupport;