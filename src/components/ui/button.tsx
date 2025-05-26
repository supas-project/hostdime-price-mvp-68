
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97] hover:shadow-lg",
  {
    variants: {
      variant: {
        default: "bg-[#f58220] text-white hover:bg-[#e55a00] hover:shadow-[#f58220]/30 active:bg-[#cc5200] shadow-md",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-destructive/30",
        outline:
          "border-2 border-[#f58220] bg-transparent text-[#f58220] hover:bg-[#f58220] hover:text-white hover:shadow-[#f58220]/30",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md hover:shadow-secondary/20",
        ghost: "hover:bg-[#f58220]/10 hover:text-[#f58220] transition-all duration-200",
        link: "text-[#f58220] underline-offset-4 hover:underline hover:text-[#e55a00]",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-md px-4 py-2",
        lg: "h-12 rounded-lg px-8 py-3 text-base",
        icon: "h-11 w-11",
        touch: "h-12 sm:h-11 px-6 py-3 text-base sm:text-sm min-w-[44px]",
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
