// src/pages/Factures.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { invoicesApi } from '@/services/api';
import { Invoice as InvoiceType } from '@/types';
import { Download, Search, Filter, CheckCircle, XCircle, AlertTriangle, Clock, FileText, Send, CreditCard } from 'lucide-react';
import { downloadInvoicePdf } from '@/lib/pdfGenerator';
import DexchangePaymentModal from '@/components/payments/DexchangePaymentModal';

const FacturesPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [invoiceList, setInvoiceList] = useState<InvoiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [invoiceToPay, setInvoiceToPay] = useState<InvoiceType | null>(null);

  const getStatusBadge = (status: InvoiceType['status']) => {
    const variants: { [key in InvoiceType['status']]: string } = {
      draft: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
      sent: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100',
      pending_payment: 'bg-purple-100 text-purple-800 dark:bg-purple-600 dark:text-purple-100',
      paid: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100',
      overdue: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 line-through',
    };
    const labels: { [key in InvoiceType['status']]: string } = {
      draft: 'Brouillon',
      sent: 'Envoyée',
      pending: 'En attente',
      pending_payment: 'Paiement en cours',
      paid: 'Payée',
      overdue: 'En retard',
      cancelled: 'Annulée',
    };
    const icons: { [key in InvoiceType['status']]: React.ElementType } = {
      draft: FileText,
      sent: Send,
      pending: Clock,
      pending_payment: Clock,
      paid: CheckCircle,
      overdue: AlertTriangle,
      cancelled: XCircle,
    };
    const Icon = icons[status] || Filter;

    return (
        <Badge className={cn(variants[status] || 'bg-gray-100 text-gray-800', 'flex items-center gap-1.5')}>
          <Icon className="h-3.5 w-3.5" />
          {labels[status] || status}
        </Badge>
    );
  };

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      if (user?.role === 'client' && !user.companyId) {
        toast.error('Erreur', { description: 'Information de compagnie manquante.' });
        setInvoiceList([]);
        return;
      }
      const data = await invoicesApi.getByCompany(user?.companyId || '');
      setInvoiceList(data.filter(i => i.status !== 'draft'));
    } catch (error) {
      toast.error('Erreur', { description: 'Impossible de charger les factures.' });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadInvoices();
    }
  }, [user, loadInvoices]);

  const filteredInvoices = invoiceList.filter(invoice => {
    const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDownloadPdf = async (invoice: InvoiceType) => {
    setActionLoading(`pdf-${invoice.id}`);
    try {
      await downloadInvoicePdf(invoice);
    } catch (error) {
      console.error("Error generating Invoice PDF:", error);
      toast.error('Erreur PDF', { description: 'Impossible de générer le PDF.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handlePaymentInitiation = () => {
    if (invoiceToPay) {
      setInvoiceList(currentList =>
          currentList.map(inv =>
              inv.id === invoiceToPay.id ? { ...inv, status: 'pending_payment' } : inv
          )
      );
    }
    setInvoiceToPay(null);
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
      <>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Mes Factures</h1>
              <p className="text-slate-600 mt-1">Consultez l'historique de vos factures.</p>
            </div>
          </div>

          {/* MODIFIÉ: Remplacé Card par un simple div pour la barre de recherche et les filtres */}
          <div className="flex flex-col md:flex-row gap-4 p-2">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                    placeholder="Rechercher par N° de facture..."
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
                  <SelectItem value="sent">Envoyée</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="pending_payment">Paiement en cours</SelectItem>
                  <SelectItem value="paid">Payée</SelectItem>
                  <SelectItem value="overdue">En retard</SelectItem>
                  <SelectItem value="cancelled">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6">
            {filteredInvoices.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Aucune facture à afficher.</p>
                  </CardContent>
                </Card>
            ) : (
                filteredInvoices.map((invoice) => (
                    <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                          <div className="space-y-1">
                            <CardTitle className="text-xl text-primary">{invoice.number}</CardTitle>
                            <p className="text-sm text-foreground">
                              <strong>Montant:</strong> {formatCurrency(invoice.amount)}
                            </p>
                          </div>
                          {getStatusBadge(invoice.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col md:flex-row justify-between text-sm text-slate-600">
                          <span><strong>Date d'émission:</strong> {formatDate(new Date(invoice.createdAt))}</span>
                          <span><strong>Date d'échéance:</strong> {formatDate(new Date(invoice.dueDate))}</span>
                        </div>
                        {invoice.paidAt && (
                            <p className="text-sm text-green-600 mt-2"><strong>Payée le:</strong> {formatDate(new Date(invoice.paidAt))}</p>
                        )}
                      </CardContent>
                      <CardContent className="pt-4 border-t flex flex-wrap items-center justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPdf(invoice)}
                            disabled={actionLoading === `pdf-${invoice.id}`}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          {actionLoading === `pdf-${invoice.id}` ? 'Génération...' : 'Télécharger'}
                        </Button>
                        {(invoice.status === 'pending' || invoice.status === 'overdue' || invoice.status === 'sent') && (
                            <Button
                                size="sm"
                                onClick={() => setInvoiceToPay(invoice)}
                                className="bg-arcadis-blue-primary hover:bg-arcadis-blue-dark"
                            >
                              <CreditCard className="mr-2 h-4 w-4" />
                              Payer maintenant
                            </Button>
                        )}
                      </CardContent>
                    </Card>
                ))
            )}
          </div>
        </div>
        <DexchangePaymentModal
            invoice={invoiceToPay}
            onClose={() => setInvoiceToPay(null)}
            onPaymentSuccess={handlePaymentInitiation}
        />
      </>
  );
};

export default FacturesPage;