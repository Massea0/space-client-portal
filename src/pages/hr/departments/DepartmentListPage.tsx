import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Search,
  Filter,
  Building,
  Users,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useDepartmentsWithStats, useDepartmentManager } from '../../../hooks/hr/useDepartments';
import { DepartmentCard } from '../../../components/hr/departments/DepartmentCard';
import { DepartmentWithStats, DepartmentStatus } from '../../../types/hr/department';

export function DepartmentListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DepartmentStatus | ''>('');

  // Utilisation des hooks pour récupérer les données
  const { data: departmentsResponse, isLoading, error } = useDepartmentsWithStats({
    search: searchTerm || undefined,
    status: statusFilter || undefined,
  });

  const { createDepartment, updateDepartment, deleteDepartment } = useDepartmentManager();

  const departments = departmentsResponse?.data || [];

  const handleViewDepartment = (department: DepartmentWithStats) => {
    console.log('Voir département:', department.name);
    // TODO: Navigation vers la page de détail du département
  };

  const handleEditDepartment = (department: DepartmentWithStats) => {
    console.log('Modifier département:', department.name);
    // TODO: Ouvrir le formulaire d'édition
  };

  const handleAddEmployee = (department: DepartmentWithStats) => {
    console.log('Ajouter employé au département:', department.name);
    // TODO: Navigation vers le formulaire d'ajout d'employé avec département pré-sélectionné
  };

  const handleCreateDepartment = () => {
    console.log('Créer nouveau département');
    // TODO: Ouvrir le formulaire de création de département
  };

  // Calcul des statistiques globales
  const totalDepartments = departments.length;
  const activeDepartments = departments.filter(d => d.status === DepartmentStatus.ACTIVE).length;
  const totalEmployees = departments.reduce((sum, d) => sum + d.stats.employee_count, 0);
  const totalBudget = departments.reduce((sum, d) => sum + (d.budget || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Départements</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erreur lors du chargement des départements</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Départements</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos départements et leurs performances
          </p>
        </div>
        <Button onClick={handleCreateDepartment} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nouveau département</span>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Départements</p>
                <p className="text-2xl font-semibold text-gray-900">{totalDepartments}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Départements Actifs</p>
                <p className="text-2xl font-semibold text-green-900">{activeDepartments}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Employés</p>
                <p className="text-2xl font-semibold text-purple-900">{totalEmployees}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Budget Total</p>
                <p className="text-2xl font-semibold text-orange-900">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    maximumFractionDigits: 0,
                  }).format(totalBudget)}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher un département..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as DepartmentStatus | '')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value={DepartmentStatus.ACTIVE}>Actif</option>
                <option value={DepartmentStatus.INACTIVE}>Inactif</option>
                <option value={DepartmentStatus.RESTRUCTURING}>Restructuration</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Departments Grid */}
      {departments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun département trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter 
                ? 'Aucun département ne correspond à vos critères de recherche.'
                : 'Commencez par créer votre premier département.'
              }
            </p>
            <Button onClick={handleCreateDepartment}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un département
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => (
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

      {/* Pagination si nécessaire */}
      {departmentsResponse?.pagination && departmentsResponse.pagination.total_pages > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            {/* TODO: Ajouter la pagination */}
            <Badge variant="outline">
              Page 1 sur {departmentsResponse.pagination.total_pages}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}

export default DepartmentListPage;
