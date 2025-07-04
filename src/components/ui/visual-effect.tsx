import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import gsap from 'gsap';

type EffectType = 
  | 'confetti' 
  | 'sparkles' 
  | 'fire' 
  | 'success' 
  | 'celebration' 
  | 'stars' 
  | 'bubbles';

interface VisualEffectOptions {
  duration?: number;
  intensity?: 'low' | 'medium' | 'high';
  colors?: string[];
  particleCount?: number;
  spread?: number;
  origin?: {
    x: number;
    y: number;
  };
}

interface VisualEffectProps {
  effect: EffectType;
  options?: VisualEffectOptions;
  onComplete?: () => void;
}

/**
 * Composant d'effet visuel qui utilise canvas-confetti et GSAP pour des animations d'effet visuels
 */
export const VisualEffect: React.FC<VisualEffectProps> = ({ 
  effect,
  options = {},
  onComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const completedRef = useRef<boolean>(false);

  // Options par défaut
  const defaultOptions = {
    duration: 3000,
    intensity: 'medium',
    colors: ['#22c55e', '#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6'],
    particleCount: 100,
    spread: 70,
    origin: { y: 0.7, x: 0.5 }
  };

  // Fusionner avec les options utilisateur
  const effectOptions = { ...defaultOptions, ...options };

  // Multiplier particleCount selon l'intensité
  const getParticleCount = () => {
    const baseCount = effectOptions.particleCount;
    switch (effectOptions.intensity) {
      case 'low': return baseCount * 0.5;
      case 'high': return baseCount * 2;
      default: return baseCount;
    }
  };

  // Initialiser l'effet
  useEffect(() => {
    // Créer un canvas pour les effets
    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;
    
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    
    if (containerRef.current) {
      containerRef.current.appendChild(canvas);
    }
    
    // Créer l'instance de confetti
    const myConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: true
    });

    // Appliquer l'effet spécifique
    switch (effect) {
      case 'confetti':
        myConfetti({
          particleCount: getParticleCount(),
          spread: effectOptions.spread,
          origin: effectOptions.origin,
          colors: effectOptions.colors
        });
        break;

      case 'sparkles': {
        // Une série de petites explosions
        const launchSparkles = () => {
          const count = Math.floor(getParticleCount() / 10);
          const sparkleInterval = setInterval(() => {
            myConfetti({
              particleCount: count,
              spread: effectOptions.spread * 0.5,
              origin: {
                x: 0.3 + Math.random() * 0.4,
                y: 0.3 + Math.random() * 0.4
              },
              colors: effectOptions.colors,
              shapes: ['circle'],
              scalar: 0.8
            });
          }, 300);

          setTimeout(() => clearInterval(sparkleInterval), effectOptions.duration * 0.8);
        };
        launchSparkles();
        break;
      }

      case 'fire': {
        // Effet de flammes qui montent
        const launchFire = () => {
          const fireInterval = setInterval(() => {
            myConfetti({
              particleCount: Math.floor(getParticleCount() / 15),
              angle: 270,
              spread: 25,
              origin: {
                x: 0.2 + Math.random() * 0.6,
                y: 0.9
              },
              colors: ['#f97316', '#f59e0b', '#ef4444', '#f43f5e'],
              ticks: 200,
              gravity: 0.2,
              decay: 0.88,
              startVelocity: 20 + Math.random() * 15
            });
          }, 100);

          setTimeout(() => clearInterval(fireInterval), effectOptions.duration * 0.8);
        };
        launchFire();
        break;
      }

      case 'success':
        // Effet checkmark suivi de confetti
        {
          // Créer un nouvel élément SVG pour l'animation du checkmark
          const svgContainer = document.createElement('div');
          svgContainer.style.position = 'fixed';
          svgContainer.style.top = '50%';
          svgContainer.style.left = '50%';
          svgContainer.style.transform = 'translate(-50%, -50%)';
          svgContainer.style.zIndex = '10000';
          svgContainer.style.pointerEvents = 'none';
          
          svgContainer.innerHTML = `
            <svg width="100" height="100" viewBox="0 0 100 100">
              <path class="checkmark" fill="none" stroke="#22c55e" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M30,50 L45,65 L70,35"></path>
            </svg>
          `;
          
          if (containerRef.current) {
            containerRef.current.appendChild(svgContainer);
          }
          
          // Animer le checkmark avec GSAP
          const checkmark = svgContainer.querySelector('.checkmark');
          if (checkmark) {
            gsap.set(checkmark, {
              strokeDasharray: 100,
              strokeDashoffset: 100
            });
            
            gsap.to(checkmark, {
              strokeDashoffset: 0,
              duration: 0.8,
              ease: "power2.out",
              onComplete: () => {
                // Lancer des confettis après l'animation du checkmark
                setTimeout(() => {
                  myConfetti({
                    particleCount: getParticleCount(),
                    spread: effectOptions.spread,
                    origin: { y: 0.55, x: 0.5 },
                    colors: ['#22c55e', '#4ade80', '#86efac']
                  });
                  
                  // Faire disparaître le checkmark
                  gsap.to(svgContainer, {
                    opacity: 0,
                    duration: 0.5,
                    delay: 1,
                    onComplete: () => {
                      svgContainer.remove();
                    }
                  });
                }, 400);
              }
            });
          }
        }
        break;

      case 'celebration':
        // Effet de célébration avec plusieurs vagues
        {
          const interval = 800;
          let count = 0;
          
          const celebrationInterval = setInterval(() => {
            // Côté droit
            myConfetti({
              particleCount: getParticleCount() * 0.3,
              angle: 130,
              spread: 80,
              origin: { x: 0, y: 0.8 },
              colors: effectOptions.colors
            });
            
            // Côté gauche
            myConfetti({
              particleCount: getParticleCount() * 0.3,
              angle: 50,
              spread: 80,
              origin: { x: 1, y: 0.8 },
              colors: effectOptions.colors
            });
            
            count++;
            if (count >= 3) clearInterval(celebrationInterval);
          }, interval);
        }
        break;

      case 'stars':
        // Effet d'étoiles qui tombent lentement
        {
          const starsCount = getParticleCount();
          const stars = [];
          
          // Créer des étoiles à des positions aléatoires
          for (let i = 0; i < starsCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.position = 'fixed';
            star.style.width = `${5 + Math.random() * 15}px`;
            star.style.height = star.style.width;
            star.style.backgroundColor = effectOptions.colors[Math.floor(Math.random() * effectOptions.colors.length)];
            star.style.borderRadius = '50%';
            star.style.left = `${Math.random() * 100}vw`;
            star.style.top = `-50px`;
            star.style.boxShadow = `0 0 ${10 + Math.random() * 20}px ${star.style.backgroundColor}`;
            star.style.zIndex = '9999';
            star.style.opacity = '0';
            star.style.pointerEvents = 'none';
            
            if (containerRef.current) {
              containerRef.current.appendChild(star);
              stars.push(star);
              
              // Animer chaque étoile
              gsap.to(star, {
                opacity: 0.8 + Math.random() * 0.2,
                top: `${Math.random() * 100}vh`,
                duration: 3 + Math.random() * 7,
                delay: Math.random() * 3,
                ease: "power1.inOut",
                onComplete: () => {
                  gsap.to(star, {
                    opacity: 0,
                    duration: 1,
                    delay: Math.random() * 2,
                    onComplete: () => star.remove()
                  });
                }
              });
            }
          }
        }
        break;

      case 'bubbles':
        // Effet de bulles qui montent
        {
          const bubblesCount = getParticleCount();
          const bubbles = [];
          
          for (let i = 0; i < bubblesCount; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            bubble.style.position = 'fixed';
            const size = 10 + Math.random() * 20;
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.border = `2px solid ${effectOptions.colors[Math.floor(Math.random() * effectOptions.colors.length)]}`;
            bubble.style.borderRadius = '50%';
            bubble.style.left = `${Math.random() * 100}vw`;
            bubble.style.bottom = `-50px`;
            bubble.style.zIndex = '9999';
            bubble.style.opacity = '0';
            bubble.style.pointerEvents = 'none';
            
            if (containerRef.current) {
              containerRef.current.appendChild(bubble);
              bubbles.push(bubble);
              
              // Animer chaque bulle
              gsap.to(bubble, {
                opacity: 0.5 + Math.random() * 0.3,
                bottom: `${50 + Math.random() * 50}vh`,
                x: (Math.random() - 0.5) * 100,
                duration: 3 + Math.random() * 4,
                delay: Math.random() * 3,
                ease: "power1.out",
                onComplete: () => {
                  gsap.to(bubble, {
                    opacity: 0,
                    scale: 1.5,
                    duration: 0.5,
                    onComplete: () => bubble.remove()
                  });
                }
              });
            }
          }
        }
        break;
      default:
        break;
    }

    // Nettoyer après la durée spécifiée
    const timer = setTimeout(() => {
      if (!completedRef.current && onComplete) {
        onComplete();
        completedRef.current = true;
      }
      
      if (canvasRef.current) {
        canvasRef.current.remove();
      }
    }, effectOptions.duration);

    return () => {
      clearTimeout(timer);
      if (canvasRef.current) {
        canvasRef.current.remove();
      }
    };
  }, [effect]);

  return createPortal(
    <div ref={containerRef} className="visual-effects-container" />,
    document.body
  );
};

// Hook pour utiliser l'effet facilement
export const useVisualEffect = () => {
  const [activeEffect, setActiveEffect] = React.useState<{
    type: EffectType;
    options?: VisualEffectOptions;
  } | null>(null);

  const playEffect = (effect: EffectType, options?: VisualEffectOptions) => {
    setActiveEffect({ type: effect, options });
  };

  const handleComplete = () => {
    setActiveEffect(null);
  };

  const EffectComponent = activeEffect ? (
    <VisualEffect
      effect={activeEffect.type}
      options={activeEffect.options}
      onComplete={handleComplete}
    />
  ) : null;

  return { playEffect, EffectComponent };
};

export default VisualEffect;
