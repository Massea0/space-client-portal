// src/services/api.ts
import {supabase} from '@/lib/supabaseClient';
import {Devis, DevisItem, Invoice, InvoiceItem, Ticket, TicketMessage, Company} from '@/types';
import type {User as AuthUserType} from '@/types/auth';

// --- Définitions des types pour les données brutes de la base de données (snake_case) ---

interface DbCompany {
    id: string;
    name: string;
    email: string;
    phone: string | null; // Accept null for optional fields
    address: string | null; // Accept null for optional fields
    created_at: string;
}

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
    companies?: { name: string };
    devis_items?: DbDevisItem[];
}

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
    amount: string;
    status: Invoice['status'];
    created_at: string;
    due_date: string;
    paid_at?: string;
    companies?: { name: string };
    invoice_items?: DbInvoiceItem[];
}

interface DbTicketMessage {
    id: string;
    ticket_id: string;
    author_id: string;
    author_name: string;
    author_role: 'client' | 'admin';
    content: string;
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
    created_at: string;
    updated_at: string;
    assigned_to?: string;
    companies?: { name: string };
    ticket_messages?: DbTicketMessage[];
}

interface DbUser {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'client' | 'admin';
    company_id?: string;
    phone?: string;
    created_at: string;
    companies?: { name: string };
}

// --- Types pour les charges utiles (payloads) des mises à jour ---
interface DevisUpdateDbPayload {
    status: Devis['status'];
    rejection_reason?: string;
}

interface InvoiceUpdateDbPayload {
    status: Invoice['status'];
    paid_at?: string;
}

interface TicketUpdateDbPayload {
    updated_at: string;
    status?: Ticket['status'];
}

type CompanyUpdateClientPayload = Partial<Omit<Company, 'id' | 'createdAt'>>;

// --- Interface UserProfile (utilisée par l'application) ---
interface UserProfile extends AuthUserType {
    createdAt: Date;
}

// --- Fonctions de Mapping ---

const mapCompanyFromDb = (dbCompany: DbCompany): Company => ({
    id: dbCompany.id,
    name: dbCompany.name,
    email: dbCompany.email,
    phone: dbCompany.phone || '', // Ensure empty string if null from DB
    address: dbCompany.address || '', // Ensure empty string if null from DB
    createdAt: new Date(dbCompany.created_at),
});

const mapDevisFromDb = (dbDevis: DbDevis): Devis => ({
    id: dbDevis.id,
    number: dbDevis.number,
    companyId: dbDevis.company_id,
    companyName: dbDevis.companies?.name || 'N/A',
    object: dbDevis.object,
    amount: parseFloat(dbDevis.amount),
    status: dbDevis.status,
    createdAt: new Date(dbDevis.created_at),
    validUntil: new Date(dbDevis.valid_until),
    items: dbDevis.devis_items ? dbDevis.devis_items.map(mapDevisItemFromDb) : [],
    notes: dbDevis.notes,
    rejectionReason: dbDevis.rejection_reason,
});

const mapDevisItemFromDb = (dbItem: DbDevisItem): DevisItem => ({
    id: dbItem.id,
    description: dbItem.description,
    quantity: dbItem.quantity,
    unitPrice: parseFloat(dbItem.unit_price),
    total: parseFloat(dbItem.total),
});

const mapInvoiceFromDb = (dbInvoice: DbInvoice): Invoice => ({
    id: dbInvoice.id,
    number: dbInvoice.number,
    companyId: dbInvoice.company_id,
    companyName: dbInvoice.companies?.name || 'N/A',
    amount: parseFloat(dbInvoice.amount),
    status: dbInvoice.status,
    createdAt: new Date(dbInvoice.created_at),
    dueDate: new Date(dbInvoice.due_date),
    items: dbInvoice.invoice_items ? dbInvoice.invoice_items.map(mapInvoiceItemFromDb) : [],
    paidAt: dbInvoice.paid_at ? new Date(dbInvoice.paid_at) : undefined,
});

const mapInvoiceItemFromDb = (dbItem: DbInvoiceItem): InvoiceItem => ({
    id: dbItem.id,
    description: dbItem.description,
    quantity: dbItem.quantity,
    unitPrice: parseFloat(dbItem.unit_price),
    total: parseFloat(dbItem.total),
});

const mapTicketFromDb = (dbTicket: DbTicket): Ticket => ({
    id: dbTicket.id,
    number: dbTicket.number,
    companyId: dbTicket.company_id,
    companyName: dbTicket.companies?.name || 'N/A',
    subject: dbTicket.subject,
    description: dbTicket.description,
    status: dbTicket.status,
    priority: dbTicket.priority,
    createdAt: new Date(dbTicket.created_at),
    updatedAt: new Date(dbTicket.updated_at),
    assignedTo: dbTicket.assigned_to,
    messages: dbTicket.ticket_messages ? dbTicket.ticket_messages.map(mapTicketMessageFromDb) : [],
    attachments: [], // Placeholder for attachments
});

const mapTicketMessageFromDb = (dbMessage: DbTicketMessage): TicketMessage => ({
    id: dbMessage.id,
    ticketId: dbMessage.ticket_id,
    authorId: dbMessage.author_id,
    authorName: dbMessage.author_name,
    authorRole: dbMessage.author_role,
    content: dbMessage.content,
    createdAt: new Date(dbMessage.created_at),
    attachments: [], // Placeholder for attachments
});

const mapUserFromDb = (dbUser: DbUser): UserProfile => ({
    id: dbUser.id,
    email: dbUser.email,
    firstName: dbUser.first_name,
    lastName: dbUser.last_name,
    role: dbUser.role,
    companyId: dbUser.company_id,
    phone: dbUser.phone,
    createdAt: new Date(dbUser.created_at),
    companyName: dbUser.companies?.name || undefined,
});


// --- APIs ---

// Devis API
export const devisApi = {
    getAll: async (): Promise<Devis[]> => {
        const {data, error} = await supabase
            .from('devis')
            .select('*, companies(name), devis_items(*)');
        if (error) throw error;
        return data.map(mapDevisFromDb);
    },

    getByCompany: async (companyId: string): Promise<Devis[]> => {
        const {data, error} = await supabase
            .from('devis')
            .select('*, companies(name), devis_items(*)')
            .eq('company_id', companyId);
        if (error) throw error;
        return data.map(mapDevisFromDb);
    },

    updateStatus: async (id: string, status: Devis['status'], rejectionReason?: string): Promise<Devis> => {
        const updatePayload: DevisUpdateDbPayload = {status};
        if (status === 'rejected' && rejectionReason) {
            updatePayload.rejection_reason = rejectionReason;
        }
        const {data, error} = await supabase
            .from('devis')
            .update(updatePayload)
            .eq('id', id)
            .select('*, companies(name), devis_items(*)')
            .single();
        if (error) throw error;
        return mapDevisFromDb(data);
    },

    create: async (devisData: Omit<Devis, 'id' | 'number' | 'createdAt' | 'companyName'> & {
        items: Omit<DevisItem, 'id' | 'total'>[]
    }): Promise<Devis> => {
        const devisToInsert = {
            company_id: devisData.companyId,
            object: devisData.object,
            amount: devisData.amount,
            status: devisData.status,
            valid_until: devisData.validUntil.toISOString(),
            notes: devisData.notes,
            number: `DEV-${Date.now().toString().slice(-6)}`
        };

        const {data: newDevisData, error: devisError} = await supabase
            .from('devis')
            .insert(devisToInsert)
            .select()
            .single();

        if (devisError) throw devisError;

        if (devisData.items && devisData.items.length > 0) {
            const itemsToInsert = devisData.items.map(item => ({
                devis_id: newDevisData.id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                total: item.quantity * item.unitPrice,
            }));
            const {error: itemsError} = await supabase.from('devis_items').insert(itemsToInsert);
            if (itemsError) {
                // Rollback devis creation if items insertion fails
                await supabase.from('devis').delete().eq('id', newDevisData.id);
                throw itemsError;
            }
        }

        // Fetch the complete devis data with company name and items
        const {data: completeDevis, error: fetchError} = await supabase
            .from('devis')
            .select('*, companies(name), devis_items(*)')
            .eq('id', newDevisData.id)
            .single();
        if (fetchError) throw fetchError;

        return mapDevisFromDb(completeDevis);
    }
};

// Invoices API
export const invoicesApi = {
    getAll: async (): Promise<Invoice[]> => {
        const {data, error} = await supabase
            .from('invoices')
            .select('*, companies(name), invoice_items(*)');
        if (error) throw error;
        return data.map(mapInvoiceFromDb);
    },

    getByCompany: async (companyId: string): Promise<Invoice[]> => {
        const {data, error} = await supabase
            .from('invoices')
            .select('*, companies(name), invoice_items(*)')
            .eq('company_id', companyId);
        if (error) throw error;
        return data.map(mapInvoiceFromDb);
    },

    updateStatus: async (id: string, status: Invoice['status']): Promise<Invoice> => {
        const updatePayload: InvoiceUpdateDbPayload = {status};
        if (status === 'paid') {
            updatePayload.paid_at = new Date().toISOString();
        }
        const {data, error} = await supabase
            .from('invoices')
            .update(updatePayload)
            .eq('id', id)
            .select('*, companies(name), invoice_items(*)')
            .single();
        if (error) throw error;
        return mapInvoiceFromDb(data);
    },

    create: async (invoiceData: Omit<Invoice, 'id' | 'number' | 'createdAt' | 'companyName' | 'paidAt'> & {
        items: Omit<InvoiceItem, 'id' | 'total'>[]
    }): Promise<Invoice> => {
        const invoiceToInsert = {
            company_id: invoiceData.companyId,
            amount: invoiceData.amount,
            status: invoiceData.status,
            due_date: invoiceData.dueDate.toISOString(),
            number: `FACT-${Date.now().toString().slice(-6)}`
        };

        const {data: newInvoiceData, error: invoiceError} = await supabase
            .from('invoices')
            .insert(invoiceToInsert)
            .select()
            .single();

        if (invoiceError) throw invoiceError;

        if (invoiceData.items && invoiceData.items.length > 0) {
            const itemsToInsert = invoiceData.items.map(item => ({
                invoice_id: newInvoiceData.id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                total: item.quantity * item.unitPrice,
            }));
            const {error: itemsError} = await supabase.from('invoice_items').insert(itemsToInsert);
            if (itemsError) {
                await supabase.from('invoices').delete().eq('id', newInvoiceData.id);
                throw itemsError;
            }
        }

        const {data: completeInvoice, error: fetchError} = await supabase
            .from('invoices')
            .select('*, companies(name), invoice_items(*)')
            .eq('id', newInvoiceData.id)
            .single();
        if (fetchError) throw fetchError;

        return mapInvoiceFromDb(completeInvoice);
    }
};

// Tickets API
export const ticketsApi = {
    getAll: async (): Promise<Ticket[]> => {
        const {data, error} = await supabase
            .from('tickets')
            .select('*, companies(name), ticket_messages(*)')
            .order('created_at', {foreignTable: 'ticket_messages', ascending: true});
        if (error) throw error;
        return data.map(mapTicketFromDb);
    },

    getByCompany: async (companyId: string): Promise<Ticket[]> => {
        const {data, error} = await supabase
            .from('tickets')
            .select('*, companies(name), ticket_messages(*)')
            .eq('company_id', companyId)
            .order('created_at', {foreignTable: 'ticket_messages', ascending: true});
        if (error) throw error;
        return data.map(mapTicketFromDb);
    },

    create: async (ticketData: {
        subject: string;
        description: string;
        companyId: string;
        priority?: Ticket['priority'],
        companyName?: string
    }): Promise<Ticket> => {
        const ticketToInsert = {
            company_id: ticketData.companyId,
            subject: ticketData.subject,
            description: ticketData.description,
            status: 'open' as Ticket['status'],
            priority: ticketData.priority || 'medium',
            number: `TICK-${Date.now().toString().slice(-6)}`
        };
        const {data, error} = await supabase
            .from('tickets')
            .insert(ticketToInsert)
            .select('*, companies(name)')
            .single();
        if (error) throw error;
        return mapTicketFromDb({...data, ticket_messages: []}); // Ensure messages array is initialized
    },

    addMessage: async (ticketId: string, message: {
        content: string;
        authorId: string;
        authorName: string;
        authorRole: 'client' | 'admin'
    }): Promise<Ticket> => {
        const messageToInsert = {
            ticket_id: ticketId,
            author_id: message.authorId,
            author_name: message.authorName,
            author_role: message.authorRole,
            content: message.content,
        };
        const {error: messageError} = await supabase.from('ticket_messages').insert(messageToInsert);
        if (messageError) throw messageError;

        const ticketUpdatePayload: TicketUpdateDbPayload = {updated_at: new Date().toISOString()};

        const {
            data: currentTicket,
            error: currentTicketError
        } = await supabase.from('tickets').select('status').eq('id', ticketId).single();
        if (currentTicketError) console.error("Error fetching current ticket status for update:", currentTicketError);

        if (message.authorRole === 'admin' && currentTicket && currentTicket.status === 'open') {
            ticketUpdatePayload.status = 'in_progress';
        } else if (message.authorRole === 'client' && currentTicket && currentTicket.status === 'resolved') {
            // If client replies to a resolved ticket, re-open it or set to in_progress
            ticketUpdatePayload.status = 'open'; // Or 'in_progress' depending on desired flow
        }

        const {error: ticketUpdateError} = await supabase
            .from('tickets')
            .update(ticketUpdatePayload)
            .eq('id', ticketId);
        if (ticketUpdateError) throw ticketUpdateError;

        const {data: updatedTicketData, error: fetchError} = await supabase
            .from('tickets')
            .select('*, companies(name), ticket_messages(*)')
            .eq('id', ticketId)
            .order('created_at', {foreignTable: 'ticket_messages', ascending: true})
            .single();
        if (fetchError) throw fetchError;

        return mapTicketFromDb(updatedTicketData);
    },

    updateStatus: async (id: string, status: Ticket['status']): Promise<Ticket> => {
        const {data, error} = await supabase
            .from('tickets')
            .update({status, updated_at: new Date().toISOString()})
            .eq('id', id)
            .select('*, companies(name), ticket_messages(*)')
            .order('created_at', {foreignTable: 'ticket_messages', ascending: true})
            .single();
        if (error) throw error;
        return mapTicketFromDb(data);
    }
};

// Companies API
export const companiesApi = {
    getAll: async (): Promise<Company[]> => {
        console.log("companiesApi.getAll: Début");
        const {data, error} = await supabase.from('companies').select('*');
        if (error) {
            console.error("companiesApi.getAll: Erreur Supabase", error);
            throw error;
        }
        console.log("companiesApi.getAll: Données reçues", data ? data.length : 0, "entreprises");
        return data.map(mapCompanyFromDb);
    },

    create: async (companyData: Omit<Company, 'id' | 'createdAt'>): Promise<Company> => {
        console.log("companiesApi.create: Début avec companyData:", JSON.stringify(companyData));
        const companyToInsert = {
            name: companyData.name,
            email: companyData.email,
            phone: companyData.phone?.trim() || null,
            address: companyData.address?.trim() || null,
        };

        console.log("companiesApi.create: Objet à insérer (companyToInsert):", JSON.stringify(companyToInsert));

        const {data, error} = await supabase
            .from('companies')
            .insert(companyToInsert)
            .select()
            .single();

        if (error) {
            console.error("companiesApi.create: Erreur Supabase lors de l'insertion:", error);
            throw error;
        }
        console.log("companiesApi.create: Entreprise insérée avec succès par Supabase:", data);
        return mapCompanyFromDb(data);
    },

    update: async (id: string, updates: Partial<Omit<Company, 'id' | 'createdAt'>>): Promise<Company> => {
        console.log(`companiesApi.update: Début pour ID ${id} avec updates:`, JSON.stringify(updates));
        const updatesToApply: CompanyUpdateClientPayload = {};
        if (updates.name !== undefined) updatesToApply.name = updates.name;
        if (updates.email !== undefined) updatesToApply.email = updates.email;
        if (updates.phone !== undefined) updatesToApply.phone = updates.phone.trim() || null;
        if (updates.address !== undefined) updatesToApply.address = updates.address.trim() || null;

        console.log("companiesApi.update: Objet à mettre à jour (updatesToApply):", JSON.stringify(updatesToApply));

        const {data, error} = await supabase
            .from('companies')
            .update(updatesToApply)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            console.error(`companiesApi.update: Erreur Supabase pour ID ${id}:`, error);
            throw error;
        }
        console.log(`companiesApi.update: Entreprise ID ${id} modifiée avec succès:`, data);
        return mapCompanyFromDb(data);
    },

    delete: async (id: string): Promise<void> => {
        console.log(`companiesApi.delete: Début pour ID ${id}`);
        const {error} = await supabase
            .from('companies')
            .delete()
            .eq('id', id);
        if (error) {
            console.error(`companiesApi.delete: Erreur Supabase pour ID ${id}:`, error);
            throw error;
        }
        console.log(`companiesApi.delete: Entreprise ID ${id} supprimée avec succès.`);
    }
};

// Users API
export const usersApi = {
    getAll: async (): Promise<UserProfile[]> => {
        const {data, error} = await supabase
            .from('users')
            .select('*, companies(name)');
        if (error) throw error;
        return data.map(mapUserFromDb);
    },
};