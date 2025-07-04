// src/types/onboarding/index.ts
// Types TypeScript pour le système d'onboarding et gestion documentaire

export interface OnboardingProcess {
  id: string;
  employee_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  completed_at?: string;
  
  // Étapes du processus
  steps: OnboardingStep[];
  current_step_index: number;
  
  // Suivi
  assigned_hr_id?: string;
  assigned_manager_id?: string;
  due_date?: string;
  notes?: string;
}

export interface OnboardingStep {
  id: string;
  process_id: string;
  step_order: number;
  type: OnboardingStepType;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  
  // Contenu spécifique selon le type
  content: OnboardingStepContent;
  
  // Suivi
  started_at?: string;
  completed_at?: string;
  assigned_to?: string;
  
  // Configuration
  is_required: boolean;
  auto_complete: boolean;
  requires_signature: boolean;
  requires_approval: boolean;
}

export type OnboardingStepType = 
  | 'document_signing'
  | 'material_assignment'
  | 'account_creation'
  | 'training_assignment'
  | 'introduction_meeting'
  | 'workspace_setup'
  | 'policy_acknowledgment'
  | 'contact_verification'
  | 'emergency_info'
  | 'custom';

export interface OnboardingStepContent {
  // Pour les documents à signer
  documents?: DocumentToSign[];
  
  // Pour l'attribution de matériel
  materials?: MaterialItem[];
  
  // Pour les comptes/accès
  accounts?: AccountCreation[];
  
  // Pour les formations
  trainings?: TrainingAssignment[];
  
  // Pour les réunions
  meetings?: MeetingSchedule[];
  
  // Contenu personnalisé
  custom_data?: Record<string, any>;
}

// ============================================================================
// TYPES POUR LES DOCUMENTS ET CONTRATS
// ============================================================================

export interface DocumentTemplate {
  id: string;
  name: string;
  type: DocumentType;
  category: 'contract' | 'policy' | 'form' | 'guide' | 'legal';
  version: string;
  
  // Contenu
  content: string; // HTML/Markdown content
  variables: DocumentVariable[]; // Variables à remplacer
  
  // Configuration
  requires_signature: boolean;
  signature_type: 'electronic' | 'wet' | 'both';
  language: string;
  
  // IA Integration
  ai_generated: boolean;
  ai_model?: string;
  ai_prompt_template?: string;
  
  // Métadonnées
  created_at: string;
  updated_at: string;
  created_by: string;
  is_active: boolean;
}

export type DocumentType = 
  | 'employment_contract'
  | 'confidentiality_agreement'
  | 'non_compete_agreement'
  | 'code_of_conduct'
  | 'privacy_policy'
  | 'equipment_agreement'
  | 'handbook'
  | 'tax_forms'
  | 'benefits_enrollment'
  | 'emergency_contact_form'
  | 'training_certificate'
  | 'custom';

export interface DocumentVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'list';
  default_value?: string;
  required: boolean;
  source: 'employee_data' | 'manual_input' | 'system_generated';
  source_field?: string; // Pour employee_data
}

export interface DocumentToSign {
  id: string;
  template_id: string;
  employee_id: string;
  onboarding_step_id?: string;
  
  // Contenu généré
  generated_content: string;
  pdf_url?: string;
  
  // Signature
  status: 'pending' | 'sent' | 'viewed' | 'signed' | 'rejected' | 'expired';
  signature_data?: SignatureData;
  
  // Suivi
  sent_at?: string;
  viewed_at?: string;
  signed_at?: string;
  expires_at?: string;
  
  // Configuration
  reminder_count: number;
  last_reminder_at?: string;
}

export interface SignatureData {
  signature_image?: string; // Base64
  signature_timestamp: string;
  ip_address: string;
  user_agent: string;
  location?: GeolocationData;
  certificate_data?: string; // Pour signatures qualifiées
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

// ============================================================================
// TYPES POUR LE MATÉRIEL ET ÉQUIPEMENTS
// ============================================================================

export interface MaterialItem {
  id: string;
  name: string;
  category: MaterialCategory;
  type: string;
  
  // Détails
  brand?: string;
  model?: string;
  serial_number?: string;
  asset_tag?: string;
  
  // État
  status: 'available' | 'assigned' | 'maintenance' | 'retired';
  condition: 'new' | 'good' | 'fair' | 'poor';
  
  // Attribution
  assigned_to?: string; // employee_id
  assigned_at?: string;
  return_due_date?: string;
  
  // Valeur
  purchase_date?: string;
  purchase_price?: number;
  warranty_expires?: string;
  
  // Localisation
  location?: string;
  building?: string;
  room?: string;
}

export type MaterialCategory = 
  | 'laptop'
  | 'desktop'
  | 'monitor'
  | 'keyboard'
  | 'mouse'
  | 'headset'
  | 'phone'
  | 'tablet'
  | 'accessories'
  | 'furniture'
  | 'software_license'
  | 'security_badge'
  | 'parking_pass'
  | 'other';

export interface MaterialAssignment {
  id: string;
  material_item_id: string;
  employee_id: string;
  onboarding_step_id?: string;
  
  // Détails de l'attribution
  assigned_at: string;
  assigned_by: string;
  return_due_date?: string;
  returned_at?: string;
  returned_to?: string;
  
  // État
  status: 'pending' | 'assigned' | 'returned' | 'lost' | 'damaged';
  condition_at_assignment: string;
  condition_at_return?: string;
  
  // Signatures et accords
  assignment_signature?: SignatureData;
  return_signature?: SignatureData;
  
  notes?: string;
}

// ============================================================================
// TYPES POUR LES COMPTES ET ACCÈS
// ============================================================================

export interface AccountCreation {
  id: string;
  employee_id: string;
  system_name: string;
  account_type: AccountType;
  
  // Détails du compte
  username?: string;
  email: string;
  temporary_password?: string;
  
  // Permissions et groupes
  groups: string[];
  permissions: string[];
  role: string;
  
  // État
  status: 'pending' | 'created' | 'activated' | 'suspended' | 'deleted';
  created_at?: string;
  activated_at?: string;
  
  // Configuration
  requires_2fa: boolean;
  password_policy: string;
  access_level: 'basic' | 'standard' | 'advanced' | 'admin';
}

export type AccountType = 
  | 'email'
  | 'active_directory'
  | 'vpn'
  | 'erp'
  | 'crm'
  | 'development_tools'
  | 'collaboration_tools'
  | 'security_systems'
  | 'custom_app';

// ============================================================================
// TYPES POUR LES FORMATIONS
// ============================================================================

export interface TrainingAssignment {
  id: string;
  employee_id: string;
  training_module_id: string;
  onboarding_step_id?: string;
  
  // État
  status: 'assigned' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  progress_percentage: number;
  
  // Planification
  assigned_at: string;
  due_date?: string;
  started_at?: string;
  completed_at?: string;
  
  // Résultats
  score?: number;
  certificate_url?: string;
  completion_certificate?: string;
  
  // Suivi
  time_spent_minutes?: number;
  attempts_count: number;
  notes?: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: 'mandatory' | 'recommended' | 'optional';
  
  // Contenu
  type: 'video' | 'document' | 'interactive' | 'webinar' | 'in_person';
  duration_minutes: number;
  content_url?: string;
  
  // Configuration
  is_mandatory: boolean;
  requires_certificate: boolean;
  passing_score?: number;
  max_attempts?: number;
  
  // Ciblage
  target_roles: string[];
  target_departments: string[];
  prerequisites: string[];
}

// ============================================================================
// TYPES POUR LES RÉUNIONS ET INTRODUCTION
// ============================================================================

export interface MeetingSchedule {
  id: string;
  employee_id: string;
  onboarding_step_id?: string;
  
  // Détails de la réunion
  title: string;
  description?: string;
  type: MeetingType;
  
  // Participants
  organizer_id: string;
  participants: MeetingParticipant[];
  
  // Planification
  scheduled_at: string;
  duration_minutes: number;
  location?: string;
  meeting_url?: string;
  
  // État
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  completed_at?: string;
  
  // Suivi
  notes?: string;
  follow_up_required: boolean;
}

export type MeetingType = 
  | 'welcome'
  | 'team_introduction'
  | 'manager_1on1'
  | 'hr_orientation'
  | 'department_overview'
  | 'systems_training'
  | 'buddy_assignment'
  | 'feedback_session';

export interface MeetingParticipant {
  employee_id: string;
  role: 'organizer' | 'required' | 'optional';
  status: 'pending' | 'accepted' | 'declined' | 'tentative';
  response_at?: string;
}

// ============================================================================
// TYPES POUR LES TEMPLATES IA
// ============================================================================

export interface AIContractTemplate {
  id: string;
  name: string;
  type: DocumentType;
  
  // Configuration IA
  ai_model: 'gpt-4' | 'claude-3' | 'custom';
  base_prompt: string;
  enhancement_prompt?: string;
  
  // Variables contextuelles
  context_variables: AIContextVariable[];
  legal_requirements: LegalRequirement[];
  
  // Génération
  generated_versions: GeneratedVersion[];
  current_version_id?: string;
  
  // Validation
  requires_legal_review: boolean;
  last_legal_review?: string;
  approved_by?: string;
}

export interface AIContextVariable {
  key: string;
  description: string;
  type: 'employee' | 'position' | 'company' | 'legal' | 'custom';
  source_mapping: string;
  is_required: boolean;
}

export interface LegalRequirement {
  jurisdiction: string;
  requirement_type: 'mandatory_clause' | 'prohibited_clause' | 'recommended_clause';
  description: string;
  legal_text?: string;
  reference?: string;
}

export interface GeneratedVersion {
  id: string;
  template_id: string;
  version: string;
  content: string;
  
  // Métadonnées de génération
  generated_at: string;
  ai_model_used: string;
  prompt_used: string;
  context_data: Record<string, any>;
  
  // Validation
  status: 'draft' | 'review' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
}

// ============================================================================
// TYPES POUR LES FILTRES ET RECHERCHE
// ============================================================================

export interface OnboardingFilters {
  status?: OnboardingProcess['status'][];
  assigned_hr_id?: string;
  assigned_manager_id?: string;
  department_id?: string;
  date_range?: {
    start: string;
    end: string;
  };
  step_type?: OnboardingStepType[];
  search?: string;
}

export interface DocumentFilters {
  type?: DocumentType[];
  status?: DocumentToSign['status'][];
  category?: DocumentTemplate['category'][];
  employee_id?: string;
  requires_signature?: boolean;
  date_range?: {
    start: string;
    end: string;
  };
}

// ============================================================================
// TYPES POUR LES NOTIFICATIONS
// ============================================================================

export interface OnboardingNotification {
  id: string;
  type: 'reminder' | 'overdue' | 'completed' | 'error' | 'approval_needed';
  title: string;
  message: string;
  
  // Cibles
  recipient_id: string;
  recipient_type: 'employee' | 'manager' | 'hr' | 'admin';
  
  // Contexte
  related_process_id?: string;
  related_step_id?: string;
  related_document_id?: string;
  
  // État
  status: 'pending' | 'sent' | 'read' | 'dismissed';
  sent_at?: string;
  read_at?: string;
  
  // Configuration
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: ('email' | 'in_app' | 'sms')[];
}

// ============================================================================
// TYPES MANQUANTS POUR LES HOOKS ET SERVICES
// ============================================================================

// Types pour la gestion du matériel
export interface OnboardingMaterial extends MaterialItem {
  onboarding_process_id: string;
  required: boolean;
  auto_assign: boolean;
}

export interface MaterialInventoryItem extends MaterialItem {
  quantity_available: number;
  quantity_total: number;
  location: string;
  last_audit_date?: string;
}

export interface MaterialRequest {
  id: string;
  employee_id: string;
  onboarding_process_id?: string;
  requested_items: MaterialRequestItem[];
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled' | 'cancelled';
  requested_at: string;
  requested_by: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  notes?: string;
}

export interface MaterialRequestItem {
  material_id: string;
  quantity: number;
  priority: 'low' | 'medium' | 'high';
  justification?: string;
}

// Types pour les templates de documents
export interface ContractTemplate extends DocumentTemplate {
  contract_type: 'employment' | 'nda' | 'non_compete' | 'ip_assignment' | 'equipment' | 'custom';
  clauses: ContractClause[];
  legal_review_required: boolean;
  auto_renewal: boolean;
  termination_clauses: string[];
}

export interface ContractClause {
  id: string;
  type: string;
  title: string;
  content: string;
  is_required: boolean;
  variables: DocumentVariable[];
}

export interface DocumentTemplateInput {
  name: string;
  type: DocumentType;
  category: DocumentTemplate['category'];
  content: string;
  variables: DocumentVariable[];
  requires_signature: boolean;
  signature_type: DocumentTemplate['signature_type'];
  language: string;
  ai_generated?: boolean;
}

export interface ContractTemplateInput extends DocumentTemplateInput {
  contract_type: ContractTemplate['contract_type'];
  clauses: Omit<ContractClause, 'id'>[];
  legal_review_required: boolean;
  auto_renewal: boolean;
  termination_clauses: string[];
}

// Types pour l'IA documentaire
export interface AIDocumentGenerationRequest {
  type: DocumentType;
  category: DocumentTemplate['category'];
  purpose: string;
  context: Record<string, any>;
  requirements: string[];
  language: string;
  tone: 'formal' | 'casual' | 'friendly' | 'professional';
  length: 'short' | 'medium' | 'long';
}

// Types pour les statistiques matériel
export interface MaterialStats {
  total_items: number;
  available_items: number;
  assigned_items: number;
  maintenance_items: number;
  by_category: Record<MaterialCategory, number>;
  by_status: Record<MaterialItem['status'], number>;
  recent_assignments: number;
  pending_returns: number;
}
