import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building, 
  Users, 
  DollarSign,
  FileText,
  Clock,
  Award,
  Globe,
  Settings
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { useEmployee } from "@/hooks/hr/useEmployee"
import { EmployeeStatus } from "@/components/ui/hr/EmployeeStatus"

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
}

const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, delay: 0.1 } }
}

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  
  const { employee, loading, error } = useEmployee({ id })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Erreur</h1>
            <p className="text-muted-foreground mt-2">
              {error?.message || 'Employé non trouvé'}
            </p>
            <Button 
              onClick={() => navigate('/hr/employees')} 
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatSalary = (salary: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(salary)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getTenureYears = () => {
    const hireDate = new Date(employee.hire_date)
    const now = new Date()
    const years = now.getFullYear() - hireDate.getFullYear()
    return years
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-6"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          variants={cardVariants}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/hr/employees')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {employee.first_name} {employee.last_name}
              </h1>
              <p className="text-muted-foreground">
                {employee.position?.title || 'Position non définie'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Générer rapport
            </Button>
            <Button onClick={() => navigate(`/hr/employees/${id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </div>
        </motion.div>

        {/* Profil Header */}
        <motion.div variants={cardVariants}>
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Avatar et infos principales */}
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                  <Avatar className="h-32 w-32">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl">
                      {getInitials(employee.first_name, employee.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="text-center lg:text-left space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {employee.first_name} {employee.last_name}
                      </h2>
                      <p className="text-lg text-muted-foreground">
                        {employee.position?.title || 'Position non définie'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-muted-foreground">ID:</span>
                        <Badge variant="outline">{employee.employee_number}</Badge>
                        <EmployeeStatus status={employee.employment_status} />
                      </div>
                    </div>
                    
                    {/* Informations de contact */}
                    <div className="space-y-2">
                      {(employee.work_email || employee.personal_email) && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{employee.work_email || employee.personal_email}</span>
                        </div>
                      )}
                      
                      {(employee.work_phone || employee.personal_phone) && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{employee.work_phone || employee.personal_phone}</span>
                        </div>
                      )}
                      
                      {employee.address && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{employee.address.city}, {employee.address.country}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Métriques rapides */}
                <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {getTenureYears()}
                    </div>
                    <div className="text-sm text-muted-foreground">Années</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {employee.performance_score.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Performance</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {employee.vacation_days_total - employee.vacation_days_used}
                    </div>
                    <div className="text-sm text-muted-foreground">Congés restants</div>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {employee.reports_count}
                    </div>
                    <div className="text-sm text-muted-foreground">Subordonnés</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Onglets de détail */}
        <motion.div variants={cardVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="employment">Emploi</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informations personnelles */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Informations personnelles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Prénom:</span>
                        <div className="text-muted-foreground">{employee.first_name}</div>
                      </div>
                      <div>
                        <span className="font-medium">Nom:</span>
                        <div className="text-muted-foreground">{employee.last_name}</div>
                      </div>
                      {employee.date_of_birth && (
                        <div>
                          <span className="font-medium">Date de naissance:</span>
                          <div className="text-muted-foreground">{formatDate(employee.date_of_birth)}</div>
                        </div>
                      )}
                      {employee.nationality && (
                        <div>
                          <span className="font-medium">Nationalité:</span>
                          <div className="text-muted-foreground">{employee.nationality}</div>
                        </div>
                      )}
                    </div>
                    
                    {employee.emergency_contact && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-2">Contact d'urgence</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Nom:</span>
                              <span className="ml-2 text-muted-foreground">{employee.emergency_contact.name}</span>
                            </div>
                            <div>
                              <span className="font-medium">Relation:</span>
                              <span className="ml-2 text-muted-foreground">{employee.emergency_contact.relationship}</span>
                            </div>
                            <div>
                              <span className="font-medium">Téléphone:</span>
                              <span className="ml-2 text-muted-foreground">{employee.emergency_contact.phone}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Informations organisationnelles */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Organisation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Département:</span>
                        <div className="text-muted-foreground">{employee.department?.name || 'Non défini'}</div>
                      </div>
                      <div>
                        <span className="font-medium">Poste:</span>
                        <div className="text-muted-foreground">{employee.position?.title || 'Non défini'}</div>
                      </div>
                      <div>
                        <span className="font-medium">Branche:</span>
                        <div className="text-muted-foreground">{employee.branch?.name || 'Non défini'}</div>
                      </div>
                      <div>
                        <span className="font-medium">Manager:</span>
                        <div className="text-muted-foreground">
                          {employee.manager ? 
                            `${employee.manager.first_name} ${employee.manager.last_name}` : 
                            'Aucun'
                          }
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Équipe:</span>
                        <div className="text-muted-foreground">{employee.reports_count} personne(s)</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="employment" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informations d'emploi */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Détails de l'emploi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Date d'embauche:</span>
                        <div className="text-muted-foreground">{formatDate(employee.hire_date)}</div>
                      </div>
                      <div>
                        <span className="font-medium">Date de début:</span>
                        <div className="text-muted-foreground">{formatDate(employee.start_date)}</div>
                      </div>
                      <div>
                        <span className="font-medium">Type d'emploi:</span>
                        <div className="text-muted-foreground">
                          {employee.employment_type === 'full_time' ? 'Temps plein' : 
                           employee.employment_type === 'part_time' ? 'Temps partiel' :
                           employee.employment_type === 'contract' ? 'Contractuel' :
                           employee.employment_type === 'intern' ? 'Stagiaire' : 'Consultant'}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Statut:</span>
                        <div className="mt-1">
                          <EmployeeStatus status={employee.employment_status} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Informations salariales */}
                {employee.current_salary && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Rémunération
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Salaire actuel:</span>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {formatSalary(employee.current_salary, employee.salary_currency)}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Fréquence:</span>
                          <div className="text-muted-foreground">{employee.salary_frequency}</div>
                        </div>
                        {employee.last_salary_review_date && (
                          <div>
                            <span className="font-medium">Dernière révision:</span>
                            <div className="text-muted-foreground">{formatDate(employee.last_salary_review_date)}</div>
                          </div>
                        )}
                        {employee.next_salary_review_date && (
                          <div>
                            <span className="font-medium">Prochaine révision:</span>
                            <div className="text-muted-foreground">{formatDate(employee.next_salary_review_date)}</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Score de performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Performance globale
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                        {employee.performance_score.toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">/ 5.0</div>
                      <Progress 
                        value={(employee.performance_score / 5) * 100} 
                        className="mt-4"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Congés */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Congés et absences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Congés payés</span>
                          <span>{employee.vacation_days_used} / {employee.vacation_days_total}</span>
                        </div>
                        <Progress 
                          value={(employee.vacation_days_used / employee.vacation_days_total) * 100}
                          className="h-2"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Jours de maladie utilisés:</span>
                          <span>{employee.sick_days_used}</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Congés restants:</span>
                          <span className="font-bold text-green-600 dark:text-green-400">
                            {employee.vacation_days_total - employee.vacation_days_used}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents
                  </CardTitle>
                  <CardDescription>
                    Contrats, certifications et autres documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Fonctionnalité en cours de développement</p>
                    <p className="text-sm">Les documents seront bientôt disponibles</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Historique
                  </CardTitle>
                  <CardDescription>
                    Historique des modifications et événements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Historique en cours de développement</p>
                    <p className="text-sm">L'audit trail sera bientôt disponible</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  )
}
