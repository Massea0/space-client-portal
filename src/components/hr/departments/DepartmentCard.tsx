import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  TrendingUp, 
  TrendingDown,
  Edit,
  MoreHorizontal,
  Eye,
  UserPlus,
  Building
} from 'lucide-react';
import { DepartmentWithStats, DepartmentStatus } from '../../../types/hr/department';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DepartmentCardProps {
  department: DepartmentWithStats;
  onView?: (department: DepartmentWithStats) => void;
  onEdit?: (department: DepartmentWithStats) => void;
  onAddEmployee?: (department: DepartmentWithStats) => void;
  className?: string;
  showActions?: boolean;
  compact?: boolean;
}

const getStatusVariant = (status: DepartmentStatus) => {
  switch (status) {
    case DepartmentStatus.ACTIVE:
      return 'default';
    case DepartmentStatus.INACTIVE:
      return 'secondary';
    case DepartmentStatus.RESTRUCTURING:
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getStatusLabel = (status: DepartmentStatus) => {
  switch (status) {
    case DepartmentStatus.ACTIVE:
      return 'Actif';
    case DepartmentStatus.INACTIVE:
      return 'Inactif';
    case DepartmentStatus.RESTRUCTURING:
      return 'Restructuration';
    default:
      return status;
  }
};

export function DepartmentCard({ 
  department, 
  onView, 
  onEdit, 
  onAddEmployee,
  className = '',
  showActions = true,
  compact = false
}: DepartmentCardProps) {
  const { stats } = department;

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value?: number) => {
    if (!value) return '0%';
    return `${value}%`;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Card className={`hover:shadow-md transition-shadow duration-200 ${className}`}>
      <CardHeader className={`${compact ? 'pb-2' : 'pb-4'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Building className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <CardTitle className={`${compact ? 'text-lg' : 'text-xl'} text-gray-900`}>
                  {department.name}
                </CardTitle>
                <Badge variant={getStatusVariant(department.status)}>
                  {getStatusLabel(department.status)}
                </Badge>
              </div>
              {department.description && (
                <p className={`text-gray-600 ${compact ? 'text-sm' : 'text-base'}`}>
                  {department.description}
                </p>
              )}
            </div>
          </div>
          
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(department)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Voir les détails
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(department)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </DropdownMenuItem>
                )}
                {onAddEmployee && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onAddEmployee(department)}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Ajouter un employé
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className={`${compact ? 'pt-0' : 'pt-2'}`}>
        {/* Manager Info */}
        {department.manager && (
          <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`/avatars/${department.manager.id}.jpg`} />
              <AvatarFallback className="text-sm">
                {getInitials(department.manager.first_name, department.manager.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {department.manager.first_name} {department.manager.last_name}
              </p>
              <p className="text-xs text-gray-500">Manager</p>
            </div>
          </div>
        )}

        {/* Contact Info */}
        {!compact && (
          <div className="space-y-2 mb-4">
            {department.location && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{department.location}</span>
              </div>
            )}
            {department.phone && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{department.phone}</span>
              </div>
            )}
            {department.email && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{department.email}</span>
              </div>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className={`grid ${compact ? 'grid-cols-2 gap-3' : 'grid-cols-2 lg:grid-cols-4 gap-4'}`}>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-lg font-semibold text-blue-900">
                {stats.employee_count}
              </span>
            </div>
            <p className="text-xs text-blue-700">Employés</p>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-lg font-semibold text-green-900">
                {stats.recent_hires}
              </span>
            </div>
            <p className="text-xs text-green-700">Nouveaux</p>
          </div>

          {!compact && (
            <>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <span className="text-lg font-semibold text-yellow-900">
                    {formatPercentage(stats.budget_utilization)}
                  </span>
                </div>
                <p className="text-xs text-yellow-700">Budget utilisé</p>
              </div>

              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <span className="text-lg font-semibold text-purple-900">
                    {stats.positions_count}
                  </span>
                </div>
                <p className="text-xs text-purple-700">Postes</p>
              </div>
            </>
          )}
        </div>

        {/* Budget and Salary Info */}
        {!compact && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
            {department.budget && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Budget annuel</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(department.budget)}
                </p>
              </div>
            )}
            {stats.avg_salary && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Salaire moyen</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(stats.avg_salary)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        {!compact && showActions && (
          <div className="flex space-x-2 mt-4 pt-4 border-t">
            {onView && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onView(department)}
                className="flex-1"
              >
                <Eye className="mr-2 h-4 w-4" />
                Détails
              </Button>
            )}
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(department)}
                className="flex-1"
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
