// src/components/ai/PaymentPredictionCard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Target,
  Brain,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { aiService, PaymentPrediction } from '@/services/aiService';
import { Invoice } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { notificationManager } from '@/components/ui/notification-provider';

interface PaymentPredictionCardProps {
  invoice: Invoice;
  onPredictionUpdate?: (prediction: PaymentPrediction) => void;
}

const PaymentPredictionCard: React.FC<PaymentPredictionCardProps> = ({
  invoice,
  onPredictionUpdate
}) => {
  const [prediction, setPrediction] = useState<PaymentPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPrediction = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await aiService.predictPayment(invoice.id);
      setPrediction(result);
      onPredictionUpdate?.(result);
      
      notificationManager.success(
        'Prédiction de paiement générée'
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la prédiction';
      setError(errorMessage);
      notificationManager.error(
        'Erreur de prédiction'
      );
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return <CheckCircle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <TrendingDown className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 0.7) return 'text-green-600';
    if (probability >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Charger la prédiction au montage
  useEffect(() => {
    loadPrediction();
  }, [invoice.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              Prédiction de Paiement IA
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={loadPrediction}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              {error}
            </div>
          )}

          {loading && (
            <div className="space-y-3">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Brain className="w-4 h-4 animate-pulse" />
                Analyse en cours par l'IA...
              </div>
            </div>
          )}

          {prediction && !loading && (
            <div className="space-y-4">
              {/* Probabilité de paiement */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Probabilité de paiement</span>
                  <span className={`text-sm font-bold ${getProbabilityColor(prediction.paymentProbability)}`}>
                    {Math.round(prediction.paymentProbability * 100)}%
                  </span>
                </div>
                <Progress 
                  value={prediction.paymentProbability * 100} 
                  className="h-2"
                />
              </div>

              {/* Niveau de risque */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Niveau de risque</span>
                <Badge 
                  className={`flex items-center gap-1 ${getRiskColor(prediction.riskLevel)}`}
                  variant="outline"
                >
                  {getRiskIcon(prediction.riskLevel)}
                  {prediction.riskLevel.toUpperCase()}
                </Badge>
              </div>

              {/* Date prédite */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Paiement prédit le</span>
                </div>
                <span className="text-sm font-bold text-blue-700">
                  {formatDate(new Date(prediction.predictedPaymentDate))}
                </span>
              </div>

              {/* Niveau de confiance */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Confiance de l'IA</span>
                  <span className="text-sm font-bold">
                    {Math.round(prediction.confidence * 100)}%
                  </span>
                </div>
                <Progress 
                  value={prediction.confidence * 100} 
                  className="h-1"
                />
              </div>

              {/* Recommandations */}
              {prediction.recommendations && prediction.recommendations.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium">Recommandations IA</span>
                  </div>
                  <div className="space-y-1">
                    {prediction.recommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2 text-xs p-2 bg-yellow-50 rounded border border-yellow-200"
                      >
                        <div className="w-1 h-1 bg-yellow-600 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span className="text-yellow-800">{rec}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Informations sur la facture */}
              <div className="pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">Facture:</span> {invoice.number}
                  </div>
                  <div>
                    <span className="font-medium">Montant:</span> {formatCurrency(invoice.amount)}
                  </div>
                  <div>
                    <span className="font-medium">Échéance:</span> {formatDate(invoice.dueDate)}
                  </div>
                  <div>
                    <span className="font-medium">Client:</span> {invoice.companyName}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PaymentPredictionCard;
