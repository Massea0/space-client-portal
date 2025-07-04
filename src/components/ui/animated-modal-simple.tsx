// src/components/ui/animated-modal-simple.tsx
// Version simplifiée sans GSAP pour éviter les erreurs

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedModalSimpleProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  showClose?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  animationType?: 'slide' | 'zoom' | 'fade';
}

export const AnimatedModalSimple: React.FC<AnimatedModalSimpleProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  contentClassName,
  showClose = true,
  size = 'md',
  animationType = 'zoom'
}) => {
  // Variantes d'animation simplifiées
  const variants = {
    hidden: { opacity: 0, scale: animationType === 'zoom' ? 0.95 : 1, y: animationType === 'slide' ? 20 : 0 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: animationType === 'zoom' ? 0.95 : 1, y: animationType === 'slide' ? -20 : 0, transition: { duration: 0.15 } }
  };

  // Classes de taille
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-[95vw] w-[95vw] h-[90vh]"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {isOpen && (
          <DialogContent 
            className={cn(
              "overflow-hidden",
              sizeClasses[size],
              "backdrop-blur-sm bg-background/95",
              className
            )}
            forceMount
            asChild
          >
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={variants}
              className={cn("rounded-lg shadow-lg", contentClassName)}
            >
              {(title || description) && (
                <DialogHeader>
                  {title && <DialogTitle>{title}</DialogTitle>}
                  {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
              )}
              
              <div className="py-4">
                {children}
              </div>
              
              {footer && (
                <DialogFooter>
                  {footer}
                </DialogFooter>
              )}
              
              {showClose && (
                <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Fermer</span>
                </DialogClose>
              )}
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default AnimatedModalSimple;
