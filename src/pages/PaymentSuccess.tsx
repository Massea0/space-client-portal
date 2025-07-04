import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, Loader, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function PaymentSuccess() {
  const [status, setStatus] = useState<'pending'|'success'|'failed'>('pending');
  const [isVerifying, setIsVerifying] = useState(true);
  const [details, setDetails] = useState<{ amount?: number; transactionId?: string; [key: string]: unknown } | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Vérifie le statut réel côté backend
  const checkStatus = async () => {
    setIsVerifying(true);
    const transactionId = searchParams.get('transactionId') || JSON.parse(localStorage.getItem('pendingPaymentTransaction')||'{}').transactionId;
    const invoiceId = searchParams.get('invoiceId') || JSON.parse(localStorage.getItem('pendingPaymentTransaction')||'{}').invoiceId;
    if (!transactionId && !invoiceId) {
      setStatus('failed');
      setIsVerifying(false);
      return;
    }
    const { data, error } = await supabase.functions.invoke('payment-status', {
      body: { transactionId, invoiceId }
    });
    if (error || !data) {
      setStatus('failed');
    } else if (data.status === 'paid' || data.status === 'completed') {
      setStatus('success');
      setDetails(data);
      localStorage.removeItem('pendingPaymentTransaction');
    } else if (data.status === 'failed' || data.status === 'expired') {
      setStatus('failed');
    } else {
      setStatus('pending');
      setDetails(data);
    }
    setIsVerifying(false);
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container max-w-md mx-auto px-4 py-16 text-center">
      {isVerifying ? (
        <div className="flex flex-col items-center">
          <Loader className="h-16 w-16 animate-spin text-primary mb-4" />
          <h1 className="text-2xl font-bold">Vérification du paiement en cours...</h1>
          <p className="text-muted-foreground mt-2">Veuillez patienter pendant que nous vérifions votre paiement.</p>
        </div>
      ) : status === 'success' ? (
        <div className="flex flex-col items-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold">Paiement réussi!</h1>
          <p className="text-muted-foreground mt-2">Votre paiement a été traité avec succès.</p>
          {details && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md w-full text-left">
              <div className="text-sm text-gray-500 mb-2">Détails de la transaction:</div>
              {details.amount && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Montant</span>
                  <span className="text-sm">{details.amount} FCFA</span>
                </div>
              )}
              {details.transactionId && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">ID Transaction</span>
                  <span className="text-sm font-mono">{details.transactionId}</span>
                </div>
              )}
            </div>
          )}
          <div className="mt-8 flex gap-4">
            <button 
              onClick={() => navigate('/factures')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Retour aux factures
            </button>
            <button 
              onClick={() => window.close()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Fermer cet onglet
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Vous pouvez maintenant fermer cet onglet en toute sécurité.
          </p>
        </div>
      ) : status === 'pending' ? (
        <div className="flex flex-col items-center">
          <Loader className="h-16 w-16 text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold">Paiement en cours de traitement</h1>
          <p className="text-muted-foreground mt-2">Votre paiement est en cours de traitement. Veuillez patienter.</p>
          <button 
            onClick={checkStatus}
            className="mt-8 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Rafraîchir
          </button>
          <button 
            onClick={() => navigate('/invoices')}
            className="mt-4 px-4 py-2 border border-gray-300 bg-transparent text-gray-700 rounded-md"
          >
            Retour aux factures
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <h1 className="text-2xl font-bold">Vérification impossible</h1>
          <p className="text-muted-foreground mt-2">Nous n'avons pas pu vérifier le statut de votre paiement ou il a expiré.</p>
          <button 
            onClick={checkStatus}
            className="mt-8 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </button>
          <button 
            onClick={() => navigate('/invoices')}
            className="mt-4 px-4 py-2 border border-gray-300 bg-transparent text-gray-700 rounded-md"
          >
            Retour aux factures
          </button>
        </div>
      )}
    </div>
  );
}
