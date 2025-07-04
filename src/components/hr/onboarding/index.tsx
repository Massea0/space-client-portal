import React from 'react'
import { OnboardingManager } from './OnboardingManager'
import { EmployeeOnboardingEnrichment } from './EmployeeOnboardingEnrichment'
import { PasswordRecovery } from './PasswordRecovery'

// Export des composants principaux
export { OnboardingManager, EmployeeOnboardingEnrichment, PasswordRecovery }

// Composant wrapper pour faciliter l'intégration
interface OnboardingSystemProps {
  employeeId: string
  mode?: 'full' | 'enrichment-only'
  onComplete?: () => void
  onCancel?: () => void
}

export function OnboardingSystem({ 
  employeeId, 
  mode = 'full', 
  onComplete, 
  onCancel 
}: OnboardingSystemProps) {
  if (mode === 'enrichment-only') {
    return (
      <EmployeeOnboardingEnrichment
        employeeId={employeeId}
        onComplete={onComplete}
        onCancel={onCancel}
      />
    )
  }

  return (
    <OnboardingManager
      employeeId={employeeId}
      onComplete={onComplete}
    />
  )
}

// Hook utilitaire pour vérifier l'état d'onboarding
export function useOnboardingStatus(employeeId: string) {
  // TODO: Implémenter la logique de vérification du statut
  // Pour l'instant, retourne un état de base
  return {
    isOnboardingRequired: true,
    isEnrichmentRequired: true,
    currentStep: 'enrichment',
    completionPercentage: 0
  }
}

export default OnboardingSystem
