// src/components/quotes/EditQuoteModal.tsx
import React, { useState, useEffect } from 'react';
import { Devis as DevisType } from '@/types';
import { SafeModal } from '@/components/ui/safe-modal';
import DevisForm, { DevisFormSubmitData } from '@/components/forms/DevisForm';
import { devisApi } from '@/services/api';
import quoteService from '@/services/quoteService';
import { toast } from 'sonner';

interface EditQuoteModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  devisId: string | null;
  onSuccess?: (updatedDevis: DevisType) => void;
}

interface UpdateDevisData {
  companyId: string;
  object: string;
  validUntil: string | Date;
  notes?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

const EditQuoteModal: React.FC<EditQuoteModalProps> = ({
  isOpen,
  onOpenChange,
  devisId,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [devis, setDevis] = useState<DevisType | null>(null);
  const [initialLoading, setInitialLoading] = useState(false);

  // Charger les données du devis lorsque le modal s'ouvre et que devisId est défini
  useEffect(() => {
    const fetchDevisData = async () => {
      if (!devisId || !isOpen) return;
      
      setInitialLoading(true);
      try {
        // Pour cet exemple, nous simulons un appel API pour obtenir les détails du devis
        // Dans une implémentation réelle, vous devez créer/utiliser une API pour récupérer un devis par ID
        const allDevis = await devisApi.getAll();
        const foundDevis = allDevis.find(d => d.id === devisId);
        
        if (foundDevis) {
          setDevis(foundDevis);
        } else {
          toast.error('Erreur', { description: 'Le devis demandé est introuvable.' });
          onOpenChange(false);
        }
      } catch (error) {
        console.error('[EditQuoteModal] Erreur lors du chargement du devis:', error);
        toast.error('Erreur', { description: 'Impossible de charger les détails du devis.' });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchDevisData();
  }, [devisId, isOpen, onOpenChange]);

  const handleSubmit = async (data: DevisFormSubmitData) => {
    if (!devisId) return;
    
    setLoading(true);
    try {
      // Préparer les données pour la mise à jour
      const updateData: UpdateDevisData = {
        companyId: data.companyId,
        object: data.object,
        validUntil: data.validUntil,
        notes: data.notes,
        items: data.items.map(item => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice)
        }))
      };
      
      // Appeler le service pour mettre à jour le devis
      const updatedDevis = await quoteService.updateQuote(devisId, updateData);
      
      toast.success('Devis mis à jour', { 
        description: `Le devis ${updatedDevis.number} a été mis à jour avec succès.` 
      });
      
      // Fermer le modal et appeler le callback de succès
      onOpenChange(false);
      if (onSuccess && updatedDevis) {
        onSuccess(updatedDevis);
      }
    } catch (error) {
      console.error('[EditQuoteModal] Erreur lors de la mise à jour du devis:', error);
      toast.error('Erreur', { description: 'Impossible de mettre à jour le devis.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  // Préparer les données initiales pour le formulaire
  const getInitialData = () => {
    if (!devis) return null;
    
    return {
      companyId: devis.companyId,
      object: devis.object,
      validUntil: new Date(devis.validUntil),
      notes: devis.notes || '',
      items: devis.items.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total
      }))
    };
  };

  return (
    <SafeModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={`Modifier le Devis ${devis?.number || ''}`}
      description="Modifiez les informations et les articles du devis"
      size="xl"
    >
      {initialLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Chargement du devis...</span>
        </div>
      ) : devis ? (
        <DevisForm
          initialData={getInitialData()}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={loading}
          editMode={true}
        />
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          Impossible de charger les détails du devis.
        </div>
      )}
    </SafeModal>
  );
};

export default EditQuoteModal;
