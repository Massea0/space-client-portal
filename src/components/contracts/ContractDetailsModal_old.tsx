// src/components/contracts/ContractDetailsModal.tsx
import React, { useState } from 'react';
import { X, FileText, Download, Edit, Shield, Calendar, CheckCircle, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedModal } from '@/components/ui/animated-modal';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatDate } from '@/lib/utils';
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6" />
              <div>
                <DialogTitle className="text-xl">{contract.title}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">
                    {contract.contractNumber}
                  </span>
                  <Badge variant={getStatusBadgeVariant(contract.status)}>
                    {getStatusLabel(contract.status)}
                  </Badge>
                  {contract.generatedByAi && (
                    <Badge variant="outline" className="text-purple-600">
                      <Wand2 className="w-3 h-3 mr-1" />
                      IA
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="analysis">Analyse IA</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Informations générales */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <p className="font-medium capitalize">{contract.contractType}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Montant:</span>
                      <p className="font-medium">{formatCurrency(contract.amount)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Début:</span>
                      <p className="font-medium">{formatDate(contract.startDate)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fin:</span>
                      <p className="font-medium">{formatDate(contract.endDate)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground text-sm">Objet:</span>
                    <p className="mt-1">{contract.object}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Métriques IA */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Analyse IA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {contract.complianceScore}%
                      </div>
                      <p className="text-xs text-muted-foreground">Conformité</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {contract.aiConfidenceScore}%
                      </div>
                      <p className="text-xs text-muted-foreground">Confiance IA</p>
                    </div>
                  </div>
                  
                  {contract.templateUsed && (
                    <div>
                      <span className="text-muted-foreground text-sm">Template utilisé:</span>
                      <p className="font-medium">{contract.templateUsed}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              
              <Button variant="outline" disabled={isAnalyzing}>
                <Shield className="h-4 w-4 mr-2" />
                {isAnalyzing ? 'Analyse...' : 'Analyser IA'}
              </Button>
              
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contenu du contrat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm p-4 bg-muted/20 rounded min-h-[400px]">
                  {contract.contentPreview || 'Contenu non disponible'}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Analyse de conformité IA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Analyse en développement</h3>
                  <p className="mt-2 text-muted-foreground">
                    L'analyse IA détaillée sera disponible prochainement
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ContractDetailsModal;