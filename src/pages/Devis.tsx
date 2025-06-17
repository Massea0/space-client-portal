// src/pages/Devis.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { devisApi } from '@/services/api';
import { Devis, DevisItem } from '@/types'; // Correction: Ajout de DevisItem ici
import { Download, Search, Filter, CheckCircle, XCircle, Plus } from 'lucide-react';
import DevisForm from '@/components/forms/DevisForm';
import { downloadDevisPdf } from '@/lib/pdfGenerator';

const DevisPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedDevis, setSelectedDevis] = useState<Devis | null>(null);
  const [devisList, setDevisList] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showNewDevisDialog, setShowNewDevisDialog] = useState(false);

  const loadDevis = async () => {
    try {
      setLoading(true);
      const data = user?.role === 'admin'
          ? await devisApi.getAll()
          : await devisApi.getByCompany(user?.companyId || '');
      setDevisList(data);
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
    if (user) {
      loadDevis();
    }
  }, [user]);

  const filteredDevis = devisList.filter(devis => {
    const companyName = devis.companyName || '';
    const matchesSearch = devis.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        devis.object.toLowerCase().includes(searchTerm.toLowerCase()) ||
        companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || devis.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Devis['status']) => {
    const variants: { [key in Devis['status']]: string } = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800'
    };

    const labels: { [key in Devis['status']]: string } = {
      draft: 'Brouillon',
      sent: 'Envoyé',
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      expired: 'Expiré'
    };

    return (
        <Badge className={variants[status] || 'bg-slate-100 text-slate-800'}>
          {labels[status] || status}
        </Badge>
    );
  };

  const handleApprove = async (devisId: string) => {
    try {
      setActionLoading(devisId);
      await devisApi.updateStatus(devisId, 'approved');
      await loadDevis();
      toast({
        title: 'Succès',
        description: 'Devis approuvé avec succès',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'approuver le devis',
        variant: 'error'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (devisId: string, reason: string) => {
    if (!reason.trim()) {
      toast({
        title: 'Validation',
        description: 'La raison du rejet est obligatoire.',
        variant: 'warning'
      });
      return;
    }
    try {
      setActionLoading(devisId);
      await devisApi.updateStatus(devisId, 'rejected', reason);
      await loadDevis();
      setRejectionReason('');
      setSelectedDevis(null);
      toast({
        title: 'Succès',
        description: 'Devis rejeté',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de rejeter le devis',
        variant: 'error'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateDevis = async (devisData: Omit<Devis, 'id' | 'number' | 'createdAt' | 'companyName'> & { items: Omit<DevisItem, 'id' | 'total'>[] }) => {
    try {
      setActionLoading('create');
      await devisApi.create(devisData);
      await loadDevis();
      setShowNewDevisDialog(false);
      toast({
        title: 'Succès',
        description: 'Devis créé avec succès',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: (error as Error)?.message || 'Impossible de créer le devis',
        variant: 'error'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadPdf = async (devis: Devis) => {
    try {
      await downloadDevisPdf(devis);
      toast({
        title: 'Téléchargement PDF',
        description: `Le PDF pour le devis ${devis.number} est en cours de préparation.`,
        variant: 'success',
      });
    } catch (error) {
      console.error("Error generating Devis PDF:", error);
      toast({
        title: 'Erreur PDF',
        description: 'Impossible de générer le PDF pour le devis.',
        variant: 'error'
      });
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
            <h1 className="text-3xl font-bold text-slate-900">
              {user?.role === 'admin' ? 'Tous les Devis' : 'Mes Devis'}
            </h1>
            <p className="text-slate-600 mt-1">
              Consultez et gérez vos devis
            </p>
          </div>

          {user?.role === 'admin' && (
              <Dialog open={showNewDevisDialog} onOpenChange={setShowNewDevisDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Nouveau Devis
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DevisForm
                      onSubmit={handleCreateDevis}
                      onCancel={() => setShowNewDevisDialog(false)}
                      isLoading={actionLoading === 'create'}
                  />
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
                      placeholder="Rechercher par numéro, objet ou entreprise..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
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
                  <div className="flex flex-col md:flex-row items-start justify-between">
                    <div className="space-y-2 flex-1 mb-4 md:mb-0">
                      <div className="flex items-center gap-4">
                        <h3 className="font-semibold text-lg text-slate-900">
                          Devis #{devis.number}
                        </h3>
                        {getStatusBadge(devis.status)}
                      </div>
                      <h4 className="text-slate-700 font-medium">{devis.object}</h4>
                      {user?.role === 'admin' && (
                          <p className="text-slate-600 text-sm">
                            <strong>Entreprise:</strong> {devis.companyName}
                          </p>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-slate-600">
                        <span>Créé le {formatDate(new Date(devis.createdAt))}</span>
                        <span>Valide jusqu'au {formatDate(new Date(devis.validUntil))}</span>
                      </div>
                      {devis.rejectionReason && (
                          <div className="bg-red-50 border border-red-200 rounded-md p-2 mt-2 text-sm">
                            <p className="text-red-800">
                              <strong>Raison du rejet:</strong> {devis.rejectionReason}
                            </p>
                          </div>
                      )}
                    </div>
                    <div className="text-left md:text-right space-y-2 w-full md:w-auto">
                      <div className="text-2xl font-bold text-slate-900">
                        {formatCurrency(devis.amount)}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPdf(devis)}
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
                                  disabled={actionLoading === devis.id}
                                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                                {actionLoading === devis.id ? 'En cours...' : 'Approuver'}
                              </Button>

                              <Dialog open={selectedDevis?.id === devis.id} onOpenChange={(isOpen) => !isOpen && setSelectedDevis(null)}>
                                <DialogTrigger asChild>
                                  <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => {
                                        setSelectedDevis(devis);
                                        setRejectionReason('');
                                      }}
                                      className="flex items-center gap-2"
                                      disabled={actionLoading === devis.id}
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
                                          disabled={!rejectionReason.trim() || actionLoading === devis.id}
                                      >
                                        {actionLoading === devis.id ? 'En cours...' : 'Confirmer le rejet'}
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

        {filteredDevis.length === 0 && !loading && (
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