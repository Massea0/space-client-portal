// src/components/quotes/DeleteQuoteDialog.tsx
import React, { useState } from 'react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import quoteService from '@/services/quoteService';
import { Devis as DevisType } from '@/types';
import { toast } from 'sonner';

interface DeleteQuoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  devis: DevisType | null;
  onSuccess?: () => void;
}

const DeleteQuoteDialog: React.FC<DeleteQuoteDialogProps> = ({
  isOpen,
  onClose,
  devis,
  onSuccess
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!devis) return;
    
    setIsDeleting(true);
    try {
      await quoteService.deleteQuote(devis.id);
      toast.success('Devis supprimé', { 
        description: `Le devis ${devis.number} a été supprimé avec succès.` 
      });
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('[DeleteQuoteDialog] Erreur lors de la suppression:', error);
      toast.error('Erreur', { 
        description: 'Une erreur est survenue lors de la suppression du devis.' 
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirmDelete}
      title={`Supprimer le Devis ${devis?.number || ''}`}
      description="Cette action est irréversible. Êtes-vous sûr de vouloir supprimer ce devis définitivement ?"
      confirmText="Supprimer"
      cancelText="Annuler"
      isLoading={isDeleting}
      variant="destructive"
    />
  );
};

export default DeleteQuoteDialog;
