import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';
import confetti from 'canvas-confetti';

interface PaymentSuccessProps {
  amount: number | string;
  invoiceNumber?: string;
  transactionId?: string;
  onContinue?: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  amount,
  invoiceNumber,
  transactionId,
  onContinue
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const checkmarkRef = useRef<SVGSVGElement>(null);
  const amountRef = useRef<HTMLDivElement>(null);
  
  // Lancer le confetti à l'affichage
  useEffect(() => {
    // Initialiser le confetti
    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.style.position = 'fixed';
      canvas.style.inset = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '9999';
      document.body.appendChild(canvas);
      
      // Créer l'instance de confetti
      const myConfetti = confetti.create(canvas, {
        resize: true,
        useWorker: true
      });
      
      // Premier éclatement au centre
      myConfetti({
        particleCount: 100,
        spread: 160,
        origin: { y: 0.6, x: 0.5 }
      });
      
      // Deux autres éclatements aux coins
      setTimeout(() => {
        myConfetti({
          particleCount: 50,
          angle: 60,
          spread: 80,
          origin: { x: 0, y: 0.7 }
        });
      }, 500);
      
      setTimeout(() => {
        myConfetti({
          particleCount: 50,
          angle: 120,
          spread: 80,
          origin: { x: 1, y: 0.7 }
        });
      }, 800);
      
      // Nettoyage
      return () => {
        document.body.removeChild(canvas);
      };
    }, 600);
  }, []);
  
  // Animation GSAP
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.8, ease: "elastic.out(1, 0.5)" }
      );
    }
    
    if (checkmarkRef.current) {
      // Animation du cercle
      gsap.fromTo(
        checkmarkRef.current,
        { scale: 0, opacity: 0 },
        { 
          scale: 1, 
          opacity: 1, 
          duration: 0.7, 
          delay: 0.3,
          ease: "back.out(1.7)" 
        }
      );
      
      // Animation de rotation
      gsap.fromTo(
        checkmarkRef.current,
        { rotate: -90 },
        { 
          rotate: 0,
          duration: 0.7,
          delay: 0.3,
          ease: "back.out(1.7)" 
        }
      );
    }
    
    if (amountRef.current) {
      gsap.fromTo(
        amountRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.8, ease: "power3.out" }
      );
    }
  }, []);
  
  return (
    <div ref={containerRef} className="py-8 px-4">
      <div className="flex flex-col items-center text-center space-y-8">
        {/* Icône de succès */}
        <div className="relative w-24 h-24 mb-4">
          <div className="absolute inset-0 bg-green-100 dark:bg-green-900/30 rounded-full animate-pulse" />
          <div className="absolute inset-2 bg-green-200 dark:bg-green-800/30 rounded-full" />
          <CheckCircle
            ref={checkmarkRef}
            className="absolute inset-0 w-full h-full text-green-500 dark:text-green-400"
          />
        </div>
        
        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="space-y-2 mb-6"
        >
          <h2 className="text-2xl font-bold text-center">Paiement effectué avec succès!</h2>
          <p className="text-muted-foreground">
            Votre transaction a été traitée et confirmée.
          </p>
        </motion.div>
        
        {/* Montant */}
        <motion.div
          ref={amountRef}
          className="py-6 px-10 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-800"
        >
          <div className="text-xs text-muted-foreground mb-1">Montant payé</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {typeof amount === 'number' 
              ? new Intl.NumberFormat('fr-SN', { 
                  style: 'currency', 
                  currency: 'XOF',
                  maximumFractionDigits: 0 
                }).format(amount)
              : amount}
          </div>
        </motion.div>
        
        {/* Détails */}
        <motion.div 
          className="w-full space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          {invoiceNumber && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">N° de facture:</span>
              <span className="font-medium">{invoiceNumber}</span>
            </div>
          )}
          {transactionId && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">N° de transaction:</span>
              <span className="font-medium font-mono text-xs">{transactionId}</span>
            </div>
          )}
        </motion.div>
        
        {/* Bouton */}
        <motion.div 
          className="w-full pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <Button 
            onClick={onContinue} 
            className="w-full bg-green-500 hover:bg-green-600 text-white"
            size="lg"
          >
            Continuer
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
