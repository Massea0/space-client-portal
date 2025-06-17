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
import { Invoice } from '@/types';
import { Download, Search, Filter } from 'lucide-react'; // CheckCircle retiré
import { downloadInvoicePdf } from '@/lib/pdfGenerator'; // Importer la fonction de génération PDF

const Factures = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  // actionLoading n'est plus nécessaire ici si le client ne change pas de statut
  // const [actionLoading, setActionLoading] = useState<string | null>(null); 

  const loadInvoices = async () => {
    try {
      setLoading(true);
      // Le rôle admin est déjà géré, mais on s'assure que user et companyId existent pour le client
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
    if (user) { // Charger seulement si l'utilisateur est défini
      loadInvoices();
    }
  }, [user]);

  // Apply search and filters
  const filteredInvoices = invoices.filter(invoice => {
    const companyName = invoice.companyName || ''; // S'assurer que companyName n'est pas undefined
    const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Invoice['status']) => {
    const variants: { [key in Invoice['status']]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800'
    };

    const labels: { [key in Invoice['status']]: string } = {
      pending: 'En attente',
      paid: 'Payée',
      overdue: 'En retard'
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
      // Le toast de succès est géré dans pdfGenerator si besoin, ou peut être ajouté ici
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
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
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
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <h3 className="font-semibold text-lg text-slate-900">
                          Facture #{invoice.number}
                        </h3>
                        {getStatusBadge(invoice.status)}
                      </div>
                      {user?.role === 'admin' && (
                          <p className="text-slate-600">
                            <strong>Entreprise:</strong> {invoice.companyName}
                          </p>
                      )}
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-sm text-slate-600">
                        <span>Émise le {formatDate(invoice.createdAt)}</span>
                        <span>Échéance: {formatDate(invoice.dueDate)}</span>
                        {invoice.paidAt && (
                            <span className="text-green-600">
                        Payée le {formatDate(invoice.paidAt)}
                      </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold text-slate-900">
                        {formatCurrency(invoice.amount)}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPdf(invoice)}
                            className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Télécharger PDF
                        </Button>
                        {/* Le bouton "Marquer comme payée" est retiré pour la vue client */}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <h4 className="font-medium text-slate-900 mb-2">Détails:</h4>
                    <div className="space-y-1">
                      {invoice.items.slice(0, 2).map((item) => (
                          <div key={item.id} className="flex justify-between text-sm text-slate-600">
                            <span>{item.description} (x{item.quantity})</span>
                            <span>{formatCurrency(item.total)}</span>
                          </div>
                      ))}
                      {invoice.items.length > 2 && (
                          <div className="text-sm text-slate-500">
                            ... et {invoice.items.length - 2} autre(s) élément(s)
                          </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>

        {filteredInvoices.length === 0 && !loading && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-slate-500">Aucune facture trouvée</p>
              </CardContent>
            </Card>
        )}
      </div>
  );
};

export default Factures;