// src/services/devisApi.ts
import { supabase } from '@/lib/supabaseClient';
import { Devis, DevisItem } from '@/types';

interface DbDevisItem {
    id: string;
    devis_id: string;
    description: string;
    quantity: number;
    unit_price: string;
    total: string;
}

interface DbDevis {
    id: string;
    number: string;
    company_id: string;
    object: string;
    amount: string;
    status: Devis['status'];
    created_at: string;
    valid_until: string;
    notes?: string;
    rejection_reason?: string;
    validated_at?: string;
    companies?: { name: string };
    devis_items?: DbDevisItem[];
}

/**
 * Service pour gérer les devis
 */
export const devisApi = {
    /**
     * Récupérer tous les devis
     */
    getAll: async (): Promise<Devis[]> => {
        const { data, error } = await supabase
            .from('devis')
            .select('*, companies(name), devis_items(*)');
        
        if (error) throw error;
        
        return (data || []).map((devis: DbDevis): Devis => ({
            id: devis.id,
            number: devis.number,
            companyId: devis.company_id,
            companyName: devis.companies?.name || 'Inconnu',
            object: devis.object,
            amount: parseFloat(devis.amount),
            status: devis.status,
            createdAt: new Date(devis.created_at),
            validUntil: new Date(devis.valid_until),
            items: devis.devis_items?.map((item): DevisItem => ({
                id: item.id,
                description: item.description,
                quantity: item.quantity,
                unitPrice: parseFloat(item.unit_price),
                total: parseFloat(item.total),
            })) || [],
            notes: devis.notes,
            rejectionReason: devis.rejection_reason,
            validatedAt: devis.validated_at ? new Date(devis.validated_at) : undefined,
        }));
    },

    /**
     * Récupérer tous les devis d'une entreprise
     */
    getByCompany: async (companyId: string): Promise<Devis[]> => {
        const { data, error } = await supabase
            .from('devis')
            .select('*, companies(name), devis_items(*)')
            .eq('company_id', companyId);
        
        if (error) throw error;
        
        return (data || []).map((devis: DbDevis): Devis => ({
            id: devis.id,
            number: devis.number,
            companyId: devis.company_id,
            companyName: devis.companies?.name || 'Inconnu',
            object: devis.object,
            amount: parseFloat(devis.amount),
            status: devis.status,
            createdAt: new Date(devis.created_at),
            validUntil: new Date(devis.valid_until),
            items: devis.devis_items?.map((item): DevisItem => ({
                id: item.id,
                description: item.description,
                quantity: item.quantity,
                unitPrice: parseFloat(item.unit_price),
                total: parseFloat(item.total),
            })) || [],
            notes: devis.notes,
            rejectionReason: devis.rejection_reason,
            validatedAt: devis.validated_at ? new Date(devis.validated_at) : undefined,
        }));
    },

    /**
     * Récupérer un devis par son ID
     */
    getById: async (id: string): Promise<Devis | null> => {
        const { data, error } = await supabase
            .from('devis')
            .select('*, companies(name), devis_items(*)')
            .eq('id', id)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') return null; // No rows returned
            throw error;
        }
        
        if (!data) return null;
        
        const devis = data as DbDevis;
        return {
            id: devis.id,
            number: devis.number,
            companyId: devis.company_id,
            companyName: devis.companies?.name || 'Inconnu',
            object: devis.object,
            amount: parseFloat(devis.amount),
            status: devis.status,
            createdAt: new Date(devis.created_at),
            validUntil: new Date(devis.valid_until),
            items: devis.devis_items?.map((item): DevisItem => ({
                id: item.id,
                description: item.description,
                quantity: item.quantity,
                unitPrice: parseFloat(item.unit_price),
                total: parseFloat(item.total),
            })) || [],
            notes: devis.notes,
            rejectionReason: devis.rejection_reason,
            validatedAt: devis.validated_at ? new Date(devis.validated_at) : undefined,
        };
    },
};

export default devisApi;
