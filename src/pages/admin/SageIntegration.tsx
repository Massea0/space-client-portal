// src/pages/admin/SageIntegration.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Settings, 
  FileDown,
  RefreshCw,
  Eye,
  CheckSquare,
  X
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { notificationManager } from '@/components/ui/notification-provider';
import { supabase } from '@/lib/supabase';

// Types pour l'intégration Sage
interface SageInvoice {
  id: string;
  number: string;
  company_name?: string;
  amount: number;
  currency: string;
  paid_at: string;
  sage_export_status: string;
  sage_export_details?: any;
  sage_anomalies?: any[];
  sage_validation_needed: boolean;
  sage_export_at?: string;
  sage_transaction_id?: string;
  dexchange_transaction_id?: string;
}

interface SageStats {
  pending_validation: number;
  ai_processed: number;
  exported: number;
  failed: number;
  total_amount_pending: number;
}

export default function SageIntegration() {
  const [invoices, setInvoices] = useState<SageInvoice[]>([]);
  const [stats, setStats] = useState<SageStats>({
    pending_validation: 0,
    ai_processed: 0,
    exported: 0,
    failed: 0,
    total_amount_pending: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SageInvoice | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  // Charger les données
  const loadSageData = async () => {
    try {
      const { data: invoicesData, error } = await supabase
        .from('invoices')
        .select(`
          id, number, amount, currency, paid_at,
          sage_export_status, sage_export_details, sage_anomalies,
          sage_validation_needed, sage_export_at, sage_transaction_id,
          dexchange_transaction_id,
          companies(name)
        `)
        .in('sage_export_status', ['ai_processed', 'pending_validation', 'exported', 'export_failed'])
        .order('paid_at', { ascending: false });

      if (error) throw error;

      const processedInvoices = (invoicesData || []).map(inv => ({
        ...inv,
        company_name: inv.companies?.name || 'N/A'
      }));

      setInvoices(processedInvoices);

      // Calculer les statistiques
      const newStats = processedInvoices.reduce((acc, inv) => {
        switch (inv.sage_export_status) {
          case 'ai_processed':
            acc.ai_processed++;
            acc.total_amount_pending += inv.amount;
            break;
          case 'pending_validation':
            acc.pending_validation++;
            acc.total_amount_pending += inv.amount;
            break;
          case 'exported':
            acc.exported++;
            break;
          case 'export_failed':
            acc.failed++;
            break;
        }
        return acc;
      }, {
        pending_validation: 0,
        ai_processed: 0,
        exported: 0,
        failed: 0,
        total_amount_pending: 0
      });

      setStats(newStats);
    } catch (error) {
      console.error('Erreur chargement données Sage:', error);
      notificationManager.show('Erreur lors du chargement des données Sage', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSageData();
  }, []);

  // Rafraîchir les données
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSageData();
  };

  // Exporter vers Sage
  const handleExportToSage = async (invoiceId: string) => {
    setExporting(invoiceId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Session expirée');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/execute-sage-export`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ invoice_id: invoiceId })
        }
      );

      const result = await response.json();

      if (result.success) {
        notificationManager.show('Export vers Sage réussi !', 'success');
        await loadSageData(); // Recharger les données
      } else {
        throw new Error(result.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur export Sage:', error);
      notificationManager.show(`Erreur export Sage: ${error.message}`, 'error');
    } finally {
      setExporting(null);
    }
  };

  // Rejeter l'export
  const handleRejectExport = async (invoiceId: string) => {
    setExporting(invoiceId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Session expirée');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/execute-sage-export`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ invoice_id: invoiceId, action: 'reject' })
        }
      );

      const result = await response.json();

      if (result.success) {
        notificationManager.show('Export rejeté', 'success');
        await loadSageData();
      } else {
        throw new Error(result.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur rejet export:', error);
      notificationManager.show(`Erreur: ${error.message}`, 'error');
    } finally {
      setExporting(null);
    }
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ai_processed':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Traité par IA</Badge>;
      case 'pending_validation':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'exported':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Exporté</Badge>;
      case 'export_failed':
        return <Badge variant="destructive">Échec</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Obtenir l'icône de statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ai_processed':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending_validation':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'exported':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'export_failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Intégration Sage</h1>
          <p className="text-gray-600 mt-2">
            Gestion des exports comptables vers Sage
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">À valider</p>
                <p className="text-2xl font-bold text-blue-600">{stats.ai_processed}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending_validation}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Exportés</p>
                <p className="text-2xl font-bold text-green-600">{stats.exported}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Montant total</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(stats.total_amount_pending)}
                </p>
              </div>
              <FileDown className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">À Valider ({stats.ai_processed})</TabsTrigger>
          <TabsTrigger value="validation">En Attente ({stats.pending_validation})</TabsTrigger>
          <TabsTrigger value="exported">Exportés ({stats.exported})</TabsTrigger>
          <TabsTrigger value="failed">Échecs ({stats.failed})</TabsTrigger>
        </TabsList>

        {/* À valider */}
        <TabsContent value="pending" className="space-y-4">
          {invoices.filter(inv => inv.sage_export_status === 'ai_processed').map(invoice => (
            <Card key={invoice.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(invoice.sage_export_status)}
                      <h3 className="text-lg font-semibold">{invoice.number}</h3>
                      {getStatusBadge(invoice.sage_export_status)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Entreprise:</span>
                        <p className="font-medium">{invoice.company_name}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Montant:</span>
                        <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Payé le:</span>
                        <p className="font-medium">{formatDate(invoice.paid_at)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Transaction DX:</span>
                        <p className="font-medium text-xs">{invoice.dexchange_transaction_id}</p>
                      </div>
                    </div>

                    {/* Anomalies détectées */}
                    {invoice.sage_anomalies && invoice.sage_anomalies.length > 0 && (
                      <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription>
                          <strong>Anomalies détectées:</strong>
                          <ul className="mt-2 list-disc list-inside">
                            {invoice.sage_anomalies.map((anomaly, idx) => (
                              <li key={idx} className="text-sm">
                                {anomaly.message} ({anomaly.field})
                              </li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedInvoice(invoice)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Détails
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleExportToSage(invoice.id)}
                      disabled={exporting === invoice.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckSquare className="h-4 w-4 mr-1" />
                      Valider & Exporter
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRejectExport(invoice.id)}
                      disabled={exporting === invoice.id}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Rejeter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {invoices.filter(inv => inv.sage_export_status === 'ai_processed').length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                Aucune facture en attente de validation
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* En attente */}
        <TabsContent value="validation" className="space-y-4">
          {invoices.filter(inv => inv.sage_export_status === 'pending_validation').map(invoice => (
            <Card key={invoice.id} className="border-l-4 border-l-yellow-500">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(invoice.sage_export_status)}
                      <h3 className="text-lg font-semibold">{invoice.number}</h3>
                      {getStatusBadge(invoice.sage_export_status)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Entreprise:</span>
                        <p className="font-medium">{invoice.company_name}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Montant:</span>
                        <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Payé le:</span>
                        <p className="font-medium">{formatDate(invoice.paid_at)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Transaction DX:</span>
                        <p className="font-medium text-xs">{invoice.dexchange_transaction_id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedInvoice(invoice)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Détails
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Exportés */}
        <TabsContent value="exported" className="space-y-4">
          {invoices.filter(inv => inv.sage_export_status === 'exported').map(invoice => (
            <Card key={invoice.id} className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(invoice.sage_export_status)}
                      <h3 className="text-lg font-semibold">{invoice.number}</h3>
                      {getStatusBadge(invoice.sage_export_status)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Entreprise:</span>
                        <p className="font-medium">{invoice.company_name}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Montant:</span>
                        <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Exporté le:</span>
                        <p className="font-medium">{formatDate(invoice.sage_export_at)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">ID Sage:</span>
                        <p className="font-medium text-xs">{invoice.sage_transaction_id}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Transaction DX:</span>
                        <p className="font-medium text-xs">{invoice.dexchange_transaction_id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedInvoice(invoice)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Détails
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Échecs */}
        <TabsContent value="failed" className="space-y-4">
          {invoices.filter(inv => inv.sage_export_status === 'export_failed').map(invoice => (
            <Card key={invoice.id} className="border-l-4 border-l-red-500">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(invoice.sage_export_status)}
                      <h3 className="text-lg font-semibold">{invoice.number}</h3>
                      {getStatusBadge(invoice.sage_export_status)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Entreprise:</span>
                        <p className="font-medium">{invoice.company_name}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Montant:</span>
                        <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Tentative le:</span>
                        <p className="font-medium">{formatDate(invoice.sage_export_at)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Transaction DX:</span>
                        <p className="font-medium text-xs">{invoice.dexchange_transaction_id}</p>
                      </div>
                    </div>

                    {/* Erreur d'export */}
                    {invoice.sage_export_details?.error_message && (
                      <Alert className="mt-4 border-red-200 bg-red-50">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription>
                          <strong>Erreur d'export:</strong> {invoice.sage_export_details.error_message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedInvoice(invoice)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Détails
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleExportToSage(invoice.id)}
                      disabled={exporting === invoice.id}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Réessayer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Modal de détails */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Détails de l'export Sage - {selectedInvoice.number}
                <Button variant="ghost" size="sm" onClick={() => setSelectedInvoice(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Données formatées par l'IA */}
              {selectedInvoice.sage_export_details && (
                <div>
                  <h4 className="font-semibold mb-2">Données formatées pour Sage:</h4>
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                    {JSON.stringify(selectedInvoice.sage_export_details, null, 2)}
                  </pre>
                </div>
              )}

              {/* Anomalies */}
              {selectedInvoice.sage_anomalies && selectedInvoice.sage_anomalies.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Anomalies détectées:</h4>
                  <div className="space-y-2">
                    {selectedInvoice.sage_anomalies.map((anomaly, idx) => (
                      <Alert key={idx} className="border-yellow-200 bg-yellow-50">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription>
                          <strong>{anomaly.level}:</strong> {anomaly.message}
                          {anomaly.suggestion && (
                            <p className="mt-1 text-sm text-gray-600">
                              Suggestion: {anomaly.suggestion}
                            </p>
                          )}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
