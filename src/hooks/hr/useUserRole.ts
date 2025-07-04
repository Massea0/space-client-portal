import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserRole, Permission, RolePermissions, UserRoleAssignment, UserWithRole } from '../../types/hr/roles';
import { roleApi } from '../../services/hr/roleApi';

// Query keys for React Query caching
export const roleKeys = {
  all: ['roles'] as const,
  userRoles: () => [...roleKeys.all, 'user-roles'] as const,
  userRole: (userId: string) => [...roleKeys.userRoles(), userId] as const,
  userWithRole: (userId: string) => [...roleKeys.all, 'user-with-role', userId] as const,
  permissions: () => [...roleKeys.all, 'permissions'] as const,
  userPermissions: (userId: string) => [...roleKeys.permissions(), userId] as const,
  rolePermissions: (role: UserRole) => [...roleKeys.permissions(), 'role', role] as const,
  roleStats: () => [...roleKeys.all, 'stats'] as const,
  hierarchy: () => [...roleKeys.all, 'hierarchy'] as const,
  byRole: (role: UserRole) => [...roleKeys.all, 'by-role', role] as const,
  byDepartment: (departmentId: string) => [...roleKeys.all, 'by-department', departmentId] as const,
  managers: () => [...roleKeys.all, 'managers'] as const,
};

/**
 * Hook pour récupérer le rôle d'un utilisateur
 */
export function useUserRole(userId: string) {
  return useQuery({
    queryKey: roleKeys.userRole(userId),
    queryFn: () => roleApi.getUserRole(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook pour récupérer un utilisateur avec son rôle
 */
export function useUserWithRole(userId: string) {
  return useQuery({
    queryKey: roleKeys.userWithRole(userId),
    queryFn: () => roleApi.getUserWithRole(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook pour vérifier une permission spécifique
 */
export function usePermission(userId: string, permission: Permission) {
  return useQuery({
    queryKey: [...roleKeys.userPermissions(userId), permission],
    queryFn: () => roleApi.checkPermission(userId, permission),
    enabled: !!userId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 1,
  });
}

/**
 * Hook pour vérifier plusieurs permissions à la fois
 */
export function usePermissions(userId: string, permissions: Permission[]) {
  return useQuery({
    queryKey: [...roleKeys.userPermissions(userId), 'multiple', permissions.sort()],
    queryFn: () => roleApi.checkMultiplePermissions(userId, permissions),
    enabled: !!userId && permissions.length > 0,
    staleTime: 3 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Hook pour récupérer les permissions d'un rôle
 */
export function useRolePermissions(role: UserRole) {
  return useQuery({
    queryKey: roleKeys.rolePermissions(role),
    queryFn: () => roleApi.getRolePermissions(role),
    staleTime: 10 * 60 * 1000, // 10 minutes (statique)
  });
}

/**
 * Hook pour récupérer toutes les configurations de rôles
 */
export function useAllRolePermissions() {
  return useQuery({
    queryKey: roleKeys.permissions(),
    queryFn: () => roleApi.getAllRolePermissions(),
    staleTime: 10 * 60 * 1000, // 10 minutes (statique)
  });
}

/**
 * Hook pour récupérer la hiérarchie des rôles
 */
export function useRoleHierarchy() {
  return useQuery({
    queryKey: roleKeys.hierarchy(),
    queryFn: () => roleApi.getRoleHierarchy(),
    staleTime: 10 * 60 * 1000, // 10 minutes (statique)
  });
}

/**
 * Hook pour récupérer les utilisateurs par rôle
 */
export function useUsersByRole(role: UserRole) {
  return useQuery({
    queryKey: roleKeys.byRole(role),
    queryFn: () => roleApi.getUsersByRole(role),
    staleTime: 3 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook pour récupérer les utilisateurs d'un département
 */
export function useUsersByDepartment(departmentId: string) {
  return useQuery({
    queryKey: roleKeys.byDepartment(departmentId),
    queryFn: () => roleApi.getUsersByDepartment(departmentId),
    enabled: !!departmentId,
    staleTime: 3 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook pour récupérer les managers de département
 */
export function useDepartmentManagers() {
  return useQuery({
    queryKey: roleKeys.managers(),
    queryFn: () => roleApi.getDepartmentManagers(),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook pour récupérer les statistiques des rôles
 */
export function useRoleStatistics() {
  return useQuery({
    queryKey: roleKeys.roleStats(),
    queryFn: () => roleApi.getRoleStatistics(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

/**
 * Hook pour assigner un rôle à un utilisateur
 */
export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      userId, 
      role, 
      assignedBy, 
      departmentId, 
      expiresAt 
    }: {
      userId: string;
      role: UserRole;
      assignedBy: string;
      departmentId?: string;
      expiresAt?: string;
    }) => roleApi.assignRole(userId, role, assignedBy, departmentId, expiresAt),
    onSuccess: (newRoleAssignment, { userId }) => {
      // Invalider les caches liés à l'utilisateur
      queryClient.invalidateQueries({ queryKey: roleKeys.userRole(userId) });
      queryClient.invalidateQueries({ queryKey: roleKeys.userWithRole(userId) });
      queryClient.invalidateQueries({ queryKey: roleKeys.userPermissions(userId) });
      
      // Invalider les listes par rôle
      queryClient.invalidateQueries({ queryKey: roleKeys.byRole(newRoleAssignment.role) });
      
      // Invalider les stats
      queryClient.invalidateQueries({ queryKey: roleKeys.roleStats() });
      
      // Invalider par département si applicable
      if (newRoleAssignment.department_id) {
        queryClient.invalidateQueries({ 
          queryKey: roleKeys.byDepartment(newRoleAssignment.department_id) 
        });
      }
      
      // Invalider les managers si c'est un rôle de manager
      if (newRoleAssignment.role === UserRole.DEPARTMENT_MANAGER) {
        queryClient.invalidateQueries({ queryKey: roleKeys.managers() });
      }
    },
    onError: (error) => {
      console.error('Error assigning role:', error);
    },
  });
}

/**
 * Hook pour révoquer le rôle d'un utilisateur
 */
export function useRevokeRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, revokedBy }: { userId: string; revokedBy: string }) =>
      roleApi.revokeRole(userId, revokedBy),
    onSuccess: (_, { userId }) => {
      // Invalider tous les caches liés à l'utilisateur
      queryClient.invalidateQueries({ queryKey: roleKeys.userRole(userId) });
      queryClient.invalidateQueries({ queryKey: roleKeys.userWithRole(userId) });
      queryClient.invalidateQueries({ queryKey: roleKeys.userPermissions(userId) });
      
      // Invalider toutes les listes par rôle
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      
      // Invalider les stats
      queryClient.invalidateQueries({ queryKey: roleKeys.roleStats() });
    },
    onError: (error) => {
      console.error('Error revoking role:', error);
    },
  });
}

/**
 * Hook pour vérifier si un utilisateur peut gérer un rôle
 */
export function useCanManageRole(managerId: string, targetRole: UserRole) {
  return useQuery({
    queryKey: ['can-manage-role', managerId, targetRole],
    queryFn: () => roleApi.canUserManageRole(managerId, targetRole),
    enabled: !!managerId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Hook personnalisé pour gérer l'état complet des rôles
 * Combine plusieurs hooks pour une gestion complète
 */
export function useRoleManager() {
  const queryClient = useQueryClient();

  const assignRole = useAssignRole();
  const revokeRole = useRevokeRole();

  // Fonction utilitaire pour rafraîchir toutes les données des rôles
  const refreshAllRoles = () => {
    queryClient.invalidateQueries({ queryKey: roleKeys.all });
  };

  // Fonction pour précharger les permissions d'un utilisateur
  const prefetchUserPermissions = (userId: string, permissions: Permission[]) => {
    queryClient.prefetchQuery({
      queryKey: [...roleKeys.userPermissions(userId), 'multiple', permissions.sort()],
      queryFn: () => roleApi.checkMultiplePermissions(userId, permissions),
      staleTime: 3 * 60 * 1000,
    });
  };

  // Fonction pour vérifier rapidement une permission (utilise le cache)
  const hasPermission = (userId: string, permission: Permission): boolean | undefined => {
    const cacheKey = [...roleKeys.userPermissions(userId), permission];
    return queryClient.getQueryData(cacheKey) as boolean | undefined;
  };

  return {
    // Mutations
    assignRole,
    revokeRole,
    
    // Actions utilitaires
    refreshAllRoles,
    prefetchUserPermissions,
    hasPermission,
    
    // États des mutations
    isAssigning: assignRole.isPending,
    isRevoking: revokeRole.isPending,
    
    // Erreurs
    assignError: assignRole.error,
    revokeError: revokeRole.error,
  };
}

/**
 * Hook pour l'utilisateur connecté (contexte d'authentification)
 * Simplifié pour l'exemple - à adapter selon votre système d'auth
 */
export function useCurrentUser() {
  // TODO: Remplacer par votre système d'authentification réel
  const currentUserId = 'user-1'; // Mock - récupérer depuis le contexte d'auth
  
  const userRole = useUserRole(currentUserId);
  const userWithRole = useUserWithRole(currentUserId);
  
  return {
    userId: currentUserId,
    ...userRole,
    userWithRole: userWithRole.data,
    isLoadingUser: userRole.isLoading || userWithRole.isLoading,
  };
}

/**
 * Hook pour vérifier si l'utilisateur connecté a une permission
 */
export function useCurrentUserPermission(permission: Permission) {
  const { userId } = useCurrentUser();
  return usePermission(userId, permission);
}

/**
 * Hook pour vérifier plusieurs permissions pour l'utilisateur connecté
 */
export function useCurrentUserPermissions(permissions: Permission[]) {
  const { userId } = useCurrentUser();
  return usePermissions(userId, permissions);
}
