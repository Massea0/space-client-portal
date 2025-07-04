import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import gsap from 'gsap';
import { Badge } from '@/components/ui/badge';

type PaymentStatus = 'pending' | 'processing' | 'success' | 'error';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  animate?: boolean;
}

// Animation variants pour Framer Motion
const badgeVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { 
      type: "spring" as const,
      stiffness: 300,
      damping: 15
    } 
  }
};

// Type pour la configuration des statuts
interface StatusConfigType {
  icon: typeof Clock | typeof RefreshCw | typeof CheckCircle | typeof AlertCircle;
  color: string;
  text: string;
  animation: 'pulse' | 'spin' | 'flash' | 'shake';
}

// Configuration des statuts
const statusConfig: Record<PaymentStatus, StatusConfigType> = {
  pending: {
    icon: Clock,
    color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    text: "En attente",
    animation: 'pulse'
  },
  processing: {
    icon: RefreshCw,
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    text: "En cours",
    animation: 'spin'
  },
  success: {
    icon: CheckCircle,
    color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    text: "Réussi",
    animation: 'flash'
  },
  error: {
    icon: AlertCircle,
    color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    text: "Échec",
    animation: 'shake'
  }
};

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status, animate = true }) => {
  const config = statusConfig[status];
  const IconComponent = config.icon;
  const badgeRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!animate || !badgeRef.current) return;
    
    // Animation différente selon le statut
    if (status === 'success' && config.animation === 'flash') {
      gsap.fromTo(
        badgeRef.current,
        { backgroundColor: 'rgba(34, 197, 94, 0.3)' },
        { 
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          duration: 1,
          repeat: 1,
          yoyo: true,
          ease: "power2.inOut"
        }
      );
      
      if (iconRef.current) {
        gsap.fromTo(
          iconRef.current,
          { scale: 1 },
          { 
            scale: 1.3, 
            duration: 0.5, 
            ease: "elastic.out(1, 0.3)",
            delay: 0.2,
            yoyo: true,
            repeat: 1
          }
        );
      }
    }
    
    if (status === 'error' && config.animation === 'shake') {
      gsap.fromTo(
        badgeRef.current,
        { x: 0 },
        { 
          x: 5, // valeur simple pour commencer
          duration: 0.1, 
          repeat: 5,
          yoyo: true,
          ease: "power1.inOut" 
        }
      );
    }
  }, [status, config, animate]);
  
  return (
    <motion.div
      ref={badgeRef}
      className={`inline-flex items-center px-3 py-1 rounded-full ${config.color} text-sm font-medium`}
      initial="hidden"
      animate="visible"
      variants={badgeVariants}
    >
      <IconComponent 
        ref={iconRef} 
        className={`w-4 h-4 mr-1.5 ${config.animation === 'spin' ? 'animate-spin' : ''} ${config.animation === 'pulse' ? 'animate-pulse' : ''}`} 
      />
      {config.text}
    </motion.div>
  );
};

export default PaymentStatusBadge;
