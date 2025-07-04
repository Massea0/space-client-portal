// src/components/ai/AIAlertsCenter.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Brain,
  AlertTriangle,
  TrendingUp,
  Users,
  DollarSign,
  X,
  Check,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { aiService, AIAlert } from '@/services/aiService';
import { formatDate } from '@/lib/utils';
import { notificationManager } from '@/components/ui/notification-provider';

interface AIAlertsCenterProps {
  className?: string;
}

const AIAlertsCenter: React.FC<AIAlertsCenterProps> = ({ className }) => {
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const result = await aiService.getActiveAlerts();
      setAlerts(result);
    } catch (error) {
      notificationManager.error(
        'Erreur lors du chargement des alertes IA'
      );
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      await aiService.updateAlertStatus(alertId, 'dismissed');
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      notificationManager.success('Alerte ignorée');
    } catch (error) {
      notificationManager.error('Erreur lors de la mise à jour de l\'alerte');
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await aiService.updateAlertStatus(alertId, 'resolved');
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      notificationManager.success('Alerte résolue');
    } catch (error) {
      notificationManager.error('Erreur lors de la résolution de l\'alerte');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 border-red-300 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': 
      case 'high': 
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium': 
        return <TrendingUp className="w-4 h-4" />;
      case 'low': 
        return <Eye className="w-4 h-4" />;
      default: 
        return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment_reminder': return <DollarSign className="w-4 h-4" />;
      case 'quote_optimization': return <TrendingUp className="w-4 h-4" />;
      case 'client_analysis': return <Users className="w-4 h-4" />;
      case 'revenue_prediction': return <Brain className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const filteredAlerts = alerts.filter(alert => 
    filter === 'all' || alert.priority === filter
  );

  const highPriorityCount = alerts.filter(alert => 
    alert.priority === 'urgent' || alert.priority === 'high'
  ).length;

  useEffect(() => {
    loadAlerts();
  }, []);

  return (
    <Card className={`border-l-4 border-l-indigo-500 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            Centre d'Alertes IA
            {highPriorityCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {highPriorityCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="gap-2"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {expanded ? 'Réduire' : 'Développer'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadAlerts}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Filtres */}
              <div className="flex gap-2 flex-wrap">
                {['all', 'urgent', 'high', 'medium', 'low'].map(priority => (
                  <Button
                    key={priority}
                    variant={filter === priority ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(priority as any)}
                    className="text-xs"
                  >
                    {priority === 'all' ? 'Toutes' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                    {priority !== 'all' && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {alerts.filter(a => a.priority === priority).length}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>

              {/* Liste des alertes */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredAlerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">
                      {filter === 'all' ? 'Aucune alerte active' : `Aucune alerte de priorité ${filter}`}
                    </p>
                  </div>
                ) : (
                  filteredAlerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border ${getPriorityColor(alert.priority)}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          {/* En-tête de l'alerte */}
                          <div className="flex items-center gap-2">
                            {getTypeIcon(alert.type)}
                            <span className="font-medium text-sm">{alert.title}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getPriorityColor(alert.priority)}`}
                            >
                              {getPriorityIcon(alert.priority)}
                              {alert.priority.toUpperCase()}
                            </Badge>
                          </div>

                          {/* Message */}
                          <p className="text-sm opacity-90">
                            {alert.message}
                          </p>

                          {/* Données supplémentaires */}
                          {alert.data && (
                            <div className="text-xs opacity-75 bg-white bg-opacity-50 p-2 rounded">
                              <pre className="font-mono text-xs">
                                {JSON.stringify(alert.data, null, 2)}
                              </pre>
                            </div>
                          )}

                          {/* Métadonnées */}
                          <div className="flex items-center gap-4 text-xs opacity-75">
                            <span>Créée le {formatDate(alert.createdAt)}</span>
                            {alert.expiresAt && (
                              <span>Expire le {formatDate(alert.expiresAt)}</span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resolveAlert(alert.id)}
                            className="gap-1 h-8 px-2"
                          >
                            <Check className="w-3 h-3" />
                            Résoudre
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => dismissAlert(alert.id)}
                            className="gap-1 h-8 px-2"
                          >
                            <X className="w-3 h-3" />
                            Ignorer
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vue compacte quand réduit */}
        {!expanded && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {alerts.length} alertes actives
              </div>
              {highPriorityCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {highPriorityCount} priorité haute
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(true)}
              className="text-indigo-600 hover:text-indigo-700"
            >
              Voir tout
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAlertsCenter;
