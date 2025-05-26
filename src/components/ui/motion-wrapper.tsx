/**
 * Wrapper de animações com Framer Motion
 * Componente reutilizável para micro-interações consistentes
 */

import { motion, MotionProps, Variants } from 'framer-motion';
import { forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Variantes de animação padronizadas
export const animationVariants: Record<string, Variants> = {
  // Fade in/out
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  // Escala para botões e cards
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  },
  
  // Slide para panels e drawers
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  },
  
  slideDown: {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
  },
  
  // Slide para esquerda
  slideLeft: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
  },
  
  // Slide para direita
  slideRight: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
  },
  
  // Bounce para feedback positivo
  bounce: {
    animate: {
      scale: [1, 1.1, 1],
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  },
  
  // Shake para feedback de erro
  shake: {
    animate: {
      x: [0, -8, 8, -8, 8, 0],
      transition: { duration: 0.4, ease: 'easeInOut' }
    }
  },
  
  // Pulse para elementos em carregamento
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
      transition: { 
        duration: 2, 
        repeat: Infinity, 
        ease: 'easeInOut' 
      }
    }
  }
};

// Transições padrão otimizadas
export const defaultTransitions = {
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  },
  smooth: {
    type: 'tween',
    duration: 0.2,
    ease: 'easeOut',
  },
  bounce: {
    type: 'spring',
    stiffness: 400,
    damping: 10,
  }
} as const;

interface MotionWrapperProps extends Omit<MotionProps, 'transition'> {
  children: ReactNode;
  variant?: keyof typeof animationVariants;
  className?: string;
  motionTransition?: keyof typeof defaultTransitions;
  // Accessibility props
  'aria-live'?: 'polite' | 'assertive' | 'off';
  role?: string;
}

export const MotionWrapper = forwardRef<HTMLDivElement, MotionWrapperProps>(({
  children,
  variant = 'fade',
  className,
  motionTransition = 'smooth',
  'aria-live': ariaLive,
  role,
  ...motionProps
}, ref) => {
  const selectedVariant = animationVariants[variant];
  const selectedTransition = defaultTransitions[motionTransition];

  return (
    <motion.div
      ref={ref}
      className={cn('motion-wrapper', className)}
      variants={selectedVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      whileTap="tap"
      transition={selectedTransition}
      aria-live={ariaLive}
      role={role}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
});

MotionWrapper.displayName = 'MotionWrapper';

// Hook para animações programáticas
export const useMotionControls = () => {
  const triggerBounce = (element: HTMLElement) => {
    element.style.animation = 'none';
    element.offsetHeight; // Força reflow
    element.style.animation = 'bounce 0.3s ease-in-out';
  };

  const triggerShake = (element: HTMLElement) => {
    element.style.animation = 'none';
    element.offsetHeight;
    element.style.animation = 'shake 0.4s ease-in-out';
  };

  const triggerPulse = (element: HTMLElement) => {
    element.style.animation = 'pulse 2s infinite';
  };

  return { triggerBounce, triggerShake, triggerPulse };
};
