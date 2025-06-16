
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { mockDevis } from '@/data/mockData';
import { Devis } from '@/types';
import { Download, Search, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';

const DevisPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedDevis, setSelectedDevis] = useState<Devis | null>(null);

  // Filter devis based on user role
  const devisList = user?.role === 'admin' 
    ? mockDevis 
    : mockDevis.filter(devis => devis.companyId === user?.companyId);

  // Apply search and filters
  const filteredDevis = devisList.filter(devis => {
    const matchesSearch = devis.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         devis.object.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         devis.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || devis.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Devis['status']) => {
    const variants = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800'
    };
    
    const labels = {
      draft: 'Brouillon',
      sent: 'Envoyé',
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      expired: 'Expiré'
    };

    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const handleApprove = (devisId: string) => {
    console.log('Approuver le devis:', devisId);
    // TODO: Implement approval logic
  };

  const handleReject = (devisId: string, reason: string) => {
    console.log('Rejeter le devis:', devisId, 'Raison:', reason);
    // TODO: Implement rejection logic
    setRejectionReason('');
    setSelectedDevis(null);
  };

  const handleDownload = (devisId: string) => {
    console.log('Télécharger le devis:', devisId);
    // TODO: Implement PDF download
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {user?.role === 'admin' ? 'Tous les Devis' : 'Mes Devis'}
          </h1>
          <p className="text-slate-600 mt-1">
            Consultez et gérez vos devis
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par numéro, objet ou entreprise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="sent">Envoyé</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvé</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                  <SelectItem value="expired">Expiré</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Devis List */}
      <div className="grid gap-4">
        {filteredDevis.map((devis) => (
          <Card key={devis.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-lg text-slate-900">
                      Devis #{devis.number}
                    </h3>
                    {getStatusBadge(devis.status)}
                  </div>
                  <h4 className="text-slate-700 font-medium">{devis.object}</h4>
                  {user?.role === 'admin' && (
                    <p className="text-slate-600">
                      <strong>Entreprise:</strong> {devis.companyName}
                    </p>
                  )}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-sm text-slate-600">
                    <span>Créé le {formatDate(devis.createdAt)}</span>
                    <span>Valide jusqu'au {formatDate(devis.validUntil)}</span>
                  </div>
                  {devis.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-2 mt-2">
                      <p className="text-red-800 text-sm">
                        <strong>Raison du rejet:</strong> {devis.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
                <div className="text-right space-y-2">
                  <div className="text-2xl font-bold text-slate-900">
                    {formatCurrency(devis.amount)}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(devis.id)}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Télécharger PDF
                    </Button>
                    
                    {devis.status === 'pending' && user?.role !== 'admin' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(devis.id)}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approuver
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setSelectedDevis(devis)}
                              className="flex items-center gap-2"
                            >
                              <XCircle className="h-4 w-4" />
                              Rejeter
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Rejeter le devis #{devis.number}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p className="text-slate-600">
                                Veuillez indiquer la raison du rejet de ce devis :
                              </p>
                              <Textarea
                                placeholder="Raison du rejet..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                              />
                              <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setSelectedDevis(null)}>
                                  Annuler
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleReject(devis.id, rejectionReason)}
                                  disabled={!rejectionReason.trim()}
                                >
                                  Confirmer le rejet
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Devis Items Preview */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <h4 className="font-medium text-slate-900 mb-2">Prestations:</h4>
                <div className="space-y-1">
                  {devis.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm text-slate-600">
                      <span>{item.description} (x{item.quantity})</span>
                      <span>{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                  {devis.items.length > 2 && (
                    <div className="text-sm text-slate-500">
                      ... et {devis.items.length - 2} autre(s) prestation(s)
                    </div>
                  )}
                </div>
                {devis.notes && (
                  <div className="mt-2 text-sm text-slate-600">
                    <strong>Notes:</strong> {devis.notes}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDevis.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-500">Aucun devis trouvé</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DevisPage;
