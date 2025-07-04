// src/components/payments/DexchangePaymentModal.tsx
/**
 * @deprecated Ce composant sera remplacé par AnimatedPaymentModal dans une future mise à jour.
 * Il est maintenu pour assurer la compatibilité avec le code existant.
 * Voir le plan de finalisation des animations pour plus de détails.
 */

import React, { useState, useEffect, memo, useCallback, useRef } from 'react';
import { Invoice } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Utilisation de SafeModal correctement implémentée
import SafeModal from '@/components/ui/safe-modal';
import { toast } from 'sonner';
import { invoicesPaymentApi } from '@/services/invoices-payment';
import { formatCurrency, formatPhoneNumber } from '@/lib/utils';
import { 
    AlertCircle, 
    CheckCircle2, 
    CheckCircle,
    Loader2, 
    RefreshCw, 
    Clock, 
    Copy, 
    ExternalLink, 
    RotateCw, 
    LinkIcon, 
    SmartphoneIcon
} from 'lucide-react';
import { errorReporter } from '@/lib/errorReporter';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/lib/supabaseClient';
import { notificationManager } from '@/components/ui/notification-provider';

// Importez vos logos depuis le dossier assets
import WaveLogo from '@/assets/images/wave.png';
import OrangeMoneyLogo from '@/assets/images/om.png';
import WizallLogo from '@/assets/images/wizall.png';

interface DexchangePaymentModalProps {
    invoice: Invoice | null;
    onClose: () => void;
    onPaymentSuccess: (invoiceId: string, method: string, phone?: string) => void;
    isOpen: boolean; // Prop ajouté pour la compatibilité avec SafeModal
}

// Définition des méthodes de paiement avec leurs logos
const paymentMethods = [
    { value: 'orange_money', label: 'Orange Money', logo: OrangeMoneyLogo, description: 'Paiement par SMS Orange Money' },
    { value: 'wave', label: 'Wave', logo: WaveLogo, description: 'Paiement rapide via Wave' },
];

// Type pour s'assurer que seules les valeurs valides sont utilisées
type PaymentMethodType = 'wave' | 'orange_money' | 'wizall' | '';

// Type pour les différentes étapes du processus de paiement
type PaymentStep = 'input' | 'waiting' | 'error' | 'success';

// Type pour indiquer le mode d'instruction de paiement
type PaymentInstructionMode = 'url' | 'sms' | 'none';

// Structure pour stocker les transactions en attente
interface PendingTransaction {
    transactionId: string;
    invoiceId: string;
    paymentMethod: PaymentMethodType;
    phoneNumber: string;
    timestamp: string;
    expiresAt: string;
    checkCount?: number;
    lastCheck?: string;
    paymentUrl?: string;
    paymentCode?: string;
    paymentReference?: string;
    paymentInstructions?: string;
}

// Structure pour les informations de paiement retournées par l'API
interface PaymentInfo {
    paymentUrl: string;
    transactionId: string;
    status: string;
    expiresAt: string;
    paymentCode?: string;
    paymentProvider?: string;
    paymentReference?: string;
    paymentInstructions?: string;
    phoneNumber?: string;
}

// Composant de méthode de paiement mémorisé pour éviter les re-rendus inutiles
const PaymentMethodButton = memo(({ 
    method, 
    selected, 
    disabled, 
    onClick 
}: { 
    method: typeof paymentMethods[0], 
    selected: boolean, 
    disabled: boolean, 
    onClick: () => void 
}) => {
    return (
        <Button
            type="button"
            variant={selected ? 'default' : 'outline'}
            onClick={onClick}
            className="flex flex-col items-center h-24 w-24 p-2 relative transition-all"
            disabled={disabled}
        >
            <img src={method.logo} alt={method.label} className="h-10 w-10 object-contain mb-2" />
            <span className="text-xs">{method.label}</span>
            {selected && (
                <span className="absolute -top-1 -right-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                </span>
            )}
        </Button>
    );
});
PaymentMethodButton.displayName = 'PaymentMethodButton';

function DexchangePaymentModal({ invoice, onClose, onPaymentSuccess, isOpen }: DexchangePaymentModalProps) {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showStatusCheck, setShowStatusCheck] = useState(false);
    const [paymentStep, setPaymentStep] = useState<PaymentStep>('input');
    const [backoffDelay, setBackoffDelay] = useState(5); // Délai initial de 5 secondes
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [paymentCode, setPaymentCode] = useState<string | null>(null);
    const [paymentInstructions, setPaymentInstructions] = useState<string | null>(null);
    const [popupBlocked, setPopupBlocked] = useState(false);
    const [urlCopied, setUrlCopied] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);
    const [paymentInstructionMode, setPaymentInstructionMode] = useState<PaymentInstructionMode>('none');
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null); // Compteur de temps restant
    const [networkErrorCount, setNetworkErrorCount] = useState(0); // Compteur d'erreurs réseau
    const isMobile = useIsMobile();
    
    const checkIntervalRef = useRef<number | null>(null);
    const countdownIntervalRef = useRef<number | null>(null); // Référence pour l'intervalle de compte à rebours
    const checkAttemptsRef = useRef(0);
    const transactionRef = useRef<PendingTransaction | null>(null);

    // Fonction utilitaire pour capturer les erreurs avec contexte
    const captureError = useCallback((error: unknown, action: string, extraContext = {}) => {
        // Créer un message d'erreur détaillé si c'est un objet Error
        const errorMessage = error instanceof Error 
            ? `${error.name}: ${error.message}` 
            : String(error);
        
        // Log local pour le débogage
        console.error(`[DexchangePaymentModal] Error in ${action}:`, error);
        
        // Rapport d'erreur structuré avec le contexte de la transaction
        errorReporter.captureException(error, {
            component: 'DexchangePaymentModal',
            action,
            invoiceId: invoice?.id,
            paymentMethod,
            transactionId: transactionRef.current?.transactionId,
            errorMessage,
            checkAttempts: checkAttemptsRef.current,
            ...extraContext
        });
        
        return errorMessage;
    }, [invoice, paymentMethod]);
    
    // Fonction de validation du numéro de téléphone (avec support pour différents pays)
    const isValidPhoneNumber = useCallback((phone: string, country: string = 'senegal'): boolean => {
        if (!phone || phone.trim() === '') return false;
        
        const phoneRegex = {
            senegal: /^(77|78|76|70|75)\d{7}$/,
            mali: /^(7[0-9])\d{7}$/,
            ivorycoast: /^(0[1-7][0-9])\d{7}$/,
            // Ajouter d'autres pays selon les besoins
        };
        
        const selectedRegex = phoneRegex[country as keyof typeof phoneRegex] || phoneRegex.senegal;
        return selectedRegex.test(phone.replace(/[^0-9]/g, ''));
    }, []);
    
    // Vérifier si une transaction est en attente au chargement
    useEffect(() => {
        const pendingPayment = localStorage.getItem('pendingPaymentTransaction');
        
        if (pendingPayment && invoice) {
            try {
                const parsedPayment = JSON.parse(pendingPayment) as PendingTransaction;
                const { invoiceId, transactionId } = parsedPayment;
                
                // Vérifier que la transaction concerne bien cette facture
                if (invoiceId === invoice.id) {
                    transactionRef.current = parsedPayment;
                    
                    // Récupérer les informations de paiement supplémentaires si présentes
                    if (parsedPayment.paymentUrl) {
                        setPaymentUrl(parsedPayment.paymentUrl);
                    }
                    
                    if (parsedPayment.paymentMethod) {
                        setPaymentMethod(parsedPayment.paymentMethod);
                    }
                    
                    if (parsedPayment.phoneNumber) {
                        setPhoneNumber(parsedPayment.phoneNumber);
                    }
                    
                    // Vérifier si le paiement est en cours
                    checkPaymentStatus(transactionId);
                    setPaymentStep('waiting');
                }
            } catch (error) {
                captureError(error, 'loadPendingTransaction');
                // En cas d'erreur, supprimer la transaction en attente pour éviter des problèmes
                localStorage.removeItem('pendingPaymentTransaction');
            }
        }
    }, [invoice, captureError]);

    // Utilisation de l'effet pour mettre en place les vérifications périodiques du statut de paiement
    useEffect(() => {
        // Nettoyer les intervalles précédents si nécessaire
        const cleanupIntervals = () => {
            if (checkIntervalRef.current !== null) {
                clearInterval(checkIntervalRef.current);
                checkIntervalRef.current = null;
            }
            
            if (countdownIntervalRef.current !== null) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
            }
        };
        
        if (paymentStep === 'waiting' && transactionRef.current) {
            // Configurer l'intervalle pour vérifier le statut du paiement
            checkIntervalRef.current = window.setInterval(() => {
                checkPaymentStatus(transactionRef.current?.transactionId || '');
            }, backoffDelay * 1000);
            
            // Configurer le compte à rebours pour l'expiration
            startExpirationCountdown();
        } else {
            cleanupIntervals();
        }
        
        return cleanupIntervals;
    }, [paymentStep, backoffDelay]);
    
    // Fonction pour initialiser le compte à rebours d'expiration
    const startExpirationCountdown = () => {
        if (!transactionRef.current?.expiresAt) return;
        
        const expiresAt = new Date(transactionRef.current.expiresAt).getTime();
        
        // Fonction pour mettre à jour le temps restant
        const updateTimeRemaining = () => {
            const now = Date.now();
            const diff = Math.max(0, expiresAt - now);
            
            if (diff <= 0) {
                // La transaction a expiré
                setTimeRemaining(0);
                handleExpiredTransaction();
                
                if (countdownIntervalRef.current !== null) {
                    clearInterval(countdownIntervalRef.current);
                    countdownIntervalRef.current = null;
                }
            } else {
                setTimeRemaining(Math.floor(diff / 1000));
            }
        };
        
        // Mettre à jour immédiatement, puis définir l'intervalle
        updateTimeRemaining();
        
        countdownIntervalRef.current = window.setInterval(updateTimeRemaining, 1000);
    };
    
    // Gérer une transaction expirée
    const handleExpiredTransaction = useCallback(() => {
        if (paymentStep === 'waiting') {
            setPaymentStep('error');
            localStorage.removeItem('pendingPaymentTransaction');
            
            toast.error(
                "Le délai de paiement a expiré. Veuillez relancer le processus de paiement.",
                { duration: 5000 }
            );
        }
    }, [paymentStep]);

    // Fonction pour copier le texte dans le presse-papiers
    const copyToClipboard = useCallback(async (text: string, type: 'url' | 'code') => {
        try {
            await navigator.clipboard.writeText(text);
            
            if (type === 'url') {
                setUrlCopied(true);
                setTimeout(() => setUrlCopied(false), 2000);
            } else {
                setCodeCopied(true);
                setTimeout(() => setCodeCopied(false), 2000);
            }
            
            toast.success(`${type === 'url' ? "Lien" : "Code"} copié dans le presse-papiers`);
        } catch (error) {
            captureError(error, 'copyToClipboard');
            toast.error(`Impossible de copier le ${type === 'url' ? "lien" : "code"}`);
        }
    }, [captureError]);
    
    // Fonction pour ouvrir le lien de paiement
    const openPaymentUrl = useCallback(() => {
        if (!paymentUrl) return;
        
        try {
            // Tenter d'ouvrir une nouvelle fenêtre
            const newWindow = window.open(paymentUrl, '_blank');
            
            // Vérifier si la fenêtre a été bloquée
            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                setPopupBlocked(true);
                toast.error("L'ouverture automatique semble bloquée par votre navigateur", {
                    description: "Veuillez autoriser les popups ou utiliser le bouton de copie",
                    duration: 5000
                });
            }
        } catch (error) {
            captureError(error, 'openPaymentUrl');
            setPopupBlocked(true);
        }
    }, [paymentUrl, captureError]);

    // Fonction pour formater le temps restant
    const formatTimeRemaining = (seconds: number): string => {
        if (seconds <= 0) return "Expiré";
        
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Fonction pour réinitialiser le formulaire
    const resetForm = useCallback(() => {
        setPaymentMethod('');
        setPhoneNumber('');
        setPaymentStep('input');
        setPaymentUrl(null);
        setPaymentCode(null);
        setPaymentInstructions(null);
        setTimeRemaining(null);
        setBackoffDelay(5);
        setNetworkErrorCount(0);
        checkAttemptsRef.current = 0;
        transactionRef.current = null;
        localStorage.removeItem('pendingPaymentTransaction');
    }, []);

    // Fonction pour vérifier le statut du paiement en cours
    const checkPaymentStatus = useCallback(async (transactionId: string) => {
        if (!transactionId || !invoice) return;
        
        try {
            // Incrémenter le nombre de tentatives de vérification
            checkAttemptsRef.current += 1;
            
            // Mettre à jour la transaction en cours
            if (transactionRef.current) {
                transactionRef.current.checkCount = (transactionRef.current.checkCount || 0) + 1;
                transactionRef.current.lastCheck = new Date().toISOString();
                localStorage.setItem('pendingPaymentTransaction', JSON.stringify(transactionRef.current));
            }
            
            // Limiter le nombre de tentatives à 100 pour éviter les boucles infinies
            if (checkAttemptsRef.current > 100) {
                clearInterval(checkIntervalRef.current || 0);
                setPaymentStep('error');
                return;
            }
            
            setShowStatusCheck(true);
            
            // Appel à l'API pour vérifier le statut
            const response = await invoicesPaymentApi.checkPayment(invoice.id, transactionId);
            
            // Réinitialiser le compteur d'erreurs réseau en cas de succès
            setNetworkErrorCount(0);
            
            if (response.status === 'PAID' || response.status === 'COMPLETED') {
                // Paiement réussi
                clearInterval(checkIntervalRef.current || 0);
                setPaymentStep('success');
                localStorage.removeItem('pendingPaymentTransaction');
                
                // Notifier l'utilisateur
                toast.success("Paiement réussi !", {
                    description: `Nous avons bien reçu votre paiement de ${formatCurrency(invoice.amount)} pour la facture ${invoice.number}`,
                });
                
                // Appeler la fonction de callback pour le succès
                setTimeout(() => {
                    onPaymentSuccess(invoice.id, paymentMethod, phoneNumber);
                }, 2000);
            } 
            else if (response.status === 'FAILED' || response.status === 'REJECTED') {
                // Paiement échoué
                clearInterval(checkIntervalRef.current || 0);
                setPaymentStep('error');
                localStorage.removeItem('pendingPaymentTransaction');
                
                // Notifier l'utilisateur
                toast.error("Le paiement a échoué", {
                    description: "Veuillez réessayer ou contacter le support si le problème persiste",
                });
            }
            else if (response.status === 'EXPIRED') {
                // Paiement expiré
                clearInterval(checkIntervalRef.current || 0);
                setPaymentStep('error');
                localStorage.removeItem('pendingPaymentTransaction');
                
                toast.error("La session de paiement a expiré", {
                    description: "Veuillez relancer le processus de paiement",
                });
            }
            // Sinon, le paiement est toujours en attente, continuer les vérifications
            
            // Augmenter progressivement le délai entre les vérifications
            if (checkAttemptsRef.current > 5) {
                setBackoffDelay(prev => Math.min(30, prev * 1.5)); // Augmenter le délai mais plafonner à 30 secondes
            }
        } catch (error) {
            setNetworkErrorCount(prev => prev + 1);
            
            // Capturer l'erreur avec contexte
            captureError(error, 'checkPaymentStatus', { 
                attempts: checkAttemptsRef.current,
                networkErrors: networkErrorCount + 1
            });
            
            // Si nous avons trop d'erreurs réseau consécutives, arrêter les vérifications
            if (networkErrorCount >= 5) {
                clearInterval(checkIntervalRef.current || 0);
                setPaymentStep('error');
                
                toast.error("Problème de connexion détecté", {
                    description: "Impossible de vérifier le statut du paiement. Vérifiez votre connexion internet.",
                });
            }
        } finally {
            setTimeout(() => {
                setShowStatusCheck(false);
            }, 1000);
        }
    }, [invoice, captureError, onPaymentSuccess, networkErrorCount]);

    // Fonction pour soumettre le formulaire de paiement
    const handleSubmitPayment = useCallback(async () => {
        if (!invoice) {
            toast.error("Information de facture manquante");
            return;
        }
        
        if (!paymentMethod) {
            toast.error("Veuillez sélectionner une méthode de paiement");
            return;
        }
        
        // Valider le numéro de téléphone
        const formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
        if (!isValidPhoneNumber(formattedPhone)) {
            toast.error("Numéro de téléphone invalide", {
                description: "Veuillez saisir un numéro de téléphone valide"
            });
            return;
        }
        
        setIsLoading(true);
        
        try {
            // Appel à l'API pour initier le paiement
            const paymentData = {
                invoiceId: invoice.id,
                method: paymentMethod,
                phoneNumber: formattedPhone
            };
            
            const paymentResponse = await invoicesPaymentApi.initiatePayment(invoice.id, paymentMethod, formattedPhone);
            
            // Adapter la réponse au format PaymentInfo attendu par le composant
            const paymentInfo: PaymentInfo = {
                paymentUrl: paymentResponse.paymentUrl || '',
                transactionId: paymentResponse.transactionId,
                status: 'initiated',
                expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes par défaut
                paymentCode: paymentResponse.paymentCode,
                paymentInstructions: paymentResponse.paymentInstructions
            };
            
            // Traitement de la réponse
            const { transactionId, paymentUrl, paymentCode, paymentInstructions, status, expiresAt } = paymentInfo;
            
            // Stocker les informations de transaction
            const transaction: PendingTransaction = {
                transactionId,
                invoiceId: invoice.id,
                paymentMethod,
                phoneNumber: formattedPhone,
                timestamp: new Date().toISOString(),
                expiresAt,
                paymentUrl,
                paymentCode,
                paymentInstructions
            };
            
            // Sauvegarder en local storage pour récupérer en cas de rafraîchissement
            localStorage.setItem('pendingPaymentTransaction', JSON.stringify(transaction));
            transactionRef.current = transaction;
            
            // Mettre à jour l'état
            setPaymentUrl(paymentUrl);
            setPaymentCode(paymentCode || null);
            setPaymentInstructions(paymentInstructions || null);
            setPaymentStep('waiting');
            
            // Déterminer le mode d'instruction
            if (paymentUrl && (paymentMethod === 'wave')) {
                setPaymentInstructionMode('url');
                // Tenter d'ouvrir l'URL automatiquement sur desktop
                if (!isMobile) {
                    openPaymentUrl();
                }
            } else if (paymentMethod === 'orange_money') {
                setPaymentInstructionMode('sms');
            } else {
                setPaymentInstructionMode('none');
            }
            
            // Commencer à vérifier le statut
            checkPaymentStatus(transactionId);
        } catch (error) {
            const errorMessage = captureError(error, 'submitPayment');
            
            toast.error("Erreur lors de l'initialisation du paiement", {
                description: "Veuillez réessayer ou contacter le support",
            });
        } finally {
            setIsLoading(false);
        }
    }, [invoice, paymentMethod, phoneNumber, isValidPhoneNumber, captureError, isMobile, openPaymentUrl, checkPaymentStatus]);

    // Rendu des étapes de paiement
    const renderPaymentStep = () => {
        switch (paymentStep) {
            case 'input':
                return renderPaymentForm();
            case 'waiting':
                return renderWaitingState();
            case 'error':
                return renderErrorState();
            case 'success':
                return renderSuccessState();
            default:
                return renderPaymentForm();
        }
    };

    // Rendu du formulaire de paiement initial
    const renderPaymentForm = () => {
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Choisissez votre méthode de paiement</h3>
                    <div className="flex flex-wrap gap-2">
                        {paymentMethods.map((method) => (
                            <PaymentMethodButton
                                key={method.value}
                                method={method}
                                selected={paymentMethod === method.value}
                                disabled={isLoading}
                                onClick={() => setPaymentMethod(method.value as PaymentMethodType)}
                            />
                        ))}
                    </div>
                </div>

                {paymentMethod && (
                    <div>
                        <Label htmlFor="phoneNumber" className="block mb-2">
                            Numéro de téléphone {paymentMethod === 'orange_money' ? 'Orange Money' : 'Wave'}
                        </Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <SmartphoneIcon className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input
                                id="phoneNumber"
                                type="tel"
                                placeholder="77 123 45 67"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="pl-10"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                )}

                <div className="pt-4">
                    <Button 
                        onClick={handleSubmitPayment}
                        disabled={!paymentMethod || !phoneNumber || isLoading || !isValidPhoneNumber(phoneNumber)}
                        className="w-full"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Traitement en cours...
                            </>
                        ) : (
                            <>
                                Payer {invoice && formatCurrency(invoice.amount)}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        );
    };

    // Rendu de l'état d'attente du paiement
    const renderWaitingState = () => {
        return (
            <div className="space-y-6">
                {paymentInstructionMode === 'url' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <LinkIcon className="mr-2 h-4 w-4" />
                                Lien de paiement {paymentMethod === 'wave' && 'Wave'}
                            </CardTitle>
                            <CardDescription>
                                Cliquez sur le lien ci-dessous pour effectuer votre paiement
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 truncate"
                                    onClick={openPaymentUrl}
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Ouvrir le lien de paiement
                                </Button>
                                <Button 
                                    variant="secondary" 
                                    size="icon"
                                    onClick={() => paymentUrl && copyToClipboard(paymentUrl, 'url')}
                                >
                                    {urlCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                            {popupBlocked && (
                                <Alert variant="destructive" className="mt-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Popup bloqué</AlertTitle>
                                    <AlertDescription>
                                        Votre navigateur a bloqué l'ouverture automatique. Cliquez sur le bouton "Ouvrir" ou utilisez le bouton de copie.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                )}

                {paymentInstructionMode === 'sms' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <SmartphoneIcon className="mr-2 h-4 w-4" />
                                Instructions Orange Money
                            </CardTitle>
                            <CardDescription>
                                Suivez ces instructions pour compléter votre paiement
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p>Vous allez recevoir un SMS sur votre téléphone.</p>
                                <p>Suivez les instructions pour valider le paiement.</p>
                                {paymentCode && (
                                    <div className="mt-4">
                                        <Label>Code de paiement</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex-1 p-2 bg-gray-100 rounded font-mono text-center">
                                                {paymentCode}
                                            </div>
                                            <Button 
                                                variant="secondary" 
                                                size="icon"
                                                onClick={() => copyToClipboard(paymentCode, 'code')}
                                            >
                                                {codeCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                        <span>
                            Expire dans: {timeRemaining !== null ? formatTimeRemaining(timeRemaining) : '--:--'}
                        </span>
                    </div>

                    <Badge 
                        variant="outline"
                        className="flex items-center gap-1"
                    >
                        {showStatusCheck ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            <RefreshCw className="h-3 w-3" />
                        )}
                        Vérification en cours
                    </Badge>
                </div>

                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Ne fermez pas cette fenêtre</AlertTitle>
                    <AlertDescription>
                        Cette page vérifie automatiquement l'état de votre paiement. Une fois le paiement terminé, vous serez redirigé.
                    </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        onClick={resetForm}
                        disabled={isLoading}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => checkPaymentStatus(transactionRef.current?.transactionId || '')}
                        disabled={isLoading || !transactionRef.current?.transactionId}
                        className="ml-auto"
                    >
                        <RotateCw className="mr-2 h-4 w-4" />
                        Actualiser
                    </Button>
                </div>
            </div>
        );
    };

    // Rendu de l'état d'erreur
    const renderErrorState = () => {
        return (
            <div className="space-y-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Échec du paiement</AlertTitle>
                    <AlertDescription>
                        Le paiement n'a pas pu être traité ou a expiré. Veuillez réessayer.
                    </AlertDescription>
                </Alert>

                <Button 
                    onClick={resetForm}
                    className="w-full"
                >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Réessayer
                </Button>
            </div>
        );
    };

    // Rendu de l'état de succès
    const renderSuccessState = () => {
        return (
            <div className="space-y-6 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold">Paiement réussi !</h3>
                    <p className="text-gray-600 mt-2">
                        Le paiement de {invoice && formatCurrency(invoice.amount)} pour la facture #{invoice?.number} a été traité avec succès.
                    </p>
                </div>
                
                <Button 
                    onClick={onClose}
                    className="w-full"
                >
                    Fermer
                </Button>
            </div>
        );
    };

    // Rendu du footer du modal
    const renderModalFooter = () => {
        // Pas de footer en mode attente ou succès
        if (paymentStep === 'waiting' || paymentStep === 'success') {
            return null;
        }

        // Footer pour le formulaire initial
        if (paymentStep === 'input') {
            return (
                <div className="flex justify-between w-full">
                    <Button 
                        variant="ghost" 
                        onClick={onClose}
                    >
                        Annuler
                    </Button>
                </div>
            );
        }

        // Footer pour l'état d'erreur
        return (
            <div className="flex justify-between w-full">
                <Button 
                    variant="ghost" 
                    onClick={onClose}
                >
                    Fermer
                </Button>
                <Button 
                    variant="default" 
                    onClick={resetForm}
                >
                    Réessayer
                </Button>
            </div>
        );
    };

    // Titre du modal basé sur l'étape
    const getModalTitle = () => {
        switch (paymentStep) {
            case 'input':
                return `Paiement - Facture #${invoice?.number}`;
            case 'waiting':
                return `Paiement en attente - ${paymentMethod === 'wave' ? 'Wave' : 'Orange Money'}`;
            case 'error':
                return "Échec du paiement";
            case 'success':
                return "Paiement réussi";
            default:
                return "Paiement";
        }
    };

    // Rendu du modal SafeModal qui évite les erreurs React.Children.only
    return (
        <SafeModal
            isOpen={isOpen}
            onOpenChange={(open) => !open && onClose()}
            title={getModalTitle()}
            description={invoice && `Montant: ${formatCurrency(invoice.amount)}`}
            footer={renderModalFooter()}
            size="md"
        >
            <div className="py-2">{renderPaymentStep()}</div>
        </SafeModal>
    );
}

export default DexchangePaymentModal;
