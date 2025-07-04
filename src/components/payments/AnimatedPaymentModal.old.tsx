// src/components/payments/AnimatedPaymentModal.tsx
/**
 * @deprecated Ce composant a été remplacé par WavePaymentModal.tsx pour une approche plus focalisée.
 * Utilisez WavePaymentModal pour les nouveaux développements.
 * Ce fichier sera supprimé dans une future version.
 */

import React, { useState, useEffect, memo, useCallback } from 'react';
import { Invoice } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AnimatedModal from '@/components/ui/animated-modal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    AlertCircle,
    CheckCircle2,
    Loader2,
    Clock,
    Copy, 
    ExternalLink,
    RotateCw,
    SmartphoneIcon
} from 'lucide-react';
import { formatCurrency, formatPhoneNumber } from '@/lib/utils';
import { notificationManager } from '@/components/ui/notification-provider';
import { useIsMobile } from '@/hooks/use-mobile';
import { invoicesPaymentApi } from '@/services/invoices-payment';
import AnimatedPaymentCard from './AnimatedPaymentCard';
import PaymentStatusBadge from './PaymentStatusBadge';
import AnimatedPaymentButton from './AnimatedPaymentButton';
import PaymentInstructions from './PaymentInstructions';
import CountdownTimer from './CountdownTimer';

// Images Wave uniquement
import WaveLogo from '@/assets/images/wave.png';

interface AnimatedPaymentModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

// Type pour la méthode de paiement (Wave uniquement)
type PaymentMethodType = 'wave';

// Type pour les étapes de paiement
type PaymentStep = 'input' | 'processing' | 'waiting' | 'error' | 'success';

// Méthode de paiement Wave uniquement (simplifié)
const WAVE_PAYMENT_METHOD = { 
  value: 'wave' as const, 
  label: 'Wave', 
  logo: WaveLogo, 
  description: 'Paiement rapide et sécurisé via Wave', 
  serviceCode: 'WAVE_SN_CASHIN',
  available: true
};

// Composant bouton méthode de paiement
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
}) => (
  <Button
    type="button"
    variant={selected ? 'default' : 'outline'}
    onClick={onClick}
    className={`flex flex-col items-center h-24 w-24 p-2 relative transition-all ${
      !method.available ? 'opacity-50 cursor-not-allowed' : ''
    }`}
    disabled={disabled || !method.available}
    title={method.description}
  >
    <img src={method.logo} alt={method.label} className="h-10 w-10 object-contain mb-2" />
    <span className="text-xs">{method.label}</span>
    {selected && (
      <span className="absolute -top-1 -right-1">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      </span>
    )}
    {!method.available && (
      <span className="absolute bottom-0 left-0 right-0 bg-yellow-100 text-yellow-800 text-[8px] px-1 rounded-b">
        Bientôt
      </span>
    )}
  </Button>
));

PaymentMethodButton.displayName = 'PaymentMethodButton';

const AnimatedPaymentModal: React.FC<AnimatedPaymentModalProps> = ({ 
  invoice, 
  onClose, 
  onPaymentSuccess 
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('input');
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentInstructions, setPaymentInstructions] = useState<string | null>(null);
  const [urlCopied, setUrlCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  // États supplémentaires pour l'intégration Dexchange
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Fonction pour initier le paiement via Dexchange
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice || !paymentMethod || !phoneNumber) return;
    
    setIsLoading(true);
    setError(null);
    setPaymentStep('processing');
    
    try {
      const selectedMethod = paymentMethods.find(m => m.value === paymentMethod);
      if (!selectedMethod) throw new Error('Méthode de paiement non trouvée');
      
      const result = await invoicesPaymentApi.initiatePayment(
        invoice.id,
        selectedMethod.serviceCode,
        phoneNumber.replace(/\s/g, '') // Supprime les espaces
      );
      
      setTransactionId(result.transactionId);
      setPaymentInstructions(result.paymentInstructions || null);
      setPaymentUrl(result.paymentUrl || null);
      setTimeRemaining(15 * 60); // 15 minutes
      setPaymentStep('waiting');
      
      // Démarrer le polling pour vérifier le statut
      startPaymentPolling(result.transactionId);
      
      notificationManager.success('Paiement initié', {
        message: 'Votre demande de paiement a été transmise. Suivez les instructions sur votre téléphone.'
      });
    } catch (error) {
      console.error('Erreur paiement:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
      setPaymentStep('error');
      
      notificationManager.error('Erreur de paiement', {
        message: 'Impossible d\'initier le paiement. Veuillez réessayer.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour démarrer le polling du statut
  const startPaymentPolling = (txId: string) => {
    if (pollingInterval) clearInterval(pollingInterval);
    
    const interval = setInterval(async () => {
      try {
        const statusResult = await invoicesPaymentApi.checkPayment(invoice.id, txId);
        
        const { status } = statusResult;
        
        if (status === 'completed' || status === 'paid') {
          clearInterval(interval);
          setPaymentStep('success');
          notificationManager.success('Paiement confirmé', {
            message: 'Votre paiement a été traité avec succès!'
          });
          onPaymentSuccess();
        } else if (status === 'failed' || status === 'expired') {
          clearInterval(interval);
          setPaymentStep('error');
          setError('Le paiement a échoué ou a expiré');
          notificationManager.error('Paiement échoué', {
            message: 'Le paiement n\'a pas pu être confirmé.'
          });
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
        // Continue le polling en cas d'erreur réseau temporaire
      }
    }, 5000); // Vérification toutes les 5 secondes
    
    setPollingInterval(interval);
    
    // Arrêter le polling après 15 minutes
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
        if (paymentStep === 'waiting') {
          setPaymentStep('error');
          setError('Le délai de paiement a expiré');
        }
      }
    }, 15 * 60 * 1000);
  };

  // Vérifier manuellement l'état du paiement
  const checkPaymentStatus = useCallback(async () => {
    if (!transactionId || !invoice) return;
    
    setIsLoading(true);
    
    try {
      const result = await invoicesPaymentApi.checkPayment(invoice.id, transactionId);
      
      const { status } = result;
      
      if (status === 'completed' || status === 'paid') {
        setPaymentStep('success');
        notificationManager.success('Paiement confirmé', {
          message: 'Votre paiement a été traité avec succès!'
        });
        onPaymentSuccess();
      } else if (status === 'failed' || status === 'expired') {
        setPaymentStep('error');
        setError('Le paiement a échoué ou a expiré');
      } else {
        notificationManager.info('Paiement en cours', {
          message: 'Le paiement est encore en cours de traitement.'
        });
      }
    } catch (error) {
      console.error('Erreur vérification:', error);
      notificationManager.error('Erreur de vérification', {
        message: 'Impossible de vérifier le statut du paiement.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [transactionId, invoice, onPaymentSuccess]);

  // Nettoyer le polling au démontage du composant
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Gérer le clic sur une méthode de paiement
  const handlePaymentMethodClick = (method: PaymentMethodType) => {
    setPaymentMethod(method);
  };

  // Copier le lien de paiement
  const handleCopyLink = () => {
    if (paymentUrl) {
      navigator.clipboard.writeText(paymentUrl);
      setUrlCopied(true);
      notificationManager.info('Lien copié', {
        message: 'Le lien de paiement a été copié dans le presse-papiers'
      });
      setTimeout(() => setUrlCopied(false), 3000);
    }
  };

  const expiresAt = timeRemaining !== null ? new Date(Date.now() + timeRemaining * 1000) : null;

  // Fonction pour obtenir un message d'erreur spécifique
  const getErrorMessage = (error: string | Error): string => {
    const message = error instanceof Error ? error.message : error;
    
    // Messages d'erreur spécifiques basés sur les codes d'erreur Dexchange
    if (message.includes('insufficient_funds') || message.includes('INSUFFICIENT_BALANCE')) {
      return 'Fonds insuffisants dans votre compte. Veuillez recharger votre compte et réessayer.';
    }
    
    if (message.includes('invalid_number') || message.includes('INVALID_PHONE')) {
      return 'Numéro de téléphone invalide. Vérifiez le format (+221 XX XXX XX XX).';
    }
    
    if (message.includes('service_unavailable') || message.includes('SERVICE_DOWN')) {
      return 'Service de paiement temporairement indisponible. Veuillez réessayer dans quelques minutes.';
    }
    
    if (message.includes('transaction_limit') || message.includes('LIMIT_EXCEEDED')) {
      return 'Limite de transaction dépassée. Contactez votre opérateur mobile.';
    }
    
    if (message.includes('network') || message.includes('NETWORK_ERROR')) {
      return 'Problème de connexion réseau. Vérifiez votre connexion Internet.';
    }
    
    if (message.includes('timeout') || message.includes('TIMEOUT')) {
      return 'Délai d\'attente dépassé. La transaction peut prendre plus de temps que prévu.';
    }
    
    // Message générique si aucun code spécifique n'est trouvé
    return message || 'Une erreur inattendue s\'est produite. Veuillez réessayer.';
  };

  return (
    <AnimatedModal
      isOpen={!!invoice}
      onOpenChange={(open) => !open && onClose()}
      title={`Paiement de facture N°${invoice?.number}`}
      description={`Montant : ${formatCurrency(invoice?.amount || 0)}`}
      animationType="zoom"
      size="md"
      withBlur={true}
    >
      {paymentStep === 'success' ? (
        <div className="py-8 flex flex-col items-center">
          <AnimatedPaymentCard isActive={true}>
            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-700 mb-2">Paiement réussi!</h3>
              <p className="text-gray-600 mb-4">
                Votre facture a été payée avec succès. Merci pour votre paiement.
              </p>
              <PaymentStatusBadge status="success" />
            </div>
          </AnimatedPaymentCard>
          
          <Button className="mt-6" onClick={onClose}>
            Fermer
          </Button>
        </div>
      ) : paymentStep === 'waiting' ? (
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Paiement en attente
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <PaymentStatusBadge status="pending" />
              
              {paymentUrl && (
                <div className="bg-white rounded-md p-3 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Lien de paiement:</span>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={handleCopyLink}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => window.open(paymentUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs mt-1 truncate">{paymentUrl}</p>
                </div>
              )}
              
              {timeRemaining !== null && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Temps restant pour compléter le paiement:</p>
                  <CountdownTimer expiresAt={expiresAt} onExpired={() => {}} />
                </div>
              )}
              
              <PaymentInstructions
                title="Instructions de paiement"
                paymentMethod={paymentMethod}
                instructions={
                  paymentInstructions 
                    ? [paymentInstructions]
                    : [`Suivez les instructions dans votre application Wave pour compléter la transaction.`]
                }
              />
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-gradient-to-r from-white to-gray-50 pt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  if (pollingInterval) clearInterval(pollingInterval);
                  setPaymentStep('input');
                  setTransactionId(null);
                  setPaymentInstructions(null);
                  setPaymentUrl(null);
                  setTimeRemaining(null);
                }}
              >
                Annuler
              </Button>
              <AnimatedPaymentButton 
                onClick={checkPaymentStatus}
              >
                {isLoading ? 'Vérification...' : 'Vérifier le statut'}
              </AnimatedPaymentButton>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="paymentMethod">Méthode de paiement</Label>
            <div className="flex justify-center gap-4 mt-2">
              {paymentMethods.map((method) => (
                <PaymentMethodButton
                  key={method.value}
                  method={method}
                  selected={paymentMethod === method.value}
                  disabled={isLoading}
                  onClick={() => handlePaymentMethodClick(method.value as PaymentMethodType)}
                />
              ))}
            </div>
            {paymentMethod && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                {paymentMethods.find(m => m.value === paymentMethod)?.description}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
            <div className="flex items-center mt-2">
              <SmartphoneIcon className="mr-2 h-4 w-4 text-gray-400" />
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Ex: 77 123 45 67"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="tel"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Entrez le numéro associé à votre compte Wave
            </p>
          </div>
          
          {invoice && (
            <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Montant:</span>
                <span className="font-semibold">{formatCurrency(invoice.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Facture N°:</span>
                <span>{invoice.number}</span>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <AnimatedPaymentButton 
              type="submit" 
              disabled={isLoading || !paymentMethod || !phoneNumber}
              isProcessing={isLoading}
            >
              {isLoading ? 'Initiation...' : 'Procéder au paiement'}
            </AnimatedPaymentButton>
          </div>
          
          {paymentStep === 'error' && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur de paiement</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>
                  Une erreur s'est produite lors de l'initiation du paiement.
                  Veuillez vérifier votre connexion Internet et réessayer.
                </p>
                {isMobile && (
                  <p className="text-sm font-medium">
                    Sur mobile, assurez-vous d'avoir suffisamment de fonds dans votre compte et
                    que l'application Wave est installée.
                  </p>
                )}
                {error && (
                  <p className="text-sm text-red-600">
                    {getErrorMessage(error)}
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}
        </form>
      )}
    </AnimatedModal>
  );
};

export default AnimatedPaymentModal;
