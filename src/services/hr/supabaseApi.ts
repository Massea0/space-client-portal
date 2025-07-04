// src/services/hr/supabaseApi.ts
// Services API RH connectés à Supabase - Remplace les mocks

import { supabase } from '@/lib/supabaseClient';
import type { 
  Employee, 
  EmployeeCreateInput, 
  EmployeeUpdateInput, 
  EmployeeFilters,
  PaginatedResponse
} from '@/types/hr';

// Types simplifiés pour les API (correspondant à la structure réelle de la DB)
interface SimpleDepartment {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
  budget?: number;
  location?: string;
  phone?: string;
  email?: string;
  status: string;
  created_at: string;
  updated_at: string;
  manager?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface SimplePosition {
  id: string;
  title: string;
  description?: string;
  department_id: string;
  level: number;
  salary_min?: number;
  salary_max?: number;
  required_skills: any[];
  responsibilities: any[];
  requirements: any[];
  benefits: any[];
  employment_type: string;
  remote_allowed: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  department?: any;
}

interface SimpleBranch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  timezone: string;
  status: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

// === SERVICES EMPLOYÉS ===

export const employeeSupabaseApi = {
  /**
   * Récupère la liste des employés avec filtres et pagination
   */
  async list(
    filters: EmployeeFilters = {}, 
    pagination: { page: number; limit: number } = { page: 1, limit: 50 }
  ): Promise<PaginatedResponse<Employee>> {
    try {
      // Version simplifiée sans jointures pour éviter l'erreur 500
      let query = supabase
        .from('employees')
        .select('*');

      // Appliquer les filtres
      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        query = query.or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},work_email.ilike.${searchTerm}`);
      }

      if (filters.employment_status) {
        query = query.eq('employment_status', filters.employment_status);
      }

      if (filters.department_id) {
        query = query.eq('department_id', filters.department_id);
      }

      if (filters.branch_id) {
        query = query.eq('branch_id', filters.branch_id);
      }

      // Compter le total pour la pagination
      const { count } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });

      // Appliquer la pagination
      const offset = (pagination.page - 1) * pagination.limit;
      query = query
        .range(offset, offset + pagination.limit - 1)
        .order('last_name', { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching employees:', error);
        throw error;
      }

      // Mapper les données pour correspondre au type Employee (version simplifiée)
      const employees: Employee[] = (data || []).map(emp => ({
        id: emp.id,
        employee_number: emp.employee_number,
        first_name: emp.first_name,
        last_name: emp.last_name,
        work_email: emp.work_email,
        personal_email: emp.personal_email,
        personal_phone: emp.personal_phone,
        work_phone: emp.work_phone,
        branch_id: emp.branch_id,
        department_id: emp.department_id,
        position_id: emp.position_id,
        manager_id: emp.manager_id,
        hire_date: emp.hire_date,
        start_date: emp.start_date,
        employment_status: emp.employment_status,
        employment_type: emp.employment_type,
        current_salary: emp.current_salary,
        salary_currency: emp.salary_currency,
        salary_frequency: emp.salary_frequency,
        performance_score: emp.performance_score || 0,
        reports_count: 0, // Désactivé temporairement
        vacation_days_total: emp.vacation_days_total || 25,
        vacation_days_used: emp.vacation_days_used || 0,
        sick_days_used: 0, // Désactivé car peut ne pas exister
        skills: emp.skills || [],
        certifications: emp.certifications || [],
        languages: emp.languages || [],
        work_preferences: emp.work_preferences || {},
        timezone: emp.timezone || 'Europe/Paris',
        ai_insights: emp.ai_insights || {},
        performance_trends: emp.performance_trends || {},
        career_recommendations: emp.career_recommendations || [],
        emergency_contact: emp.emergency_contact || { name: '', relationship: '', phone: '' },
        address: emp.address || { street: '', city: '', country: '' },
        created_at: emp.created_at,
        updated_at: emp.updated_at,
        // Relations désactivées temporairement
        branch: undefined,
        department: undefined,
        position: undefined
      }));

      return {
        data: employees,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / pagination.limit)
        }
      };
    } catch (error) {
      console.error('Error in employeeSupabaseApi.list:', error);
      throw new Error(`Failed to fetch employees: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Récupère un employé par son ID
   */
  async getById(id: string): Promise<Employee> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          branches(id, name, address),
          departments(id, name, manager_id),
          positions(id, title, department_id)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching employee:', error);
        throw error;
      }

      if (!data) {
        throw new Error(`Employee with ID ${id} not found`);
      }

      return {
        id: data.id,
        employee_number: data.employee_number,
        first_name: data.first_name,
        last_name: data.last_name,
        work_email: data.work_email,
        personal_email: data.personal_email,
        personal_phone: data.personal_phone,
        work_phone: data.work_phone,
        branch_id: data.branch_id,
        department_id: data.department_id,
        position_id: data.position_id,
        manager_id: data.manager_id,
        hire_date: data.hire_date,
        start_date: data.start_date,
        employment_status: data.employment_status,
        employment_type: data.employment_type,
        current_salary: data.current_salary,
        salary_currency: data.salary_currency,
        salary_frequency: data.salary_frequency,
        performance_score: data.performance_score || 0,
        reports_count: data.reports_count || 0,
        vacation_days_total: data.vacation_days_total || 25,
        vacation_days_used: data.vacation_days_used || 0,
        sick_days_used: data.sick_days_used || 0,
        skills: data.skills || [],
        certifications: data.certifications || [],
        languages: data.languages || [],
        work_preferences: data.work_preferences || {},
        timezone: data.timezone || 'Europe/Paris',
        ai_insights: data.ai_insights || {},
        performance_trends: data.performance_trends || {},
        career_recommendations: data.career_recommendations || [],
        emergency_contact: data.emergency_contact || { name: '', relationship: '', phone: '' },
        address: data.address || { street: '', city: '', country: '' },
        created_at: data.created_at,
        updated_at: data.updated_at,
        branch: data.branches,
        department: data.departments,
        position: data.positions
      };
    } catch (error) {
      console.error('Error in employeeSupabaseApi.getById:', error);
      throw new Error(`Failed to fetch employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Crée un nouvel employé
   */
  async create(data: EmployeeCreateInput): Promise<Employee> {
    try {
      // Générer le numéro d'employé automatiquement
      const { data: existingEmployees } = await supabase
        .from('employees')
        .select('employee_number')
        .order('employee_number', { ascending: false })
        .limit(1);

      let nextNumber = 1;
      if (existingEmployees && existingEmployees.length > 0) {
        const lastNumber = existingEmployees[0].employee_number;
        const numMatch = lastNumber.match(/\d+/);
        if (numMatch) {
          nextNumber = parseInt(numMatch[0]) + 1;
        }
      }

      const employeeNumber = `EMP${nextNumber.toString().padStart(3, '0')}`;

      const insertData = {
        employee_number: employeeNumber,
        first_name: data.first_name,
        last_name: data.last_name,
        work_email: data.work_email,
        branch_id: data.branch_id,
        department_id: data.department_id,
        position_id: data.position_id,
        manager_id: data.manager_id,
        hire_date: data.hire_date,
        start_date: data.hire_date, // Par défaut, même date que l'embauche
        employment_status: 'active',
        employment_type: data.employment_type,
        current_salary: data.current_salary,
        salary_currency: 'EUR',
        salary_frequency: 'monthly',
        performance_score: 0,
        reports_count: 0,
        vacation_days_total: 25,
        vacation_days_used: 0,
        sick_days_used: 0,
        skills: [],
        certifications: [],
        languages: [],
        work_preferences: {},
        timezone: 'Europe/Paris',
        ai_insights: {},
        performance_trends: {},
        career_recommendations: [],
        emergency_contact: { name: '', relationship: '', phone: '' },
        address: { street: '', city: '', country: '' }
      };

      const { data: newEmployee, error } = await supabase
        .from('employees')
        .insert(insertData)
        .select(`
          *,
          branches(id, name, address),
          departments(id, name, manager_id),
          positions(id, title, department_id)
        `)
        .single();

      if (error) {
        console.error('Error creating employee:', error);
        throw error;
      }

      return await this.getById(newEmployee.id);
    } catch (error) {
      console.error('Error in employeeSupabaseApi.create:', error);
      throw new Error(`Failed to create employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Met à jour un employé
   */
  async update(id: string, data: EmployeeUpdateInput): Promise<Employee> {
    try {
      const { error } = await supabase
        .from('employees')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating employee:', error);
        throw error;
      }

      return await this.getById(id);
    } catch (error) {
      console.error('Error in employeeSupabaseApi.update:', error);
      throw new Error(`Failed to update employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Supprime un employé (soft delete)
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('employees')
        .update({
          employment_status: 'terminated',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error deleting employee:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in employeeSupabaseApi.delete:', error);
      throw new Error(`Failed to delete employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Analyse un employé avec l'IA
   */
  async analyzeWithAI(id: string): Promise<any> {
    try {
      // Pour l'instant, simuler une analyse IA avec des insights prédéfinis
      // TODO: Intégrer avec un vrai service d'IA plus tard
      
      const employee = await this.getById(id);
      
      const insights = {
        performance_prediction: Math.random() * 2 + 3, // Score entre 3 et 5
        turnover_risk: Math.random() * 0.3, // Risque entre 0 et 0.3
        career_suggestions: [
          'Formation en leadership recommandée',
          'Opportunité de mentoring junior',
          'Certification technique suggérée'
        ],
        strengths: [
          'Excellente collaboration',
          'Proactif dans la résolution de problèmes',
          'Bon communicateur'
        ],
        areas_for_improvement: [
          'Gestion du temps',
          'Compétences techniques avancées'
        ],
        recommended_actions: [
          'Planifier une revue de performance',
          'Proposer formation continue',
          'Envisager promotion'
        ]
      };

      // Mettre à jour les insights dans la base
      await this.update(id, {
        ai_insights: insights,
        updated_at: new Date().toISOString()
      });

      return insights;
    } catch (error) {
      console.error('Error in employeeSupabaseApi.analyzeWithAI:', error);
      throw new Error(`Failed to analyze employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

// === SERVICES DÉPARTEMENTS ===

export const departmentSupabaseApi = {
  async list(): Promise<SimpleDepartment[]> {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select(`
          *,
          manager:users(id, first_name, last_name, email)
        `)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching departments:', error);
        throw error;
      }

      return (data || []).map(dept => ({
        id: dept.id,
        name: dept.name,
        description: dept.description,
        manager_id: dept.manager_id,
        manager: dept.manager ? {
          id: dept.manager.id,
          first_name: dept.manager.first_name,
          last_name: dept.manager.last_name,
          email: dept.manager.email
        } : undefined,
        budget: dept.budget,
        location: dept.location,
        phone: dept.phone,
        email: dept.email,
        status: dept.status,
        created_at: dept.created_at,
        updated_at: dept.updated_at
      }));
    } catch (error) {
      console.error('Error in departmentSupabaseApi.list:', error);
      throw new Error(`Failed to fetch departments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async getById(id: string): Promise<SimpleDepartment> {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select(`
          *,
          manager:users(id, first_name, last_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching department:', error);
        throw error;
      }

      if (!data) {
        throw new Error(`Department with ID ${id} not found`);
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        manager_id: data.manager_id,
        manager: data.manager ? {
          id: data.manager.id,
          first_name: data.manager.first_name,
          last_name: data.manager.last_name,
          email: data.manager.email
        } : undefined,
        budget: data.budget,
        location: data.location,
        phone: data.phone,
        email: data.email,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error in departmentSupabaseApi.getById:', error);
      throw new Error(`Failed to fetch department: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

// === SERVICES POSITIONS ===

export const positionSupabaseApi = {
  async list(): Promise<SimplePosition[]> {
    try {
      const { data, error } = await supabase
        .from('positions')
        .select(`
          *,
          department:departments(id, name)
        `)
        .order('title', { ascending: true });

      if (error) {
        console.error('Error fetching positions:', error);
        throw error;
      }

      return (data || []).map(pos => ({
        id: pos.id,
        title: pos.title,
        description: pos.description,
        department_id: pos.department_id,
        department: pos.department,
        level: pos.level,
        salary_min: pos.salary_min,
        salary_max: pos.salary_max,
        required_skills: pos.required_skills || [],
        responsibilities: pos.responsibilities || [],
        requirements: pos.requirements || [],
        benefits: pos.benefits || [],
        employment_type: pos.employment_type,
        remote_allowed: pos.remote_allowed,
        status: pos.status,
        created_at: pos.created_at,
        updated_at: pos.updated_at
      }));
    } catch (error) {
      console.error('Error in positionSupabaseApi.list:', error);
      throw new Error(`Failed to fetch positions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

// === SERVICES BRANCHES ===

export const branchSupabaseApi = {
  async list(): Promise<SimpleBranch[]> {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching branches:', error);
        throw error;
      }

      return (data || []).map(branch => ({
        id: branch.id,
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        email: branch.email,
        timezone: branch.timezone,
        status: branch.status,
        company_id: branch.company_id,
        created_at: branch.created_at,
        updated_at: branch.updated_at
      }));
    } catch (error) {
      console.error('Error in branchSupabaseApi.list:', error);
      throw new Error(`Failed to fetch branches: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};
