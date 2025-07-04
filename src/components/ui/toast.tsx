// src/components/ui/toast.tsx
import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, InfoIcon, AlertTriangle } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        success: 
          "group border-green-200 bg-green-50 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-50",
        error:
          "group border-red-200 bg-red-50 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-50",
        warning:
          "group border-yellow-200 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-50",
        info:
          "group border-blue-200 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastIcon = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ variant, ...props }, ref) => {
  const IconComponent = React.useMemo(() => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      case "info":
        return <InfoIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      default:
        return null
    }
  }, [variant])

  return IconComponent
})
ToastIcon.displayName = "ToastIcon"

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.error]:border-red-300 group-[.error]:hover:border-red-400 group-[.error]:hover:bg-red-100",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-neutral-500 opacity-0 transition-opacity hover:text-neutral-900 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

// Progress bar that shows the remaining time for the toast
const ToastProgressBar = ({ 
  visible = true, 
  className 
}: { 
  visible?: boolean, 
  className?: string
}) => {
  const [progress, setProgress] = React.useState(100)

  React.useEffect(() => {
    if (!visible) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval)
          return 0
        }
        return prev - 0.5
      })
    }, 10)

    return () => clearInterval(interval)
  }, [visible])

  if (!visible) return null

  return (
    <div className={cn("h-1 w-full bg-neutral-100 mt-2 rounded-full overflow-hidden", className)}>
      <div 
        className="h-full bg-neutral-400 transition-all duration-100 ease-linear rounded-full" 
        style={{ width: `${progress}%` }} 
      />
    </div>
  )
}

// Wrapper component with the progress bar
const ToastWithProgress = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants> & {
      showProgress?: boolean
    }
>(({ showProgress = true, children, ...props }, ref) => {
  return (
    <Toast {...props} ref={ref}>
      <div className="flex items-center gap-3">
        <ToastIcon variant={props.variant} />
        <div className="flex flex-col flex-grow">
          {children}
          {showProgress && <ToastProgressBar visible={true} />}
        </div>
      </div>
    </Toast>
  )
})
ToastWithProgress.displayName = "ToastWithProgress"

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastWithProgress,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastIcon,
  ToastProgressBar
}
