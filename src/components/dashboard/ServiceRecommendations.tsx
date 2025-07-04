// src/components/dashboard/ServiceRecommendations.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  Target, 
  Clock,
  ChevronRight,
  Star,
  DollarSign,
  Lightbulb,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { notificationManager } from '@/components/ui/notification-provider';
import { cn } from '@/lib/utils';

interface ServiceRecommendation {
  service_name: string;
  category: string;
  description: string;
  justification: string;
  priority_score: number;
  estimated_value: string;
}

interface RecommendationsData {
  success: boolean;
  user_id: string;
  company_id: string;
  recommendations: ServiceRecommendation[];
  user_profile_summary: string;
  generated_at: string;
}

const ServiceRecommendations: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Obtenir le token de session actuel
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      // Appeler l'Edge Function recommend-services
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/recommend-services`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: RecommendationsData = await response.json();
      setRecommendations(data);
      
      console.log('Service recommendations loaded:', data);

    } catch (err) {
      console.error('Error fetching service recommendations:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Pas de notification d'erreur pour éviter de polluer l'interface
      // notificationManager.error(
      //   'Erreur',
      //   { message: 'Impossible de charger les recommandations de services' }
      // );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  const getPriorityColor = (score: number) => {
    if (score >= 8) return 'bg-red-500';
    if (score >= 6) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  const getPriorityLabel = (score: number) => {
    if (score >= 8) return 'Haute priorité';
    if (score >= 6) return 'Moyenne priorité';
    return 'Basse priorité';
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'développement':
        return '💻';
      case 'marketing':
        return '📈';
      case 'data':
        return '📊';
      case 'sécurité':
        return '🔒';
      case 'infrastructure':
        return '☁️';
      case 'formation':
        return '🎓';
      case 'maintenance':
        return '🔧';
      case 'automatisation':
        return '⚡';
      default:
        return '🚀';
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">Recommandations IA</CardTitle>
          </div>
          <CardDescription>
            Analyse en cours de votre profil...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-purple-500" />
            <span className="ml-2 text-sm text-muted-foreground">
              Génération des recommandations...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    // Si l'erreur est liée à l'authentification, on masque le composant complètement
    if (error.includes('401') || error.includes('Invalid authentication')) {
      return null;
    }
    
    return (
      <Card className="w-full border-red-200">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg text-red-700">Erreur</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <Button 
            onClick={fetchRecommendations}
            variant="outline"
            size="sm"
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || recommendations.recommendations.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">Recommandations IA</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Aucune recommandation disponible pour le moment
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">Recommandations IA</CardTitle>
          </div>
          <Button
            onClick={fetchRecommendations}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          {recommendations.user_profile_summary}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence>
          {recommendations.recommendations.map((recommendation, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {getCategoryIcon(recommendation.category)}
                      </span>
                      <div>
                        <h4 className="font-semibold text-base">
                          {recommendation.service_name}
                        </h4>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs text-white",
                            getPriorityColor(recommendation.priority_score)
                          )}
                        >
                          <Star className="h-3 w-3 mr-1" />
                          {getPriorityLabel(recommendation.priority_score)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {recommendation.estimated_value}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {recommendation.description}
                  </p>

                  <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 mb-3">
                    <div className="flex items-start space-x-2">
                      <Target className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-purple-800 dark:text-purple-200 mb-1">
                          Pourquoi ce service ?
                        </p>
                        <p className="text-xs text-purple-700 dark:text-purple-300">
                          {recommendation.justification}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="text-xs">
                        {recommendation.category}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Score: {recommendation.priority_score}/10
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">
                      En savoir plus
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>
                Mis à jour: {new Date(recommendations.generated_at).toLocaleString('fr-FR')}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Sparkles className="h-3 w-3" />
              <span>Alimenté par Gemini AI</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceRecommendations;
