// src/components/ui/draggable-list.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { DraggableItem } from "./draggable-item";

export type DraggableListOrientation = "vertical" | "horizontal" | "grid";
export type DraggableListSortingStrategy = 
  | "vertical" 
  | "horizontal"
  | "rect";

export type DraggableListItem = {
  id: string;
  content: React.ReactNode;
  disabled?: boolean;
};

interface DraggableListProps {
  items: DraggableListItem[];
  onReorder?: (fromIndex: number, toIndex: number) => void;
  onDragStart?: (id: UniqueIdentifier) => void;
  onDragEnd?: (id: UniqueIdentifier) => void;
  onDragOver?: (id: UniqueIdentifier) => void;
  orientation?: DraggableListOrientation;
  strategy?: DraggableListSortingStrategy;
  handle?: boolean;
  containerClassName?: string;
  itemClassName?: string;
  restrictToContainer?: boolean;
  className?: string;
  style?: React.CSSProperties;
  // Nouvelles props pour l'accessibilité
  ariaLabel?: string;
  ariaDescription?: string;
}

/**
 * DraggableList - Un composant pour créer des listes avec items réorganisables par drag & drop
 */
export function DraggableList({
  items,
  onReorder,
  onDragStart,
  onDragEnd,
  onDragOver,
  orientation = "vertical",
  strategy = "vertical",
  handle = false,
  className,
  containerClassName,
  itemClassName,
  restrictToContainer = true,
  ariaLabel = "Liste réorganisable",
  ariaDescription = "Utilisez les flèches ou glissez-déposez pour réorganiser les éléments",
  ...props
}: DraggableListProps) {
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const [orderedItems, setOrderedItems] = React.useState<DraggableListItem[]>(items);

  // Mettre à jour les items quand ils changent en externe
  React.useEffect(() => {
    setOrderedItems(items);
  }, [items]);

  // Configurer les capteurs pour le drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px de mouvement requis avant activation du drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // délai de 250ms pour éviter les interactions accidentelles sur mobile
        tolerance: 5, // tolérance de 5px pour les petits mouvements accidentels
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Déterminer la stratégie de tri en fonction de l'orientation
  const getSortingStrategy = () => {
    switch (strategy) {
      case "horizontal":
        return horizontalListSortingStrategy;
      case "rect":
        return rectSortingStrategy;
      case "vertical":
      default:
        return verticalListSortingStrategy;
    }
  };

  // Gestionnaires d'événements
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
    if (onDragStart) onDragStart(active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = orderedItems.findIndex((item) => item.id === active.id);
      const newIndex = orderedItems.findIndex((item) => item.id === over.id);
      
      // Mettre à jour l'ordre des items
      const newOrderedItems = [...orderedItems];
      const [removed] = newOrderedItems.splice(oldIndex, 1);
      newOrderedItems.splice(newIndex, 0, removed);
      
      setOrderedItems(newOrderedItems);
      if (onReorder) onReorder(oldIndex, newIndex);
    }

    if (onDragEnd) onDragEnd(active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (onDragOver && event.over) {
      onDragOver(event.over.id);
    }
  };

  // Classes CSS en fonction de l'orientation
  let orientationClass = "";
  if (orientation === "vertical") {
    orientationClass = "flex flex-col gap-2";
  } else if (orientation === "horizontal") {
    orientationClass = "flex flex-row gap-2";
  } else if (orientation === "grid") {
    orientationClass = "grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6";
  }
  
  const containerStyles = cn(
    "draggable-list",
    orientationClass,
    containerClassName
  );

  return (
    <div 
      className={cn("draggable-list-wrapper", className)} 
      aria-label={ariaLabel}
      aria-description={ariaDescription}
      {...props}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <SortableContext 
          items={orderedItems.map(item => item.id)} 
          strategy={getSortingStrategy()}
        >
          <div className={containerStyles}>
            {orderedItems.map((item) => (
              <DraggableItem
                key={item.id}
                id={item.id}
                disabled={item.disabled}
                handle={handle}
                isActive={activeId === item.id}
                className={itemClassName}
              >
                {item.content}
              </DraggableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default DraggableList;
