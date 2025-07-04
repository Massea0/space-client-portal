// src/components/contracts/ContractDetailsModal.tsx
import React, { useState } from 'react';
import { X, FileText, Download, Edit, Shield, Calendar, CheckCircle, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedModal } from '@/components/ui/animated-modal';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatDate } from '@/lib/utils';
import { notificationManager } from '@/components/ui/notification-provider';
import { contractsAI } from '@/services/contracts';
import type { Contract } from '@/types/contracts';

interface ContractDetailsModalProps {
  contract: Contract;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

const ContractDetailsModal: React.FC<ContractDetailsModalProps> = ({
  contract,
  isOpen,
  onClose,
  onUpdated
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fonction pour lancer l'analyse IA
  const handleAnalyzeIA = async () => {
    try {
      setIsAnalyzing(true);
      
      await contractsAI.analyzeContractCompliance({
        contractId: contract.id,
        contractContent: contract.contentPreview || '',
        analysisType: 'compliance'
      });

      notificationManager.success('Analyse IA lancée', {
        message: 'L\'analyse de conformité est en cours...'
      });
      
      onUpdated?.();
    } catch (error) {
      console.error('Erreur lors de l\'analyse IA:', error);
      notificationManager.error('Erreur', {
        message: 'Impossible de lancer l\'analyse IA'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Fonction pour télécharger le contrat
  const handleDownload = () => {
    notificationManager.info('Téléchargement', {
      message: 'Fonctionnalité de téléchargement à implémenter'
    });
  };

  // Fonction pour éditer
  const handleEdit = () => {
    notificationManager.info('Édition', {
      message: 'Fonctionnalité d\'édition à implémenter'
    });
  };

  // Obtenir la couleur du badge selon le statut
  const getStatusBadgeVariant = (status: Contract['status']) => {
    switch (status) {
      case 'draft': return 'outline';
      case 'review': return 'secondary';
      case 'pending_client': return 'default';
      case 'signed': return 'default';
      case 'expired': return 'destructive';
      case 'terminated': return 'destructive';
      case 'renewed': return 'default';
      default: return 'outline';
    }
  };

  // Obtenir le libellé du statut
  const getStatusLabel = (status: Contract['status']) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'review': return 'En révision';
      case 'pending_client': return 'En attente client';
      case 'signed': return 'Signé';
      case 'expired': return 'Expiré';
      case 'terminated': return 'Résilié';
      case 'renewed': return 'Renouvelé';
      default: return status;
    }
  };

  return (
    <AnimatedModal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={`${contract.title} - ${contract.contractNumber}`}
      description={`Contrat ${contract.contractNumber} - ${contract.clientName}`}
      size="xl"
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalyzeIA}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Analyse...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Analyser IA
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Éditer
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </div>
          <Button onClick={onClose}>
            Fermer
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* En-tête avec badges */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h2 className="text-xl font-semibold">{contract.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant(contract.status)}>
              {getStatusLabel(contract.status)}
            </Badge>
            {contract.generatedByAi && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <Wand2 className="h-3 w-3 mr-1" />
                IA
              </Badge>
            )}
          </div>
        </div>
        {/* Informations principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Montant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(contract.amount)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Début:</span>
                <span>{formatDate(contract.startDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Fin:</span>
                <span>{formatDate(contract.endDate)}</span>
              </div>
              {contract.signatureDate && (
                <div className="flex justify-between text-sm">
                  <span>Signature:</span>
                  <span>{formatDate(contract.signatureDate)}</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Métriques IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Conformité:</span>
                <span className="font-medium text-green-600">{contract.complianceScore || 0}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Confiance IA:</span>
                <span className="font-medium text-blue-600">{contract.aiConfidenceScore || 0}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets détaillés */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="clauses">Clauses</TabsTrigger>
            <TabsTrigger value="obligations">Obligations</TabsTrigger>
            <TabsTrigger value="analysis">Analyse IA</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Objet du contrat</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{contract.object}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Conditions de paiement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{contract.paymentTerms}</p>
                </CardContent>
              </Card>
              
              {contract.contentPreview && (
                <Card>
                  <CardHeader>
                    <CardTitle>Aperçu du contenu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{contract.contentPreview}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="clauses" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Résumé des clauses</CardTitle>
              </CardHeader>
              <CardContent>
                {contract.clausesSummary ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total clauses:</span>
                        <span className="ml-2">{contract.clausesSummary.total_clauses || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium">Schedule paiement:</span>
                        <span className="ml-2">{contract.clausesSummary.payment_schedule || 'N/A'}</span>
                      </div>
                    </div>
                    
                    {contract.clausesSummary.key_terms && (
                      <div>
                        <h4 className="font-medium mb-2">Termes clés:</h4>
                        <div className="flex flex-wrap gap-2">
                          {contract.clausesSummary.key_terms.map((term, index) => (
                            <Badge key={index} variant="outline">{term}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Aucun résumé de clauses disponible</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="obligations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Suivi des obligations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Fonctionnalité de suivi des obligations à implémenter</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analysis" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Analyse de risques IA</CardTitle>
              </CardHeader>
              <CardContent>
                {contract.riskAnalysis ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-red-50 rounded">
                        <div className="text-2xl font-bold text-red-600">{contract.riskAnalysis.risks?.financial || 0}</div>
                        <div className="text-sm text-red-700">Financier</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded">
                        <div className="text-2xl font-bold text-orange-600">{contract.riskAnalysis.risks?.legal || 0}</div>
                        <div className="text-sm text-orange-700">Légal</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded">
                        <div className="text-2xl font-bold text-yellow-600">{contract.riskAnalysis.risks?.operational || 0}</div>
                        <div className="text-sm text-yellow-700">Opérationnel</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="text-2xl font-bold text-green-600">{contract.riskAnalysis.risks?.compliance || 0}</div>
                        <div className="text-sm text-green-700">Conformité</div>
                      </div>
                    </div>
                    
                    {contract.riskAnalysis.recommendations && contract.riskAnalysis.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Recommandations:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {contract.riskAnalysis.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Aucune analyse de risques disponible</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AnimatedModal>
  );
};

export default ContractDetailsModal;
