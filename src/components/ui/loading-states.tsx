// src/components/ui/loading-states.tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Spinner Component
export const spinnerVariants = cva(
  "animate-spin rounded-full border-current border-t-transparent",
  {
    variants: {
      size: {
        xs: "h-3 w-3 border-[2px]",
        sm: "h-4 w-4 border-[2px]",
        md: "h-6 w-6 border-[2px]",
        lg: "h-8 w-8 border-[3px]",
        xl: "h-12 w-12 border-[4px]"
      },
      variant: {
        default: "text-primary",
        muted: "text-muted-foreground",
        success: "text-green-600",
        warning: "text-yellow-600",
        error: "text-red-600",
        info: "text-blue-600"
      }
    },
    defaultVariants: {
      size: "md",
      variant: "default"
    }
  }
)

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, ...props }, ref) => (
    <div
      className={cn(spinnerVariants({ size, variant }), className)}
      ref={ref}
      {...props}
      role="status"
      aria-label="Loading"
    />
  )
)
Spinner.displayName = "Spinner"

// Progress Bar Component
export const progressVariants = cva(
  "h-1 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700",
  {
    variants: {
      variant: {
        default: "",
        success: "",
        warning: "",
        error: "",
        info: ""
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

const progressBarVariants = cva(
  "h-full transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary",
        muted: "bg-muted-foreground",
        success: "bg-green-600",
        warning: "bg-yellow-600",
        error: "bg-red-600",
        info: "bg-blue-600"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value: number
  max?: number
  indeterminate?: boolean
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, indeterminate = false, variant, ...props }, ref) => {
    const percentage = Math.min(Math.max(0, value), max) / max * 100
    
    return (
      <div
        className={cn(progressVariants({ variant }), className)}
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : value}
        {...props}
      >
        <div
          className={cn(
            progressBarVariants({ variant }),
            indeterminate && "animate-indeterminate-progress"
          )}
          style={{ width: indeterminate ? "50%" : `${percentage}%` }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

// Skeleton Component
export const skeletonVariants = cva(
  "animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800",
  {
    variants: {
      variant: {
        default: "",
        card: "h-48",
        avatar: "h-12 w-12 rounded-full",
        title: "h-6 w-3/4",
        heading: "h-4 w-1/2",
        text: "h-3",
        button: "h-9 w-20 rounded-md"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      className={cn(skeletonVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  )
)
Skeleton.displayName = "Skeleton"

// Table Skeleton
export interface TableSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number
  columns?: number
  showHeader?: boolean
}

export const TableSkeleton = React.forwardRef<HTMLDivElement, TableSkeletonProps>(
  ({ rows = 5, columns = 4, showHeader = true, className, ...props }, ref) => (
    <div className={cn("w-full", className)} ref={ref} {...props}>
      {showHeader && (
        <div className="flex w-full border-b pb-2 mb-2">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={`header-${i}`} className="flex-1 pr-4">
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
          <div className="w-10"></div>
        </div>
      )}
      
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex items-center py-3 border-b last:border-0">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={`cell-${rowIndex}-${colIndex}`} className="flex-1 pr-4">
              <Skeleton className="h-4 w-full max-w-[120px]" />
            </div>
          ))}
          <div className="w-10 flex justify-end">
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
)
TableSkeleton.displayName = "TableSkeleton"

// Card Skeleton
export interface CardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  hasImage?: boolean
  hasAction?: boolean
}

export const CardSkeleton = React.forwardRef<HTMLDivElement, CardSkeletonProps>(
  ({ hasImage = true, hasAction = true, className, ...props }, ref) => (
    <div 
      className={cn(
        "rounded-lg border bg-card p-4 shadow-sm flex flex-col", 
        className
      )}
      ref={ref}
      {...props}
    >
      {hasImage && (
        <div className="mb-4 w-full">
          <Skeleton className="h-40 w-full rounded-md" />
        </div>
      )}
      
      <Skeleton variant="title" className="mb-2" />
      <div className="space-y-2 mb-4">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
      
      {hasAction && (
        <div className="mt-auto pt-2 flex items-center gap-2">
          <Skeleton variant="button" className="w-20" />
          <Skeleton variant="button" className="w-20" />
        </div>
      )}
    </div>
  )
)
CardSkeleton.displayName = "CardSkeleton"

// Data View Skeleton
export interface DataViewSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "table" | "grid" | "kanban"
  itemCount?: number
}

export const DataViewSkeleton = React.forwardRef<HTMLDivElement, DataViewSkeletonProps>(
  ({ variant = "table", itemCount = 5, className, ...props }, ref) => {
    return (
      <div className={cn("w-full", className)} ref={ref} {...props}>
        {/* Header with filters, search and view toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-32 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-64 rounded-md" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          </div>
        </div>
        
        {variant === "table" ? (
          <TableSkeleton rows={itemCount} columns={4} />
        ) : variant === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: itemCount }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          // Kanban layout
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Array.from({ length: 4 }).map((_, colIndex) => (
              <div 
                key={`column-${colIndex}`} 
                className="w-72 flex-shrink-0 bg-neutral-50 dark:bg-neutral-900 rounded-md p-3"
              >
                <div className="flex justify-between items-center mb-3">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
                
                <div className="space-y-3">
                  {Array.from({ length: Math.ceil(Math.random() * 4) + 1 }).map((_, cardIndex) => (
                    <div 
                      key={`card-${colIndex}-${cardIndex}`} 
                      className="bg-white dark:bg-neutral-800 rounded-md p-3 shadow-sm"
                    >
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-full mb-1" />
                      <Skeleton className="h-3 w-1/2 mb-3" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 w-10 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)
DataViewSkeleton.displayName = "DataViewSkeleton"

// Empty State Component
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className, ...props }, ref) => (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-lg border border-dashed",
        className
      )}
      ref={ref}
      {...props}
    >
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  )
)
EmptyState.displayName = "EmptyState"

// Shimmer Effect Component
export interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number | string
  height?: number | string
}

export const Shimmer = React.forwardRef<HTMLDivElement, ShimmerProps>(
  ({ width = "100%", height = "1rem", className, ...props }, ref) => (
    <div
      className={cn("relative overflow-hidden rounded-md bg-neutral-200 dark:bg-neutral-800", className)}
      ref={ref}
      style={{ width, height }}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-neutral-100/50 dark:via-neutral-700/50 to-transparent" />
    </div>
  )
)
Shimmer.displayName = "Shimmer"

// CircularProgress Component
export interface CircularProgressProps extends React.SVGAttributes<SVGElement> {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  variant?: "default" | "muted" | "success" | "warning" | "error" | "info"
  showValue?: boolean
}

const circularVariants = {
  default: "stroke-primary",
  muted: "stroke-muted-foreground",
  success: "stroke-green-600",
  warning: "stroke-yellow-600",
  error: "stroke-red-600",
  info: "stroke-blue-600"
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 40,
  strokeWidth = 4,
  variant = "default",
  showValue = true,
  className,
  ...props
}) => {
  const percentage = Math.min(Math.max(0, value), max) / max
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - percentage * circumference
  
  return (
    <div className={cn("relative inline-flex", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-neutral-200 dark:stroke-neutral-800"
          fill="none"
        />
        
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className={cn("rotate-[-90deg] origin-center transition-all", circularVariants[variant])}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
          {Math.round(percentage * 100)}%
        </div>
      )}
    </div>
  )
}
CircularProgress.displayName = "CircularProgress"

// Components are exported individually above
