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
            const redirectUrl = response.transaction.cashout_url || response.transaction.successUrl;
            if (redirectUrl) {
                console.log("[useDexchangePayment] Redirection URL:", redirectUrl);
            }
            toast.success("Paiement initié", {
                description: `ID Transaction: ${response.transaction.transactionId}`,
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