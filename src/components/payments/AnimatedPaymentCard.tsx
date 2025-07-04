import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import gsap from 'gsap';

interface AnimatedPaymentCardProps {
  children: React.ReactNode;
  isActive: boolean;
  delay?: number;
  className?: string;
}

const AnimatedPaymentCard: React.FC<AnimatedPaymentCardProps> = ({ 
  children, 
  isActive, 
  delay = 0,
  className = ""
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isActive && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { 
          y: 30, 
          opacity: 0,
          scale: 0.95
        },
        { 
          y: 0, 
          opacity: 1,
          scale: 1,
          duration: 0.8,
          delay: delay,
          ease: "power3.out"
        }
      );
      
      // Effet de brillance sur la bordure lors de l'activation
      gsap.fromTo(
        cardRef.current,
        { boxShadow: '0 0 0 rgba(56, 189, 248, 0)' },
        { 
          boxShadow: '0 0 15px rgba(56, 189, 248, 0.5), 0 0 5px rgba(56, 189, 248, 0.3)',
          duration: 1.5,
          delay: delay + 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut"
        }
      );
    }
  }, [isActive, delay]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      className={`relative ${className}`}
      whileHover={{ 
        y: -5,
        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
        transition: { duration: 0.3 } 
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="overflow-hidden border border-gray-200 dark:border-gray-800">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-300" />
        {children}
      </Card>
    </motion.div>
  );
};

export default AnimatedPaymentCard;
