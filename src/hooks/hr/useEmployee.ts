import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Employee, EmployeeCreateInput, EmployeeUpdateInput } from '@/types/hr'
import { OnboardingProcess } from '@/types/onboarding'
import { employeeApi } from '@/services/hr/employeeApi'
import { onboardingApi } from '@/services/onboarding/onboardingApi'

interface UseEmployeeOptions {
  id?: string
  enabled?: boolean
}

interface UseEmployeeReturn {
  employee: Employee | null
  onboardingProcess: OnboardingProcess | null
  loading: boolean
  error: Error | null
  updateEmployee: (data: EmployeeUpdateInput) => Promise<Employee>
  deleteEmployee: () => Promise<void>
  enrichForOnboarding: (additionalData: EmployeeOnboardingData) => Promise<Employee>
  initializeOnboarding: (templateId?: string) => Promise<OnboardingProcess>
  isUpdating: boolean
  isDeleting: boolean
  isEnriching: boolean
  isInitializingOnboarding: boolean
}

interface EmployeeOnboardingData {
  personal_email?: string
  emergency_contact?: {
    name: string
    relationship: string
    phone: string
    email?: string
    address?: string
    secondary_phone?: string
    best_time_to_contact?: string
  }
  work_preferences?: Record<string, any>
  notes?: string
}

// Extension temporaire pour l'onboarding
interface ExtendedEmployeeUpdateInput extends EmployeeUpdateInput {
  personal_email?: string
  emergency_contact?: {
    name: string
    relationship: string
    phone: string
    email?: string
    address?: string
    secondary_phone?: string
    best_time_to_contact?: string
  }
  work_preferences?: Record<string, any>
}

export function useEmployee({ id, enabled = true }: UseEmployeeOptions): UseEmployeeReturn {
  const queryClient = useQueryClient()
  
  // Query pour récupérer un employé
  const {
    data: employee,
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => {
      if (!id) throw new Error('Employee ID is required')
      return employeeApi.getById(id)
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3
  })

  // Query pour récupérer le processus d'onboarding associé (simplifié pour l'instant)
  const onboardingProcess = null // TODO: Implémenter une fois que l'API sera adaptée
  const onboardingLoading = false

  // Mutation pour mettre à jour un employé
  const updateMutation = useMutation({
    mutationFn: async (data: EmployeeUpdateInput) => {
      if (!id) throw new Error('Employee ID is required')
      return employeeApi.update(id, data)
    },
    onSuccess: (updatedEmployee) => {
      // Invalider et mettre à jour le cache
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.setQueryData(['employee', id], updatedEmployee)
      
      // Optionnel: notification de succès
      console.log('Employé mis à jour avec succès')
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour:', error)
    }
  })

  // Mutation pour supprimer un employé
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('Employee ID is required')
      return employeeApi.delete(id)
    },
    onSuccess: () => {
      // Invalider le cache et naviguer
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.removeQueries({ queryKey: ['employee', id] })
      
      console.log('Employé supprimé avec succès')
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression:', error)
    }
  })

  // Mutation pour enrichir les données d'onboarding
  const enrichMutation = useMutation({
    mutationFn: async (additionalData: EmployeeOnboardingData) => {
      if (!id) throw new Error('Employee ID is required')
      
      // Préparer les données d'enrichissement avec les champs supportés
      const enrichmentData: ExtendedEmployeeUpdateInput = {
        personal_email: additionalData.personal_email,
        emergency_contact: additionalData.emergency_contact,
        work_preferences: {
          ...employee?.work_preferences,
          ...additionalData.work_preferences
        }
      }
      
      // Cast temporaire pour contourner les limitations de type
      return employeeApi.update(id, enrichmentData as EmployeeUpdateInput)
    },
    onSuccess: (enrichedEmployee) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.setQueryData(['employee', id], enrichedEmployee)
      console.log('Données d\'onboarding enrichies avec succès')
    },
    onError: (error) => {
      console.error('Erreur lors de l\'enrichissement:', error)
    }
  })

  // Mutation pour initialiser le processus d'onboarding
  const initializeOnboardingMutation = useMutation({
    mutationFn: async (templateId?: string) => {
      if (!id || !employee) throw new Error('Employee ID and data are required')
      
      // Utiliser la méthode correcte de l'API
      return onboardingApi.createOnboardingProcess(id, templateId)
    },
    onSuccess: (newProcess) => {
      queryClient.invalidateQueries({ queryKey: ['employee-onboarding', id] })
      queryClient.invalidateQueries({ queryKey: ['onboarding-processes'] })
      console.log('Processus d\'onboarding initialisé avec succès')
    },
    onError: (error) => {
      console.error('Erreur lors de l\'initialisation de l\'onboarding:', error)
    }
  })

  return {
    employee: employee || null,
    onboardingProcess: onboardingProcess || null,
    loading: loading || onboardingLoading,
    error: error as Error | null,
    updateEmployee: updateMutation.mutateAsync,
    deleteEmployee: deleteMutation.mutateAsync,
    enrichForOnboarding: enrichMutation.mutateAsync,
    initializeOnboarding: initializeOnboardingMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isEnriching: enrichMutation.isPending,
    isInitializingOnboarding: initializeOnboardingMutation.isPending
  }
}

// Hook pour créer un nouvel employé
interface UseCreateEmployeeReturn {
  createEmployee: (data: EmployeeCreateInput) => Promise<Employee>
  isCreating: boolean
  error: Error | null
}

export function useCreateEmployee(): UseCreateEmployeeReturn {
  const queryClient = useQueryClient()
  
  const createMutation = useMutation({
    mutationFn: async (data: EmployeeCreateInput) => {
      return employeeApi.create(data)
    },
    onSuccess: (newEmployee) => {
      // Invalider le cache des employés
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      
      // Ajouter le nouvel employé au cache
      queryClient.setQueryData(['employee', newEmployee.id], newEmployee)
      
      console.log('Employé créé avec succès')
    },
    onError: (error) => {
      console.error('Erreur lors de la création:', error)
    }
  })

  return {
    createEmployee: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    error: createMutation.error as Error | null
  }
}
