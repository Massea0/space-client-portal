import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Message de confirmation pour l'utilisateur
    const status = searchParams.get('status');
    const transactionId = searchParams.get('transactionId');
    
    console.log('[PaymentCallback] Status:', status, 'TransactionId:', transactionId);
    
    // Afficher un message temporaire puis fermer la fenêtre
    const timer = setTimeout(() => {
      // Essayer de fermer la fenêtre/popup
      try {
        window.close();
      } catch (error) {
        console.log('Impossible de fermer automatiquement la fenêtre');
        // Si c'est un onglet normal, rediriger vers le dashboard
        window.location.href = '/factures';
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
      <div className="text-center p-8 max-w-md mx-auto">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg 
            className="w-8 h-8 text-green-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Paiement en cours de traitement
        </h1>
        
        <p className="text-gray-600 mb-6">
          Votre paiement Wave a été initié. Cette fenêtre se fermera automatiquement.
        </p>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => window.close()}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Fermer cette fenêtre
          </button>
          
          <a 
            href="/factures" 
            className="px-6 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
          >
            Retourner aux factures
          </a>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Vous pouvez fermer cette fenêtre en toute sécurité.
        </p>
      </div>
    </div>
  );
}
