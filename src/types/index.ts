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
  object: string;
  amount: number;
  status: 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' | 'cancelled' | 'pending_payment' | 'partially_paid' | 'late';
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

// === PROJECT MANAGEMENT TYPES ===

export interface ProjectCustomFields {
  [key: string]: any;
}

export interface TaskCustomFields {
  [key: string]: any;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientCompanyId: string;
  clientCompanyName?: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  ownerId?: string;
  ownerName?: string;
  customFields: ProjectCustomFields;
  createdAt: Date;
  updatedAt: Date;
  tasksCount?: number;
  completedTasksCount?: number;
  progressPercentage?: number;
}

export interface Task {
  id: string;
  projectId: string;
  projectName?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  assigneeId?: string;
  assigneeName?: string;
  assignedTo?: {
    name: string;
    avatar?: string;
  };
  dueDate?: Date;
  startDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours?: number;
  actualHours?: number;
  budget?: number;
  commentsCount?: number;
  attachmentsCount?: number;
  position: number;
  customFields: TaskCustomFields;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectCreatePayload {
  name: string;
  description?: string;
  clientCompanyId: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  ownerId?: string;
  customFields?: ProjectCustomFields;
}

export interface ProjectUpdatePayload {
  name?: string;
  description?: string;
  status?: Project['status'];
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  ownerId?: string;
  customFields?: ProjectCustomFields;
}

export interface TaskCreatePayload {
  projectId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  dueDate?: Date;
  priority?: Task['priority'];
  estimatedHours?: number;
  customFields?: TaskCustomFields;
}

export interface TaskUpdatePayload {
  title?: string;
  description?: string;
  status?: Task['status'];
  assigneeId?: string;
  dueDate?: Date;
  priority?: Task['priority'];
  estimatedHours?: number;
  actualHours?: number;
  position?: number;
  customFields?: TaskCustomFields;
}

export interface TaskReorderPayload {
  taskId: string;
  newPosition: number;
  newStatus?: Task['status']; // Pour le drag & drop entre colonnes Kanban
}

// Types pour les vues Kanban
export interface KanbanColumn {
  id: Task['status'];
  title: string;
  color: string;
  tasks: Task[];
  wipLimit?: number;
}

export interface KanbanBoard {
  projectId: string;
  columns: KanbanColumn[];
}

// Types pour les suggestions IA
export interface AIProjectPlanSuggestion {
  phases: {
    name: string;
    description: string;
    estimatedDuration: number; // en jours
    tasks: {
      title: string;
      description: string;
      estimatedHours: number;
      priority: Task['priority'];
      requiredSkills?: string[];
    }[];
  }[];
  totalEstimatedDuration: number;
  estimatedBudget?: number;
  recommendations: string[];
}

export interface AITaskAssignmentSuggestion {
  suggestedAssigneeId: string;
  suggestedAssigneeName: string;
  confidence: number; // 0-100
  reasoning: string;
  alternativeAssignees?: {
    assigneeId: string;
    assigneeName: string;
    confidence: number;
    reasoning: string;
  }[];
}

// Types pour les statistiques de projet
export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overdueTasks: number;
  averageCompletionTime: number; // en jours
  budgetUtilization: number; // pourcentage
  teamProductivity: number; // tâches/jour
}

// Types pour les paramètres d'application
export interface AppSetting {
  id: string;
  key: string;
  value: string;
  category: 'general' | 'localization' | 'ai' | 'company';
  description?: string;
  dataType: 'text' | 'number' | 'select' | 'textarea' | 'boolean';
  createdAt: Date;
  updatedAt: Date;
}

export interface CurrencySettings {
  symbol: string;
  code: string;
  position: 'before' | 'after';
  decimalPlaces: number;
  thousandSeparator: string;
  decimalSeparator: string;
  locale: string;
}

export interface BusinessContext {
  context: 'general' | 'btp' | 'saas' | 'ecommerce' | 'consulting' | 'manufacturing';
  description: string;
  aiProjectContext: string;
}

export interface CompanySettings {
  name: string;
  address: string;
  ninea: string;
  rc: string;
}