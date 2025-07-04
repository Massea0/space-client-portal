import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { UserRole } from '../../../types/hr/roles';
import { 
  Shield, 
  Users, 
  Building, 
  UserCheck, 
  User, 
  Globe,
  Briefcase
} from 'lucide-react';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  showIcon?: boolean;
  showDescription?: boolean;
}

const getRoleConfig = (role: UserRole) => {
  switch (role) {
    case UserRole.ADMIN:
      return {
        variant: 'destructive' as const,
        label: 'Administrateur',
        description: 'Accès complet au système',
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: Shield,
        priority: 100,
      };
    case UserRole.HR_MANAGER:
      return {
        variant: 'default' as const,
        label: 'Manager RH',
        description: 'Gestion des ressources humaines',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Users,
        priority: 80,
      };
    case UserRole.DEPARTMENT_MANAGER:
      return {
        variant: 'outline' as const,
        label: 'Manager Département',
        description: 'Gestion d\'un département',
        className: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Building,
        priority: 60,
      };
    case UserRole.TEAM_LEAD:
      return {
        variant: 'outline' as const,
        label: 'Chef d\'équipe',
        description: 'Direction d\'équipe',
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: UserCheck,
        priority: 40,
      };
    case UserRole.EMPLOYEE:
      return {
        variant: 'secondary' as const,
        label: 'Employé',
        description: 'Employé standard',
        className: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: User,
        priority: 20,
      };
    case UserRole.CLIENT:
      return {
        variant: 'outline' as const,
        label: 'Client',
        description: 'Client externe',
        className: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: Globe,
        priority: 10,
      };
    case UserRole.CONTRACTOR:
      return {
        variant: 'outline' as const,
        label: 'Contractuel',
        description: 'Contractuel externe',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Briefcase,
        priority: 15,
      };
    default:
      return {
        variant: 'secondary' as const,
        label: role,
        description: 'Rôle non défini',
        className: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: User,
        priority: 0,
      };
  }
};

const getSizeConfig = (size?: string) => {
  switch (size) {
    case 'sm':
      return {
        badge: 'text-xs px-2 py-1',
        icon: 'h-3 w-3',
        spacing: 'space-x-1',
      };
    case 'lg':
      return {
        badge: 'text-sm px-3 py-1.5',
        icon: 'h-4 w-4',
        spacing: 'space-x-2',
      };
    default:
      return {
        badge: 'text-xs px-2.5 py-1',
        icon: 'h-3.5 w-3.5',
        spacing: 'space-x-1.5',
      };
  }
};

export function RoleBadge({ 
  role, 
  className, 
  size = 'default', 
  showIcon = true,
  showDescription = false 
}: RoleBadgeProps) {
  const config = getRoleConfig(role);
  const sizeConfig = getSizeConfig(size);
  const Icon = config.icon;

  return (
    <div className={cn('inline-flex items-center', className)}>
      <Badge
        variant={config.variant}
        className={cn(
          config.className,
          sizeConfig.badge,
          'font-medium inline-flex items-center',
          sizeConfig.spacing
        )}
      >
        {showIcon && Icon && (
          <Icon className={cn(sizeConfig.icon, 'flex-shrink-0')} />
        )}
        <span>{config.label}</span>
      </Badge>
      {showDescription && (
        <span className="ml-2 text-xs text-gray-500">
          {config.description}
        </span>
      )}
    </div>
  );
}

// Export individual role components for convenience
export function AdminBadge({ className, size, showIcon, showDescription }: Omit<RoleBadgeProps, 'role'>) {
  return (
    <RoleBadge 
      role={UserRole.ADMIN} 
      className={className} 
      size={size} 
      showIcon={showIcon}
      showDescription={showDescription}
    />
  );
}

export function HRManagerBadge({ className, size, showIcon, showDescription }: Omit<RoleBadgeProps, 'role'>) {
  return (
    <RoleBadge 
      role={UserRole.HR_MANAGER} 
      className={className} 
      size={size} 
      showIcon={showIcon}
      showDescription={showDescription}
    />
  );
}

export function DepartmentManagerBadge({ className, size, showIcon, showDescription }: Omit<RoleBadgeProps, 'role'>) {
  return (
    <RoleBadge 
      role={UserRole.DEPARTMENT_MANAGER} 
      className={className} 
      size={size} 
      showIcon={showIcon}
      showDescription={showDescription}
    />
  );
}

export function TeamLeadBadge({ className, size, showIcon, showDescription }: Omit<RoleBadgeProps, 'role'>) {
  return (
    <RoleBadge 
      role={UserRole.TEAM_LEAD} 
      className={className} 
      size={size} 
      showIcon={showIcon}
      showDescription={showDescription}
    />
  );
}

export function EmployeeBadge({ className, size, showIcon, showDescription }: Omit<RoleBadgeProps, 'role'>) {
  return (
    <RoleBadge 
      role={UserRole.EMPLOYEE} 
      className={className} 
      size={size} 
      showIcon={showIcon}
      showDescription={showDescription}
    />
  );
}

export function ClientBadge({ className, size, showIcon, showDescription }: Omit<RoleBadgeProps, 'role'>) {
  return (
    <RoleBadge 
      role={UserRole.CLIENT} 
      className={className} 
      size={size} 
      showIcon={showIcon}
      showDescription={showDescription}
    />
  );
}

export function ContractorBadge({ className, size, showIcon, showDescription }: Omit<RoleBadgeProps, 'role'>) {
  return (
    <RoleBadge 
      role={UserRole.CONTRACTOR} 
      className={className} 
      size={size} 
      showIcon={showIcon}
      showDescription={showDescription}
    />
  );
}

// Utility function to get role priority for sorting
export function getRolePriority(role: UserRole): number {
  return getRoleConfig(role).priority;
}

// Utility function to compare roles by priority
export function compareRolesByPriority(roleA: UserRole, roleB: UserRole): number {
  return getRolePriority(roleB) - getRolePriority(roleA); // Descending order
}
