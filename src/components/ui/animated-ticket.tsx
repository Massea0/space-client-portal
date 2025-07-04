import React, { useEffect, useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import gsap from 'gsap';

export interface AnimatedTicketProps {
  children: React.ReactNode;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed' | 'pending_admin_response' | 'pending_client_response' | string;
  priority?: 'low' | 'medium' | 'high' | 'urgent' | string;
  onClick?: () => void;
  className?: string;
  delay?: number;
  index?: number;
  hover?: boolean;
  withGlow?: boolean;
}

export const AnimatedTicket = ({
  children,
  status,
  priority,
  onClick,
  className,
  delay = 0,
  index = 0,
  hover = true,
  withGlow = true
}: AnimatedTicketProps) => {
  const ticketRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // Détermine les couleurs selon le statut
  const getStatusColor = () => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return 'from-green-400 to-emerald-500';
      case 'in_progress':
        return 'from-blue-400 to-cyan-500';
      case 'pending_admin_response':
      case 'pending_client_response':
        return 'from-yellow-400 to-amber-500';
      case 'open':
      default:
        return 'from-violet-400 to-purple-500';
    }
  };

  // Détermine les couleurs selon la priorité
  const getPriorityColor = () => {
    switch (priority) {
      case 'urgent':
        return 'from-red-400 to-rose-500';
      case 'high':
        return 'from-orange-400 to-amber-500';
      case 'medium':
        return 'from-yellow-400 to-amber-400';
      case 'low':
      default:
        return 'from-green-400 to-emerald-500';
    }
  };

  // Animation du ticket lorsqu'il apparaît
  useEffect(() => {
    if (ticketRef.current) {
      gsap.fromTo(
        ticketRef.current,
        {
          opacity: 0,
          y: 50,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          delay: delay + index * 0.1,
          ease: 'power2.out'
        }
      );
    }

    // Animation de l'effet de lueur si activé
    if (withGlow && glowRef.current) {
      gsap.fromTo(
        glowRef.current,
        {
          opacity: 0,
        },
        {
          opacity: priority === 'urgent' ? 0.7 : 0.4,
          duration: 0.8,
          delay: delay + index * 0.1 + 0.3,
          ease: 'power2.out'
        }
      );

      // Pulse animation pour les tickets urgents
      if (priority === 'urgent') {
        gsap.to(glowRef.current, {
          opacity: 0.3,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }
    }
  }, [delay, index, priority, withGlow]);

  // Variants pour les animations de hover avec Framer Motion
  const ticketVariants: Variants = {
    hover: {
      y: -5,
      boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <motion.div
      ref={ticketRef}
      className={cn("relative", className)}
      whileHover={hover ? 'hover' : undefined}
      whileTap={onClick ? 'tap' : undefined}
      variants={ticketVariants}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Effet de lueur */}
      {withGlow && (
        <div 
          ref={glowRef}
          className={cn(
            "absolute -inset-1 rounded-xl blur-xl opacity-0 z-0",
            "bg-gradient-to-r",
            priority ? getPriorityColor() : getStatusColor()
          )}
        />
      )}

      <Card className="relative z-10 overflow-hidden border transition-all duration-300 backdrop-blur-sm bg-card/95">
        {/* Barre de statut supérieure */}
        <div 
          className={cn(
            "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
            status ? getStatusColor() : "from-blue-400 to-cyan-500"
          )}
        />

        {/* Contenu du ticket */}
        <CardContent className="p-5">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AnimatedTicket;
