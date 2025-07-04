import React from 'react';
import { Plus, Filter, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DepartmentCard } from '@/components/hr/departments/DepartmentCard';
import { useDepartmentsWithStats } from '@/hooks/hr/useDepartments';
import { DepartmentWithStats, DepartmentStatus } from '@/types/hr/department';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function DepartmentsPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<DepartmentStatus | 'all'>('all');

  const { data: departmentsResponse, isLoading, error } = useDepartmentsWithStats();

  // Filtrage des départements
  const filteredDepartments = React.useMemo(() => {
    if (!departmentsResponse?.data) return [];

    let filtered = departmentsResponse.data;

    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(dept => 
        dept.name.toLowerCase().includes(searchLower) ||
        dept.description?.toLowerCase().includes(searchLower) ||
        dept.manager?.first_name.toLowerCase().includes(searchLower) ||
        dept.manager?.last_name.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(dept => dept.status === statusFilter);
    }

    return filtered;
  }, [departmentsResponse?.data, searchTerm, statusFilter]);

  // Calcul des métriques
  const metrics = React.useMemo(() => {
    if (!departmentsResponse?.data) return null;

    const departments = departmentsResponse.data;
    const totalEmployees = departments.reduce((sum, dept) => sum + dept.stats.employee_count, 0);
    const totalBudget = departments.reduce((sum, dept) => sum + (dept.budget || 0), 0);
    const averageBudgetUtilization = departments.reduce((sum, dept) => sum + (dept.stats.budget_utilization || 0), 0) / departments.length;

    return {
      totalDepartments: departments.length,
      activeDepartments: departments.filter(d => d.status === DepartmentStatus.ACTIVE).length,
      totalEmployees,
      totalBudget,
      averageBudgetUtilization
    };
  }, [departmentsResponse?.data]);

  const handleViewDepartment = (department: DepartmentWithStats) => {
    console.log('Voir département:', department);
    // TODO: Navigation vers la page de détail du département
  };

  const handleEditDepartment = (department: DepartmentWithStats) => {
    console.log('Modifier département:', department);
    // TODO: Ouvrir modal d'édition ou navigation vers formulaire
  };

  const handleAddEmployee = (department: DepartmentWithStats) => {
    console.log('Ajouter employé au département:', department);
    // TODO: Navigation vers formulaire d'ajout d'employé avec département pré-sélectionné
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des départements...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 font-medium">Erreur lors du chargement des départements</p>
              <p className="text-red-500 text-sm mt-2">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Départements</h1>
          <p className="text-gray-600 mt-1">
            Gérez les départements et leurs équipes
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau département
        </Button>
      </div>

      {/* Métriques */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Départements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.totalDepartments}
              </div>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="text-xs">
                  {metrics.activeDepartments} actifs
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total employés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.totalEmployees}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Tous départements
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Budget total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(metrics.totalBudget)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Budget annuel
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Utilisation budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(metrics.averageBudgetUtilization)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Moyenne générale
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                <Download className="mr-2 h-3 w-3" />
                Export
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un département..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as DepartmentStatus | 'all')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value={DepartmentStatus.ACTIVE}>Actif</SelectItem>
                  <SelectItem value={DepartmentStatus.INACTIVE}>Inactif</SelectItem>
                  <SelectItem value={DepartmentStatus.RESTRUCTURING}>Restructuration</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filtres
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des départements */}
      {filteredDepartments.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <p className="text-gray-500 text-lg">Aucun département trouvé</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Commencez par créer votre premier département'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((department) => (
            <DepartmentCard
              key={department.id}
              department={department}
              onView={handleViewDepartment}
              onEdit={handleEditDepartment}
              onAddEmployee={handleAddEmployee}
              showActions={true}
            />
          ))}
        </div>
      )}

      {/* Résumé des résultats */}
      {filteredDepartments.length > 0 && (
        <div className="text-center text-gray-500 text-sm">
          Affichage de {filteredDepartments.length} département{filteredDepartments.length > 1 ? 's' : ''} 
          {departmentsResponse?.data && filteredDepartments.length !== departmentsResponse.data.length && 
            ` sur ${departmentsResponse.data.length} au total`
          }
        </div>
      )}
    </div>
  );
}
