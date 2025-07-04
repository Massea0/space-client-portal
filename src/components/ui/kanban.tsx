import React, { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from './card';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import { 
  Plus, 
  MoreHorizontal, 
  User, 
  Calendar, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Flag,
  Tag,
  X
} from 'lucide-react';

// Types pour le Kanban
export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'todo' | 'in-progress' | 'done' | 'blocked';
  tags?: string[];
  estimatedTime?: string;
  attachments?: number;
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  wipLimit?: number;
  color?: string;
  description?: string;
}

export interface KanbanBoard {
  id: string;
  title: string;
  columns: KanbanColumn[];
}

// Props pour les composants
interface KanbanCardComponentProps {
  card: KanbanCard;
  isDragging?: boolean;
  onEdit?: (card: KanbanCard) => void;
  onDelete?: (cardId: string) => void;
}

interface KanbanColumnComponentProps {
  column: KanbanColumn;
  isOverlay?: boolean;
  onAddCard?: (columnId: string) => void;
  onEditCard?: (card: KanbanCard) => void;
  onDeleteCard?: (cardId: string) => void;
  onEditColumn?: (column: KanbanColumn) => void;
}

interface KanbanBoardProps {
  board: KanbanBoard;
  onBoardChange?: (board: KanbanBoard) => void;
  className?: string;
  showWipLimits?: boolean;
  allowQuickAdd?: boolean;
  compact?: boolean;
}

// Animations pour le drag & drop
const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.4',
      },
    },
  }),
};

// Composant KanbanCard
const KanbanCardComponent: React.FC<KanbanCardComponentProps> = ({
  card,
  isDragging = false,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'todo': return <Clock className="h-3 w-3" />;
      case 'in-progress': return <AlertCircle className="h-3 w-3 text-blue-500" />;
      case 'done': return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'blocked': return <Flag className="h-3 w-3 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "touch-none",
        isDragging || isSortableDragging ? "opacity-40" : ""
      )}
      {...attributes}
      {...listeners}
    >
      <Card className={cn(
        "mb-3 cursor-grab active:cursor-grabbing",
        "hover:shadow-md transition-all duration-200",
        "border-l-4 border-l-blue-500",
        isDragging || isSortableDragging ? "rotate-2 shadow-lg" : ""
      )}>
        <CardHeader className="pb-2 space-y-1">
          <div className="flex items-start justify-between">
            <h4 className="text-sm font-medium leading-tight pr-2">
              {card.title}
            </h4>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {getStatusIcon(card.status)}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(card);
                }}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {card.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {card.description}
            </p>
          )}
        </CardHeader>
        
        <CardContent className="pt-0 space-y-3">
          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {card.tags.slice(0, 3).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs px-1.5 py-0.5 h-auto"
                >
                  <Tag className="h-2.5 w-2.5 mr-1" />
                  {tag}
                </Badge>
              ))}
              {card.tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
                  +{card.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Priority Badge */}
          {card.priority && (
            <div className="flex justify-start">
              <Badge 
                className={cn(
                  "text-xs px-2 py-0.5 h-auto font-medium",
                  getPriorityColor(card.priority)
                )}
              >
                {card.priority}
              </Badge>
            </div>
          )}

          {/* Bottom Row: Assignee, Due Date, Estimated Time */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {card.assignee && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span className="truncate max-w-[60px]">
                    {card.assignee.name}
                  </span>
                </div>
              )}
              {card.estimatedTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{card.estimatedTime}</span>
                </div>
              )}
            </div>
            
            {card.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(card.dueDate).toLocaleDateString('fr-FR', { 
                  month: 'short', 
                  day: 'numeric' 
                })}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Composant KanbanColumn
const KanbanColumnComponent: React.FC<KanbanColumnComponentProps> = ({
  column,
  isOverlay = false,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onEditColumn,
}) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleAddCard = useCallback(() => {
    if (newCardTitle.trim()) {
      onAddCard?.(column.id);
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  }, [newCardTitle, onAddCard, column.id]);

  const isOverWipLimit = column.wipLimit && column.cards.length >= column.wipLimit;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col min-h-[200px] w-[320px] bg-gray-50 rounded-lg border border-gray-200",
        isDragging ? "opacity-40" : "",
        isOverlay ? "rotate-2 shadow-lg" : ""
      )}
      {...attributes}
    >
      {/* Column Header */}
      <div 
        className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg"
        {...listeners}
      >
        <div className="flex items-center gap-2 flex-1">
          {column.color && (
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: column.color }}
            />
          )}
          <h3 className="font-semibold text-sm text-gray-900 truncate">
            {column.title}
          </h3>
          <Badge variant="secondary" className="text-xs px-2 py-0.5 h-auto">
            {column.cards.length}
            {column.wipLimit && ` / ${column.wipLimit}`}
          </Badge>
          {isOverWipLimit && (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-gray-100"
            onClick={() => setIsAddingCard(true)}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-gray-100"
            onClick={() => onEditColumn?.(column)}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Column Description */}
      {column.description && (
        <div className="px-4 py-2 text-xs text-muted-foreground bg-white border-b border-gray-100">
          {column.description}
        </div>
      )}

      {/* Cards Area */}
      <div className="flex-1 p-3 overflow-y-auto">
        <SortableContext items={column.cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {column.cards.map((card) => (
              <KanbanCardComponent
                key={card.id}
                card={card}
                onEdit={onEditCard}
                onDelete={onDeleteCard}
              />
            ))}
          </div>
        </SortableContext>

        {/* Quick Add Card */}
        {isAddingCard && (
          <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <Input
              placeholder="Titre de la carte..."
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              className="mb-2 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddCard();
                } else if (e.key === 'Escape') {
                  setIsAddingCard(false);
                  setNewCardTitle('');
                }
              }}
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleAddCard}
                disabled={!newCardTitle.trim()}
              >
                Ajouter
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddingCard(false);
                  setNewCardTitle('');
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {column.cards.length === 0 && !isAddingCard && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
              <Plus className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">Aucune carte</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingCard(true)}
              className="text-xs"
            >
              Ajouter une carte
            </Button>
          </div>
        )}
      </div>

      {/* WIP Limit Warning */}
      {isOverWipLimit && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200 rounded-b-lg">
          <p className="text-xs text-red-600 font-medium">
            ⚠️ Limite WIP dépassée ({column.cards.length}/{column.wipLimit})
          </p>
        </div>
      )}
    </div>
  );
};

// Composant principal KanbanBoard
export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  board,
  onBoardChange,
  className,
  showWipLimits = true,
  allowQuickAdd = true,
  compact = false,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<KanbanCard | KanbanColumn | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columnsId = useMemo(() => board.columns.map((col) => col.id), [board.columns]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    
    const { active } = event;
    const activeData = active.data.current;
    
    if (activeData?.type === 'Column') {
      setDraggedItem(activeData.column);
    } else {
      // Find the card being dragged
      for (const column of board.columns) {
        const card = column.cards.find(c => c.id === active.id);
        if (card) {
          setDraggedItem(card);
          break;
        }
      }
    }
  }, [board.columns]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // If dragging a card over another column
    if (!activeData?.type && overData?.type === 'Column') {
      const newBoard = { ...board };
      
      // Find source column and card
      let sourceColumnIndex = -1;
      let cardIndex = -1;
      let cardToMove: KanbanCard | null = null;

      for (let i = 0; i < newBoard.columns.length; i++) {
        const cardIdx = newBoard.columns[i].cards.findIndex(c => c.id === activeId);
        if (cardIdx !== -1) {
          sourceColumnIndex = i;
          cardIndex = cardIdx;
          cardToMove = newBoard.columns[i].cards[cardIdx];
          break;
        }
      }

      if (!cardToMove) return;

      // Find target column
      const targetColumnIndex = newBoard.columns.findIndex(col => col.id === overId);
      if (targetColumnIndex === -1) return;

      // Don't move if same column
      if (sourceColumnIndex === targetColumnIndex) return;

      // Remove card from source column
      newBoard.columns[sourceColumnIndex].cards.splice(cardIndex, 1);
      
      // Add card to target column
      newBoard.columns[targetColumnIndex].cards.push(cardToMove);

      onBoardChange?.(newBoard);
    }
  }, [board, onBoardChange]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setDraggedItem(null);
    
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeData = active.data.current;
    
    // Handle column reordering
    if (activeData?.type === 'Column') {
      const newBoard = { ...board };
      const oldIndex = newBoard.columns.findIndex((col) => col.id === activeId);
      const newIndex = newBoard.columns.findIndex((col) => col.id === overId);
      
      newBoard.columns = arrayMove(newBoard.columns, oldIndex, newIndex);
      onBoardChange?.(newBoard);
      return;
    }

    // Handle card reordering within the same column
    const newBoard = { ...board };
    
    // Find the columns containing the active and over items
    let sourceColumnIndex = -1;
    let targetColumnIndex = -1;
    let activeCardIndex = -1;
    let targetCardIndex = -1;

    for (let i = 0; i < newBoard.columns.length; i++) {
      const activeIdx = newBoard.columns[i].cards.findIndex(c => c.id === activeId);
      const targetIdx = newBoard.columns[i].cards.findIndex(c => c.id === overId);
      
      if (activeIdx !== -1) {
        sourceColumnIndex = i;
        activeCardIndex = activeIdx;
      }
      if (targetIdx !== -1) {
        targetColumnIndex = i;
        targetCardIndex = targetIdx;
      }
    }

    // If both cards are in the same column, reorder them
    if (sourceColumnIndex === targetColumnIndex && sourceColumnIndex !== -1) {
      newBoard.columns[sourceColumnIndex].cards = arrayMove(
        newBoard.columns[sourceColumnIndex].cards,
        activeCardIndex,
        targetCardIndex
      );
      onBoardChange?.(newBoard);
    }
  }, [board, onBoardChange]);

  const handleAddCard = useCallback((columnId: string) => {
    const newCard: KanbanCard = {
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: 'Nouvelle carte',
      description: 'Description de la nouvelle carte',
      status: 'todo',
      priority: 'medium',
    };

    const newBoard = { ...board };
    const columnIndex = newBoard.columns.findIndex(col => col.id === columnId);
    if (columnIndex !== -1) {
      newBoard.columns[columnIndex].cards.push(newCard);
      onBoardChange?.(newBoard);
    }
  }, [board, onBoardChange]);

  return (
    <div className={cn("h-full", className)}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 h-full overflow-x-auto p-4">
          <SortableContext items={columnsId} strategy={verticalListSortingStrategy}>
            {board.columns.map((column) => (
              <KanbanColumnComponent
                key={column.id}
                column={column}
                onAddCard={allowQuickAdd ? handleAddCard : undefined}
                onEditCard={(card) => console.log('Edit card:', card)}
                onDeleteCard={(cardId) => console.log('Delete card:', cardId)}
                onEditColumn={(column) => console.log('Edit column:', column)}
              />
            ))}
          </SortableContext>
        </div>

        <DragOverlay dropAnimation={dropAnimationConfig}>
          {activeId && draggedItem ? (
            draggedItem && 'title' in draggedItem && 'cards' in draggedItem ? (
              <KanbanColumnComponent
                column={draggedItem as KanbanColumn}
                isOverlay
              />
            ) : (
              <KanbanCardComponent
                card={draggedItem as KanbanCard}
                isDragging
              />
            )
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

// Export des types et composants
export {
  KanbanCardComponent,
  KanbanColumnComponent,
};

export default KanbanBoard;
