
export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
}

export interface Devis {
  id: string;
  number: string;
  companyId: string;
  companyName: string;
  object: string;
  amount: number;
  status: 'draft' | 'sent' | 'pending' | 'approved' | 'rejected' | 'expired';
  createdAt: Date;
  validUntil: Date;
  items: DevisItem[];
  notes?: string;
  rejectionReason?: string;
}

export interface DevisItem {
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
  status: 'pending' | 'paid' | 'overdue';
  createdAt: Date;
  dueDate: Date;
  items: InvoiceItem[];
  paidAt?: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Ticket {
  id: string;
  number: string;
  companyId: string;
  companyName: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  messages: TicketMessage[];
  attachments: TicketAttachment[];
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

export interface TicketAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}
