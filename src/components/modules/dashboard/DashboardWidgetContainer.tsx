// src/components/modules/dashboard/DashboardWidgetContainer.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GripVertical, 
  Maximize2, 
  Minimize2, 
  X, 
  Settings,
  MoreVertical,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface WidgetSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'stats' | 'chart' | 'activity' | 'ai-insights' | 'custom';
  size: WidgetSize;
  position: WidgetPosition;
  minimized?: boolean;
  hidden?: boolean;
  refreshable?: boolean;
  configurable?: boolean;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  gridSize?: 'sm' | 'md' | 'lg' | 'xl';
}

interface DashboardWidgetContainerProps {
  widget: DashboardWidget;
  onUpdateWidget: (widget: DashboardWidget) => void;
  onRemoveWidget: (widgetId: string) => void;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onResize?: (widget: DashboardWidget, newSize: WidgetSize) => void;
  onRefresh?: (widgetId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const DashboardWidgetContainer: React.FC<DashboardWidgetContainerProps> = ({
  widget,
  onUpdateWidget,
  onRemoveWidget,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onResize,
  onRefresh,
  className,
  style
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMinimize = () => {
    onUpdateWidget({
      ...widget,
      minimized: !widget.minimized
    });
  };

  const handleHide = () => {
    onUpdateWidget({
      ...widget,
      hidden: !widget.hidden
    });
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh(widget.id);
    }
  };

  const handleRemove = () => {
    onRemoveWidget(widget.id);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Empêcher la propagation vers le drag
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: widget.size.width,
      height: widget.size.height
    });
    // Ne pas appeler onDragStart lors du resize
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const newWidth = Math.max(
        widget.size.minWidth || 200,
        Math.min(
          widget.size.maxWidth || 800,
          resizeStart.width + deltaX
        )
      );
      
      const newHeight = Math.max(
        widget.size.minHeight || 150,
        Math.min(
          widget.size.maxHeight || 600,
          resizeStart.height + deltaY
        )
      );

      const newSize: WidgetSize = {
        ...widget.size,
        width: newWidth,
        height: newHeight
      };

      if (onResize) {
        onResize(widget, newSize);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      onDragEnd?.();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStart, widget, onResize, onDragStart, onDragEnd]);

  if (widget.hidden) {
    return null;
  }

  const WidgetComponent = widget.component;

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "absolute select-none group",
        isDragging && "z-50",
        isResizing && "z-40",
        className
      )}
      style={{
        left: widget.position.x,
        top: widget.position.y,
        width: widget.size.width,
        height: widget.minimized ? 'auto' : widget.size.height,
        ...style
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        opacity: { duration: 0.2 }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className={cn(
        "h-full relative overflow-hidden",
        "bg-gray-900/95 backdrop-blur-sm border-gray-800/50",
        "shadow-xl shadow-black/20",
        "transition-all duration-300 ease-out",
        isHovered && "shadow-2xl shadow-black/30 border-gray-700/50",
        isDragging && "shadow-2xl shadow-blue-500/20 border-blue-500/30",
        isResizing && "shadow-2xl shadow-purple-500/20 border-purple-500/30"
      )}>
        {/* Header avec contrôles */}
        <CardHeader className={cn(
          "p-3 bg-gray-850/80 border-b border-gray-800/50",
          "flex flex-row items-center justify-between space-y-0"
        )}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div 
              className={cn(
                "cursor-grab active:cursor-grabbing p-1 rounded opacity-0 transition-opacity",
                "hover:bg-gray-800/50 text-gray-400 hover:text-gray-200",
                (isHovered || isDragging) && "opacity-100"
              )}
              onMouseDown={onDragStart}
            >
              <GripVertical className="h-4 w-4" />
            </div>
            
            <h3 className="text-sm font-medium text-gray-100 truncate">
              {widget.title}
            </h3>
          </div>

          <div className={cn(
            "flex items-center gap-1 opacity-0 transition-opacity",
            (isHovered || isDragging) && "opacity-100"
          )}>
            {widget.refreshable && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-100 hover:bg-gray-800/50"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-100 hover:bg-gray-800/50"
              onClick={handleMinimize}
            >
              {widget.minimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-100 hover:bg-gray-800/50"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-gray-900 border-gray-800">
                {widget.configurable && (
                  <>
                    <DropdownMenuItem className="text-gray-200 focus:bg-gray-800">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurer
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-800" />
                  </>
                )}
                <DropdownMenuItem 
                  className="text-gray-200 focus:bg-gray-800"
                  onClick={handleHide}
                >
                  {widget.hidden ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                  {widget.hidden ? 'Afficher' : 'Masquer'}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem 
                  className="text-red-400 focus:bg-red-900/20 focus:text-red-300"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        {/* Contenu du widget */}
        <AnimatePresence mode="wait">
          {!widget.minimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="p-4 h-full overflow-auto">
                <WidgetComponent {...(widget.props || {})} />
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Poignée de redimensionnement */}
        <div
          className={cn(
            "absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 transition-opacity",
            "hover:opacity-100 group-hover:opacity-60",
            isResizing && "opacity-100"
          )}
          onMouseDown={handleResizeStart}
        >
          <div className="w-full h-full bg-gradient-to-br from-transparent via-gray-600 to-gray-500 rounded-tl" />
        </div>
      </Card>
    </motion.div>
  );
};

export default DashboardWidgetContainer;
