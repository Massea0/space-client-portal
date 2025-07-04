import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from './card';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import { DataTable, Column } from './table';
import { KanbanBoard, KanbanBoard as KanbanBoardType, KanbanColumn, KanbanCard } from './kanban';
import { 
  Table, 
  List, 
  LayoutGrid, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  MoreHorizontal,
  Plus,
  Download,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';

// Types pour le DataView
export type ViewType = 'table' | 'kanban' | 'list' | 'grid';

export interface DataViewColumn<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  fixed?: boolean;
  visible?: boolean;
  filterable?: boolean;
  searchable?: boolean;
}

export interface DataViewFilter {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'boolean';
  options?: { label: string; value: string }[];
  value?: any;
}

export interface DataViewSort {
  column: string;
  direction: 'asc' | 'desc';
}

export interface DataViewState {
  view: ViewType;
  search: string;
  filters: Record<string, any>;
  sort?: DataViewSort;
  pageSize: number;
  selectedIds: string[];
}

export interface DataViewProps<T> {
  data: T[];
  columns: DataViewColumn<T>[];
  defaultView?: ViewType;
  availableViews?: ViewType[];
  enableSearch?: boolean;
  enableFilters?: boolean;
  enableSort?: boolean;
  enableBulkActions?: boolean;
  filters?: DataViewFilter[];
  bulkActions?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    action: (selectedIds: string[]) => void;
  }>;
  onRowClick?: (item: T) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  className?: string;
  
  // Kanban specific props
  kanbanConfig?: {
    statusField: keyof T;
    columns: KanbanColumn[];
    onCardMove?: (cardId: string, newStatus: string) => void;
  };
  
  // Custom renderers
  renderCard?: (item: T) => React.ReactNode;
  renderListItem?: (item: T) => React.ReactNode;
  
  // Loading and empty states
  loading?: boolean;
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    action: () => void;
  };
}

// Toolbar component
const DataViewToolbar = <T,>({
  state,
  onStateChange,
  availableViews = ['table', 'kanban', 'list'],
  enableSearch = true,
  enableFilters = true,
  filters = [],
  bulkActions = [],
  selectedCount = 0,
  className
}: {
  state: DataViewState;
  onStateChange: (newState: Partial<DataViewState>) => void;
  availableViews?: ViewType[];
  enableSearch?: boolean;
  enableFilters?: boolean;
  filters?: DataViewFilter[];
  bulkActions?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    action: (selectedIds: string[]) => void;
  }>;
  selectedCount?: number;
  className?: string;
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const viewIcons = {
    table: Table,
    kanban: LayoutGrid,
    list: List,
    grid: LayoutGrid
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Primary Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            {availableViews.map((view) => {
              const Icon = viewIcons[view];
              return (
                <Button
                  key={view}
                  variant={state.view === view ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onStateChange({ view })}
                  className="h-8 px-3"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>

          {/* Search */}
          {enableSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={state.search}
                onChange={(e) => onStateChange({ search: e.target.value })}
                className="pl-9 w-80"
              />
            </div>
          )}

          {/* Filters Toggle */}
          {enableFilters && filters.length > 0 && (
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
              {Object.keys(state.filters).length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5">
                  {Object.keys(state.filters).length}
                </Badge>
              )}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Bulk Actions */}
          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
              </span>
              {bulkActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={() => action.action(state.selectedIds)}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Actions */}
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Colonnes
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && filters.length > 0 && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filters.map((filter) => (
              <div key={filter.id} className="space-y-2">
                <label className="text-sm font-medium">{filter.label}</label>
                {filter.type === 'text' && (
                  <Input
                    placeholder={`Filtrer par ${filter.label.toLowerCase()}`}
                    value={state.filters[filter.id] || ''}
                    onChange={(e) => onStateChange({
                      filters: { ...state.filters, [filter.id]: e.target.value }
                    })}
                  />
                )}
                {filter.type === 'select' && filter.options && (
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={state.filters[filter.id] || ''}
                    onChange={(e) => onStateChange({
                      filters: { ...state.filters, [filter.id]: e.target.value }
                    })}
                  >
                    <option value="">Tous</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// Main DataView Component
export const DataView = <T extends { id: string }>({
  data,
  columns,
  defaultView = 'table',
  availableViews = ['table', 'kanban', 'list'],
  enableSearch = true,
  enableFilters = true,
  enableSort = true,
  enableBulkActions = false,
  filters = [],
  bulkActions = [],
  onRowClick,
  onSelectionChange,
  className,
  kanbanConfig,
  renderCard,
  renderListItem,
  loading = false,
  emptyMessage = "Aucune donnée disponible",
  emptyAction
}: DataViewProps<T>) => {
  // State management
  const [state, setState] = useState<DataViewState>({
    view: defaultView,
    search: '',
    filters: {},
    pageSize: 50,
    selectedIds: []
  });

  const updateState = useCallback((newState: Partial<DataViewState>) => {
    setState(prev => ({ ...prev, ...newState }));
  }, []);

  // Data filtering and processing
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (state.search.trim()) {
      const searchLower = state.search.toLowerCase();
      filtered = filtered.filter(item => {
        return columns.some(column => {
          if (!column.searchable) return false;
          const value = column.accessorKey ? 
            String(item[column.accessorKey]) : 
            column.accessor ? String(column.accessor(item)) : '';
          return value.toLowerCase().includes(searchLower);
        });
      });
    }

    // Apply filters
    Object.entries(state.filters).forEach(([filterId, filterValue]) => {
      if (!filterValue) return;
      
      const filter = filters.find(f => f.id === filterId);
      if (!filter) return;

      filtered = filtered.filter(item => {
        const itemValue = String((item as any)[filterId] || '');
        return itemValue.toLowerCase().includes(String(filterValue).toLowerCase());
      });
    });

    // Apply sorting
    if (state.sort) {
      const { column: sortColumn, direction } = state.sort;
      filtered.sort((a, b) => {
        const aValue = String((a as any)[sortColumn] || '');
        const bValue = String((b as any)[sortColumn] || '');
        const comparison = aValue.localeCompare(bValue);
        return direction === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, columns, state.search, state.filters, state.sort, filters]);

  // Selection handling
  const handleSelectionChange = useCallback((selectedIds: string[]) => {
    setState(prev => ({ ...prev, selectedIds }));
    onSelectionChange?.(selectedIds);
  }, [onSelectionChange]);

  // Convert data to Kanban format if needed
  const kanbanData = useMemo(() => {
    if (state.view !== 'kanban' || !kanbanConfig) return null;

    const board: KanbanBoardType = {
      id: 'dataview-kanban',
      title: 'Vue Kanban',
      columns: kanbanConfig.columns.map(column => ({
        ...column,
        cards: processedData
          .filter(item => (item as any)[kanbanConfig.statusField] === column.id)
          .map(item => ({
            id: item.id,
            title: String((item as any).title || (item as any).name || item.id),
            description: String((item as any).description || ''),
            status: String((item as any)[kanbanConfig.statusField]),
            // Map additional fields as needed
          } as KanbanCard))
      }))
    };

    return board;
  }, [state.view, kanbanConfig, processedData]);

  // Loading state
  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="h-12 bg-muted animate-pulse rounded" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted/50 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (processedData.length === 0 && !loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <DataViewToolbar
          state={state}
          onStateChange={updateState}
          availableViews={availableViews}
          enableSearch={enableSearch}
          enableFilters={enableFilters}
          filters={filters}
          bulkActions={bulkActions}
          selectedCount={state.selectedIds.length}
        />
        
        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="text-muted-foreground text-lg">{emptyMessage}</div>
            {emptyAction && (
              <Button onClick={emptyAction.action} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                {emptyAction.label}
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <DataViewToolbar
        state={state}
        onStateChange={updateState}
        availableViews={availableViews}
        enableSearch={enableSearch}
        enableFilters={enableFilters}
        filters={filters}
        bulkActions={bulkActions}
        selectedCount={state.selectedIds.length}
      />

      {/* View Content */}
      <div className="min-h-0">
        {state.view === 'table' && (
          <DataTable
            data={processedData}
            columns={columns.filter(col => col.visible !== false)}
            variant="default"
            sortable={enableSort}
            hoverable
            onRowClick={onRowClick}
            onSort={(columnId, direction) => {
              updateState({ sort: { column: columnId, direction } });
            }}
            sortColumn={state.sort?.column}
            sortDirection={state.sort?.direction}
          />
        )}

        {state.view === 'kanban' && kanbanData && (
          <KanbanBoard
            board={kanbanData}
            onBoardChange={(newBoard) => {
              // Handle kanban changes
              console.log('Kanban updated:', newBoard);
            }}
          />
        )}

        {state.view === 'list' && (
          <div className="space-y-2">
            {processedData.map((item) => (
              <Card 
                key={item.id} 
                className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onRowClick?.(item)}
              >
                {renderListItem ? renderListItem(item) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {String((item as any).title || (item as any).name || item.id)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {String((item as any).description || '')}
                      </div>
                    </div>
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {state.view === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {processedData.map((item) => (
              <Card 
                key={item.id} 
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onRowClick?.(item)}
              >
                {renderCard ? renderCard(item) : (
                  <div className="space-y-2">
                    <div className="font-medium">
                      {String((item as any).title || (item as any).name || item.id)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {String((item as any).description || '')}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Export types and components
export default DataView;
export { DataViewToolbar };
