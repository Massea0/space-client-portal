// src/components/modules/quotes/InteractiveQuoteCardRefactored.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Devis as DevisType } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

// Import des sous-composants
import QuoteStatusBadge from './QuoteStatusBadge';
import QuoteCardHeader from './QuoteCardHeader';
import QuoteCardDetails from './QuoteCardDetails';
import QuoteCardActions from './QuoteCardActions';

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
}

/**
 * Version refactorisée du composant InteractiveQuoteCard
 * Décomposé en sous-composants pour une meilleure maintenabilité
 */
const InteractiveQuoteCardRefactored: React.FC<InteractiveQuoteCardProps> = ({
  quote,
  isAdmin = false,
  actionLoading,
  onDownloadPdf,
  onViewDetails,
  onEditQuote,
  onDeleteQuote,
  onUpdateStatus,
  onConvertToInvoice
}) => {
  // État local
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Fonction pour basculer l'état d'expansion
  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Effet pour gérer les clics en dehors de la carte
  useEffect(() => {
    if (!isExpanded) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  return (
    <Card 
      ref={cardRef}
      className="w-full transition-all duration-200 hover:shadow-md"
    >
      {/* En-tête de la carte avec numéro, statut et bouton d'expansion */}
      <QuoteCardHeader 
        quote={quote} 
        isExpanded={isExpanded} 
        onToggleExpand={toggleExpand} 
      />
      
      {/* Contenu principal de la carte */}
      <CardContent className="pb-2">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
          <div>
            <p className="text-sm">Client: <span className="font-semibold">{quote.companyName}</span></p>
            <p className="text-sm">Objet: <span className="font-medium">{quote.object}</span></p>
          </div>
          <div className="text-right mt-2 lg:mt-0">
            <p className="text-lg font-bold">{formatCurrency(quote.amount)}</p>
          </div>
        </div>
      </CardContent>
      
      {/* Détails du devis (visibles uniquement quand la carte est développée) */}
      <AnimatePresence>
        {isExpanded && <QuoteCardDetails quote={quote} />}
      </AnimatePresence>
      
      {/* Actions disponibles pour ce devis */}
      <CardFooter className="flex justify-between items-center pt-2">
        <QuoteCardActions
          quote={quote}
          isAdmin={isAdmin}
          actionLoading={actionLoading}
          onDownloadPdf={onDownloadPdf}
          onViewDetails={onViewDetails}
          onEditQuote={onEditQuote}
          onDeleteQuote={onDeleteQuote}
          onUpdateStatus={onUpdateStatus}
          onConvertToInvoice={onConvertToInvoice}
        />
      </CardFooter>
    </Card>
  );
};

export default React.memo(InteractiveQuoteCardRefactored);
