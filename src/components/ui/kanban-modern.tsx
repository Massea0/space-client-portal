// src/components/ui/kanban-modern.tsx
// Composant Kanban moderne avec drag & drop et UI unifiée
import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  MoreHorizontal,
  Plus,
  Edit3,
  Trash2,
  MessageSquare,
  Paperclip
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, formatDate } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';
import type { Task } from '@/types';

interface KanbanColumn {
  id: string;
  title: string;
  status: Task['status'];
  tasks: Task[];
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ModernKanbanProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: Task['status']) => Promise<void>;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => Promise<void>;
  onTaskCreate?: (status: Task['status']) => void;
  loading?: boolean;
  className?: string;
}

const statusConfig = {
  'todo': {
    title: 'À faire',
    color: 'status-todo',
    icon: Clock,
    bgColor: 'status-todo-bg'
  },
  'in-progress': {
    title: 'En cours',
    color: 'status-progress',
    icon: PlayCircle,
    bgColor: 'status-progress-bg'
  },
  'in-review': {
    title: 'En révision',
    color: 'status-review',
    icon: PauseCircle,
    bgColor: 'status-review-bg'
  },
  'done': {
    title: 'Terminé',
    color: 'status-done',
    icon: CheckCircle,
    bgColor: 'status-done-bg'
  }
};

const priorityConfig = {
  'low': { color: 'priority-low', label: 'Faible' },
  'medium': { color: 'priority-medium', label: 'Moyenne' },
  'high': { color: 'priority-high', label: 'Haute' },
  'urgent': { color: 'priority-urgent', label: 'Urgente' }
};

export const ModernKanban: React.FC<ModernKanbanProps> = ({
  tasks,
  onTaskMove,
  onTaskEdit,
  onTaskDelete,
  onTaskCreate,
  loading = false,
  className
}) => {
  const { formatCurrency } = useCurrency();
  const [isDragging, setIsDragging] = useState(false);

  // Organiser les tâches par statut
  const columns: KanbanColumn[] = Object.entries(statusConfig).map(([status, config]) => ({
    id: status,
    title: config.title,
    status: status as Task['status'],
    tasks: tasks.filter(task => task.status === status),
    color: config.color,
    icon: config.icon
  }));

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    setIsDragging(false);
    
    const { destination, source, draggableId } = result;

    // Annuler si pas de destination ou même position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    const newStatus = destination.droppableId as Task['status'];
    await onTaskMove(draggableId, newStatus);
  }, [onTaskMove]);

  const TaskCard: React.FC<{ task: Task; index: number }> = ({ task, index }) => {
    const priorityStyle = priorityConfig[task.priority];
    
    return (
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={cn(
              "kanban-card group relative",
              snapshot.isDragging && "dragging"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="text-label font-medium leading-tight pr-2">
                {task.title}
              </h4>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onTaskEdit && (
                    <DropdownMenuItem onClick={() => onTaskEdit(task)}>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {onTaskDelete && (
                    <DropdownMenuItem 
                      onClick={() => onTaskDelete(task.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {task.description && (
              <p className="text-body-sm text-muted-foreground mb-3 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Badges de priorité et statut */}
            <div className="flex items-center gap-2 mb-3">
              <span className={cn("priority-badge", priorityStyle.color)}>
                {priorityStyle.label}
              </span>
              {task.estimatedHours && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="mr-1 h-3 w-3" />
                  {task.estimatedHours}h
                </Badge>
              )}
            </div>

            {/* Budget si présent */}
            {task.budget && (
              <div className="flex items-center gap-1 mb-3 text-body-sm">
                <span className="text-muted-foreground">Budget:</span>
                <span className="font-medium text-primary">
                  {formatCurrency(task.budget)}
                </span>
              </div>
            )}

            {/* Dates */}
            {(task.startDate || task.dueDate) && (
              <div className="flex items-center gap-2 mb-3 text-caption">
                {task.startDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Début: {formatDate(task.startDate)}</span>
                  </div>
                )}
                {task.dueDate && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>Échéance: {formatDate(task.dueDate)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Assigné à */}
            {task.assignedTo && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={task.assignedTo.avatar} />
                    <AvatarFallback className="text-xs">
                      {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-caption">{task.assignedTo.name}</span>
                </div>
                
                {/* Indicateurs de commentaires/pièces jointes */}
                <div className="flex items-center gap-1">
                  {task.commentsCount && task.commentsCount > 0 && (
                    <div className="flex items-center gap-1 text-caption text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      <span>{task.commentsCount}</span>
                    </div>
                  )}
                  {task.attachmentsCount && task.attachmentsCount > 0 && (
                    <div className="flex items-center gap-1 text-caption text-muted-foreground">
                      <Paperclip className="h-3 w-3" />
                      <span>{task.attachmentsCount}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Draggable>
    );
  };

  const ColumnHeader: React.FC<{ column: KanbanColumn }> = ({ column }) => {
    const Icon = column.icon;
    
    return (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            `bg-${column.color}-bg text-${column.color}`
          )}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-heading-3 font-semibold">
              {column.title}
            </h3>
            <p className="text-caption text-muted-foreground">
              {column.tasks.length} tâche{column.tasks.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        {onTaskCreate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTaskCreate(column.status)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="kanban-column animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <DragDropContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <motion.div
              key={column.id}
              layout
              className="kanban-column group"
            >
              <ColumnHeader column={column} />
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "min-h-[200px] transition-all duration-200",
                      snapshot.isDraggingOver && "drop-zone drag-over"
                    )}
                  >
                    <AnimatePresence mode="popLayout">
                      {column.tasks.map((task, index) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          index={index}
                        />
                      ))}
                    </AnimatePresence>
                    {provided.placeholder}
                    
                    {/* Zone de drop vide */}
                    {column.tasks.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                          "border-2 border-dashed rounded-lg p-8 text-center",
                          snapshot.isDraggingOver 
                            ? "border-primary bg-primary-subtle" 
                            : "border-border"
                        )}
                      >
                        <p className="text-body-sm text-muted-foreground">
                          {snapshot.isDraggingOver 
                            ? "Déposer la tâche ici" 
                            : "Aucune tâche"}
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}
              </Droppable>
            </motion.div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default ModernKanban;
