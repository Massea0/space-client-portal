import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { ensureSingleElement } from "@/lib/react-children-utils.tsx"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-normal ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md active:scale-[0.98]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md active:scale-[0.98]",
        outline: "border border-neutral-20 bg-background text-foreground hover:bg-neutral-5 hover:border-neutral-25 shadow-xs hover:shadow-sm active:scale-[0.98]",
        secondary: "bg-neutral-10 text-foreground hover:bg-neutral-15 shadow-xs hover:shadow-sm active:scale-[0.98]",
        ghost: "text-foreground hover:bg-neutral-10 hover:text-foreground active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto font-normal",
        success: "bg-arcadis-green text-white hover:bg-arcadis-green/90 shadow-sm hover:shadow-md active:scale-[0.98]",
        warning: "bg-arcadis-orange text-white hover:bg-arcadis-orange/90 shadow-sm hover:shadow-md active:scale-[0.98]",
      },
      size: {
        xs: "h-8 px-3 text-xs rounded-md",
        sm: "h-9 px-4 text-sm rounded-lg",
        default: "h-10 px-5 py-2.5",
        lg: "h-11 px-6 text-base rounded-lg",
        xl: "h-12 px-8 text-lg rounded-xl",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const safeChildren = asChild ? ensureSingleElement(children) : children
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {safeChildren}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
