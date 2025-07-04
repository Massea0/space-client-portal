// src/hooks/useDexchangePayment.ts
import {useState} from 'react';
import {dexchangeApi} from '@/services/dexchangeApi';
import {
    DexchangePaymentInitiationPayload,
    DexchangePaymentInitiationResponse,
    DexchangeTransactionStatusResponse,
    DexchangeBalanceResponse, // AJOUT
    DexchangeApiError,
} from '@/types/dexchange';
import { toast } from 'sonner';

interface UseDexchangePaymentReturn {
    initiatePayment: (payload: DexchangePaymentInitiationPayload) => Promise<DexchangePaymentInitiationResponse | null>;
    checkPaymentStatus: (transactionId: string) => Promise<DexchangeTransactionStatusResponse | null>;
    getBalance: () => Promise<DexchangeBalanceResponse | null>; // AJOUT
    isLoading: boolean;
    error: DexchangeApiError | null;
}

export const useDexchangePayment = (): UseDexchangePaymentReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<DexchangeApiError | null>(null);

    const initiatePayment = async (
        payload: DexchangePaymentInitiationPayload
    ): Promise<DexchangePaymentInitiationResponse | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await dexchangeApi.initiatePayment(payload);
            
            // Vérifier si c'est Orange Money (qui n'utilise pas d'URL de paiement)
            const isOrangeMoney = payload.paymentMethod === 'orange_money';
            
            // Pour Orange Money, pas besoin d'URL de redirection
            const redirectUrl = response.transaction.cashout_url || response.transaction.successUrl;
            
            if (redirectUrl) {
                console.log("[useDexchangePayment] Redirection URL:", redirectUrl);
            } else if (isOrangeMoney) {
                console.log("[useDexchangePayment] Paiement Orange Money initié - pas d'URL nécessaire");
            }
            
            toast.success("Paiement initié", {
                description: `ID Transaction: ${response.transaction.transactionId}${isOrangeMoney ? ' (Orange Money SMS)' : ''}`,
            });
            
            return response;
        } catch (err) {
            const apiError = err as DexchangeApiError;
            setError(apiError);
            toast.error("Erreur d'initiation", { description: apiError.message });
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const checkPaymentStatus = async (
        transactionId: string
    ): Promise<DexchangeTransactionStatusResponse | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await dexchangeApi.getTransactionStatus(transactionId);
            toast("Statut vérifié", {
                description: `Statut pour ${transactionId}: ${response.transaction.Status}`,
            });
            return response;
        } catch (err) {
            const apiError = err as DexchangeApiError;
            setError(apiError);
            toast.error("Erreur de vérification", { description: apiError.message });
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const getBalance = async (): Promise<DexchangeBalanceResponse | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await dexchangeApi.getBalance();
            toast.success("Solde récupéré", {
                description: `Solde: ${response.balance.balance} ${response.balance.currency}`,
            });
            return response;
        } catch (err) {
            const apiError = err as DexchangeApiError;
            setError(apiError);
            toast.error("Erreur de récupération du solde", { description: apiError.message });
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        initiatePayment,
        checkPaymentStatus,
        getBalance, // AJOUT
        isLoading,
        error,
    };
};