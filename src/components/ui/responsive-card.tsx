/**
 * Card responsivo com micro-interações e acessibilidade
 * Mobile-first design com breakpoints semânticos
 */

import { forwardRef, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { MotionWrapper } from './motion-wrapper';
import { cn } from '@/lib/utils';

const responsiveCardVariants = cva(
  // Base styles mobile-first
  "relative rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 " +
  // Mobile spacing (base)
  "p-4 " +
  // Tablet spacing (md)
  "md:p-6 " +
  // Desktop spacing (lg)
  "lg:p-8 " +
  // Acessibilidade
  "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-border",
        elevated: "border-border shadow-md hover:shadow-lg",
        interactive: 
          "border-border cursor-pointer " +
          "hover:border-primary/50 hover:shadow-md hover:shadow-primary/10 " +
          "active:scale-[0.99] active:duration-75",
        highlighted: 
          "border-primary/30 bg-primary/5 " +
          "hover:border-primary/50 hover:bg-primary/10",
        success: "border-green-200 bg-green-50 text-green-900",
        warning: "border-yellow-200 bg-yellow-50 text-yellow-900",
        error: "border-red-200 bg-red-50 text-red-900",
      },
      spacing: {
        none: "p-0",
        sm: "p-3 md:p-4 lg:p-5",
        default: "p-4 md:p-6 lg:p-8",
        lg: "p-6 md:p-8 lg:p-10",
        xl: "p-8 md:p-10 lg:p-12",
      },
      size: {
        sm: "max-w-sm",
        default: "max-w-none",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        full: "w-full",
      }
    },
    defaultVariants: {
      variant: "default",
      spacing: "default",
      size: "default",
    },
  }
);

export interface ResponsiveCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 
    'onAnimationStart' | 'onAnimationEnd' | 'onDragStart' | 'onDragEnd' | 
    'onDrag' | 'onDragEnter' | 'onDragExit' | 'onDragLeave' | 'onDragOver' | 'onDrop'>,
    VariantProps<typeof responsiveCardVariants> {
  asChild?: boolean;
  // Acessibilidade
  'aria-label'?: string;
  'aria-describedby'?: string;
  role?: string;
}

export const ResponsiveCard = forwardRef<HTMLDivElement, ResponsiveCardProps>(
  ({ 
    className, 
    variant, 
    spacing, 
    size, 
    children,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedby,
    role,
    ...props 
  }, ref) => {
    return (
      <MotionWrapper
        variant={variant === 'interactive' ? 'scale' : 'fade'}
        motionTransition="smooth"
        className={cn(responsiveCardVariants({ variant, spacing, size }), className)}
        ref={ref}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        role={role || (variant === 'interactive' ? 'button' : undefined)}
        tabIndex={variant === 'interactive' ? 0 : undefined}
        {...props}
      >
        {children}
      </MotionWrapper>
    );
  }
);

ResponsiveCard.displayName = "ResponsiveCard";

// Subcomponentes do card
export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Mobile-first spacing
        "flex flex-col space-y-2 " +
        "sm:space-y-3 " +
        "md:space-y-4",
        className
      )}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        // Tipografia responsiva
        "text-lg font-semibold leading-tight tracking-tight " +
        "sm:text-xl " +
        "md:text-2xl " +
        // Acessibilidade para títulos
        "text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        // Tipografia responsiva
        "text-sm text-muted-foreground leading-relaxed " +
        "sm:text-base " +
        "md:leading-loose",
        className
      )}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Spacing responsivo
        "space-y-4 " +
        "sm:space-y-5 " +
        "md:space-y-6",
        className
      )}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Layout responsivo
        "flex flex-col gap-3 pt-4 " +
        "sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pt-5 " +
        "md:pt-6",
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export { responsiveCardVariants };
