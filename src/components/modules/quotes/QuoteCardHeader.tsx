// src/components/modules/quotes/QuoteCardHeader.tsx
import React, { useCallback } from 'react';
import { formatDate } from '@/lib/utils';
import { Devis as DevisType } from '@/types';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QuoteStatusBadge from './QuoteStatusBadge';

interface QuoteCardHeaderProps {
  quote: DevisType;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

/**
 * Composant pour afficher l'en-tête d'une carte de devis
 * Mémoïsé pour éviter les rendus inutiles
 */
const QuoteCardHeader: React.FC<QuoteCardHeaderProps> = React.memo(({ 
  quote, 
  isExpanded, 
  onToggleExpand 
}) => {
  
  // Utiliser useCallback pour éviter des recréations inutiles de la fonction
  const handleToggleClick = useCallback(() => {
    onToggleExpand();
  }, [onToggleExpand]);

  return (
    <CardHeader className="relative pb-2">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-lg font-bold mb-1">{quote.number}</CardTitle>
          <CardDescription className="text-sm mb-1">
            Créé le {formatDate(quote.createdAt)}
          </CardDescription>
          <CardDescription className="text-sm text-foreground/60">
            Client: {quote.companyName}
          </CardDescription>
        </div>
        <div className="flex flex-col items-end gap-2">
          <QuoteStatusBadge status={quote.status} />
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0" 
            onClick={handleToggleClick}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            <span className="sr-only">
              {isExpanded ? 'Réduire' : 'Développer'} le devis
            </span>
          </Button>
        </div>
      </div>
    </CardHeader>
  );
});

QuoteCardHeader.displayName = 'QuoteCardHeader';

export default QuoteCardHeader;
