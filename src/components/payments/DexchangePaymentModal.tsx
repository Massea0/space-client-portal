// src/components/payments/DexchangePaymentModal.tsx

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
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { invoicesApi } from '@/services/api';
import { formatCurrency } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// Importez vos logos depuis le dossier assets
import WaveLogo from '@/assets/wave.png';
import OrangeMoneyLogo from '@/assets/om.png';
import WizallLogo from '@/assets/wizall.png';

interface DexchangePaymentModalProps {
    invoice: Invoice | null;
    onClose: () => void;
    onPaymentSuccess: () => void;
}

// Définition des méthodes de paiement avec leurs logos
const paymentMethods = [
    { value: 'wave', label: 'Wave', logo: WaveLogo },
    { value: 'orange_money', label: 'Orange Money', logo: OrangeMoneyLogo },
    { value: 'wizall', label: 'Wizall', logo: WizallLogo }, // Assurez-vous que 'wizall' est une clé valide dans votre backend
];

// Type pour s'assurer que seules les valeurs valides sont utilisées
type PaymentMethodType = 'wave' | 'orange_money' | 'wizall' | '';

const DexchangePaymentModal: React.FC<DexchangePaymentModalProps> = ({ invoice, onClose, onPaymentSuccess }) => {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!invoice || !paymentMethod || !phoneNumber) {
            toast.warning("Validation", { description: "Veuillez sélectionner une méthode de paiement et entrer un numéro de téléphone." });
            return;
        }
        setIsLoading(true);
        try {
            const { paymentUrl } = await invoicesApi.initiateDexchangePayment(invoice.id, paymentMethod, phoneNumber);
            toast.info("Redirection...", { description: "Vous allez être redirigé pour finaliser le paiement." });

            onPaymentSuccess();

            // Redirection vers la page de paiement
            window.location.href = paymentUrl;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue.";
            toast.error("Échec de l'initiation", { description: errorMessage });
            setIsLoading(false);
        }
    };

    const handlePaymentMethodClick = (methodValue: PaymentMethodType) => {
        if (!isLoading) {
            setPaymentMethod(methodValue);
        }
    };

    return (
        <Dialog open={!!invoice} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Payer la facture N°{invoice?.number}</DialogTitle>
                    <DialogDescription>
                        Montant à payer : <strong>{formatCurrency(invoice?.amount || 0)}</strong>
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div>
                        <Label>Méthode de paiement</Label>
                        <div className="flex justify-center gap-4 mt-2">
                            {paymentMethods.map((method) => (
                                <Button
                                    key={method.value}
                                    type="button" // Important pour ne pas soumettre le formulaire
                                    variant={paymentMethod === method.value ? 'default' : 'outline'}
                                    onClick={() => handlePaymentMethodClick(method.value as PaymentMethodType)}
                                    className="flex flex-col items-center h-24 w-24 p-2"
                                    disabled={isLoading}
                                >
                                    <img src={method.logo} alt={method.label} className="h-10 w-10 object-contain mb-2" />
                                    <span className="text-xs">{method.label}</span>
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                        <Input
                            id="phoneNumber"
                            type="tel"
                            placeholder="Ex: 771234567"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isLoading || !paymentMethod || !phoneNumber}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? 'Initiation...' : 'Procéder au paiement'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default DexchangePaymentModal;