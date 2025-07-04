// src/components/dashboard/DynamicContent.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, 
  HelpCircle, 
  FileText, 
  Megaphone,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { notificationManager } from '@/components/ui/notification-provider';
import { cn } from '@/lib/utils';

interface GeneratedContent {
  type: 'tips' | 'faq' | 'articles' | 'announcements';
  title: string;
  content: string;
  category?: string;
  priority: number;
  call_to_action?: {
    text: string;
    url: string;
  };
}

interface DynamicContentData {
  success: boolean;
  user_id: string;
  company_id: string;
  context_type: string;
  generated_content: GeneratedContent[];
  user_context_summary: string;
  generated_at: string;
}

interface DynamicContentProps {
  context_type?: 'dashboard' | 'support' | 'faq' | 'general';
  className?: string;
}

const DynamicContent: React.FC<DynamicContentProps> = ({ 
  context_type = 'dashboard',
  className 
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState<DynamicContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDynamicContent = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Obtenir le token de session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      // Appeler l'Edge Function dynamic-content-generator
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dynamic-content-generator`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            context_type,
            page_url: window.location.pathname,
            content_length: 'medium'
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: DynamicContentData = await response.json();
      setContent(data);
      
      console.log('Dynamic content loaded:', data);

    } catch (err) {
      console.error('Error fetching dynamic content:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Pas de notification d'erreur pour éviter de polluer l'interface
      // L'utilisateur peut réessayer manuellement via le bouton refresh
      // notificationManager.error(
      //   'Erreur',
      //   { message: 'Impossible de charger le contenu dynamique' }
      // );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDynamicContent();
  }, [user, context_type]);

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'tips':
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      case 'faq':
        return <HelpCircle className="h-5 w-5 text-blue-500" />;
      case 'articles':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'announcements':
        return <Megaphone className="h-5 w-5 text-purple-500" />;
      default:
        return <Sparkles className="h-5 w-5 text-orange-500" />;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'tips':
        return 'Conseil';
      case 'faq':
        return 'FAQ';
      case 'articles':
        return 'Article';
      case 'announcements':
        return 'Annonce';
      default:
        return 'Info';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'bg-red-100 text-red-800 border-red-200';
    if (priority >= 6) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  if (loading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">Contenu Personnalisé</CardTitle>
          </div>
          <CardDescription>
            Génération de contenu adapté à votre profil...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <RefreshCw className="h-5 w-5 animate-spin text-purple-500" />
            <span className="ml-2 text-sm text-muted-foreground">
              Personnalisation en cours...
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
      <Card className={cn("w-full border-red-200", className)}>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg text-red-700">Erreur</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <Button 
            onClick={fetchDynamicContent}
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

  if (!content || content.generated_content.length === 0) {
    return null; // Ne pas afficher si pas de contenu
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">Contenu Personnalisé</CardTitle>
          </div>
          <Button
            onClick={fetchDynamicContent}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          {content.user_context_summary}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence>
          {content.generated_content
            .sort((a, b) => b.priority - a.priority)
            .map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-l-4 border-l-purple-400 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getContentIcon(item.type)}
                        <div>
                          <h4 className="font-semibold text-base">
                            {item.title}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", getPriorityColor(item.priority))}
                            >
                              {getContentTypeLabel(item.type)}
                            </Badge>
                            {item.category && (
                              <Badge variant="secondary" className="text-xs">
                                {item.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {item.content}
                    </p>

                    {item.call_to_action && (
                      <div className="flex items-center justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => {
                            if (item.call_to_action?.url.startsWith('http')) {
                              window.open(item.call_to_action.url, '_blank');
                            } else {
                              window.location.href = item.call_to_action?.url || '/';
                            }
                          }}
                        >
                          {item.call_to_action.text}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </AnimatePresence>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <span>
                Contexte: {content.context_type}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Sparkles className="h-3 w-3" />
              <span>
                Généré le {new Date(content.generated_at).toLocaleString('fr-FR')}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DynamicContent;
