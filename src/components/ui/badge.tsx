import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-normal ease-smooth focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        secondary: "bg-neutral-10 text-neutral-80 hover:bg-neutral-15 border border-neutral-20",
        destructive: "bg-arcadis-red text-white hover:bg-arcadis-red/90 shadow-sm",
        outline: "border border-neutral-20 text-foreground hover:bg-neutral-5",
        success: "bg-arcadis-green-subtle text-arcadis-green border border-arcadis-green/20",
        warning: "bg-arcadis-orange-subtle text-arcadis-orange border border-arcadis-orange/20",
        info: "bg-arcadis-blue-subtle text-arcadis-blue border border-arcadis-blue/20",
        neutral: "bg-neutral-10 text-neutral-70 border border-neutral-20",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
