// src/components/ui/animated-card.tsx
import React, { forwardRef, CSSProperties } from 'react';
import { Card, CardProps } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion, MotionProps } from 'framer-motion';

interface AnimatedCardProps extends CardProps {
  animationType?: 'hover' | 'tilt' | 'float' | 'none';
  hoverScale?: number;
  hoverRotate?: number;
  hoverY?: number;
  motionProps?: MotionProps;
}

/**
 * Carte avec animations avancées
 * Permet d'ajouter des effets de survol, élévation, rotation, etc.
 */
export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ 
    className, 
    animationType = 'hover', 
    hoverScale = 1.03,
    hoverRotate = 0,
    hoverY = -5,
    motionProps,
    children, 
    ...props 
  }, ref) => {
    // Préférence pour réduire les animations
    const prefersReducedMotion = typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false;
    
    // Si préférence pour réduire les animations, on utilise une carte normale
    if (prefersReducedMotion) {
      return (
        <Card ref={ref} className={className} {...props}>
          {children}
        </Card>
      );
    }
    
    // Pour les animations simples avec CSS
    if (animationType === 'hover') {
      return (
        <Card 
          ref={ref} 
          className={cn('animated-card focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2', className)} 
          tabIndex={0}
          aria-label="Carte animée"
          {...props}
        >
          {children}
        </Card>
      );
    }
    
    // Pour les animations plus avancées avec Framer Motion
    if (animationType === 'tilt' || animationType === 'float') {
      const MotionCardComponent = motion(Card);
      
      function pickMotionProps(props: Record<string, unknown>) {
        const motionKeys = [
          'initial', 'animate', 'whileHover', 'whileTap', 'transition', 'exit', 'style', 'onAnimationStart', 'onAnimationComplete', 'onUpdate', 'onDrag', 'onDragEnd', 'onDragStart', 'drag', 'dragConstraints', 'dragElastic', 'dragMomentum', 'dragPropagation', 'dragSnapToOrigin', 'layout', 'layoutId', 'layoutDependency', 'layoutRoot', 'layoutScroll', 'layoutTransition', 'transformTemplate', 'transformValues', 'variants', 'custom', 'tabIndex', 'aria-label', 'className', 'children', 'ref'
        ];
        const result: Record<string, unknown> = {};
        for (const key of motionKeys) {
          if (key in props) result[key] = props[key];
        }
        return result;
      }
      
      // Animation de flottement
      if (animationType === 'float') {
        const filteredProps = pickMotionProps({
          className,
          initial: { y: 0 },
          animate: { y: [0, -10, 0], transition: { repeat: Infinity, duration: 4, ease: "easeInOut" } },
          whileHover: { scale: hoverScale, boxShadow: "0 10px 25px rgba(0,0,0,0.15)", y: hoverY },
          transition: { type: "spring", stiffness: 400, damping: 17 },
          ...motionProps,
          children,
          tabIndex: 0,
          "aria-label": "Carte animée",
          ref
        });
        return (
          <MotionCardComponent {...filteredProps} />
        );
      }
      
      // Animation de tilt (inclinaison)
      const filteredProps = pickMotionProps({
        className,
        whileHover: { scale: hoverScale, rotateX: hoverRotate, rotateY: hoverRotate, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" },
        transition: { type: "spring", stiffness: 400, damping: 17 },
        style: { transformStyle: 'preserve-3d' as CSSProperties['transformStyle'] },
        ...motionProps,
        children,
        tabIndex: 0,
        "aria-label": "Carte animée",
        ref
      });
      return (
        <MotionCardComponent {...filteredProps} />
      );
    }
    
    // Fallback - carte standard
    return (
      <Card ref={ref} className={className} {...props}>
        {children}
      </Card>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';

export default AnimatedCard;
