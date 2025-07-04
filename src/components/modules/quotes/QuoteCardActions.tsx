// src/components/modules/quotes/QuoteCardActions.tsx
import React, { useCallback } from 'react';
import { Devis as DevisType } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Download, Eye, CheckCircle, XCircle, 
  Pencil, Trash2, RefreshCw, Archive, Send
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface QuoteCardActionsProps {
  quote: DevisType;
  isAdmin: boolean;
  actionLoading: string | null;
  onDownloadPdf: (quote: DevisType) => Promise<void>;
  onViewDetails?: (quote: DevisType) => void;
  onEditQuote?: (quoteId: string) => void;
  onDeleteQuote?: (quote: DevisType) => void;
  onUpdateStatus?: (id: string, status: DevisType['status'], reason?: string) => Promise<void>;
  onConvertToInvoice?: (id: string, number: string) => Promise<void>;
}

/**
 * Composant pour afficher les actions disponibles sur un devis
 * Mémoïsé pour éviter les rendus inutiles
 */
const QuoteCardActions: React.FC<QuoteCardActionsProps> = React.memo(({
  quote,
  isAdmin,
  actionLoading,
  onDownloadPdf,
  onViewDetails,
  onEditQuote,
  onDeleteQuote,
  onUpdateStatus,
  onConvertToInvoice
}) => {
  
  // Mémoriser les fonctions de gestion d'événements
  const handleDownload = useCallback(() => {
    onDownloadPdf(quote);
  }, [onDownloadPdf, quote]);

  const handleViewDetails = useCallback(() => {
    onViewDetails?.(quote);
  }, [onViewDetails, quote]);

  const handleEdit = useCallback(() => {
    onEditQuote?.(quote.id);
  }, [onEditQuote, quote.id]);

  const handleDelete = useCallback(() => {
    onDeleteQuote?.(quote);
  }, [onDeleteQuote, quote]);

  const handleStatusChange = useCallback((status: DevisType['status'], reason?: string) => {
    onUpdateStatus?.(quote.id, status, reason);
  }, [onUpdateStatus, quote.id]);

  const handleConvertToInvoice = useCallback(() => {
    onConvertToInvoice?.(quote.id, quote.number);
  }, [onConvertToInvoice, quote.id, quote.number]);

  // Déterminer quelles actions sont disponibles en fonction du statut
  const canEdit = isAdmin || quote.status === 'draft';
  const canDelete = isAdmin || quote.status === 'draft';
  const canApprove = isAdmin && (quote.status === 'sent' || quote.status === 'pending');
  const canReject = isAdmin && (quote.status === 'sent' || quote.status === 'pending');
  const canSend = isAdmin && quote.status === 'draft';
  const canConvertToInvoice = isAdmin && quote.status === 'approved';

  return (
    <div className="flex flex-wrap gap-2 justify-end">
      {/* Bouton de téléchargement */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              disabled={actionLoading === `download_${quote.id}`}
            >
              {actionLoading === `download_${quote.id}` ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Download className="h-4 w-4 mr-1" />
              )}
              PDF
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Télécharger le PDF</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Bouton de détails */}
      {onViewDetails && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewDetails}
              >
                <Eye className="h-4 w-4 mr-1" />
                Détails
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Voir les détails</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Boutons d'édition et de suppression */}
      {canEdit && onEditQuote && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Modifier
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Modifier ce devis</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Actions supplémentaires */}
      <DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2">
                  <span className="sr-only">Actions</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM15.5 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Plus d'actions</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DropdownMenuContent align="end">
          {canSend && onUpdateStatus && (
            <DropdownMenuItem onClick={() => handleStatusChange('sent')}>
              <Send className="h-4 w-4 mr-2" />
              Marquer comme envoyé
            </DropdownMenuItem>
          )}
          
          {canApprove && onUpdateStatus && (
            <DropdownMenuItem onClick={() => handleStatusChange('approved')}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approuver
            </DropdownMenuItem>
          )}
          
          {canReject && onUpdateStatus && (
            <DropdownMenuItem onClick={() => handleStatusChange('rejected')}>
              <XCircle className="h-4 w-4 mr-2" />
              Rejeter
            </DropdownMenuItem>
          )}
          
          {canConvertToInvoice && onConvertToInvoice && (
            <DropdownMenuItem onClick={handleConvertToInvoice}>
              <Archive className="h-4 w-4 mr-2" />
              Convertir en facture
            </DropdownMenuItem>
          )}
          
          {canDelete && onDeleteQuote && (
            <DropdownMenuItem 
              className="text-red-500 focus:text-red-500" 
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});

QuoteCardActions.displayName = 'QuoteCardActions';

export default QuoteCardActions;
