// src/pages/admin/AdminFactures.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { invoicesApi } from '@/services/api';
import { Invoice as InvoiceType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog";
import { formatDate, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { downloadInvoicePdf } from '@/lib/pdfGenerator';
import {
  Download, CheckCircle, Search as SearchIcon, Plus, Filter, Eye,
  CreditCard, Building, Calendar, Send, Banknote // MODIFIÉ: Remplacé Euro par Banknote
} from 'lucide-react';
import FactureForm, { FactureFormSubmitData } from '@/components/forms/FactureForm';

const AdminFactures = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [invoiceList, setInvoiceList] = useState<InvoiceType[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceType | null>(null);

  const [isCreateFactureDialogOpen, setIsCreateFactureDialogOpen] = useState(false);
  const [isSubmittingFacture, setIsSubmittingFacture] = useState(false);

  useEffect(() => {
    if (location.state?.openCreateFactureDialog) {
      setIsCreateFactureDialogOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);


  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await invoicesApi.getAll();
      setInvoiceList(data);
    } catch (error) {
      toast.error('Erreur', {
        description: 'Impossible de charger les factures'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  useEffect(() => {
    let result = invoiceList;
    if (searchTerm) {
      result = result.filter(invoice =>
          invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (invoice.companyName || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(invoice => invoice.status === statusFilter);
    }
    setFilteredInvoices(result);
  }, [searchTerm, statusFilter, invoiceList]);

  const handleMarkAsPaid = async (id: string) => {
    setActionLoading(`paid-${id}`);
    try {
      const updatedInvoice = await invoicesApi.updateStatus(id, 'paid');
      await loadInvoices();
      if (selectedInvoice && selectedInvoice.id === id) {
        setSelectedInvoice(updatedInvoice);
      }
      toast.success('Succès', {
        description: 'Facture marquée comme payée'
      });
    } catch (error) {
      toast.error('Erreur', {
        description: 'Impossible de mettre à jour la facture'
      });
    } finally {
      setActionLoading(null);
    }
  };

  // NOUVELLE FONCTION: Finaliser et envoyer une facture brouillon
  const handleFinalizeInvoice = async (id: string) => {
    setActionLoading(`finalize-${id}`);
    try {
      // Met à jour le statut de 'draft' à 'pending'
      const updatedInvoice = await invoicesApi.updateStatus(id, 'pending');
      await loadInvoices();
      if (selectedInvoice && selectedInvoice.id === id) {
        setSelectedInvoice(updatedInvoice);
      }
      toast.success('Succès', {
        description: 'La facture a été finalisée et est maintenant en attente.'
      });
    } catch (error) {
      toast.error('Erreur', {
        description: 'Impossible de finaliser la facture.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateFactureSubmitInDialog = async (data: FactureFormSubmitData) => {
    setIsSubmittingFacture(true);
    try {
      const issueDateObj = new Date(data.issueDate);
      const dueDateObj = new Date(data.dueDate);

      if (isNaN(issueDateObj.getTime()) || isNaN(dueDateObj.getTime())) {
        toast.error('Erreur de Validation', {
          description: 'Les dates fournies (émission ou échéance) sont invalides.',
        });
        setIsSubmittingFacture(false);
        return;
      }

      const payloadForApi = {
        companyId: data.companyId,
        amount: data.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0),
        status: 'draft' as InvoiceType['status'], // MODIFIÉ: Créer en tant que brouillon
        dueDate: dueDateObj,
        notes: data.notes,
        items: data.items.map(item => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      };

      const newFacture = await invoicesApi.create(payloadForApi);

      toast.success('Facture Créée', {
        description: `La facture N°${newFacture.number} a été créée en tant que brouillon.`,
      });
      setIsCreateFactureDialogOpen(false);
      loadInvoices();
    } catch (error: unknown) {
      let errorMessage = 'Une erreur est survenue lors de la création de la facture.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error('Erreur de Création', {
        description: errorMessage,
      });
    } finally {
      setIsSubmittingFacture(false);
    }
  };

  const getStatusBadge = (status: InvoiceType['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Payée</Badge>;
      case 'overdue':
        return <Badge variant="destructive">En retard</Badge>;
      case 'draft':
        return <Badge variant="secondary" className="bg-slate-100 text-slate-800">Brouillon</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-gray-200 text-gray-700">Annulée</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleDownloadPdf = async (invoice: InvoiceType) => {
    try {
      await downloadInvoicePdf(invoice);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF de la facture:", error);
      toast.error('Erreur PDF', {
        description: 'Impossible de générer le PDF pour la facture.',
      });
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arcadis-orange mx-auto"></div>
            <p className="mt-4 text-slate-600">Chargement des factures...</p>
          </div>
        </div>
    );
  }

  const availableStatuses: InvoiceType['status'][] = ['pending', 'paid', 'overdue', 'draft', 'cancelled'];


  return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestion des Factures</h1>
            <p className="text-slate-600 mt-1">Consultez et gérez toutes les factures clients.</p>
          </div>
          <Dialog open={isCreateFactureDialogOpen} onOpenChange={setIsCreateFactureDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 w-full md:w-auto">
                <Plus className="h-4 w-4" /> Nouvelle Facture
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer une Nouvelle Facture</DialogTitle>
                <DialogDescription>
                  Remplissez les informations ci-dessous pour générer une nouvelle facture.
                </DialogDescription>
              </DialogHeader>
              <FactureForm
                  onSubmit={handleCreateFactureSubmitInDialog}
                  onCancel={() => setIsCreateFactureDialogOpen(false)}
                  isLoading={isSubmittingFacture}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* MODIFIÉ: Remplacé Card par un simple div pour la barre de recherche et les filtres */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2">
          <div className="relative w-full md:flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
                placeholder="Rechercher par N°, client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="h-4 w-4 text-slate-500 hidden md:inline-block" />
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

        <div className="grid gap-6">
          {filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-arcadis-gradient rounded-lg">
                          <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{invoice.number}</CardTitle>
                          <p className="text-sm text-slate-600">Facture</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          <span>{invoice.companyName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Échéance: {formatDate(new Date(invoice.dueDate))}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Banknote className="h-4 w-4" /> {/* MODIFIÉ: Utilisation de Banknote */}
                          <span className="font-medium">{formatCurrency(invoice.amount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      {/* ACTION: Finaliser et Envoyer (pour les brouillons) */}
                      {invoice.status === 'draft' && (
                          <Button
                              size="sm"
                              onClick={() => handleFinalizeInvoice(invoice.id)}
                              disabled={actionLoading === `finalize-${invoice.id}`}
                              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Send className="h-4 w-4" />
                            {actionLoading === `finalize-${invoice.id}` ? 'Envoi...' : 'Finaliser et Envoyer'}
                          </Button>
                      )}

                      {/* ACTION: Marquer payée (pour les factures en attente) */}
                      {invoice.status === 'pending' && (
                          <Button
                              size="sm"
                              onClick={() => handleMarkAsPaid(invoice.id)}
                              disabled={actionLoading === `paid-${invoice.id}`}
                              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                            {actionLoading === `paid-${invoice.id}` ? 'En cours...' : 'Marquer payée'}
                          </Button>
                      )}

                      {/* ACTION: Télécharger PDF (toujours visible) */}
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadPdf(invoice)}
                          className="flex items-center gap-1.5"
                      >
                        <Download className="h-4 w-4" />
                        PDF
                      </Button>

                      {/* ACTION: Voir détails (toujours visible) */}
                      <Dialog onOpenChange={(open) => !open && setSelectedInvoice(null)}>
                        <DialogTrigger asChild>
                          <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedInvoice(invoice)}
                              className="flex items-center gap-1.5"
                          >
                            <Eye className="h-4 w-4" />
                            Voir
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Détails de la Facture {selectedInvoice?.number}</DialogTitle>
                          </DialogHeader>
                          {selectedInvoice && (
                              <div className="space-y-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="font-medium text-slate-500">Entreprise:</p>
                                    <p className="text-slate-900">{selectedInvoice.companyName}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-500">Montant:</p>
                                    <p className="text-slate-900 font-semibold">{formatCurrency(selectedInvoice.amount)}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-500">Date d'émission:</p>
                                    <p className="text-slate-900">{formatDate(new Date(selectedInvoice.createdAt))}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-500">Date d'échéance:</p>
                                    <p className="text-slate-900">{formatDate(new Date(selectedInvoice.dueDate))}</p>
                                  </div>
                                  {selectedInvoice.paidAt && (
                                      <div>
                                        <p className="font-medium text-slate-500">Payée le:</p>
                                        <p className="text-green-600 font-semibold">{formatDate(new Date(selectedInvoice.paidAt))}</p>
                                      </div>
                                  )}
                                  <div>
                                    <p className="font-medium text-slate-500">Statut:</p>
                                    {getStatusBadge(selectedInvoice.status)}
                                  </div>
                                </div>

                                {selectedInvoice.notes && (
                                    <div>
                                      <p className="font-medium text-slate-500">Notes:</p>
                                      <p className="text-slate-700 whitespace-pre-wrap">{selectedInvoice.notes}</p>
                                    </div>
                                )}

                                {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-200">
                                      <h4 className="font-medium text-slate-900 mb-2">Détails des articles:</h4>
                                      <div className="space-y-1 max-h-60 overflow-y-auto">
                                        {selectedInvoice.items.map((item) => (
                                            <div key={item.id} className="flex justify-between text-sm text-slate-600 p-1 hover:bg-slate-50 rounded">
                                              <span className="truncate pr-2" title={item.description}>{item.description} (x{item.quantity})</span>
                                              <span className="whitespace-nowrap">{formatCurrency(item.total)}</span>
                                            </div>
                                        ))}
                                      </div>
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


        {filteredInvoices.length === 0 && !loading && (
            <Card>
              <CardContent className="p-8 text-center">
                <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Aucune facture trouvée</p>
              </CardContent>
            </Card>
        )}
      </div>
  );
};

export default AdminFactures;