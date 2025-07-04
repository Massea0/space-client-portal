import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  FileText, 
  Monitor, 
  GraduationCap, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Mail,
  Send,
  Shield
} from 'lucide-react'
import { Employee } from '@/types/hr'
import { OnboardingProcess, OnboardingStep } from '@/types/onboarding'
import { useEmployee } from '@/hooks/hr/useEmployee'
import { EmployeeOnboardingEnrichment } from './EmployeeOnboardingEnrichment'
import { emailService } from '@/services/onboarding/emailService'

// Types locaux pour simplifier
type StepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'
type CurrentStepType = 'enrichment' | 'documents' | 'material' | 'training' | 'complete'

interface LocalOnboardingStep {
  id: string
  name: string
  status: StepStatus
  order: number
  required: boolean
}

interface OnboardingManagerProps {
  employeeId: string
  onComplete?: () => void
}

export function OnboardingManager({ employeeId, onComplete }: OnboardingManagerProps) {
  const { employee } = useEmployee({ id: employeeId })
  
  // États locaux pour gérer le processus
  const [currentStep, setCurrentStep] = useState<CurrentStepType>('enrichment')
  const [steps, setSteps] = useState<LocalOnboardingStep[]>([
    {
      id: 'enrichment',
      name: 'Enrichissement des données',
      status: 'pending',
      order: 1,
      required: true
    },
    {
      id: 'credentials',
      name: 'Envoi des identifiants',
      status: 'pending',
      order: 2,
      required: true
    },
    {
      id: 'documents',
      name: 'Génération et signature des documents',
      status: 'pending',
      order: 3,
      required: true
    },
    {
      id: 'material',
      name: 'Attribution du matériel',
      status: 'pending',
      order: 4,
      required: false
    },
    {
      id: 'training',
      name: 'Formation et intégration',
      status: 'pending',
      order: 5,
      required: false
    }
  ])

  const [enrichmentCompleted, setEnrichmentCompleted] = useState(false)
  const [credentialsSent, setCredentialsSent] = useState(false)
  const [documentsGenerated, setDocumentsGenerated] = useState(false)
  const [materialAssigned, setMaterialAssigned] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const updateStepStatus = (stepId: string, status: StepStatus) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ))
  }

  const handleEnrichmentComplete = async (data: any) => {
    try {
      setIsLoading(true)
      setEnrichmentCompleted(true)
      updateStepStatus('enrichment', 'completed')
      
      // Simuler l'envoi des identifiants par email personnel
      if (data.personal_email) {
        await sendCredentialsToPersonalEmail(data.personal_email)
        setCredentialsSent(true)
        updateStepStatus('credentials', 'completed')
      }
      
      setCurrentStep('documents')
    } catch (error) {
      console.error('Erreur lors de la finalisation de l\'enrichissement:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendCredentialsToPersonalEmail = async (personalEmail: string) => {
    if (!employee) return;
    
    try {
      // Générer un mot de passe temporaire sécurisé
      const temporaryPassword = emailService.generateTemporaryPassword();
      
      // Envoyer l'email avec les identifiants
      await emailService.sendCredentials({
        to: personalEmail,
        employeeName: `${employee.first_name} ${employee.last_name}`,
        temporaryPassword,
        loginUrl: `${window.location.origin}/login`,
        employeeNumber: employee.employee_number
      });
      
      console.log('✅ Identifiants envoyés avec succès à', personalEmail);
      
      return { temporaryPassword };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des identifiants:', error);
      throw error;
    }
  };



  const handleDocumentsGeneration = async () => {
    try {
      setIsLoading(true)
      
      // Simuler la génération de documents
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setDocumentsGenerated(true)
      updateStepStatus('documents', 'completed')
      setCurrentStep('material')
    } catch (error) {
      console.error('Erreur lors de la génération des documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMaterialAssignment = async () => {
    try {
      setIsLoading(true)
      
      // Simuler l'attribution de matériel
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setMaterialAssigned(true)
      updateStepStatus('material', 'completed')
      setCurrentStep('training')
    } catch (error) {
      console.error('Erreur lors de l\'attribution du matériel:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStepStatus = (stepId: string): StepStatus => {
    const step = steps.find(s => s.id === stepId)
    return step?.status || 'pending'
  }

  const getProgressPercentage = () => {
    const completedSteps = steps.filter(s => s.status === 'completed').length
    return (completedSteps / steps.length) * 100
  }

  const getStepIcon = (stepId: string) => {
    const status = getStepStatus(stepId)
    if (status === 'completed') return <CheckCircle className="h-4 w-4 text-green-600" />
    if (status === 'in_progress') return <Clock className="h-4 w-4 text-blue-600" />
    return <AlertCircle className="h-4 w-4 text-gray-400" />
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Chargement des informations employé...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec informations employé */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <User className="h-6 w-6" />
            Onboarding - {employee.first_name} {employee.last_name}
          </CardTitle>
          <CardDescription>
            Position • Département
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progression globale</span>
              <span className="text-sm text-gray-600">{Math.round(getProgressPercentage())}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="w-full" />
            
            <div className="grid grid-cols-5 gap-2">
              {steps.map((step) => (
                <div key={step.id} className="text-center">
                  <div className="flex justify-center mb-1">
                    {getStepIcon(step.id)}
                  </div>
                  <div className="text-xs text-gray-600 break-words">{step.name}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Étapes d'onboarding */}
      <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="enrichment" disabled={currentStep !== 'enrichment' && !enrichmentCompleted}>
            Enrichissement
          </TabsTrigger>
          <TabsTrigger value="documents" disabled={!enrichmentCompleted}>
            Documents
          </TabsTrigger>
          <TabsTrigger value="material" disabled={getStepStatus('documents') !== 'completed'}>
            Matériel
          </TabsTrigger>
          <TabsTrigger value="training" disabled={getStepStatus('material') !== 'completed'}>
            Formation
          </TabsTrigger>
        </TabsList>

        {/* Étape 1: Enrichissement des données */}
        <TabsContent value="enrichment">
          {!enrichmentCompleted ? (
            <EmployeeOnboardingEnrichment
              employeeId={employeeId}
              onComplete={handleEnrichmentComplete}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">Enrichissement terminé</h3>
                    <p className="text-gray-600">
                      Les informations additionnelles ont été collectées avec succès.
                    </p>
                    {credentialsSent && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-800">
                          <Mail className="h-4 w-4" />
                          <span className="font-medium">Identifiants envoyés</span>
                        </div>
                        <p className="text-sm text-blue-700 mt-1">
                          Les identifiants de connexion ont été envoyés à l'email personnel.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Étape 2: Documents */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Génération et signature des documents
              </CardTitle>
              <CardDescription>
                Contrats, documents administratifs et accords à signer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getStepStatus('documents') === 'completed' ? (
                <div className="text-center space-y-4">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">Documents générés</h3>
                    <p className="text-gray-600">
                      Tous les documents ont été générés et sont prêts pour signature.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      Les documents seront générés automatiquement avec l'IA en utilisant 
                      les informations collectées lors de l'enrichissement.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={handleDocumentsGeneration}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Génération en cours...' : 'Générer les documents'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Étape 3: Matériel */}
        <TabsContent value="material">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Attribution du matériel
              </CardTitle>
              <CardDescription>
                Ordinateur, écran et accessoires selon le poste.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getStepStatus('material') === 'completed' ? (
                <div className="text-center space-y-4">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">Matériel attribué</h3>
                    <p className="text-gray-600">
                      Le matériel a été attribué et sera livré au poste de travail.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Matériel standard prévu :</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• MacBook Pro 14" (ordinateur portable)</li>
                      <li>• Dell 27" 4K (écran externe)</li>
                      <li>• Kit clavier/souris sans fil</li>
                    </ul>
                  </div>
                  
                  <Button 
                    onClick={handleMaterialAssignment}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Attribution en cours...' : 'Attribuer le matériel'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Étape 4: Formation */}
        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Formation et intégration
              </CardTitle>
              <CardDescription>
                Sessions de formation et intégration dans l'équipe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <GraduationCap className="h-4 w-4" />
                <AlertDescription>
                  Cette étape sera mise en place prochainement avec la création 
                  automatique de parcours de formation personnalisés.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <h4 className="font-medium">Formations prévues :</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Présentation de l'entreprise et des valeurs</li>
                  <li>• Formation aux outils internes</li>
                  <li>• Sécurité et conformité</li>
                  <li>• Intégration dans l'équipe</li>
                </ul>
              </div>
              
              <Button 
                onClick={() => {
                  updateStepStatus('training', 'completed')
                  onComplete?.()
                }}
                className="w-full"
              >
                Marquer comme terminé
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
