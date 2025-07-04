import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AnimatedNotification, NotificationType } from './animated-notification';
import { createPortal } from 'react-dom';
import { v4 as uuidv4 } from 'uuid';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

export type NotificationOptions = {
  message?: string;
  duration?: number;
  icon?: React.ReactNode;
};

// Singleton pour exposer les méthodes de notification à toute l'application
class NotificationManager {
  private static instance: NotificationManager;
  private listeners: Array<(notification: Notification) => void> = [];

  private constructor() {}

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  public addListener(listener: (notification: Notification) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public showNotification(notification: Notification) {
    if (!notification || typeof notification !== 'object') {
      console.error('Notification invalide:', notification);
      return;
    }
    
    // Copier la notification pour éviter les mutations
    const notificationCopy = { ...notification };
    
    // Vérifier si l'ID est défini
    if (!notificationCopy.id) {
      notificationCopy.id = uuidv4();
    }
    
    try {
      this.listeners.forEach(listener => {
        if (typeof listener === 'function') {
          listener(notificationCopy);
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'affichage de la notification:', error);
    }
  }

  public success(title: string, options?: NotificationOptions) {
    this.showNotification({
      id: uuidv4(),
      type: 'success',
      title,
      message: options?.message,
      duration: options?.duration
    });
  }

  public error(title: string, options?: NotificationOptions) {
    this.showNotification({
      id: uuidv4(),
      type: 'error',
      title,
      message: options?.message,
      duration: options?.duration
    });
  }

  public info(title: string, options?: NotificationOptions) {
    this.showNotification({
      id: uuidv4(),
      type: 'info',
      title,
      message: options?.message,
      duration: options?.duration
    });
  }

  public warning(title: string, options?: NotificationOptions) {
    this.showNotification({
      id: uuidv4(),
      type: 'warning',
      title,
      message: options?.message,
      duration: options?.duration
    });
  }
}

export const notificationManager = NotificationManager.getInstance();

interface NotificationProviderProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxNotifications?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  position = 'top-right',
  maxNotifications = 5
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Définir les classes de positionnement
  const positionClasses = {
    'top-right': 'top-4 right-4 flex flex-col items-end',
    'top-left': 'top-4 left-4 flex flex-col items-start',
    'bottom-right': 'bottom-4 right-4 flex flex-col items-end',
    'bottom-left': 'bottom-4 left-4 flex flex-col items-start',
    'top-center': 'top-4 left-1/2 -translate-x-1/2 flex flex-col items-center',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center'
  };

  // Écouter les nouvelles notifications
  useEffect(() => {
    const unsubscribe = notificationManager.addListener((notification) => {
      setNotifications(prev => [...prev, notification].slice(-maxNotifications));
    });

    return unsubscribe;
  }, [maxNotifications]);

  // Gérer la fermeture d'une notification
  const handleCloseNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Utiliser useState et useEffect pour gérer le montage sécurisé du portail
  const [isMounted, setIsMounted] = useState(false);
  
  // S'assurer que le portail n'est créé que côté client
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  // Créer le portail pour les notifications
  return (
    <>
      {children}
      {isMounted && typeof document !== 'undefined' && createPortal(
        <div className={`fixed z-50 gap-3 ${positionClasses[position]}`}>
          <AnimatePresence>
            {notifications.map((notification) => (
              <AnimatedNotification
                key={notification.id}
                id={notification.id}
                type={notification.type}
                title={notification.title}
                message={notification.message || ''}
                duration={notification.duration || 5000}
                onClose={handleCloseNotification}
              />
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </>
  );
};

export default NotificationProvider;
