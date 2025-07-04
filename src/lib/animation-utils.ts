// src/lib/animation-utils.ts
/**
 * Utilitaires pour les animations et transitions
 */

import { useEffect } from 'react';
import gsap from 'gsap';
import { useVisualEffect } from '@/components/ui/visual-effect';

/**
 * Types d'animations prédéfinis
 */
export type AnimationType = 'fade' | 'slide' | 'zoom' | 'bounce' | 'flip';
export type AnimationDirection = 'up' | 'down' | 'left' | 'right';

/**
 * Options pour les animations
 */
export interface AnimationOptions {
  duration?: number;
  delay?: number;
  ease?: string;
  direction?: AnimationDirection;
}

/**
 * Configuration par défaut pour les animations
 */
export const DEFAULT_ANIMATION_CONFIG = {
  duration: 0.3,
  ease: 'var(--ease-out)',
};

/**
 * Hook pour détecter si l'utilisateur préfère réduire les animations
 */
export function usePrefersReducedMotion(): boolean {
  return typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;
}

/**
 * Hook pour animer un élément avec GSAP
 */
export function useElementAnimation(
  ref: React.RefObject<HTMLElement>,
  animation: AnimationType,
  options: AnimationOptions = {}
) {
  const prefersReducedMotion = usePrefersReducedMotion();
  
  useEffect(() => {
    if (!ref.current || prefersReducedMotion) return;
    
    const element = ref.current;
    const { 
      duration = DEFAULT_ANIMATION_CONFIG.duration,
      delay = 0,
      ease = DEFAULT_ANIMATION_CONFIG.ease,
      direction = 'up'
    } = options;
    
    // Configuration initiale
    let initialProps = {};
    let animationProps = {};
    
    // Définir les propriétés d'animation en fonction du type
    switch (animation) {
      case 'fade': {
        initialProps = { autoAlpha: 0 };
        animationProps = { autoAlpha: 1 };
        break;
      }
      
      case 'slide': {
        const distance = 30;
        const directionMap = {
          up: { y: distance },
          down: { y: -distance },
          left: { x: distance },
          right: { x: -distance },
        };
        initialProps = { autoAlpha: 0, ...directionMap[direction] };
        animationProps = { autoAlpha: 1, x: 0, y: 0 };
        break;
      }
      
      case 'zoom': {
        initialProps = { autoAlpha: 0, scale: 0.9 };
        animationProps = { autoAlpha: 1, scale: 1 };
        break;
      }
      
      case 'bounce': {
        initialProps = { autoAlpha: 0, scale: 0.8, y: 20 };
        animationProps = { 
          autoAlpha: 1, 
          scale: 1, 
          y: 0,
          ease: 'elastic.out(1, 0.5)'
        };
        break;
      }
      
      case 'flip': {
        initialProps = { autoAlpha: 0, rotationX: 90 };
        animationProps = { 
          autoAlpha: 1, 
          rotationX: 0,
          ease: 'power3.out'
        };
        break;
      }
      
      default: {
        initialProps = { autoAlpha: 0 };
        animationProps = { autoAlpha: 1 };
      }
    }
    
    // Appliquer les propriétés initiales
    gsap.set(element, initialProps);
    
    // Animer vers les propriétés finales
    const { ease: animEase, ...restAnimationProps } = animationProps as { ease?: string };
    gsap.to(element, {
      ...restAnimationProps,
      duration,
      delay,
      ease: animEase || ease,
    });
    
    // Nettoyer l'animation si le composant est démonté
    return () => {
      gsap.killTweensOf(element);
    };
  }, [ref, animation, options, prefersReducedMotion]);
}

/**
 * Hook pour célébrer une action réussie
 */
export function useCelebration(shouldTrigger: boolean, type: 'confetti' | 'sparkles' | 'fire' = 'confetti') {
  const visualEffect = useVisualEffect();
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (shouldTrigger && !prefersReducedMotion) {
      const options: Record<string, unknown> = {
        particleCount: type === 'confetti' ? 100 : 30,
        spread: 70,
        origin: { x: 0.5, y: 0.6 }
      };
      visualEffect.playEffect(type, options);
    }
  }, [shouldTrigger, type, visualEffect, prefersReducedMotion]);
}

/**
 * Classe CSS pour appliquer une transition fluide à tous les thèmes 
 */
export const THEME_TRANSITION_CLASS = 'transition-colors duration-300 ease-in-out';

/**
 * Types d'effets de survol prédéfinis pour les composants
 */
export enum HoverEffectType {
  ELEVATE = 'elevate',
  GLOW = 'glow',
  SCALE = 'scale',
  UNDERLINE = 'underline',
}

/**
 * Classes CSS pour les effets de survol
 */
export const HOVER_EFFECT_CLASSES = {
  [HoverEffectType.ELEVATE]: 'transition-all duration-300 hover:-translate-y-1 hover:shadow-md',
  [HoverEffectType.GLOW]: 'transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]',
  [HoverEffectType.SCALE]: 'transition-transform duration-300 hover:scale-105',
  [HoverEffectType.UNDERLINE]: 'relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full',
};
