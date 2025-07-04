import { UserRole, Permission, RolePermissions, UserRoleAssignment, UserWithRole, DEFAULT_ROLE_PERMISSIONS, ROLE_HIERARCHY } from '../../types/hr/roles';

// Mock data for user role assignments
const mockUserRoleAssignments: UserRoleAssignment[] = [
  {
    id: 'role-1',
    user_id: 'user-1',
    employee_id: 'emp-1',
    role: UserRole.HR_MANAGER,
    assigned_by: 'user-admin',
    assigned_at: '2024-01-15T09:00:00Z',
    is_active: true,
    scope: { type: 'global' }
  },
  {
    id: 'role-2',
    user_id: 'user-2',
    employee_id: 'emp-2',
    role: UserRole.DEPARTMENT_MANAGER,
    assigned_by: 'user-1',
    assigned_at: '2024-01-10T10:00:00Z',
    is_active: true,
    department_id: 'dept-2',
    scope: { type: 'department', resource_id: 'dept-2' }
  },
  {
    id: 'role-3',
    user_id: 'user-3',
    employee_id: 'emp-3',
    role: UserRole.DEPARTMENT_MANAGER,
    assigned_by: 'user-1',
    assigned_at: '2024-01-12T11:00:00Z',
    is_active: true,
    department_id: 'dept-3',
    scope: { type: 'department', resource_id: 'dept-3' }
  },
  {
    id: 'role-4',
    user_id: 'user-4',
    employee_id: 'emp-4',
    role: UserRole.TEAM_LEAD,
    assigned_by: 'user-1',
    assigned_at: '2024-01-08T14:00:00Z',
    is_active: true,
    department_id: 'dept-4',
    scope: { type: 'department', resource_id: 'dept-4' }
  },
  {
    id: 'role-5',
    user_id: 'user-5',
    employee_id: 'emp-5',
    role: UserRole.EMPLOYEE,
    assigned_by: 'user-1',
    assigned_at: '2024-01-05T09:00:00Z',
    is_active: true,
    scope: { type: 'global' }
  }
];

// Mock users data
const mockUsers: UserWithRole[] = [
  {
    id: 'user-1',
    email: 'marie.dubois@company.com',
    role_assignment: mockUserRoleAssignments[0],
    employee: {
      id: 'emp-1',
      first_name: 'Marie',
      last_name: 'Dubois',
      department_id: 'dept-1'
    }
  },
  {
    id: 'user-2',
    email: 'pierre.martin@company.com',
    role_assignment: mockUserRoleAssignments[1],
    employee: {
      id: 'emp-2',
      first_name: 'Pierre',
      last_name: 'Martin',
      department_id: 'dept-2'
    }
  },
  {
    id: 'user-3',
    email: 'sophie.leroy@company.com',
    role_assignment: mockUserRoleAssignments[2],
    employee: {
      id: 'emp-3',
      first_name: 'Sophie',
      last_name: 'Leroy',
      department_id: 'dept-3'
    }
  },
  {
    id: 'user-4',
    email: 'thomas.roux@company.com',
    role_assignment: mockUserRoleAssignments[3],
    employee: {
      id: 'emp-4',
      first_name: 'Thomas',
      last_name: 'Roux',
      department_id: 'dept-4'
    }
  },
  {
    id: 'user-5',
    email: 'claire.bernard@company.com',
    role_assignment: mockUserRoleAssignments[4],
    employee: {
      id: 'emp-5',
      first_name: 'Claire',
      last_name: 'Bernard',
      department_id: 'dept-5'
    }
  }
];

class RoleApiService {
  private userRoleAssignments: UserRoleAssignment[] = [...mockUserRoleAssignments];
  private users: UserWithRole[] = [...mockUsers];

  async getUserRole(userId: string): Promise<UserRoleAssignment | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const roleAssignment = this.userRoleAssignments.find(
      assignment => assignment.user_id === userId && assignment.is_active
    );

    return roleAssignment || null;
  }

  async getUserWithRole(userId: string): Promise<UserWithRole | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const user = this.users.find(u => u.id === userId);
    return user || null;
  }

  async assignRole(
    userId: string, 
    role: UserRole, 
    assignedBy: string,
    departmentId?: string,
    expiresAt?: string
  ): Promise<UserRoleAssignment> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    // Deactivate existing role assignments for this user
    this.userRoleAssignments.forEach(assignment => {
      if (assignment.user_id === userId) {
        assignment.is_active = false;
      }
    });

    const newRoleAssignment: UserRoleAssignment = {
      id: `role-${Date.now()}`,
      user_id: userId,
      role,
      assigned_by: assignedBy,
      assigned_at: new Date().toISOString(),
      expires_at: expiresAt,
      is_active: true,
      department_id: departmentId,
      scope: departmentId 
        ? { type: 'department', resource_id: departmentId }
        : { type: 'global' }
    };

    this.userRoleAssignments.push(newRoleAssignment);

    // Update user data
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.users[userIndex].role_assignment = newRoleAssignment;
    }

    return newRoleAssignment;
  }

  async revokeRole(userId: string, revokedBy: string): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const roleAssignment = this.userRoleAssignments.find(
      assignment => assignment.user_id === userId && assignment.is_active
    );

    if (!roleAssignment) {
      throw new Error(`No active role assignment found for user ${userId}`);
    }

    roleAssignment.is_active = false;

    // Update user data
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      // Assign default employee role
      const defaultRoleAssignment: UserRoleAssignment = {
        id: `role-${Date.now()}`,
        user_id: userId,
        role: UserRole.EMPLOYEE,
        assigned_by: revokedBy,
        assigned_at: new Date().toISOString(),
        is_active: true,
        scope: { type: 'global' }
      };

      this.userRoleAssignments.push(defaultRoleAssignment);
      this.users[userIndex].role_assignment = defaultRoleAssignment;
    }

    return true;
  }

  async checkPermission(userId: string, permission: Permission): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const roleAssignment = await this.getUserRole(userId);
    if (!roleAssignment || !roleAssignment.is_active) {
      return false;
    }

    const rolePermissions = this.getRolePermissions(roleAssignment.role);
    return rolePermissions.permissions.includes(permission);
  }

  async checkMultiplePermissions(userId: string, permissions: Permission[]): Promise<Record<Permission, boolean>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));

    const results: Record<Permission, boolean> = {} as Record<Permission, boolean>;

    const roleAssignment = await this.getUserRole(userId);
    if (!roleAssignment || !roleAssignment.is_active) {
      permissions.forEach(permission => {
        results[permission] = false;
      });
      return results;
    }

    const rolePermissions = this.getRolePermissions(roleAssignment.role);

    permissions.forEach(permission => {
      results[permission] = rolePermissions.permissions.includes(permission);
    });

    return results;
  }

  getRolePermissions(role: UserRole): RolePermissions {
    const roleConfig = DEFAULT_ROLE_PERMISSIONS.find(r => r.role === role);
    
    if (!roleConfig) {
      // Default to employee permissions if role not found
      return DEFAULT_ROLE_PERMISSIONS.find(r => r.role === UserRole.EMPLOYEE)!;
    }

    return roleConfig;
  }

  getAllRolePermissions(): RolePermissions[] {
    return [...DEFAULT_ROLE_PERMISSIONS];
  }

  getRoleHierarchy() {
    return [...ROLE_HIERARCHY];
  }

  async getUsersByRole(role: UserRole): Promise<UserWithRole[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    return this.users.filter(user => 
      user.role_assignment.role === role && user.role_assignment.is_active
    );
  }

  async getUsersByDepartment(departmentId: string): Promise<UserWithRole[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    return this.users.filter(user => 
      user.role_assignment.department_id === departmentId && 
      user.role_assignment.is_active
    );
  }

  async getDepartmentManagers(): Promise<UserWithRole[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    return this.users.filter(user => 
      user.role_assignment.role === UserRole.DEPARTMENT_MANAGER && 
      user.role_assignment.is_active
    );
  }

  async canUserManageRole(managerId: string, targetRole: UserRole): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const managerRoleAssignment = await this.getUserRole(managerId);
    if (!managerRoleAssignment || !managerRoleAssignment.is_active) {
      return false;
    }

    const managerHierarchy = ROLE_HIERARCHY.find(h => h.role === managerRoleAssignment.role);
    if (!managerHierarchy) {
      return false;
    }

    return managerHierarchy.can_manage.includes(targetRole);
  }

  async getRoleStatistics(): Promise<Record<UserRole, number>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const stats: Record<UserRole, number> = {} as Record<UserRole, number>;

    // Initialize all roles with 0
    Object.values(UserRole).forEach(role => {
      stats[role] = 0;
    });

    // Count active role assignments
    this.userRoleAssignments
      .filter(assignment => assignment.is_active)
      .forEach(assignment => {
        stats[assignment.role]++;
      });

    return stats;
  }
}

// Export singleton instance
export const roleApi = new RoleApiService();
