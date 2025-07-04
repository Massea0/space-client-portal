import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';

interface PaymentInstructionsProps {
  title: string;
  instructions: string[];
  code?: string;
  onCopyCode?: () => void;
  codeCopied?: boolean;
  paymentMethod?: 'orange_money' | 'wave' | string;
  isActive?: boolean;
}

const PaymentInstructions: React.FC<PaymentInstructionsProps> = ({ 
  title, 
  instructions, 
  code, 
  onCopyCode, 
  codeCopied = false,
  paymentMethod,
  isActive = false
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const instructionsRef = useRef<HTMLUListElement>(null);
  
  // Animation GSAP à l'activation
  useEffect(() => {
    if (isActive && cardRef.current && instructionsRef.current) {
      // Animation de la carte
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
      
      // Animation séquentielle des éléments de la liste
      const listItems = instructionsRef.current.querySelectorAll('li');
      gsap.fromTo(
        listItems,
        { opacity: 0, x: -10 },
        { 
          opacity: 1, 
          x: 0, 
          stagger: 0.15, 
          duration: 0.3, 
          delay: 0.3,
          ease: "power1.out"
        }
      );
    }
  }, [isActive]);
  
  // Couleurs différentes selon la méthode de paiement
  const getBorderColor = () => {
    switch (paymentMethod) {
      case 'orange_money': return 'border-orange-500';
      case 'wave': return 'border-blue-500';
      default: return 'border-gray-200 dark:border-gray-800';
    }
  };
  
  return (
    <div ref={cardRef} className="space-y-4">
      <Card className={`overflow-hidden border-2 ${getBorderColor()}`}>
        <CardContent className="p-6">
          <motion.h3 
            className="font-semibold text-lg mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {title}
          </motion.h3>
          
          <ul ref={instructionsRef} className="space-y-3">
            {instructions.map((instruction, index) => (
              <motion.li 
                key={index}
                className="flex gap-3 items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={isActive ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: index * 0.15 + 0.2 }}
              >
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <span className="text-sm text-muted-foreground">{instruction}</span>
              </motion.li>
            ))}
          </ul>
          
          {code && (
            <motion.div 
              className="mt-6 p-3 bg-accent/50 rounded-md flex items-center justify-between"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isActive ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: instructions.length * 0.15 + 0.4 }}
            >
              <div className="font-mono text-sm md:text-base font-medium">
                {code}
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onCopyCode} 
                className="flex gap-1 items-center hover:bg-accent"
              >
                {codeCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="text-xs">{codeCopied ? 'Copié' : 'Copier'}</span>
              </Button>
            </motion.div>
          )}
          
          <motion.div 
            className="mt-6 p-3 bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 rounded-md flex items-start gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: instructions.length * 0.15 + 0.6 }}
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-xs">
              Si vous ne recevez pas le SMS ou si vous rencontrez des difficultés, veuillez vérifier votre numéro de téléphone et réessayer.
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentInstructions;
