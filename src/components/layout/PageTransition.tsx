import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

interface PageTransitionProps {
  children: React.ReactNode;
  transitionType?: 'fade' | 'slide' | 'slideUp' | 'zoom' | 'flip' | 'none';
  duration?: number;
}

/**
 * Composant pour animer les transitions entre pages
 * À utiliser dans le composant Layout principal
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children,
  transitionType = 'fade',
  duration = 0.5
}) => {
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");

  // Gestion du changement de route
  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("fadeOut");
      
      // Petit délai avant de changer de page
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage("fadeIn");
      }, duration * 1000 * 0.5);
      
      return () => clearTimeout(timeout);
    }
  }, [location, displayLocation, duration]);

  // Définir les variants pour chaque type de transition
  const getFadeVariants = (): Variants => ({
    initial: { opacity: 0 },
    fadeIn: { opacity: 1, transition: { duration } },
    fadeOut: { opacity: 0, transition: { duration: duration * 0.5 } }
  });
  
  const getSlideVariants = (): Variants => ({
    initial: { opacity: 0, x: 100 },
    fadeIn: { opacity: 1, x: 0, transition: { duration } },
    fadeOut: { opacity: 0, x: -100, transition: { duration: duration * 0.5 } }
  });
  
  const getSlideUpVariants = (): Variants => ({
    initial: { opacity: 0, y: -50 },
    fadeIn: { opacity: 1, y: 0, transition: { duration } },
    fadeOut: { opacity: 0, y: 50, transition: { duration: duration * 0.5 } }
  });
  
  const getZoomVariants = (): Variants => ({
    initial: { opacity: 0, scale: 1.05 },
    fadeIn: { opacity: 1, scale: 1, transition: { duration } },
    fadeOut: { opacity: 0, scale: 0.95, transition: { duration: duration * 0.5 } }
  });
  
  const getFlipVariants = (): Variants => ({
    initial: { opacity: 0.5, rotateY: -90 },
    fadeIn: { opacity: 1, rotateY: 0, transition: { duration: duration * 1.2 } },
    fadeOut: { opacity: 0.5, rotateY: 90, transition: { duration: duration * 0.6 } }
  });
  
  const getNoneVariants = (): Variants => ({
    initial: {},
    fadeIn: {},
    fadeOut: {}
  });
  
  // Sélectionner les bons variants selon le type
  const getVariantsByType = () => {
    switch (transitionType) {
      case 'fade': return getFadeVariants();
      case 'slide': return getSlideVariants();
      case 'slideUp': return getSlideUpVariants();
      case 'zoom': return getZoomVariants();
      case 'flip': return getFlipVariants();
      default: return getNoneVariants();
    }
  };

  // Animation GSAP pour les éléments enfants après transition
  useEffect(() => {
    if (transitionStage === "fadeIn" && mainRef.current && transitionType !== 'none') {
      // Petite pause pour s'assurer que le DOM est prêt
      const timer = setTimeout(() => {
        if (!mainRef.current) return;
        
        // Sélection des éléments à animer en séquence avec vérification
        const headers = mainRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const cards = mainRef.current.querySelectorAll('.card, .animated-card, [class*="card"]');
        const buttons = mainRef.current.querySelectorAll('button, .button, .btn');
        
        // Animation séquentielle des éléments seulement s'ils existent
        if (headers.length > 0) {
          try {
            gsap.fromTo(
              headers,
              { y: 20, opacity: 0 },
              { 
                y: 0, 
                opacity: 1, 
                stagger: 0.1,
                delay: duration * 0.7,
                duration: 0.5,
                ease: "power2.out",
                clearProps: "all"
              }
            );
          } catch (error) {
            console.warn('GSAP animation error for headers:', error);
          }
        }
        
        if (cards.length > 0) {
          try {
            gsap.fromTo(
              cards,
              { y: 30, opacity: 0 },
              { 
                y: 0, 
                opacity: 1, 
                stagger: 0.08,
                delay: duration * 0.8,
                duration: 0.5,
                ease: "power3.out",
                clearProps: "all"
              }
            );
          } catch (error) {
            console.warn('GSAP animation error for cards:', error);
          }
        }
        
        if (buttons.length > 0) {
          try {
            gsap.fromTo(
              buttons,
              { scale: 0.9, opacity: 0 },
              { 
                scale: 1, 
                opacity: 1, 
                stagger: 0.05,
                delay: duration * 0.9,
                duration: 0.4,
                ease: "back.out(1.7)",
                clearProps: "all"
              }
            );
          } catch (error) {
            console.warn('GSAP animation error for buttons:', error);
          }
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [transitionStage, transitionType, duration]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={displayLocation.pathname}
        ref={mainRef}
        initial="initial"
        animate={transitionStage === "fadeIn" ? "fadeIn" : "fadeOut"}
        variants={getVariantsByType()}
        style={{ 
          width: '100%',
          minHeight: '100%',
          perspective: transitionType === 'flip' ? 1200 : undefined
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
