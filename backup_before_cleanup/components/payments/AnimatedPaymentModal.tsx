// src/components/payments/AnimatedPaymentModal.tsx

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
import AnimatedPaymentCard from './AnimatedPaymentCard';
import PaymentStatusBadge from './PaymentStatusBadge';
import AnimatedPaymentButton from './AnimatedPaymentButton';
import PaymentInstructions from './PaymentInstructions';
import CountdownTimer from './CountdownTimer';

// Images
import WaveLogo from '@/assets/wave.png';
import OrangeMoneyLogo from '@/assets/om.png';
import WizallLogo from '@/assets/wizall.png';

interface AnimatedPaymentModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

// Type pour les méthodes de paiement
type PaymentMethodType = 'wave' | 'orange_money' | 'wizall' | '';

// Type pour les étapes de paiement
type PaymentStep = 'input' | 'waiting' | 'error' | 'success';

// Définition des méthodes de paiement avec logos
const paymentMethods = [
  { value: 'orange_money', label: 'Orange Money', logo: OrangeMoneyLogo, description: 'Paiement par SMS Orange Money' },
  { value: 'wave', label: 'Wave', logo: WaveLogo, description: 'Paiement rapide via Wave' },
  // Vous pouvez ajouter Wizall ici si nécessaire
];

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
  const [urlCopied, setUrlCopied] = useState(false);
  const isMobile = useIsMobile();
  
  // Simulation du processus de paiement pour la démo
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulation d'un appel API
    setTimeout(() => {
      setPaymentUrl('https://example.com/payment/123456789');
      setTimeRemaining(15 * 60); // 15 minutes en secondes
      setPaymentStep('waiting');
      setIsLoading(false);
    }, 1500);
  };

  // Vérifier l'état du paiement
  const checkPaymentStatus = useCallback(() => {
    setIsLoading(true);
    
    // Simulation de la vérification
    setTimeout(() => {
      // Simulation d'un succès aléatoire
      const isSuccess = Math.random() > 0.7;
      
      if (isSuccess) {
        setPaymentStep('success');
        notificationManager.success('Paiement réussi', {
          message: 'Votre paiement a été traité avec succès!'
        });
        onPaymentSuccess();
      }
      
      setIsLoading(false);
    }, 2000);
  }, [onPaymentSuccess]);

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
                instructions={[
                  `Suivez les instructions dans votre application ${
                    paymentMethod === 'orange_money' ? 'Orange Money' : 
                    paymentMethod === 'wave' ? 'Wave' : 'de paiement'
                  } pour compléter la transaction.`
                ]}
              />
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-gradient-to-r from-white to-gray-50 pt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setPaymentStep('input');
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
              Entrez le numéro associé à votre compte {
                paymentMethod === 'orange_money' ? 'Orange Money' : 
                paymentMethod === 'wave' ? 'Wave' : 'de paiement mobile'
              }
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
                    que l'application {
                      paymentMethod === 'orange_money' ? 'Orange Money' : 
                      paymentMethod === 'wave' ? 'Wave' : 'de paiement'
                    } est installée.
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
