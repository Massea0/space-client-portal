// src/hooks/use-toast.tsx
import * as React from "react"
import { useEffect, useState } from "react"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
  ToastViewport,
  ToastWithProgress,
  type ToastProps,
  ToastProvider as ToastPrimitiveProvider
} from "@/components/ui/toast"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  showProgress?: boolean
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ToastActionType = Omit<ToasterToast, "id">

type ToastContextType = {
  toasts: ToasterToast[]
  toast: (props: ToastActionType) => string
  dismiss: (toastId?: string) => void
  success: (props: Omit<ToastActionType, "variant">) => string
  error: (props: Omit<ToastActionType, "variant">) => string
  warning: (props: Omit<ToastActionType, "variant">) => string
  info: (props: Omit<ToastActionType, "variant">) => string
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToasterToast[]>([])

  const toast = React.useCallback(
    ({ ...props }: ToastActionType) => {
      const id = genId()

      setToasts((prev) => {
        // If we're at the limit, remove the oldest toast
        if (prev.length >= TOAST_LIMIT) {
          prev.shift()
        }
        
        return [...prev, { id, ...props }]
      })

      return id
    },
    [setToasts]
  )

  const dismiss = React.useCallback((toastId?: string) => {
    setToasts((prev) => 
      toastId 
        ? prev.filter((t) => t.id !== toastId) 
        : []
    )
  }, [setToasts])

  // Helper methods for different toast types
  const success = React.useCallback((props: Omit<ToastActionType, "variant">) => {
    return toast({ ...props, variant: "success" })
  }, [toast])

  const error = React.useCallback((props: Omit<ToastActionType, "variant">) => {
    return toast({ ...props, variant: "error" })
  }, [toast])

  const warning = React.useCallback((props: Omit<ToastActionType, "variant">) => {
    return toast({ ...props, variant: "warning" })
  }, [toast])

  const info = React.useCallback((props: Omit<ToastActionType, "variant">) => {
    return toast({ ...props, variant: "info" })
  }, [toast])

  // Auto dismiss toasts after delay
  useEffect(() => {
    const interval = setInterval(() => {
      setToasts((toasts) => 
        toasts.map((toast) => ({ ...toast }))
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Auto-dismiss toasts after delay
  useEffect(() => {
    if (toasts.length > 0) {
      const timeoutId = setTimeout(() => {
        setToasts((prev) => {
          if (prev.length === 0) return prev
          return prev.slice(1)
        })
      }, TOAST_REMOVE_DELAY)
      
      return () => clearTimeout(timeoutId)
    }
  }, [toasts])

  const contextValue = React.useMemo(() => ({
    toasts,
    toast,
    dismiss,
    success,
    error,
    warning,
    info
  }), [toasts, toast, dismiss, success, error, warning, info])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  
  return context
}

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <ToastPrimitiveProvider>
      {toasts.map(function ({ id, title, description, action, variant, showProgress = true, ...props }) {
        return (
          <ToastWithProgress
            key={id}
            variant={variant}
            showProgress={showProgress}
            {...props}
          >
            <div className="flex flex-col gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose onClick={() => dismiss(id)} />
          </ToastWithProgress>
        )
      })}
      <ToastViewport />
    </ToastPrimitiveProvider>
  )
}
