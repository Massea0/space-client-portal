// src/services/api.ts
import {supabase} from '@/lib/supabaseClient';
import {
    Devis,
    DevisItem,
    Invoice,
    InvoiceItem,
    Ticket,
    TicketMessage,
    Company,
    TicketCategory
} from '@/types';
import type {User as AuthUserType} from '@/types/auth';

// --- Définitions des types pour les données brutes de la base de données (snake_case) ---

interface DbCompany {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
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
    notes?: string;
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
    category_id?: string | null;
    created_at: string;
    updated_at: string;
    assigned_to?: string;
    companies?: { name: string };
    ticket_messages?: DbTicketMessage[];
    ticket_categories?: { name: string };
}

export interface DbUser {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'client' | 'admin';
    company_id?: string;
    phone?: string;
    created_at: string;
    is_active: boolean;
    deleted_at?: string | null; // MODIFIÉ: Ajout de deleted_at
    companies?: { name: string };
}

interface DevisUpdateDbPayload {
    status: Devis['status'];
    rejection_reason?: string | null;
}

interface InvoiceUpdateDbPayload {
    status: Invoice['status'];
    paid_at?: string | null;
}

interface TicketUpdateDbPayload {
    updated_at: string;
    status?: Ticket['status'];
    priority?: Ticket['priority'];
    assigned_to?: string | null;
    category_id?: string | null;
}

interface TicketMessageCreateDbPayload {
    ticket_id: string;
    author_id: string;
    author_name: string;
    author_role: 'client' | 'admin';
    content: string;
}

type CompanyCreateClientPayload = Omit<Company, 'id' | 'createdAt'>;
type CompanyUpdateClientPayload = Partial<Omit<Company, 'id' | 'createdAt'>>;
type TicketCategoryCreateClientPayload = Omit<TicketCategory, 'id' | 'createdAt'>;

export interface UserCreateDbPayload {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'client' | 'admin';
    company_id?: string | null;
    phone?: string | null;
    // is_active et deleted_at sont gérés par défaut ou par des fonctions spécifiques
}

export type UserUpdateDbPayload = Partial<Omit<UserCreateDbPayload, 'id' | 'email'>> & {
    is_active?: boolean;
    deleted_at?: string | null; // Permettre la mise à jour de deleted_at
};

export interface AdminFullUserCreatePayload {
    email: string;
    password_initial: string;
    first_name: string;
    last_name: string;
    role: 'client' | 'admin';
    company_id?: string | null;
    phone?: string | null;
}

export interface UserProfile extends AuthUserType {
    createdAt: Date;
    // deletedAt est déjà dans AuthUserType via l'import de User
}

const mapCompanyFromDb = (dbCompany: DbCompany): Company => ({
    id: dbCompany.id,
    name: dbCompany.name,
    email: dbCompany.email,
    phone: dbCompany.phone || '',
    address: dbCompany.address || '',
    createdAt: new Date(dbCompany.created_at),
});

const mapDevisItemFromDb = (dbItem: DbDevisItem): DevisItem => ({
    id: dbItem.id,
    description: dbItem.description,
    quantity: dbItem.quantity,
    unitPrice: parseFloat(dbItem.unit_price),
    total: parseFloat(dbItem.total),
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
    notes: dbDevis.notes || undefined,
    rejectionReason: dbDevis.rejection_reason || undefined,
});

const mapInvoiceItemFromDb = (dbItem: DbInvoiceItem): InvoiceItem => ({
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
    notes: dbInvoice.notes || undefined,
});

const mapTicketMessageFromDb = (dbMessage: DbTicketMessage): TicketMessage => ({
    id: dbMessage.id,
    ticketId: dbMessage.ticket_id,
    authorId: dbMessage.author_id,
    authorName: dbMessage.author_name,
    authorRole: dbMessage.author_role,
    content: dbMessage.content,
    createdAt: new Date(dbMessage.created_at),
    attachments: [],
});

const mapTicketCategoryFromDb = (dbCategory: DbTicketCategory): TicketCategory => ({
    id: dbCategory.id,
    name: dbCategory.name,
    description: dbCategory.description || undefined,
    createdAt: new Date(dbCategory.created_at),
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
    categoryId: dbTicket.category_id || undefined,
    categoryName: dbTicket.ticket_categories?.name || undefined,
    createdAt: new Date(dbTicket.created_at),
    updatedAt: new Date(dbTicket.updated_at),
    assignedTo: dbTicket.assigned_to || undefined,
    messages: dbTicket.ticket_messages ? dbTicket.ticket_messages.map(mapTicketMessageFromDb) : [],
    attachments: [],
});

export const mapUserFromDb = (dbUser: DbUser): UserProfile => ({
    id: dbUser.id,
    email: dbUser.email,
    firstName: dbUser.first_name,
    lastName: dbUser.last_name,
    role: dbUser.role as UserProfile['role'], // Cast car le type DB est plus large
    companyId: dbUser.company_id || undefined,
    phone: dbUser.phone || undefined,
    createdAt: new Date(dbUser.created_at),
    isActive: dbUser.is_active,
    deletedAt: dbUser.deleted_at ? new Date(dbUser.deleted_at) : null, // MODIFIÉ: Mapper deleted_at
    companyName: dbUser.companies?.name || undefined,
});

// ... devisApi, invoicesApi, ticketsApi, ticketCategoriesApi, companiesApi ...
// (Ces sections restent inchangées par rapport à votre dernier code fourni pour ces APIs)
export const devisApi = {
    getAll: async (): Promise<Devis[]> => {
        console.log("devisApi.getAll: Début");
        const { data, error } = await supabase
            .from('devis')
            .select('*, companies(name), devis_items(*)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("devisApi.getAll: Erreur Supabase", error);
            throw error;
        }
        console.log("devisApi.getAll: Données reçues", data ? data.length : 0, "devis");
        return data.map(mapDevisFromDb);
    },

    getByCompany: async (companyId: string): Promise<Devis[]> => {
        console.log(`devisApi.getByCompany: Début pour companyId ${companyId}`);
        if (!companyId) {
            console.warn("devisApi.getByCompany: companyId est vide ou non défini.");
            return [];
        }
        const { data, error } = await supabase
            .from('devis')
            .select('*, companies(name), devis_items(*)')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error(`devisApi.getByCompany: Erreur Supabase pour companyId ${companyId}`, error);
            throw error;
        }
        console.log(`devisApi.getByCompany: Données reçues pour companyId ${companyId}`, data ? data.length : 0, "devis");
        return data.map(mapDevisFromDb);
    },

    updateStatus: async (id: string, status: Devis['status'], rejectionReason?: string): Promise<Devis> => {
        console.log(`devisApi.updateStatus: Début pour ID ${id}, status ${status}, raison: ${rejectionReason}`);
        const updatePayload: DevisUpdateDbPayload = { status };
        if (status === 'rejected') {
            updatePayload.rejection_reason = rejectionReason || null;
        } else {
            updatePayload.rejection_reason = null;
        }

        const { data, error } = await supabase
            .from('devis')
            .update(updatePayload)
            .eq('id', id)
            .select('*, companies(name), devis_items(*)')
            .single();

        if (error) {
            console.error(`devisApi.updateStatus: Erreur Supabase pour ID ${id}`, error);
            throw error;
        }
        console.log(`devisApi.updateStatus: Devis ID ${id} mis à jour`, data);
        return mapDevisFromDb(data);
    },

    create: async (devisData: Omit<Devis, 'id' | 'number' | 'createdAt' | 'companyName' | 'items'> & {
        items: Omit<DevisItem, 'id' | 'total'>[]
    }): Promise<Devis> => {
        console.log("devisApi.create: Début avec devisData:", JSON.stringify(devisData));
        const devisNumber = `DEV-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;

        const devisToInsert = {
            number: devisNumber,
            company_id: devisData.companyId,
            object: devisData.object,
            amount: devisData.amount.toString(),
            status: devisData.status || 'draft',
            valid_until: devisData.validUntil.toISOString(),
            notes: devisData.notes || null,
        };

        const { data: newDevisData, error: devisError } = await supabase
            .from('devis')
            .insert(devisToInsert)
            .select('id')
            .single();

        if (devisError) {
            console.error("devisApi.create: Erreur Supabase lors de l'insertion du devis:", devisError);
            throw devisError;
        }
        const devisId = newDevisData.id;
        console.log("devisApi.create: Devis principal inséré avec ID:", devisId);

        if (devisData.items && devisData.items.length > 0) {
            const itemsToInsert = devisData.items.map(item => ({
                devis_id: devisId,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unitPrice.toString(),
                total: (item.quantity * item.unitPrice).toString(),
            }));

            const { error: itemsError } = await supabase
                .from('devis_items')
                .insert(itemsToInsert);

            if (itemsError) {
                console.error("devisApi.create: Erreur Supabase lors de l'insertion des items:", itemsError);
                await supabase.from('devis').delete().eq('id', devisId);
                console.warn(`devisApi.create: Devis ${devisId} supprimé suite à l'échec de l'insertion des items.`);
                throw itemsError;
            }
            console.log("devisApi.create: Items du devis insérés avec succès.");
        }

        const { data: completeDevis, error: fetchError } = await supabase
            .from('devis')
            .select('*, companies(name), devis_items(*)')
            .eq('id', devisId)
            .single();

        if (fetchError) {
            console.error(`devisApi.create: Erreur Supabase lors de la récupération du devis complet ${devisId}:`, fetchError);
            throw fetchError;
        }
        console.log(`devisApi.create: Devis complet ${devisId} récupéré avec succès.`);
        return mapDevisFromDb(completeDevis);
    }
};

export const invoicesApi = {
    getAll: async (): Promise<Invoice[]> => {
        console.log("invoicesApi.getAll: Début");
        const { data, error } = await supabase
            .from('invoices')
            .select('*, companies(name), invoice_items(*)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("invoicesApi.getAll: Erreur Supabase", error);
            throw error;
        }
        console.log("invoicesApi.getAll: Données reçues", data ? data.length : 0, "factures");
        return data.map(mapInvoiceFromDb);
    },

    getByCompany: async (companyId: string): Promise<Invoice[]> => {
        console.log(`invoicesApi.getByCompany: Début pour companyId ${companyId}`);
        if (!companyId) {
            console.warn("invoicesApi.getByCompany: companyId est vide ou non défini.");
            return [];
        }
        const { data, error } = await supabase
            .from('invoices')
            .select('*, companies(name), invoice_items(*)')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error(`invoicesApi.getByCompany: Erreur Supabase pour companyId ${companyId}`, error);
            throw error;
        }
        console.log(`invoicesApi.getByCompany: Données reçues pour companyId ${companyId}`, data ? data.length : 0, "factures");
        return data.map(mapInvoiceFromDb);
    },

    updateStatus: async (id: string, status: Invoice['status']): Promise<Invoice> => {
        console.log(`invoicesApi.updateStatus: Début pour ID ${id}, status ${status}`);
        const updatePayload: InvoiceUpdateDbPayload = { status };
        if (status === 'paid') {
            updatePayload.paid_at = new Date().toISOString();
        } else if (status === 'pending' || status === 'overdue') {
            updatePayload.paid_at = null;
        }

        const { data, error } = await supabase
            .from('invoices')
            .update(updatePayload)
            .eq('id', id)
            .select('*, companies(name), invoice_items(*)')
            .single();

        if (error) {
            console.error(`invoicesApi.updateStatus: Erreur Supabase pour ID ${id}`, error);
            throw error;
        }
        console.log(`invoicesApi.updateStatus: Facture ID ${id} mise à jour`, data);
        return mapInvoiceFromDb(data);
    },

    create: async (invoiceData: Omit<Invoice, 'id' | 'number' | 'createdAt' | 'companyName' | 'paidAt' | 'items'> & {
        items: Omit<InvoiceItem, 'id' | 'total'>[]
    }): Promise<Invoice> => {
        console.log("invoicesApi.create: Début avec invoiceData:", JSON.stringify(invoiceData));
        const invoiceNumber = `FAC-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;

        const invoiceToInsert = {
            number: invoiceNumber,
            company_id: invoiceData.companyId,
            amount: invoiceData.amount.toString(),
            status: invoiceData.status || 'pending',
            due_date: invoiceData.dueDate.toISOString(),
            notes: invoiceData.notes || null,
        };

        const { data: newInvoiceData, error: invoiceError } = await supabase
            .from('invoices')
            .insert(invoiceToInsert)
            .select('id')
            .single();

        if (invoiceError) {
            console.error("invoicesApi.create: Erreur Supabase lors de l'insertion de la facture:", invoiceError);
            throw invoiceError;
        }
        const invoiceId = newInvoiceData.id;
        console.log("invoicesApi.create: Facture principale insérée avec ID:", invoiceId);

        if (invoiceData.items && invoiceData.items.length > 0) {
            const itemsToInsert = invoiceData.items.map(item => ({
                invoice_id: invoiceId,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unitPrice.toString(),
                total: (item.quantity * item.unitPrice).toString(),
            }));

            const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(itemsToInsert);

            if (itemsError) {
                console.error("invoicesApi.create: Erreur Supabase lors de l'insertion des items:", itemsError);
                await supabase.from('invoices').delete().eq('id', invoiceId);
                console.warn(`invoicesApi.create: Facture ${invoiceId} supprimée suite à l'échec de l'insertion des items.`);
                throw itemsError;
            }
            console.log("invoicesApi.create: Items de la facture insérés avec succès.");
        }

        const { data: completeInvoice, error: fetchError } = await supabase
            .from('invoices')
            .select('*, companies(name), invoice_items(*)')
            .eq('id', invoiceId)
            .single();

        if (fetchError) {
            console.error(`invoicesApi.create: Erreur Supabase lors de la récupération de la facture complète ${invoiceId}:`, fetchError);
            throw fetchError;
        }
        console.log(`invoicesApi.create: Facture complète ${invoiceId} récupérée avec succès.`);
        return mapInvoiceFromDb(completeInvoice);
    }
};


export const ticketsApi = {
    getAll: async (): Promise<Ticket[]> => {
        console.log("ticketsApi.getAll: Début");
        const { data, error } = await supabase
            .from('tickets')
            .select('*, companies(name), ticket_messages(*), ticket_categories(name)')
            .order('updated_at', { ascending: false });

        if (error) {
            console.error("ticketsApi.getAll: Erreur Supabase", error);
            throw error;
        }
        console.log("ticketsApi.getAll: Données reçues", data ? data.length : 0, "tickets");
        return data.map(mapTicketFromDb);
    },

    getByCompany: async (companyId: string): Promise<Ticket[]> => {
        console.log(`ticketsApi.getByCompany: Début pour companyId ${companyId}`);
        if (!companyId) {
            console.warn("ticketsApi.getByCompany: companyId est vide ou non défini.");
            return [];
        }
        const { data, error } = await supabase
            .from('tickets')
            .select('*, companies(name), ticket_messages(*), ticket_categories(name)')
            .eq('company_id', companyId)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error(`ticketsApi.getByCompany: Erreur Supabase pour companyId ${companyId}`, error);
            throw error;
        }
        console.log(`ticketsApi.getByCompany: Données reçues pour companyId ${companyId}`, data ? data.length : 0, "tickets");
        return data.map(mapTicketFromDb);
    },

    create: async (ticketData: Omit<Ticket, 'id' | 'number' | 'createdAt' | 'updatedAt' | 'messages' | 'attachments' | 'status' | 'priority' | 'categoryName'> & { companyName?: string }): Promise<Ticket> => {
        console.log("ticketsApi.create: Début avec ticketData:", JSON.stringify(ticketData));
        const ticketNumber = `TICKET-${String(Date.now()).slice(-6)}`;
        const now = new Date().toISOString();

        const ticketToInsert = {
            number: ticketNumber,
            company_id: ticketData.companyId,
            subject: ticketData.subject,
            description: ticketData.description,
            status: 'open' as Ticket['status'],
            priority: 'medium' as Ticket['priority'],
            category_id: ticketData.categoryId || null,
            created_at: now,
            updated_at: now,
        };

        const { data: newTicket, error } = await supabase
            .from('tickets')
            .insert(ticketToInsert)
            .select('*, companies(name), ticket_categories(name)')
            .single();

        if (error) {
            console.error("ticketsApi.create: Erreur Supabase lors de la création du ticket:", error);
            throw error;
        }
        console.log("ticketsApi.create: Ticket créé avec succès:", newTicket);
        return mapTicketFromDb(newTicket);
    },

    addMessage: async (ticketId: string, messageData: Omit<TicketMessage, 'id' | 'ticketId' | 'createdAt' | 'attachments'>): Promise<Ticket> => {
        console.log(`ticketsApi.addMessage: Ajout message au ticket ${ticketId}`);
        const messageToInsert: TicketMessageCreateDbPayload = {
            ticket_id: ticketId,
            author_id: messageData.authorId,
            author_name: messageData.authorName,
            author_role: messageData.authorRole,
            content: messageData.content,
        };

        const { error: messageError } = await supabase
            .from('ticket_messages')
            .insert(messageToInsert);

        if (messageError) {
            console.error(`ticketsApi.addMessage: Erreur Supabase lors de l'ajout du message:`, messageError);
            throw messageError;
        }

        const ticketUpdatePayload: TicketUpdateDbPayload = {
            updated_at: new Date().toISOString(),
        };

        const {data: currentTicketData} = await supabase.from('tickets').select('status').eq('id', ticketId).single();

        if (currentTicketData) {
            if (messageData.authorRole === 'admin') {
                if (currentTicketData.status === 'open' || currentTicketData.status === 'pending_admin_response') {
                    ticketUpdatePayload.status = 'pending_client_response';
                } else if (currentTicketData.status === 'resolved') {
                    ticketUpdatePayload.status = 'pending_client_response';
                }
            } else { // authorRole === 'client'
                if (currentTicketData.status === 'pending_client_response' || currentTicketData.status === 'open' || currentTicketData.status === 'in_progress' || currentTicketData.status === 'resolved') {
                    ticketUpdatePayload.status = 'pending_admin_response';
                }
            }
        }

        const { data: updatedTicket, error: ticketUpdateError } = await supabase
            .from('tickets')
            .update(ticketUpdatePayload)
            .eq('id', ticketId)
            .select('*, companies(name), ticket_messages(*), ticket_categories(name)')
            .single();

        if (ticketUpdateError) {
            console.error(`ticketsApi.addMessage: Erreur Supabase lors de la mise à jour du ticket:`, ticketUpdateError);
            throw ticketUpdateError;
        }
        console.log(`ticketsApi.addMessage: Ticket ${ticketId} mis à jour avec nouveau message.`);
        return mapTicketFromDb(updatedTicket);
    },

    updateStatus: async (id: string, status: Ticket['status'], priority?: Ticket['priority'], assignedTo?: string, categoryId?: string): Promise<Ticket> => {
        console.log(`ticketsApi.updateStatus: Début pour ID ${id}, status ${status}, categoryId ${categoryId}`);
        const updatePayload: TicketUpdateDbPayload = {
            updated_at: new Date().toISOString(),
            status,
        };
        if (priority) updatePayload.priority = priority;
        if (assignedTo !== undefined) updatePayload.assigned_to = assignedTo === '' ? null : assignedTo;
        if (categoryId !== undefined) updatePayload.category_id = categoryId === '' ? null : categoryId;

        const { data, error } = await supabase
            .from('tickets')
            .update(updatePayload)
            .eq('id', id)
            .select('*, companies(name), ticket_messages(*), ticket_categories(name)')
            .single();

        if (error) {
            console.error(`ticketsApi.updateStatus: Erreur Supabase pour ID ${id}`, error);
            throw error;
        }
        console.log(`ticketsApi.updateStatus: Ticket ID ${id} mis à jour`, data);
        return mapTicketFromDb(data);
    },

    delete: async (id: string): Promise<void> => {
        console.log(`ticketsApi.delete: Début suppression pour ID ${id}`);
        const { error } = await supabase
            .from('tickets')
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`ticketsApi.delete: Erreur Supabase pour ID ${id}:`, error);
            throw error;
        }
        console.log(`ticketsApi.delete: Ticket ID ${id} supprimé.`);
    },
};

export const ticketCategoriesApi = {
    getAll: async (): Promise<TicketCategory[]> => {
        console.log("ticketCategoriesApi.getAll: Début");
        const { data, error } = await supabase
            .from('ticket_categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error("ticketCategoriesApi.getAll: Erreur Supabase", error);
            throw error;
        }
        console.log("ticketCategoriesApi.getAll: Données reçues", data ? data.length : 0, "catégories");
        return data.map(mapTicketCategoryFromDb);
    },

    create: async (categoryData: TicketCategoryCreateClientPayload): Promise<TicketCategory> => {
        console.log("ticketCategoriesApi.create: Début avec categoryData:", JSON.stringify(categoryData));
        const categoryToInsert = {
            name: categoryData.name,
            description: categoryData.description || null,
        };

        const { data, error } = await supabase
            .from('ticket_categories')
            .insert(categoryToInsert)
            .select()
            .single();

        if (error) {
            console.error("ticketCategoriesApi.create: Erreur Supabase:", error);
            throw error;
        }
        console.log("ticketCategoriesApi.create: Catégorie créée:", data);
        return mapTicketCategoryFromDb(data);
    },

    update: async (id: string, categoryData: Partial<TicketCategoryCreateClientPayload>): Promise<TicketCategory> => {
        console.log(`ticketCategoriesApi.update: Début pour ID ${id} avec categoryData:`, JSON.stringify(categoryData));
        const { data, error } = await supabase
            .from('ticket_categories')
            .update(categoryData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`ticketCategoriesApi.update: Erreur Supabase pour ID ${id}:`, error);
            throw error;
        }
        console.log(`ticketCategoriesApi.update: Catégorie ID ${id} mise à jour.`);
        return mapTicketCategoryFromDb(data);
    },

    delete: async (id: string): Promise<void> => {
        console.log(`ticketCategoriesApi.delete: Début suppression pour ID ${id}`);
        const { error } = await supabase
            .from('ticket_categories')
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`ticketCategoriesApi.delete: Erreur Supabase pour ID ${id}:`, error);
            if (error.code === '23503') { // Foreign key violation
                throw new Error(`Impossible de supprimer la catégorie. Elle est encore référencée par des tickets.`);
            }
            throw error;
        }
        console.log(`ticketCategoriesApi.delete: Catégorie ID ${id} supprimée.`);
    }
};

export const companiesApi = {
    getAll: async (): Promise<Company[]> => {
        console.log("companiesApi.getAll: Début");
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error("companiesApi.getAll: Erreur Supabase", error);
            throw error;
        }
        console.log("companiesApi.getAll: Données reçues", data ? data.length : 0, "entreprises");
        return data.map(mapCompanyFromDb);
    },

    getById: async (id: string): Promise<Company | null> => {
        console.log(`companiesApi.getById: Début pour ID ${id}`);
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                console.warn(`companiesApi.getById: Entreprise ID ${id} non trouvée.`);
                return null;
            }
            console.error(`companiesApi.getById: Erreur Supabase pour ID ${id}`, error);
            throw error;
        }
        console.log(`companiesApi.getById: Entreprise ID ${id} trouvée.`);
        return data ? mapCompanyFromDb(data) : null;
    },

    create: async (companyData: CompanyCreateClientPayload): Promise<Company> => {
        console.log("companiesApi.create: Début avec companyData:", JSON.stringify(companyData));
        const companyToInsert = {
            name: companyData.name,
            email: companyData.email,
            phone: companyData.phone || null,
            address: companyData.address || null,
        };

        const { data, error } = await supabase
            .from('companies')
            .insert(companyToInsert)
            .select()
            .single();

        if (error) {
            console.error("companiesApi.create: Erreur Supabase lors de la création de l'entreprise:", error);
            throw error;
        }
        console.log("companiesApi.create: Entreprise créée avec succès:", data);
        return mapCompanyFromDb(data);
    },

    update: async (id: string, companyData: CompanyUpdateClientPayload): Promise<Company> => {
        console.log(`companiesApi.update: Début pour ID ${id} avec companyData:`, JSON.stringify(companyData));
        const updatePayload: Partial<DbCompany> = {};
        if (companyData.name !== undefined) updatePayload.name = companyData.name;
        if (companyData.email !== undefined) updatePayload.email = companyData.email;
        if (companyData.phone !== undefined) updatePayload.phone = companyData.phone || null;
        if (companyData.address !== undefined) updatePayload.address = companyData.address || null;

        const { data, error } = await supabase
            .from('companies')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`companiesApi.update: Erreur Supabase pour ID ${id}`, error);
            throw error;
        }
        console.log(`companiesApi.update: Entreprise ID ${id} mise à jour.`);
        return mapCompanyFromDb(data);
    },

    delete: async (id: string): Promise<void> => {
        console.log(`companiesApi.delete: Début suppression pour ID ${id}`);
        const { error } = await supabase
            .from('companies')
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`companiesApi.delete: Erreur Supabase pour ID ${id}`, error);
            if (error.code === '23503') {
                throw new Error(`Impossible de supprimer l'entreprise. Elle est encore référencée par des devis, factures ou utilisateurs.`);
            }
            throw error;
        }
        console.log(`companiesApi.delete: Entreprise ID ${id} supprimée.`);
    }
};

// --- usersApi ---
export const usersApi = {
    getAll: async (includeDeleted = false): Promise<UserProfile[]> => {
        console.log(`usersApi.getAll: Début (includeDeleted: ${includeDeleted})`);
        let query = supabase
            .from('users')
            .select('*, companies(name)');

        if (!includeDeleted) {
            query = query.is('deleted_at', null); // Ne pas inclure ceux qui ont une date de suppression
        }
        // Si includeDeleted est true, on ne filtre pas sur deleted_at, donc on les aura tous.
        // Le tri peut s'appliquer à tous les cas.
        query = query.order('last_name', { ascending: true });

        const { data, error } = await query;

        if (error) {
            console.error("usersApi.getAll: Erreur Supabase", error);
            throw error;
        }
        console.log("usersApi.getAll: Données reçues", data ? data.length : 0, "utilisateurs");
        return data.map(mapUserFromDb);
    },

    getById: async (id: string): Promise<UserProfile | null> => {
        console.log(`usersApi.getById: Début pour ID ${id}`);
        const { data, error } = await supabase
            .from('users')
            .select('*, companies(name)')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // Code d'erreur pour "aucune ligne trouvée"
                console.warn(`usersApi.getById: Utilisateur ID ${id} non trouvé.`);
                return null;
            }
            console.error(`usersApi.getById: Erreur Supabase pour ID ${id}`, error);
            throw error;
        }
        console.log(`usersApi.getById: Utilisateur ID ${id} trouvé.`);
        return data ? mapUserFromDb(data) : null;
    },

    adminCreateFullUser: async (payload: AdminFullUserCreatePayload): Promise<{ message: string, userProfile: UserProfile | null }> => {
        console.log("usersApi.adminCreateFullUser: Appel de la fonction Edge 'admin-create-user'");
        // La fonction Edge `admin-create-user` doit initialiser `is_active` à true et `deleted_at` à null.
        const { data, error } = await supabase.functions.invoke('admin-create-user', {
            body: payload,
        });

        if (error) {
            console.error("usersApi.adminCreateFullUser: Erreur lors de l'appel de la fonction Edge:", error);
            throw new Error(error.message || "Erreur lors de la création de l'utilisateur complet.");
        }

        console.log("usersApi.adminCreateFullUser: Réponse de la fonction Edge:", data);
        if (data && data.userProfile) {
            return {
                message: data.message || "Utilisateur créé avec succès.",
                userProfile: mapUserFromDb(data.userProfile as DbUser),
            };
        } else {
            // Gérer le cas où la fonction Edge retourne une erreur métier dans `data.error`
            if (data && data.error) {
                console.error("usersApi.adminCreateFullUser: Erreur retournée par la fonction Edge:", data.error);
                throw new Error(data.error);
            }
            // Cas d'une réponse inattendue sans userProfile ni data.error
            return {
                message: data.message || "Réponse inattendue de la fonction de création d'utilisateur.",
                userProfile: null,
            };
        }
    },

    update: async (id: string, userData: UserUpdateDbPayload): Promise<UserProfile> => {
        console.log(`usersApi.update: Début pour ID ${id} avec userData:`, JSON.stringify(userData));
        // S'assurer que si on met à jour is_active, on ne touche pas à deleted_at ici,
        // et vice-versa, sauf si explicitement demandé.
        // La logique de cohérence (si deleted_at, alors is_active=false) est gérée par les fonctions dédiées.
        const { data, error } = await supabase
            .from('users')
            .update(userData)
            .eq('id', id)
            .select('*, companies(name)')
            .single();

        if (error) {
            console.error(`usersApi.update: Erreur Supabase pour ID ${id}`, error);
            throw error;
        }
        console.log(`usersApi.update: Utilisateur ID ${id} mis à jour.`);
        return mapUserFromDb(data);
    },

    // Gère le blocage/déblocage (is_active) pour les utilisateurs NON supprimés
    toggleUserStatus: async (userId: string, isActive: boolean): Promise<UserProfile> => {
        console.log(`usersApi.toggleUserStatus: Début pour userId ${userId}, isActive ${isActive}`);
        // On ne modifie is_active que si l'utilisateur n'est pas dans la corbeille.
        const { data, error } = await supabase
            .from('users')
            .update({ is_active: isActive })
            .eq('id', userId)
            .is('deleted_at', null) // Condition ajoutée: ne s'applique qu'aux non-supprimés
            .select('*, companies(name)')
            .single();

        if (error) {
            console.error(`usersApi.toggleUserStatus: Erreur Supabase pour userId ${userId}`, error);
            throw error;
        }
        if (!data) {
            // Soit l'utilisateur n'existe pas, soit il est déjà dans la corbeille.
            // On récupère l'état actuel pour le retourner sans le modifier.
            const currentUser = await usersApi.getById(userId);
            if (currentUser) return currentUser; // Retourne l'utilisateur tel quel s'il est dans la corbeille
            throw new Error("Utilisateur non trouvé, impossible de changer son statut actif.");
        }
        console.log(`usersApi.toggleUserStatus: Statut utilisateur ${userId} mis à jour.`);
        return mapUserFromDb(data);
    },

    // Met un utilisateur à la corbeille (soft delete)
    softDelete: async (id: string): Promise<UserProfile> => {
        console.log(`usersApi.softDelete: Mise à la corbeille pour ID ${id}`);
        const { data, error } = await supabase
            .from('users')
            .update({ deleted_at: new Date().toISOString(), is_active: false }) // Mettre aussi is_active à false
            .eq('id', id)
            .select('*, companies(name)')
            .single();
        if (error) {
            console.error(`usersApi.softDelete: Erreur pour ID ${id}:`, error);
            throw error;
        }
        console.log(`usersApi.softDelete: Utilisateur ID ${id} mis à la corbeille.`);
        return mapUserFromDb(data);
    },

    // Restaure un utilisateur depuis la corbeille
    restore: async (id: string): Promise<UserProfile> => {
        console.log(`usersApi.restore: Restauration pour ID ${id}`);
        const { data, error } = await supabase
            .from('users')
            .update({ deleted_at: null, is_active: true }) // Réactiver l'utilisateur
            .eq('id', id)
            .select('*, companies(name)')
            .single();
        if (error) {
            console.error(`usersApi.restore: Erreur pour ID ${id}:`, error);
            throw error;
        }
        console.log(`usersApi.restore: Utilisateur ID ${id} restauré.`);
        return mapUserFromDb(data);
    },

    // Suppression définitive (utilise la fonction Edge existante)
    deletePermanently: async (id: string): Promise<void> => {
        console.log(`usersApi.deletePermanently: Appel de la fonction Edge 'delete-user-and-profile' pour ID ${id}`);
        const { data, error } = await supabase.functions.invoke('delete-user-and-profile', {
            body: { userId: id },
        });

        if (error) {
            console.error(`usersApi.deletePermanently: Erreur lors de l'appel de la fonction Edge pour ID ${id}:`, error);
            throw new Error(error.message || "Erreur lors de la suppression définitive de l'utilisateur.");
        }
        console.log(`usersApi.deletePermanently: Utilisateur ID ${id} supprimé définitivement via fonction Edge. Réponse:`, data);
    }
};