// src/services/invoiceApiV2.ts
import { supabase } from '@/lib/supabaseClient';
import { Invoice, InvoiceItem } from '@/types';

interface DbInvoiceItem {
    id: string;
    invoice_id: string;
    description: string;
    quantity: number;
    unit_price: string;
    total: string;
}

interface DbInvoice {
    id: string;
    number: string;
    company_id: string;
    object: string;
    amount: string;
    status: Invoice['status'];
    created_at: string;
    due_date: string;
    paid_at?: string;
    notes?: string;
    companies?: { name: string };
    invoice_items?: DbInvoiceItem[];
    dexchange_transaction_id?: string;
    payment_method?: string;
}

/**
 * Service pour gérer les factures (version 2)
 */
export const invoiceApiV2 = {
    /**
     * Récupérer toutes les factures
     */
    getAll: async (): Promise<Invoice[]> => {
        const { data, error } = await supabase
            .from('invoices')
            .select('*, companies(name), invoice_items(*)');
        
        if (error) throw error;
        
        return (data || []).map((invoice: DbInvoice): Invoice => ({
            id: invoice.id,
            number: invoice.number,
            companyId: invoice.company_id,
            companyName: invoice.companies?.name || 'Inconnu',
            object: invoice.object,
            amount: parseFloat(invoice.amount),
            status: invoice.status,
            createdAt: new Date(invoice.created_at),
            dueDate: new Date(invoice.due_date),
            items: invoice.invoice_items?.map((item): InvoiceItem => ({
                id: item.id,
                description: item.description,
                quantity: item.quantity,
                unitPrice: parseFloat(item.unit_price),
                total: parseFloat(item.total),
            })) || [],
            paidAt: invoice.paid_at ? new Date(invoice.paid_at) : undefined,
            notes: invoice.notes,
            dexchangeTransactionId: invoice.dexchange_transaction_id,
            paymentMethod: invoice.payment_method,
        }));
    },

    /**
     * Récupérer toutes les factures d'une entreprise
     */
    getByCompany: async (companyId: string): Promise<Invoice[]> => {
        const { data, error } = await supabase
            .from('invoices')
            .select('*, companies(name), invoice_items(*)')
            .eq('company_id', companyId);
        
        if (error) throw error;
        
        return (data || []).map((invoice: DbInvoice): Invoice => ({
            id: invoice.id,
            number: invoice.number,
            companyId: invoice.company_id,
            companyName: invoice.companies?.name || 'Inconnu',
            object: invoice.object,
            amount: parseFloat(invoice.amount),
            status: invoice.status,
            createdAt: new Date(invoice.created_at),
            dueDate: new Date(invoice.due_date),
            items: invoice.invoice_items?.map((item): InvoiceItem => ({
                id: item.id,
                description: item.description,
                quantity: item.quantity,
                unitPrice: parseFloat(item.unit_price),
                total: parseFloat(item.total),
            })) || [],
            paidAt: invoice.paid_at ? new Date(invoice.paid_at) : undefined,
            notes: invoice.notes,
            dexchangeTransactionId: invoice.dexchange_transaction_id,
            paymentMethod: invoice.payment_method,
        }));
    },

    /**
     * Récupérer une facture par son ID
     */
    getById: async (id: string): Promise<Invoice | null> => {
        const { data, error } = await supabase
            .from('invoices')
            .select('*, companies(name), invoice_items(*)')
            .eq('id', id)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') return null; // No rows returned
            throw error;
        }
        
        if (!data) return null;
        
        const invoice = data as DbInvoice;
        return {
            id: invoice.id,
            number: invoice.number,
            companyId: invoice.company_id,
            companyName: invoice.companies?.name || 'Inconnu',
            object: invoice.object,
            amount: parseFloat(invoice.amount),
            status: invoice.status,
            createdAt: new Date(invoice.created_at),
            dueDate: new Date(invoice.due_date),
            items: invoice.invoice_items?.map((item): InvoiceItem => ({
                id: item.id,
                description: item.description,
                quantity: item.quantity,
                unitPrice: parseFloat(item.unit_price),
                total: parseFloat(item.total),
            })) || [],
            paidAt: invoice.paid_at ? new Date(invoice.paid_at) : undefined,
            notes: invoice.notes,
            dexchangeTransactionId: invoice.dexchange_transaction_id,
            paymentMethod: invoice.payment_method,
        };
    },
};

export default invoiceApiV2;
