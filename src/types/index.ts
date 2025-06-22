// src/types/index.ts

export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
}

export interface DevisItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Devis {
  id: string;
  number: string;
  companyId: string;
  companyName: string;
  object: string;
  amount: number;
  status: 'draft' | 'sent' | 'pending' | 'approved' | 'rejected' | 'expired' | 'validated';
  createdAt: Date;
  validUntil: Date;
  items: DevisItem[];
  notes?: string;
  rejectionReason?: string;
  validatedAt?: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
  companyId: string;
  companyName: string;
  amount: number;
  status: 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' | 'cancelled' | 'pending_payment';
  createdAt: Date;
  dueDate: Date;
  items: InvoiceItem[];
  paidAt?: Date;
  notes?: string;
  dexchangeTransactionId?: string;
  paymentMethod?: string;
}

export interface TicketAttachment {
  id: string;
  ticketMessageId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: 'client' | 'admin';
  content: string;
  createdAt: Date;
  attachments: TicketAttachment[];
}

export interface TicketCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface Ticket {
  id: string;
  number: string;
  companyId: string;
  companyName: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'pending_client_response' | 'pending_admin_response' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  categoryId?: string;
  categoryName?: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  messages: TicketMessage[];
  attachments: TicketAttachment[];
}