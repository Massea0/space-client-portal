// src/components/contracts/ContractGenerationModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Wand2, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedModal } from '@/components/ui/animated-modal';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { notificationManager } from '@/components/ui/notification-provider';
import { contractsAI } from '@/services/contracts';
import { devisApi } from '@/services/api';
import { formatCurrency } from '@/lib/utils';
import type { Devis } from '@/types';

interface ContractGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated?: (contractId: string) => void;
  preselectedDevisId?: string;
}

const ContractGenerationModal: React.FC<ContractGenerationModalProps> = ({
  isOpen,
  onClose,
  onGenerated,
  preselectedDevisId
}) => {
  // États
  const [approvedDevis, setApprovedDevis] = useState<Devis[]>([]);
  const [selectedDevisId, setSelectedDevisId] = useState(preselectedDevisId || '');
  const [contractType, setContractType] = useState<'service' | 'maintenance' | 'consulting' | 'licensing'>('service');
  const [customClauses, setCustomClauses] = useState<string>('');
  const [specificRequirements, setSpecificRequirements] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Charger les devis approuvés au montage
  useEffect(() => {
    if (isOpen) {
      loadApprovedDevis();
    }
  }, [isOpen]);

  const loadApprovedDevis = async () => {
    try {
      const data = await devisApi.getAll();
      const approved = data.filter((d: Devis) => d.status === 'approved');
      setApprovedDevis(approved);
    } catch (error) {
      console.error('Erreur lors du chargement des devis:', error);
      notificationManager.error('Erreur', {
        message: 'Impossible de charger les devis'
      });
    }
  };

  // Devis sélectionné
  const selectedDevis = approvedDevis.find(d => d.id === selectedDevisId);

  // Fonction de génération
  const handleGenerate = async () => {
    if (!selectedDevisId || !contractType) {
      notificationManager.error('Erreur', {
        message: 'Veuillez sélectionner un devis et un type de contrat'
      });
      return;
    }

    try {
      setIsGenerating(true);

      const result = await contractsAI.generateContractDraft({
        devisId: selectedDevisId,
        clientId: selectedDevis?.companyId || '',
        templateType: contractType,
        customClauses: customClauses.split('\n').filter(c => c.trim()),
        specificRequirements: specificRequirements
      });

      if (result.success && result.contract_id) {
        notificationManager.success('Contrat généré', {
          message: 'Le contrat a été créé avec succès'
        });
        
        onGenerated?.(result.contract_id);
        onClose();
        
        // Reset du formulaire
        setSelectedDevisId('');
        setCustomClauses('');
        setSpecificRequirements('');
      } else {
        throw new Error(result.error || 'Erreur lors de la génération');
      }
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      notificationManager.error('Erreur', {
        message: error instanceof Error ? error.message : 'Impossible de générer le contrat'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = selectedDevisId && contractType;

  return (
    <AnimatedModal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Générer un Contrat IA"
      description="Créez automatiquement un contrat intelligent à partir d'un devis approuvé"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Annuler
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={!canGenerate || isGenerating}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Génération...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Générer le Contrat
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* En-tête avec icône */}
        <div className="flex items-center gap-2 pb-4 border-b">
          <Wand2 className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold">Configuration du contrat</h2>
        </div>
        {/* Sélection du devis */}
        <div className="space-y-2">
          <Label htmlFor="devis-select">Devis source *</Label>
          <Select value={selectedDevisId} onValueChange={setSelectedDevisId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un devis approuvé" />
            </SelectTrigger>
            <SelectContent>
              {approvedDevis.map((devis) => (
                <SelectItem key={devis.id} value={devis.id}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{devis.number} - {devis.companyName}</span>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {formatCurrency(devis.amount)}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedDevis && (
            <div className="p-3 bg-muted/20 rounded text-sm">
              <p><strong>Objet:</strong> {selectedDevis.object}</p>
              <p><strong>Montant:</strong> {formatCurrency(selectedDevis.amount)}</p>
            </div>
          )}
        </div>

        {/* Type de contrat */}
        <div className="space-y-2">
          <Label htmlFor="contract-type">Type de contrat</Label>
          <Select value={contractType} onValueChange={(value: any) => setContractType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="service">Prestation de service</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="consulting">Conseil/Consulting</SelectItem>
              <SelectItem value="licensing">Licence</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clauses personnalisées */}
        <div className="space-y-2">
          <Label htmlFor="custom-clauses">Clauses personnalisées (optionnel)</Label>
          <Textarea
            id="custom-clauses"
            placeholder="Ajoutez des clauses spécifiques, une par ligne..."
            value={customClauses}
            onChange={(e) => setCustomClauses(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {/* Exigences spécifiques */}
        <div className="space-y-2">
          <Label htmlFor="requirements">Exigences spécifiques (optionnel)</Label>
          <Textarea
            id="requirements"
            placeholder="Décrivez des exigences particulières pour ce contrat..."
            value={specificRequirements}
            onChange={(e) => setSpecificRequirements(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        {/* Info sur l'IA */}
        <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <Wand2 className="h-5 w-5 text-purple-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-purple-900">Génération intelligente</p>
            <p className="text-purple-700 mt-1">
              L'IA analysera le devis sélectionné et générera un contrat optimisé avec des clauses 
              adaptées au type de prestation et aux exigences spécifiées.
            </p>
          </div>
        </div>

        {!canGenerate && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded border border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-800">
              Veuillez sélectionner un devis et un type de contrat pour continuer.
            </span>
          </div>
        )}
      </div>
    </AnimatedModal>
  );
};

export default ContractGenerationModal;
