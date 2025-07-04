// src/components/modules/invoices/InteractiveInvoiceCard.tsx
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
import { useSettings } from '@/context/SettingsContext';
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
// Import du composant IA de prédiction de paiement
import PaymentPredictionCard from '@/components/ai/PaymentPredictionCard';

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
  const { formatCurrency: formatAmount } = useSettings();
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

  const canPay = !isAdmin && (
    invoice.status === 'sent' || 
    invoice.status === 'pending' || 
    invoice.status === 'late' || 
    invoice.status === 'partially_paid' || 
    invoice.status === 'overdue' ||
    invoice.status === 'pending_payment'
  );
  const canEdit = isAdmin && invoice.status === 'draft';
  const canDelete = isAdmin && (invoice.status === 'draft' || invoice.status === 'cancelled');
  const canFinalize = isAdmin && invoice.status === 'draft';
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
                        <div className="ml-2">
                          {getStatusBadge(invoice.status)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>État de la facture</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {invoice.companyName}
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              {expanded && getStatusBadge(invoice.status)}
              
              {/* Bouton Payer visible même en vue compacte */}
              {!expanded && canPay && onPayInvoice && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPayInvoice(invoice);
                        }}
                        disabled={actionLoading === `pay-${invoice.id}`}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {actionLoading === `pay-${invoice.id}` ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <CreditCard className="h-4 w-4" />
                        )}
                        <span className="ml-1 hidden sm:inline">Payer</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Payer cette facture</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {expanded ? (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setExpanded(false); 
                  }}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(true);
                  }}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        {/* Vue compacte - informations essentielles */}
        {!expanded && (
          <CardContent className="pt-0 pb-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-lg font-semibold text-primary">
                  {formatAmount(invoice.amount)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Échéance: {formatDate(invoice.dueDate)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  {invoice.object}
                </div>
                {canPay && (
                  <div className="text-xs text-green-600 font-medium mt-1">
                    ✨ Payable en ligne
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        )}
        
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <CardContent className="px-3 pb-0 pt-1">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Date</div>
                    <div className="font-semibold mt-1">{formatDate(invoice.createdAt)}</div>
                  </div>
                  
                  <div>
                    <div className="text-muted-foreground">Échéance</div>
                    <div className="font-semibold mt-1">{formatDate(invoice.dueDate)}</div>
                  </div>
                  
                  <div>
                    <div className="text-muted-foreground">Total</div>
                    <div className="font-semibold mt-1 text-lg">
                      {formatAmount(invoice.amount)}
                    </div>
                  </div>
                </div>
                
                {invoice.notes && (
                  <div className="mt-4 text-sm">
                    <div className="text-muted-foreground">Notes</div>
                    <div className="font-medium mt-1 text-sm">
                      {invoice.notes.length > 150 
                        ? `${invoice.notes.substring(0, 150)}...` 
                        : invoice.notes}
                    </div>
                  </div>
                )}
              </CardContent>
              
              {/* Section IA - Prédiction de paiement pour les administrateurs */}
              {expanded && isAdmin && (invoice.status !== 'paid' && invoice.status !== 'cancelled') && (
                <div className="px-6 pb-3">
                  <PaymentPredictionCard invoice={invoice} />
                </div>
              )}
              
              <CardFooter className="flex flex-wrap gap-2 pt-3 pb-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadPdf(invoice);
                        }}
                        disabled={actionLoading === `download-${invoice.id}`}
                        className="transition-all duration-300"
                      >
                        {actionLoading === `download-${invoice.id}` ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-1" />
                        )}
                        PDF
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Télécharger la facture en PDF</p>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(invoice);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" /> Détails
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Voir les détails de la facture</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {canPay && onPayInvoice && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPayInvoice(invoice);
                    }}
                    disabled={actionLoading === `pay-${invoice.id}`}
                    className="ml-auto bg-green-600 hover:bg-green-700 transition-all duration-300"
                  >
                    {actionLoading === `pay-${invoice.id}` ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <CreditCard className="h-4 w-4 mr-1" />
                    )}
                    {invoice.status === 'partially_paid' ? 'Finaliser le paiement' : 'Payer'}
                  </Button>
                )}
                
                {/* Actions admin visibles */}
                {canFinalize && onUpdateStatus && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStatus(invoice.id, 'sent');
                    }}
                    disabled={actionLoading === `status-${invoice.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300"
                  >
                    {actionLoading === `status-${invoice.id}` ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Send className="h-4 w-4 mr-1" />
                    )}
                    Finaliser et Envoyer
                  </Button>
                )}
                
                {canMarkAsPaid && onUpdateStatus && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStatus(invoice.id, 'paid');
                    }}
                    disabled={actionLoading === `status-${invoice.id}`}
                    className="bg-green-600 hover:bg-green-700 text-white transition-all duration-300"
                  >
                    {actionLoading === `status-${invoice.id}` ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    )}
                    Marquer comme payée
                  </Button>
                )}

                {isAdmin && (
                  <DropdownMenu>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={(e) => e.stopPropagation()}
                              className="ml-auto"
                            >
                              Actions <ChevronDown className="h-3.5 w-3.5 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Options administrateur</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <DropdownMenuContent 
                      className="w-48"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {canEdit && onEditInvoice && (
                        <DropdownMenuItem
                          onClick={() => onEditInvoice(invoice.id)}
                          disabled={actionLoading === `edit-${invoice.id}`}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                      )}
                      
                      {canFinalize && onUpdateStatus && (
                        <DropdownMenuItem 
                          onClick={() => onUpdateStatus(invoice.id, 'sent')}
                          disabled={actionLoading === `status-${invoice.id}`}
                        >
                          <Send className="h-4 w-4 mr-2 text-blue-600" />
                          Finaliser et Envoyer
                        </DropdownMenuItem>
                      )}
                      
                      {canMarkAsPaid && onUpdateStatus && (
                        <DropdownMenuItem 
                          onClick={() => onUpdateStatus(invoice.id, 'paid')}
                          disabled={actionLoading === `status-${invoice.id}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Marquer comme payée
                        </DropdownMenuItem>
                      )}
                      
                      {canCancel && onUpdateStatus && (
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(invoice.id, 'cancelled')}
                          disabled={actionLoading === `status-${invoice.id}`}
                        >
                          <XCircle className="h-4 w-4 mr-2 text-red-500" />
                          Annuler
                        </DropdownMenuItem>
                      )}
                      
                      {invoice.status === 'cancelled' && onUpdateStatus && (
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(invoice.id, 'draft')}
                          disabled={actionLoading === `status-${invoice.id}`}
                        >
                          <RefreshCw className="h-4 w-4 mr-2 text-blue-500" />
                          Réactiver (brouillon)
                        </DropdownMenuItem>
                      )}
                      
                      {canDelete && onDeleteInvoice && (
                        <DropdownMenuItem 
                          onClick={() => onDeleteInvoice(invoice)}
                          disabled={actionLoading === `delete-${invoice.id}`}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </CardFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default InteractiveInvoiceCard;
