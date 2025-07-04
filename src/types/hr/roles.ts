export enum UserRole {
  ADMIN = 'admin',
  HR_MANAGER = 'hr_manager',
  DEPARTMENT_MANAGER = 'department_manager',
  TEAM_LEAD = 'team_lead',
  EMPLOYEE = 'employee',
  CLIENT = 'client',
  CONTRACTOR = 'contractor'
}

export enum Permission {
  // Employee permissions
  VIEW_EMPLOYEES = 'view_employees',
  CREATE_EMPLOYEE = 'create_employee',
  UPDATE_EMPLOYEE = 'update_employee',
  DELETE_EMPLOYEE = 'delete_employee',
  VIEW_EMPLOYEE_DETAILS = 'view_employee_details',
  VIEW_EMPLOYEE_SALARY = 'view_employee_salary',
  UPDATE_EMPLOYEE_SALARY = 'update_employee_salary',
  
  // Department permissions
  VIEW_DEPARTMENTS = 'view_departments',
  CREATE_DEPARTMENT = 'create_department',
  UPDATE_DEPARTMENT = 'update_department',
  DELETE_DEPARTMENT = 'delete_department',
  MANAGE_DEPARTMENT = 'manage_department',
  
  // Position permissions
  VIEW_POSITIONS = 'view_positions',
  CREATE_POSITION = 'create_position',
  UPDATE_POSITION = 'update_position',
  DELETE_POSITION = 'delete_position',
  
  // Role permissions
  ASSIGN_ROLES = 'assign_roles',
  VIEW_ROLES = 'view_roles',
  MANAGE_PERMISSIONS = 'manage_permissions',
  
  // Onboarding permissions
  MANAGE_ONBOARDING = 'manage_onboarding',
  VIEW_ONBOARDING = 'view_onboarding',
  CREATE_ONBOARDING_TEMPLATES = 'create_onboarding_templates',
  
  // System permissions
  ADMIN_ACCESS = 'admin_access',
  VIEW_ANALYTICS = 'view_analytics',
  EXPORT_DATA = 'export_data',
  MANAGE_INTEGRATIONS = 'manage_integrations'
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  description: string;
  inherits_from?: UserRole[];
}

export interface UserRoleAssignment {
  id: string;
  user_id: string;
  employee_id?: string;
  role: UserRole;
  assigned_by: string;
  assigned_at: string;
  expires_at?: string;
  is_active: boolean;
  department_id?: string; // For department-specific roles
  scope?: RoleScope;
}

export interface RoleScope {
  type: 'global' | 'department' | 'team' | 'project';
  resource_id?: string; // ID of department, team, or project
}

export interface UserWithRole {
  id: string;
  email: string;
  role_assignment: UserRoleAssignment;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    department_id?: string;
  };
}

export interface RoleHierarchy {
  role: UserRole;
  level: number;
  can_manage: UserRole[];
}

// Default role permissions configuration
export const DEFAULT_ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: UserRole.ADMIN,
    permissions: Object.values(Permission),
    description: 'Full system access with all permissions'
  },
  {
    role: UserRole.HR_MANAGER,
    permissions: [
      Permission.VIEW_EMPLOYEES,
      Permission.CREATE_EMPLOYEE,
      Permission.UPDATE_EMPLOYEE,
      Permission.VIEW_EMPLOYEE_DETAILS,
      Permission.VIEW_EMPLOYEE_SALARY,
      Permission.UPDATE_EMPLOYEE_SALARY,
      Permission.VIEW_DEPARTMENTS,
      Permission.CREATE_DEPARTMENT,
      Permission.UPDATE_DEPARTMENT,
      Permission.VIEW_POSITIONS,
      Permission.CREATE_POSITION,
      Permission.UPDATE_POSITION,
      Permission.ASSIGN_ROLES,
      Permission.VIEW_ROLES,
      Permission.MANAGE_ONBOARDING,
      Permission.VIEW_ONBOARDING,
      Permission.CREATE_ONBOARDING_TEMPLATES,
      Permission.VIEW_ANALYTICS,
      Permission.EXPORT_DATA
    ],
    description: 'HR management with employee and department access'
  },
  {
    role: UserRole.DEPARTMENT_MANAGER,
    permissions: [
      Permission.VIEW_EMPLOYEES,
      Permission.UPDATE_EMPLOYEE,
      Permission.VIEW_EMPLOYEE_DETAILS,
      Permission.MANAGE_DEPARTMENT,
      Permission.VIEW_DEPARTMENTS,
      Permission.VIEW_POSITIONS,
      Permission.CREATE_POSITION,
      Permission.UPDATE_POSITION,
      Permission.VIEW_ONBOARDING
    ],
    description: 'Department management with limited employee access'
  },
  {
    role: UserRole.TEAM_LEAD,
    permissions: [
      Permission.VIEW_EMPLOYEES,
      Permission.VIEW_EMPLOYEE_DETAILS,
      Permission.VIEW_DEPARTMENTS,
      Permission.VIEW_POSITIONS,
      Permission.VIEW_ONBOARDING
    ],
    description: 'Team leadership with view-only access'
  },
  {
    role: UserRole.EMPLOYEE,
    permissions: [
      Permission.VIEW_EMPLOYEES,
      Permission.VIEW_DEPARTMENTS,
      Permission.VIEW_POSITIONS
    ],
    description: 'Basic employee access with read-only permissions'
  },
  {
    role: UserRole.CLIENT,
    permissions: [],
    description: 'External client with no HR access'
  },
  {
    role: UserRole.CONTRACTOR,
    permissions: [
      Permission.VIEW_EMPLOYEES,
      Permission.VIEW_DEPARTMENTS
    ],
    description: 'External contractor with minimal access'
  }
];

export const ROLE_HIERARCHY: RoleHierarchy[] = [
  {
    role: UserRole.ADMIN,
    level: 100,
    can_manage: Object.values(UserRole)
  },
  {
    role: UserRole.HR_MANAGER,
    level: 80,
    can_manage: [UserRole.DEPARTMENT_MANAGER, UserRole.TEAM_LEAD, UserRole.EMPLOYEE, UserRole.CONTRACTOR]
  },
  {
    role: UserRole.DEPARTMENT_MANAGER,
    level: 60,
    can_manage: [UserRole.TEAM_LEAD, UserRole.EMPLOYEE]
  },
  {
    role: UserRole.TEAM_LEAD,
    level: 40,
    can_manage: [UserRole.EMPLOYEE]
  },
  {
    role: UserRole.EMPLOYEE,
    level: 20,
    can_manage: []
  },
  {
    role: UserRole.CLIENT,
    level: 10,
    can_manage: []
  },
  {
    role: UserRole.CONTRACTOR,
    level: 15,
    can_manage: []
  }
];
