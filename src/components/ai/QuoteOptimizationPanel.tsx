// src/components/ai/QuoteOptimizationPanel.tsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Zap, 
  TrendingUp, 
  Target,
  Brain,
  Lightbulb,
  DollarSign,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { aiService, QuoteOptimization } from '@/services/aiService';
import { Devis } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { notificationManager } from '@/components/ui/notification-provider';

interface QuoteOptimizationPanelProps {
  quote: Devis;
  onOptimizationApplied?: (optimizedAmount: number) => void;
}

const QuoteOptimizationPanel: React.FC<QuoteOptimizationPanelProps> = ({
  quote,
  onOptimizationApplied
}) => {
  const [optimization, setOptimization] = useState<QuoteOptimization | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateOptimization = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await aiService.optimizeQuote(quote.id);
      setOptimization(result);
      setExpanded(true);
      
      notificationManager.success(
        'Optimisation IA générée avec succès'
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'optimisation';
      setError(errorMessage);
      notificationManager.error(
        'Erreur d\'optimisation IA'
      );
    } finally {
      setLoading(false);
    }
  }, [quote.id]);

  const applyOptimization = useCallback(async () => {
    if (!optimization) return;
    
    setApplying(true);
    setError(null);
    
    try {
      const success = await aiService.applyAllOptimizations(quote.id, optimization);
      
      if (success) {
        notificationManager.success(
          'Optimisation appliquée avec succès au devis'
        );
        onOptimizationApplied?.(optimization.suggestedAmount);
        
        // Réinitialise le panel après application
        setOptimization(null);
        setExpanded(false);
      } else {
        throw new Error('Échec de l\'application de l\'optimisation');
      }
    } catch (error) {
      console.error('Erreur lors de l\'application de l\'optimisation:', error);
      setError('Erreur lors de l\'application de l\'optimisation');
      notificationManager.error(
        'Erreur lors de l\'application de l\'optimisation'
      );
    } finally {
      setApplying(false);
    }
  }, [optimization, quote.id, onOptimizationApplied]);

  const applySelectiveOptimization = useCallback(async (type: 'description' | 'pricing' | 'terms') => {
    if (!optimization) return;
    
    setApplying(true);
    setError(null);
    
    try {
      let success = false;
      let successMessage = '';
      
      switch (type) {
        case 'description':
          if (optimization.recommendations?.description?.[0]) {
            success = await aiService.applyDescriptionOptimization(quote.id, optimization.recommendations.description[0]);
            successMessage = 'Description optimisée appliquée avec succès';
          }
          break;
        case 'pricing':
          if (optimization.suggestedAmount !== optimization.originalAmount) {
            success = await aiService.applyPricingOptimization(quote.id, optimization.suggestedAmount);
            successMessage = 'Prix optimisé appliqué avec succès';
          }
          break;
        case 'terms':
          if (optimization.recommendations?.terms?.[0]) {
            success = await aiService.applyTermsOptimization(quote.id, optimization.recommendations.terms[0]);
            successMessage = 'Conditions optimisées appliquées avec succès';
          }
          break;
      }
      
      if (success) {
        notificationManager.success(successMessage);
        if (type === 'pricing') {
          onOptimizationApplied?.(optimization.suggestedAmount);
        }
      } else {
        throw new Error(`Échec de l'application de l'optimisation ${type}`);
      }
    } catch (error) {
      console.error(`Erreur lors de l'application de l'optimisation ${type}:`, error);
      setError(`Erreur lors de l'application de l'optimisation ${type}`);
      notificationManager.error(`Erreur lors de l'application de l'optimisation ${type}`);
    } finally {
      setApplying(false);
    }
  }, [optimization, quote.id, onOptimizationApplied, aiService]);

  const getOptimizationColor = (percentage: number) => {
    if (percentage > 0) return 'text-green-600';
    if (percentage < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getOptimizationIcon = (percentage: number) => {
    if (percentage > 0) return <ArrowUp className="w-4 h-4" />;
    if (percentage < 0) return <ArrowDown className="w-4 h-4" />;
    return <Target className="w-4 h-4" />;
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Optimisation IA du Devis
          </CardTitle>
          <Button
            onClick={generateOptimization}
            disabled={loading}
            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Zap className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
            {loading ? 'Analyse...' : 'Optimiser'}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <Brain className="w-4 h-4 animate-pulse text-purple-600" />
              L'IA analyse l'historique client et les tendances du marché...
            </div>
            <div className="space-y-2">
              <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        )}

        {optimization && !loading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Modèle de référence utilisé */}
            {optimization.referenceModel && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Modèle de Référence Utilisé</span>
                </div>
                <div className="text-sm text-blue-700">
                  <div className="font-medium">{optimization.referenceModel.title}</div>
                  <div className="text-xs mt-1">
                    Prix optimal: {formatCurrency(optimization.referenceModel.priceOptimal)}
                  </div>
                  <div className="text-xs">
                    Fourchette autorisée: {formatCurrency(optimization.referenceModel.allowedRange.min)} - {formatCurrency(optimization.referenceModel.allowedRange.max)}
                  </div>
                </div>
              </div>
            )}

            {/* Résumé de l'optimisation */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Montant original */}
                <div className="text-center">
                  <div className="text-xs text-gray-600 uppercase tracking-wide">Montant Original</div>
                  <div className="text-lg font-bold text-gray-800">
                    {formatCurrency(optimization.originalAmount)}
                  </div>
                </div>

                {/* Flèche et changement */}
                <div className="text-center flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    {getOptimizationIcon(optimization.optimizationPercentage)}
                    <Badge 
                      className={`${getOptimizationColor(optimization.optimizationPercentage)} bg-white border`}
                      variant="outline"
                    >
                      {optimization.optimizationPercentage > 0 ? '+' : ''}
                      {optimization.optimizationPercentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>

                {/* Montant suggéré */}
                <div className="text-center">
                  <div className="text-xs text-gray-600 uppercase tracking-wide">Montant Suggéré</div>
                  <div className="text-lg font-bold text-purple-700">
                    {formatCurrency(optimization.suggestedAmount)}
                  </div>
                </div>
              </div>
            </div>

            {/* Probabilité de conversion */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-600" />
                  Probabilité de conversion
                </span>
                <span className="text-sm font-bold text-green-600">
                  {Math.round(optimization.conversionProbability * 100)}%
                </span>
              </div>
              <Progress 
                value={optimization.conversionProbability * 100} 
                className="h-2"
              />
            </div>

            {/* Niveau de confiance */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Confiance de l'IA</span>
                <span className="text-sm font-bold">
                  {Math.round(optimization.confidence * 100)}%
                </span>
              </div>
              <Progress 
                value={optimization.confidence * 100} 
                className="h-1"
              />
            </div>

            {/* Raisonnement */}
            <div className="space-y-2">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <span className="text-sm font-medium flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  Analyse IA
                </span>
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
              
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-3 bg-blue-50 rounded border border-blue-200 text-sm text-blue-800"
                  >
                    {optimization.reasoning}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Recommandations */}
            {optimization.recommendations && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium">Recommandations IA</span>
                </div>

                {/* Recommandations de prix */}
                {optimization.recommendations.pricing && optimization.recommendations.pricing.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Stratégie Tarifaire</span>
                      {optimization.suggestedAmount !== optimization.originalAmount && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => applySelectiveOptimization('pricing')}
                          disabled={applying}
                          className="h-6 px-2 text-xs"
                        >
                          Appliquer Prix
                        </Button>
                      )}
                    </div>
                    {optimization.recommendations.pricing.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2 text-xs p-2 bg-green-50 rounded border border-green-200"
                      >
                        <DollarSign className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-green-800">{rec}</span>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Recommandations de description */}
                {optimization.recommendations.description && optimization.recommendations.description.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Amélioration Description</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => applySelectiveOptimization('description')}
                        disabled={applying}
                        className="h-6 px-2 text-xs"
                      >
                        Appliquer Description
                      </Button>
                    </div>
                    {optimization.recommendations.description.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2 text-xs p-2 bg-blue-50 rounded border border-blue-200"
                      >
                        <div className="w-1 h-1 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span className="text-blue-800">{rec}</span>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Recommandations de conditions */}
                {optimization.recommendations.terms && optimization.recommendations.terms.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Conditions Commerciales</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => applySelectiveOptimization('terms')}
                        disabled={applying}
                        className="h-6 px-2 text-xs"
                      >
                        Appliquer Conditions
                      </Button>
                    </div>
                    {optimization.recommendations.terms.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2 text-xs p-2 bg-purple-50 rounded border border-purple-200"
                      >
                        <div className="w-1 h-1 bg-purple-600 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span className="text-purple-800">{rec}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* Bouton d'application */}
            <div className="flex justify-center">
              <Button
                onClick={applyOptimization}
                disabled={applying}
                className="gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50"
              >
                <TrendingUp className={`w-4 h-4 ${applying ? 'animate-pulse' : ''}`} />
                {applying ? 'Application...' : 'Appliquer l\'Optimisation'}
              </Button>
            </div>
          </motion.div>
        )}

        {!optimization && !loading && (
          <div className="text-center py-8 text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Cliquez sur "Optimiser" pour analyser ce devis avec l'IA</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuoteOptimizationPanel;
