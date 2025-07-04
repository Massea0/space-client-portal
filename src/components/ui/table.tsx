import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react"

// Types pour le système de table
interface Column<T> {
  id: string
  header: string
  accessorKey?: keyof T
  accessor?: (row: T) => React.ReactNode
  sortable?: boolean
  width?: string
  align?: "left" | "center" | "right"
  fixed?: boolean
}

interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (row: T) => void
  loading?: boolean
  emptyMessage?: string
  className?: string
  striped?: boolean
  hoverable?: boolean
  variant?: "default" | "compact" | "dense"
  sortable?: boolean
  onSort?: (columnId: string, direction: "asc" | "desc") => void
  sortColumn?: string
  sortDirection?: "asc" | "desc"
}

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    hoverable?: boolean
    clickable?: boolean
  }
>(({ className, hoverable = false, clickable = false, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors",
      hoverable && "hover:bg-muted/50",
      clickable && "cursor-pointer",
      "data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & {
    sortable?: boolean
    onSort?: () => void
    sortDirection?: "asc" | "desc" | null
    variant?: "default" | "compact" | "dense"
  }
>(({ className, sortable = false, onSort, sortDirection, variant = "default", children, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      // Hauteurs adaptées selon le variant
      variant === "default" && "h-12 px-4",
      variant === "compact" && "h-9 px-3",
      variant === "dense" && "h-7 px-2",
      "text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      sortable && "cursor-pointer select-none hover:bg-muted/50",
      className
    )}
    onClick={sortable ? onSort : undefined}
    {...props}
  >
    <div className="flex items-center space-x-2">
      <span className={cn(
        variant === "dense" && "text-xs",
        variant === "compact" && "text-sm"
      )}>{children}</span>
      {sortable && (
        <div className={cn(
          variant === "dense" ? "ml-1 h-3 w-3" : "ml-2 h-4 w-4"
        )}>
          {sortDirection === "asc" ? (
            <ChevronUp className={cn(variant === "dense" ? "h-3 w-3" : "h-4 w-4")} />
          ) : sortDirection === "desc" ? (
            <ChevronDown className={cn(variant === "dense" ? "h-3 w-3" : "h-4 w-4")} />
          ) : (
            <ArrowUpDown className={cn(
              variant === "dense" ? "h-3 w-3" : "h-4 w-4",
              "opacity-50"
            )} />
          )}
        </div>
      )}
    </div>
  </th>
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    align?: "left" | "center" | "right"
    variant?: "default" | "compact" | "dense"
  }
>(({ className, align = "left", variant = "default", ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      // Padding adapté selon le variant
      variant === "default" && "p-4",
      variant === "compact" && "px-3 py-2",
      variant === "dense" && "px-2 py-1",
      "align-middle [&:has([role=checkbox])]:pr-0",
      align === "center" && "text-center",
      align === "right" && "text-right",
      variant === "dense" && "text-xs",
      variant === "compact" && "text-sm",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

// Composant DataTable Twenty-style
const DataTable = <T,>({
  data,
  columns,
  onRowClick,
  loading = false,
  emptyMessage = "Aucune donnée disponible",
  className,
  striped = false,
  hoverable = true,
  variant = "default",
  sortable = false,
  onSort,
  sortColumn,
  sortDirection
}: TableProps<T>) => {
  const [localSortColumn, setLocalSortColumn] = React.useState<string>("")
  const [localSortDirection, setLocalSortDirection] = React.useState<"asc" | "desc">("asc")

  const handleSort = (columnId: string) => {
    if (!sortable) return

    let newDirection: "asc" | "desc" = "asc"
    if (localSortColumn === columnId && localSortDirection === "asc") {
      newDirection = "desc"
    }

    setLocalSortColumn(columnId)
    setLocalSortDirection(newDirection)
    onSort?.(columnId, newDirection)
  }

  const getCurrentSortDirection = (columnId: string) => {
    const currentColumn = sortColumn || localSortColumn
    const currentDirection = sortDirection || localSortDirection
    return currentColumn === columnId ? currentDirection : null
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted/50 animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.id}
                sortable={column.sortable && sortable}
                onSort={() => handleSort(column.id)}
                sortDirection={getCurrentSortDirection(column.id)}
                variant={variant}
                style={{ width: column.width }}
                className={cn(
                  column.align === "center" && "text-center",
                  column.align === "right" && "text-right",
                  column.fixed && "sticky left-0 bg-background"
                )}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <p className="text-muted-foreground">{emptyMessage}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow
                key={index}
                hoverable={hoverable}
                clickable={!!onRowClick}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  striped && index % 2 === 0 && "bg-muted/30",
                  variant === "compact" && "h-9",
                  variant === "dense" && "h-7"
                )}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    variant={variant}
                    style={{ width: column.width }}
                    className={cn(
                      column.fixed && "sticky left-0 bg-background"
                    )}
                  >
                    {column.accessor
                      ? column.accessor(row)
                      : column.accessorKey
                      ? String(row[column.accessorKey])
                      : null}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  DataTable,
  type Column,
  type TableProps
}
