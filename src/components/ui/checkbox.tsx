import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

// Variants for the Checkbox using CVA
const checkboxVariants = cva(
  "peer shrink-0 rounded border ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-out",
  {
    variants: {
      variant: {
        default: "border-gray-30 focus-visible:ring-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-white hover:border-gray-40",
        success: "border-success focus-visible:ring-success data-[state=checked]:bg-success data-[state=checked]:border-success data-[state=checked]:text-white hover:border-success/70",
        warning: "border-warning focus-visible:ring-warning data-[state=checked]:bg-warning data-[state=checked]:border-warning data-[state=checked]:text-white hover:border-warning/70",
        error: "border-error focus-visible:ring-error data-[state=checked]:bg-error data-[state=checked]:border-error data-[state=checked]:text-white hover:border-error/70",
      },
      size: {
        sm: "h-4 w-4",
        default: "h-5 w-5", 
        lg: "h-6 w-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Icon variants for different sizes
const checkboxIconVariants = cva(
  "flex items-center justify-center text-current transition-all duration-150",
  {
    variants: {
      size: {
        sm: "h-3 w-3",
        default: "h-4 w-4",
        lg: "h-5 w-5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {
  indeterminate?: boolean
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, variant, size, indeterminate, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(checkboxVariants({ variant, size }), className)}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(checkboxIconVariants({ size }))}
    >
      {indeterminate ? (
        <Minus className="h-full w-full" />
      ) : (
        <Check className="h-full w-full animate-in zoom-in-50 duration-200" />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox, checkboxVariants }
export type { CheckboxProps }
