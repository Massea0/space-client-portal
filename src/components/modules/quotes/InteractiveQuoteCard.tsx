// src/components/quotes/InteractiveQuoteCard.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Devis as DevisType } from '@/types';
import { 
  Card, CardContent, CardFooter, CardHeader,
  CardTitle, CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { 
  Download, Eye, CheckCircle, XCircle, AlertTriangle, 
  Clock, FileText, Send, Pencil, Trash2, RefreshCw, Archive,
  ChevronDown, ChevronUp, MoreHorizontal, Bookmark, Wand2
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
// Import du composant IA d'optimisation de devis
import QuoteOptimizationPanel from '@/components/ai/QuoteOptimizationPanel';

interface InteractiveQuoteCardProps {
  quote: DevisType;
  isAdmin?: boolean;
  actionLoading?: string | null;
  onDownloadPdf: (quote: DevisType) => Promise<void>;
  onViewDetails?: (quote: DevisType) => void;
  onEditQuote?: (quoteId: string) => void;
  onDeleteQuote?: (quote: DevisType) => void;
  onUpdateStatus?: (id: string, status: DevisType['status'], reason?: string) => Promise<void>;
  onConvertToInvoice?: (id: string, number: string) => Promise<void>;
  onGenerateContract?: (devisId: string, devisNumber: string) => Promise<void>;
}

const InteractiveQuoteCard: React.FC<InteractiveQuoteCardProps> = ({
  quote,
  isAdmin = false,
  actionLoading,
  onDownloadPdf,
  onViewDetails,
  onEditQuote,
  onDeleteQuote,
  onUpdateStatus,
  onConvertToInvoice,
  onGenerateContract
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
          'text-xs whitespace-nowrap flex items-center gap-1 animate-fade-in transition-all duration-300'
        )}
      >
        <Icon className="h-3 w-3" />
        {labels[status] || status}
      </Badge>
    );
  };

  const canEdit = isAdmin && quote.status !== 'validated' && quote.status !== 'approved';
  const canDelete = isAdmin && quote.status !== 'validated' && quote.status !== 'approved';
  const canConvert = isAdmin && quote.status === 'approved';
  const canApprove = !isAdmin && quote.status === 'sent';
  const canMarkAsSent = isAdmin && quote.status === 'draft';
  const canReturnToDraft = isAdmin && quote.status === 'sent';
  const canReject = isAdmin && quote.status !== 'rejected' && quote.status !== 'draft';
  const canMarkAsExpired = isAdmin && quote.status !== 'expired' && quote.status !== 'approved' && quote.status !== 'rejected';

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
          quote.status === 'expired' && "opacity-80"
        )}
        onClick={expanded ? undefined : () => setExpanded(true)}
      >
        <CardHeader className="pb-2 relative">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl text-primary flex items-center">
                {quote.number}
                {!expanded && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Bookmark className={cn(
                          "ml-2 h-4 w-4 opacity-60",
                          quote.status === 'approved' && "text-green-500",
                          quote.status === 'rejected' && "text-red-500"
                        )} />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Créé le {formatDate(new Date(quote.createdAt))}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </CardTitle>
              {expanded && (
                <CardDescription className="text-sm text-muted-foreground">
                  Client: {quote.companyName}
                </CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(quote.status)}
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
                        {formatCurrency(quote.amount)}
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
                  {quote.object}
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
                          onViewDetails && onViewDetails(quote);
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
                          onDownloadPdf(quote);
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
                  <strong>Objet:</strong> {quote.object}
                </p>
                <p className="text-lg font-semibold text-foreground">
                  Montant: {formatCurrency(quote.amount)}
                </p>
                
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
              
              {/* Section IA - Optimisation de devis pour les devis draft ou sent */}
              {(quote.status === 'draft' || quote.status === 'sent') && (
                <div className="px-6 pb-3">
                  <QuoteOptimizationPanel quote={quote} />
                </div>
              )}
              
              <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-3 pb-3 border-t">
                <div className="flex flex-wrap gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onDownloadPdf(quote)}
                          disabled={actionLoading === `pdf-${quote.id}`}
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
                            onClick={() => onViewDetails(quote)}
                            className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline ml-1">Détails</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Voir tous les détails du devis</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {canEdit && onEditQuote && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onEditQuote(quote.id)}
                            disabled={actionLoading === quote.id}
                            className="flex items-center gap-1.5"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline ml-1">Modifier</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Modifier ce devis</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {canDelete && onDeleteQuote && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onDeleteQuote(quote)}
                            disabled={actionLoading === quote.id}
                            className="flex items-center gap-1.5 text-destructive border-destructive/50 hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline ml-1">Supprimer</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Supprimer ce devis</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {/* Menu déroulant pour les actions additionnelles */}
                  {isAdmin && (onUpdateStatus || onConvertToInvoice) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
                          Actions <ChevronDown className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canMarkAsSent && onUpdateStatus && (
                          <DropdownMenuItem 
                            onClick={() => {
                              console.log(`[DEBUG] InteractiveQuoteCard: Appel onUpdateStatus pour marquer comme envoyé`, { quoteId: quote.id, status: 'sent' });
                              onUpdateStatus(quote.id, 'sent');
                            }}
                            disabled={actionLoading === quote.id}
                            className="text-blue-600"
                          >
                            <Send className="mr-2 h-4 w-4" /> Marquer comme envoyé
                          </DropdownMenuItem>
                        )}
                        
                        {canReturnToDraft && onUpdateStatus && (
                          <DropdownMenuItem 
                            onClick={() => onUpdateStatus(quote.id, 'draft')}
                            disabled={actionLoading === quote.id}
                          >
                            <Archive className="mr-2 h-4 w-4" /> Remettre en brouillon
                          </DropdownMenuItem>
                        )}
                        
                        {canReject && onUpdateStatus && (
                          <DropdownMenuItem 
                            onClick={() => onUpdateStatus(quote.id, 'rejected')}
                            disabled={actionLoading === quote.id}
                            className="text-red-600"
                          >
                            <XCircle className="mr-2 h-4 w-4" /> Enregistrer un rejet
                          </DropdownMenuItem>
                        )}
                        
                        {canMarkAsExpired && onUpdateStatus && (
                          <DropdownMenuItem 
                            onClick={() => onUpdateStatus(quote.id, 'expired')}
                            disabled={actionLoading === quote.id}
                            className="text-orange-600"
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" /> Marquer comme expiré
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  
                  {canConvert && onConvertToInvoice && (
                    <Button
                      size="sm"
                      onClick={() => onConvertToInvoice(quote.id, quote.number)}
                      disabled={actionLoading === `convert-${quote.id}`}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      {actionLoading === `convert-${quote.id}` ? 'Conversion...' : 'Convertir en facture'}
                    </Button>
                  )}

                  {canConvert && onGenerateContract && (
                    <Button
                      size="sm"
                      onClick={() => onGenerateContract(quote.id, quote.number)}
                      disabled={actionLoading === `contract-${quote.id}`}
                      className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5"
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      {actionLoading === `contract-${quote.id}` ? 'Génération...' : 'Générer contrat IA'}
                    </Button>
                  )}

                  {canApprove && onUpdateStatus && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onUpdateStatus(quote.id, 'approved')}
                      disabled={actionLoading === quote.id}
                      className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Approuver
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

export default InteractiveQuoteCard;
