// Composant d'affichage des analytics IA du dashboard
// Mission 4: Dashboard Analytics IA - Insights Stratégiques
// Fichier: /src/components/dashboard/AIDashboardAnalytics.tsx

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, TrendingDown, Minus, Brain, AlertTriangle, 
  CheckCircle, Info, XCircle, BarChart3, PieChart as PieChartIcon,
  Activity, DollarSign, Users, Zap, Lightbulb, Target
} from "lucide-react";
import { supabase } from '@/lib/supabaseClient';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface DashboardAnalytics {
  summary: string;
  insights: string[];
  metrics: {
    tickets: {
      total: number;
      resolved: number;
      pending: number;
      proactive?: number;
    };
    financial: {
      total_invoices: number;
      paid_invoices: number;
      pending_invoices: number;
      overdue_invoices: number;
      total_revenue: number;
      conversion_rate?: number;
    };
    activity: {
      total_logs: number;
      critical_activities: number;
      most_common_activity?: string;
    };
    trends: {
      tickets_trend: 'increasing' | 'decreasing' | 'stable';
      revenue_trend: 'up' | 'down' | 'stable';
      satisfaction_trend: 'improving' | 'declining' | 'stable';
    };
  };
  alerts: Array<{
    type: 'warning' | 'info' | 'success' | 'error';
    message: string;
    priority: number;
  }>;
  recommendations: string[];
}

const AIDashboardAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (showRefreshing = false) => {
    if (!user) return;

    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('📊 Récupération analytics IA dashboard...');

      // Récupérer la session actuelle pour l'authentification
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        throw new Error('Session non trouvée');
      }

      // Appeler l'Edge Function avec authentification explicite
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dashboard-analytics-generator`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.data.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            period_days: 30 // Analyse sur 30 jours
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Analytics reçues:', data);
      setAnalytics(data);

    } catch (err) {
      console.error('❌ Erreur récupération analytics:', err);
      setError(err.message || 'Erreur lors du chargement des analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
      case 'up':
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing':
      case 'down':
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'error':
        return 'destructive' as const;
      case 'warning':
        return 'default' as const;
      case 'success':
        return 'default' as const;
      default:
        return 'default' as const;
    }
  };

  // Données pour les graphiques
  const ticketsChartData = analytics ? [
    { name: 'Résolus', value: analytics.metrics.tickets.resolved, color: '#10B981' },
    { name: 'En cours', value: analytics.metrics.tickets.pending, color: '#F59E0B' },
    { name: 'Proactifs', value: analytics.metrics.tickets.proactive || 0, color: '#3B82F6' }
  ] : [];

  const financialChartData = analytics ? [
    { name: 'Payées', value: analytics.metrics.financial.paid_invoices, color: '#10B981' },
    { name: 'En attente', value: analytics.metrics.financial.pending_invoices, color: '#F59E0B' },
    { name: 'En retard', value: analytics.metrics.financial.overdue_invoices, color: '#EF4444' }
  ] : [];

  const performanceData = analytics ? [
    {
      subject: 'Support',
      score: Math.round((analytics.metrics.tickets.resolved / Math.max(1, analytics.metrics.tickets.total)) * 100),
      fullMark: 100
    },
    {
      subject: 'Financier',
      score: Math.round((analytics.metrics.financial.paid_invoices / Math.max(1, analytics.metrics.financial.total_invoices)) * 100),
      fullMark: 100
    },
    {
      subject: 'Activité',
      score: Math.max(0, 100 - (analytics.metrics.activity.critical_activities * 10)),
      fullMark: 100
    }
  ] : [];

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <Brain className="h-8 w-8 animate-pulse mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-muted-foreground">Génération des insights IA...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={() => fetchAnalytics()}
              >
                Réessayer
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton de rafraîchissement */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Analytics IA</h2>
          <Badge variant="outline" className="text-xs">
            Derniers 30 jours
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchAnalytics(true)}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <Activity className={refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          {refreshing ? 'Actualisation...' : 'Actualiser'}
        </Button>
      </div>

      {/* Résumé IA */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Synthèse Intelligente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{analytics.summary}</p>
        </CardContent>
      </Card>

      {/* Alertes */}
      {analytics.alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertes Prioritaires
          </h3>
          {analytics.alerts
            .sort((a, b) => b.priority - a.priority)
            .map((alert, index) => (
              <Alert key={index} variant={getAlertVariant(alert.type)}>
                {getAlertIcon(alert.type)}
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))
          }
        </div>
      )}

      {/* Métriques Clés */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.metrics.tickets.total}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(analytics.metrics.trends.tickets_trend)}
              <span>{analytics.metrics.tickets.resolved} résolus</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics.metrics.financial.total_revenue)}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(analytics.metrics.trends.revenue_trend)}
              <span>{analytics.metrics.financial.paid_invoices} factures payées</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activité</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.metrics.activity.total_logs}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(analytics.metrics.trends.satisfaction_trend)}
              <span>{analytics.metrics.activity.critical_activities} critiques</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Répartition des Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Légende personnalisée */}
              <div className="flex flex-wrap gap-4 justify-center">
                {ticketsChartData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className="text-sm font-medium">
                      {entry.name}: {entry.value}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Graphique sans labels internes */}
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={ticketsChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {ticketsChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value, name]}
                    labelFormatter={() => ''}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* État Financier */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              État des Factures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Légende personnalisée pour les barres */}
              <div className="flex flex-wrap gap-4 justify-center">
                {financialChartData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className="text-sm font-medium">
                      {entry.name}: {entry.value}
                    </span>
                  </div>
                ))}
              </div>
              
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={financialChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [value, 'Factures']}
                    labelFormatter={(label) => `Type: ${label}`}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {financialChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Radar de Performance */}
      {performanceData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Score de Performance Global
            </CardTitle>
            <CardDescription>
              Évaluation IA des différents aspects de votre activité
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={performanceData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Insights et Recommandations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Insights Clés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Recommandations IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-800">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIDashboardAnalytics;
