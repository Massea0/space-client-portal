// Test de Payment Monitor (Hybride: Polling + Temps Réel)
// Page: http://localhost:8081/test-polling

import React, { useState, useEffect } from 'react';
import { invoicesPaymentApi } from '@/services/invoices-payment';
import { PaymentMonitor } from '@/services/payment-monitor';
import { PaymentStatusUpdate } from '@/services/payment-realtime';

const TestPolling: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [monitor, setMonitor] = useState<PaymentMonitor | null>(null);
  const [enableRealtime, setEnableRealtime] = useState(true);

  const TEST_INVOICE_ID = "33350dca-5512-44fa-82fb-3f2e47dfdad2";
  const TEST_TRANSACTION_ID = "TIDWD0OX5TQY6G";

  const addResult = (result: any) => {
    setResults(prev => [result, ...prev.slice(0, 19)]); // Garder seulement les 20 derniers
  };

  const startMonitoring = () => {
    if (monitor) {
      monitor.stop();
    }

    setIsMonitoring(true);
    setResults([]);

    const newMonitor = new PaymentMonitor(TEST_INVOICE_ID, TEST_TRANSACTION_ID, {
      pollingInterval: 3000, // 3 secondes pour le test
      maxPollingDuration: 300000, // 5 minutes
      enableRealtime: enableRealtime,
      onStatusChange: (update: PaymentStatusUpdate) => {
        const result = {
          timestamp: new Date().toLocaleTimeString(),
          type: 'status_update',
          source: 'monitor',
          status: update.status,
          data: update
        };
        
        console.log('📊 Test Monitor - Mise à jour:', result);
        addResult(result);

        if (update.status === 'paid' || update.status === 'failed') {
          setIsMonitoring(false);
        }
      },
      onError: (error: Error) => {
        const errorResult = {
          timestamp: new Date().toLocaleTimeString(),
          type: 'error',
          source: 'monitor',
          status: 'error',
          data: { error: error.message }
        };
        
        console.error('❌ Test Monitor - Erreur:', errorResult);
        addResult(errorResult);
      }
    });

    newMonitor.start();
    setMonitor(newMonitor);

    addResult({
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      source: 'test',
      status: 'started',
      data: { 
        message: `Surveillance démarrée avec ${enableRealtime ? 'Polling + Temps réel' : 'Polling seulement'}`,
        config: {
          pollingInterval: 3000,
          enableRealtime: enableRealtime
        }
      }
    });
  };

  const stopMonitoring = () => {
    if (monitor) {
      monitor.stop();
      setMonitor(null);
    }
    setIsMonitoring(false);

    addResult({
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      source: 'test',
      status: 'stopped',
      data: { message: 'Surveillance arrêtée manuellement' }
    });
  };

  // Test unique
  const testOnce = async () => {
    try {
      addResult({
        timestamp: new Date().toLocaleTimeString(),
        type: 'info',
        source: 'test',
        status: 'testing',
        data: { message: 'Test unique en cours...' }
      });

      const status = await invoicesPaymentApi.checkPayment(TEST_INVOICE_ID, TEST_TRANSACTION_ID);
      
      const result = {
        timestamp: new Date().toLocaleTimeString(),
        type: 'api_response',
        source: 'direct_api',
        status: status.status,
        data: status
      };
      
      console.log('📊 Test unique - résultat:', result);
      addResult(result);
    } catch (error) {
      const errorResult = {
        timestamp: new Date().toLocaleTimeString(),
        type: 'error',
        source: 'direct_api',
        status: 'error',
        data: { error: error.message }
      };
      console.error('❌ Test unique - erreur:', errorResult);
      addResult(errorResult);
    }
  };

  useEffect(() => {
    return () => {
      if (monitor) {
        monitor.stop();
      }
    };
  }, [monitor]);

  const getStatusColor = (type: string, status: string) => {
    if (type === 'error') return '#ffebee';
    if (status === 'paid') return '#e8f5e8';
    if (status === 'failed') return '#ffebee';
    if (type === 'info') return '#e3f2fd';
    return '#f8f9fa';
  };

  const getStatusIcon = (type: string, status: string) => {
    if (type === 'error') return '❌';
    if (status === 'paid') return '✅';
    if (status === 'failed') return '❌';
    if (type === 'info') return 'ℹ️';
    if (type === 'status_update') return '📊';
    if (type === 'api_response') return '📡';
    return '📋';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>🧪 Test Payment Monitor (Hybride)</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
        <p><strong>Invoice ID:</strong> {TEST_INVOICE_ID}</p>
        <p><strong>Transaction ID:</strong> {TEST_TRANSACTION_ID}</p>
        <p><strong>Mode:</strong> {enableRealtime ? 'Polling + Temps réel' : 'Polling seulement'}</p>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button onClick={testOnce} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc' }}>
          🎯 Test unique
        </button>
        
        <button 
          onClick={isMonitoring ? stopMonitoring : startMonitoring}
          style={{ 
            backgroundColor: isMonitoring ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px'
          }}
        >
          {isMonitoring ? '⏹️ Arrêter la surveillance' : '▶️ Démarrer la surveillance'}
        </button>

        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input 
            type="checkbox" 
            checked={enableRealtime}
            onChange={(e) => setEnableRealtime(e.target.checked)}
            disabled={isMonitoring}
          />
          Temps réel activé
        </label>

        <button 
          onClick={() => setResults([])}
          style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          🧹 Vider
        </button>
      </div>

      <div>
        <h3>📊 Résultats en temps réel ({results.length})</h3>
        
        {results.length === 0 ? (
          <p style={{ color: '#666', padding: '20px', textAlign: 'center' }}>
            Aucun résultat pour le moment...
          </p>
        ) : (
          <div style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px' }}>
            {results.map((result, index) => (
              <div 
                key={index}
                style={{ 
                  padding: '12px',
                  borderBottom: '1px solid #eee',
                  backgroundColor: getStatusColor(result.type, result.status)
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{getStatusIcon(result.type, result.status)}</span>
                    <span>{result.timestamp}</span>
                    <span style={{ 
                      backgroundColor: '#007bff', 
                      color: 'white', 
                      padding: '2px 6px', 
                      borderRadius: '12px', 
                      fontSize: '12px' 
                    }}>
                      {result.source}
                    </span>
                  </div>
                  <div style={{ 
                    color: result.status === 'paid' ? '#28a745' : 
                           result.status === 'failed' || result.type === 'error' ? '#dc3545' : '#6c757d',
                    fontWeight: 'bold'
                  }}>
                    {result.status}
                  </div>
                </div>
                <pre style={{ 
                  fontSize: '11px', 
                  background: 'rgba(0,0,0,0.05)', 
                  padding: '8px', 
                  borderRadius: '4px',
                  margin: 0,
                  overflow: 'auto'
                }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
        <h4>💡 Fonctionnalités testées :</h4>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li><strong>Polling intelligent</strong> : Vérification périodique avec exponential backoff</li>
          <li><strong>Notifications temps réel</strong> : Supabase Realtime pour les mises à jour instantanées</li>
          <li><strong>Gestion d'erreur robuste</strong> : Récupération automatique des erreurs réseau</li>
          <li><strong>Timeout automatique</strong> : Arrêt après 5 minutes</li>
          <li><strong>Logs détaillés</strong> : Traçabilité complète des opérations</li>
        </ul>
      </div>
    </div>
  );
};

export default TestPolling;
