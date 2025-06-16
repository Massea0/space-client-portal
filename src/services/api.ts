
// Mock API service that simulates backend operations
// This can be easily replaced with real Supabase calls later

import { Devis, Invoice, Ticket, Company } from '@/types';
import { User } from '@/types/auth';
import { MOCK_DEVIS, MOCK_INVOICES, MOCK_TICKETS, MOCK_COMPANIES } from '@/data/mockData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage (will be replaced with Supabase)
let devisStorage = [...MOCK_DEVIS];
let invoicesStorage = [...MOCK_INVOICES];
let ticketsStorage = [...MOCK_TICKETS];
let companiesStorage = [...MOCK_COMPANIES];

// Devis API
export const devisApi = {
  getAll: async (): Promise<Devis[]> => {
    await delay(300);
    return [...devisStorage];
  },

  getByCompany: async (companyId: string): Promise<Devis[]> => {
    await delay(300);
    return devisStorage.filter(d => d.companyId === companyId);
  },

  updateStatus: async (id: string, status: Devis['status'], rejectionReason?: string): Promise<Devis> => {
    await delay(500);
    const index = devisStorage.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Devis not found');
    
    devisStorage[index] = {
      ...devisStorage[index],
      status,
      rejectionReason: status === 'rejected' ? rejectionReason : undefined
    };
    
    return devisStorage[index];
  },

  create: async (devisData: Omit<Devis, 'id' | 'number' | 'createdAt'>): Promise<Devis> => {
    await delay(500);
    const newDevis: Devis = {
      ...devisData,
      id: `devis_${Date.now()}`,
      number: `DEV-2024-${String(devisStorage.length + 1).padStart(3, '0')}`,
      createdAt: new Date()
    };
    
    devisStorage.push(newDevis);
    return newDevis;
  }
};

// Invoices API
export const invoicesApi = {
  getAll: async (): Promise<Invoice[]> => {
    await delay(300);
    return [...invoicesStorage];
  },

  getByCompany: async (companyId: string): Promise<Invoice[]> => {
    await delay(300);
    return invoicesStorage.filter(i => i.companyId === companyId);
  },

  updateStatus: async (id: string, status: Invoice['status']): Promise<Invoice> => {
    await delay(500);
    const index = invoicesStorage.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Invoice not found');
    
    invoicesStorage[index] = {
      ...invoicesStorage[index],
      status,
      paidAt: status === 'paid' ? new Date() : undefined
    };
    
    return invoicesStorage[index];
  },

  create: async (invoiceData: Omit<Invoice, 'id' | 'number' | 'createdAt'>): Promise<Invoice> => {
    await delay(500);
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `invoice_${Date.now()}`,
      number: `FACT-2024-${String(invoicesStorage.length + 1).padStart(3, '0')}`,
      createdAt: new Date()
    };
    
    invoicesStorage.push(newInvoice);
    return newInvoice;
  }
};

// Tickets API
export const ticketsApi = {
  getAll: async (): Promise<Ticket[]> => {
    await delay(300);
    return [...ticketsStorage];
  },

  getByCompany: async (companyId: string): Promise<Ticket[]> => {
    await delay(300);
    return ticketsStorage.filter(t => t.companyId === companyId);
  },

  create: async (ticketData: { subject: string; description: string; companyId: string; companyName: string }): Promise<Ticket> => {
    await delay(500);
    const newTicket: Ticket = {
      id: `ticket_${Date.now()}`,
      number: `TICK-2024-${String(ticketsStorage.length + 1).padStart(3, '0')}`,
      subject: ticketData.subject,
      description: ticketData.description,
      companyId: ticketData.companyId,
      companyName: ticketData.companyName,
      status: 'open',
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      attachments: []
    };
    
    ticketsStorage.push(newTicket);
    return newTicket;
  },

  addMessage: async (ticketId: string, message: { content: string; authorId: string; authorName: string; authorRole: 'client' | 'admin' }): Promise<Ticket> => {
    await delay(500);
    const index = ticketsStorage.findIndex(t => t.id === ticketId);
    if (index === -1) throw new Error('Ticket not found');
    
    const newMessage = {
      id: `msg_${Date.now()}`,
      ticketId,
      ...message,
      createdAt: new Date(),
      attachments: []
    };
    
    ticketsStorage[index] = {
      ...ticketsStorage[index],
      messages: [...ticketsStorage[index].messages, newMessage],
      updatedAt: new Date(),
      status: message.authorRole === 'admin' && ticketsStorage[index].status === 'open' ? 'in_progress' : ticketsStorage[index].status
    };
    
    return ticketsStorage[index];
  },

  updateStatus: async (id: string, status: Ticket['status']): Promise<Ticket> => {
    await delay(500);
    const index = ticketsStorage.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Ticket not found');
    
    ticketsStorage[index] = {
      ...ticketsStorage[index],
      status,
      updatedAt: new Date()
    };
    
    return ticketsStorage[index];
  }
};

// Companies API
export const companiesApi = {
  getAll: async (): Promise<Company[]> => {
    await delay(300);
    return [...companiesStorage];
  },

  create: async (companyData: Omit<Company, 'id' | 'createdAt'>): Promise<Company> => {
    await delay(500);
    const newCompany: Company = {
      ...companyData,
      id: `company_${Date.now()}`,
      createdAt: new Date()
    };
    
    companiesStorage.push(newCompany);
    return newCompany;
  },

  update: async (id: string, updates: Partial<Omit<Company, 'id' | 'createdAt'>>): Promise<Company> => {
    await delay(500);
    const index = companiesStorage.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Company not found');
    
    companiesStorage[index] = {
      ...companiesStorage[index],
      ...updates
    };
    
    return companiesStorage[index];
  }
};
