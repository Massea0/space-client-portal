// src/services/hr/supabaseApiSimple.ts
// Version ultra-simplifiée pour débugger les erreurs 500
import { supabase } from '@/lib/supabaseClient';

export interface EmployeeSimple {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  work_email: string;
  employment_status: string;
  employment_type: string;
  current_salary?: number;
  salary_currency?: string;
  performance_score?: number;
  hire_date: string;
  branch_id: string;
  department_id: string;
  position_id: string;
}

export const simpleEmployeeApi = {
  /**
   * Version ultra-simple qui ne fait qu'un SELECT * basique
   */
  async listBasic(): Promise<EmployeeSimple[]> {
    try {
      console.log('[Simple API] Tentative de récupération des employés...');
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .limit(10);

      if (error) {
        console.error('[Simple API] Erreur Supabase:', error);
        throw new Error(`Erreur Supabase: ${error.message}`);
      }

      console.log('[Simple API] Données récupérées:', data?.length || 0, 'employés');
      
      return data || [];
    } catch (error) {
      console.error('[Simple API] Exception:', error);
      throw error;
    }
  },

  /**
   * Test des employés avec filtrage basique
   */
  async listTest(): Promise<EmployeeSimple[]> {
    try {
      console.log('[Simple API] Test avec filtre EMP%...');
      
      const { data, error } = await supabase
        .from('employees')
        .select(`
          id,
          employee_number,
          first_name,
          last_name,
          work_email,
          employment_status,
          employment_type,
          current_salary,
          salary_currency,
          performance_score,
          hire_date,
          branch_id,
          department_id,
          position_id
        `)
        .like('employee_number', 'EMP%')
        .limit(20);

      if (error) {
        console.error('[Simple API] Erreur avec filtre:', error);
        throw new Error(`Erreur avec filtre: ${error.message}`);
      }

      console.log('[Simple API] Employés EMP trouvés:', data?.length || 0);
      
      return data || [];
    } catch (error) {
      console.error('[Simple API] Exception avec filtre:', error);
      throw error;
    }
  }
};

export default simpleEmployeeApi;
