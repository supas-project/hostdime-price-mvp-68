
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base styles com tokens HostDime e acessibilidade WCAG AA
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold " +
  "ring-offset-background transition-all duration-200 focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 " +
  // Touch targets WCAG AA (44px mínimo)
  "min-h-touch-md min-w-touch-md " +
  // Micro-interações suaves
  "hover:shadow-md active:scale-[0.98] active:duration-75",
  {
    variants: {
      variant: {
        default: 
          "bg-primary-500 text-white shadow-sm " +
          "hover:bg-primary-600 hover:shadow-primary " +
          "focus-visible:bg-primary-600 " +
          "active:bg-primary-700",
        destructive:
          "bg-semantic-error-DEFAULT text-white shadow-sm " +
          "hover:bg-semantic-error-dark hover:shadow-md " +
          "focus-visible:bg-semantic-error-dark " +
          "active:bg-semantic-error-dark",
        outline:
          "border-2 border-primary-500 bg-transparent text-primary-500 " +
          "hover:bg-primary-50 hover:text-primary-600 " +
          "focus-visible:bg-primary-50 focus-visible:text-primary-600 " +
          "active:bg-primary-100",
        secondary:
          "bg-neutral-100 text-neutral-900 shadow-sm " +
          "hover:bg-neutral-200 hover:shadow-md " +
          "focus-visible:bg-neutral-200 " +
          "active:bg-neutral-300",
        ghost: 
          "text-primary-500 " +
          "hover:bg-primary-50 hover:text-primary-600 " +
          "focus-visible:bg-primary-50 focus-visible:text-primary-600 " +
          "active:bg-primary-100",
        link: 
          "text-primary-500 underline-offset-4 " +
          "hover:underline hover:text-primary-600 " +
          "focus-visible:underline focus-visible:text-primary-600",
      },
      size: {
        sm: "h-9 px-3 text-xs min-w-[36px]",
        default: "h-11 px-4 py-2",
        lg: "h-12 px-6 py-3 text-base",
        xl: "h-14 px-8 py-4 text-lg",
        icon: "h-11 w-11 p-0",
        "icon-sm": "h-9 w-9 p-0",
        "icon-lg": "h-12 w-12 p-0",
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
