// src/components/modules/quotes/QuoteCardDetails.tsx
import React, { useMemo } from 'react';
import { Devis as DevisType } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';

interface QuoteCardDetailsProps {
  quote: DevisType;
}

/**
 * Composant pour afficher les détails d'un devis
 * Mémoïsé pour éviter les rendus inutiles
 */
const QuoteCardDetails: React.FC<QuoteCardDetailsProps> = React.memo(({ quote }) => {
  
  // Mémoriser les dates formatées pour éviter des recalculs inutiles
  const formattedDates = useMemo(() => ({
    created: formatDate(quote.createdAt),
    validUntil: formatDate(quote.validUntil),
    validated: quote.validatedAt ? formatDate(quote.validatedAt) : null
  }), [quote.createdAt, quote.validUntil, quote.validatedAt]);

  // Mémoriser les informations financières formatées
  const financialInfo = useMemo(() => ({
    amount: formatCurrency(quote.amount),
    items: quote.items.map(item => ({
      ...item,
      formattedUnitPrice: formatCurrency(item.unitPrice),
      formattedTotal: formatCurrency(item.total)
    }))
  }), [quote.amount, quote.items]);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="px-6 pt-0 pb-4">
        {/* Informations générales */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Informations générales</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Objet:</span> {quote.object}
            </div>
            <div>
              <span className="text-muted-foreground">Montant:</span> {financialInfo.amount}
            </div>
            <div>
              <span className="text-muted-foreground">Date de création:</span> {formattedDates.created}
            </div>
            <div>
              <span className="text-muted-foreground">Valide jusqu'au:</span> {formattedDates.validUntil}
            </div>
            {formattedDates.validated && (
              <div>
                <span className="text-muted-foreground">Validé le:</span> {formattedDates.validated}
              </div>
            )}
            {quote.rejectionReason && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Motif de rejet:</span> {quote.rejectionReason}
              </div>
            )}
          </div>
        </div>
        
        {/* Détails des articles */}
        {quote.items && quote.items.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Détails des prestations</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b border-border">
                  <tr>
                    <th className="py-2 text-left">Description</th>
                    <th className="py-2 text-right">Qté</th>
                    <th className="py-2 text-right">Prix unitaire</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {financialInfo.items.map((item) => (
                    <tr key={item.id} className="border-b border-border/50 last:border-0">
                      <td className="py-2">{item.description}</td>
                      <td className="py-2 text-right">{item.quantity}</td>
                      <td className="py-2 text-right">{item.formattedUnitPrice}</td>
                      <td className="py-2 text-right">{item.formattedTotal}</td>
                    </tr>
                  ))}
                  <tr className="font-medium">
                    <td colSpan={3} className="py-2 text-right">Total:</td>
                    <td className="py-2 text-right">{financialInfo.amount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Notes */}
        {quote.notes && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Notes</h4>
            <p className="text-sm whitespace-pre-wrap">{quote.notes}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
});

QuoteCardDetails.displayName = 'QuoteCardDetails';

export default QuoteCardDetails;
