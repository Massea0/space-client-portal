// src/services/ticketApi.ts
import { supabase } from '@/lib/supabaseClient';
import { Ticket, TicketMessage, TicketAttachment, TicketCategory } from '@/types';

interface DbTicketMessage {
    id: string;
    ticket_id: string;
    author_id: string;
    author_name: string;
    author_role: 'client' | 'admin';
    content: string;
    created_at: string;
}

interface DbTicketCategory {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
}

interface DbTicket {
    id: string;
    number: string;
    company_id: string;
    subject: string;
    description: string;
    status: Ticket['status'];
    priority: Ticket['priority'];
    category_id?: string;
    created_at: string;
    companies?: { name: string };
    ticket_categories?: { name: string };
}

/**
 * Service pour gérer les tickets de support
 */
export const ticketApi = {
    /**
     * Récupérer tous les tickets
     */
    getAll: async (): Promise<Ticket[]> => {
        const { data, error } = await supabase
            .from('support_tickets')
            .select('*, companies(name), ticket_categories(name)');
        
        if (error) throw error;
        
        return (data || []).map((ticket: DbTicket): Ticket => ({
            id: ticket.id,
            number: ticket.number,
            companyId: ticket.company_id,
            companyName: ticket.companies?.name || 'Inconnu',
            subject: ticket.subject,
            description: ticket.description,
            status: ticket.status,
            priority: ticket.priority,
            categoryId: ticket.category_id,
            categoryName: ticket.ticket_categories?.name,
            createdAt: new Date(ticket.created_at),
        }));
    },

    /**
     * Récupérer tous les tickets d'une entreprise
     */
    getByCompany: async (companyId: string): Promise<Ticket[]> => {
        const { data, error } = await supabase
            .from('support_tickets')
            .select('*, companies(name), ticket_categories(name)')
            .eq('company_id', companyId);
        
        if (error) throw error;
        
        return (data || []).map((ticket: DbTicket): Ticket => ({
            id: ticket.id,
            number: ticket.number,
            companyId: ticket.company_id,
            companyName: ticket.companies?.name || 'Inconnu',
            subject: ticket.subject,
            description: ticket.description,
            status: ticket.status,
            priority: ticket.priority,
            categoryId: ticket.category_id,
            categoryName: ticket.ticket_categories?.name,
            createdAt: new Date(ticket.created_at),
        }));
    },

    /**
     * Récupérer un ticket par son ID
     */
    getById: async (id: string): Promise<Ticket | null> => {
        const { data, error } = await supabase
            .from('support_tickets')
            .select('*, companies(name), ticket_categories(name)')
            .eq('id', id)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') return null; // No rows returned
            throw error;
        }
        
        if (!data) return null;
        
        const ticket = data as DbTicket;
        return {
            id: ticket.id,
            number: ticket.number,
            companyId: ticket.company_id,
            companyName: ticket.companies?.name || 'Inconnu',
            subject: ticket.subject,
            description: ticket.description,
            status: ticket.status,
            priority: ticket.priority,
            categoryId: ticket.category_id,
            categoryName: ticket.ticket_categories?.name,
            createdAt: new Date(ticket.created_at),
        };
    },

    /**
     * Récupérer les messages d'un ticket
     */
    getMessages: async (ticketId: string): Promise<TicketMessage[]> => {
        const { data, error } = await supabase
            .from('ticket_messages')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        return (data || []).map((message: DbTicketMessage): TicketMessage => ({
            id: message.id,
            ticketId: message.ticket_id,
            authorId: message.author_id,
            authorName: message.author_name,
            authorRole: message.author_role,
            content: message.content,
            createdAt: new Date(message.created_at),
            attachments: [],
        }));
    },

    /**
     * Récupérer toutes les catégories de tickets
     */
    getCategories: async (): Promise<TicketCategory[]> => {
        const { data, error } = await supabase
            .from('ticket_categories')
            .select('*');
        
        if (error) throw error;
        
        return (data || []).map((category: DbTicketCategory): TicketCategory => ({
            id: category.id,
            name: category.name,
            description: category.description || undefined,
            createdAt: new Date(category.created_at),
        }));
    },
};

export default ticketApi;
