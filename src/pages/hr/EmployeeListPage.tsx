'use client'

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Plus, Download, Upload, BarChart3, Search, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmployeeList } from "@/components/modules/hr/employees/EmployeeList"
import { useEmployees } from "@/hooks/hr/useEmployees"

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
}

const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, delay: 0.1 } }
}

export default function EmployeeListPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedBranch, setSelectedBranch] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('all')

  const { employees, loading, error, stats } = useEmployees({
    search: searchQuery,
    department_id: selectedDepartment !== 'all' ? selectedDepartment : undefined,
    branch_id: selectedBranch !== 'all' ? selectedBranch : undefined,
    employment_status: selectedStatus !== 'all' ? (selectedStatus as any) : undefined
  })

  const handleExportEmployees = () => {
    // TODO: Implement CSV export
    console.log('Exporting employees...')
  }

  const handleImportEmployees = () => {
    // TODO: Implement CSV import
    console.log('Importing employees...')
  }

  const handleCreateEmployee = () => {
    navigate('/hr/employees/new')
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
              Gestion des Employés
            </h1>
            <p className="text-lg text-muted-foreground">
              Vue d'ensemble et gestion complète de vos collaborateurs
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleImportEmployees}
              variant="outline"
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Importer
            </Button>
            <Button 
              onClick={handleExportEmployees}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Exporter
            </Button>
            <Button 
              onClick={handleCreateEmployee}
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Nouvel Employé
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
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {stats?.total_employees || 0}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Total Employés</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500 rounded-full">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {stats?.active_employees || 0}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">Actifs</p>
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
                    {stats?.departments_count || 0}
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Départements</p>
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
                    {stats?.branches_count || 0}
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Branches</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres & Recherche
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recherche</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Nom, email, poste..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Département</label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les départements" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les départements</SelectItem>
                      <SelectItem value="tech">Technique</SelectItem>
                      <SelectItem value="sales">Commercial</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="hr">RH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Branche</label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les branches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les branches</SelectItem>
                      <SelectItem value="paris">Paris</SelectItem>
                      <SelectItem value="lyon">Lyon</SelectItem>
                      <SelectItem value="marseille">Marseille</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Statut</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                      <SelectItem value="on_leave">En congé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs for different views */}
        <motion.div variants={cardVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="active">Actifs</TabsTrigger>
              <TabsTrigger value="managers">Managers</TabsTrigger>
              <TabsTrigger value="new_hires">Nouvelles Embauches</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Liste Complète des Employés</CardTitle>
                  <CardDescription>
                    Gestion et vue d'ensemble de tous vos collaborateurs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmployeeList 
                    initialFilters={{
                      search: searchQuery,
                      department_id: selectedDepartment !== 'all' ? selectedDepartment : undefined,
                      branch_id: selectedBranch !== 'all' ? selectedBranch : undefined,
                      employment_status: selectedStatus !== 'all' ? (selectedStatus as any) : undefined
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="active">
              <Card>
                <CardHeader>
                  <CardTitle>Employés Actifs</CardTitle>
                  <CardDescription>
                    Collaborateurs actuellement en poste
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmployeeList 
                    initialFilters={{
                      search: searchQuery,
                      department_id: selectedDepartment !== 'all' ? selectedDepartment : undefined,
                      branch_id: selectedBranch !== 'all' ? selectedBranch : undefined,
                      employment_status: "active"
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="managers">
              <Card>
                <CardHeader>
                  <CardTitle>Équipe Managériale</CardTitle>
                  <CardDescription>
                    Managers et responsables d'équipe
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmployeeList 
                    initialFilters={{
                      search: searchQuery,
                      department_id: selectedDepartment !== 'all' ? selectedDepartment : undefined,
                      branch_id: selectedBranch !== 'all' ? selectedBranch : undefined,
                      employment_status: "active"
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="new_hires">
              <Card>
                <CardHeader>
                  <CardTitle>Nouvelles Embauches</CardTitle>
                  <CardDescription>
                    Employés recrutés dans les 30 derniers jours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmployeeList 
                    initialFilters={{
                      search: searchQuery,
                      department_id: selectedDepartment !== 'all' ? selectedDepartment : undefined,
                      branch_id: selectedBranch !== 'all' ? selectedBranch : undefined,
                      employment_status: "active"
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  )
}
