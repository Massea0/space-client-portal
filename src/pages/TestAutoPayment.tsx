// src/pages/TestAutoPayment.tsx

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface TestResult {
  type: 'success' | 'error' | 'info';
  message: string;
  data?: any;
}

export default function TestAutoPayment() {
  const [invoiceId, setInvoiceId] = useState('INV-20241230-001'); // Notre facture de test
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, { ...result, timestamp: new Date().toLocaleTimeString() } as any]);
  };

  const testPaymentStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payment-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
        },
        body: JSON.stringify({
          invoiceId,
          ...(transactionId && { transactionId })
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        addResult({
          type: 'success',
          message: `Payment Status: ${data.status} - Auto-check: ${data.autoCheckAttempted ? 'Oui' : 'Non'}`,
          data
        });
      } else {
        addResult({
          type: 'error',
          message: `Erreur: ${data.error || 'Erreur inconnue'}`,
          data
        });
      }
    } catch (error) {
      addResult({
        type: 'error',
        message: `Erreur réseau: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const testCheckWaveStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-wave-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
        },
        body: JSON.stringify({
          invoiceId,
          ...(transactionId && { transactionId })
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        addResult({
          type: data.success ? 'success' : 'info',
          message: `Check Wave Status: ${data.success ? 'Succès' : 'Échec'} - Mis à jour: ${data.updated ? 'Oui' : 'Non'}`,
          data
        });
      } else {
        addResult({
          type: 'error',
          message: `Erreur: ${data.error || 'Erreur inconnue'}`,
          data
        });
      }
    } catch (error) {
      addResult({
        type: 'error',
        message: `Erreur réseau: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const createWavePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/initiate-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
        },
        body: JSON.stringify({
          invoice_id: invoiceId,
          payment_method: 'wave',
          phone_number: '+221123456789'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setTransactionId(data.transactionId);
        addResult({
          type: 'success',
          message: `Paiement Wave créé - Transaction ID: ${data.transactionId}`,
          data
        });
      } else {
        addResult({
          type: 'error',
          message: `Erreur: ${data.error || 'Erreur inconnue'}`,
          data
        });
      }
    } catch (error) {
      addResult({
        type: 'error',
        message: `Erreur réseau: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test du Marquage Automatique des Paiements Wave</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceId">Invoice ID</Label>
              <Input
                id="invoiceId"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                placeholder="UUID de la facture"
              />
            </div>
            <div>
              <Label htmlFor="transactionId">Transaction ID (optionnel)</Label>
              <Input
                id="transactionId"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="ID de transaction"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={createWavePayment} 
              disabled={loading || !invoiceId}
              variant="default"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              1. Créer Paiement Wave
            </Button>
            
            <Button 
              onClick={testPaymentStatus} 
              disabled={loading || !invoiceId}
              variant="outline"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              2. Test Payment Status (Auto)
            </Button>
            
            <Button 
              onClick={testCheckWaveStatus} 
              disabled={loading || !invoiceId}
              variant="outline"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              3. Test Check Wave Status
            </Button>

            <Button 
              onClick={clearResults} 
              variant="ghost"
              size="sm"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats des Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.map((result: any, index) => (
              <Alert key={index} className={
                result.type === 'success' ? 'border-green-200 bg-green-50' :
                result.type === 'error' ? 'border-red-200 bg-red-50' :
                'border-blue-200 bg-blue-50'
              }>
                <div className="flex items-start space-x-2">
                  {result.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  ) : result.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <AlertDescription>
                      <div className="font-medium">{result.message}</div>
                      {result.timestamp && (
                        <div className="text-xs text-gray-500 mt-1">{result.timestamp}</div>
                      )}
                      {result.data && (
                        <details className="mt-2">
                          <summary className="text-xs cursor-pointer text-gray-600">Données détaillées</summary>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-gray-600 space-y-2">
            <h4 className="font-medium">Instructions de test :</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Utilisez la facture de test pré-remplie ou créez-en une nouvelle</li>
              <li>Cliquez sur "Créer Paiement Wave" pour initier un paiement</li>
              <li>Testez "Payment Status" qui devrait automatiquement vérifier Wave</li>
              <li>Observez la valeur "autoCheckAttempted" dans les résultats</li>
              <li>Le marquage automatique se fait si Wave confirme le paiement</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
