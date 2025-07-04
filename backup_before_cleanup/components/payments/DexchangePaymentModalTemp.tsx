// src/components/payments/DexchangePaymentModalTemp.tsx
// Version temporaire simplifiée pour éviter les erreurs

import React, { useState } from 'react';
import { Invoice } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import { notificationManager } from '@/components/ui/notification-provider';
import { Loader2 } from 'lucide-react';

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

const DexchangePaymentModal: React.FC<DexchangePaymentModalProps> = ({
    invoice,
    onClose,
    onPaymentSuccess
}) => {
    const [paymentMethod, setPaymentMethod] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentMethod || !phoneNumber) return;

        setIsLoading(true);
        
        // Simulation du processus de paiement
        setTimeout(() => {
            notificationManager.success('Paiement initié', {
                message: 'Votre paiement a été initié avec succès!'
            });
            setIsLoading(false);
            onPaymentSuccess();
            onClose();
        }, 2000);
    };

    if (!invoice) return null;

    return (
        <Dialog open={!!invoice} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Paiement de facture</DialogTitle>
                    <DialogDescription>
                        Facture N°{invoice.number} - {formatCurrency(invoice.amount)}
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Méthode de paiement</Label>
                        <div className="flex gap-2 mt-2">
                            {paymentMethods.map((method) => (
                                <Button
                                    key={method.value}
                                    type="button"
                                    variant={paymentMethod === method.value ? 'default' : 'outline'}
                                    onClick={() => setPaymentMethod(method.value)}
                                    className="flex-1"
                                >
                                    <img 
                                        src={method.logo} 
                                        alt={method.label} 
                                        className="h-4 w-4 mr-2" 
                                    />
                                    {method.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <Label htmlFor="phone">Numéro de téléphone</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="Ex: 77 123 45 67"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                        />
                    </div>
                    
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isLoading || !paymentMethod || !phoneNumber}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? 'Traitement...' : 'Payer'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default DexchangePaymentModal;
