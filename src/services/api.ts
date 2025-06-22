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
    validated_at?: string;
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
    dexchange_transaction_id?: string;
    payment_method?: string;
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
    deleted_at?: string | null;
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
}

export type UserUpdateDbPayload = Partial<Omit<UserCreateDbPayload, 'id' | 'email'>> & {
    is_active?: boolean;
    deleted_at?: string | null;
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
    validatedAt: dbDevis.validated_at ? new Date(dbDevis.validated_at) : undefined,
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
    dexchangeTransactionId: dbInvoice.dexchange_transaction_id,
    paymentMethod: dbInvoice.payment_method,
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
    role: dbUser.role as UserProfile['role'],
    companyId: dbUser.company_id || undefined,
    phone: dbUser.phone || undefined,
    createdAt: new Date(dbUser.created_at),
    isActive: dbUser.is_active,
    deletedAt: dbUser.deleted_at ? new Date(dbUser.deleted_at) : null,
    companyName: dbUser.companies?.name || undefined,
});

export const devisApi = {
    getAll: async (): Promise<Devis[]> => {
        const { data, error } = await supabase
            .from('devis')
            .select('*, companies(name), devis_items(*)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(mapDevisFromDb);
    },

    getByCompany: async (companyId: string): Promise<Devis[]> => {
        if (!companyId) return [];
        const { data, error } = await supabase
            .from('devis')
            .select('*, companies(name), devis_items(*)')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(mapDevisFromDb);
    },

    updateStatus: async (id: string, status: Devis['status'], rejectionReason?: string): Promise<Devis> => {
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
        if (error) throw error;
        return mapDevisFromDb(data);
    },

    create: async (devisData: Omit<Devis, 'id' | 'number' | 'createdAt' | 'companyName' | 'items'> & { items: Omit<DevisItem, 'id' | 'total'>[] }): Promise<Devis> => {
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
        const { data: newDevisData, error: devisError } = await supabase.from('devis').insert(devisToInsert).select('id').single();
        if (devisError) throw devisError;
        const devisId = newDevisData.id;
        if (devisData.items && devisData.items.length > 0) {
            const itemsToInsert = devisData.items.map(item => ({
                devis_id: devisId,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unitPrice.toString(),
                total: (item.quantity * item.unitPrice).toString(),
            }));
            const { error: itemsError } = await supabase.from('devis_items').insert(itemsToInsert);
            if (itemsError) {
                await supabase.from('devis').delete().eq('id', devisId);
                throw itemsError;
            }
        }
        const { data: completeDevis, error: fetchError } = await supabase.from('devis').select('*, companies(name), devis_items(*)').eq('id', devisId).single();
        if (fetchError) throw fetchError;
        return mapDevisFromDb(completeDevis);
    },

    updateStatusAsClient: async (id: string, status: 'approved' | 'rejected', reason?: string): Promise<Devis> => {
        const { data, error } = await supabase.rpc('update_devis_status_by_client', {
            quote_id: id,
            new_status: status,
            rejection_reason_text: reason,
        });

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            throw new Error("La mise à jour du devis a réussi mais aucun enregistrement n'a été retourné.");
        }
        return mapDevisFromDb(data[0]);
    },
};

export const invoicesApi = {
    getAll: async (): Promise<Invoice[]> => {
        const { data, error } = await supabase.from('invoices').select('*, companies(name), invoice_items(*)').order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(mapInvoiceFromDb);
    },
    getByCompany: async (companyId: string): Promise<Invoice[]> => {
        if (!companyId) return [];
        const { data, error } = await supabase.from('invoices').select('*, companies(name), invoice_items(*)').eq('company_id', companyId).order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(mapInvoiceFromDb);
    },
    updateStatus: async (id: string, status: Invoice['status']): Promise<Invoice> => {
        const updatePayload: InvoiceUpdateDbPayload = { status };
        if (status === 'paid') {
            updatePayload.paid_at = new Date().toISOString();
        } else if (status === 'pending' || status === 'overdue') {
            updatePayload.paid_at = null;
        }
        const { data, error } = await supabase.from('invoices').update(updatePayload).eq('id', id).select('*, companies(name), invoice_items(*)').single();
        if (error) throw error;
        return mapInvoiceFromDb(data);
    },
    create: async (invoiceData: Omit<Invoice, 'id' | 'number' | 'createdAt' | 'companyName' | 'paidAt' | 'items' | 'dexchangeTransactionId' | 'paymentMethod'> & { items: Omit<InvoiceItem, 'id' | 'total'>[] }): Promise<Invoice> => {
        const invoiceNumber = `FAC-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
        const invoiceToInsert = {
            number: invoiceNumber,
            company_id: invoiceData.companyId,
            amount: invoiceData.amount.toString(),
            // MODIFICATION: La valeur par défaut est maintenant 'draft' pour être cohérente avec le nouveau flux.
            status: invoiceData.status || 'draft',
            due_date: invoiceData.dueDate.toISOString(),
            notes: invoiceData.notes || null,
        };
        const { data: newInvoiceData, error: invoiceError } = await supabase.from('invoices').insert(invoiceToInsert).select('id').single();
        if (invoiceError) throw invoiceError;
        const invoiceId = newInvoiceData.id;
        if (invoiceData.items && invoiceData.items.length > 0) {
            const itemsToInsert = invoiceData.items.map(item => ({
                invoice_id: invoiceId,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unitPrice.toString(),
                total: (item.quantity * item.unitPrice).toString(),
            }));
            const { error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert);
            if (itemsError) {
                await supabase.from('invoices').delete().eq('id', invoiceId);
                throw itemsError;
            }
        }
        const { data: completeInvoice, error: fetchError } = await supabase.from('invoices').select('*, companies(name), invoice_items(*)').eq('id', invoiceId).single();
        if (fetchError) throw fetchError;
        return mapInvoiceFromDb(completeInvoice);
    },
    createFromDevis: async (devisId: string): Promise<Invoice> => {
        const { data, error } = await supabase.functions.invoke('create-invoice-from-devis', {
            body: { devis_id: devisId },
        });
        if (error) throw error;
        if (data.error) throw new Error(data.error);
        return mapInvoiceFromDb(data.invoice);
    },
    initiateDexchangePayment: async (invoiceId: string, paymentMethod: string, phoneNumber: string): Promise<{ paymentUrl: string }> => {
        const { data, error } = await supabase.functions.invoke('initiate-payment', {
            body: {
                invoice_id: invoiceId,
                payment_method: paymentMethod,
                phone_number: phoneNumber,
            },
        });

        if (error) throw new Error(error.message);
        if (data.error) throw new Error(data.error);
        if (!data.paymentUrl) throw new Error("URL de paiement non reçue de l'API.");

        return data;
    },
};

export const ticketsApi = {
    getAll: async (): Promise<Ticket[]> => {
        const { data, error } = await supabase.from('tickets').select('*, companies(name), ticket_messages(*), ticket_categories(name)').order('updated_at', { ascending: false });
        if (error) throw error;
        return data.map(mapTicketFromDb);
    },
    getByCompany: async (companyId: string): Promise<Ticket[]> => {
        if (!companyId) return [];
        const { data, error } = await supabase.from('tickets').select('*, companies(name), ticket_messages(*), ticket_categories(name)').eq('company_id', companyId).order('updated_at', { ascending: false });
        if (error) throw error;
        return data.map(mapTicketFromDb);
    },
    create: async (ticketData: Omit<Ticket, 'id' | 'number' | 'createdAt' | 'updatedAt' | 'messages' | 'attachments' | 'status' | 'categoryName' | 'assignedTo' | 'companyName'>): Promise<Ticket> => {
        const ticketNumber = `TICKET-${String(Date.now()).slice(-6)}`;
        const now = new Date().toISOString();
        const ticketToInsert = {
            number: ticketNumber,
            company_id: ticketData.companyId,
            subject: ticketData.subject,
            description: ticketData.description,
            status: 'open' as Ticket['status'], // Hardcoded initial status
            priority: ticketData.priority, // Use priority from ticketData
            category_id: ticketData.categoryId || null,
            created_at: now,
            updated_at: now,
        };
        const { data: newTicket, error } = await supabase.from('tickets').insert(ticketToInsert).select('*, companies(name), ticket_categories(name)').single();
        if (error) throw error;
        return mapTicketFromDb(newTicket);
    },
    addMessage: async (ticketId: string, messageData: Omit<TicketMessage, 'id' | 'ticketId' | 'createdAt' | 'attachments'>): Promise<Ticket> => {
        const messageToInsert: TicketMessageCreateDbPayload = {
            ticket_id: ticketId,
            author_id: messageData.authorId,
            author_name: messageData.authorName,
            author_role: messageData.authorRole,
            content: messageData.content,
        };
        const { error: messageError } = await supabase.from('ticket_messages').insert(messageToInsert);
        if (messageError) throw messageError;
        const ticketUpdatePayload: TicketUpdateDbPayload = { updated_at: new Date().toISOString(), };
        const {data: currentTicketData} = await supabase.from('tickets').select('status').eq('id', ticketId).single();
        if (currentTicketData) {
            if (messageData.authorRole === 'admin') {
                if (currentTicketData.status === 'open' || currentTicketData.status === 'pending_admin_response') {
                    ticketUpdatePayload.status = 'pending_client_response';
                } else if (currentTicketData.status === 'resolved') {
                    ticketUpdatePayload.status = 'pending_client_response';
                }
            } else {
                if (currentTicketData.status === 'pending_client_response' || currentTicketData.status === 'open' || currentTicketData.status === 'in_progress' || currentTicketData.status === 'resolved') {
                    ticketUpdatePayload.status = 'pending_admin_response';
                }
            }
        }
        const { data: updatedTicket, error: ticketUpdateError } = await supabase.from('tickets').update(ticketUpdatePayload).eq('id', ticketId).select('*, companies(name), ticket_messages(*), ticket_categories(name)').single();
        if (ticketUpdateError) throw ticketUpdateError;
        return mapTicketFromDb(updatedTicket);
    },
    updateStatus: async (id: string, status: Ticket['status'], priority?: Ticket['priority'], assignedTo?: string, categoryId?: string): Promise<Ticket> => {
        const updatePayload: TicketUpdateDbPayload = { updated_at: new Date().toISOString(), status, };
        if (priority) updatePayload.priority = priority;
        if (assignedTo !== undefined) updatePayload.assigned_to = assignedTo === '' ? null : assignedTo;
        if (categoryId !== undefined) updatePayload.category_id = categoryId === '' ? null : categoryId;
        const { data, error } = await supabase.from('tickets').update(updatePayload).eq('id', id).select('*, companies(name), ticket_messages(*), ticket_categories(name)').single();
        if (error) throw error;
        return mapTicketFromDb(data);
    },
    delete: async (id: string): Promise<void> => {
        const { error } = await supabase.from('tickets').delete().eq('id', id);
        if (error) throw error;
    },
};

export const ticketCategoriesApi = {
    getAll: async (): Promise<TicketCategory[]> => {
        const { data, error } = await supabase.from('ticket_categories').select('*').order('name', { ascending: true });
        if (error) throw error;
        return data.map(mapTicketCategoryFromDb);
    },
    create: async (categoryData: TicketCategoryCreateClientPayload): Promise<TicketCategory> => {
        const categoryToInsert = { name: categoryData.name, description: categoryData.description || null, };
        const { data, error } = await supabase.from('ticket_categories').insert(categoryToInsert).select().single();
        if (error) throw error;
        return mapTicketCategoryFromDb(data);
    },
    update: async (id: string, categoryData: Partial<TicketCategoryCreateClientPayload>): Promise<TicketCategory> => {
        const { data, error } = await supabase.from('ticket_categories').update(categoryData).eq('id', id).select().single();
        if (error) throw error;
        return mapTicketCategoryFromDb(data);
    },
    delete: async (id: string): Promise<void> => {
        const { error } = await supabase.from('ticket_categories').delete().eq('id', id);
        if (error) {
            if (error.code === '23503') {
                throw new Error(`Impossible de supprimer la catégorie. Elle est encore référencée par des tickets.`);
            }
            throw error;
        }
    }
};

export const companiesApi = {
    getAll: async (): Promise<Company[]> => {
        const { data, error } = await supabase.from('companies').select('*').order('name', { ascending: true });
        if (error) throw error;
        return data.map(mapCompanyFromDb);
    },
    getById: async (id: string): Promise<Company | null> => {
        const { data, error } = await supabase.from('companies').select('*').eq('id', id).single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? mapCompanyFromDb(data) : null;
    },
    create: async (companyData: CompanyCreateClientPayload): Promise<Company> => {
        const companyToInsert = { name: companyData.name, email: companyData.email, phone: companyData.phone || null, address: companyData.address || null, };
        const { data, error } = await supabase.from('companies').insert(companyToInsert).select().single();
        if (error) throw error;
        return mapCompanyFromDb(data);
    },
    update: async (id: string, companyData: CompanyUpdateClientPayload): Promise<Company> => {
        const updatePayload: Partial<DbCompany> = {};
        if (companyData.name !== undefined) updatePayload.name = companyData.name;
        if (companyData.email !== undefined) updatePayload.email = companyData.email;
        if (companyData.phone !== undefined) updatePayload.phone = companyData.phone || null;
        if (companyData.address !== undefined) updatePayload.address = companyData.address || null;
        const { data, error } = await supabase.from('companies').update(updatePayload).eq('id', id).select().single();
        if (error) throw error;
        return mapCompanyFromDb(data);
    },
    delete: async (id: string): Promise<void> => {
        const { error } = await supabase.from('companies').delete().eq('id', id);
        if (error) {
            if (error.code === '23503') {
                throw new Error(`Impossible de supprimer l'entreprise. Elle est encore référencée par des devis, factures ou utilisateurs.`);
            }
            throw error;
        }
    }
};

export const usersApi = {
    getAll: async (includeDeleted = false): Promise<UserProfile[]> => {
        let query = supabase.from('users').select('*, companies(name)');
        if (!includeDeleted) {
            query = query.is('deleted_at', null);
        }
        query = query.order('last_name', { ascending: true });
        const { data, error } = await query;
        if (error) throw error;
        return data.map(mapUserFromDb);
    },
    getById: async (id: string): Promise<UserProfile | null> => {
        const { data, error } = await supabase.from('users').select('*, companies(name)').eq('id', id).single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? mapUserFromDb(data) : null;
    },
    adminCreateFullUser: async (payload: AdminFullUserCreatePayload): Promise<{ message: string, userProfile: UserProfile | null }> => {
        const { data, error } = await supabase.functions.invoke('admin-create-user', { body: payload, });
        if (error) throw new Error(error.message || "Erreur lors de la création de l'utilisateur complet.");
        if (data && data.userProfile) {
            return { message: data.message || "Utilisateur créé avec succès.", userProfile: mapUserFromDb(data.userProfile as DbUser), };
        } else {
            if (data && data.error) throw new Error(data.error);
            return { message: data.message || "Réponse inattendue de la fonction de création d'utilisateur.", userProfile: null, };
        }
    },
    update: async (id: string, userData: UserUpdateDbPayload): Promise<UserProfile> => {
        const { data, error } = await supabase.from('users').update(userData).eq('id', id).select('*, companies(name)').single();
        if (error) throw error;
        return mapUserFromDb(data);
    },
    toggleUserStatus: async (userId: string, isActive: boolean): Promise<UserProfile> => {
        const { data, error } = await supabase.from('users').update({ is_active: isActive }).eq('id', userId).is('deleted_at', null).select('*, companies(name)').single();
        if (error) throw error;
        if (!data) {
            const currentUser = await usersApi.getById(userId);
            if (currentUser) return currentUser;
            throw new Error("Utilisateur non trouvé, impossible de changer son statut actif.");
        }
        return mapUserFromDb(data);
    },
    softDelete: async (id: string): Promise<UserProfile> => {
        const { data, error } = await supabase.from('users').update({ deleted_at: new Date().toISOString(), is_active: false }).eq('id', id).select('*, companies(name)').single();
        if (error) throw error;
        return mapUserFromDb(data);
    },
    restore: async (id: string): Promise<UserProfile> => {
        const { data, error } = await supabase.from('users').update({ deleted_at: null, is_active: true }).eq('id', id).select('*, companies(name)').single();
        if (error) throw error;
        return mapUserFromDb(data);
    },
    deletePermanently: async (id: string): Promise<void> => {
        const { data, error } = await supabase.functions.invoke('delete-user-and-profile', { body: { userId: id }, });
        if (error) throw new Error(error.message || "Erreur lors de la suppression définitive de l'utilisateur.");
    }
};