import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Phone, Mail, MapPin, CreditCard, FileText, Shield, User, Building } from 'lucide-react'
import { Employee } from '@/types/hr'
import { useEmployee } from '@/hooks/hr/useEmployee'

// Schéma de validation pour l'enrichissement des données
const onboardingEnrichmentSchema = z.object({
  personal_email: z.string().email('Email personnel valide requis'),
  emergency_contact: z.object({
    name: z.string().min(2, 'Nom requis'),
    relationship: z.string().min(2, 'Relation requise'),
    phone: z.string().min(10, 'Numéro de téléphone valide requis'),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    secondary_phone: z.string().optional(),
    best_time_to_contact: z.string().optional()
  }),
  administrative_info: z.object({
    social_security_number: z.string().optional(),
    tax_id: z.string().optional(),
    passport_number: z.string().optional(),
    driving_license: z.string().optional(),
    work_permit_status: z.enum(['citizen', 'permanent_resident', 'work_visa', 'other']).optional(),
    work_permit_expiry: z.string().optional()
  }).optional(),
  banking_info: z.object({
    iban: z.string().optional(),
    bic: z.string().optional(),
    bank_name: z.string().optional(),
    account_holder_name: z.string().optional()
  }).optional(),
  preferences: z.object({
    communication_language: z.enum(['fr', 'en', 'es', 'de']).default('fr'),
    notification_preferences: z.object({
      email_notifications: z.boolean().default(true),
      sms_notifications: z.boolean().default(false),
      push_notifications: z.boolean().default(true)
    }).optional(),
    work_preferences: z.object({
      preferred_start_time: z.string().optional(),
      remote_work_preference: z.enum(['office', 'remote', 'hybrid']).optional(),
      equipment_preferences: z.record(z.any()).optional(),
      accessibility_needs: z.array(z.string()).optional(),
      dietary_restrictions: z.array(z.string()).optional()
    }).optional()
  }).optional(),
  documents_consent: z.object({
    data_processing_consent: z.boolean().refine(val => val === true, 'Consentement requis'),
    background_check_consent: z.boolean().optional(),
    photo_consent: z.boolean().optional(),
    emergency_contact_consent: z.boolean().refine(val => val === true, 'Consentement requis')
  })
})

type OnboardingEnrichmentForm = z.infer<typeof onboardingEnrichmentSchema>

interface EmployeeOnboardingEnrichmentProps {
  employeeId: string
  onComplete?: (data: OnboardingEnrichmentForm) => void
  onCancel?: () => void
}

export function EmployeeOnboardingEnrichment({ 
  employeeId, 
  onComplete, 
  onCancel 
}: EmployeeOnboardingEnrichmentProps) {
  const { employee, enrichForOnboarding, isEnriching } = useEmployee({ id: employeeId })
  const [currentTab, setCurrentTab] = useState('personal')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, dirtyFields },
    watch,
    setValue,
    getValues
  } = useForm<OnboardingEnrichmentForm>({
    resolver: zodResolver(onboardingEnrichmentSchema),
    defaultValues: {
      personal_email: employee?.personal_email || '',
      emergency_contact: {
        name: employee?.emergency_contact?.name || '',
        relationship: employee?.emergency_contact?.relationship || '',
        phone: employee?.emergency_contact?.phone || '',
        email: employee?.emergency_contact?.email || '',
        address: employee?.emergency_contact?.address || '',
        secondary_phone: '',
        best_time_to_contact: ''
      },
      administrative_info: {
        work_permit_status: 'citizen'
      },
      preferences: {
        communication_language: 'fr',
        notification_preferences: {
          email_notifications: true,
          sms_notifications: false,
          push_notifications: true
        },
        work_preferences: {
          remote_work_preference: 'hybrid'
        }
      },
      documents_consent: {
        data_processing_consent: false,
        background_check_consent: false,
        photo_consent: false,
        emergency_contact_consent: false
      }
    }
  })

  // Pré-remplir les données existantes
  useEffect(() => {
    if (employee) {
      setValue('personal_email', employee.personal_email || '')
      if (employee.emergency_contact) {
        setValue('emergency_contact.name', employee.emergency_contact.name)
        setValue('emergency_contact.relationship', employee.emergency_contact.relationship)
        setValue('emergency_contact.phone', employee.emergency_contact.phone)
        setValue('emergency_contact.email', employee.emergency_contact.email || '')
        setValue('emergency_contact.address', employee.emergency_contact.address || '')
      }
    }
  }, [employee, setValue])

  const onSubmit = async (data: OnboardingEnrichmentForm) => {
    try {
      setIsSubmitting(true)
      
      // Vérifier que les champs requis du contact d'urgence sont renseignés
      const emergencyContact = data.emergency_contact
      if (emergencyContact && (!emergencyContact.name || !emergencyContact.relationship || !emergencyContact.phone)) {
        throw new Error('Les champs nom, relation et téléphone du contact d\'urgence sont obligatoires')
      }
      
      // Enrichir les données employé
      await enrichForOnboarding({
        personal_email: data.personal_email,
        emergency_contact: emergencyContact ? {
          name: emergencyContact.name!,
          relationship: emergencyContact.relationship!,
          phone: emergencyContact.phone!,
          email: emergencyContact.email,
          address: emergencyContact.address,
          secondary_phone: emergencyContact.secondary_phone,
          best_time_to_contact: emergencyContact.best_time_to_contact
        } : undefined,
        work_preferences: data.preferences?.work_preferences || {}
      })

      onComplete?.(data)
    } catch (error) {
      console.error('Erreur lors de l\'enrichissement:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTabStatus = (tabName: string) => {
    const fields = {
      personal: ['personal_email'],
      emergency: ['emergency_contact.name', 'emergency_contact.relationship', 'emergency_contact.phone'],
      administrative: [],
      banking: [],
      preferences: [],
      consent: ['documents_consent.data_processing_consent', 'documents_consent.emergency_contact_consent']
    }

    const tabFields = fields[tabName as keyof typeof fields] || []
    const hasErrors = tabFields.some(field => {
      const keys = field.split('.')
      let current: any = errors
      for (const key of keys) {
        current = current?.[key]
      }
      return !!current
    })

    const isDirty = tabFields.some(field => {
      const keys = field.split('.')
      let current: any = dirtyFields
      for (const key of keys) {
        current = current?.[key]
      }
      return !!current
    })

    if (hasErrors) return 'error'
    if (isDirty) return 'complete'
    return 'pending'
  }

  const TabBadge = ({ status }: { status: string }) => {
    const variants = {
      error: 'destructive',
      complete: 'default',
      pending: 'secondary'
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'} className="ml-2 h-4 w-4 p-0" />
  }

  if (!employee) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Chargement des informations employé...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Enrichissement des données d'onboarding
          </CardTitle>
          <CardDescription>
            Complétez les informations pour {employee.first_name} {employee.last_name} 
            afin de préparer son processus d'onboarding optimal.
          </CardDescription>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="personal" className="flex items-center">
              Contact Personnel
              <TabBadge status={getTabStatus('personal')} />
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center">
              Contact Urgence
              <TabBadge status={getTabStatus('emergency')} />
            </TabsTrigger>
            <TabsTrigger value="administrative">
              Administratif
              <TabBadge status={getTabStatus('administrative')} />
            </TabsTrigger>
            <TabsTrigger value="banking">
              Bancaire
              <TabBadge status={getTabStatus('banking')} />
            </TabsTrigger>
            <TabsTrigger value="preferences">
              Préférences
              <TabBadge status={getTabStatus('preferences')} />
            </TabsTrigger>
            <TabsTrigger value="consent">
              Consentements
              <TabBadge status={getTabStatus('consent')} />
            </TabsTrigger>
          </TabsList>

          {/* Onglet Contact Personnel */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Informations de contact personnel
                </CardTitle>
                <CardDescription>
                  L'email personnel est essentiel pour l'envoi des identifiants et documents d'onboarding.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="personal_email">Email personnel *</Label>
                  <Controller
                    name="personal_email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="personal_email"
                        type="email"
                        placeholder="nom@email.com"
                        className={errors.personal_email ? 'border-red-500' : ''}
                      />
                    )}
                  />
                  {errors.personal_email && (
                    <p className="text-sm text-red-600">{errors.personal_email.message}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    Cet email sera utilisé pour envoyer les identifiants, documents à signer et communications importantes.
                  </p>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    L'email personnel ne sera utilisé que pour le processus d'onboarding et les communications officielles. 
                    Conformément au RGPD, ces données sont protégées et peuvent être supprimées sur demande.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Contact d'urgence */}
          <TabsContent value="emergency">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact d'urgence
                </CardTitle>
                <CardDescription>
                  Personne à contacter en cas d'urgence pendant les heures de travail.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_name">Nom complet *</Label>
                    <Controller
                      name="emergency_contact.name"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="emergency_name"
                          placeholder="Prénom Nom"
                          className={errors.emergency_contact?.name ? 'border-red-500' : ''}
                        />
                      )}
                    />
                    {errors.emergency_contact?.name && (
                      <p className="text-sm text-red-600">{errors.emergency_contact.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency_relationship">Relation *</Label>
                    <Controller
                      name="emergency_contact.relationship"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={errors.emergency_contact?.relationship ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conjoint">Conjoint(e)</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="enfant">Enfant</SelectItem>
                            <SelectItem value="frere_soeur">Frère/Sœur</SelectItem>
                            <SelectItem value="ami">Ami(e)</SelectItem>
                            <SelectItem value="autre">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.emergency_contact?.relationship && (
                      <p className="text-sm text-red-600">{errors.emergency_contact.relationship.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_phone">Téléphone principal *</Label>
                    <Controller
                      name="emergency_contact.phone"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="emergency_phone"
                          type="tel"
                          placeholder="+33 6 12 34 56 78"
                          className={errors.emergency_contact?.phone ? 'border-red-500' : ''}
                        />
                      )}
                    />
                    {errors.emergency_contact?.phone && (
                      <p className="text-sm text-red-600">{errors.emergency_contact.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency_secondary_phone">Téléphone secondaire</Label>
                    <Controller
                      name="emergency_contact.secondary_phone"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="emergency_secondary_phone"
                          type="tel"
                          placeholder="+33 1 23 45 67 89"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_email">Email</Label>
                  <Controller
                    name="emergency_contact.email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="emergency_email"
                        type="email"
                        placeholder="contact@email.com"
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_address">Adresse</Label>
                  <Controller
                    name="emergency_contact.address"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        id="emergency_address"
                        placeholder="Adresse complète"
                        rows={3}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="best_time_contact">Meilleur moment pour contacter</Label>
                  <Controller
                    name="emergency_contact.best_time_to_contact"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="matin">Matin (8h-12h)</SelectItem>
                          <SelectItem value="apres_midi">Après-midi (12h-18h)</SelectItem>
                          <SelectItem value="soir">Soir (18h-22h)</SelectItem>
                          <SelectItem value="toujours">N'importe quand</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Administratif */}
          <TabsContent value="administrative">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Informations administratives
                </CardTitle>
                <CardDescription>
                  Documents et informations nécessaires pour l'administration RH.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="social_security">Numéro de sécurité sociale</Label>
                    <Controller
                      name="administrative_info.social_security_number"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="social_security"
                          placeholder="1 23 45 67 890 123 45"
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax_id">Numéro fiscal</Label>
                    <Controller
                      name="administrative_info.tax_id"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="tax_id"
                          placeholder="Numéro fiscal"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passport">Numéro de passeport</Label>
                    <Controller
                      name="administrative_info.passport_number"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="passport"
                          placeholder="12AB34567"
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="driving_license">Permis de conduire</Label>
                    <Controller
                      name="administrative_info.driving_license"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="driving_license"
                          placeholder="Numéro de permis"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="work_permit_status">Statut de travail</Label>
                    <Controller
                      name="administrative_info.work_permit_status"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="citizen">Citoyen français</SelectItem>
                            <SelectItem value="permanent_resident">Résident permanent UE</SelectItem>
                            <SelectItem value="work_visa">Visa de travail</SelectItem>
                            <SelectItem value="other">Autre statut</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="work_permit_expiry">Date d'expiration (si applicable)</Label>
                    <Controller
                      name="administrative_info.work_permit_expiry"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="work_permit_expiry"
                          type="date"
                        />
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Bancaire */}
          <TabsContent value="banking">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Informations bancaires
                </CardTitle>
                <CardDescription>
                  Coordonnées bancaires pour le versement du salaire.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Ces informations sont hautement confidentielles et sécurisées selon les standards bancaires.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN</Label>
                  <Controller
                    name="banking_info.iban"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="iban"
                        placeholder="FR76 1234 5678 9012 3456 789"
                        className="font-mono"
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bic">Code BIC/SWIFT</Label>
                    <Controller
                      name="banking_info.bic"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="bic"
                          placeholder="ABCDFRPP"
                          className="font-mono"
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bank_name">Nom de la banque</Label>
                    <Controller
                      name="banking_info.bank_name"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="bank_name"
                          placeholder="Nom de votre banque"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account_holder">Titulaire du compte</Label>
                  <Controller
                    name="banking_info.account_holder_name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="account_holder"
                        placeholder="Nom exact sur le compte bancaire"
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Préférences */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Préférences de travail
                </CardTitle>
                <CardDescription>
                  Configuration personnalisée pour optimiser votre expérience de travail.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Communication</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="communication_language">Langue de communication</Label>
                      <Controller
                        name="preferences.communication_language"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fr">Français</SelectItem>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Español</SelectItem>
                              <SelectItem value="de">Deutsch</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Notifications préférées</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Controller
                          name="preferences.notification_preferences.email_notifications"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <Label className="text-sm">Notifications par email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Controller
                          name="preferences.notification_preferences.sms_notifications"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <Label className="text-sm">Notifications SMS</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Controller
                          name="preferences.notification_preferences.push_notifications"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <Label className="text-sm">Notifications push</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Organisation du travail</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="remote_work_preference">Mode de travail préféré</Label>
                      <Controller
                        name="preferences.work_preferences.remote_work_preference"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="office">Bureau uniquement</SelectItem>
                              <SelectItem value="remote">Télétravail complet</SelectItem>
                              <SelectItem value="hybrid">Hybride</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="start_time">Heure de début préférée</Label>
                      <Controller
                        name="preferences.work_preferences.preferred_start_time"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="08:00">08:00</SelectItem>
                              <SelectItem value="08:30">08:30</SelectItem>
                              <SelectItem value="09:00">09:00</SelectItem>
                              <SelectItem value="09:30">09:30</SelectItem>
                              <SelectItem value="10:00">10:00</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Consentements */}
          <TabsContent value="consent">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Consentements et autorisations
                </CardTitle>
                <CardDescription>
                  Autorisations légales requises pour le processus d'onboarding.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Controller
                      name="documents_consent.data_processing_consent"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className={errors.documents_consent?.data_processing_consent ? 'border-red-500' : ''}
                        />
                      )}
                    />
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">
                        Traitement des données personnelles *
                      </Label>
                      <p className="text-sm text-gray-600">
                        J'autorise le traitement de mes données personnelles conformément au RGPD 
                        pour les besoins de mon onboarding et de ma gestion RH.
                      </p>
                    </div>
                  </div>
                  {errors.documents_consent?.data_processing_consent && (
                    <p className="text-sm text-red-600">{errors.documents_consent.data_processing_consent.message}</p>
                  )}

                  <div className="flex items-start space-x-3">
                    <Controller
                      name="documents_consent.emergency_contact_consent"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className={errors.documents_consent?.emergency_contact_consent ? 'border-red-500' : ''}
                        />
                      )}
                    />
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">
                        Contact d'urgence *
                      </Label>
                      <p className="text-sm text-gray-600">
                        J'autorise l'entreprise à contacter la personne désignée en cas d'urgence 
                        pendant mes heures de travail.
                      </p>
                    </div>
                  </div>
                  {errors.documents_consent?.emergency_contact_consent && (
                    <p className="text-sm text-red-600">{errors.documents_consent.emergency_contact_consent.message}</p>
                  )}

                  <div className="flex items-start space-x-3">
                    <Controller
                      name="documents_consent.background_check_consent"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">
                        Vérification des antécédents
                      </Label>
                      <p className="text-sm text-gray-600">
                        J'autorise la vérification de mes références professionnelles et éducatives.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Controller
                      name="documents_consent.photo_consent"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">
                        Utilisation de photos
                      </Label>
                      <p className="text-sm text-gray-600">
                        J'autorise l'utilisation de ma photo pour le trombinoscope interne 
                        et les supports de communication internes.
                      </p>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Vous pouvez retirer ces consentements à tout moment en contactant le service RH. 
                    Certains consentements sont nécessaires pour votre onboarding et votre emploi.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Annuler
          </Button>

          <div className="space-x-2">
            {currentTab !== 'personal' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const tabs = ['personal', 'emergency', 'administrative', 'banking', 'preferences', 'consent']
                  const currentIndex = tabs.indexOf(currentTab)
                  if (currentIndex > 0) {
                    setCurrentTab(tabs[currentIndex - 1])
                  }
                }}
              >
                Précédent
              </Button>
            )}
            
            {currentTab !== 'consent' ? (
              <Button
                type="button"
                onClick={() => {
                  const tabs = ['personal', 'emergency', 'administrative', 'banking', 'preferences', 'consent']
                  const currentIndex = tabs.indexOf(currentTab)
                  if (currentIndex < tabs.length - 1) {
                    setCurrentTab(tabs[currentIndex + 1])
                  }
                }}
              >
                Suivant
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!isValid || isSubmitting || isEnriching}
                className="min-w-[120px]"
              >
                {isSubmitting || isEnriching ? 'Enregistrement...' : 'Terminer'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
