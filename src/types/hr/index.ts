// src/types/hr/index.ts
// Types TypeScript pour le système RH Ultimate
// Générés automatiquement depuis le schéma Supabase

export interface Branch {
  id: string;
  name: string;
  code: string;
  description?: string;
  
  // Localisation
  country: string;
  region?: string;
  city: string;
  address?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  
  // Hiérarchie
  parent_branch_id?: string;
  is_headquarters: boolean;
  level: number;
  
  // Gestion
  director_id?: string;
  hr_manager_id?: string;
  
  // Configuration locale
  timezone: string;
  currency_code: string;
  language_code: string;
  local_regulations: Record<string, any>;
  
  // Métriques
  employee_capacity: number;
  annual_budget?: number;
  cost_center_code?: string;
  
  // Statut
  status: 'active' | 'inactive' | 'closed' | 'planning';
  opening_date?: string;
  closing_date?: string;
  
  // Audit
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Relations (populated par jointures)
  director?: User;
  hr_manager?: User;
  parent_branch?: Branch;
  child_branches?: Branch[];
  departments?: Department[];
  employees?: Employee[];
  
  // Métriques calculées
  total_employees?: number;
  active_employees?: number;
  department_count?: number;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  
  // Rattachement
  branch_id: string;
  parent_department_id?: string;
  level: number;
  
  // Gestion
  manager_id?: string;
  assistant_manager_id?: string;
  
  // Budget et objectifs
  annual_budget?: number;
  cost_center_code?: string;
  objectives: Objective[];
  kpis: Record<string, any>;
  
  // Configuration
  max_employees: number;
  overtime_allowed: boolean;
  remote_work_allowed: boolean;
  
  // Statut
  status: 'active' | 'inactive' | 'restructuring' | 'merged';
  
  // Audit
  created_at: string;
  updated_at: string;
  
  // Relations
  branch?: Branch;
  manager?: User;
  assistant_manager?: User;
  parent_department?: Department;
  child_departments?: Department[];
  positions?: Position[];
  employees?: Employee[];
  
  // Métriques calculées
  total_employees?: number;
  budget_utilization?: number;
  average_performance?: number;
}

export interface Position {
  id: string;
  title: string;
  code: string;
  description?: string;
  
  // Rattachement
  department_id: string;
  branch_id: string;
  
  // Hiérarchie
  level: number;
  seniority_min_years: number;
  reports_to_position_id?: string;
  
  // Grille salariale
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  salary_frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  
  // Avantages
  benefits: Record<string, any>;
  bonus_eligible: boolean;
  commission_eligible: boolean;
  
  // Compétences requises
  required_skills: Skill[];
  required_certifications: Certification[];
  required_education?: string;
  required_experience_years: number;
  
  // Évolution de carrière
  career_path: string[];
  promotion_criteria: Record<string, any>;
  
  // Configuration
  employment_type: 'full_time' | 'part_time' | 'contract' | 'intern' | 'consultant';
  remote_work_allowed: boolean;
  travel_required: boolean;
  travel_percentage: number;
  
  // Capacité
  status: 'active' | 'inactive' | 'archived' | 'draft';
  max_headcount: number;
  current_headcount: number;
  
  // Audit
  created_at: string;
  updated_at: string;
  
  // Relations
  department?: Department;
  branch?: Branch;
  reports_to_position?: Position;
  subordinate_positions?: Position[];
  employees?: Employee[];
  
  // Métriques calculées
  vacancy_rate?: number;
  average_salary?: number;
  time_to_fill?: number;
}

export interface Employee {
  id: string;
  
  // Référence système
  user_id?: string;
  
  // Identification
  employee_number: string;
  badge_number?: string;
  
  // Informations personnelles
  first_name: string;
  last_name: string;
  middle_name?: string;
  preferred_name?: string;
  gender?: 'M' | 'F' | 'Other' | 'Prefer_not_to_say';
  date_of_birth?: string;
  nationality?: string;
  
  // Contact
  personal_email?: string;
  work_email?: string;
  personal_phone?: string;
  work_phone?: string;
  emergency_contact: EmergencyContact;
  
  // Adresse
  address: Address;
  
  // Rattachement organisationnel
  branch_id: string;
  department_id: string;
  position_id: string;
  
  // Hiérarchie
  manager_id?: string;
  reports_count: number;
  
  // Emploi
  hire_date: string;
  start_date: string;
  end_date?: string;
  probation_end_date?: string;
  
  // Statut
  employment_status: 'active' | 'inactive' | 'terminated' | 'on_leave' | 'suspended';
  employment_type: 'full_time' | 'part_time' | 'contract' | 'intern' | 'consultant';
  
  // Salaire
  current_salary?: number;
  salary_currency: string;
  salary_frequency: string;
  last_salary_review_date?: string;
  next_salary_review_date?: string;
  
  // Performance et compétences
  performance_score: number;
  skills: EmployeeSkill[];
  certifications: EmployeeCertification[];
  languages: EmployeeLanguage[];
  
  // Congés
  vacation_days_total: number;
  vacation_days_used: number;
  sick_days_used: number;
  
  // Préférences
  work_preferences: Record<string, any>;
  timezone: string;
  
  // IA et analytics
  ai_insights: AIInsights;
  performance_trends: PerformanceTrends;
  career_recommendations: CareerRecommendation[];
  
  // Audit
  created_at: string;
  updated_at: string;
  created_by?: string;
  last_login_at?: string;
  last_activity_at?: string;
  
  // Relations
  user?: User;
  branch?: Branch;
  department?: Department;
  position?: Position;
  manager?: Employee;
  direct_reports?: Employee[];
  
  // Métriques calculées
  age?: number;
  tenure_years?: number;
  next_performance_review?: string;
  vacation_days_remaining?: number;
  full_name?: string;
  display_name?: string;
}

// ============================================================================
// TYPES AUXILIAIRES
// ============================================================================

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Address {
  street: string;
  city: string;
  region?: string;
  postal_code?: string;
  country: string;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  target_value?: number;
  current_value?: number;
  deadline?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface Skill {
  name: string;
  category: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  required: boolean;
}

export interface EmployeeSkill extends Skill {
  acquired_date?: string;
  last_assessment_date?: string;
  proficiency_score?: number; // 0-100
  verified?: boolean;
}

export interface Certification {
  name: string;
  issuer: string;
  level?: string;
  required: boolean;
}

export interface EmployeeCertification extends Certification {
  obtained_date: string;
  expiry_date?: string;
  certificate_number?: string;
  verified: boolean;
}

export interface EmployeeLanguage {
  language: string;
  proficiency: 'basic' | 'intermediate' | 'fluent' | 'native';
  speaking_level?: number; // 1-5
  writing_level?: number; // 1-5
  reading_level?: number; // 1-5
}

// ============================================================================
// TYPES IA ET ANALYTICS
// ============================================================================

export interface AIInsights {
  performance_prediction?: number; // Prédiction performance 0-5
  turnover_risk?: number; // Risque de départ 0-1
  promotion_readiness?: number; // Prêt pour promotion 0-1
  skill_gaps?: string[]; // Compétences manquantes
  development_recommendations?: string[];
  optimal_next_role?: string;
  engagement_score?: number; // Score d'engagement 0-100
  last_analysis_date?: string;
}

export interface PerformanceTrends {
  quarterly_scores?: number[]; // Scores des 4 derniers trimestres
  improvement_rate?: number; // Taux d'amélioration
  consistency_score?: number; // Régularité des performances
  peak_performance_period?: string;
  areas_of_excellence?: string[];
  areas_for_improvement?: string[];
}

export interface CareerRecommendation {
  id: string;
  type: 'promotion' | 'lateral_move' | 'skill_development' | 'training';
  title: string;
  description: string;
  priority: number; // 1-5
  timeline: string; // "3 months", "1 year", etc.
  requirements?: string[];
  benefits?: string[];
  generated_at: string;
  ai_confidence?: number; // 0-1
}

// ============================================================================
// TYPES POUR LES FORMS ET UI
// ============================================================================

export interface EmployeeCreateInput {
  first_name: string;
  last_name: string;
  work_email: string;
  branch_id: string;
  department_id: string;
  position_id: string;
  hire_date: string;
  employment_type: Employee['employment_type'];
  manager_id?: string;
  current_salary?: number;
}

export interface EmployeeUpdateInput extends Partial<EmployeeCreateInput> {
  // L'id est passé séparément en paramètre de la fonction update
}

export interface DepartmentCreateInput {
  name: string;
  code: string;
  branch_id: string;
  manager_id?: string;
  parent_department_id?: string;
}

export interface PositionCreateInput {
  title: string;
  code: string;
  department_id: string;
  level: number;
  employment_type: Position['employment_type'];
  salary_min?: number;
  salary_max?: number;
}

// ============================================================================
// TYPES POUR LES FILTRES ET RECHERCHE
// ============================================================================

export interface EmployeeFilters {
  branch_id?: string;
  department_id?: string;
  position_id?: string;
  employment_status?: Employee['employment_status'];
  employment_type?: Employee['employment_type'];
  manager_id?: string;
  search?: string; // Recherche globale
  status?: string; // Alias pour employment_status pour compatibilité
  performance_min?: number;
  performance_max?: number;
  hire_date_from?: string;
  hire_date_to?: string;
}

export interface EmployeeSortOptions {
  field: 'last_name' | 'hire_date' | 'performance_score' | 'current_salary';
  direction: 'asc' | 'desc';
}

// ============================================================================
// TYPES POUR LES MÉTRIQUES ET ANALYTICS
// ============================================================================

export interface EmployeeStats {
  total_employees: number;
  active_employees: number;
  inactive_employees: number;
  departments_count: number;
  branches_count: number;
  new_hires_this_month: number;
  departures_this_month: number;
  avg_performance_score: number;
}

export interface BranchMetrics {
  branch_id: string;
  total_employees: number;
  active_employees: number;
  new_hires_month: number;
  departures_month: number;
  average_performance: number;
  average_salary: number;
  top_departments: DepartmentMetric[];
  turnover_rate: number;
  engagement_score: number;
}

export interface DepartmentMetric {
  department_id: string;
  name: string;
  employee_count: number;
  average_performance: number;
  budget_utilization: number;
}

export interface HRDashboardData {
  overview: {
    total_employees: number;
    active_employees: number;
    departments_count: number;
    branches_count: number;
    positions_count: number;
  };
  trends: {
    monthly_hires: number[];
    monthly_departures: number[];
    performance_trends: number[];
    satisfaction_trends: number[];
  };
  alerts: HRAlert[];
  top_performers: Employee[];
  at_risk_employees: Employee[];
}

export interface HRAlert {
  id: string;
  type: 'performance' | 'turnover' | 'compliance' | 'budget' | 'review_due';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  employee_id?: string;
  department_id?: string;
  branch_id?: string;
  due_date?: string;
  created_at: string;
}

// ============================================================================
// TYPES POUR L'INTÉGRATION AVEC LES SYSTÈMES EXISTANTS
// ============================================================================

// Interface avec les utilisateurs existants
export interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'hr_manager' | 'manager' | 'employee' | 'client';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Interface avec les entreprises existantes (companies)
export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
}

// ============================================================================
// TYPES POUR LES RÉPONSES API
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tous les types sont déjà exportés individuellement ci-dessus
