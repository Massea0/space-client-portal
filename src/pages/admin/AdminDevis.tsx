// src/pages/admin/AdminDevis.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { devisApi, invoicesApi } from '@/services/api'; // Ajout de invoicesApi
import { Devis as DevisType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner'; // MODIFIÉ: Import de toast depuis sonner
import { downloadDevisPdf } from '@/lib/pdfGenerator';
import {
  Download, CheckCircle, XCircle, Search as SearchIcon, Plus, Filter,
  FileText, Clock, AlertTriangle, Send, Archive, ShieldCheck, RefreshCw // Ajout de RefreshCw
} from 'lucide-react';
import DevisForm, { DevisFormSubmitData } from '@/components/forms/DevisForm';
import { Label } from '@/components/ui/label'; // Assurez-vous que Label est bien importé ici

const AdminDevisPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const { toast } = useToast(); // SUPPRIMÉ: Plus besoin du hook useToast

  const [devisList, setDevisList] = useState<DevisType[]>([]);
  const [filteredDevis, setFilteredDevis] = useState<DevisType[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [devisToUpdate, setDevisToUpdate] = useState<DevisType | null>(null);

  const [isCreateDevisDialogOpen, setIsCreateDevisDialogOpen] = useState(false);
  const [isSubmittingDevis, setIsSubmittingDevis] = useState(false);

  useEffect(() => {
    if (location.state?.openCreateDevisDialog) {
      setIsCreateDevisDialogOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const getStatusBadge = (status: DevisType['status']) => {
    const variants: { [key in DevisType['status']]: string } = {
      draft: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
      sent: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100',
      approved: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100',
      validated: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-700 dark:text-indigo-100', // Couleur pour 'validated'
      rejected: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100',
      expired: 'bg-orange-100 text-orange-800 dark:bg-orange-600 dark:text-orange-100',
    };
    const labels: { [key in DevisType['status']]: string } = {
      draft: 'Brouillon', sent: 'Envoyé', pending: 'En attente',
      approved: 'Approuvé', validated: 'Facturé', rejected: 'Rejeté', expired: 'Expiré',
    };

    const icons: { [key in DevisType['status']]: React.ElementType } = {
      draft: Clock, sent: Send, pending: Clock,
      approved: CheckCircle, validated: ShieldCheck, rejected: XCircle, expired: AlertTriangle,
    };
    const Icon = icons[status] || Filter;
    return (
        <Badge className={cn(variants[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', 'text-xs whitespace-nowrap flex items-center gap-1')}>
          <Icon className="h-3 w-3" />
          {labels[status] || status}
        </Badge>
    );
  };

  const fetchAllDevis = useCallback(async () => {
    setLoading(true);
    try {
      const data = await devisApi.getAll();
      setDevisList(data);
    } catch (error) {
      console.error("[AdminDevisPage] Erreur lors du chargement des devis:", error);
      toast.error('Erreur', { description: 'Impossible de charger la liste des devis.' }); // MODIFIÉ: Appel direct à toast.error
      setDevisList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllDevis();
  }, [fetchAllDevis]);

  useEffect(() => {
    let result = devisList;
    if (searchTerm) {
      result = result.filter(devis =>
          devis.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          devis.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          devis.object.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter && statusFilter !== 'all') {
      result = result.filter(devis => devis.status === statusFilter);
    }
    setFilteredDevis(result);
  }, [searchTerm, statusFilter, devisList]);

  const handleUpdateStatus = async (id: string, status: DevisType['status'], reason?: string) => {
    setActionLoading(id);
    try {
      await devisApi.updateStatus(id, status, reason);
      toast.success('Succès', { description: `Statut du devis mis à jour.` }); // MODIFIÉ: Appel direct à toast.success
      fetchAllDevis();
    } catch (error) {
      console.error("[AdminDevisPage] Erreur lors de la mise à jour du statut:", error);
      toast.error('Erreur', { description: 'Impossible de mettre à jour le statut.' }); // MODIFIÉ: Appel direct à toast.error
    } finally {
      setActionLoading(null);
      setIsRejectionDialogOpen(false);
      setRejectionReason('');
      setDevisToUpdate(null);
    }
  };

  // NOUVEAU: Handler pour la conversion en facture
  const handleConvertToInvoice = async (devisId: string, devisNumber: string) => {
    setActionLoading(`convert-${devisId}`);
    try {
      const newInvoice = await invoicesApi.createFromDevis(devisId);
      toast.success('Conversion Réussie', { // MODIFIÉ: Appel direct à toast.success
        description: `Le devis N°${devisNumber} a été converti en facture N°${newInvoice.number}.`,
      });
      // Rafraîchir la liste pour mettre à jour le statut du devis converti
      fetchAllDevis();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      console.error("[AdminDevisPage] Erreur lors de la conversion en facture:", error);
      toast.error('Erreur de Conversion', { description: errorMessage }); // MODIFIÉ: Appel direct à toast.error
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectionDialog = (devis: DevisType) => {
    setDevisToUpdate(devis);
    setIsRejectionDialogOpen(true);
  };

  const confirmRejection = () => {
    if (devisToUpdate) {
      handleUpdateStatus(devisToUpdate.id, 'rejected', rejectionReason);
    }
  };

  const handleDownloadPDF = async (devis: DevisType) => {
    setActionLoading(`pdf-${devis.id}`);
    try {
      await downloadDevisPdf(devis);
    } catch (error) {
      console.error("[AdminDevisPage] Erreur PDF:", error);
      toast.error('Erreur PDF', { description: 'Impossible de générer le PDF.' }); // MODIFIÉ: Appel direct à toast.error
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateDevisSubmitInDialog = async (data: DevisFormSubmitData) => {
    setIsSubmittingDevis(true);
    try {
      const validUntilDate = new Date(data.validUntil);
      if (isNaN(validUntilDate.getTime())) {
        toast.error('Erreur de Validation', { description: 'La date de validité fournie est invalide.' }); // MODIFIÉ: Appel direct à toast.error
        setIsSubmittingDevis(false);
        return;
      }
      const payloadForApi = {
        companyId: data.companyId,
        object: data.object,
        amount: data.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0),
        status: 'draft' as DevisType['status'], // Par défaut 'draft'
        validUntil: validUntilDate,
        notes: data.notes,
        items: data.items.map(item => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      };
      const newDevis = await devisApi.create(payloadForApi);
      toast.success(`Devis Créé`, { // MODIFIÉ: Appel direct à toast.success
        description: `Le devis N°${newDevis.number} a été créé avec succès.`,
      });
      setIsCreateDevisDialogOpen(false);
      fetchAllDevis();
    } catch (error: unknown) {
      console.error("[AdminDevisPage_Dialog] Erreur lors de la création du devis:", error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la création du devis.';
      toast.error('Erreur de Création', { description: errorMessage }); // MODIFIÉ: Appel direct à toast.error
    } finally {
      setIsSubmittingDevis(false);
    }
  };

  const availableStatuses: DevisType['status'][] = ['draft', 'sent', 'pending', 'approved', 'validated', 'rejected', 'expired'];

  if (loading && devisList.length === 0) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arcadis-orange mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Chargement des devis...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestion des Devis</h1>
            <p className="text-muted-foreground mt-1">Consultez et gérez tous les devis clients.</p>
          </div>
          <Dialog open={isCreateDevisDialogOpen} onOpenChange={setIsCreateDevisDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 w-full md:w-auto">
                <Plus className="h-4 w-4" /> Nouveau Devis
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un Nouveau Devis</DialogTitle>
                <DialogDescription>
                  Remplissez les informations ci-dessous pour générer un nouveau devis.
                </DialogDescription>
              </DialogHeader>
              <DevisForm
                  onSubmit={handleCreateDevisSubmitInDialog}
                  onCancel={() => setIsCreateDevisDialogOpen(false)}
                  isLoading={isSubmittingDevis}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* MODIFIÉ: Remplacé Card par un simple div pour la barre de recherche et les filtres */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2">
          <div className="relative w-full md:flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
                placeholder="Rechercher par N°, client, objet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground hidden md:inline-block" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {availableStatuses.map(status => (
                    <SelectItem key={status} value={status} className="capitalize">
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredDevis.length === 0 && !loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun devis trouvé.</p>
              </CardContent>
            </Card>
        ) : (
            <div className="grid gap-6 md:grid-cols-1">
              {filteredDevis.map((devis) => (
                  <Card key={devis.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                        <div>
                          <CardTitle className="text-xl text-primary">{devis.number}</CardTitle>
                          <CardDescription className="text-sm text-muted-foreground">
                            Client: {devis.companyName}
                          </CardDescription>
                        </div>
                        {getStatusBadge(devis.status)}
                      </div>
                      <p className="text-sm text-foreground pt-1">
                        <strong>Objet:</strong> {devis.object}
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        Montant: {formatCurrency(devis.amount)}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        <p><strong>Créé le:</strong> {formatDate(new Date(devis.createdAt))}</p>
                        <p><strong>Valide jusqu'au:</strong> {formatDate(new Date(devis.validUntil))}</p>
                        {devis.status === 'rejected' && devis.rejectionReason && (
                            <p className="text-destructive"><strong>Raison du rejet:</strong> {devis.rejectionReason}</p>
                        )}
                      </div>
                      {devis.items && devis.items.length > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <h5 className="text-xs font-semibold text-muted-foreground mb-1">Aperçu des articles:</h5>
                            <div className="space-y-0.5 max-h-20 overflow-y-auto text-xs">
                              {devis.items.map((item) => (
                                  <div key={item.id} className="flex justify-between text-muted-foreground">
                                    <span className="truncate pr-1" title={item.description}>{item.description} (x{item.quantity})</span>
                                    <span className="whitespace-nowrap">{formatCurrency(item.total)}</span>
                                  </div>
                              ))}
                            </div>
                          </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
                      <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(devis)} disabled={actionLoading === `pdf-${devis.id}`}>
                        <Download className="mr-2 h-3.5 w-3.5" /> PDF
                      </Button>
                      {devis.status === 'draft' && (
                          <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(devis.id, 'sent')} disabled={actionLoading === devis.id} className="flex items-center gap-1.5">
                            <Send className="mr-2 h-3.5 w-3.5" /> Marquer comme Envoyé
                          </Button>
                      )}
                      {devis.status === 'sent' && (
                          <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(devis.id, 'draft')} disabled={actionLoading === devis.id} className="flex items-center gap-1.5">
                            <Archive className="mr-2 h-3.5 w-3.5" /> Remettre en Brouillon
                          </Button>
                      )}
                      {devis.status !== 'rejected' && devis.status !== 'draft' && (
                          <Button variant="destructive" size="sm" onClick={() => openRejectionDialog(devis)} disabled={actionLoading === devis.id} className="flex items-center gap-1.5">
                            <XCircle className="mr-2 h-3.5 w-3.5" /> Enregistrer un Rejet
                          </Button>
                      )}
                      {devis.status !== 'expired' && devis.status !== 'approved' && devis.status !== 'rejected' && (
                          <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(devis.id, 'expired')} disabled={actionLoading === devis.id} className="flex items-center gap-1.5">
                            <AlertTriangle className="mr-2 h-3.5 w-3.5" /> Marquer comme Expiré
                          </Button>
                      )}
                      {/* NOUVEAU: Bouton de conversion */}
                      {devis.status === 'approved' && (
                          <Button
                              size="sm"
                              onClick={() => handleConvertToInvoice(devis.id, devis.number)}
                              disabled={actionLoading === `convert-${devis.id}`}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            <RefreshCw className="mr-2 h-3.5 w-3.5" />
                            {actionLoading === `convert-${devis.id}` ? 'Conversion...' : 'Convertir en Facture'}
                          </Button>
                      )}
                    </CardFooter>
                  </Card>
              ))}
            </div>
        )}

        <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enregistrer le Rejet du Devis N°{devisToUpdate?.number}</DialogTitle>
              <DialogDescription>
                Veuillez indiquer la raison du rejet (si communiquée par le client).
              </DialogDescription>
            </DialogHeader>
            <Textarea
                placeholder="Raison du rejet..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectionDialogOpen(false)}>Annuler</Button>
              <Button onClick={confirmRejection} variant="destructive" disabled={!rejectionReason.trim() || actionLoading === devisToUpdate?.id}>
                Confirmer le Rejet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default AdminDevisPage;