// src/pages/admin/AdminFactures.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { invoicesApi } from '@/services/api';
import { Invoice, InvoiceItem } from '@/types'; // Assurez-vous que InvoiceItem est importé
import { Search, CreditCard, Building, Calendar, Euro, Eye, Check, Plus, Download } from 'lucide-react';
import InvoiceForm from '@/components/forms/InvoiceForm';
import { downloadInvoicePdf } from '@/lib/pdfGenerator';

// Type pour les données du formulaire de création de facture
type NewInvoiceFormData = Omit<Invoice, 'id' | 'number' | 'createdAt' | 'companyName' | 'paidAt'> & {
  items: Omit<InvoiceItem, 'id' | 'total'>[];
};

const AdminFactures = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showNewInvoiceDialog, setShowNewInvoiceDialog] = useState(false);


  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoicesApi.getAll();
      setInvoices(data);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les factures',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleMarkAsPaid = async (id: string) => {
    try {
      setActionLoading(id);
      const updatedInvoice = await invoicesApi.updateStatus(id, 'paid');
      await loadInvoices(); // Recharger pour voir le statut mis à jour

      // Mettre à jour selectedInvoice s'il est celui qui a été modifié
      if (selectedInvoice && selectedInvoice.id === id) {
        setSelectedInvoice(updatedInvoice);
      }

      toast({
        title: 'Succès',
        description: 'Facture marquée comme payée',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la facture',
        variant: 'error'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateInvoice = async (invoiceData: NewInvoiceFormData) => {
    try {
      setActionLoading('create');
      await invoicesApi.create(invoiceData);
      await loadInvoices();
      setShowNewInvoiceDialog(false); // Fermer le dialogue après la création
      toast({
        title: 'Succès',
        description: 'Facture créée avec succès',
        variant: 'success'
      });
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: 'Erreur',
        description: (error as Error)?.message || 'Impossible de créer la facture. Vérifiez les détails et réessayez.',
        variant: 'error'
      });
    } finally {
      setActionLoading(null);
    }
  };


  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Payée</Badge>;
      case 'overdue':
        return <Badge variant="destructive">En retard</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleDownloadPdf = async (invoice: Invoice) => {
    try {
      await downloadInvoicePdf(invoice);
      toast({
        title: 'Téléchargement PDF',
        description: `Le PDF pour la facture ${invoice.number} est en cours de préparation.`,
        variant: 'success',
      });
    } catch (error) {
      console.error("Error generating Invoice PDF:", error);
      toast({
        title: 'Erreur PDF',
        description: 'Impossible de générer le PDF pour la facture.',
        variant: 'error'
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

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Toutes les Factures</h1>
            <p className="text-slate-600 mt-1">
              Gérez toutes les factures des clients
            </p>
          </div>
          {/* Bouton pour ouvrir le dialogue de création de facture */}
          <Dialog open={showNewInvoiceDialog} onOpenChange={setShowNewInvoiceDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle Facture
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto"> {/* Augmenter la largeur max */}
              <InvoiceForm
                  onSubmit={handleCreateInvoice}
                  onCancel={() => setShowNewInvoiceDialog(false)}
                  isLoading={actionLoading === 'create'}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                    placeholder="Rechercher par numéro ou entreprise..."
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
                  <SelectItem value="paid">Payée</SelectItem>
                  <SelectItem value="overdue">En retard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Grid */}
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
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          <span>{invoice.companyName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Échéance: {formatDate(new Date(invoice.dueDate))}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Euro className="h-4 w-4" />
                          <span className="font-medium">{formatCurrency(invoice.amount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(invoice.status)}
                      {invoice.status === 'pending' && (
                          <Button
                              size="sm"
                              onClick={() => handleMarkAsPaid(invoice.id)}
                              disabled={actionLoading === invoice.id}
                              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4" />
                            {actionLoading === invoice.id ? 'En cours...' : 'Marquer payée'}
                          </Button>
                      )}
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadPdf(invoice)}
                          className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        PDF
                      </Button>
                      <Dialog onOpenChange={(open) => !open && setSelectedInvoice(null)}>
                        <DialogTrigger asChild>
                          <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedInvoice(invoice)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Détails de la Facture {selectedInvoice?.number}</DialogTitle>
                          </DialogHeader>
                          {selectedInvoice && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-slate-700">Entreprise</label>
                                    <p className="text-slate-900">{selectedInvoice.companyName}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-slate-700">Montant</label>
                                    <p className="text-slate-900 font-medium">{formatCurrency(selectedInvoice.amount)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-slate-700">Date d'échéance</label>
                                    <p className="text-slate-900">{formatDate(new Date(selectedInvoice.dueDate))}</p>
                                  </div>
                                  {selectedInvoice.paidAt && (
                                      <div>
                                        <label className="text-sm font-medium text-slate-700">Payée le</label>
                                        <p className="text-slate-900">{formatDate(new Date(selectedInvoice.paidAt))}</p>
                                      </div>
                                  )}
                                </div>
                                {/* Invoice Items Preview */}
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                  <h4 className="font-medium text-slate-900 mb-2">Détails:</h4>
                                  <div className="space-y-1">
                                    {selectedInvoice.items.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm text-slate-600">
                                          <span>{item.description} (x{item.quantity})</span>
                                          <span>{formatCurrency(item.total)}</span>
                                        </div>
                                    ))}
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