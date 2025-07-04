// src/components/ui/interactive-grid.tsx
import React, { useState, useEffect } from 'react';
import { distributeItemsInColumns, getResponsiveColumnCount } from '@/lib/layoutUtils';

interface InteractiveGridProps<T> {
  items: T[];
  loading: boolean;
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  renderItem: (item: T) => React.ReactNode;
  keyExtractor?: (item: T) => string;
  isReady?: boolean;
}

function InteractiveGrid<T>({
  items,
  loading,
  emptyState,
  loadingState,
  renderItem,
  keyExtractor = (item: any) => item.id,
  isReady = true
}: InteractiveGridProps<T>) {
  // État pour stocker le nombre de colonnes
  const [columnCount, setColumnCount] = useState(() => getResponsiveColumnCount());
  const [columns, setColumns] = useState<T[][]>([]);

  // Effet pour recalculer le nombre de colonnes lors du redimensionnement
  useEffect(() => {
    const handleResize = () => {
      setColumnCount(getResponsiveColumnCount());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effet pour redistribuer les éléments dans les colonnes quand les items ou le nombre de colonnes changent
  useEffect(() => {
    setColumns(distributeItemsInColumns(items, columnCount));
  }, [items, columnCount]);

  // État de chargement
  if (loading) {
    return loadingState || (
      <div className="col-span-full flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 text-lg">Chargement...</span>
      </div>
    );
  }

  // État vide
  if (items.length === 0) {
    return emptyState || (
      <div className="col-span-full text-center py-12 border rounded-lg bg-muted/20">
        <div className="mx-auto h-12 w-12 text-muted-foreground">🔎</div>
        <h3 className="mt-4 text-lg font-medium">Aucun élément trouvé</h3>
        <p className="mt-2 text-muted-foreground">
          Essayez de modifier vos critères de recherche.
        </p>
      </div>
    );
  }

  // Rendu des colonnes
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {columns.map((column, columnIndex) => (
        <div key={`column-${columnIndex}`} className="space-y-6">
          {column.map((item) => (
            <div key={keyExtractor(item)}>
              {typeof renderItem === 'function' ? renderItem(item) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export { InteractiveGrid };
