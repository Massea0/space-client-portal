import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  X, 
  AlertTriangle,
  LucideIcon
} from 'lucide-react';
import gsap from 'gsap';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface AnimatedNotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  autoClose?: boolean;
  duration?: number;
  onClose: (id: string) => void;
  icon?: React.ReactNode;
}

export const AnimatedNotification: React.FC<AnimatedNotificationProps> = ({
  id,
  type,
  title,
  message,
  autoClose = true,
  duration = 5000,
  onClose,
  icon
}) => {
  const [isLeaving, setIsLeaving] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Configurer l'icône et les couleurs selon le type
  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-500',
          textColor: 'text-green-700 dark:text-green-400',
          progressColor: 'bg-green-500'
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-500',
          textColor: 'text-red-700 dark:text-red-400',
          progressColor: 'bg-red-500'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-700 dark:text-yellow-400',
          progressColor: 'bg-yellow-500'
        };
      case 'info':
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-500',
          textColor: 'text-blue-700 dark:text-blue-400',
          progressColor: 'bg-blue-500'
        };
    }
  };

  const config = getTypeConfig();
  const IconComponent = config.icon as LucideIcon;

  // Fermeture automatique
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [autoClose, duration]);

  // Animation de la barre de progression
  useEffect(() => {
    if (autoClose && progressRef.current) {
      gsap.fromTo(
        progressRef.current,
        { width: '100%' },
        {
          width: '0%',
          duration: duration / 1000,
          ease: 'linear'
        }
      );
    }
  }, [autoClose, duration]);

  // Effet d'apparition avec GSAP
  useEffect(() => {
    if (notificationRef.current) {
      // Animation principale du toast
      gsap.fromTo(
        notificationRef.current,
        {
          x: 50,
          opacity: 0,
          scale: 0.9
        },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'power2.out'
        }
      );

      // Animation des enfants
      gsap.fromTo(
        notificationRef.current.querySelectorAll('.animate-item'),
        {
          y: 10,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          delay: 0.2,
          duration: 0.3,
          ease: 'power2.out'
        }
      );
    }
  }, []);

  // Gérer la fermeture avec animation
  const handleClose = () => {
    setIsLeaving(true);
    
    if (notificationRef.current) {
      gsap.to(notificationRef.current, {
        x: 100,
        opacity: 0,
        scale: 0.9,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => onClose(id)
      });
    } else {
      onClose(id);
    }
  };

  // Variants pour l'animation Framer Motion
  const variants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      ref={notificationRef}
      variants={variants}
      initial="hidden"
      animate={isLeaving ? "exit" : "visible"}
      exit="exit"
      className={cn(
        "relative overflow-hidden rounded-lg border p-4 shadow-lg backdrop-blur-sm",
        "flex items-start gap-3",
        "max-w-md w-full",
        config.bgColor,
        config.borderColor
      )}
      role="alert"
    >
      {/* Icône */}
      <div className={cn("shrink-0 animate-item", config.textColor)}>
        {icon || <IconComponent className="h-5 w-5" />}
      </div>
      
      {/* Contenu */}
      <div className="flex-1 animate-item">
        <h5 className={cn("font-medium", config.textColor)}>{title}</h5>
        {message && <p className="mt-1 text-sm opacity-90">{message}</p>}
      </div>
      
      {/* Bouton de fermeture */}
      <button
        className={cn(
          "shrink-0 rounded-full p-1 opacity-70 transition-opacity hover:opacity-100 animate-item",
          config.textColor
        )}
        onClick={handleClose}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Fermer</span>
      </button>
      
      {/* Barre de progression */}
      {autoClose && (
        <div className="absolute bottom-0 left-0 h-1 w-full bg-gray-200 dark:bg-gray-700">
          <div
            ref={progressRef}
            className={cn("h-full", config.progressColor)}
          />
        </div>
      )}
    </motion.div>
  );
};

export default AnimatedNotification;
