// src/types/dexchange.ts

/**
 * Payload pour l'initialisation d'un paiement Dexchange.
 */
export interface DexchangePaymentInitiationPayload {
    externalTransactionId: string;
    serviceCode: string;
    amount: number;
    number: string;
    callBackUrl?: string;
    successUrl?: string;
    failureUrl?: string;
}

/**
 * Détails de la transaction retournés dans la réponse d'initialisation.
 */
export interface DexchangePaymentTransactionDetails {
    success: boolean;
    transactionId: string;
    externalTransactionId: string;
    transactionType: string;
    amount: number;
    transactionFee: number;
    number: string;
    callBackURL: string;
    successUrl: string;
    failureUrl: string;
    status: string;
    cashout_url: string;
    webhook: string;
}

/**
 * Réponse complète de l'API lors de l'initialisation d'un paiement.
 */
export interface DexchangePaymentInitiationResponse {
    message: string;
    transaction: DexchangePaymentTransactionDetails;
}

/**
 * Détails de la transaction retournés lors de la vérification du statut.
 */
export interface DexchangeTransactionStatusDetails {
    ServiceName: string;
    ServiceCode: string;
    Amount: number;
    Number: string;
    Status: "SUCCESS" | "FAILED" | "PENDING" | "INITIATED" | "EXPIRED" | "CANCELLED" | string;
    Initiated_at: string; // Date ISO
    Completed_at: string; // Date ISO
}

/**
 * Réponse complète de l'API lors de la vérification du statut d'une transaction.
 */
export interface DexchangeTransactionStatusResponse {
    message: string;
    transaction: DexchangeTransactionStatusDetails;
}

/**
 * Détails du solde retournés par l'API.
 */
export interface DexchangeBalanceDetails {
    success: boolean;
    balance: number;
    currency: string;
    lastUpdate: string; // Date ISO
}

/**
 * Réponse complète de l'API lors de la récupération du solde.
 */
export interface DexchangeBalanceResponse {
    message: string;
    balance: DexchangeBalanceDetails;
}


/**
 * Payload attendu pour le webhook (callback) de Dexchange.
 */
export interface DexchangeWebhookPayload {
    transactionId: string;
    externalTransactionId: string;
    status: "SUCCESS" | "FAILED" | string;
    amount: number;
    serviceCode: string;
    number: string;
    timestamp: string;
    signature?: string;
}

/**
 * Erreur structurée de l'API Dexchange.
 */
export interface DexchangeApiError {
    code?: string | number;
    message: string;
    details?: unknown;
}