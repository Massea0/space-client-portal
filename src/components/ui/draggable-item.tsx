// src/components/ui/draggable-item.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { UniqueIdentifier } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";

interface DraggableItemProps {
  id: UniqueIdentifier;
  disabled?: boolean;
  handle?: boolean;
  isActive?: boolean;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function DraggableItem({
  id,
  disabled = false,
  handle = false,
  isActive = false,
  className,
  children,
  ...props
}: DraggableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 150ms ease',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "draggable-item relative rounded-md border bg-card p-4",
        "transition-all duration-150 focus:outline-none hover:shadow-sm",
        isDragging && "z-10 shadow-lg scale-105 rotate-1 opacity-90",
        isActive && "ring-2 ring-primary shadow-md",
        disabled && "cursor-not-allowed opacity-50",
        !disabled && !handle && "cursor-grab active:cursor-grabbing hover:bg-card/80",
        className
      )}
      {...attributes}
      {...(handle ? {} : listeners)}
      {...props}
    >
      <div className="flex items-center gap-2">
        {handle && !disabled && (
          <div
            className="drag-handle flex h-8 w-8 cursor-grab items-center justify-center rounded hover:bg-muted/70 active:cursor-grabbing transition-colors"
            {...listeners}
            title="Glisser pour réorganiser"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </div>
        )}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

export default DraggableItem;
