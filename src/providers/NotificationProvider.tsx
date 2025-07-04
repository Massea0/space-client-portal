import React from 'react';
import { NotificationProvider as AnimatedNotificationProvider } from '@/components/ui/notification-provider';

/**
 * Provider global pour les notifications animées.
 * À inclure dans le composant racine de l'application.
 */
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AnimatedNotificationProvider position="top-right" maxNotifications={5}>
      {children}
    </AnimatedNotificationProvider>
  );
};

export default NotificationProvider;
