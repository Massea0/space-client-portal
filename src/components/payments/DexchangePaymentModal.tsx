// src/components/payments/DexchangePaymentModal.tsx
// Mission 5: Flux de Paiement Frontend Complet
// Implémentation selon les spécifications de l'Architecte

import React, { useState, useEffect, useRef } from 'react';
import { Invoice } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { invoicesPaymentApi } from '@/services/invoices-payment';
import { formatCurrency } from '@/lib/utils';
import { 
    AlertCircle,
    CheckCircle2,
    Loader2,
    Clock,
    Copy,
    ExternalLink,
    RefreshCw,
    SmartphoneIcon,
    CreditCard,
    XCircle
} from 'lucide-react';

// Images des méthodes de paiement
import WaveLogo from '@/assets/images/wave.png';
import OrangeMoneyLogo from '@/assets/images/om.png';
import FreeMoneyLogo from '@/assets/images/free.png';
import WizallLogo from '@/assets/images/wizall.png';

interface DexchangePaymentModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

// Types pour les méthodes de paiement supportées par Dexchange
type PaymentMethodType = 'OM_SN_CASHIN' | 'WAVE_SN_CASHIN' | 'FREE_SN_CASHIN' | 'WIZALL_SN_CASHIN' | '';

// États du processus de paiement
type PaymentStep = 'method_selection' | 'phone_input' | 'processing' | 'instructions' | 'waiting' | 'success' | 'error';

// Structure des méthodes de paiement
interface PaymentMethod {
  value: PaymentMethodType;
  label: string;
  logo: string;
  description: string;
  instructionType: 'sms' | 'url' | 'app';
}

// Configuration des méthodes de paiement disponibles
const PAYMENT_METHODS: PaymentMethod[] = [
  {
    value: 'OM_SN_CASHIN',
    label: 'Orange Money',
    logo: OrangeMoneyLogo,
    description: 'Paiement par SMS Orange Money',
    instructionType: 'sms'
  },
  {
    value: 'WAVE_SN_CASHIN',
    label: 'Wave',
    logo: WaveLogo,
    description: 'Paiement via l\'application Wave',
    instructionType: 'url'
  },
  {
    value: 'FREE_SN_CASHIN',
    label: 'Free Money',
    logo: FreeMoneyLogo,
    description: 'Paiement Free Money',
    instructionType: 'sms'
  },
  {
    value: 'WIZALL_SN_CASHIN',
    label: 'Wizall Money',
    logo: WizallLogo,
    description: 'Paiement Wizall Money',
    instructionType: 'sms'
  }
];

// Interface pour les informations de transaction
interface TransactionInfo {
  transactionId: string;
  paymentUrl?: string;
  paymentCode?: string;
  paymentInstructions?: string;
  expiresAt?: string;
}

const DexchangePaymentModal: React.FC<DexchangePaymentModalProps> = ({ 
  invoice, 
  onClose, 
  onPaymentSuccess 
}) => {
  // États du composant
  const [currentStep, setCurrentStep] = useState<PaymentStep>('method_selection');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionInfo, setTransactionInfo] = useState<TransactionInfo | null>(null);
  const [error, setError] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  // toast est importé directement de 'sonner'
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Nettoyage lors du démontage du composant
  useEffect(() => {
    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [pollInterval]);

  // Validation du numéro de téléphone sénégalais
  const isValidPhoneNumber = (phone: string): boolean => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    // Format sénégalais: 7XXXXXXXX (9 chiffres) ou 77/78/76/75/70XXXXXXX
    return /^7[0-8][0-9]{7}$/.test(cleanPhone);
  };

  // Formatage du numéro de téléphone
  const formatPhoneForDisplay = (phone: string): string => {
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length === 9) {
      return `${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5, 7)} ${clean.slice(7)}`;
    }
    return phone;
  };

  // Réinitialisation du modal
  const resetModal = () => {
    setCurrentStep('method_selection');
    setSelectedMethod('');
    setPhoneNumber('');
    setIsLoading(false);
    setTransactionInfo(null);
    setError('');
    setCountdown(0);
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  // Gestion de la fermeture du modal
  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Sélection d'une méthode de paiement
  const handleMethodSelect = (method: PaymentMethodType) => {
    setSelectedMethod(method);
    setCurrentStep('phone_input');
    setError('');
  };

  // Soumission du formulaire de paiement
  const handleSubmitPayment = async () => {
    if (!invoice || !selectedMethod || !phoneNumber.trim()) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (!isValidPhoneNumber(cleanPhone)) {
      setError('Numéro de téléphone invalide. Format attendu: 7XXXXXXXX');
      return;
    }

    setIsLoading(true);
    setError('');
    setCurrentStep('processing');

    try {
      // Appel à l'Edge Function pour initier le paiement
      const response = await invoicesPaymentApi.initiatePayment(
        invoice.id,
        selectedMethod,
        cleanPhone
      );

      const transactionData: TransactionInfo = {
        transactionId: response.transactionId,
        paymentUrl: response.paymentUrl,
        paymentCode: response.paymentCode,
        paymentInstructions: response.paymentInstructions,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes par défaut
      };

      setTransactionInfo(transactionData);

      // Déterminer l'étape suivante selon la méthode
      const method = PAYMENT_METHODS.find(m => m.value === selectedMethod);
      if (method?.instructionType === 'url' && response.paymentUrl) {
        // Pour Wave et autres méthodes avec URL
        setCurrentStep('instructions');
        // Ouvrir l'URL de paiement dans un nouvel onglet
        window.open(response.paymentUrl, '_blank');
      } else {
        // Pour Orange Money et autres méthodes SMS
        setCurrentStep('instructions');
      }

      // Démarrer le countdown et le polling
      startCountdown(15 * 60); // 15 minutes
      startPaymentPolling(response.transactionId);

      toast.success("Paiement initié", {
        description: "Suivez les instructions pour compléter votre paiement",
      });

    } catch (err) {
      console.error('Erreur lors de l\'initiation du paiement:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'initiation du paiement');
      setCurrentStep('error');
      
      toast.error("Erreur", {
        description: "Impossible d'initier le paiement. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Démarrage du countdown
  const startCountdown = (seconds: number) => {
    setCountdown(seconds);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          // Expiration du délai
          setCurrentStep('error');
          setError('Délai de paiement expiré. Veuillez réessayer.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Démarrage du polling pour vérifier le statut du paiement
  const startPaymentPolling = (transactionId: string) => {
    setCurrentStep('waiting');
    
    const interval = setInterval(async () => {
      try {
        const status = await invoicesPaymentApi.checkPayment(invoice!.id, transactionId);
        
        if (status.status === 'paid' || status.invoiceStatus === 'paid') {
          // Paiement confirmé
          clearInterval(interval);
          setPollInterval(null);
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          
          setCurrentStep('success');
          toast.success("Paiement confirmé", {
            description: "Votre paiement a été traité avec succès",
          });
          
          // Appeler le callback de succès
          setTimeout(() => {
            onPaymentSuccess();
            handleClose();
          }, 2000);
          
        } else if (status.status === 'failed' || status.status === 'cancelled') {
          // Paiement échoué
          clearInterval(interval);
          setPollInterval(null);
          setCurrentStep('error');
          setError('Le paiement a échoué ou a été annulé.');
        }
        
        // Continuer le polling pour les autres statuts (pending, processing, etc.)
        
      } catch (err) {
        console.error('Erreur lors de la vérification du statut:', err);
        // Ne pas arrêter le polling pour une erreur ponctuelle
      }
    }, 5000); // Vérification toutes les 5 secondes

    setPollInterval(interval);
  };

  // Copie du code de paiement dans le presse-papiers
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copié", {
        description: "Code copié dans le presse-papiers",
      });
    }).catch(() => {
      toast.error("Erreur", {
        description: "Impossible de copier le code",
      });
    });
  };

  // Formatage du temps restant
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Rendu de la sélection des méthodes de paiement
  const renderMethodSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Choisissez votre méthode de paiement</h3>
        <p className="text-sm text-muted-foreground">
          Facture N°{invoice?.number} - {formatCurrency(invoice?.amount || 0)}
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {PAYMENT_METHODS.map((method) => (
          <Card
            key={method.value}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedMethod === method.value ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
            onClick={() => handleMethodSelect(method.value)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={method.logo} 
                  alt={method.label}
                  className="h-10 w-10 object-contain"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{method.label}</h4>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Rendu de la saisie du numéro de téléphone
  const renderPhoneInput = () => {
    const method = PAYMENT_METHODS.find(m => m.value === selectedMethod);
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <img src={method?.logo} alt={method?.label} className="h-6 w-6" />
            <h3 className="text-lg font-semibold">{method?.label}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Montant: {formatCurrency(invoice?.amount || 0)}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="phone" className="text-sm font-medium">
              Numéro de téléphone {method?.label}
            </Label>
            <div className="relative mt-2">
              <SmartphoneIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="Ex: 77 123 45 67"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="pl-10"
                maxLength={11}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Format: 7X XXX XX XX (numéro sénégalais)
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setCurrentStep('method_selection')}
              className="flex-1"
            >
              Retour
            </Button>
            <Button
              onClick={handleSubmitPayment}
              disabled={!phoneNumber.trim() || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                'Confirmer le paiement'
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Rendu des instructions de paiement
  const renderInstructions = () => {
    const method = PAYMENT_METHODS.find(m => m.value === selectedMethod);
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <img src={method?.logo} alt={method?.label} className="h-6 w-6" />
            <h3 className="text-lg font-semibold">Instructions de paiement</h3>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Temps restant: {formatTime(countdown)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="font-medium">Montant à payer</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(invoice?.amount || 0)}</p>
            </div>

            {transactionInfo?.paymentCode && (
              <div>
                <Label className="text-sm font-medium">Code de paiement</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    value={transactionInfo.paymentCode}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(transactionInfo.paymentCode!)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {transactionInfo?.paymentInstructions && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Instructions</AlertTitle>
                <AlertDescription className="whitespace-pre-line">
                  {transactionInfo.paymentInstructions}
                </AlertDescription>
              </Alert>
            )}

            {method?.instructionType === 'url' && transactionInfo?.paymentUrl && (
              <Button
                className="w-full"
                onClick={() => window.open(transactionInfo.paymentUrl, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Ouvrir {method.label}
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
        </div>
      </div>
    );
  };

  // Rendu de l'attente de confirmation
  const renderWaiting = () => (
    <div className="space-y-6 text-center">
      <div className="flex items-center justify-center space-x-2 mb-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <h3 className="text-lg font-semibold">Vérification du paiement...</h3>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Progress value={(15 * 60 - countdown) / (15 * 60) * 100} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Temps restant: {formatTime(countdown)}
            </p>
            <p className="text-sm">
              Nous vérifions automatiquement votre paiement toutes les 5 secondes.
              Veuillez patienter...
            </p>
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" onClick={handleClose}>
        Fermer
      </Button>
    </div>
  );

  // Rendu du succès
  const renderSuccess = () => (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-green-700">Paiement confirmé !</h3>
        <p className="text-sm text-muted-foreground">
          Votre paiement de {formatCurrency(invoice?.amount || 0)} a été traité avec succès.
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Facture:</span>
              <span className="font-medium">{invoice?.number}</span>
            </div>
            <div className="flex justify-between">
              <span>Montant:</span>
              <span className="font-medium">{formatCurrency(invoice?.amount || 0)}</span>
            </div>
            {transactionInfo?.transactionId && (
              <div className="flex justify-between">
                <span>Transaction:</span>
                <span className="font-mono text-xs">{transactionInfo.transactionId}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Rendu de l'erreur
  const renderError = () => (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="rounded-full bg-red-100 p-3">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-red-700">Erreur de paiement</h3>
        <p className="text-sm text-muted-foreground">
          {error || 'Une erreur est survenue lors du traitement de votre paiement.'}
        </p>
      </div>

      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={() => {
            setError('');
            setCurrentStep('method_selection');
          }}
          className="flex-1"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
        <Button variant="outline" onClick={handleClose} className="flex-1">
          Fermer
        </Button>
      </div>
    </div>
  );

  // Rendu du contenu selon l'étape
  const renderContent = () => {
    switch (currentStep) {
      case 'method_selection':
        return renderMethodSelection();
      case 'phone_input':
        return renderPhoneInput();
      case 'processing':
        return (
          <div className="space-y-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p>Initialisation du paiement...</p>
          </div>
        );
      case 'instructions':
        return renderInstructions();
      case 'waiting':
        return renderWaiting();
      case 'success':
        return renderSuccess();
      case 'error':
        return renderError();
      default:
        return renderMethodSelection();
    }
  };

  if (!invoice) return null;

  return (
    <Dialog open={!!invoice} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Paiement de facture</span>
          </DialogTitle>
          <DialogDescription>
            Sélectionnez votre méthode de paiement et suivez les instructions
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DexchangePaymentModal;
