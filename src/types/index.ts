// src/types/index.ts

// Réexporter le type User depuis auth.ts
export type { User } from './auth'; // AJOUTÉ

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

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Statuts des tickets mis à jour pour correspondre à la base de données
export type TicketStatus =
    | 'open'
    | 'in_progress'
    | 'resolved'
    | 'closed'
    | 'pending_admin_response'
    | 'pending_client_response';

// NOUVEAU: Interface pour les catégories de tickets
export interface TicketCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: Date; // Ajouté pour la cohérence
}

export interface Ticket {
  id: string;
  number: string;
  companyId: string;
  companyName: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  categoryId?: string; // ID de la catégorie (optionnel pour l'instant)
  categoryName?: string; // Nom de la catégorie (pour affichage, via jointure)
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  messages: TicketMessage[];
  attachments: TicketAttachment[]; // Gardé pour une future utilisation
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: 'client' | 'admin';
  content: string;
  createdAt: Date;
  attachments: TicketAttachment[]; // Gardé pour une future utilisation
}

export interface TicketAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'draft' | 'cancelled';

export interface Invoice {
  id: string;
  number: string;
  companyId: string;
  companyName: string;
  amount: number;
  status: InvoiceStatus;
  createdAt: Date;
  dueDate: Date;
  paidAt?: Date;
  items: InvoiceItem[];
  notes?: string;
}