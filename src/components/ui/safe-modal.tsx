/**
 * SafeModal - Une version simplifiée et sécurisée qui évite les erreurs React.Children.only
 * en utilisant un Alert Dialog au lieu d'un Dialog standard avec asChild
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SafeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
}

export function SafeModal({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  size = 'md',
  showClose = true,
}: SafeModalProps) {
  // Classes de taille
  const sizeClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    full: "sm:max-w-[95vw] w-[95vw] h-[90vh]"
  };
  
  // Animation définie directement sur le composant motion.div pour éviter les problèmes de typage

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {isOpen && (
          <AlertDialogContent 
            className={cn("overflow-hidden p-0", sizeClasses[size], className)}
            forceMount
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full h-full"
            >
              {/* En-tête */}
              {(title || description) && (
                <AlertDialogHeader className="p-6">
                  {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
                  {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
                </AlertDialogHeader>
              )}
              
              {/* Contenu */}
              <div className="px-6 py-2 w-full">
                {children}
              </div>
              
              {/* Footer */}
              {footer && (
                <AlertDialogFooter className="p-6 border-t">
                  {footer}
                </AlertDialogFooter>
              )}
              
              {/* Bouton de fermeture */}
              {showClose && (
                <AlertDialogCancel 
                  className="absolute right-4 top-4 p-1 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Fermer</span>
                </AlertDialogCancel>
              )}
            </motion.div>
          </AlertDialogContent>
        )}
      </AnimatePresence>
    </AlertDialog>
  );
}

export default SafeModal;
