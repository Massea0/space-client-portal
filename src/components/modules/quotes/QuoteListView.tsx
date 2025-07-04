// src/components/quotes/QuoteListView.tsx
import React, { useState } from 'react';
import { Devis as DevisType } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { 
  Search, Filter, Download, CheckCircle, XCircle, AlertTriangle, 
  Clock, FileText, Send, Pencil, Trash2, Plus, RefreshCw, MoreHorizontal, Eye,
  ArrowUp, ArrowDown, ArrowUpDown, Sparkles
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface QuoteListViewProps {
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
  onGenerateContract?: (devisId: string, devisNumber: string) => Promise<void>;
  onCreateQuote?: () => void;
  actionLoading?: string | null;
}

type SortField = 'number' | 'companyName' | 'amount' | 'createdAt' | 'validUntil' | 'status';
type SortDirection = 'asc' | 'desc';

const QuoteListView: React.FC<QuoteListViewProps> = ({
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
  onGenerateContract,
  onCreateQuote,
  actionLoading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearchChange(term);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    onStatusFilterChange(value);
  };
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedQuotes(quotes.map(quote => quote.id));
    } else {
      setSelectedQuotes([]);
    }
  };
  
  const handleSelectQuote = (quoteId: string, checked: boolean) => {
    if (checked) {
      setSelectedQuotes(prev => [...prev, quoteId]);
    } else {
      setSelectedQuotes(prev => prev.filter(id => id !== quoteId));
    }
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
    const Icon = icons[status] || FileText;
    
    return (
      <Badge 
        className={cn(
          variants[status] || 'bg-gray-100 text-gray-800', 
          'text-xs whitespace-nowrap flex items-center gap-1 animate-fade-in'
        )}
      >
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
  
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1" /> 
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  return (
    <div className="space-y-5">
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
        <div className="flex gap-2 items-center">
          {selectedQuotes.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {selectedQuotes.length} sélectionné(s)
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Actions par lot disponibles</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {isAdmin && onCreateQuote && (
            <Button onClick={onCreateQuote} className="flex-shrink-0 w-full sm:w-auto bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" /> Nouveau devis
            </Button>
          )}
        </div>
      </div>
      
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedQuotes.length === quotes.length && quotes.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Sélectionner tous les devis"
                    className="translate-y-[2px]"
                  />
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('number')}>
                  <div className="flex items-center">
                    Numéro {getSortIcon('number')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('companyName')}>
                  <div className="flex items-center">
                    Client {getSortIcon('companyName')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('amount')}>
                  <div className="flex items-center">
                    Montant {getSortIcon('amount')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hidden md:table-cell" onClick={() => handleSort('createdAt')}>
                  <div className="flex items-center">
                    Date de création {getSortIcon('createdAt')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hidden md:table-cell" onClick={() => handleSort('validUntil')}>
                  <div className="flex items-center">
                    Validité {getSortIcon('validUntil')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                  <div className="flex items-center">
                    Statut {getSortIcon('status')}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id} className={quote.status === 'expired' ? "opacity-60" : ""}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedQuotes.includes(quote.id)}
                      onCheckedChange={(checked) => handleSelectQuote(quote.id, !!checked)}
                      aria-label={`Sélectionner devis ${quote.number}`}
                      className="translate-y-[2px]"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{quote.number}</TableCell>
                  <TableCell>{quote.companyName}</TableCell>
                  <TableCell>{formatCurrency(quote.amount)}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(new Date(quote.createdAt))}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(new Date(quote.validUntil))}</TableCell>
                  <TableCell>{getStatusBadge(quote.status)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {onViewDetails && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary"
                                onClick={() => onViewDetails(quote)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Voir les détails</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onDownloadPdf(quote)}
                              disabled={actionLoading === `pdf-${quote.id}`}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Télécharger PDF</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          {isAdmin && onEditQuote && quote.status !== 'validated' && quote.status !== 'approved' && (
                            <DropdownMenuItem onClick={() => onEditQuote(quote.id)}>
                              <Pencil className="mr-2 h-4 w-4" /> Modifier
                            </DropdownMenuItem>
                          )}
                          
                          {isAdmin && onConvertToInvoice && quote.status === 'approved' && (
                            <DropdownMenuItem onClick={() => onConvertToInvoice(quote.id, quote.number)}>
                              <RefreshCw className="mr-2 h-4 w-4" /> Convertir en facture
                            </DropdownMenuItem>
                          )}
                          
                          {isAdmin && onGenerateContract && quote.status === 'approved' && (
                            <DropdownMenuItem 
                              onClick={() => onGenerateContract(quote.id, quote.number)}
                              className="text-purple-600"
                            >
                              <Sparkles className="mr-2 h-4 w-4" /> Générer contrat IA
                            </DropdownMenuItem>
                          )}
                          
                          {isAdmin && onUpdateStatus && quote.status === 'draft' && (
                            <DropdownMenuItem onClick={() => onUpdateStatus(quote.id, 'sent')}>
                              <Send className="mr-2 h-4 w-4" /> Marquer comme envoyé
                            </DropdownMenuItem>
                          )}
                          
                          {isAdmin && onUpdateStatus && quote.status === 'sent' && (
                            <DropdownMenuItem onClick={() => onUpdateStatus(quote.id, 'draft')}>
                              <Clock className="mr-2 h-4 w-4" /> Remettre en brouillon
                            </DropdownMenuItem>
                          )}
                          
                          {!isAdmin && onUpdateStatus && quote.status === 'sent' && (
                            <DropdownMenuItem 
                              onClick={() => onUpdateStatus(quote.id, 'approved')}
                              className="text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" /> Approuver
                            </DropdownMenuItem>
                          )}
                          
                          {isAdmin && onDeleteQuote && quote.status !== 'validated' && quote.status !== 'approved' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => onDeleteQuote(quote)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default QuoteListView;
