
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
import { Download, Search, Filter, CheckCircle } from 'lucide-react';

const Factures = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadInvoices = async () => {
    try {
      setLoading(true);
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
    loadInvoices();
  }, [user]);

  // Apply search and filters
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Invoice['status']) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      pending: 'En attente',
      paid: 'Payée',
      overdue: 'En retard'
    };

    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      setActionLoading(invoiceId);
      await invoicesApi.updateStatus(invoiceId, 'paid');
      await loadInvoices();
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

  const handleDownload = (invoiceId: string) => {
    toast({
      title: 'Information',
      description: 'Génération PDF en cours de développement',
      variant: 'warning'
    });
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

      {/* Filters */}
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

      {/* Invoices List */}
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
                      onClick={() => handleDownload(invoice.id)}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Télécharger PDF
                    </Button>
                    
                    {user?.role === 'admin' && invoice.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkAsPaid(invoice.id)}
                        disabled={actionLoading === invoice.id}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {actionLoading === invoice.id ? 'En cours...' : 'Marquer comme payée'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Invoice Items Preview */}
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
