// src/pages/Devis.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { devisApi } from '@/services/api';
import { Devis as DevisType } from '@/types'; // Renommé pour éviter conflit avec le nom du composant
import { Download, Search, Filter, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { downloadDevisPdf } from '@/lib/pdfGenerator';

const DevisPage = () => { // Renommé pour éviter confusion avec DevisType
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [devisList, setDevisList] = useState<DevisType[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getStatusBadge = (status: DevisType['status']) => {
    const variants: { [key in DevisType['status']]: string } = {
      draft: 'bg-slate-100 text-slate-800',
      sent: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800',
    };
    const labels: { [key in DevisType['status']]: string } = {
      draft: 'Brouillon',
      sent: 'Envoyé',
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      expired: 'Expiré',
    };
    const icons: { [key in DevisType['status']]: React.ElementType } = {
      draft: Clock,
      sent: Filter, // Placeholder, choose appropriate icon
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
      expired: AlertTriangle,
    };
    const Icon = icons[status] || Filter;

    return (
        <Badge className={`${variants[status] || 'bg-gray-100 text-gray-800'} flex items-center gap-1.5`}>
          <Icon className="h-3.5 w-3.5" />
          {labels[status] || status}
        </Badge>
    );
  };

  const loadDevis = useCallback(async () => {
    setLoading(true);
    try {
      if (user?.role === 'client' && !user.companyId) {
        toast({
          title: 'Erreur',
          description: 'Information de compagnie manquante pour charger les devis.',
          variant: 'error'
        });
        setDevisList([]);
        return;
      }
      // Pour la page client, on ne charge que les devis de sa compagnie
      // et on ne montre pas les 'draft'
      const data = await devisApi.getByCompany(user?.companyId || '');
      setDevisList(data.filter(d => d.status !== 'draft'));
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les devis.',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      loadDevis();
    }
  }, [user, loadDevis]);

  const filteredDevis = devisList.filter(devis => {
    // Le client ne recherche pas par nom de compagnie car il ne voit que les siens
    const matchesSearch = devis.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        devis.object.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || devis.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDevisAction = async (devisId: string, newStatus: 'approved' | 'rejected') => {
    setActionLoading(`${devisId}-${newStatus}`);
    try {
      await devisApi.updateStatus(devisId, newStatus);
      toast({
        title: 'Succès',
        description: `Le devis a été ${newStatus === 'approved' ? 'approuvé' : 'rejeté'}.`,
        variant: 'success',
      });
      loadDevis(); // Recharger la liste
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut du devis:", error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut du devis.',
        variant: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadPdf = async (devis: DevisType) => {
    setActionLoading(`pdf-${devis.id}`);
    try {
      await downloadDevisPdf(devis);
    } catch (error) {
      console.error("Error generating Devis PDF:", error);
      toast({
        title: 'Erreur PDF',
        description: 'Impossible de générer le PDF pour le devis.',
        variant: 'error'
      });
    } finally {
      setActionLoading(null);
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
            <h1 className="text-3xl font-bold text-slate-900">Mes Devis</h1>
            <p className="text-slate-600 mt-1">Consultez et gérez vos devis</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                      placeholder="Rechercher par N° ou objet..."
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
                    {/* Le client ne voit pas les 'draft' */}
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

        <div className="grid gap-4">
          {filteredDevis.map((devis) => (
              <Card key={devis.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="space-y-2 flex-grow">
                      <div className="flex items-center gap-4">
                        <h3 className="font-semibold text-lg text-slate-900">
                          Devis #{devis.number}
                        </h3>
                        {getStatusBadge(devis.status)}
                      </div>
                      <p className="text-sm text-slate-600">
                        <strong>Objet:</strong> {devis.object}
                      </p>
                      <div className="flex flex-col md:flex-row md:items-center gap-x-6 gap-y-1 text-sm text-slate-600">
                        <span>Créé le {formatDate(devis.createdAt)}</span>
                        <span>Valide jusqu'au {formatDate(devis.validUntil)}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-2 mt-4 sm:mt-0 flex-shrink-0">
                      <div className="text-2xl font-bold text-slate-900">
                        {formatCurrency(devis.amount)}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPdf(devis)}
                            disabled={actionLoading === `pdf-${devis.id}`}
                            className="flex items-center gap-2 w-full sm:w-auto"
                        >
                          <Download className="h-4 w-4" />
                          Télécharger PDF
                        </Button>
                        {/* Actions client : Approuver ou Rejeter */}
                        {(devis.status === 'sent' || devis.status === 'pending') && (
                            <div className="flex gap-2 w-full sm:w-auto">
                              <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleDevisAction(devis.id, 'approved')}
                                  disabled={actionLoading === `${devis.id}-approved`}
                                  className="flex-1 flex items-center gap-1.5"
                              >
                                <CheckCircle className="h-4 w-4" /> Approuver
                              </Button>
                              <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDevisAction(devis.id, 'rejected')}
                                  disabled={actionLoading === `${devis.id}-rejected`}
                                  className="flex-1 flex items-center gap-1.5"
                              >
                                <XCircle className="h-4 w-4" /> Rejeter
                              </Button>
                            </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {devis.items && devis.items.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <h4 className="font-medium text-slate-900 mb-2">Détails des articles:</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {devis.items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm text-slate-600 hover:bg-slate-50 p-1 rounded">
                                <span className="truncate pr-2" title={item.description}>{item.description} (x{item.quantity})</span>
                                <span className="whitespace-nowrap">{formatCurrency(item.total)}</span>
                              </div>
                          ))}
                        </div>
                      </div>
                  )}
                </CardContent>
              </Card>
          ))}
        </div>

        {filteredDevis.length === 0 && !loading && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-slate-500">Aucun devis trouvé.</p>
              </CardContent>
            </Card>
        )}
      </div>
  );
};

export default DevisPage;