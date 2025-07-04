import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, AlertCircle } from 'lucide-react';
import CountUp from 'react-countup';
import gsap from 'gsap';

interface CountdownTimerProps {
  expiresAt: Date | string | null;
  onExpired?: () => void;
  className?: string;
  showWarningAt?: number; // secondes à partir desquelles afficher un avertissement
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expiresAt,
  onExpired,
  className = "",
  showWarningAt = 60 // par défaut 60 secondes
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [hasExpired, setHasExpired] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  
  const timerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const warningShown = useRef<boolean>(false);
  
  useEffect(() => {
    if (!expiresAt) return;
    
    const expiryTime = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
    const currentTime = new Date();
    
    // Calculer le temps restant initial
    let remainingSeconds = Math.max(0, Math.floor((expiryTime.getTime() - currentTime.getTime()) / 1000));
    setTimeRemaining(remainingSeconds);
    
    // Si déjà expiré
    if (remainingSeconds <= 0) {
      setHasExpired(true);
      if (onExpired) onExpired();
      return;
    }
    
    // Configurer l'intervalle
    const timer = setInterval(() => {
      remainingSeconds -= 1;
      setTimeRemaining(remainingSeconds);
      
      // Afficher l'avertissement lorsque le temps atteint le seuil
      if (remainingSeconds <= showWarningAt && !warningShown.current) {
        setShowWarning(true);
        warningShown.current = true;
        
        // Animation d'alerte avec GSAP
        if (timerRef.current) {
          gsap.fromTo(
            timerRef.current,
            { scale: 1 },
            { 
              scale: 1.05, 
              duration: 0.3, 
              ease: "elastic.out(1, 0.3)",
              yoyo: true,
              repeat: 3
            }
          );
        }
      }
      
      // Gérer l'expiration
      if (remainingSeconds <= 0) {
        clearInterval(timer);
        setHasExpired(true);
        if (onExpired) onExpired();
      }
    }, 1000);
    
    // Animation du cercle de progression
    if (circleRef.current) {
      const totalTime = Math.floor((expiryTime.getTime() - currentTime.getTime()) / 1000);
      const circumference = 2 * Math.PI * 20; // rayon de 20 = circonférence
      
      gsap.to(circleRef.current, {
        strokeDashoffset: circumference,
        duration: totalTime,
        ease: "linear"
      });
    }
    
    // Nettoyage
    return () => clearInterval(timer);
  }, [expiresAt, onExpired, showWarningAt]);
  
  // Format du temps restant
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Déterminer la couleur en fonction du temps restant
  const getColorClass = () => {
    if (hasExpired) return 'text-red-500';
    if (showWarning) return 'text-amber-500';
    return 'text-green-500';
  };
  
  return (
    <div 
      ref={timerRef} 
      className={`relative transition-all ${className}`}
    >
      <Card className={`border ${showWarning ? 'border-amber-500 dark:border-amber-700' : ''}`}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Clock className={`mr-2 h-5 w-5 ${getColorClass()}`} />
            <span className="font-medium">Temps restant:</span>
          </div>
          
          <div className="flex items-center">
            <div className="relative w-10 h-10 mr-3">
              <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 50 50">
                {/* Cercle de fond */}
                <circle 
                  cx="25" 
                  cy="25" 
                  r="20" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  className="text-gray-200 dark:text-gray-700"
                />
                {/* Cercle de progression */}
                <circle 
                  ref={circleRef}
                  cx="25" 
                  cy="25" 
                  r="20" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset="0"
                  className={getColorClass()}
                />
              </svg>
              
              {/* Chiffre au centre */}
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                {Math.ceil(timeRemaining / 60)}
              </div>
            </div>
            
            <span className={`text-lg font-bold ${getColorClass()}`}>
              {!hasExpired ? (
                <CountUp 
                  start={timeRemaining + 1} 
                  end={timeRemaining} 
                  duration={0.5}
                  preserveValue
                  formattingFn={formatTime}
                />
              ) : (
                "Expiré"
              )}
            </span>
          </div>
        </CardContent>
      </Card>
      
      {/* Alerte lorsque le temps est presque écoulé */}
      {showWarning && !hasExpired && (
        <div className="mt-2 text-amber-600 dark:text-amber-400 text-sm flex items-start gap-1.5">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>Le temps est presque écoulé. Complétez votre paiement rapidement.</p>
        </div>
      )}
      
      {/* Message lorsque le temps est écoulé */}
      {hasExpired && (
        <div className="mt-2 text-red-600 dark:text-red-400 text-sm flex items-start gap-1.5">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>Le temps est écoulé. Veuillez réinitialiser la procédure de paiement.</p>
        </div>
      )}
    </div>
  );
};

export default CountdownTimer;
