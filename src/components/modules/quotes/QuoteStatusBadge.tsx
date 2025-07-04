// src/components/modules/quotes/QuoteStatusBadge.tsx
import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, XCircle, AlertTriangle, 
  Clock, FileText, Send 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Devis as DevisType } from '@/types';

interface QuoteStatusBadgeProps {
  status: DevisType['status'];
}

/**
 * Composant pour afficher le badge de statut d'un devis
 * Mémoïsé pour éviter les rendus inutiles
 */
const QuoteStatusBadge: React.FC<QuoteStatusBadgeProps> = React.memo(({ status }) => {
  
  // Mémoiser la configuration du badge pour éviter des recalculs inutiles
  const badgeConfig = useMemo(() => {
    switch (status) {
      case 'draft':
        return { 
          variant: 'outline' as const,
          className: 'bg-secondary text-secondary-foreground',
          icon: <FileText className="h-3.5 w-3.5 mr-1" />,
          label: 'Brouillon'
        };
      case 'sent':
        return { 
          variant: 'outline' as const,
          className: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: <Send className="h-3.5 w-3.5 mr-1" />,
          label: 'Envoyé'
        };
      case 'pending':
        return { 
          variant: 'outline' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: <Clock className="h-3.5 w-3.5 mr-1" />,
          label: 'En attente'
        };
      case 'approved':
        return { 
          variant: 'outline' as const,
          className: 'bg-green-100 text-green-800 border-green-300',
          icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />,
          label: 'Approuvé'
        };
      case 'rejected':
        return { 
          variant: 'outline' as const,
          className: 'bg-red-100 text-red-800 border-red-300',
          icon: <XCircle className="h-3.5 w-3.5 mr-1" />,
          label: 'Rejeté'
        };
      case 'expired':
        return { 
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" />,
          label: 'Expiré'
        };
      case 'validated':
        return { 
          variant: 'outline' as const,
          className: 'bg-indigo-100 text-indigo-800 border-indigo-300',
          icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />,
          label: 'Validé'
        };
      default:
        return { 
          variant: 'outline' as const,
          className: '',
          icon: null,
          label: status
        };
    }
  }, [status]);

  return (
    <Badge 
      variant={badgeConfig.variant} 
      className={cn("flex items-center", badgeConfig.className)}
    >
      {badgeConfig.icon}
      {badgeConfig.label}
    </Badge>
  );
});

QuoteStatusBadge.displayName = 'QuoteStatusBadge';

export default QuoteStatusBadge;
