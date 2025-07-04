// src/components/payments/DexchangePaymentModalSimple.tsx

import React, { useState } from 'react';
import { Invoice } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AnimatedModal } from '@/components/ui/animated-modal';
import { formatCurrency } from '@/lib/utils';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { notificationManager } from '@/components/ui/notification-provider';
import { useVisualEffect } from '@/components/ui/visual-effect';

// Images
import WaveLogo from '@/assets/wave.png';
import OrangeMoneyLogo from '@/assets/om.png';

interface DexchangePaymentModalProps {
    invoice: Invoice | null;
    onClose: () => void;
    onPaymentSuccess: () => void;
}

const paymentMethods = [
    { value: 'orange_money', label: 'Orange Money', logo: OrangeMoneyLogo },
    { value: 'wave', label: 'Wave', logo: WaveLogo },
];

type PaymentMethodType = 'wave' | 'orange_money' | '';

const DexchangePaymentModal: React.FC<DexchangePaymentModalProps> = ({ 
    invoice, 
    onClose, 
    onPaymentSuccess 
}) => {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { playEffect, EffectComponent } = useVisualEffect();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Simulation d'un paiement
        setTimeout(() => {
            setIsLoading(false);
            // Jouer l'effet de confetti
            playEffect('confetti', { 
                spread: 180, 
                particleCount: 100,
                colors: ['#10B981', '#3B82F6', '#F59E0B'] 
            });
            
            notificationManager.success('Paiement initié', {
                message: 'Votre demande de paiement a été envoyée'
            });
            
            onPaymentSuccess();
            
            // Fermer la modale après un court délai pour voir l'effet
            setTimeout(() => {
                onClose();
            }, 800);
        }, 2000);
    };

    return (
        <>
            <AnimatedModal 
                isOpen={!!invoice} 
                onOpenChange={(open) => !open && onClose()}
                title="Paiement de facture"
                description={`Facture N°${invoice?.number} - Montant: ${formatCurrency(invoice?.amount || 0)}`}
                size="md"
                animationType="zoom"
                contentClassName="sm:max-w-md"
                footer={
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Annuler
                        </Button>
                        <Button 
                            type="submit" 
                            form="payment-form"
                            disabled={isLoading || !paymentMethod || !phoneNumber}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? 'Traitement...' : 'Payer'}
                        </Button>
                    </div>
                }
            >
                <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Méthode de paiement</Label>
                        <div className="flex gap-4 mt-2">
                            {paymentMethods.map((method) => (
                                <Button
                                    key={method.value}
                                    type="button"
                                    variant={paymentMethod === method.value ? 'default' : 'outline'}
                                    onClick={() => setPaymentMethod(method.value as PaymentMethodType)}
                                    className="flex flex-col h-20 w-20 p-2"
                                    disabled={isLoading}
                                >
                                    <img src={method.logo} alt={method.label} className="h-8 w-8 mb-1" />
                                    <span className="text-xs">{method.label}</span>
                                    {paymentMethod === method.value && (
                                        <CheckCircle2 className="h-3 w-3 absolute -top-1 -right-1 text-green-500" />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                        <Input
                            id="phoneNumber"
                            type="tel"
                            placeholder="Ex: 77 123 45 67"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                </form>
            </AnimatedModal>
            {EffectComponent}
        </>
    );
};

export default DexchangePaymentModal;
