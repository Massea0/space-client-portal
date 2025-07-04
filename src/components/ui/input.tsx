// src/components/ui/input.tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-lg border bg-background text-foreground transition-all duration-normal ease-smooth file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-5",
  {
    variants: {
      variant: {
        default: "border-neutral-20 hover:border-neutral-25 focus-visible:hover:border-primary",
        error: "border-arcadis-red focus-visible:ring-arcadis-red/20 focus-visible:border-arcadis-red",
        success: "border-arcadis-green focus-visible:ring-arcadis-green/20 focus-visible:border-arcadis-green",
      },
      inputSize: {
        sm: "h-9 px-3 py-2 text-sm",
        default: "h-10 px-3 py-2.5 text-sm",
        lg: "h-11 px-4 py-3 text-base",
      }
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  size?: number // Garde la propriété size native d'HTML
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, inputSize, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }