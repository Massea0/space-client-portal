import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { emailService } from '@/services/onboarding/emailService'

// Schéma de validation pour la récupération de mot de passe
const passwordRecoverySchema = z.object({
  email: z.string().email('Email valide requis'),
  employeeNumber: z.string().min(1, 'Numéro employé requis').optional()
})

type PasswordRecoveryForm = z.infer<typeof passwordRecoverySchema>

interface PasswordRecoveryProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function PasswordRecovery({ onSuccess, onCancel }: PasswordRecoveryProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm<PasswordRecoveryForm>({
    resolver: zodResolver(passwordRecoverySchema)
  })

  const onSubmit = async (data: PasswordRecoveryForm) => {
    try {
      setIsSubmitting(true)
      setError(null)

      // Générer un token de récupération
      const recoveryToken = emailService.generateRecoveryToken()
      const recoveryUrl = `${window.location.origin}/reset-password?token=${recoveryToken}&email=${encodeURIComponent(data.email)}`

      // TODO: Vérifier que l'email correspond à un employé existant
      // Pour l'instant, on simule une recherche réussie
      const employeeName = "Employé" // À remplacer par la vraie recherche

      // Envoyer l'email de récupération
      await emailService.sendPasswordRecovery({
        to: data.email,
        employeeName,
        recoveryToken,
        recoveryUrl
      })

      setIsSuccess(true)
      setTimeout(() => {
        onSuccess?.()
      }, 3000)

    } catch (error) {
      console.error('Erreur lors de la récupération:', error)
      setError('Erreur lors de l\'envoi de l\'email de récupération. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Email envoyé !</h3>
              <p className="text-gray-600 mt-2">
                Un email de récupération a été envoyé à <strong>{getValues('email')}</strong>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.
              </p>
            </div>
            
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Le lien de récupération expire dans 1 heure pour des raisons de sécurité.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={onSuccess} 
              variant="outline" 
              className="w-full"
            >
              Retour à la connexion
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Récupération de mot de passe
        </CardTitle>
        <CardDescription>
          Entrez votre email personnel pour recevoir un lien de récupération
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email personnel *</Label>
            <Input
              {...register('email')}
              id="email"
              type="email"
              placeholder="votre.email@exemple.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
            <p className="text-xs text-gray-600">
              Utilisez l'email personnel renseigné lors de votre onboarding
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeNumber">Numéro employé (optionnel)</Label>
            <Input
              {...register('employeeNumber')}
              id="employeeNumber"
              placeholder="EMP-2024-001"
              className={errors.employeeNumber ? 'border-red-500' : ''}
            />
            {errors.employeeNumber && (
              <p className="text-sm text-red-600">{errors.employeeNumber.message}</p>
            )}
            <p className="text-xs text-gray-600">
              Pour une récupération plus rapide (optionnel)
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Un email de récupération sera envoyé si l'adresse correspond à un compte existant.
              Pour des raisons de sécurité, aucune information ne sera affichée ici.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien'}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
            )}
          </div>
        </form>

        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">💡 Conseils de récupération</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Vérifiez vos spams si vous ne recevez pas l'email</li>
            <li>• Le lien expire après 1 heure</li>
            <li>• Contactez le support IT si vous avez perdu l'accès à votre email</li>
            <li>• Vous pouvez demander plusieurs récupérations si nécessaire</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default PasswordRecovery
