// src/components/modules/support/InteractiveSupportGrid.tsx
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface InteractiveSupportGridProps<T> {
  items: T[];
  loading: boolean;
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  renderItem: (item: T) => React.ReactNode;
  keyExtractor?: (item: T) => string;
  columnLayouts?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  isReady?: boolean;
}

function InteractiveSupportGrid<T>({
  items,
  loading,
  emptyState,
  loadingState,
  renderItem,
  keyExtractor = (item: T) => (item as { id: string }).id,
  columnLayouts = {
    mobile: 1,
    tablet: 2,
    desktop: 3
  },
  isReady = true
}: InteractiveSupportGridProps<T>) {
  // État pour stocker le nombre de colonnes
  const [columnCount, setColumnCount] = useState(columnLayouts.desktop);
  const [columns, setColumns] = useState<T[][]>([]);

  // Effet pour recalculer le nombre de colonnes lors du redimensionnement
  useEffect(() => {
    // Fonction pour obtenir le nombre de colonnes en fonction de la taille de l'écran
    const getResponsiveColumnCount = () => {
      const width = window.innerWidth;
      if (width < 768) return columnLayouts.mobile;
      if (width < 1280) return columnLayouts.tablet;
      return columnLayouts.desktop;
    };
    
    const handleResize = () => {
      setColumnCount(getResponsiveColumnCount());
    };

    // Initialiser au chargement du composant
    setColumnCount(getResponsiveColumnCount());

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [columnLayouts]);

  // Fonction pour distribuer les éléments en colonnes équilibrées
  useEffect(() => {
    // Distribution des éléments dans des colonnes équilibrées
    const distributeItemsInColumns = (items: T[], columnCount: number) => {
      const result: T[][] = Array.from({ length: columnCount }, () => []);
      
      // Distribuer les éléments de manière à équilibrer les colonnes
      items.forEach((item, index) => {
        const columnIndex = index % columnCount;
        result[columnIndex].push(item);
      });
      
      return result;
    };

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
        <h3 className="mt-4 text-lg font-medium">Aucun ticket trouvé</h3>
        <p className="mt-2 text-muted-foreground">
          Essayez de modifier vos critères de recherche ou créez un nouveau ticket.
        </p>
      </div>
    );
  }

  // Classes CSS dynamiques pour la grille en fonction du nombre de colonnes
  const gridClasses = cn(
    "grid gap-6",
    columnCount === 1 && "grid-cols-1",
    columnCount === 2 && "grid-cols-1 md:grid-cols-2",
    columnCount === 3 && "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
    columnCount === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  );

  // Rendu des colonnes avec animation
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence mode="sync">
        {columns.map((column, colIndex) => (
          <div key={`column-${colIndex}`} className="flex flex-col space-y-4">
            {column.map((item, index) => (
              <motion.div
                key={keyExtractor(item)}
                layout
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -10 }}
                transition={{ 
                  duration: 0.4,
                  delay: 0.05 * (index + colIndex * Math.ceil(items.length / columnCount)), // Staggered delay based on position
                  ease: [0.22, 1, 0.36, 1],
                  scale: { type: "spring", stiffness: 100, damping: 15 }
                }}
              >
                {renderItem(item)}
              </motion.div>
            ))}
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export { InteractiveSupportGrid };
