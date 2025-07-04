// src/components/ui/animated-button.tsx
import React, { forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface AnimatedButtonProps extends ButtonProps {
  animationType?: 'hover' | 'pulse' | 'grow' | 'shine' | 'none';
}

/**
 * Bouton avec animations avancées
 * Permet d'ajouter des effets de survol, pulse, et autres animations
 */
export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, animationType = 'hover', children, ...props }, ref) => {
    // Préférence pour réduire les animations
    const prefersReducedMotion = typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false;
    
    // Si préférence pour réduire les animations, on utilise un bouton normal
    if (prefersReducedMotion) {
      return (
        <Button ref={ref} className={className} {...props}>
          {children}
        </Button>
      );
    }
    
    // Configuration des classes selon le type d'animation
    const animationClasses = {
      hover: 'animated-btn',
      pulse: 'pulse-btn',
      grow: 'hover:scale-105 active:scale-95 transition-transform duration-200',
      shine: 'relative overflow-hidden transition-colors before:absolute before:inset-0 before:-translate-x-full hover:before:translate-x-full before:bg-white/20 before:transition-transform before:duration-500',
      none: ''
    };
    
    // Pour les animations simples, on utilise des classes CSS
    if (animationType !== 'none' && ['hover', 'pulse', 'grow', 'shine'].includes(animationType)) {
      return (
        <Button 
          ref={ref} 
          className={cn(animationClasses[animationType as keyof typeof animationClasses], className)} 
          {...props}
        >
          {children}
        </Button>
      );
    }
    
    // Fallback - bouton standard
    return (
      <Button ref={ref} className={className} {...props}>
        {children}
      </Button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

/**
 * Bouton avec animation Framer Motion
 * Pour des animations plus complexes et interactives
 */
interface MotionButtonProps {
  className?: string;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  name?: string;
  value?: string;
  tabIndex?: number;
  autoFocus?: boolean;
  id?: string;
  style?: React.CSSProperties;
  // Ajoutez ici d'autres props HTML standards si besoin
}

export const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ className, children, type = 'button', disabled, name, value, tabIndex, autoFocus, id, style }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn('btn', className)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        type={type}
        disabled={disabled}
        name={name}
        value={value}
        tabIndex={tabIndex}
        autoFocus={autoFocus}
        id={id}
        style={style}
      >
        {children}
      </motion.button>
    );
  }
);

MotionButton.displayName = 'MotionButton';

export default AnimatedButton;
