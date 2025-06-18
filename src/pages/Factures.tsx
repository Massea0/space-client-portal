// src/pages/Factures.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { invoicesApi } from '@/services/api';
import { Invoice } from '@/types'; // Assurez-vous que ce type Invoice est celui mis à jour
import { Download, Search, Filter } from 'lucide-react';
import { downloadInvoicePdf } from '@/lib/pdfGenerator';

const Factures = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      if (user?.role === 'client' && !user.companyId) {
        toast({
          title: 'Erreur',
          description: 'Information de compagnie manquante pour charger les factures.',
          variant: 'error'
        });
        setInvoices([]);
        setLoading(false);
        return;
      }
      const data = user?.role === 'admin'
          ? await invoicesApi.getAll()
          : await invoicesApi.getByCompany(user?.companyId || '');
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
    if (user) {
      loadInvoices();
    }
  }, [user]);

  const filteredInvoices = invoices.filter(invoice => {
    const companyName = invoice.companyName || '';
    const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Invoice['status']) => {
    // CORRECTION: Compléter les objets variants et labels
    const variants: { [key in Invoice['status']]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      draft: 'bg-slate-100 text-slate-800', // Ajouté
      cancelled: 'bg-gray-200 text-gray-700'  // Ajouté
    };

    const labels: { [key in Invoice['status']]: string } = {
      pending: 'En attente',
      paid: 'Payée',
      overdue: 'En retard',
      draft: 'Brouillon', // Ajouté
      cancelled: 'Annulée'  // Ajouté
    };

    return (
        <Badge className={variants[status] || 'bg-slate-100 text-slate-800'}>
          {labels[status] || status}
        </Badge>
    );
  };

  const handleDownloadPdf = async (invoice: Invoice) => {
    try {
      await downloadInvoicePdf(invoice);
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
            <h1 className="text-3xl font-bold text-slate-900">
              {user?.role === 'admin' ? 'Toutes les Factures' : 'Mes Factures'}
            </h1>
            <p className="text-slate-600 mt-1">
              Gérez et consultez vos factures
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                      placeholder="Rechercher par numéro ou entreprise..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48"> {/* Ajustement de la largeur pour mobile */}
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="paid">Payée</SelectItem>
                    <SelectItem value="overdue">En retard</SelectItem>
                    <SelectItem value="draft">Brouillon</SelectItem> {/* Ajouté pour le filtre */}
                    <SelectItem value="cancelled">Annulée</SelectItem> {/* Ajouté pour le filtre */}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="space-y-2 flex-grow">
                      <div className="flex items-center gap-4">
                        <h3 className="font-semibold text-lg text-slate-900">
                          Facture #{invoice.number}
                        </h3>
                        {getStatusBadge(invoice.status)}
                      </div>
                      {user?.role === 'admin' && (
                          <p className="text-sm text-slate-600">
                            <strong>Entreprise:</strong> {invoice.companyName}
                          </p>
                      )}
                      <div className="flex flex-col md:flex-row md:items-center gap-x-6 gap-y-1 text-sm text-slate-600">
                        <span>Émise le {formatDate(invoice.createdAt)}</span>
                        <span>Échéance: {formatDate(invoice.dueDate)}</span>
                        {invoice.paidAt && (
                            <span className="text-green-600 font-medium">
                        Payée le {formatDate(invoice.paidAt)}
                      </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-2 mt-4 sm:mt-0 flex-shrink-0">
                      <div className="text-2xl font-bold text-slate-900">
                        {formatCurrency(invoice.amount)}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPdf(invoice)}
                            className="flex items-center gap-2 w-full sm:w-auto"
                        >
                          <Download className="h-4 w-4" />
                          Télécharger PDF
                        </Button>
                      </div>
                    </div>
                  </div>

                  {invoice.items && invoice.items.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <h4 className="font-medium text-slate-900 mb-2">Détails des articles:</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto"> {/* Limite la hauteur et ajoute le scroll */}
                          {invoice.items.map((item) => (
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

        {filteredInvoices.length === 0 && !loading && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-slate-500">Aucune facture trouvée correspondant à vos critères.</p>
              </CardContent>
            </Card>
        )}
      </div>
  );
};

export default Factures;