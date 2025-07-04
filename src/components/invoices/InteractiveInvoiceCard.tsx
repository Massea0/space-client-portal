// src/components/invoices/InteractiveInvoiceCard.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Invoice as InvoiceType } from '@/types';
import { 
  Card, CardContent, CardFooter, CardHeader,
  CardTitle, CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { 
  Download, Eye, CheckCircle, XCircle, AlertTriangle, Wallet,
  Clock, FileText, Send, Pencil, Trash2, RefreshCw, Archive,
  ChevronDown, ChevronUp, MoreHorizontal, Bookmark, CreditCard
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface InteractiveInvoiceCardProps {
  invoice: InvoiceType;
  isAdmin?: boolean;
  actionLoading?: string | null;
  onDownloadPdf: (invoice: InvoiceType) => Promise<void>;
  onViewDetails?: (invoice: InvoiceType) => void;
  onPayInvoice?: (invoice: InvoiceType) => void;
  onEditInvoice?: (invoiceId: string) => void;
  onDeleteInvoice?: (invoice: InvoiceType) => void;
  onUpdateStatus?: (id: string, status: InvoiceType['status'], reason?: string) => Promise<void>;
}

const InteractiveInvoiceCard: React.FC<InteractiveInvoiceCardProps> = ({
  invoice,
  isAdmin = false,
  actionLoading,
  onDownloadPdf,
  onViewDetails,
  onPayInvoice,
  onEditInvoice,
  onDeleteInvoice,
  onUpdateStatus
}) => {
  const [expanded, setExpanded] = useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  
  // Gestionnaire pour fermer la carte quand on clique en dehors
  React.useEffect(() => {
    if (!expanded) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setExpanded(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expanded]);
  
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
          'text-xs whitespace-nowrap flex items-center gap-1 animate-fade-in transition-all duration-300'
        )}
      >
        <Icon className="h-3 w-3" />
        {labels[status] || status}
      </Badge>
    );
  };

  const canPay = !isAdmin && (invoice.status === 'sent' || invoice.status === 'late' || invoice.status === 'partially_paid' || invoice.status === 'overdue');
  const canEdit = isAdmin && invoice.status === 'draft';
  const canDelete = isAdmin && (invoice.status === 'draft' || invoice.status === 'cancelled');
  const canCancel = isAdmin && invoice.status !== 'cancelled' && invoice.status !== 'paid' && invoice.status !== 'partially_paid';
  const canMarkAsPaid = isAdmin && (invoice.status === 'sent' || invoice.status === 'late' || invoice.status === 'partially_paid' || invoice.status === 'overdue' || invoice.status === 'pending_payment');
  
  return (
    <motion.div
      // Nous ne définissons pas de layoutId pour éviter l'animation globale
      // et utilisons simplement une animation locale plus simple
      animate={{ 
        opacity: 1,
        scale: 1
      }}
      initial={{ 
        opacity: 0,
        scale: 0.95
      }}
      exit={{ 
        opacity: 0,
        scale: 0.95
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      ref={cardRef}
    >
      <Card 
        className={cn(
          "overflow-hidden transition-all duration-300 hover:shadow-md border-opacity-80 rounded-xl",
          expanded ? "shadow-md border-primary/50" : "cursor-pointer hover:scale-[1.01]",
          invoice.status === 'cancelled' && "opacity-80"
        )}
        onClick={expanded ? undefined : () => setExpanded(true)}
      >
        <CardHeader className="pb-2 relative">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl text-primary flex items-center">
                {invoice.number}
                {!expanded && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Bookmark className={cn(
                          "ml-2 h-4 w-4 opacity-60",
                          invoice.status === 'paid' && "text-green-500",
                          invoice.status === 'late' && "text-red-500"
                        )} />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Créée le {formatDate(new Date(invoice.createdAt))}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </CardTitle>
              {expanded && (
                <CardDescription className="text-sm text-muted-foreground">
                  Client: {invoice.companyName}
                </CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(invoice.status)}
              {expanded && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(false);
                  }}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              )}
              {!expanded && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="font-semibold text-right text-sm">
                        {formatCurrency(invoice.amount)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Montant total</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          
          {!expanded && (
            <div className="flex justify-between items-center mt-1">
              <div>
                <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                  {invoice.object}
                </p>
              </div>
              
              <div className="flex items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 rounded-full opacity-70 hover:opacity-100" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails && onViewDetails(invoice);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Voir les détails</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-full opacity-70 hover:opacity-100" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadPdf(invoice);
                        }}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Télécharger PDF</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {canPay && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 rounded-full text-primary opacity-90 hover:opacity-100 hover:bg-primary/10" 
                          onClick={(e) => {
                            e.stopPropagation();
                            onPayInvoice && onPayInvoice(invoice);
                          }}
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Payer la facture</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-full opacity-70 hover:opacity-100" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpanded(true);
                        }}
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Plus d'options</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}
        </CardHeader>
        
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ 
                duration: 0.4, 
                ease: [0.04, 0.62, 0.23, 0.98],
                height: { duration: 0.4 },
                opacity: { duration: 0.25 }
              }}
            >
              <CardContent className="space-y-3 pb-2">
                <p className="text-sm text-foreground">
                  <strong>Référence:</strong> {invoice.number}
                </p>
                <p className="text-lg font-semibold text-foreground">
                  Montant: {formatCurrency(invoice.amount)}
                </p>
                
                <div className="text-sm text-muted-foreground">
                  <p><strong>Créée le:</strong> {formatDate(new Date(invoice.createdAt))}</p>
                  <p><strong>Date d'échéance:</strong> {formatDate(new Date(invoice.dueDate))}</p>
                  {invoice.status === 'paid' && (
                    <p className="text-green-700"><strong>Date de paiement:</strong> {formatDate(new Date(invoice.paidAt || invoice.createdAt))}</p>
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
              
              <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-3 pb-3 border-t">
                <div className="flex flex-wrap gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onDownloadPdf(invoice)}
                          disabled={actionLoading === `pdf-${invoice.id}`}
                          className="flex items-center gap-1.5"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline ml-1">PDF</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Télécharger au format PDF</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {onViewDetails && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onViewDetails(invoice)}
                            className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline ml-1">Détails</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Voir tous les détails de la facture</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {canEdit && onEditInvoice && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onEditInvoice(invoice.id)}
                            disabled={actionLoading === invoice.id}
                            className="flex items-center gap-1.5"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline ml-1">Modifier</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Modifier cette facture</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {canDelete && onDeleteInvoice && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onDeleteInvoice(invoice)}
                            disabled={actionLoading === invoice.id}
                            className="flex items-center gap-1.5 text-destructive border-destructive/50 hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline ml-1">Supprimer</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Supprimer cette facture</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {/* Menu déroulant pour les actions additionnelles (admin) */}
                  {isAdmin && (onUpdateStatus) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
                          Actions <ChevronDown className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canMarkAsPaid && onUpdateStatus && (
                          <DropdownMenuItem 
                            onClick={() => onUpdateStatus(invoice.id, 'paid')}
                            disabled={actionLoading === invoice.id}
                            className="text-green-600"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" /> Marquer comme payée
                          </DropdownMenuItem>
                        )}
                        
                        {canCancel && onUpdateStatus && (
                          <DropdownMenuItem 
                            onClick={() => onUpdateStatus(invoice.id, 'cancelled')}
                            disabled={actionLoading === invoice.id}
                            className="text-red-600"
                          >
                            <XCircle className="mr-2 h-4 w-4" /> Annuler la facture
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  
                  {/* Bouton de paiement (client) */}
                  {canPay && onPayInvoice && (
                    <Button
                      size="sm"
                      onClick={() => onPayInvoice(invoice)}
                      disabled={actionLoading === `pay-${invoice.id}`}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      <span className="ml-1">Payer maintenant</span>
                    </Button>
                  )}
                </div>
              </CardFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default InteractiveInvoiceCard;
