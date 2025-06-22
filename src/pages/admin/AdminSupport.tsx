// src/pages/admin/AdminSupport.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatDate, formatDateTime, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ticketsApi, ticketCategoriesApi } from '@/services/api';
import { Ticket, TicketCategory, TicketMessage } from '@/types';
import { Search, MessageSquare, Building, Calendar, User, Send, Eye, Filter, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formStyles as styles } from '@/components/forms/FormStyles';
import { FormSection } from '@/components/forms/SharedFormComponents';


const AdminSupport = () => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
  const [isModalFullScreen, setIsModalFullScreen] = useState(false);

  const [editingTicketStatus, setEditingTicketStatus] = useState<Ticket['status']>();
  const [editingTicketPriority, setEditingTicketPriority] = useState<Ticket['priority']>();
  const [editingTicketCategoryId, setEditingTicketCategoryId] = useState<string>();
  const [editingTicketAssignedTo, setEditingTicketAssignedTo] = useState<string>();
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);

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
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTicketsAndCategories();
  }, [loadTicketsAndCategories]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = (
          ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.number.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'all' || ticket.categoryId === categoryFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim() || !user) return;
    try {
      setActionLoading(`message-${selectedTicket.id}`);
      const optimisticMessage: TicketMessage = {
        id: `temp-${Date.now()}`, ticketId: selectedTicket.id, content: replyMessage,
        authorId: user.id, authorName: `${user.firstName} ${user.lastName}`, authorRole: 'admin',
        createdAt: new Date(), attachments: []
      };
      setSelectedTicket(prev => prev ? { ...prev, messages: [...prev.messages, optimisticMessage] } : null);
      const updatedTicket = await ticketsApi.addMessage(selectedTicket.id, {
        content: replyMessage, authorId: user.id, authorName: `${user.firstName} ${user.lastName}`, authorRole: 'admin'
      });
      setTickets(prevTickets => prevTickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
      setReplyMessage('');
      toast.success('Message envoyé avec succès');
      scrollToBottom();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
      if (selectedTicket) {
        const currentTicket = tickets.find(t => t.id === selectedTicket.id);
        setSelectedTicket(currentTicket || null);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateTicketDetails = async () => {
    if (!selectedTicket) return;
    try {
      setActionLoading(`details-${selectedTicket.id}`);
      const updatedTicket = await ticketsApi.updateStatus(
          selectedTicket.id, editingTicketStatus || selectedTicket.status,
          editingTicketPriority || selectedTicket.priority, editingTicketAssignedTo, editingTicketCategoryId
      );
      setTickets(prevTickets => prevTickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
      setSelectedTicket(updatedTicket);
      toast.success('Ticket mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du ticket');
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
      toast.success(`Ticket N°${ticketToDelete.number} supprimé`);
    } catch (error) {
      toast.error('Erreur lors de la suppression du ticket');
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
    setIsModalFullScreen(false);
  };

  const getStatusBadge = (status: Ticket['status']) => {
    const variants: { [key in Ticket['status']]: string } = {
      open: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200',
      in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100',
      closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      pending_admin_response: 'bg-purple-100 text-purple-800 dark:bg-purple-600 dark:text-purple-100',
      pending_client_response: 'bg-pink-100 text-pink-800 dark:bg-pink-600 dark:text-pink-100'
    };
    const labels: { [key in Ticket['status']]: string } = {
      open: 'Ouvert', in_progress: 'En cours', resolved: 'Résolu', closed: 'Fermé',
      pending_admin_response: 'Attente Admin', pending_client_response: 'Attente Client'
    };
    return <Badge className={cn(variants[status])}>{labels[status]}</Badge>;
  };

  const getPriorityBadge = (priority: Ticket['priority']) => {
    const variants = {
      low: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-600 dark:text-orange-100',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'
    };
    const labels = { low: 'Faible', medium: 'Moyenne', high: 'Élevée', urgent: 'Urgente' };
    return <Badge className={cn(variants[priority])}>{labels[priority]}</Badge>;
  };

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

        <div className="flex flex-col md:flex-row gap-4 p-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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

        <div className="grid gap-4">
          {filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 flex-grow">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="p-2 bg-primary/10 rounded-lg"><MessageSquare className="h-5 w-5 text-primary" /></div>
                        <div>
                          <h3 className="text-lg font-semibold">{ticket.subject}</h3>
                          <p className="text-sm text-muted-foreground">{ticket.number}</p>
                        </div>
                        {ticket.categoryName && (<Badge variant="outline" className="text-xs">{ticket.categoryName}</Badge>)}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1"><Building className="h-4 w-4" /><span>{ticket.companyName}</span></div>
                        <div className="flex items-center gap-1"><Calendar className="h-4 w-4" /><span>Créé le {formatDate(ticket.createdAt)}</span></div>
                        <div className="flex items-center gap-1"><User className="h-4 w-4" /><span>{ticket.messages.length} message(s)</span></div>
                        {ticket.assignedTo && (<div className="flex items-center gap-1"><User className="h-4 w-4" /><span>Assigné à: {ticket.assignedTo}</span></div>)}
                      </div>
                    </div>
                    <div className="flex items-center justify-end flex-shrink-0 w-full sm:w-auto gap-2">
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                      <Dialog open={selectedTicket?.id === ticket.id} onOpenChange={(open) => { if (!open) { setSelectedTicket(null); setIsModalFullScreen(false); } else { openTicketDetailsDialog(ticket); } }}>
                        <DialogTrigger asChild><Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-2" />Voir</Button></DialogTrigger>
                        <DialogContent className={cn("flex flex-col transition-all duration-300 ease-in-out", isModalFullScreen ? "fixed inset-0 w-screen h-screen max-w-none rounded-none p-0" : "sm:max-w-[800px] max-h-[90vh] p-0")}>
                          <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
                            <DialogTitle>Ticket {selectedTicket?.number}</DialogTitle>
                            <DialogDescription>Détails et conversation pour le ticket {selectedTicket?.subject}</DialogDescription>
                            <Button variant="ghost" size="icon" onClick={() => setIsModalFullScreen(!isModalFullScreen)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground h-8 w-8" title={isModalFullScreen ? "Réduire" : "Agrandir"}>
                              {isModalFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                            </Button>
                          </DialogHeader>
                          {selectedTicket && (
                              <>
                                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                                  {/* Section Détails du Ticket */}
                                  <FormSection>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                                      <div className={styles.inputGroup}><Label className={styles.label}>Sujet</Label><p className="text-sm text-foreground">{selectedTicket.subject}</p></div>
                                      <div className={styles.inputGroup}><Label className={styles.label}>Entreprise</Label><p className="text-sm text-foreground">{selectedTicket.companyName}</p></div>
                                      <div className={styles.inputGroup}><Label className={styles.label}>Créé le</Label><p className="text-sm text-foreground">{formatDateTime(selectedTicket.createdAt)}</p></div>
                                      <div className={styles.inputGroup}><Label className={styles.label}>Dernière MàJ</Label><p className="text-sm text-foreground">{formatDateTime(selectedTicket.updatedAt)}</p></div>
                                      <div className={styles.inputGroup}><Label htmlFor="ticketStatusAdmin" className={styles.label}>Statut</Label><Select value={editingTicketStatus} onValueChange={(val) => setEditingTicketStatus(val as Ticket['status'])} disabled={actionLoading === `details-${selectedTicket.id}`}><SelectTrigger id="ticketStatusAdmin" className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent>{availableStatuses.map(s => (<SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</SelectItem>))}</SelectContent></Select></div>
                                      <div className={styles.inputGroup}><Label htmlFor="ticketPriorityAdmin" className={styles.label}>Priorité</Label><Select value={editingTicketPriority} onValueChange={(val) => setEditingTicketPriority(val as Ticket['priority'])} disabled={actionLoading === `details-${selectedTicket.id}`}><SelectTrigger id="ticketPriorityAdmin" className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent>{availablePriorities.map(p => (<SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>))}</SelectContent></Select></div>
                                      <div className={styles.inputGroup}><Label htmlFor="ticketCategoryAdmin" className={styles.label}>Catégorie</Label><Select value={editingTicketCategoryId || ''} onValueChange={setEditingTicketCategoryId} disabled={actionLoading === `details-${selectedTicket.id}`}><SelectTrigger id="ticketCategoryAdmin" className="mt-1 h-9 text-sm"><SelectValue placeholder="Changer catégorie" /></SelectTrigger><SelectContent>{categories.map(category => (<SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>))}</SelectContent></Select></div>
                                      <div className={styles.inputGroup}><Label htmlFor="ticketAssignedToAdmin" className={styles.label}>Assigné à</Label><Input id="ticketAssignedToAdmin" value={editingTicketAssignedTo || ''} onChange={(e) => setEditingTicketAssignedTo(e.target.value)} placeholder="Nom de l'agent" className="mt-1 h-9 text-sm" disabled={actionLoading === `details-${selectedTicket.id}`} /></div>
                                    </div>
                                  </FormSection>
                                  <div className="mt-4"><strong className="text-sm text-foreground">Description initiale:</strong><p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{selectedTicket.description}</p></div>

                                  {/* Section Conversation */}
                                  <div className="space-y-4">
                                    <h4 className="font-medium text-foreground">Conversation</h4>
                                    <div className="space-y-3 border rounded-md p-3 bg-background max-h-[350px] overflow-y-auto">
                                      {selectedTicket.messages.length === 0 && (<p className="text-xs text-muted-foreground text-center py-4">Aucun message.</p>)}
                                      {selectedTicket.messages.map((message) => (
                                          <div key={message.id} className={cn("p-2.5 rounded-lg text-sm", message.authorRole === 'admin' ? "bg-primary/10 border-l-2 border-primary" : "bg-muted")}>
                                            <div className="flex justify-between items-center mb-1"><span className="font-semibold text-foreground">{message.authorName} {message.authorRole === 'admin' && '(Support)'}</span><span className="text-xs text-muted-foreground">{formatDateTime(message.createdAt)}</span></div>
                                            <p className="text-foreground whitespace-pre-wrap">{message.content}</p>
                                          </div>
                                      ))}
                                      <div ref={messagesEndRef} />
                                    </div>
                                  </div>

                                  {/* Section Réponse */}
                                  {selectedTicket.status !== 'closed' && (
                                      <div className="pt-4 border-t">
                                        <Label htmlFor="replyMessageAdmin" className={styles.label}>Votre réponse</Label>
                                        <Textarea id="replyMessageAdmin" value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} placeholder="Tapez votre message..." rows={3} className="text-sm mt-1" />
                                        <div className="flex justify-end mt-2">
                                          <Button onClick={handleSendReply} disabled={!replyMessage.trim() || actionLoading === `message-${selectedTicket.id}`} className="flex items-center gap-2" size="sm">
                                            <Send className="h-3.5 w-3.5" />
                                            {actionLoading === `message-${selectedTicket.id}` ? 'Envoi...' : 'Envoyer'}
                                          </Button>
                                        </div>
                                      </div>
                                  )}
                                </div>
                                {/* Footer pour actions admin */}
                                <DialogFooter className="p-6 border-t flex-shrink-0 flex flex-col sm:flex-row justify-between items-center gap-2">
                                  <div>
                                    <Button onClick={handleUpdateTicketDetails} disabled={actionLoading === `details-${selectedTicket.id}`}>
                                      {actionLoading === `details-${selectedTicket.id}` ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                                    </Button>
                                  </div>
                                  <div>
                                    <AlertDialog open={!!ticketToDelete && ticketToDelete.id === selectedTicket.id} onOpenChange={(open) => !open && setTicketToDelete(null)}>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm" onClick={() => setTicketToDelete(selectedTicket)} disabled={actionLoading === `delete-${selectedTicket.id}`} className="flex items-center gap-1.5">
                                          <Trash2 className="h-4 w-4" />Supprimer
                                        </Button>
                                      </AlertDialogTrigger>
                                      {ticketToDelete && ticketToDelete.id === selectedTicket.id && (
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                Êtes-vous sûr de vouloir supprimer le ticket N°{ticketToDelete.number} ({ticketToDelete.subject}) ? Cette action est irréversible.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel onClick={() => setTicketToDelete(null)}>Annuler</AlertDialogCancel>
                                              <AlertDialogAction onClick={handleDeleteTicket} className="bg-destructive hover:bg-destructive/90">
                                                {actionLoading === `delete-${ticketToDelete.id}` ? 'Suppression...' : 'Confirmer la suppression'}
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                      )}
                                    </AlertDialog>
                                  </div>
                                </DialogFooter>
                              </>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
          ))}
          {filteredTickets.length === 0 && !loading && (
              <Card><CardContent className="p-8 text-center"><MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" /><p className="text-muted-foreground">Aucun ticket trouvé</p></CardContent></Card>
          )}
        </div>
      </div>
  );
};

export default AdminSupport;