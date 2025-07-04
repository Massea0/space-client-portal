import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function PaymentCancel() {
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.removeItem('pendingPaymentTransaction');
  }, []);
  return (
    <div className="container max-w-md mx-auto px-4 py-16 text-center">
      <div className="flex flex-col items-center">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold">Paiement annulé</h1>
        <p className="text-muted-foreground mt-2">
          Votre paiement a été annulé ou n'a pas abouti. Aucun montant n'a été prélevé.
        </p>
        <button 
          onClick={() => navigate('/invoices')}
          className="mt-8 px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Retourner aux factures
        </button>
      </div>
    </div>
  );
}
