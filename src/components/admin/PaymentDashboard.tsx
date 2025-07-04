import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface PaymentStats {
  date: string;
  total_payments: number;
  wave_payments: number;
  successful_payments: number;
  failed_payments: number;
  total_amount: number;
  wave_amount: number;
  auto_marked_count: number;
  webhook_received_count: number;
  success_rate: number;
  average_amount: number;
}

interface PaymentAlert {
  id: string;
  type: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  metadata: any;
  resolved: boolean;
  created_at: string;
}

interface DashboardData {
  today_stats: PaymentStats;
  week_stats: PaymentStats[];
  month_stats: PaymentStats[];
  recent_alerts: PaymentAlert[];
  system_health: {
    webhook_reliability: number;
    auto_marking_success_rate: number;
    payment_success_rate: number;
    last_webhook_received: string | null;
    last_successful_payment: string | null;
  };
  trends: {
    daily_growth: number;
    weekly_growth: number;
    monthly_growth: number;
  };
}

const PaymentDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.functions.invoke('payment-dashboard');

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Erreur lors du chargement du dashboard:', err);
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const runAlertCheck = async () => {
    try {
      const { data, error: alertError } = await supabase.functions.invoke('payment-alerts-monitor');
      
      if (alertError) {
        throw new Error(alertError.message);
      }

      // Recharger les données après vérification des alertes
      await fetchDashboardData();
    } catch (err: any) {
      console.error('Erreur lors de la vérification des alertes:', err);
      setError(err.message || 'Erreur lors de la vérification des alertes');
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Actualiser toutes les 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getHealthStatus = (value: number, goodThreshold: number = 80) => {
    if (value >= goodThreshold) return { color: 'text-green-600', icon: CheckCircle, status: 'Excellent' };
    if (value >= 50) return { color: 'text-yellow-600', icon: AlertTriangle, status: 'Moyen' };
    return { color: 'text-red-600', icon: AlertTriangle, status: 'Problème' };
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getAlertBadgeColor = (level: string) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement du dashboard...</span>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button onClick={fetchDashboardData} variant="outline" size="sm" className="ml-2">
            Réessayer
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Paiements Wave</h2>
          <p className="text-muted-foreground">
            Monitoring en temps réel du système de paiement
            {lastUpdated && (
              <span className="ml-2">
                • Dernière mise à jour: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runAlertCheck} variant="outline" size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Vérifier Alertes
          </Button>
          <Button onClick={fetchDashboardData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paiements Aujourd'hui</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.today_stats.total_payments}</div>
            <div className="text-xs text-muted-foreground flex items-center">
              {getTrendIcon(dashboardData.trends.daily_growth)}
              <span className="ml-1">{formatPercentage(dashboardData.trends.daily_growth)} vs hier</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus du Jour</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.today_stats.total_amount)}</div>
            <div className="text-xs text-muted-foreground">
              Montant moyen: {formatCurrency(dashboardData.today_stats.average_amount)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Réussite</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(dashboardData.today_stats.success_rate)}</div>
            <div className="text-xs text-muted-foreground">
              {dashboardData.today_stats.successful_payments}/{dashboardData.today_stats.total_payments} réussis
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhooks Reçus</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.today_stats.webhook_received_count}</div>
            <div className="text-xs text-muted-foreground">
              Fiabilité: {formatPercentage(dashboardData.system_health.webhook_reliability)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Santé du système */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Santé du Système
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Fiabilité Webhooks</span>
                <Badge variant="secondary">{formatPercentage(dashboardData.system_health.webhook_reliability)}</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(dashboardData.system_health.webhook_reliability, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Marquage Automatique</span>
                <Badge variant="secondary">{formatPercentage(dashboardData.system_health.auto_marking_success_rate)}</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(dashboardData.system_health.auto_marking_success_rate, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Taux de Succès</span>
                <Badge variant="secondary">{formatPercentage(dashboardData.system_health.payment_success_rate)}</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(dashboardData.system_health.payment_success_rate, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Dernier webhook: </span>
              <span className="font-medium ml-1">
                {dashboardData.system_health.last_webhook_received 
                  ? new Date(dashboardData.system_health.last_webhook_received).toLocaleString()
                  : 'Aucun'
                }
              </span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Dernier paiement: </span>
              <span className="font-medium ml-1">
                {dashboardData.system_health.last_successful_payment 
                  ? new Date(dashboardData.system_health.last_successful_payment).toLocaleString()
                  : 'Aucun'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertes récentes */}
      {dashboardData.recent_alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alertes Récentes
              <Badge variant="outline" className="ml-2">
                {dashboardData.recent_alerts.filter(alert => !alert.resolved).length} active{dashboardData.recent_alerts.filter(alert => !alert.resolved).length !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.recent_alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getAlertBadgeColor(alert.level)}>{alert.level}</Badge>
                      <span className="text-sm font-medium">{alert.type}</span>
                      {alert.resolved && <Badge variant="outline">Résolu</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PaymentDashboard;
