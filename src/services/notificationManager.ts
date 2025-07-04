// src/services/notificationManager.ts
// Service de gestion des notifications pour l'interface admin

export interface NotificationConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

class NotificationManager {
  private notifications: NotificationConfig[] = [];
  private listeners: ((notifications: NotificationConfig[]) => void)[] = [];

  /**
   * Ajouter une notification
   */
  add(notification: NotificationConfig) {
    const notif = {
      ...notification,
      duration: notification.duration ?? 5000
    };
    
    this.notifications.push(notif);
    this.notifyListeners();

    // Auto-suppression après durée spécifiée
    if (notif.duration > 0) {
      setTimeout(() => {
        this.remove(notif);
      }, notif.duration);
    }
  }

  /**
   * Supprimer une notification
   */
  remove(notification: NotificationConfig) {
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.notifyListeners();
    }
  }

  /**
   * Obtenir toutes les notifications
   */
  getAll(): NotificationConfig[] {
    return [...this.notifications];
  }

  /**
   * Effacer toutes les notifications
   */
  clear() {
    this.notifications = [];
    this.notifyListeners();
  }

  /**
   * S'abonner aux changements
   */
  subscribe(listener: (notifications: NotificationConfig[]) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Méthodes de convenance
  success(title: string, message: string, duration?: number) {
    this.add({ type: 'success', title, message, duration });
  }

  error(title: string, message: string, duration?: number) {
    this.add({ type: 'error', title, message, duration });
  }

  warning(title: string, message: string, duration?: number) {
    this.add({ type: 'warning', title, message, duration });
  }

  info(title: string, message: string, duration?: number) {
    this.add({ type: 'info', title, message, duration });
  }
}

export const notificationManager = new NotificationManager();
