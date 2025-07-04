// src/hooks/hr/useEmployees.ts
// Hook React pour la gestion des employés avec cache et optimisations

import { useState, useEffect, useCallback } from 'react';
import { employeeApi } from '@/services/hr/employeeApi';
import type { Employee, EmployeeFilters, EmployeeStats, PaginatedResponse } from '@/types/hr';

interface UseEmployeesResult {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  stats: EmployeeStats | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  
  // Actions
  fetchEmployees: (filters?: EmployeeFilters, page?: number) => Promise<void>;
  searchEmployees: (query: string) => Promise<void>;
  refreshEmployees: () => Promise<void>;
  
  // Pagination
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  
  // Filtres
  setFilters: (filters: EmployeeFilters) => void;
  clearFilters: () => void;
}

const DEFAULT_FILTERS: EmployeeFilters = {
  employment_status: 'active'
};

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 50,
  total: 0,
  total_pages: 0
};

export const useEmployees = (initialFilters: EmployeeFilters = {}): UseEmployeesResult => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [filters, setFiltersState] = useState<EmployeeFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters
  });
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);

  const fetchEmployees = useCallback(async (
    newFilters?: EmployeeFilters, 
    page: number = 1
  ) => {
    try {
      setLoading(true);
      setError(null);

      const filtersToUse = newFilters || filters;
      
      // Convertir status en employment_status si nécessaire
      if (filtersToUse.status) {
        filtersToUse.employment_status = filtersToUse.status as any;
        delete filtersToUse.status;
      }

      const result: PaginatedResponse<Employee> = await employeeApi.list(
        filtersToUse,
        { page, limit: pagination.limit }
      );

      setEmployees(result.data);
      setPagination({
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        total_pages: result.pagination.total_pages
      });

      // Générer des stats basiques à partir des données
      if (result.data.length > 0 || page === 1) {
        const mockStats: EmployeeStats = {
          total_employees: result.pagination.total,
          active_employees: result.data.filter(emp => emp.employment_status === 'active').length,
          inactive_employees: result.data.filter(emp => emp.employment_status === 'inactive').length,
          departments_count: new Set(result.data.map(emp => emp.department_id)).size,
          branches_count: new Set(result.data.map(emp => emp.branch_id)).size,
          new_hires_this_month: 0, // TODO: Calculer basé sur hire_date
          departures_this_month: 0, // TODO: Calculer basé sur departure_date
          avg_performance_score: result.data.reduce((sum, emp) => sum + (emp.performance_score || 0), 0) / result.data.length || 0
        };
        setStats(mockStats);
      }

      if (newFilters) {
        setFiltersState(filtersToUse);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch employees';
      setError(errorMessage);
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  const searchEmployees = useCallback(async (query: string) => {
    const searchFilters: EmployeeFilters = {
      ...filters,
      search: query
    };
    await fetchEmployees(searchFilters, 1);
  }, [filters, fetchEmployees]);

  const refreshEmployees = useCallback(async () => {
    await fetchEmployees(filters, pagination.page);
  }, [fetchEmployees, filters, pagination.page]);

  const nextPage = useCallback(async () => {
    if (pagination.page < pagination.total_pages) {
      await fetchEmployees(filters, pagination.page + 1);
    }
  }, [fetchEmployees, filters, pagination.page, pagination.total_pages]);

  const prevPage = useCallback(async () => {
    if (pagination.page > 1) {
      await fetchEmployees(filters, pagination.page - 1);
    }
  }, [fetchEmployees, filters, pagination.page]);

  const goToPage = useCallback(async (page: number) => {
    if (page >= 1 && page <= pagination.total_pages) {
      await fetchEmployees(filters, page);
    }
  }, [fetchEmployees, filters, pagination.total_pages]);

  const setFilters = useCallback((newFilters: EmployeeFilters) => {
    const mergedFilters = { ...DEFAULT_FILTERS, ...newFilters };
    setFiltersState(mergedFilters);
    fetchEmployees(mergedFilters, 1);
  }, [fetchEmployees]);

  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    fetchEmployees(DEFAULT_FILTERS, 1);
  }, [fetchEmployees]);

  // Initial load
  useEffect(() => {
    fetchEmployees();
  }, []); // Only run on mount

  return {
    employees,
    loading,
    error,
    stats,
    pagination,
    fetchEmployees,
    searchEmployees,
    refreshEmployees,
    nextPage,
    prevPage,
    goToPage,
    setFilters,
    clearFilters
  };
};

// Hook pour un employé individuel
interface UseEmployeeResult {
  employee: Employee | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchEmployee: () => Promise<void>;
  updateEmployee: (data: Partial<Employee>) => Promise<void>;
  analyzeWithAI: () => Promise<any>;
  refreshEmployee: () => Promise<void>;
}

export const useEmployee = (employeeId: string): UseEmployeeResult => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployee = useCallback(async () => {
    if (!employeeId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await employeeApi.getById(employeeId);
      setEmployee(result);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch employee';
      setError(errorMessage);
      console.error('Error fetching employee:', err);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  const updateEmployee = useCallback(async (data: Partial<Employee>) => {
    if (!employeeId) return;

    try {
      setLoading(true);
      setError(null);

      const updatedEmployee = await employeeApi.update(employeeId, data);
      setEmployee(updatedEmployee);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update employee';
      setError(errorMessage);
      console.error('Error updating employee:', err);
      throw err; // Re-throw for form handling
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  const analyzeWithAI = useCallback(async () => {
    if (!employeeId) return;

    try {
      setLoading(true);
      const insights = await employeeApi.analyzeWithAI(employeeId);
      
      // Refresh employee data to get updated insights
      await fetchEmployee();
      
      return insights;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze employee';
      setError(errorMessage);
      console.error('Error analyzing employee:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [employeeId, fetchEmployee]);

  const refreshEmployee = useCallback(async () => {
    await fetchEmployee();
  }, [fetchEmployee]);

  // Initial load
  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId, fetchEmployee]);

  return {
    employee,
    loading,
    error,
    fetchEmployee,
    updateEmployee,
    analyzeWithAI,
    refreshEmployee
  };
};

// Hook pour la création d'employés
interface UseEmployeeCreateResult {
  loading: boolean;
  error: string | null;
  createEmployee: (data: any) => Promise<Employee>;
  clearError: () => void;
}

export const useEmployeeCreate = (): UseEmployeeCreateResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEmployee = useCallback(async (data: any): Promise<Employee> => {
    try {
      setLoading(true);
      setError(null);

      const newEmployee = await employeeApi.create(data);
      return newEmployee;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create employee';
      setError(errorMessage);
      console.error('Error creating employee:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    createEmployee,
    clearError
  };
};

// Hook pour les options de sélection (départements, branches, postes)
interface UseHROptionsResult {
  departments: any[];
  branches: any[];
  positions: any[];
  managers: Employee[];
  loading: boolean;
  error: string | null;
  refreshOptions: () => Promise<void>;
}

export const useHROptions = (): UseHROptionsResult => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all options in parallel
      const [employeesData] = await Promise.all([
        employeeApi.list({ employment_status: 'active' }, { page: 1, limit: 1000 }), // All employees
        // TODO: Add specific APIs for departments, branches, positions
      ]);

      // For now, using the employees data to extract managers
      const managersFromEmployees = employeesData.data.filter(emp => emp.reports_count && emp.reports_count > 0);
      setManagers(managersFromEmployees);

      // TODO: Extract departments and branches from employees data
      const uniqueDepartments = Array.from(new Set(employeesData.data.map(emp => emp.department_id).filter(Boolean)));
      const uniqueBranches = Array.from(new Set(employeesData.data.map(emp => emp.branch_id).filter(Boolean)));
      
      // Set mock data for now
      setBranches([]);
      setDepartments([]);
      setPositions([]);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch options';
      setError(errorMessage);
      console.error('Error fetching HR options:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshOptions = useCallback(async () => {
    await fetchOptions();
  }, [fetchOptions]);

  // Initial load
  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  return {
    departments,
    branches,
    positions,
    managers,
    loading,
    error,
    refreshOptions
  };
};

export default useEmployees;
