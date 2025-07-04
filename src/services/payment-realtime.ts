// src/services/payment-realtime.ts

import { supabase } from '@/lib/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface PaymentStatusUpdate {
  invoiceId: string;
  transactionId: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  updatedAt: string;
  paymentMethod?: string;
  externalTransactionId?: string;
}

export class PaymentRealtimeService {
  private channel: RealtimeChannel | null = null;
  private listeners: Map<string, (update: PaymentStatusUpdate) => void> = new Map();

  /**
   * Démarre l'écoute en temps réel pour une facture spécifique
   */
  public subscribeToInvoice(invoiceId: string, callback: (update: PaymentStatusUpdate) => void): () => void {
    console.log('🔔 [PaymentRealtime] Souscription à la facture:', invoiceId);
    
    // Stocker le callback
    this.listeners.set(invoiceId, callback);

    // Créer un canal unique pour cette facture
    const channelName = `invoice-${invoiceId}`;
    
    if (!this.channel) {
      this.channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'invoices',
            filter: `id=eq.${invoiceId}`
          },
          (payload) => {
            console.log('📧 [PaymentRealtime] Mise à jour reçue:', payload);
            
            if (payload.new && payload.new.id) {
              const update: PaymentStatusUpdate = {
                invoiceId: payload.new.id,
                transactionId: payload.new.transaction_id || '',
                status: payload.new.status || 'pending',
                updatedAt: payload.new.updated_at || new Date().toISOString(),
                paymentMethod: payload.new.payment_method,
                externalTransactionId: payload.new.external_transaction_id
              };

              // Appeler le callback correspondant
              const listener = this.listeners.get(invoiceId);
              if (listener) {
                listener(update);
              }
            }
          }
        )
        .subscribe((status) => {
          console.log('🔔 [PaymentRealtime] Statut de souscription:', status);
        });
    }

    // Retourner une fonction de nettoyage
    return () => {
      console.log('🔕 [PaymentRealtime] Désabonnement de la facture:', invoiceId);
      this.listeners.delete(invoiceId);
      
      if (this.listeners.size === 0 && this.channel) {
        supabase.removeChannel(this.channel);
        this.channel = null;
      }
    };
  }

  /**
   * Démarre l'écoute en temps réel pour toutes les mises à jour de paiement
   */
  public subscribeToAllPayments(callback: (update: PaymentStatusUpdate) => void): () => void {
    console.log('🔔 [PaymentRealtime] Souscription à tous les paiements');
    
    const channel = supabase
      .channel('all-payments')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'invoices'
        },
        (payload) => {
          console.log('📧 [PaymentRealtime] Mise à jour globale reçue:', payload);
          
          if (payload.new && payload.new.id) {
            const update: PaymentStatusUpdate = {
              invoiceId: payload.new.id,
              transactionId: payload.new.transaction_id || '',
              status: payload.new.status || 'pending',
              updatedAt: payload.new.updated_at || new Date().toISOString(),
              paymentMethod: payload.new.payment_method,
              externalTransactionId: payload.new.external_transaction_id
            };

            callback(update);
          }
        }
      )
      .subscribe((status) => {
        console.log('🔔 [PaymentRealtime] Statut de souscription globale:', status);
      });

    // Retourner une fonction de nettoyage
    return () => {
      console.log('🔕 [PaymentRealtime] Désabonnement global');
      supabase.removeChannel(channel);
    };
  }

  /**
   * Nettoie toutes les souscriptions
   */
  public cleanup(): void {
    console.log('🧹 [PaymentRealtime] Nettoyage des souscriptions');
    this.listeners.clear();
    
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}

// Instance singleton
export const paymentRealtimeService = new PaymentRealtimeService();
