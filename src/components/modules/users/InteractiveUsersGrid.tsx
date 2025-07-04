// src/components/modules/users/InteractiveUsersGrid.tsx
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { User, FileQuestion, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface InteractiveUsersGridProps<T> {
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

function InteractiveUsersGrid<T>({
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
}: InteractiveUsersGridProps<T>) {
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

    // Appel initial
    handleResize();

    // Ajouter l'écouteur de redimensionnement
    window.addEventListener('resize', handleResize);
    
    // Nettoyer l'écouteur
    return () => window.removeEventListener('resize', handleResize);
  }, [columnLayouts]);

  // Effet pour réorganiser les éléments en colonnes lorsque items ou columnCount changent
  useEffect(() => {
    if (items.length === 0 || !columnCount) {
      setColumns([]);
      return;
    }
    
    // Créer un tableau de colonnes vides
    const newColumns: T[][] = Array.from({ length: columnCount }, () => []);
    
    // Répartir les éléments dans les colonnes (distribution par colonnes pour équilibrer les hauteurs)
    items.forEach((item, index) => {
      const columnIndex = index % columnCount;
      newColumns[columnIndex].push(item);
    });
    
    setColumns(newColumns);
  }, [items, columnCount]);

  // État vide personnalisé ou par défaut
  const renderEmptyState = () => {
    if (emptyState) return emptyState;
    
    return (
      <Card className="col-span-full">
        <CardContent className="flex flex-col items-center justify-center py-10 px-6 text-center">
          <FileQuestion className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucun utilisateur trouvé</h3>
          <p className="text-sm text-muted-foreground">
            Essayez de modifier vos filtres ou créez un nouvel utilisateur.
          </p>
        </CardContent>
      </Card>
    );
  };

  // État de chargement personnalisé ou par défaut
  const renderLoadingState = () => {
    if (loadingState) return loadingState;
    
    return (
      <div className="col-span-full flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
      </div>
    );
  };

  // Si pas encore prêt, afficher un placeholder
  if (!isReady) return <div className="min-h-[200px]"></div>;

  // Afficher l'état de chargement
  if (loading) return renderLoadingState();

  // Afficher l'état vide si pas d'éléments
  if (items.length === 0) return renderEmptyState();

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

export { InteractiveUsersGrid };
