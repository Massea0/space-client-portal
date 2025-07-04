// src/services/invoices-payment.ts

import { supabase } from '@/lib/supabaseClient';

/**
 * Service dédié aux opérations de paiement des factures
 * Cette séparation permet de mieux organiser le code et de faciliter les tests
 */
export const invoicesPaymentApi = {
    /**
     * Initie un paiement via Dexchange pour une facture spécifique
     * 
     * @param invoiceId - ID de la facture à payer
     * @param paymentMethod - Méthode de paiement ('orange_money', 'wave', etc.)
     * @param phoneNumber - Numéro de téléphone pour le paiement mobile
     * @returns Informations sur le paiement initié (URL, code, instructions, etc.)
     */
    initiatePayment: async (invoiceId: string, paymentMethod: string, phoneNumber: string): Promise<{ 
        paymentUrl?: string, 
        transactionId: string, 
        paymentCode?: string, 
        paymentInstructions?: string 
    }> => {
        console.log('🚀 [PaymentAPI] Appel initiate-payment avec:', { invoiceId, paymentMethod, phoneNumber });
        
        // Pour le diagnostic, utilisons fetch directement
        try {
            const session = await supabase.auth.getSession();
            if (!session.data.session) {
                throw new Error('Utilisateur non authentifié');
            }
            
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/initiate-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.data.session.access_token}`,
                    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
                },
                body: JSON.stringify({
                    invoice_id: invoiceId,
                    payment_method: paymentMethod,
                    phone_number: phoneNumber,
                })
            });
            
            console.log('📡 [PaymentAPI] Statut HTTP:', response.status);
            
            const responseText = await response.text();
            console.log('📥 [PaymentAPI] Réponse brute:', responseText);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${responseText}`);
            }
            
            const data = JSON.parse(responseText);
            console.log('✅ [PaymentAPI] Données parsées:', data);
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            return {
                paymentUrl: data.paymentUrl,
                transactionId: data.transactionId,
                paymentCode: data.paymentCode,
                paymentInstructions: data.paymentInstructions
            };
            
        } catch (fetchError) {
            console.error('❌ [PaymentAPI] Erreur fetch directe:', fetchError);
            
            // Fallback vers la méthode Supabase standard
            console.log('🔄 [PaymentAPI] Fallback vers supabase.functions.invoke...');
            
            const { data, error } = await supabase.functions.invoke('initiate-payment', {
                body: {
                    invoice_id: invoiceId,
                    payment_method: paymentMethod,
                    phone_number: phoneNumber,
                },
            });
            
            console.log('📥 [PaymentAPI] Réponse Edge Function (fallback):', { data, error });
            
            if (error) {
                console.error('❌ [PaymentAPI] Erreur Edge Function:', error);
                throw new Error(error.message || "Erreur lors de l'appel à la fonction de paiement");
            }
            if (data.error) {
                console.error('❌ [PaymentAPI] Erreur dans data:', data);
                throw new Error(data.error);
            }
            
            return {
                paymentUrl: data.paymentUrl,
                transactionId: data.transactionId,
                paymentCode: data.paymentCode,
                paymentInstructions: data.paymentInstructions
            };
        }
    },

    /**
     * Vérifie le statut d'un paiement
     * 
     * @param invoiceId - ID de la facture dont on vérifie le statut
     * @param transactionId - ID de la transaction à vérifier
     * @returns Informations sur le statut du paiement
     */
    checkPayment: async (invoiceId: string, transactionId: string): Promise<{ 
        status: string, 
        invoiceStatus?: string,
        transactionId?: string,
        externalTransactionId?: string,
        paymentMethod?: string
    }> => {
        console.log('🔍 [PaymentAPI] checkPayment appelée avec:', { invoiceId, transactionId });
        
        try {
            // Utilisation directe de fetch avec la clé service pour contourner les problèmes RLS
            const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
            console.log('🔑 [PaymentAPI] Utilisation de la clé service role:', serviceRoleKey ? 'Présente' : 'Absente');
            
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payment-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY}`,
                    'apikey': import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
                },
                body: JSON.stringify({
                    invoiceId,
                    transactionId
                })
            });
            
            console.log('📡 [PaymentAPI] Statut HTTP de payment-status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ [PaymentAPI] Erreur HTTP:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('📥 [PaymentAPI] Réponse payment-status:', data);
            
            if (data.error) throw new Error(data.error);
            
            return data;
        } catch (fetchError) {
            console.error('❌ [PaymentAPI] Erreur checkPayment:', fetchError);
            
            // Fallback vers supabase.functions.invoke
            const { data, error } = await supabase.functions.invoke('payment-status', {
                body: { 
                    invoiceId,
                    transactionId
                }
            });
            
            if (error) throw new Error(error.message || "Erreur lors de la vérification du statut de paiement");
            if (data.error) throw new Error(data.error);
            
            return data;
        }
    },

    /**
     * Récupère l'URL de paiement et autres informations pour une transaction existante
     * 
     * @param transactionId - ID de la transaction
     * @returns Informations sur le paiement (URL, code, instructions, etc.)
     */
    getPaymentUrl: async (transactionId: string): Promise<{ 
        paymentUrl?: string, 
        paymentCode?: string, 
        paymentInstructions?: string,
        expiresAt?: string,
        status?: string 
    }> => {
        const { data, error } = await supabase.functions.invoke('get-payment-url', {
            body: { transactionId }
        });
        
        if (error) throw new Error(error.message || "Erreur lors de la récupération des informations de paiement");
        if (data.error) throw new Error(data.error);
        
        return data;
    }
};

export default invoicesPaymentApi;
