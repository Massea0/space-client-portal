
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { devisApi } from '@/services/api';
import { Devis } from '@/types';
import { Search, FileText, Building, Calendar, Euro, Eye, Check, X } from 'lucide-react';

const AdminDevis = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [devis, setDevis] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedDevis, setSelectedDevis] = useState<Devis | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadDevis = async () => {
    try {
      setLoading(true);
      const data = await devisApi.getAll();
      setDevis(data);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les devis',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevis();
  }, []);

  const filteredDevis = devis.filter(d => {
    const matchesSearch = d.object.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (id: string, status: Devis['status'], reason?: string) => {
    try {
      setActionLoading(id);
      await devisApi.updateStatus(id, status, reason);
      await loadDevis();
      setSelectedDevis(null);
      setRejectionReason('');
      
      toast({
        title: 'Succès',
        description: `Devis ${status === 'approved' ? 'approuvé' : 'rejeté'} avec succès`,
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le devis',
        variant: 'error'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: Devis['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approuvé</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arcadis-orange mx-auto"></div>
          <p className="mt-4 text-slate-600">Chargement des devis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tous les Devis</h1>
          <p className="text-slate-600 mt-1">
            Gérez tous les devis des clients
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par objet, entreprise ou numéro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Devis Grid */}
      <div className="grid gap-6">
        {filteredDevis.map((devisItem) => (
          <Card key={devisItem.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-arcadis-gradient rounded-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{devisItem.object}</CardTitle>
                      <p className="text-sm text-slate-600">{devisItem.number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>{devisItem.companyName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(devisItem.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Euro className="h-4 w-4" />
                      <span className="font-medium">{formatCurrency(devisItem.amount)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusBadge(devisItem.status)}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDevis(devisItem)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Détails du Devis {selectedDevis?.number}</DialogTitle>
                      </DialogHeader>
                      {selectedDevis && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-slate-700">Entreprise</label>
                              <p className="text-slate-900">{selectedDevis.companyName}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-700">Montant</label>
                              <p className="text-slate-900 font-medium">{formatCurrency(selectedDevis.amount)}</p>
                            </div>
                          </div>
                          
                          {selectedDevis.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleUpdateStatus(selectedDevis.id, 'approved')}
                                disabled={actionLoading === selectedDevis.id}
                                className="flex items-center gap-2"
                              >
                                <Check className="h-4 w-4" />
                                Approuver
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="destructive" className="flex items-center gap-2">
                                    <X className="h-4 w-4" />
                                    Rejeter
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Rejeter le devis</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <Textarea
                                      placeholder="Raison du rejet..."
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                    />
                                    <div className="flex gap-2 justify-end">
                                      <Button variant="outline">Annuler</Button>
                                      <Button
                                        variant="destructive"
                                        onClick={() => handleUpdateStatus(selectedDevis.id, 'rejected', rejectionReason)}
                                        disabled={!rejectionReason.trim() || actionLoading === selectedDevis.id}
                                      >
                                        Rejeter le devis
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}
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

      {filteredDevis.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Aucun devis trouvé</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDevis;
