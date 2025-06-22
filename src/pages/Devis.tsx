// src/pages/Devis.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { devisApi } from '@/services/api';
import { Devis as DevisType } from '@/types';
import { Download, Search, Filter, CheckCircle, XCircle, AlertTriangle, Clock, ShieldCheck, FileText } from 'lucide-react';
import { downloadDevisPdf } from '@/lib/pdfGenerator';

const DevisPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [devisList, setDevisList] = useState<DevisType[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [devisToReject, setDevisToReject] = useState<DevisType | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const getStatusBadge = (status: DevisType['status']) => {
    const variants: { [key in DevisType['status']]: string } = {
      draft: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
      sent: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100',
      approved: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100',
      validated: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100',
      expired: 'bg-orange-100 text-orange-800 dark:bg-orange-600 dark:text-orange-100',
    };
    const labels: { [key in DevisType['status']]: string } = {
      draft: 'Brouillon',
      sent: 'Envoyé',
      pending: 'En attente',
      approved: 'Approuvé',
      validated: 'Validé',
      rejected: 'Rejeté',
      expired: 'Expiré',
    };
    const icons: { [key in DevisType['status']]: React.ElementType } = {
      draft: FileText,
      sent: Clock,
      pending: Clock,
      approved: CheckCircle,
      validated: ShieldCheck,
      rejected: XCircle,
      expired: AlertTriangle,
    };
    const Icon = icons[status] || Filter;

    return (
        <Badge className={cn(variants[status] || 'bg-gray-100 text-gray-800', 'flex items-center gap-1.5')}>
          <Icon className="h-3.5 w-3.5" />
          {labels[status] || status}
        </Badge>
    );
  };

  const loadDevis = useCallback(async () => {
    setLoading(true);
    try {
      if (user?.role === 'client' && !user.companyId) {
        toast.error('Erreur', { description: 'Information de compagnie manquante pour charger les devis.' });
        setDevisList([]);
        return;
      }
      const data = await devisApi.getByCompany(user?.companyId || '');
      setDevisList(data.filter(d => d.status !== 'draft'));
    } catch (error) {
      toast.error('Erreur', { description: 'Impossible de charger les devis.' });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadDevis();
    }
  }, [user, loadDevis]);

  const filteredDevis = devisList.filter(devis => {
    const matchesSearch = devis.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        devis.object.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || devis.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (devisId: string, status: 'approved' | 'rejected', reason?: string) => {
    setActionLoading(`${devisId}-${status}`);
    try {
      const updatedDevis = await devisApi.updateStatusAsClient(devisId, status, reason);
      toast.success('Succès', {
        description: `Le devis a été ${status === 'approved' ? 'approuvé' : 'rejeté'}.`,
      });
      setDevisList(currentList =>
          currentList.map(d => (d.id === updatedDevis.id ? updatedDevis : d))
      );
    } catch (error) {
      console.error(`Erreur lors de l'action '${status}' sur le devis:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Impossible de mettre à jour le statut du devis.';
      toast.error('Erreur', { description: errorMessage });
    } finally {
      setActionLoading(null);
      setDevisToReject(null);
      setRejectionReason('');
    }
  };

  const handleDownloadPdf = async (devis: DevisType) => {
    setActionLoading(`pdf-${devis.id}`);
    try {
      await downloadDevisPdf(devis);
    } catch (error) {
      console.error("Error generating Devis PDF:", error);
      toast.error('Erreur PDF', { description: 'Impossible de générer le PDF pour le devis.' });
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

        {/* MODIFIÉ: Remplacé Card par un simple div pour la barre de recherche et les filtres */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2">
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
                <SelectItem value="sent">Envoyé</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-6">
          {filteredDevis.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Aucun devis à afficher.</p>
                </CardContent>
              </Card>
          ) : (
              filteredDevis.map((devis) => (
                  <Card key={devis.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div className="space-y-1">
                          <CardTitle className="text-xl text-primary">{devis.number}</CardTitle>
                          <p className="text-sm text-foreground">
                            <strong>Objet:</strong> {devis.object}
                          </p>
                        </div>
                        {getStatusBadge(devis.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row justify-between text-sm text-slate-600">
                        <span><strong>Montant:</strong> {formatCurrency(devis.amount)}</span>
                        <span><strong>Valide jusqu'au:</strong> {formatDate(new Date(devis.validUntil))}</span>
                      </div>
                      {devis.status === 'rejected' && devis.rejectionReason && (
                          <p className="text-sm text-red-600 mt-2"><strong>Raison du rejet:</strong> {devis.rejectionReason}</p>
                      )}
                    </CardContent>
                    <CardContent className="pt-4 border-t flex flex-wrap items-center justify-end gap-2">
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadPdf(devis)}
                          disabled={actionLoading === `pdf-${devis.id}`}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {actionLoading === `pdf-${devis.id}` ? 'Génération...' : 'Télécharger'}
                      </Button>
                      {(devis.status === 'sent' || devis.status === 'pending') && (
                          <>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDevisToReject(devis)}
                                disabled={!!actionLoading}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Rejeter
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(devis.id, 'approved')}
                                disabled={!!actionLoading}
                                className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              {actionLoading === `${devis.id}-approved` ? 'Approbation...' : 'Approuver'}
                            </Button>
                          </>
                      )}
                    </CardContent>
                  </Card>
              ))
          )}
        </div>

        <AlertDialog open={!!devisToReject} onOpenChange={(open) => !open && setDevisToReject(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Rejeter le devis #{devisToReject?.number}</AlertDialogTitle>
              <AlertDialogDescription>
                Vous pouvez optionnellement fournir une raison pour le rejet.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="rejectionReason">Raison du rejet (optionnel)</Label>
              <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ex: Budget dépassé, changement de projet..."
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDevisToReject(null)}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                  onClick={() => handleUpdateStatus(devisToReject!.id, 'rejected', rejectionReason)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Confirmer le rejet
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
};

export default DevisPage;