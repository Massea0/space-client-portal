// src/components/ui/EmptyState.tsx
import React from 'react';
import { FileText, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConnectionTroubleshooter } from '../diagnostics/ConnectionTroubleshooter';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  hasFilters?: boolean;
  entityName: string;
  onRefresh: () => void;
  actionButton?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  hasFilters = false,
  entityName,
  onRefresh,
  actionButton
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
      <div className="rounded-full bg-gray-100 p-3 mb-4">
        {icon || <FileText className="h-8 w-8 text-gray-400" />}
      </div>

      <h3 className="text-lg font-medium text-gray-900">
        {title || `Aucun ${entityName} trouvé`}
      </h3>
      
      <p className="mt-1 text-sm text-gray-500">
        {description || (hasFilters 
          ? `Essayez de modifier vos filtres ou votre recherche.`
          : `Vous n'avez pas encore de ${entityName} dans le système.`
        )}
      </p>
      
      {actionButton && (
        <div className="mt-4">
          {actionButton}
        </div>
      )}
      
      <div className="mt-6 flex flex-col gap-2">
        <Button 
          variant="outline" 
          onClick={onRefresh} 
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
        
        <ConnectionTroubleshooter 
          onReloadData={onRefresh} 
          entityName={entityName} 
          className="mt-1"
        />
      </div>
    </div>
  );
};
