// src/components/modules/dashboard/InteractiveDashboardGrid.tsx
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface InteractiveDashboardGridProps<T> {
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

function InteractiveDashboardGrid<T>({
  items,
  loading,
  emptyState,
  loadingState,
  renderItem,
  keyExtractor = (item: any) => item.id,
  columnLayouts = {
    mobile: 1,
    tablet: 2,
    desktop: 3
  },
  isReady = true
}: InteractiveDashboardGridProps<T>) {
  // État pour stocker le nombre de colonnes en fonction de la taille de l'écran
  const [columnCount, setColumnCount] = useState(columnLayouts.desktop);
  const [columns, setColumns] = useState<T[][]>([]);

  // Fonction pour obtenir le nombre de colonnes en fonction de la taille de l'écran
  const getResponsiveColumnCount = () => {
    const width = window.innerWidth;
    if (width < 768) return columnLayouts.mobile;
    if (width < 1280) return columnLayouts.tablet;
    return columnLayouts.desktop;
  };

  // Effet pour recalculer le nombre de colonnes lors du redimensionnement
  useEffect(() => {
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
        <h3 className="mt-4 text-lg font-medium">Aucun élément trouvé</h3>
        <p className="mt-2 text-muted-foreground">
          Essayez de modifier vos critères de recherche.
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
    <motion.div 
      className={gridClasses}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      {columns.map((column, columnIndex) => (
        <div key={`column-${columnIndex}`} className="space-y-6">
          <AnimatePresence>
            {isReady && column.map((item) => (
              <motion.div
                key={keyExtractor(item)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.3,
                  delay: columnIndex * 0.05
                }}
              >
                {renderItem(item)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ))}
    </motion.div>
  );
}

export { InteractiveDashboardGrid };
