// src/services/quoteService.ts
import { supabase } from '@/lib/supabaseClient';
import { devisApi } from './api';
import { Devis as DevisType } from '@/types';

/**
 * Service pour les opérations liées aux devis (quotes)
 */
const quoteService = {
  /**
   * Mettre à jour un devis
   */
  async updateQuote(id: string, updateData: {
    object: string;
    validUntil: Date | string;
    notes?: string;
    items: Array<{
      id?: string;
      description: string;
      quantity: number;
      unitPrice: number;
    }>;
  }): Promise<DevisType> {
    try {
      // Calculer le montant total basé sur les éléments
      const amount = updateData.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );

      // Préparer les données pour la mise à jour du devis
      const devisUpdateData = {
        object: updateData.object,
        amount: amount.toString(),
        valid_until: typeof updateData.validUntil === 'string' 
          ? updateData.validUntil 
          : updateData.validUntil.toISOString(),
        notes: updateData.notes || null
      };

      // Mettre à jour le devis
      const { data: updatedDevis, error: devisError } = await supabase
        .from('devis')
        .update(devisUpdateData)
        .eq('id', id)
        .select('id')
        .single();

      if (devisError) throw devisError;

      // Supprimer tous les éléments existants et ajouter les nouveaux
      // Cette approche est plus simple que de déterminer quels éléments mettre à jour/supprimer/ajouter
      const { error: deleteError } = await supabase
        .from('devis_items')
        .delete()
        .eq('devis_id', id);

      if (deleteError) throw deleteError;

      // Ajouter les nouveaux éléments
      const itemsToInsert = updateData.items.map(item => ({
        devis_id: id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice.toString(),
        total: (item.quantity * item.unitPrice).toString(),
      }));

      const { error: itemsError } = await supabase
        .from('devis_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // Récupérer le devis mis à jour avec ses éléments
      // Pour l'instant, nous utilisons getAll() et filtrons, mais idéalement,
      // nous aurions une méthode API dédiée pour récupérer un devis par ID
      const allDevis = await devisApi.getAll();
      const foundDevis = allDevis.find(d => d.id === id);

      if (!foundDevis) {
        throw new Error("Le devis mis à jour n'a pas pu être récupéré");
      }

      return foundDevis;
    } catch (error) {
      console.error("[quoteService.updateQuote] Erreur:", error);
      throw error;
    }
  },

  /**
   * Supprimer un devis
   */
  async deleteQuote(id: string): Promise<void> {
    try {
      // D'abord, supprimer tous les éléments du devis
      const { error: itemsError } = await supabase
        .from('devis_items')
        .delete()
        .eq('devis_id', id);

      if (itemsError) throw itemsError;

      // Ensuite, supprimer le devis lui-même
      const { error: devisError } = await supabase
        .from('devis')
        .delete()
        .eq('id', id);

      if (devisError) throw devisError;
    } catch (error) {
      console.error("[quoteService.deleteQuote] Erreur:", error);
      throw error;
    }
  }
};

export default quoteService;
