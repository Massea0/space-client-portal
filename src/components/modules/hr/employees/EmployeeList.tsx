// src/components/modules/hr/employees/EmployeeList.tsx
// Composant liste des employés avec recherche, filtres et pagination

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '@/hooks/hr/useEmployees';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmployeeCard } from '@/components/ui/hr/EmployeeCard';
import type { Employee, EmployeeFilters } from '@/types/hr';

interface EmployeeListProps {
  compact?: boolean;
  showActions?: boolean;
  maxHeight?: string;
  initialFilters?: EmployeeFilters;
  onEmployeeSelect?: (employee: Employee) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  compact = false,
  showActions = true,
  maxHeight = 'max-h-96',
  initialFilters = {},
  onEmployeeSelect
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<EmployeeFilters>(initialFilters);

  const {
    employees,
    loading,
    error,
    stats,
    pagination,
    nextPage,
    prevPage,
    refreshEmployees
  } = useEmployees({
    search: searchQuery,
    ...filters
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: Partial<EmployeeFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleViewEmployee = (employee: Employee) => {
    if (onEmployeeSelect) {
      onEmployeeSelect(employee);
    } else {
      navigate(`/hr/employees/${employee.id}`);
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    // TODO: Implémenter la navigation vers le formulaire d'édition
    console.log('Edit employee:', employee.id);
  };

  const handleDeactivateEmployee = (employee: Employee) => {
    // TODO: Implémenter la désactivation
    console.log('Deactivate employee:', employee.id);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const formatSalary = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'EUR'
    }).format(amount);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Chargement des employés...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Erreur lors du chargement</h3>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="outline"
          >
            Réessayer
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec recherche et actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <Input
            type="text"
            placeholder="Rechercher des employés..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtres
          </Button>
          
          {(Object.keys(filters).length > 0 || searchQuery) && (
            <Button 
              variant="ghost" 
              onClick={clearFilters}
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Effacer
            </Button>
          )}
        </div>
      </div>

      {/* Statistiques rapides */}
      {stats && !compact && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Employés</p>
                <p className="text-lg font-semibold text-gray-900">{stats.total_employees}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Actifs</p>
                <p className="text-lg font-semibold text-gray-900">{stats.active_employees}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Départements</p>
                <p className="text-lg font-semibold text-gray-900">{stats.departments_count}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Performance Moy.</p>
                <p className="text-lg font-semibold text-gray-900">{stats.avg_performance_score.toFixed(1)}/5</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filtres avancés */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Département
              </label>
              <select 
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={filters.department_id || ''}
                onChange={(e) => handleFilterChange({ department_id: e.target.value || undefined })}
              >
                <option value="">Tous les départements</option>
                <option value="1">Développement</option>
                <option value="2">Commercial</option>
                <option value="3">Marketing</option>
                <option value="4">RH</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select 
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={filters.employment_status || ''}
                onChange={(e) => handleFilterChange({ employment_status: e.target.value as Employee['employment_status'] || undefined })}
              >
                <option value="">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="on_leave">En congé</option>
                <option value="terminated">Terminé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branche
              </label>
              <select 
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={filters.branch_id || ''}
                onChange={(e) => handleFilterChange({ branch_id: e.target.value || undefined })}
              >
                <option value="">Toutes les branches</option>
                <option value="1">Siège Paris</option>
                <option value="2">Filiale Lyon</option>
                <option value="3">Filiale Marseille</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Liste des employés */}
      <div>
        {employees?.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun employé trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || Object.keys(filters).length > 0 
                  ? 'Essayez de modifier vos critères de recherche.' 
                  : 'Commencez par ajouter des employés à votre organisation.'
                }
              </p>
            </div>
          </Card>
        ) : (
          <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} ${compact ? maxHeight + ' overflow-y-auto' : ''}`}>
            {employees?.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                variant={compact ? 'compact' : 'default'}
                onView={() => handleViewEmployee(employee)}
                onEdit={() => handleEditEmployee(employee)}
                onDeactivate={() => handleDeactivateEmployee(employee)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <Card className="mt-4">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button 
                    variant="outline" 
                    onClick={prevPage}
                    disabled={pagination.page <= 1}
                  >
                    Précédent
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={nextPage}
                    disabled={pagination.page >= pagination.total_pages}
                  >
                    Suivant
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Affichage de{' '}
                      <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span>
                      {' '}à{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>
                      {' '}sur{' '}
                      <span className="font-medium">{pagination.total}</span>
                      {' '}résultats
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={prevPage}
                      disabled={pagination.page <= 1}
                    >
                      Précédent
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={nextPage}
                      disabled={pagination.page >= pagination.total_pages}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
