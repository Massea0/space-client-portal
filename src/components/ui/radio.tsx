import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { cva, type VariantProps } from "class-variance-authority"
import { Circle } from "lucide-react"
import { cn } from "@/lib/utils"

// Variants for the RadioGroup using CVA
const radioGroupVariants = cva(
  "grid gap-2",
  {
    variants: {
      orientation: {
        vertical: "grid-cols-1",
        horizontal: "grid-flow-col auto-cols-max gap-6",
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  }
)

// Variants for individual Radio items
const radioItemVariants = cva(
  "aspect-square h-4 w-4 rounded-full border text-primary ring-offset-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-out",
  {
    variants: {
      variant: {
        default: "border-gray-30 focus-visible:ring-primary data-[state=checked]:border-primary hover:border-gray-40",
        success: "border-success focus-visible:ring-success data-[state=checked]:border-success hover:border-success/70",
        warning: "border-warning focus-visible:ring-warning data-[state=checked]:border-warning hover:border-warning/70", 
        error: "border-error focus-visible:ring-error data-[state=checked]:border-error hover:border-error/70",
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
const radioIndicatorVariants = cva(
  "flex items-center justify-center transition-all duration-150",
  {
    variants: {
      size: {
        sm: "h-2 w-2",
        default: "h-2.5 w-2.5",
        lg: "h-3 w-3",
      },
      variant: {
        default: "text-primary",
        success: "text-success",
        warning: "text-warning",
        error: "text-error",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

interface RadioGroupProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
    VariantProps<typeof radioGroupVariants> {}

interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
    VariantProps<typeof radioItemVariants> {}

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, orientation, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    className={cn(radioGroupVariants({ orientation }), className)}
    {...props}
    ref={ref}
  />
))
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, variant, size, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(radioItemVariants({ variant, size }), className)}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
      <Circle className={cn(
        radioIndicatorVariants({ size, variant }),
        "fill-current animate-in zoom-in-50 duration-200"
      )} />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
))
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem, radioGroupVariants, radioItemVariants }
export type { RadioGroupProps, RadioGroupItemProps }
