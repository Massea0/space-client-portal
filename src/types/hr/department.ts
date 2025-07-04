export interface Department {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
  manager?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  budget?: number;
  location?: string;
  phone?: string;
  email?: string;
  status: DepartmentStatus;
  created_at: string;
  updated_at: string;
}

export interface DepartmentFormData {
  name: string;
  description?: string;
  manager_id?: string;
  budget?: number;
  location?: string;
  phone?: string;
  email?: string;
  status: DepartmentStatus;
}

export interface DepartmentStats {
  employee_count: number;
  avg_salary?: number;
  budget_utilization?: number;
  recent_hires: number;
  positions_count: number;
}

export interface DepartmentWithStats extends Department {
  stats: DepartmentStats;
}

export enum DepartmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  RESTRUCTURING = 'restructuring'
}

export interface DepartmentFilters {
  status?: DepartmentStatus;
  manager_id?: string;
  search?: string;
}
