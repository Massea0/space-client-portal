import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Department, DepartmentFormData, DepartmentStats, DepartmentFilters, DepartmentWithStats } from '../../types/hr/department';
import { departmentApi } from '../../services/hr/departmentApi';
import { PaginatedResponse } from '../../types/hr';

// Query keys for React Query caching
export const departmentKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentKeys.all, 'list'] as const,
  list: (filters?: DepartmentFilters) => [...departmentKeys.lists(), filters] as const,
  details: () => [...departmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...departmentKeys.details(), id] as const,
  stats: () => [...departmentKeys.all, 'stats'] as const,
  departmentStats: (id: string) => [...departmentKeys.stats(), id] as const,
  allStats: () => [...departmentKeys.stats(), 'all'] as const,
};

/**
 * Hook pour récupérer la liste des départements avec filtres optionnels
 */
export function useDepartments(filters?: DepartmentFilters) {
  return useQuery({
    queryKey: departmentKeys.list(filters),
    queryFn: () => departmentApi.getDepartments(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook pour récupérer un département spécifique par ID
 */
export function useDepartment(id: string) {
  return useQuery({
    queryKey: departmentKeys.detail(id),
    queryFn: () => departmentApi.getDepartmentById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook pour récupérer un département avec ses statistiques
 */
export function useDepartmentWithStats(id: string) {
  return useQuery({
    queryKey: [...departmentKeys.detail(id), 'with-stats'],
    queryFn: () => departmentApi.getDepartmentWithStats(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes for stats
    retry: 2,
  });
}

/**
 * Hook pour récupérer les statistiques d'un département
 */
export function useDepartmentStats(id: string) {
  return useQuery({
    queryKey: departmentKeys.departmentStats(id),
    queryFn: () => departmentApi.getDepartmentStats(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook pour récupérer toutes les statistiques des départements
 */
export function useAllDepartmentStats() {
  return useQuery({
    queryKey: departmentKeys.allStats(),
    queryFn: () => departmentApi.getAllDepartmentStats(),
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook pour créer un nouveau département
 */
export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DepartmentFormData) => departmentApi.createDepartment(data),
    onSuccess: (newDepartment) => {
      // Invalider et refetch les listes de départements
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      
      // Ajouter le nouveau département au cache
      queryClient.setQueryData(
        departmentKeys.detail(newDepartment.id),
        newDepartment
      );

      // Invalider les stats globales
      queryClient.invalidateQueries({ queryKey: departmentKeys.allStats() });
    },
    onError: (error) => {
      console.error('Error creating department:', error);
    },
  });
}

/**
 * Hook pour mettre à jour un département
 */
export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DepartmentFormData> }) =>
      departmentApi.updateDepartment(id, data),
    onSuccess: (updatedDepartment, { id }) => {
      // Mettre à jour le département dans le cache
      queryClient.setQueryData(
        departmentKeys.detail(id),
        updatedDepartment
      );

      // Invalider les listes pour refléter les changements
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      
      // Invalider les stats si nécessaire
      queryClient.invalidateQueries({ queryKey: departmentKeys.departmentStats(id) });
      queryClient.invalidateQueries({ queryKey: departmentKeys.allStats() });
    },
    onError: (error) => {
      console.error('Error updating department:', error);
    },
  });
}

/**
 * Hook pour supprimer un département
 */
export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => departmentApi.deleteDepartment(id),
    onSuccess: (_, id) => {
      // Supprimer le département du cache
      queryClient.removeQueries({ queryKey: departmentKeys.detail(id) });
      
      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      
      // Invalider les stats
      queryClient.invalidateQueries({ queryKey: departmentKeys.departmentStats(id) });
      queryClient.invalidateQueries({ queryKey: departmentKeys.allStats() });
    },
    onError: (error) => {
      console.error('Error deleting department:', error);
    },
  });
}

/**
 * Hook personnalisé pour gérer l'état complet des départements
 * Combine plusieurs hooks pour une gestion complète
 */
export function useDepartmentManager() {
  const queryClient = useQueryClient();

  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();

  // Fonction utilitaire pour rafraîchir toutes les données des départements
  const refreshAllDepartments = () => {
    queryClient.invalidateQueries({ queryKey: departmentKeys.all });
  };

  // Fonction pour précharger un département
  const prefetchDepartment = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: departmentKeys.detail(id),
      queryFn: () => departmentApi.getDepartmentById(id),
      staleTime: 5 * 60 * 1000,
    });
  };

  // Fonction pour précharger les stats d'un département
  const prefetchDepartmentStats = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: departmentKeys.departmentStats(id),
      queryFn: () => departmentApi.getDepartmentStats(id),
      staleTime: 2 * 60 * 1000,
    });
  };

  return {
    // Mutations
    createDepartment,
    updateDepartment,
    deleteDepartment,
    
    // Actions utilitaires
    refreshAllDepartments,
    prefetchDepartment,
    prefetchDepartmentStats,
    
    // États des mutations
    isCreating: createDepartment.isPending,
    isUpdating: updateDepartment.isPending,
    isDeleting: deleteDepartment.isPending,
    
    // Erreurs
    createError: createDepartment.error,
    updateError: updateDepartment.error,
    deleteError: deleteDepartment.error,
  };
}

/**
 * Hook pour récupérer la liste des départements avec leurs statistiques
 */
export function useDepartmentsWithStats(filters?: DepartmentFilters) {
  return useQuery({
    queryKey: [...departmentKeys.list(filters), 'with-stats'],
    queryFn: () => departmentApi.getDepartmentsWithStats(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes for stats
    retry: 2,
  });
}
