/**
 * Botão acessível com WCAG 2.1 AA compliance
 * Melhorias de acessibilidade e micro-interações
 */

import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { MotionWrapper } from './motion-wrapper';
import { cn } from '@/lib/utils';

const accessibleButtonVariants = cva(
  // Base styles com foco em acessibilidade
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold text-sm " +
  "ring-offset-background transition-all duration-200 focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 " +
  // Melhor contraste para WCAG AA
  "min-h-[44px] min-w-[44px] " +
  // Estados de hover e active mais suaves
  "hover:shadow-md active:scale-[0.98] active:duration-75",
  {
    variants: {
      variant: {
        default: 
          "bg-primary-500 text-white shadow-sm " +
          "hover:bg-primary-600 hover:shadow-primary/20 " +
          "focus-visible:bg-primary-600 " +
          "active:bg-primary-700",
        destructive:
          "bg-red-500 text-white shadow-sm " +
          "hover:bg-red-600 hover:shadow-red-500/20 " +
          "focus-visible:bg-red-600 " +
          "active:bg-red-700",
        outline:
          "border-2 border-primary-500 bg-transparent text-primary-500 " +
          "hover:bg-primary-50 hover:text-primary-600 " +
          "focus-visible:bg-primary-50 focus-visible:text-primary-600 " +
          "active:bg-primary-100",
        secondary:
          "bg-neutral-100 text-neutral-900 shadow-sm " +
          "hover:bg-neutral-200 hover:shadow-neutral-500/10 " +
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
        default: "h-11 px-4 py-2 min-w-[44px]",
        lg: "h-12 px-6 py-3 text-base min-w-[48px]",
        xl: "h-14 px-8 py-4 text-lg min-w-[56px]",
        icon: "h-11 w-11 p-0",
        "icon-sm": "h-9 w-9 p-0",
        "icon-lg": "h-12 w-12 p-0",
      },
      loading: {
        true: "cursor-wait",
        false: "cursor-pointer",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      loading: false,
    },
  }
);

export interface AccessibleButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onAnimationEnd'>,
    VariantProps<typeof accessibleButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  // Acessibilidade avançada
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    loading,
    loadingText,
    asChild = false, 
    children,
    disabled,
    'aria-describedby': ariaDescribedby,
    'aria-expanded': ariaExpanded,
    'aria-haspopup': ariaHaspopup,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;
    
    return (
      <MotionWrapper
        variant="scale"
        motionTransition="smooth"
        className="inline-block"
      >
        <Comp
          className={cn(accessibleButtonVariants({ variant, size, loading, className }))}
          ref={ref}
          disabled={isDisabled}
          aria-disabled={isDisabled}
          aria-describedby={ariaDescribedby}
          aria-expanded={ariaExpanded}
          aria-haspopup={ariaHaspopup}
          // Texto de carregamento para screen readers
          aria-label={loading && loadingText ? loadingText : props['aria-label']}
          {...props}
        >
          {loading && (
            <>
              <div 
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                aria-hidden="true"
              />
              <span className="sr-only">
                {loadingText || 'Carregando...'}
              </span>
            </>
          )}
          {!loading && children}
        </Comp>
      </MotionWrapper>
    );
  }
);

AccessibleButton.displayName = "AccessibleButton";

export { accessibleButtonVariants };
