// src/components/ui/ConnectionStatusIndicator.tsx
// Indicateur de statut de connexion affiché lorsque l'utilisateur est hors ligne

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { notificationManager } from './notification-provider';

export const ConnectionStatusIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOffline, setShowOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
      notificationManager.success('Connexion rétablie', {
        message: 'Vous êtes maintenant connecté à Internet'
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOffline(true);
      notificationManager.warning('Connexion perdue', {
        message: 'Vérifiez votre connexion Internet'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <AnimatePresence>
      {(!isOnline || showReconnected) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={cn(
            "fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2",
            isOnline 
              ? "bg-green-100 text-green-800 border border-green-200" 
              : "bg-red-100 text-red-800 border border-red-200"
          )}
        >
          {isOnline ? (
            <>
              <Wifi size={16} className="text-green-600" />
              <span className="font-medium">Connexion rétablie</span>
            </>
          ) : (
            <>
              <WifiOff size={16} className="text-red-600" />
              <span className="font-medium">Vous êtes hors ligne</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionStatusIndicator;
