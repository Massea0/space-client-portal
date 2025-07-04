# 🚀 Guide d'intégration du système d'onboarding

## 📋 Utilisation des composants

### 1. Processus d'onboarding complet

```tsx
import React from 'react'
import { OnboardingSystem } from '@/components/hr/onboarding'

function EmployeePage({ employeeId }: { employeeId: string }) {
  const handleOnboardingComplete = () => {
    console.log('✅ Onboarding terminé pour l\'employé', employeeId)
    // Rediriger vers le dashboard, envoyer notification, etc.
  }

  return (
    <div className="container mx-auto p-6">
      <OnboardingSystem 
        employeeId={employeeId}
        mode="full"
        onComplete={handleOnboardingComplete}
      />
    </div>
  )
}
```

### 2. Enrichissement seul

```tsx
import React from 'react'
import { OnboardingSystem } from '@/components/hr/onboarding'

function EnrichmentModal({ employeeId, isOpen, onClose }: {
  employeeId: string
  isOpen: boolean
  onClose: () => void
}) {
  const handleEnrichmentComplete = (data: any) => {
    console.log('📝 Données enrichies:', data)
    // Sauvegarder les données, passer à l'étape suivante
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <OnboardingSystem 
          employeeId={employeeId}
          mode="enrichment-only"
          onComplete={handleEnrichmentComplete}
          onCancel={onClose}
        />
      </div>
    </div>
  )
}
```

### 3. Récupération de mot de passe

```tsx
import React from 'react'
import { PasswordRecovery } from '@/components/hr/onboarding'
import { useNavigate } from 'react-router-dom'

function ForgotPasswordPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <PasswordRecovery 
        onSuccess={() => navigate('/login')}
        onCancel={() => navigate('/login')}
      />
    </div>
  )
}
```

## 🔧 Configuration des services

### Service d'email personnalisé

```tsx
// src/services/onboarding/customEmailService.ts
import { EmailService } from './emailService'

class CustomEmailService extends EmailService {
  async sendCredentials(data: EmailCredentials): Promise<void> {
    // Intégrer avec SendGrid, Mailgun, etc.
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: data.to,
        subject: 'Vos identifiants de connexion',
        html: this.generateCredentialsEmail(data)
      })
    })

    if (!response.ok) {
      throw new Error('Échec de l\'envoi d\'email')
    }
  }
}

export const emailService = new CustomEmailService()
```

### Hook d'onboarding avec API réelle

```tsx
// src/hooks/onboarding/useOnboardingApi.ts
import { useMutation, useQuery } from '@tanstack/react-query'

export function useOnboardingApi(employeeId: string) {
  const { data: process, isLoading } = useQuery({
    queryKey: ['onboarding', employeeId],
    queryFn: () => fetch(`/api/onboarding/${employeeId}`).then(r => r.json())
  })

  const updateStep = useMutation({
    mutationFn: ({ stepId, status }: { stepId: string, status: string }) =>
      fetch(`/api/onboarding/${employeeId}/steps/${stepId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
  })

  return { process, isLoading, updateStep: updateStep.mutate }
}
```

## 🎨 Personnalisation UI

### Thème custom

```tsx
// src/components/hr/onboarding/CustomOnboarding.tsx
import { OnboardingManager } from './OnboardingManager'

function CustomOnboardingManager({ employeeId }: { employeeId: string }) {
  return (
    <div className="custom-onboarding-theme">
      <style jsx>{`
        .custom-onboarding-theme {
          --primary-color: #your-brand-color;
          --secondary-color: #your-secondary-color;
        }
        .custom-onboarding-theme .card {
          border: 2px solid var(--primary-color);
        }
      `}</style>
      
      <OnboardingManager employeeId={employeeId} />
    </div>
  )
}
```

### Composants wrapper

```tsx
// src/components/hr/onboarding/BrandedOnboarding.tsx
import React from 'react'
import { OnboardingSystem } from './index'

interface BrandedOnboardingProps {
  employeeId: string
  companyLogo?: string
  primaryColor?: string
  onComplete?: () => void
}

export function BrandedOnboarding({ 
  employeeId, 
  companyLogo, 
  primaryColor = '#2563eb',
  onComplete 
}: BrandedOnboardingProps) {
  return (
    <div style={{ '--primary-color': primaryColor } as React.CSSProperties}>
      {companyLogo && (
        <div className="text-center mb-6">
          <img src={companyLogo} alt="Logo" className="h-16 mx-auto" />
        </div>
      )}
      
      <OnboardingSystem 
        employeeId={employeeId}
        mode="full"
        onComplete={onComplete}
      />
    </div>
  )
}
```

## 📊 Analytics et tracking

### Hook de tracking

```tsx
// src/hooks/analytics/useOnboardingAnalytics.ts
export function useOnboardingAnalytics(employeeId: string) {
  const trackStepStart = (stepId: string) => {
    analytics.track('Onboarding Step Started', {
      employeeId,
      stepId,
      timestamp: new Date().toISOString()
    })
  }

  const trackStepComplete = (stepId: string, duration: number) => {
    analytics.track('Onboarding Step Completed', {
      employeeId,
      stepId,
      duration,
      timestamp: new Date().toISOString()
    })
  }

  const trackError = (stepId: string, error: string) => {
    analytics.track('Onboarding Error', {
      employeeId,
      stepId,
      error,
      timestamp: new Date().toISOString()
    })
  }

  return { trackStepStart, trackStepComplete, trackError }
}
```

### Métriques dashboard

```tsx
// src/components/hr/analytics/OnboardingDashboard.tsx
import React from 'react'
import { useQuery } from '@tanstack/react-query'

function OnboardingDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['onboarding-stats'],
    queryFn: () => fetch('/api/onboarding/stats').then(r => r.json())
  })

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold">En cours</h3>
        <p className="text-3xl font-bold text-blue-600">{stats?.inProgress}</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold">Terminés</h3>
        <p className="text-3xl font-bold text-green-600">{stats?.completed}</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold">Temps moyen</h3>
        <p className="text-3xl font-bold text-purple-600">{stats?.avgDuration}j</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold">Satisfaction</h3>
        <p className="text-3xl font-bold text-yellow-600">{stats?.satisfaction}/5</p>
      </div>
    </div>
  )
}
```

## 🧪 Tests d'intégration

### Test du formulaire

```tsx
// src/components/hr/onboarding/__tests__/OnboardingEnrichment.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EmployeeOnboardingEnrichment } from '../EmployeeOnboardingEnrichment'

describe('EmployeeOnboardingEnrichment', () => {
  it('should validate required fields', async () => {
    const onComplete = jest.fn()
    
    render(
      <EmployeeOnboardingEnrichment 
        employeeId="test-id" 
        onComplete={onComplete}
      />
    )

    const submitButton = screen.getByText('Suivant')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email personnel valide requis')).toBeInTheDocument()
    })
  })

  it('should submit form with valid data', async () => {
    const onComplete = jest.fn()
    
    render(
      <EmployeeOnboardingEnrichment 
        employeeId="test-id" 
        onComplete={onComplete}
      />
    )

    // Remplir le formulaire
    fireEvent.change(screen.getByPlaceholderText('email@exemple.com'), {
      target: { value: 'test@example.com' }
    })

    // Submit
    fireEvent.click(screen.getByText('Finaliser l\'enrichissement'))

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({
        personal_email: 'test@example.com'
      }))
    })
  })
})
```

### Test du service email

```tsx
// src/services/onboarding/__tests__/emailService.test.ts
import { emailService } from '../emailService'

describe('EmailService', () => {
  it('should generate secure passwords', () => {
    const password = emailService.generateTemporaryPassword()
    
    expect(password).toHaveLength(12)
    expect(password).toMatch(/[A-Z]/) // Majuscule
    expect(password).toMatch(/[a-z]/) // Minuscule
    expect(password).toMatch(/[0-9]/) // Chiffre
    expect(password).toMatch(/[!@#$%^&*]/) // Caractère spécial
  })

  it('should generate valid recovery tokens', () => {
    const token = emailService.generateRecoveryToken()
    
    expect(token).toHaveLength(32)
    expect(token).toMatch(/^[A-Za-z0-9]+$/)
  })
})
```

## 🔄 Workflow d'intégration

### 1. Installation
```bash
# Installer les dépendances (déjà fait)
npm install react-hook-form @hookform/resolvers zod

# Copier les composants dans votre projet
cp -r src/components/hr/onboarding/* your-project/src/components/hr/onboarding/
cp -r src/services/onboarding/* your-project/src/services/onboarding/
cp -r src/types/onboarding/* your-project/src/types/onboarding/
```

### 2. Configuration
```tsx
// your-project/src/App.tsx
import { OnboardingSystem, PasswordRecovery } from '@/components/hr/onboarding'

// Ajouter les routes
<Route path="/onboarding/:employeeId" element={<OnboardingPage />} />
<Route path="/forgot-password" element={<ForgotPasswordPage />} />
```

### 3. Personnalisation
- Adapter les couleurs et styles selon votre charte graphique
- Intégrer vos services d'email et base de données
- Ajouter vos analytics et métriques
- Customiser les templates d'email

### 4. Déploiement
- Tests unitaires et d'intégration
- Tests utilisateurs
- Déploiement progressif
- Monitoring et métriques

## 🎉 Résultat final

Un système d'onboarding RH complet, sécurisé et professionnel, prêt pour la production ! 🚀
