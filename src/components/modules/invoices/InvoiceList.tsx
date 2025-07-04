// src/components/modules/invoices/InvoiceList.tsx
import React, { useState } from 'react';
import { Invoice as InvoiceType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { downloadInvoicePdf } from '@/lib/pdfGenerator';
import { 
  Search, Filter, Download, CheckCircle, XCircle, AlertTriangle, 
  Clock, FileText, Send, CreditCard, Banknote, Plus, Eye, Wallet
} from 'lucide-react';

interface InvoiceListProps {
  invoices: InvoiceType[];
  isLoading: boolean;
  isAdmin?: boolean;
  onSearchChange: (term: string) => void;
  onStatusFilterChange: (status: string) => void;
  onPayInvoice?: (invoice: InvoiceType) => void;
  onViewDetails?: (invoice: InvoiceType) => void;
  onDownloadPdf: (invoice: InvoiceType) => Promise<void>;
  onUpdateStatus?: (id: string, status: InvoiceType['status']) => Promise<void>;
  actionLoading?: string | null;
  renderAdditionalActions?: (invoice: InvoiceType) => React.ReactNode;
}

const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  isLoading,
  isAdmin = false,
  onSearchChange,
  onStatusFilterChange,
  onPayInvoice,
  onViewDetails,
  onDownloadPdf,
  onUpdateStatus,
  actionLoading,
  renderAdditionalActions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearchChange(term);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    onStatusFilterChange(value);
  };

  const getStatusBadge = (status: InvoiceType['status']) => {
    const variants: { [key in InvoiceType['status']]: string } = {
      draft: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
      sent: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100',
      pending_payment: 'bg-purple-100 text-purple-800 dark:bg-purple-600 dark:text-purple-100',
      paid: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100',
      partially_paid: 'bg-teal-100 text-teal-800 dark:bg-teal-700 dark:text-teal-100',
      overdue: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100',
      late: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 line-through',
    };
    const labels: { [key in InvoiceType['status']]: string } = {
      draft: 'Brouillon',
      sent: 'Envoyée',
      pending: 'En attente',
      pending_payment: 'Paiement en cours',
      paid: 'Payée',
      partially_paid: 'Partiellement payée',
      overdue: 'En retard',
      late: 'En retard',
      cancelled: 'Annulée',
    };
    const icons: { [key in InvoiceType['status']]: React.ElementType } = {
      draft: Clock,
      sent: Send,
      pending: Clock,
      pending_payment: CreditCard,
      paid: CheckCircle,
      partially_paid: Wallet,
      overdue: AlertTriangle,
      late: AlertTriangle,
      cancelled: XCircle,
    };
    const Icon = icons[status] || Filter;
    return (
      <Badge className={cn(variants[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', 'text-xs whitespace-nowrap flex items-center gap-1 animate-fade-in')}>
        <Icon className="h-3 w-3" />
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="w-full flex flex-1 items-center gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Rechercher une facture..." 
              className="pl-8 w-full md:w-[300px]" 
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="w-[180px] hidden sm:block flex-shrink-0">
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Statut</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillons</SelectItem>
                <SelectItem value="sent">Envoyées</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="pending_payment">Paiement en cours</SelectItem>
                <SelectItem value="paid">Payées</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Liste des factures */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3 text-lg">Chargement des factures...</span>
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Aucune facture trouvée</h3>
          <p className="mt-2 text-muted-foreground">
            {searchTerm || statusFilter !== 'all' 
              ? "Aucune facture ne correspond à vos critères de recherche."
              : "Vous n'avez pas encore de factures."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {invoices.map((invoice) => (
            <Card 
              key={invoice.id} 
              className="overflow-hidden transition-all duration-300 hover:shadow-md group animate-fade-in hover:border-primary/50"
            >
              <CardHeader className="space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-primary">{invoice.number}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      Client: {invoice.companyName}
                    </CardDescription>
                  </div>
                  {getStatusBadge(invoice.status)}
                </div>
                <p className="text-lg font-semibold text-foreground mt-2">
                  {formatCurrency(invoice.amount)}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <p><strong>Date d'émission:</strong> {formatDate(new Date(invoice.createdAt))}</p>
                  <p><strong>Date d'échéance:</strong> {formatDate(new Date(invoice.dueDate))}</p>
                  {invoice.status === 'paid' && invoice.paidAt && (
                    <p className="text-green-600 dark:text-green-400">
                      <strong>Payée le:</strong> {formatDate(new Date(invoice.paidAt))}
                    </p>
                  )}
                </div>
                {invoice.items && invoice.items.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <h5 className="text-xs font-semibold text-muted-foreground mb-1">Aperçu des articles:</h5>
                    <div className="space-y-0.5 max-h-20 overflow-y-auto text-xs">
                      {invoice.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-muted-foreground">
                          <span className="truncate pr-1" title={item.description}>
                            {item.description} (x{item.quantity})
                          </span>
                          <span className="whitespace-nowrap">{formatCurrency(item.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-wrap justify-between gap-2 pt-4 border-t">
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onDownloadPdf(invoice)}
                    disabled={actionLoading === `pdf-${invoice.id}`}
                    className="flex items-center gap-1.5"
                  >
                    <Download className="mr-2 h-3.5 w-3.5" /> PDF
                  </Button>
                  
                  {onViewDetails && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onViewDetails(invoice)}
                      className="flex items-center gap-1.5"
                    >
                      <Eye className="mr-2 h-3.5 w-3.5" /> Détails
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {isAdmin && onUpdateStatus && invoice.status === 'draft' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateStatus(invoice.id, 'sent')}
                      disabled={actionLoading === invoice.id}
                      className="flex items-center gap-1.5"
                    >
                      <Send className="mr-2 h-3.5 w-3.5" /> Marquer comme Envoyée
                    </Button>
                  )}

                  {!isAdmin && (
                    invoice.status === 'sent' || 
                    invoice.status === 'pending' || 
                    invoice.status === 'late' || 
                    invoice.status === 'partially_paid' || 
                    invoice.status === 'overdue' ||
                    invoice.status === 'pending_payment'
                  ) && onPayInvoice && (
                    <Button
                      size="sm"
                      onClick={() => onPayInvoice(invoice)}
                      disabled={actionLoading === `pay-${invoice.id}`}
                      className="bg-primary text-white flex items-center gap-1.5"
                    >
                      <CreditCard className="mr-2 h-3.5 w-3.5" />
                      {actionLoading === `pay-${invoice.id}` ? 'Chargement...' : 'Payer'}
                    </Button>
                  )}

                  {renderAdditionalActions && renderAdditionalActions(invoice)}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
