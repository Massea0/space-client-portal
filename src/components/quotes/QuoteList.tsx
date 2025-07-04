// src/components/quotes/QuoteList.tsx
import React, { useState } from 'react';
import { Devis as DevisType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { downloadDevisPdf } from '@/lib/pdfGenerator';
import { 
  Search, Filter, Download, CheckCircle, XCircle, AlertTriangle, 
  Clock, FileText, Send, Pencil, Trash2, Plus, RefreshCw, Archive, Eye
} from 'lucide-react';

interface QuoteListProps {
  quotes: DevisType[];
  isLoading: boolean;
  isAdmin?: boolean;
  onSearchChange: (term: string) => void;
  onStatusFilterChange: (status: string) => void;
  onEditQuote?: (quoteId: string) => void;
  onDeleteQuote?: (quote: DevisType) => void;
  onViewDetails?: (quote: DevisType) => void;
  onDownloadPdf: (quote: DevisType) => Promise<void>;
  onUpdateStatus?: (id: string, status: DevisType['status'], reason?: string) => Promise<void>;
  onConvertToInvoice?: (id: string, number: string) => Promise<void>;
  onCreateQuote?: () => void;
  actionLoading?: string | null;
  renderAdditionalActions?: (quote: DevisType) => React.ReactNode;
}

const QuoteList: React.FC<QuoteListProps> = ({
  quotes,
  isLoading,
  isAdmin = false,
  onSearchChange,
  onStatusFilterChange,
  onEditQuote,
  onDeleteQuote,
  onViewDetails,
  onDownloadPdf,
  onUpdateStatus,
  onConvertToInvoice,
  onCreateQuote,
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

  const getStatusBadge = (status: DevisType['status']) => {
    const variants: { [key in DevisType['status']]: string } = {
      draft: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
      sent: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100',
      approved: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100',
      validated: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-700 dark:text-indigo-100',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100',
      expired: 'bg-orange-100 text-orange-800 dark:bg-orange-600 dark:text-orange-100',
    };
    const labels: { [key in DevisType['status']]: string } = {
      draft: 'Brouillon', 
      sent: 'Envoyé', 
      pending: 'En attente',
      approved: 'Approuvé', 
      validated: 'Facturé', 
      rejected: 'Rejeté', 
      expired: 'Expiré',
    };
    const icons: { [key in DevisType['status']]: React.ElementType } = {
      draft: Clock, 
      sent: Send, 
      pending: Clock,
      approved: CheckCircle, 
      validated: RefreshCw, 
      rejected: XCircle, 
      expired: AlertTriangle,
    };
    const Icon = icons[status] || Filter;
    return (
      <Badge className={cn(variants[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', 'text-xs whitespace-nowrap flex items-center gap-1 animate-fade-in')}>
        <Icon className="h-3 w-3" />
        {labels[status] || status}
      </Badge>
    );
  };

  // Filtres spécifiques selon le rôle (admin ou client)
  const getFilterItems = () => {
    if (isAdmin) {
      return (
        <>
          <SelectItem value="all">Tous les statuts</SelectItem>
          <SelectItem value="draft">Brouillons</SelectItem>
          <SelectItem value="sent">Envoyés</SelectItem>
          <SelectItem value="pending">En attente</SelectItem>
          <SelectItem value="approved">Approuvés</SelectItem>
          <SelectItem value="validated">Facturés</SelectItem>
          <SelectItem value="rejected">Rejetés</SelectItem>
          <SelectItem value="expired">Expirés</SelectItem>
        </>
      );
    } else {
      // Filtres côté client - seulement les statuts pertinents pour eux
      return (
        <>
          <SelectItem value="all">Tous les statuts</SelectItem>
          <SelectItem value="sent">Envoyés</SelectItem>
          <SelectItem value="approved">Approuvés</SelectItem>
          <SelectItem value="expired">Expirés</SelectItem>
          <SelectItem value="rejected">Rejetés</SelectItem>
        </>
      );
    }
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
              placeholder="Rechercher un devis..." 
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
                {getFilterItems()}
              </SelectContent>
            </Select>
          </div>
        </div>
        {isAdmin && onCreateQuote && (
          <Button onClick={onCreateQuote} className="flex-shrink-0 w-full sm:w-auto bg-primary hover:bg-primary/90 text-white">
            <Plus className="h-4 w-4 mr-2" /> Nouveau devis
          </Button>
        )}
      </div>
      
      {/* Liste des devis */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3 text-lg">Chargement des devis...</span>
        </div>
      ) : quotes.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Aucun devis trouvé</h3>
          <p className="mt-2 text-muted-foreground">
            {searchTerm || statusFilter !== 'all' 
              ? "Aucun devis ne correspond à vos critères de recherche."
              : "Vous n'avez pas encore de devis."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {quotes.map((quote) => (
            <Card 
              key={quote.id} 
              className="overflow-hidden transition-all duration-300 hover:shadow-md group animate-fade-in hover:border-primary/50"
            >
              <CardHeader className="space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-primary">{quote.number}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      Client: {quote.companyName}
                    </CardDescription>
                  </div>
                  {getStatusBadge(quote.status)}
                </div>
                <p className="text-sm text-foreground pt-1">
                  <strong>Objet:</strong> {quote.object}
                </p>
                <p className="text-lg font-semibold text-foreground">
                  Montant: {formatCurrency(quote.amount)}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <p><strong>Créé le:</strong> {formatDate(new Date(quote.createdAt))}</p>
                  <p><strong>Valide jusqu'au:</strong> {formatDate(new Date(quote.validUntil))}</p>
                  {quote.status === 'rejected' && quote.rejectionReason && (
                    <p className="text-destructive"><strong>Raison du rejet:</strong> {quote.rejectionReason}</p>
                  )}
                </div>
                {quote.items && quote.items.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <h5 className="text-xs font-semibold text-muted-foreground mb-1">Aperçu des articles:</h5>
                    <div className="space-y-0.5 max-h-20 overflow-y-auto text-xs">
                      {quote.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-muted-foreground">
                          <span className="truncate pr-1" title={item.description}>{item.description} (x{item.quantity})</span>
                          <span className="whitespace-nowrap">{formatCurrency(item.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-4 border-t">
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onDownloadPdf(quote)}
                    disabled={actionLoading === `pdf-${quote.id}`}
                    className="flex items-center gap-1.5"
                  >
                    <Download className="mr-2 h-3.5 w-3.5" /> PDF
                  </Button>
                  
                  {onViewDetails && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onViewDetails(quote)}
                      className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                    >
                      <Eye className="mr-2 h-3.5 w-3.5" /> Détails
                    </Button>
                  )}
                  
                  {isAdmin && onEditQuote && (quote.status !== 'validated' && quote.status !== 'approved') && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEditQuote(quote.id)}
                      disabled={actionLoading === quote.id}
                      className="flex items-center gap-1.5"
                    >
                      <Pencil className="mr-2 h-3.5 w-3.5" /> Modifier
                    </Button>
                  )}
                  
                  {isAdmin && onDeleteQuote && (quote.status !== 'validated' && quote.status !== 'approved') && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onDeleteQuote(quote)}
                      disabled={actionLoading === quote.id}
                      className="flex items-center gap-1.5 text-destructive border-destructive/50 hover:bg-destructive/10"
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Supprimer
                    </Button>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {/* Les boutons spécifiques à l'état draft/sent sont gérés par renderAdditionalActions dans la page admin */}
                  
                  {/* On garde ce bouton spécifique car c'est une action unique non remplacée par renderAdditionalActions */}
                  {isAdmin && onConvertToInvoice && quote.status === 'approved' && (
                    <Button
                      size="sm"
                      onClick={() => onConvertToInvoice(quote.id, quote.number)}
                      disabled={actionLoading === `convert-${quote.id}`}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <RefreshCw className="mr-2 h-3.5 w-3.5" />
                      {actionLoading === `convert-${quote.id}` ? 'Conversion...' : 'Convertir en facture'}
                    </Button>
                  )}

                  {!isAdmin && quote.status === 'sent' && onUpdateStatus && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateStatus(quote.id, 'approved')}
                      disabled={actionLoading === quote.id}
                      className="flex items-center gap-1.5 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                    >
                      <CheckCircle className="mr-2 h-3.5 w-3.5" /> Approuver
                    </Button>
                  )}
                  
                  {renderAdditionalActions && renderAdditionalActions(quote)}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuoteList;
