export interface ContractItem {
  id: string;
  description: string;
  deliverable: string;
  deadline?: Date;
  amount?: number;
  completed: boolean;
}

export interface ContractClause {
  id: string;
  type: 'service' | 'payment' | 'confidentiality' | 'liability' | 'termination' | 'other';
  title: string;
  content: string;
  risk_level: 'low' | 'medium' | 'high';
  ai_generated: boolean;
}

export interface ContractObligation {
  id: string;
  party: 'client' | 'provider' | 'both';
  title: string;
  description: string;
  due_date?: Date;
  reminder_days: number;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled' | 'deferred';
  priority: 'low' | 'medium' | 'high' | 'critical';
  is_recurring: boolean;
  recurrence_pattern?: string;
  auto_check: boolean;
  completed_at?: Date;
  completed_by?: string;
  completion_notes?: string;
  last_reminder_sent?: Date;
  reminder_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface ContractRiskAnalysis {
  overall_score: number; // 0-100
  risks: {
    financial: number;
    legal: number;
    operational: number;
    compliance: number;
  };
  recommendations: string[];
  flagged_clauses: string[];
}

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  contract_type: string;
  template_content: string;
  clauses: ContractClause[];
  ai_optimized: boolean;
  usage_count: number;
  success_rate: number;
}

export interface Contract {
  id: string;
  
  // Relations
  clientId: string;
  clientName: string;
  devisId?: string;
  
  // Informations de base
  contractNumber: string;
  title: string;
  object: string;
  
  // Statut et cycle de vie
  status: 'draft' | 'review' | 'pending_client' | 'signed' | 'expired' | 'terminated' | 'renewed';
  
  // Durée et dates
  startDate: Date;
  endDate: Date;
  renewalDate?: Date;
  signatureDate?: Date;
  
  // Financier
  amount: number;
  currency: string;
  paymentTerms?: string;
  
  // Stockage du contenu
  contentStorageUrl?: string;
  contentPreview?: string;
  
  // Analyse IA
  clausesSummary: {
    total_clauses: number;
    key_terms: string[];
    payment_schedule: string;
    liability_cap?: string;
    termination_notice: string;
  };
  
  riskAnalysis: ContractRiskAnalysis;
  complianceScore: number;
  
  // Type et obligations
  contractType: 'service' | 'maintenance' | 'consulting' | 'licensing' | 'partnership' | 'other';
  obligationsMonitoring: {
    client_obligations: ContractObligation[];
    provider_obligations: ContractObligation[];
    next_milestones: {
      date: Date;
      description: string;
    }[];
  };
  
  nextReviewDate?: Date;
  autoRenewal: boolean;
  
  // Métadonnées IA
  generatedByAi: boolean;
  aiConfidenceScore: number;
  templateUsed?: string;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  lastModifiedBy?: string;
}

// Types pour les formulaires
export interface CreateContractRequest {
  clientId: string;
  devisId?: string;
  title: string;
  object: string;
  startDate: Date;
  endDate: Date;
  amount: number;
  contractType: Contract['contractType'];
  paymentTerms?: string;
  autoRenewal?: boolean;
  templateId?: string;
}

export interface UpdateContractRequest extends Partial<CreateContractRequest> {
  id: string;
  status?: Contract['status'];
  signatureDate?: Date;
  renewalDate?: Date;
}

// Types pour l'API IA
export interface ContractGenerationRequest {
  devisId: string;
  clientId: string;
  templateType?: string;
  customClauses?: string[];
  specificRequirements?: string;
}

export interface ContractAnalysisRequest {
  contractId: string;
  contractContent: string;
  analysisType: 'risk' | 'compliance' | 'optimization';
}

export interface ContractGenerationResponse {
  contractId: string;
  content: string;
  clauses: ContractClause[];
  riskAnalysis: ContractRiskAnalysis;
  recommendations: string[];
  aiConfidenceScore: number;
}

// Types pour les alertes contractuelles
export interface ContractAlert {
  id: string;
  contract_id: string;
  alert_type: 'contract_expired' | 'contract_expiring_soon' | 'contract_expiring' | 'renewal_overdue' | 'renewal_due_soon' | 'overdue_payments' | 'obligations_at_risk' | 'low_compliance_score' | 'manual_review_required';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  due_date?: Date;
  details: any;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  created_at: Date;
  updated_at: Date;
  acknowledged_at?: Date;
  resolved_at?: Date;
  acknowledged_by?: string;
  resolved_by?: string;
  // Relations pour les requêtes JOIN
  contracts?: {
    contract_number: string;
    title: string;
    status: string;
    companies?: {
      name: string;
    };
  };
}
