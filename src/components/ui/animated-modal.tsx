import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
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
import gsap from 'gsap';

interface AnimatedModalProps {
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
  withBlur?: boolean;
  animationType?: 'slide' | 'zoom' | 'fade' | 'bounce' | 'flip';
}

export const AnimatedModal = ({
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
  withBlur = true,
  animationType = 'zoom'
}: AnimatedModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Configurer les variantes d'animation selon le type
  const getAnimationVariants = (): Variants => {
    switch (animationType) {
      case 'slide':
        return {
          hidden: { y: -50, opacity: 0 },
          visible: { 
            y: 0, 
            opacity: 1,
            transition: { 
              type: 'spring', 
              stiffness: 300, 
              damping: 20
            } 
          },
          exit: { y: 50, opacity: 0, transition: { duration: 0.2 } }
        };
      case 'zoom':
        return {
          hidden: { scale: 0.9, opacity: 0 },
          visible: { 
            scale: 1, 
            opacity: 1,
            transition: { 
              type: 'spring', 
              stiffness: 400, 
              damping: 25
            } 
          },
          exit: { scale: 0.95, opacity: 0, transition: { duration: 0.2 } }
        };
      case 'fade':
        return {
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: { duration: 0.3 }
          },
          exit: { opacity: 0, transition: { duration: 0.2 } }
        };
      case 'bounce':
        return {
          hidden: { y: -100, opacity: 0 },
          visible: { 
            y: 0, 
            opacity: 1,
            transition: { 
              type: 'spring',
              stiffness: 500,
              damping: 15
            }
          },
          exit: { y: 100, opacity: 0, transition: { duration: 0.2 } }
        };
      case 'flip':
        return {
          hidden: { rotateX: -90, opacity: 0 },
          visible: { 
            rotateX: 0, 
            opacity: 1,
            transition: { 
              duration: 0.5, 
              ease: "easeOut" 
            }
          },
          exit: { rotateX: 90, opacity: 0, transition: { duration: 0.2 } }
        };
      default:
        return {
          hidden: { scale: 0.95, opacity: 0 },
          visible: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
          exit: { scale: 0.95, opacity: 0, transition: { duration: 0.2 } }
        };
    }
  };

  // Déterminer les classes de taille
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-[95vw] w-[95vw] h-[90vh]"
  };

  // Animation GSAP pour les éléments internes lors de l'ouverture
  useEffect(() => {
    if (isOpen) {
      // Animation de l'en-tête si le référence existe et qu'il a des enfants
      if (headerRef.current && headerRef.current.children && headerRef.current.children.length > 0) {
        gsap.fromTo(
          headerRef.current.children, 
          { 
            y: -20, 
            opacity: 0 
          },
          { 
            y: 0, 
            opacity: 1, 
            duration: 0.6, 
            stagger: 0.1,
            delay: 0.2,
            ease: "power3.out"
          }
        );
      }

      // Animation du contenu si la référence existe
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { 
            y: 20, 
            opacity: 0 
          },
          { 
            y: 0, 
            opacity: 1, 
            duration: 0.5,
            delay: 0.3,
            ease: "power2.out"
          }
        );
      }
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {isOpen && (
          <DialogContent 
            ref={dialogRef}
            className={cn(
              "overflow-hidden",
              sizeClasses[size],
              withBlur && "backdrop-blur-sm bg-background/95",
              className
            )}
            onEscapeKeyDown={() => onOpenChange(false)}
            forceMount
          >
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={getAnimationVariants()}
              className={cn("rounded-lg shadow-lg", contentClassName)}
            >
              {(title || description) && (
                <div ref={headerRef}>
                  <DialogHeader>
                    {title && <DialogTitle>{title}</DialogTitle>}
                    {description && <DialogDescription>{description}</DialogDescription>}
                  </DialogHeader>
                </div>
              )}
              
              {/* Contenu principal */}
              <div ref={contentRef} className="py-4 w-full">
                {children}
              </div>
              
              {/* Footer */}
              {footer && (
                <DialogFooter className="w-full">
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

export default AnimatedModal;
