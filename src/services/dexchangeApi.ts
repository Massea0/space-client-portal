// src/services/dexchangeApi.ts
import {
    DexchangePaymentInitiationPayload,
    DexchangePaymentInitiationResponse,
    DexchangeTransactionStatusResponse,
    DexchangeBalanceResponse, // AJOUT
    DexchangeApiError,
} from '@/types/dexchange';

// Récupération des variables d'environnement
const VITE_DEXCHANGE_ENVIRONMENT = import.meta.env.VITE_DEXCHANGE_ENVIRONMENT;
const VITE_DEXCHANGE_API_KEY = import.meta.env.VITE_DEXCHANGE_API_KEY; // MODIFIÉ
const VITE_DEXCHANGE_API_URL_SANDBOX = import.meta.env.VITE_DEXCHANGE_API_URL_SANDBOX;
const VITE_DEXCHANGE_API_URL_PRODUCTION = import.meta.env.VITE_DEXCHANGE_API_URL_PRODUCTION;

const VITE_DEXCHANGE_SUCCESS_URL = import.meta.env.VITE_DEXCHANGE_SUCCESS_URL;
const VITE_DEXCHANGE_FAILURE_URL = import.meta.env.VITE_DEXCHANGE_FAILURE_URL;
const VITE_DEXCHANGE_CALLBACK_URL = import.meta.env.VITE_DEXCHANGE_CALLBACK_URL;

// Validation des variables d'environnement essentielles
if (!VITE_DEXCHANGE_ENVIRONMENT ||
    (VITE_DEXCHANGE_ENVIRONMENT === 'sandbox' && (!VITE_DEXCHANGE_API_KEY || !VITE_DEXCHANGE_API_URL_SANDBOX)) || // MODIFIÉ
    (VITE_DEXCHANGE_ENVIRONMENT === 'production' && (!VITE_DEXCHANGE_API_KEY || !VITE_DEXCHANGE_API_URL_PRODUCTION))) { // MODIFIÉ
    console.error("Configuration Dexchange manquante ou incomplète dans les variables d'environnement.");
}

const getDexchangeConfig = () => {
    const isProduction = VITE_DEXCHANGE_ENVIRONMENT === 'production';
    const apiKey = VITE_DEXCHANGE_API_KEY; // MODIFIÉ : Utilisation unique de VITE_DEXCHANGE_API_KEY
    const apiUrl = isProduction ? VITE_DEXCHANGE_API_URL_PRODUCTION : VITE_DEXCHANGE_API_URL_SANDBOX;

    if (!apiKey || !apiUrl) {
        throw new Error("Clé API Dexchange ou URL API non configurée pour l'environnement actuel.");
    }
    return { apiKey, apiUrl };
};

export function isDexchangeApiError(error: unknown): error is DexchangeApiError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as DexchangeApiError).message === 'string'
    );
}

async function fetchDexchangeApi<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const { apiKey, apiUrl } = getDexchangeConfig();
    const url = `${apiUrl}${endpoint}`;

    const headers = new Headers(options.headers || {});
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', apiKey); // MODIFIÉ : Envoi direct de la clé

    const config: RequestInit = {
        ...options,
        headers,
    };

    console.log(`[DexchangeAPI] Request: ${options.method || 'GET'} ${url}`, options.body ? { body: JSON.parse(options.body as string) } : {});

    try {
        const response = await fetch(url, config);
        const responseData = await response.json();

        console.log(`[DexchangeAPI] Response: ${response.status} ${url}`, responseData);

        if (!response.ok) {
            const apiError: DexchangeApiError = {
                message: responseData?.message || responseData?.error || `HTTP error ${response.status}`,
                code: responseData?.code || response.status,
                details: responseData?.details || responseData,
            };
            console.error('[DexchangeAPI] API Error:', apiError);
            throw apiError;
        }
        return responseData as T;
    } catch (error: unknown) {
        console.error('[DexchangeAPI] Network or Parsing Error:', error);
        if (isDexchangeApiError(error)) {
            throw error;
        }

        const errorMessage = (error instanceof Error) ? error.message : 'Erreur de communication avec Dexchange API.';
        let errorCode: string | number | undefined = 'NETWORK_ERROR';

        if (typeof error === 'object' && error !== null && 'code' in error) {
            const potentialCode = (error as { code: unknown }).code;
            if (typeof potentialCode === 'string' || typeof potentialCode === 'number') {
                errorCode = potentialCode;
            }
        }

        throw {
            message: errorMessage,
            code: errorCode,
        } as DexchangeApiError;
    }
}

export const dexchangeApi = {
    /**
     * Initialise une transaction de paiement.
     */
    initiatePayment: async (
        payload: DexchangePaymentInitiationPayload
    ): Promise<DexchangePaymentInitiationResponse> => {
        const fullPayload: DexchangePaymentInitiationPayload = {
            ...payload,
            callBackUrl: payload.callBackUrl || VITE_DEXCHANGE_CALLBACK_URL,
            successUrl: payload.successUrl || VITE_DEXCHANGE_SUCCESS_URL,
            failureUrl: payload.failureUrl || VITE_DEXCHANGE_FAILURE_URL,
        };

        Object.keys(fullPayload).forEach(key => {
            const K = key as keyof DexchangePaymentInitiationPayload;
            if (fullPayload[K] === undefined) {
                delete fullPayload[K];
            }
        });

        return fetchDexchangeApi<DexchangePaymentInitiationResponse>(
            '/transaction/init',
            {
                method: 'POST',
                body: JSON.stringify(fullPayload),
            }
        );
    },

    /**
     * Vérifie le statut d'une transaction existante.
     */
    getTransactionStatus: async (
        transactionId: string
    ): Promise<DexchangeTransactionStatusResponse> => {
        if (!transactionId) {
            throw new Error("L'ID de transaction est requis pour vérifier le statut.");
        }
        return fetchDexchangeApi<DexchangeTransactionStatusResponse>(
            `/transaction/${transactionId}`
        );
    },

    /**
     * Récupère le solde du compte Dexchange.
     */
    getBalance: async (): Promise<DexchangeBalanceResponse> => {
        return fetchDexchangeApi<DexchangeBalanceResponse>(
            '/api-services/balance'
        );
    },
};