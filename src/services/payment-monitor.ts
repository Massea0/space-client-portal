// src/services/payment-monitor.ts

import { invoicesPaymentApi } from './invoices-payment';
import { paymentRealtimeService, PaymentStatusUpdate } from './payment-realtime';

export interface PaymentMonitorConfig {
  pollingInterval?: number;
  maxPollingDuration?: number;
  enableRealtime?: boolean;
  onStatusChange?: (status: PaymentStatusUpdate) => void;
  onError?: (error: Error) => void;
}

export class PaymentMonitor {
  private invoiceId: string;
  private transactionId: string;
  private config: Required<PaymentMonitorConfig>;
  private pollingInterval: NodeJS.Timeout | null = null;
  private realtimeUnsubscribe: (() => void) | null = null;
  private startTime: number = 0;
  private isRunning: boolean = false;
  private attemptCount: number = 0;
  private maxAttempts: number = 15; // Limite à 15 tentatives (environ 1.5 minutes avec intervalle de 5s)

  constructor(invoiceId: string, transactionId: string, config: PaymentMonitorConfig = {}) {
    this.invoiceId = invoiceId;
    this.transactionId = transactionId;
    this.config = {
      pollingInterval: config.pollingInterval || 5000,
      maxPollingDuration: config.maxPollingDuration || 600000, // 10 minutes
      enableRealtime: config.enableRealtime ?? true,
      onStatusChange: config.onStatusChange || (() => {}),
      onError: config.onError || (() => {})
    };
  }

  /**
   * Démarre la surveillance du paiement
   */
  public start(): void {
    if (this.isRunning) {
      console.log('⚠️ [PaymentMonitor] Surveillance déjà en cours');
      return;
    }

    console.log('🚀 [PaymentMonitor] Démarrage de la surveillance:', {
      invoiceId: this.invoiceId,
      transactionId: this.transactionId,
      config: this.config
    });

    this.isRunning = true;
    this.startTime = Date.now();

    // Vérification initiale
    this.checkPaymentStatus();

    // Démarrer le polling
    this.startPolling();

    // Démarrer les notifications temps réel si activées
    if (this.config.enableRealtime) {
      this.startRealtime();
    }
  }

  /**
   * Arrête la surveillance du paiement
   */
  public stop(): void {
    if (!this.isRunning) return;

    console.log('🛑 [PaymentMonitor] Arrêt de la surveillance');

    this.isRunning = false;

    // Arrêter le polling
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    // Arrêter les notifications temps réel
    if (this.realtimeUnsubscribe) {
      this.realtimeUnsubscribe();
      this.realtimeUnsubscribe = null;
    }
  }

  /**
   * Vérifie le statut du paiement une fois
   */
  private async checkPaymentStatus(): Promise<void> {
    try {
      console.log('🔍 [PaymentMonitor] Vérification du statut...');
      
      this.attemptCount++;
      
      const status = await invoicesPaymentApi.checkPayment(this.invoiceId, this.transactionId);
      
      console.log(`📊 [PaymentMonitor] Statut reçu (tentative ${this.attemptCount}/${this.maxAttempts}):`, status);

      const update: PaymentStatusUpdate = {
        invoiceId: this.invoiceId,
        transactionId: this.transactionId,
        status: status.status as any,
        updatedAt: new Date().toISOString(),
        paymentMethod: status.paymentMethod,
        externalTransactionId: status.externalTransactionId
      };

      this.config.onStatusChange(update);

      // Arrêter la surveillance si le paiement est finalisé
      if (status.status === 'paid' || status.status === 'failed') {
        console.log('✅ [PaymentMonitor] Paiement finalisé, arrêt de la surveillance');
        this.stop();
        return;
      }

      // Arrêter si on a atteint le nombre maximum de tentatives
      if (this.attemptCount >= this.maxAttempts) {
        console.log('⏰ [PaymentMonitor] Nombre maximum de tentatives atteint, arrêt de la surveillance');
        console.log('💡 [PaymentMonitor] Le paiement pourrait être en cours. Vérifiez manuellement ou utilisez le débogueur.');
        this.config.onError(new Error(`Surveillance interrompue après ${this.maxAttempts} tentatives. Le paiement pourrait être en cours.`));
        this.stop();
        return;
      }

    } catch (error) {
      console.error('❌ [PaymentMonitor] Erreur lors de la vérification:', error);
      this.config.onError(error as Error);
    }
  }

  /**
   * Démarre le polling intelligent avec exponential backoff
   */
  private startPolling(): void {
    let currentInterval = this.config.pollingInterval;
    let consecutiveErrors = 0;

    const poll = async () => {
      if (!this.isRunning) return;

      // Vérifier le timeout
      const elapsed = Date.now() - this.startTime;
      if (elapsed > this.config.maxPollingDuration) {
        console.log('⏰ [PaymentMonitor] Timeout atteint, arrêt de la surveillance');
        this.config.onError(new Error('Timeout de surveillance atteint'));
        this.stop();
        return;
      }

      try {
        await this.checkPaymentStatus();
        consecutiveErrors = 0;
        currentInterval = this.config.pollingInterval; // Reset interval on success
      } catch (error) {
        consecutiveErrors++;
        
        // Exponential backoff en cas d'erreurs répétées
        if (consecutiveErrors > 1) {
          currentInterval = Math.min(currentInterval * 1.5, 30000); // Max 30s
          console.log(`📈 [PaymentMonitor] Augmentation de l'intervalle à ${currentInterval}ms après ${consecutiveErrors} erreurs`);
        }
      }

      // Programmer la prochaine vérification
      if (this.isRunning) {
        this.pollingInterval = setTimeout(poll, currentInterval);
      }
    };

    // Démarrer le polling
    this.pollingInterval = setTimeout(poll, this.config.pollingInterval);
  }

  /**
   * Démarre les notifications temps réel
   */
  private startRealtime(): void {
    try {
      this.realtimeUnsubscribe = paymentRealtimeService.subscribeToInvoice(
        this.invoiceId,
        (update) => {
          console.log('⚡ [PaymentMonitor] Notification temps réel reçue:', update);
          
          // Vérifier que c'est bien notre transaction
          if (update.transactionId === this.transactionId || !update.transactionId) {
            this.config.onStatusChange(update);
            
            // Arrêter la surveillance si le paiement est finalisé
            if (update.status === 'paid' || update.status === 'failed') {
              console.log('⚡ [PaymentMonitor] Paiement finalisé via notification temps réel');
              this.stop();
            }
          }
        }
      );
    } catch (error) {
      console.error('❌ [PaymentMonitor] Erreur lors du démarrage des notifications temps réel:', error);
      this.config.onError(error as Error);
    }
  }

  /**
   * Indique si la surveillance est en cours
   */
  public get running(): boolean {
    return this.isRunning;
  }

  /**
   * Temps écoulé depuis le démarrage (en ms)
   */
  public get elapsedTime(): number {
    return this.isRunning ? Date.now() - this.startTime : 0;
  }
}
