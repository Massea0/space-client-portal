'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, Users, Plus, Edit, Trash2, BarChart3, MapPin } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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
const mockBranches = [
  {
    id: '1',
    name: 'Siège Paris',
    code: 'PAR-HQ',
    city: 'Paris',
    country: 'France',
    employee_count: 150,
    department_count: 8,
    is_headquarters: true,
    status: 'active',
    director_name: 'Jean Dupont'
  },
  {
    id: '2',
    name: 'Agence Lyon',
    code: 'LYO-01',
    city: 'Lyon',
    country: 'France',
    employee_count: 45,
    department_count: 4,
    is_headquarters: false,
    status: 'active',
    director_name: 'Marie Martin'
  },
  {
    id: '3',
    name: 'Bureau Marseille',
    code: 'MAR-01',
    city: 'Marseille',
    country: 'France',
    employee_count: 28,
    department_count: 3,
    is_headquarters: false,
    status: 'active',
    director_name: 'Pierre Bernard'
  }
]

const mockDepartments = [
  {
    id: '1',
    name: 'Direction Générale',
    code: 'DG',
    branch_id: '1',
    branch_name: 'Siège Paris',
    employee_count: 5,
    manager_name: 'Jean Dupont',
    budget: 500000,
    description: 'Direction générale et stratégie'
  },
  {
    id: '2',
    name: 'Technique',
    code: 'TECH',
    branch_id: '1',
    branch_name: 'Siège Paris',
    employee_count: 45,
    manager_name: 'Alice Dubois',
    budget: 2000000,
    description: 'Développement et innovation'
  },
  {
    id: '3',
    name: 'Commercial',
    code: 'SALES',
    branch_id: '1',
    branch_name: 'Siège Paris',
    employee_count: 32,
    manager_name: 'Bob Martin',
    budget: 1500000,
    description: 'Vente et relation client'
  },
  {
    id: '4',
    name: 'Marketing',
    code: 'MKT',
    branch_id: '1',
    branch_name: 'Siège Paris',
    employee_count: 18,
    manager_name: 'Claire Leroy',
    budget: 800000,
    description: 'Marketing et communication'
  }
]

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState('branches')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const totalEmployees = mockBranches.reduce((sum, branch) => sum + branch.employee_count, 0)
  const totalDepartments = mockDepartments.length
  const totalBudget = mockDepartments.reduce((sum, dept) => sum + dept.budget, 0)

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
              Organisation
            </h1>
            <p className="text-lg text-muted-foreground">
              Gestion des branches, filiales et départements
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Rapport
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Plus className="h-4 w-4" />
              Nouvelle Structure
            </Button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          variants={cardVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500 rounded-full">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {mockBranches.length}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Branches</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {totalDepartments}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">Départements</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {totalEmployees}
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Total Employés</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500 rounded-full">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {formatCurrency(totalBudget)}
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Budget Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={cardVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="branches">Branches & Filiales</TabsTrigger>
              <TabsTrigger value="departments">Départements</TabsTrigger>
            </TabsList>

            <TabsContent value="branches" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Branches et Filiales
                  </CardTitle>
                  <CardDescription>
                    Gestion des différentes entités géographiques de l'entreprise
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockBranches.map((branch) => (
                      <Card key={branch.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <h3 className="text-xl font-semibold">{branch.name}</h3>
                                {branch.is_headquarters && (
                                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                                    Siège
                                  </Badge>
                                )}
                                <Badge 
                                  variant={branch.status === 'active' ? 'default' : 'secondary'}
                                  className={branch.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                                >
                                  {branch.status === 'active' ? 'Actif' : 'Inactif'}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {branch.city}, {branch.country} • Code: {branch.code}
                              </p>
                              <p className="text-sm">
                                Directeur: <span className="font-medium">{branch.director_name}</span>
                              </p>
                            </div>
                            
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                              <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                  <p className="text-2xl font-bold text-blue-600">{branch.employee_count}</p>
                                  <p className="text-xs text-muted-foreground">Employés</p>
                                </div>
                                <div>
                                  <p className="text-2xl font-bold text-green-600">{branch.department_count}</p>
                                  <p className="text-xs text-muted-foreground">Départements</p>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="departments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Départements
                  </CardTitle>
                  <CardDescription>
                    Organisation par département avec budgets et responsables
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Département</TableHead>
                        <TableHead>Branche</TableHead>
                        <TableHead>Manager</TableHead>
                        <TableHead className="text-right">Employés</TableHead>
                        <TableHead className="text-right">Budget</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockDepartments.map((dept) => (
                        <TableRow key={dept.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{dept.name}</p>
                              <p className="text-sm text-muted-foreground">{dept.code}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{dept.branch_name}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {dept.manager_name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{dept.manager_name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary">{dept.employee_count}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(dept.budget)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  )
}
