import { Department, DepartmentFormData, DepartmentStats, DepartmentStatus, DepartmentFilters, DepartmentWithStats } from '../../types/hr/department';
import { PaginatedResponse } from '../../types/hr';

// Mock data for departments
const mockDepartments: Department[] = [
  {
    id: 'dept-1',
    name: 'Ressources Humaines',
    description: 'Gestion du personnel et des talents',
    manager_id: 'emp-1',
    manager: {
      id: 'emp-1',
      first_name: 'Marie',
      last_name: 'Dubois',
      email: 'marie.dubois@company.com'
    },
    budget: 500000,
    location: 'Siège social - 2ème étage',
    phone: '+33 1 42 12 34 56',
    email: 'rh@company.com',
    status: DepartmentStatus.ACTIVE,
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-20T14:30:00Z'
  },
  {
    id: 'dept-2',
    name: 'Développement',
    description: 'Équipe de développement logiciel',
    manager_id: 'emp-2',
    manager: {
      id: 'emp-2',
      first_name: 'Pierre',
      last_name: 'Martin',
      email: 'pierre.martin@company.com'
    },
    budget: 1200000,
    location: 'Siège social - 3ème étage',
    phone: '+33 1 42 12 34 57',
    email: 'dev@company.com',
    status: DepartmentStatus.ACTIVE,
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-25T10:15:00Z'
  },
  {
    id: 'dept-3',
    name: 'Marketing',
    description: 'Marketing digital et communication',
    manager_id: 'emp-3',
    manager: {
      id: 'emp-3',
      first_name: 'Sophie',
      last_name: 'Leroy',
      email: 'sophie.leroy@company.com'
    },
    budget: 800000,
    location: 'Siège social - 1er étage',
    phone: '+33 1 42 12 34 58',
    email: 'marketing@company.com',
    status: DepartmentStatus.ACTIVE,
    created_at: '2024-01-12T09:00:00Z',
    updated_at: '2024-01-22T16:45:00Z'
  },
  {
    id: 'dept-4',
    name: 'Ventes',
    description: 'Équipe commerciale et business development',
    manager_id: 'emp-4',
    manager: {
      id: 'emp-4',
      first_name: 'Thomas',
      last_name: 'Roux',
      email: 'thomas.roux@company.com'
    },
    budget: 600000,
    location: 'Siège social - RDC',
    phone: '+33 1 42 12 34 59',
    email: 'sales@company.com',
    status: DepartmentStatus.ACTIVE,
    created_at: '2024-01-08T09:00:00Z',
    updated_at: '2024-01-18T11:20:00Z'
  },
  {
    id: 'dept-5',
    name: 'Finance',
    description: 'Gestion financière et comptabilité',
    manager_id: 'emp-5',
    manager: {
      id: 'emp-5',
      first_name: 'Claire',
      last_name: 'Bernard',
      email: 'claire.bernard@company.com'
    },
    budget: 400000,
    location: 'Siège social - 4ème étage',
    phone: '+33 1 42 12 34 60',
    email: 'finance@company.com',
    status: DepartmentStatus.ACTIVE,
    created_at: '2024-01-05T09:00:00Z',
    updated_at: '2024-01-15T13:10:00Z'
  },
  {
    id: 'dept-6',
    name: 'Support Client',
    description: 'Service client et support technique',
    budget: 300000,
    location: 'Annexe - 1er étage',
    phone: '+33 1 42 12 34 61',
    email: 'support@company.com',
    status: DepartmentStatus.RESTRUCTURING,
    created_at: '2024-01-20T09:00:00Z',
    updated_at: '2024-01-28T09:30:00Z'
  }
];

// Mock stats for departments
const mockDepartmentStats: Record<string, DepartmentStats> = {
  'dept-1': {
    employee_count: 8,
    avg_salary: 55000,
    budget_utilization: 75,
    recent_hires: 2,
    positions_count: 10
  },
  'dept-2': {
    employee_count: 15,
    avg_salary: 68000,
    budget_utilization: 82,
    recent_hires: 4,
    positions_count: 18
  },
  'dept-3': {
    employee_count: 12,
    avg_salary: 52000,
    budget_utilization: 70,
    recent_hires: 3,
    positions_count: 15
  },
  'dept-4': {
    employee_count: 10,
    avg_salary: 58000,
    budget_utilization: 88,
    recent_hires: 1,
    positions_count: 12
  },
  'dept-5': {
    employee_count: 6,
    avg_salary: 65000,
    budget_utilization: 65,
    recent_hires: 1,
    positions_count: 8
  },
  'dept-6': {
    employee_count: 8,
    avg_salary: 45000,
    budget_utilization: 90,
    recent_hires: 0,
    positions_count: 10
  }
};

class DepartmentApiService {
  private departments: Department[] = [...mockDepartments];

  async getDepartments(filters?: DepartmentFilters): Promise<PaginatedResponse<Department>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    let filteredDepartments = [...this.departments];

    if (filters) {
      if (filters.status) {
        filteredDepartments = filteredDepartments.filter(dept => dept.status === filters.status);
      }

      if (filters.manager_id) {
        filteredDepartments = filteredDepartments.filter(dept => dept.manager_id === filters.manager_id);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredDepartments = filteredDepartments.filter(dept =>
          dept.name.toLowerCase().includes(searchLower) ||
          dept.description?.toLowerCase().includes(searchLower) ||
          dept.email?.toLowerCase().includes(searchLower)
        );
      }
    }

    return {
      data: filteredDepartments,
      pagination: {
        page: 1,
        limit: 50,
        total: filteredDepartments.length,
        total_pages: 1
      }
    };
  }

  async getDepartmentById(id: string): Promise<Department | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const department = this.departments.find(dept => dept.id === id);
    return department || null;
  }

  async getDepartmentWithStats(id: string): Promise<DepartmentWithStats | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const department = this.departments.find(dept => dept.id === id);
    if (!department) return null;

    const stats = mockDepartmentStats[id] || {
      employee_count: 0,
      avg_salary: 0,
      budget_utilization: 0,
      recent_hires: 0,
      positions_count: 0
    };

    return {
      ...department,
      stats
    };
  }

  async createDepartment(data: DepartmentFormData): Promise<Department> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const newDepartment: Department = {
      id: `dept-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // If manager_id is provided, fetch manager info (mock)
    if (data.manager_id) {
      newDepartment.manager = {
        id: data.manager_id,
        first_name: 'Nouveau',
        last_name: 'Manager',
        email: 'manager@company.com'
      };
    }

    this.departments.push(newDepartment);

    // Initialize stats for new department
    mockDepartmentStats[newDepartment.id] = {
      employee_count: 0,
      avg_salary: 0,
      budget_utilization: 0,
      recent_hires: 0,
      positions_count: 0
    };

    return newDepartment;
  }

  async updateDepartment(id: string, data: Partial<DepartmentFormData>): Promise<Department> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    const index = this.departments.findIndex(dept => dept.id === id);
    if (index === -1) {
      throw new Error(`Department with id ${id} not found`);
    }

    const updatedDepartment = {
      ...this.departments[index],
      ...data,
      updated_at: new Date().toISOString()
    };

    // Update manager info if manager_id changed
    if (data.manager_id && data.manager_id !== this.departments[index].manager_id) {
      updatedDepartment.manager = {
        id: data.manager_id,
        first_name: 'Manager',
        last_name: 'Mis à jour',
        email: 'updated.manager@company.com'
      };
    }

    this.departments[index] = updatedDepartment;
    return updatedDepartment;
  }

  async deleteDepartment(id: string): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const index = this.departments.findIndex(dept => dept.id === id);
    if (index === -1) {
      throw new Error(`Department with id ${id} not found`);
    }

    // In a real app, this would be a soft delete
    this.departments.splice(index, 1);
    delete mockDepartmentStats[id];

    return true;
  }

  async getDepartmentStats(id: string): Promise<DepartmentStats | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    return mockDepartmentStats[id] || null;
  }

  async getAllDepartmentStats(): Promise<Record<string, DepartmentStats>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return { ...mockDepartmentStats };
  }

  async getDepartmentsWithStats(filters?: DepartmentFilters): Promise<PaginatedResponse<DepartmentWithStats>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    let filteredDepartments = [...this.departments];

    if (filters) {
      if (filters.status) {
        filteredDepartments = filteredDepartments.filter(dept => dept.status === filters.status);
      }

      if (filters.manager_id) {
        filteredDepartments = filteredDepartments.filter(dept => dept.manager_id === filters.manager_id);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredDepartments = filteredDepartments.filter(dept =>
          dept.name.toLowerCase().includes(searchLower) ||
          dept.description?.toLowerCase().includes(searchLower) ||
          dept.email?.toLowerCase().includes(searchLower)
        );
      }
    }

    // Add stats to each department
    const departmentsWithStats: DepartmentWithStats[] = filteredDepartments.map(dept => ({
      ...dept,
      stats: mockDepartmentStats[dept.id] || {
        employee_count: 0,
        avg_salary: 0,
        budget_utilization: 0,
        recent_hires: 0,
        positions_count: 0
      }
    }));

    return {
      data: departmentsWithStats,
      pagination: {
        page: 1,
        limit: 50,
        total: departmentsWithStats.length,
        total_pages: 1
      }
    };
  }
}

// Export singleton instance
export const departmentApi = new DepartmentApiService();
