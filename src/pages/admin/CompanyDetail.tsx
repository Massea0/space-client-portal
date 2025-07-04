// src/pages/admin/CompanyDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Building, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Ticket, 
  FileText, 
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Sparkles,
  Target,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { notificationManager } from '@/components/ui/notification-provider';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

interface ClientRelationshipSummary {
  company_overview: {
    name: string;
    industry: string;
    relationship_duration_months: number;
    client_since: string;
  };
  financial_health: {
    total_revenue: number;
    average_invoice_amount: number;
    payment_reliability: 'excellent' | 'good' | 'fair' | 'poor';
    outstanding_amount: number;
    last_payment_date: string | null;
  };
  service_engagement: {
    active_services: string[];
    recent_projects: string[];
    satisfaction_score: number;
    support_volume: 'low' | 'medium' | 'high';
  };
  support_insights: {
    ticket_volume: number;
    avg_resolution_time_hours: number;
    sentiment_trend: 'positive' | 'neutral' | 'negative';
    common_issues: string[];
  };
  ai_insights: {
    relationship_status: 'excellent' | 'good' | 'at_risk' | 'critical';
    key_strengths: string[];
    areas_for_improvement: string[];
    recommended_actions: string[];
    next_touchpoint_suggestion: string;
  };
  generated_at: string;
}

interface RelationshipSummaryData {
  success: boolean;
  company_id: string;
  summary: ClientRelationshipSummary;
}

const CompanyDetail: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [summary, setSummary] = useState<RelationshipSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRelationshipSummary = async () => {
    if (!user || !companyId) return;

    setLoading(true);
    setError(null);

    try {
      // Obtenir le token de session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      // Appeler l'Edge Function client-relationship-summary
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/client-relationship-summary`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            company_id: companyId
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: RelationshipSummaryData = await response.json();
      setSummary(data);
      
      console.log('Relationship summary loaded:', data);

    } catch (err) {
      console.error('Error fetching relationship summary:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      notificationManager.error(
        'Erreur',
        { message: 'Impossible de charger la synthèse client' }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRelationshipSummary();
  }, [user, companyId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'at_risk':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="h-4 w-4" />;
      case 'good':
        return <Star className="h-4 w-4" />;
      case 'at_risk':
        return <AlertTriangle className="h-4 w-4" />;
      case 'critical':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPaymentReliabilityColor = (reliability: string) => {
    switch (reliability) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'fair':
        return 'text-orange-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSatisfactionColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600';
      case 'neutral':
        return 'text-blue-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button
            onClick={() => navigate('/admin/companies')}
            variant="ghost"
            size="sm"
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">Synthèse Client</h1>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-purple-500" />
          <span className="ml-2 text-muted-foreground">
            Génération de la synthèse IA...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button
            onClick={() => navigate('/admin/companies')}
            variant="ghost"
            size="sm"
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold text-red-700">Erreur</h1>
        </div>
        
        <Card className="border-red-200">
          <CardContent className="p-6">
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={fetchRelationshipSummary}
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button
            onClick={() => navigate('/admin/companies')}
            variant="ghost"
            size="sm"
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">Synthèse Client</h1>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Aucune donnée disponible</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { company_overview, financial_health, service_engagement, support_insights, ai_insights } = summary.summary;

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            onClick={() => navigate('/admin/companies')}
            variant="ghost"
            size="sm"
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Building className="h-6 w-6 mr-2" />
              {company_overview.name}
            </h1>
            <p className="text-muted-foreground">
              {company_overview.industry} • Client depuis {company_overview.relationship_duration_months} mois
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge 
            className={cn("text-sm", getStatusColor(ai_insights.relationship_status))}
          >
            {getStatusIcon(ai_insights.relationship_status)}
            <span className="ml-1 capitalize">{ai_insights.relationship_status}</span>
          </Badge>
          <Button
            onClick={fetchRelationshipSummary}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Métriques */}
        <div className="lg:col-span-2 space-y-6">
          {/* Santé Financière */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Santé Financière
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Chiffre d'affaires total</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(financial_health.total_revenue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Facture moyenne</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(financial_health.average_invoice_amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fiabilité paiement</p>
                  <p className={cn("text-xl font-bold capitalize", getPaymentReliabilityColor(financial_health.payment_reliability))}>
                    {financial_health.payment_reliability}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">En attente</p>
                  <p className={cn("text-xl font-bold", financial_health.outstanding_amount > 0 ? "text-red-600" : "text-green-600")}>
                    {formatCurrency(financial_health.outstanding_amount)}
                  </p>
                </div>
              </div>
              {financial_health.last_payment_date && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Dernier paiement : {formatDate(new Date(financial_health.last_payment_date))}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Engagement Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Engagement Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Score satisfaction</p>
                  <p className={cn("text-xl font-bold", getSatisfactionColor(service_engagement.satisfaction_score))}>
                    {service_engagement.satisfaction_score.toFixed(1)}/10
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Volume support</p>
                  <Badge variant={service_engagement.support_volume === 'high' ? 'destructive' : service_engagement.support_volume === 'medium' ? 'default' : 'secondary'}>
                    {service_engagement.support_volume}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Services actifs</p>
                  <p className="text-xl font-bold">{service_engagement.active_services.length}</p>
                </div>
              </div>
              
              {service_engagement.active_services.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Services utilisés :</p>
                  <div className="flex flex-wrap gap-2">
                    {service_engagement.active_services.map((service, index) => (
                      <Badge key={index} variant="outline">{service}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {service_engagement.recent_projects.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Projets récents :</p>
                  <div className="flex flex-wrap gap-2">
                    {service_engagement.recent_projects.slice(0, 5).map((project, index) => (
                      <Badge key={index} variant="secondary">{project}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Support Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Ticket className="h-5 w-5 mr-2 text-orange-600" />
                Insights Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tickets total</p>
                  <p className="text-xl font-bold">{support_insights.ticket_volume}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Temps résolution moyen</p>
                  <p className="text-xl font-bold">{support_insights.avg_resolution_time_hours}h</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sentiment global</p>
                  <p className={cn("text-xl font-bold capitalize", getSentimentColor(support_insights.sentiment_trend))}>
                    {support_insights.sentiment_trend}
                  </p>
                </div>
              </div>

              {support_insights.common_issues.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Problèmes fréquents :</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {support_insights.common_issues.slice(0, 3).map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite - IA Insights */}
        <div className="space-y-6">
          {/* Status & Insights IA */}
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                Insights IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Forces */}
              <div>
                <h4 className="font-medium flex items-center mb-2">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  Forces clés
                </h4>
                <ul className="text-sm space-y-1">
                  {ai_insights.key_strengths.map((strength, index) => (
                    <li key={index} className="text-green-700">• {strength}</li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Améliorations */}
              <div>
                <h4 className="font-medium flex items-center mb-2">
                  <Target className="h-4 w-4 mr-2 text-orange-600" />
                  Axes d'amélioration
                </h4>
                <ul className="text-sm space-y-1">
                  {ai_insights.areas_for_improvement.map((area, index) => (
                    <li key={index} className="text-orange-700">• {area}</li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Actions recommandées */}
              <div>
                <h4 className="font-medium flex items-center mb-2">
                  <Lightbulb className="h-4 w-4 mr-2 text-blue-600" />
                  Actions recommandées
                </h4>
                <ul className="text-sm space-y-1">
                  {ai_insights.recommended_actions.map((action, index) => (
                    <li key={index} className="text-blue-700">• {action}</li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Prochain contact */}
              <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3">
                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">
                  Prochain contact suggéré
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {ai_insights.next_touchpoint_suggestion}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-gray-600" />
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Client depuis</p>
                <p className="font-medium">{formatDate(new Date(company_overview.client_since))}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Secteur d'activité</p>
                <p className="font-medium">{company_overview.industry}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Durée relation</p>
                <p className="font-medium">{company_overview.relationship_duration_months} mois</p>
              </div>
              <div className="pt-2 border-t text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Analyse générée le {new Date(summary.summary.generated_at).toLocaleString('fr-FR')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
