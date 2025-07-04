'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  UserPlus, 
  UserMinus,
  Clock,
  Award,
  AlertTriangle,
  Calendar,
  DollarSign
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
}

const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, delay: 0.1 } }
}

// Données mock pour la démonstration
const mockMetrics = {
  total_employees: 223,
  active_employees: 218,
  new_hires_month: 12,
  departures_month: 3,
  avg_performance: 4.2,
  satisfaction_score: 87,
  retention_rate: 94.5,
  absenteeism_rate: 2.3
}

const mockTurnoverPredictions = [
  { employee_name: 'Alice Martin', risk_score: 85, department: 'Tech', reason: 'Surcharge de travail' },
  { employee_name: 'Pierre Dubois', risk_score: 72, department: 'Commercial', reason: 'Insatisfaction salariale' },
  { employee_name: 'Marie Leroy', risk_score: 68, department: 'Marketing', reason: 'Manque de perspective' }
]

const mockDepartmentMetrics = [
  { name: 'Technique', employees: 45, performance: 4.5, satisfaction: 92, turnover: 5.2 },
  { name: 'Commercial', employees: 32, performance: 4.1, satisfaction: 85, turnover: 8.1 },
  { name: 'Marketing', employees: 18, performance: 4.3, satisfaction: 89, turnover: 6.3 },
  { name: 'RH', employees: 8, performance: 4.6, satisfaction: 95, turnover: 2.1 },
  { name: 'Finance', employees: 12, performance: 4.2, satisfaction: 88, turnover: 4.2 }
]

const mockRecruitmentMetrics = {
  open_positions: 15,
  avg_time_to_hire: 28,
  applications_count: 234,
  interview_to_hire_ratio: 18.5,
  cost_per_hire: 3500
}

export default function HRAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedBranch, setSelectedBranch] = useState('all')

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-100'
    if (score >= 60) return 'text-orange-600 bg-orange-100'
    return 'text-yellow-600 bg-yellow-100'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
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
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Analytics RH
            </h1>
            <p className="text-lg text-muted-foreground">
              Tableaux de bord et indicateurs de performance RH
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Toutes les branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les branches</SelectItem>
                <SelectItem value="paris">Siège Paris</SelectItem>
                <SelectItem value="lyon">Agence Lyon</SelectItem>
                <SelectItem value="marseille">Bureau Marseille</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Semaine</SelectItem>
                <SelectItem value="month">Mois</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
                <SelectItem value="year">Année</SelectItem>
              </SelectContent>
            </Select>
            
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <BarChart3 className="h-4 w-4" />
              Exporter Rapport
            </Button>
          </div>
        </motion.div>

        {/* Quick Metrics */}
        <motion.div 
          variants={cardVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Total Employés</p>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {mockMetrics.total_employees}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">+5.2%</span>
                  </div>
                </div>
                <Users className="h-12 w-12 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Nouvelles Embauches</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                    {mockMetrics.new_hires_month}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">+12.5%</span>
                  </div>
                </div>
                <UserPlus className="h-12 w-12 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Taux de Rétention</p>
                  <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                    {mockMetrics.retention_rate}%
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">+2.1%</span>
                  </div>
                </div>
                <Award className="h-12 w-12 text-orange-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Performance Moyenne</p>
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                    {mockMetrics.avg_performance}/5
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">+0.3</span>
                  </div>
                </div>
                <BarChart3 className="h-12 w-12 text-purple-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Analytics */}
        <motion.div variants={cardVariants}>
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Vue d'Ensemble</TabsTrigger>
              <TabsTrigger value="departments">Départements</TabsTrigger>
              <TabsTrigger value="predictions">Prédictions IA</TabsTrigger>
              <TabsTrigger value="recruitment">Recrutement</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Satisfaction et Performance</CardTitle>
                    <CardDescription>Indicateurs de bien-être au travail</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Satisfaction Globale</span>
                        <span className="text-sm text-muted-foreground">{mockMetrics.satisfaction_score}%</span>
                      </div>
                      <Progress value={mockMetrics.satisfaction_score} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Performance Moyenne</span>
                        <span className="text-sm text-muted-foreground">{mockMetrics.avg_performance * 20}%</span>
                      </div>
                      <Progress value={mockMetrics.avg_performance * 20} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Taux d'Absentéisme</span>
                        <span className="text-sm text-muted-foreground">{mockMetrics.absenteeism_rate}%</span>
                      </div>
                      <Progress value={mockMetrics.absenteeism_rate} className="h-2 bg-red-100" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Mouvement du Personnel</CardTitle>
                    <CardDescription>Entrées et sorties du mois</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <UserPlus className="h-8 w-8 text-green-600" />
                          <div>
                            <p className="font-medium">Nouvelles Embauches</p>
                            <p className="text-sm text-muted-foreground">Ce mois-ci</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-green-600">+{mockMetrics.new_hires_month}</span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <UserMinus className="h-8 w-8 text-red-600" />
                          <div>
                            <p className="font-medium">Départs</p>
                            <p className="text-sm text-muted-foreground">Ce mois-ci</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-red-600">-{mockMetrics.departures_month}</span>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Croissance Nette</span>
                          <span className="text-lg font-bold text-blue-600">
                            +{mockMetrics.new_hires_month - mockMetrics.departures_month}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="departments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance par Département</CardTitle>
                  <CardDescription>Comparaison des métriques clés par département</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockDepartmentMetrics.map((dept, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <h3 className="font-medium">{dept.name}</h3>
                            <p className="text-sm text-muted-foreground">{dept.employees} employés</p>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-6 text-center">
                            <div>
                              <p className="text-sm text-muted-foreground">Performance</p>
                              <p className="text-lg font-bold text-blue-600">{dept.performance}/5</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Satisfaction</p>
                              <p className="text-lg font-bold text-green-600">{dept.satisfaction}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Turnover</p>
                              <p className="text-lg font-bold text-orange-600">{dept.turnover}%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="predictions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Prédictions de Turnover (IA)
                  </CardTitle>
                  <CardDescription>
                    Employés à risque de départ identifiés par l'IA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTurnoverPredictions.map((prediction, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <h3 className="font-medium">{prediction.employee_name}</h3>
                          <p className="text-sm text-muted-foreground">{prediction.department}</p>
                          <p className="text-sm">{prediction.reason}</p>
                        </div>
                        
                        <div className="text-right">
                          <Badge className={getRiskColor(prediction.risk_score)}>
                            Risque: {prediction.risk_score}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recruitment" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Postes Ouverts</p>
                        <p className="text-3xl font-bold">{mockRecruitmentMetrics.open_positions}</p>
                      </div>
                      <Calendar className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Temps Moyen d'Embauche</p>
                        <p className="text-3xl font-bold">{mockRecruitmentMetrics.avg_time_to_hire}j</p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Coût par Embauche</p>
                        <p className="text-3xl font-bold">{formatCurrency(mockRecruitmentMetrics.cost_per_hire)}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Pipeline de Recrutement</CardTitle>
                  <CardDescription>Suivi des candidatures et conversions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Candidatures Reçues</span>
                      <span className="font-bold">{mockRecruitmentMetrics.applications_count}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Taux de Conversion Entretien → Embauche</span>
                      <span className="font-bold">{mockRecruitmentMetrics.interview_to_hire_ratio}%</span>
                    </div>
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
