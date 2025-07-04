// src/components/payments/WavePaymentModal.tsx
// Version simplifiée pour Wave uniquement - Mission 5 finalisée

import React, { useState, useEffect, useCallback } from 'react';
import { Invoice } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    AlertCircle,
    CheckCircle2,
    Loader2,
    Clock,
    Copy, 
    ExternalLink,
    SmartphoneIcon,
    RefreshCw
} from 'lucide-react';
import { formatCurrency, formatPhoneNumber } from '@/lib/utils';
import { notificationManager } from '@/components/ui/notification-provider';
import { useIsMobile } from '@/hooks/use-mobile';
import { invoicesPaymentApi } from '@/services/invoices-payment';
import { PaymentMonitor } from '@/services/payment-monitor';
import { PaymentStatusUpdate } from '@/services/payment-realtime';

// Images Wave
import WaveLogo from '@/assets/images/wave.png';

interface WavePaymentModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

// Type pour les étapes de paiement
type PaymentStep = 'input' | 'processing' | 'waiting' | 'error' | 'success';

// Configuration Wave
const WAVE_CONFIG = {
  serviceCode: 'wave', // Force explicitement 'wave'
  label: 'Wave',
  description: 'Paiement rapide et sécurisé via Wave',
  logo: WaveLogo,
  timeout: 600, // 10 minutes
  pollingInterval: 5000 // 5 secondes
};

const WavePaymentModal: React.FC<WavePaymentModalProps> = ({ 
  invoice, 
  onClose, 
  onPaymentSuccess 
}) => {
  console.log('🔥 [WaveModal] Version 2.0 - Système hybride PaymentMonitor chargé');
  
  // États principaux
  const [step, setStep] = useState<PaymentStep>('input');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState(WAVE_CONFIG.timeout);
  const [urlCopied, setUrlCopied] = useState(false);

  const isMobile = useIsMobile();

  // Nouveau système de surveillance du paiement
  const [paymentMonitor, setPaymentMonitor] = useState<PaymentMonitor | null>(null);

  // Timer pour le compte à rebours
  useEffect(() => {
    if (step === 'waiting' && remainingTime > 0) {
      const timer = setTimeout(() => {
        setRemainingTime(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (remainingTime === 0 && step === 'waiting') {
      setError('Temps dépassé. Veuillez réessayer.');
      setStep('error');
      stopPaymentMonitoring();
    }
  }, [step, remainingTime]);

  // Fonctions pour le nouveau système de surveillance
  const startPaymentMonitoring = useCallback((txId: string) => {
    console.log('� [WaveModal] *** NOUVEAU SYSTÈME *** - Démarrage de la surveillance pour transaction:', txId);
    
    if (paymentMonitor) {
      paymentMonitor.stop();
    }

    const monitor = new PaymentMonitor(invoice!.id, txId, {
      pollingInterval: WAVE_CONFIG.pollingInterval,
      maxPollingDuration: WAVE_CONFIG.timeout * 1000,
      enableRealtime: true,
      onStatusChange: (update: PaymentStatusUpdate) => {
        console.log('📊 [WaveModal] Mise à jour du statut:', update);
        
        if (update.status === 'paid') {
          console.log('✅ [WaveModal] Paiement confirmé via surveillance');
          setStep('success');
          stopPaymentMonitoring();
          notificationManager.success('Paiement confirmé', {
            message: 'Votre paiement a été traité avec succès.'
          });
          setTimeout(() => {
            onPaymentSuccess();
            onClose();
          }, 2000);
        } else if (update.status === 'failed') {
          console.log('❌ [WaveModal] Paiement échoué via surveillance');
          setError('Le paiement a échoué. Veuillez réessayer.');
          setStep('error');
          stopPaymentMonitoring();
        } else {
          console.log('⏳ [WaveModal] Paiement en cours, statut:', update.status);
        }
      },
      onError: (error: Error) => {
        console.error('❌ [WaveModal] Erreur de surveillance:', error);
        // Ne pas arrêter la surveillance pour des erreurs réseau temporaires
      }
    });

    monitor.start();
    setPaymentMonitor(monitor);
  }, [invoice, onPaymentSuccess, onClose, paymentMonitor]);

  const stopPaymentMonitoring = useCallback(() => {
    if (paymentMonitor) {
      console.log('🛑 [WaveModal] Arrêt de la surveillance');
      paymentMonitor.stop();
      setPaymentMonitor(null);
    }
  }, [paymentMonitor]);

  // Nettoyage lors de la fermeture
  useEffect(() => {
    return () => {
      stopPaymentMonitoring();
    };
  }, [stopPaymentMonitoring]);

  // Validation du numéro de téléphone
  const isValidPhoneNumber = (phone: string) => {
    const cleanPhone = phone.replace(/\s/g, '');
    return /^(221|00221|\+221)?[0-9]{8,9}$/.test(cleanPhone);
  };

  // Formatage du numéro de téléphone
  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('221')) {
      return cleaned;
    } else if (cleaned.length === 9) {
      return `221${cleaned}`;
    } else if (cleaned.length === 8) {
      return `22${cleaned}`;
    }
    return cleaned;
  };

  // Fonction pour initier le paiement Wave
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice || !phoneNumber) return;
    
    if (!isValidPhoneNumber(phoneNumber)) {
      setError('Veuillez entrer un numéro de téléphone valide (ex: 70 123 45 67)');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStep('processing');
    
    try {
      const formattedPhone = formatPhone(phoneNumber);
      
      // Force explicitement la valeur 'wave'
      const paymentMethod = 'wave';
      
      console.log('🔍 [WaveModal] Service code configuré:', WAVE_CONFIG.serviceCode);
      console.log('🔍 [WaveModal] Payment method forcé:', paymentMethod);
      console.log('🔍 [WaveModal] Paramètres envoyés:', {
        invoiceId: invoice.id,
        serviceCode: paymentMethod,
        phone: formattedPhone
      });
      
      const result = await invoicesPaymentApi.initiatePayment(
        invoice.id,
        paymentMethod, // Force 'wave' au lieu de WAVE_CONFIG.serviceCode
        formattedPhone
      );
      
      setTransactionId(result.transactionId);
      setPaymentUrl(result.paymentUrl || null);
      
      // Instructions spécifiques Wave
      const waveInstructions = [
        'Ouvrez l\'application Wave sur votre téléphone',
        'Vérifiez la notification de paiement reçue',
        'Confirmez le montant et validez la transaction',
        'Le paiement sera confirmé automatiquement'
      ];
      
      setInstructions(waveInstructions);
      setRemainingTime(WAVE_CONFIG.timeout);
      setStep('waiting');
      
      // Démarrer le polling
      startPaymentMonitoring(result.transactionId);
      
      notificationManager.success('Paiement initié', {
        message: 'Votre demande de paiement Wave a été transmise.'
      });
      
    } catch (error) {
      console.error('Erreur paiement Wave:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'initiation du paiement');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour copier l'URL de paiement
  const copyPaymentUrl = async () => {
    if (paymentUrl) {
      try {
        await navigator.clipboard.writeText(paymentUrl);
        setUrlCopied(true);
        notificationManager.success('URL copiée', {
          message: 'Lien de paiement copié dans le presse-papiers'
        });
        setTimeout(() => setUrlCopied(false), 3000);
      } catch (error) {
        notificationManager.error('Erreur', {
          message: 'Impossible de copier le lien'
        });
      }
    }
  };

  // Fonction pour réessayer le paiement
  const retryPayment = () => {
    setStep('input');
    setError(null);
    setTransactionId(null);
    setInstructions([]);
    setPaymentUrl(null);
    setRemainingTime(WAVE_CONFIG.timeout);
    stopPaymentMonitoring();
  };

  // Fonction pour fermer la modale
  const handleClose = () => {
    stopPaymentMonitoring();
    onClose();
  };

  // Formatage du temps restant
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!invoice) return null;

  return (
    <Dialog open={!!invoice} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Paiement Wave</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
        {/* En-tête Wave */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src={WAVE_CONFIG.logo} alt="Wave" className="h-12 w-12 object-contain" />
            <div>
              <h3 className="text-lg font-semibold">Paiement Wave</h3>
              <p className="text-sm text-muted-foreground">
                {WAVE_CONFIG.description}
              </p>
            </div>
          </div>
          
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Montant à payer</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(invoice.amount)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Facture #{invoice.number}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Étapes du paiement */}
        {step === 'input' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <SmartphoneIcon className="h-4 w-4" />
                Numéro de téléphone Wave
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                placeholder="70 123 45 67"
                required
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Entrez le numéro associé à votre compte Wave
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !phoneNumber}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  'Payer avec Wave'
                )}
              </Button>
            </div>
          </form>
        )}

        {step === 'processing' && (
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
            <div>
              <h3 className="font-semibold">Initiation du paiement...</h3>
              <p className="text-sm text-muted-foreground">
                Connexion avec Wave en cours
              </p>
            </div>
          </div>
        )}

        {step === 'waiting' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">En attente de confirmation</span>
              </div>
              <p className="text-lg font-mono text-blue-600">
                {formatTime(remainingTime)}
              </p>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-2">Instructions:</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  {instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {paymentUrl && (
              <div className="space-y-2">
                <Label>Lien de paiement direct:</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={copyPaymentUrl}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {urlCopied ? 'Copié !' : 'Copier le lien'}
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => {
                      // Ouvrir une popup Wave centrée et de taille appropriée
                      const left = (screen.width / 2) - 300;
                      const top = (screen.height / 2) - 400;
                      const popup = window.open(
                        paymentUrl, 
                        'WavePayment',
                        `width=600,height=800,left=${left},top=${top},scrollbars=yes,resizable=yes`
                      );
                      
                      // Surveiller la fermeture de la popup pour vérifier le paiement
                      const checkClosed = setInterval(() => {
                        if (popup?.closed) {
                          clearInterval(checkClosed);
                          // Relancer immédiatement une vérification du statut
                          if (transactionId) {
                            invoicesPaymentApi.checkPayment(invoice!.id, transactionId)
                              .then(status => {
                                if (status.status === 'paid') {
                                  setStep('success');
                                  stopPaymentMonitoring();
                                  notificationManager.success('Paiement confirmé', {
                                    message: 'Votre paiement a été traité avec succès.'
                                  });
                                  setTimeout(() => onPaymentSuccess(), 1000);
                                }
                              })
                              .catch(console.error);
                          }
                        }
                      }, 1000);
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ouvrir Wave
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Fermer
              </Button>
              <Button variant="outline" onClick={retryPayment} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-green-600">
                Paiement confirmé !
              </h3>
              <p className="text-sm text-muted-foreground">
                Votre facture a été payée avec succès via Wave.
              </p>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur de paiement</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Fermer
              </Button>
              <Button onClick={retryPayment} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </div>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WavePaymentModal;
