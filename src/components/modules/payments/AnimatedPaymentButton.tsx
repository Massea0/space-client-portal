import React, { useEffect, useRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { motion } from 'framer-motion';
import gsap from 'gsap';

interface AnimatedPaymentButtonProps extends ButtonProps {
  icon?: React.ReactNode;
  paymentMethod?: string;
  isProcessing?: boolean;
  processingText?: string;
  successText?: string;
  animateOnMount?: boolean;
  delay?: number;
}

const AnimatedPaymentButton: React.FC<AnimatedPaymentButtonProps> = ({
  children,
  icon,
  paymentMethod,
  isProcessing = false,
  processingText = "Traitement en cours...",
  successText = "Paiement effectué",
  animateOnMount = false,
  delay = 0,
  className = "",
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const buttonElement = buttonRef.current;
    if (animateOnMount && buttonElement) {
      const animation = gsap.fromTo(
        buttonElement,
        { scale: 0.95, opacity: 0, y: 10 },
        { 
          scale: 1, 
          opacity: 1, 
          y: 0,
          duration: 0.5,
          delay,
          ease: "back.out(1.7)"
        }
      );
      
      // Nettoyage pour éviter les fuites de mémoire
      return () => {
        animation.kill();
      };
    }
  }, [animateOnMount, delay]);
  
  useEffect(() => {
    const buttonElement = buttonRef.current;
    if (isProcessing && buttonElement) {
      try {
        const currentWidth = buttonElement.offsetWidth;
        const animation = gsap.fromTo(
          buttonElement,
          { width: currentWidth },
          { 
            width: currentWidth + 20,
            duration: 0.3,
            ease: "power2.inOut"
          }
        );
        
        // Nettoyage pour éviter les fuites de mémoire
        return () => {
          animation.kill();
        };
      } catch (error) {
        console.error("Erreur d'animation du bouton:", error);
      }
    }
  }, [isProcessing]);
  
  // Animation pour l'icône
  useEffect(() => {
    const iconElement = iconRef.current;
    if (iconElement) {
      const animation = gsap.fromTo(
        iconElement,
        { rotate: 0 },
        { 
          rotate: 360,
          duration: 20,
          repeat: -1,
          ease: "linear"
        }
      );
      
      // Nettoyage pour éviter les fuites de mémoire
      return () => {
        animation.kill();
      };
    }
  }, []);
  
  // Gradient d'arrière-plan animé pour certaines méthodes de paiement
  const getGradientClass = () => {
    if (paymentMethod === 'orange_money') {
      return 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700';
    } else if (paymentMethod === 'wave') {
      return 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700';
    }
    return '';
  };
  
  const baseClassName = `relative overflow-hidden transition-all ${getGradientClass()} ${className}`;
  
  return (
    <motion.div
      initial={animateOnMount ? { opacity: 0, scale: 0.95, y: 10 } : { opacity: 1 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <Button
        ref={buttonRef}
        className={baseClassName}
        disabled={isProcessing}
        {...props}
      >
        {/* Effet de lumière sur le bouton */}
        <span className="absolute inset-0 overflow-hidden">
          <span className="absolute -left-[100%] top-0 h-full w-[120%] z-10 animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </span>
        
        {/* Contenu du bouton */}
        <span className="flex items-center justify-center gap-2">
          {icon && <div ref={iconRef} className="mr-2">{icon}</div>}
          <span>
            {isProcessing ? processingText : children}
          </span>
        </span>
      </Button>
    </motion.div>
  );
};

export default AnimatedPaymentButton;
