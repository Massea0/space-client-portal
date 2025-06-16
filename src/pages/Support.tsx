
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatDateTime } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { mockTickets } from '@/data/mockData';
import { Ticket } from '@/types';
import { Plus, Search, Filter, MessageSquare, Paperclip, Send } from 'lucide-react';

const Support = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketDescription, setNewTicketDescription] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showNewTicketDialog, setShowNewTicketDialog] = useState(false);

  // Filter tickets based on user role
  const tickets = user?.role === 'admin' 
    ? mockTickets 
    : mockTickets.filter(ticket => ticket.companyId === user?.companyId);

  // Apply search and filters
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: Ticket['status']) => {
    const variants = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      open: 'Ouvert',
      in_progress: 'En cours',
      resolved: 'Résolu',
      closed: 'Fermé'
    };

    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: Ticket['priority']) => {
    const variants = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      low: 'Faible',
      medium: 'Moyenne',
      high: 'Élevée',
      urgent: 'Urgente'
    };

    return (
      <Badge className={variants[priority]}>
        {labels[priority]}
      </Badge>
    );
  };

  const handleCreateTicket = () => {
    if (!newTicketSubject.trim() || !newTicketDescription.trim()) return;
    
    console.log('Créer nouveau ticket:', {
      subject: newTicketSubject,
      description: newTicketDescription
    });
    
    // TODO: Implement ticket creation
    setNewTicketSubject('');
    setNewTicketDescription('');
    setShowNewTicketDialog(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;
    
    console.log('Envoyer message:', newMessage, 'Ticket:', selectedTicket.id);
    // TODO: Implement message sending
    setNewMessage('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {user?.role === 'admin' ? 'Tous les Tickets' : 'Support'}
          </h1>
          <p className="text-slate-600 mt-1">
            Gérez vos demandes de support et réclamations
          </p>
        </div>
        
        {user?.role !== 'admin' && (
          <Dialog open={showNewTicketDialog} onOpenChange={setShowNewTicketDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nouveau Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un nouveau ticket de support</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sujet
                  </label>
                  <Input
                    placeholder="Décrivez brièvement votre problème..."
                    value={newTicketSubject}
                    onChange={(e) => setNewTicketSubject(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description détaillée
                  </label>
                  <Textarea
                    placeholder="Décrivez votre problème en détail..."
                    value={newTicketDescription}
                    onChange={(e) => setNewTicketDescription(e.target.value)}
                    rows={6}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowNewTicketDialog(false)}>
                    Annuler
                  </Button>
                  <Button
                    onClick={handleCreateTicket}
                    disabled={!newTicketSubject.trim() || !newTicketDescription.trim()}
                  >
                    Créer le ticket
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par numéro, sujet ou entreprise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="open">Ouvert</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="resolved">Résolu</SelectItem>
                  <SelectItem value="closed">Fermé</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes priorités</SelectItem>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Élevée</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="grid gap-4">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-lg text-slate-900">
                      Ticket #{ticket.number}
                    </h3>
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
                  </div>
                  <h4 className="text-slate-700 font-medium">{ticket.subject}</h4>
                  {user?.role === 'admin' && (
                    <p className="text-slate-600">
                      <strong>Entreprise:</strong> {ticket.companyName}
                    </p>
                  )}
                  <p className="text-slate-600 text-sm line-clamp-2">
                    {ticket.description}
                  </p>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-sm text-slate-600">
                    <span>Créé le {formatDateTime(ticket.createdAt)}</span>
                    <span>Mis à jour le {formatDateTime(ticket.updatedAt)}</span>
                    {ticket.assignedTo && (
                      <span>Assigné à: {ticket.assignedTo}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTicket(ticket)}
                        className="flex items-center gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Voir détails
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Ticket #{ticket.number} - {ticket.subject}</DialogTitle>
                      </DialogHeader>
                      
                      {selectedTicket && (
                        <div className="space-y-6">
                          {/* Ticket Info */}
                          <div className="bg-slate-50 p-4 rounded-lg">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <strong>Statut:</strong> {getStatusBadge(selectedTicket.status)}
                              </div>
                              <div>
                                <strong>Priorité:</strong> {getPriorityBadge(selectedTicket.priority)}
                              </div>
                              <div>
                                <strong>Créé le:</strong> {formatDateTime(selectedTicket.createdAt)}
                              </div>
                              <div>
                                <strong>Dernière mise à jour:</strong> {formatDateTime(selectedTicket.updatedAt)}
                              </div>
                            </div>
                            <div className="mt-4">
                              <strong>Description:</strong>
                              <p className="text-slate-600 mt-1">{selectedTicket.description}</p>
                            </div>
                          </div>

                          {/* Messages */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-slate-900">Conversation</h4>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              {selectedTicket.messages.map((message) => (
                                <div
                                  key={message.id}
                                  className={`p-3 rounded-lg ${
                                    message.authorRole === 'client'
                                      ? 'bg-blue-50 ml-8'
                                      : 'bg-gray-50 mr-8'
                                  }`}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium text-sm">
                                      {message.authorName}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      {formatDateTime(message.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-slate-700">{message.content}</p>
                                  {message.attachments.length > 0 && (
                                    <div className="mt-2 flex gap-2">
                                      {message.attachments.map((attachment) => (
                                        <div key={attachment.id} className="flex items-center gap-1 text-sm text-blue-600">
                                          <Paperclip className="h-3 w-3" />
                                          {attachment.name}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* New Message */}
                          {selectedTicket.status !== 'closed' && (
                            <div className="border-t pt-4">
                              <div className="flex gap-2">
                                <Textarea
                                  placeholder="Tapez votre message..."
                                  value={newMessage}
                                  onChange={(e) => setNewMessage(e.target.value)}
                                  rows={3}
                                  className="flex-1"
                                />
                                <Button
                                  onClick={handleSendMessage}
                                  disabled={!newMessage.trim()}
                                  className="self-end"
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
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

      {filteredTickets.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-500">Aucun ticket trouvé</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Support;
