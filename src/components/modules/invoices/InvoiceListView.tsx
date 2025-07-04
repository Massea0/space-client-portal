// src/components/modules/invoices/InvoiceListView.tsx
import React, { useState } from 'react';
import { Invoice as InvoiceType } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { 
  Search, Filter, Download, CheckCircle, XCircle, AlertTriangle, 
  Clock, FileText, Send, Pencil, Trash2, Plus, RefreshCw, MoreHorizontal, Eye,
  ArrowUp, ArrowDown, ArrowUpDown, CreditCard, Wallet
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

interface InvoiceListViewProps {
  invoices: InvoiceType[];
  isLoading: boolean;
  isAdmin?: boolean;
  onSearchChange: (term: string) => void;
  onStatusFilterChange: (status: string) => void;
  onEditInvoice?: (invoiceId: string) => void;
  onDeleteInvoice?: (invoice: InvoiceType) => void;
  onViewDetails?: (invoice: InvoiceType) => void;
  onDownloadPdf: (invoice: InvoiceType) => Promise<void>;
  onPayInvoice?: (invoice: InvoiceType) => void;
  onUpdateStatus?: (id: string, status: InvoiceType['status'], reason?: string) => Promise<void>;
  actionLoading?: string | null;
}

type SortField = 'number' | 'companyName' | 'amount' | 'createdAt' | 'dueDate' | 'status';
type SortDirection = 'asc' | 'desc';

const InvoiceListView: React.FC<InvoiceListViewProps> = ({
  invoices,
  isLoading,
  isAdmin = false,
  onSearchChange,
  onStatusFilterChange,
  onEditInvoice,
  onDeleteInvoice,
  onViewDetails,
  onDownloadPdf,
  onPayInvoice,
  onUpdateStatus,
  actionLoading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  
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
      setSelectedInvoices(invoices.map(invoice => invoice.id));
    } else {
      setSelectedInvoices([]);
    }
  };
  
  const handleSelectInvoice = (invoiceId: string, checked: boolean) => {
    if (checked) {
      setSelectedInvoices(prev => [...prev, invoiceId]);
    } else {
      setSelectedInvoices(prev => prev.filter(id => id !== invoiceId));
    }
  };

  const getStatusBadge = (status: InvoiceType['status']) => {
    const variants: { [key in InvoiceType['status']]: string } = {
      draft: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
      sent: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100',
      paid: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100',
      partially_paid: 'bg-teal-100 text-teal-800 dark:bg-teal-700 dark:text-teal-100',
      late: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100',
      overdue: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100',
      cancelled: 'bg-orange-100 text-orange-800 dark:bg-orange-600 dark:text-orange-100',
      pending_payment: 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-100'
    };
    const labels: { [key in InvoiceType['status']]: string } = {
      draft: 'Brouillon', 
      sent: 'Envoyée', 
      pending: 'En attente',
      paid: 'Payée',
      partially_paid: 'Partiellement payée', 
      late: 'En retard', 
      overdue: 'En retard',
      cancelled: 'Annulée',
      pending_payment: 'Paiement en cours'
    };
    const icons: { [key in InvoiceType['status']]: React.ElementType } = {
      draft: Clock, 
      sent: Send, 
      pending: Clock,
      paid: CheckCircle,
      partially_paid: Wallet, 
      late: AlertTriangle, 
      overdue: AlertTriangle,
      cancelled: XCircle,
      pending_payment: RefreshCw
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
          <SelectItem value="sent">Envoyées</SelectItem>
          <SelectItem value="paid">Payées</SelectItem>
          <SelectItem value="partially_paid">Partiellement payées</SelectItem>
          <SelectItem value="late">En retard</SelectItem>
          <SelectItem value="cancelled">Annulées</SelectItem>
        </>
      );
    } else {
      // Filtres côté client - seulement les statuts pertinents pour eux
      return (
        <>
          <SelectItem value="all">Tous les statuts</SelectItem>
          <SelectItem value="sent">À payer</SelectItem>
          <SelectItem value="paid">Payées</SelectItem>
          <SelectItem value="partially_paid">Partiellement payées</SelectItem>
          <SelectItem value="late">En retard</SelectItem>
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
                {getFilterItems()}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {selectedInvoices.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {selectedInvoices.length} sélectionné(e)s
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Actions par lot disponibles</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedInvoices.length === invoices.length && invoices.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Sélectionner toutes les factures"
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
                    Date d'émission {getSortIcon('createdAt')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hidden md:table-cell" onClick={() => handleSort('dueDate')}>
                  <div className="flex items-center">
                    Échéance {getSortIcon('dueDate')}
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
              {invoices.map((invoice) => (
                <TableRow key={invoice.id} className={invoice.status === 'cancelled' ? "opacity-60" : ""}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedInvoices.includes(invoice.id)}
                      onCheckedChange={(checked) => handleSelectInvoice(invoice.id, !!checked)}
                      aria-label={`Sélectionner facture ${invoice.number}`}
                      className="translate-y-[2px]"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{invoice.number}</TableCell>
                  <TableCell>{invoice.companyName}</TableCell>
                  <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(new Date(invoice.createdAt))}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(new Date(invoice.dueDate))}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
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
                                onClick={() => onViewDetails(invoice)}
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
                              onClick={() => onDownloadPdf(invoice)}
                              disabled={actionLoading === `pdf-${invoice.id}`}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Télécharger PDF</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      {!isAdmin && onPayInvoice && (
                        invoice.status === 'sent' || 
                        invoice.status === 'pending' || 
                        invoice.status === 'late' || 
                        invoice.status === 'partially_paid' || 
                        invoice.status === 'overdue' ||
                        invoice.status === 'pending_payment'
                      ) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary"
                                onClick={() => onPayInvoice(invoice)}
                              >
                                <CreditCard className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Payer cette facture</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          {isAdmin && onEditInvoice && invoice.status === 'draft' && (
                            <DropdownMenuItem onClick={() => onEditInvoice(invoice.id)}>
                              <Pencil className="mr-2 h-4 w-4" /> Modifier
                            </DropdownMenuItem>
                          )}
                          
                          {isAdmin && onUpdateStatus && invoice.status === 'draft' && (
                            <DropdownMenuItem 
                              onClick={() => onUpdateStatus(invoice.id, 'sent')}
                              className="text-blue-600"
                            >
                              <Send className="mr-2 h-4 w-4" /> Finaliser et Envoyer
                            </DropdownMenuItem>
                          )}
                          
                          {isAdmin && onUpdateStatus && (invoice.status === 'sent' || invoice.status === 'late' || invoice.status === 'partially_paid') && (
                            <DropdownMenuItem 
                              onClick={() => onUpdateStatus(invoice.id, 'paid')}
                              className="text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" /> Marquer comme payée
                            </DropdownMenuItem>
                          )}
                          
                          {isAdmin && onUpdateStatus && invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
                            <DropdownMenuItem 
                              onClick={() => onUpdateStatus(invoice.id, 'cancelled')}
                              className="text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" /> Annuler
                            </DropdownMenuItem>
                          )}
                          
                          {!isAdmin && onPayInvoice && (
                            invoice.status === 'sent' || 
                            invoice.status === 'pending' || 
                            invoice.status === 'late' || 
                            invoice.status === 'partially_paid' || 
                            invoice.status === 'overdue' ||
                            invoice.status === 'pending_payment'
                          ) && (
                            <DropdownMenuItem 
                              onClick={() => onPayInvoice(invoice)}
                              className="text-primary"
                            >
                              <CreditCard className="mr-2 h-4 w-4" /> Payer maintenant
                            </DropdownMenuItem>
                          )}
                          
                          {isAdmin && onDeleteInvoice && (invoice.status === 'draft' || invoice.status === 'cancelled') && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => onDeleteInvoice(invoice)}
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

export default InvoiceListView;
