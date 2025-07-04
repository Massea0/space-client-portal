// src/pages/TestMarkPaid.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TestMarkPaid: React.FC = () => {
  const [invoiceId, setInvoiceId] = useState('4023bea2-1d94-45a2-b31d-6c7bb91f61e3');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const markAsPaid = async () => {
    if (!invoiceId) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log('🔄 Marquage facture comme payée:', invoiceId);
      
      // Utiliser l'Edge Function mark-invoice-paid qui a les bonnes permissions
      const response = await fetch('https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/mark-invoice-paid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ invoiceId })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${data.error || 'Erreur inconnue'}`);
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Erreur inconnue');
      }
      
      console.log('✅ Facture mise à jour:', data);
      setResult(`Facture ${invoiceId} marquée comme payée avec succès!`);
      
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Test: Marquer facture comme payée</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="invoiceId">ID de la facture</Label>
            <Input
              id="invoiceId"
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              placeholder="01943c21-3cf7-77f8-8b04-7dd0ae1e9cf7"
            />
          </div>
          
          <Button 
            onClick={markAsPaid} 
            disabled={loading || !invoiceId}
            className="w-full"
          >
            {loading ? 'Traitement...' : 'Marquer comme payée'}
          </Button>
          
          {result && (
            <Alert>
              <AlertDescription className="text-green-600">
                {result}
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestMarkPaid;
