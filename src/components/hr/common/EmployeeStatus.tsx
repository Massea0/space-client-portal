import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Employee } from '../../../types/hr';

type EmployeeStatusType = Employee['employment_status'];

interface EmployeeStatusProps {
  status: EmployeeStatusType;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

const getStatusConfig = (status: EmployeeStatusType) => {
  switch (status) {
    case 'active':
      return {
        variant: 'default' as const,
        label: 'Actif',
        className: 'bg-green-100 text-green-800 border-green-200',
      };
    case 'inactive':
      return {
        variant: 'secondary' as const,
        label: 'Inactif',
        className: 'bg-gray-100 text-gray-800 border-gray-200',
      };
    case 'on_leave':
      return {
        variant: 'outline' as const,
        label: 'En congé',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
      };
    case 'terminated':
      return {
        variant: 'destructive' as const,
        label: 'Parti',
        className: 'bg-red-100 text-red-800 border-red-200',
      };
    case 'suspended':
      return {
        variant: 'outline' as const,
        label: 'Suspendu',
        className: 'bg-orange-100 text-orange-800 border-orange-200',
      };
    default:
      return {
        variant: 'secondary' as const,
        label: status,
        className: 'bg-gray-100 text-gray-800 border-gray-200',
      };
  }
};

const getSizeClass = (size?: string) => {
  switch (size) {
    case 'sm':
      return 'text-xs px-2 py-1';
    case 'lg':
      return 'text-sm px-3 py-1.5';
    default:
      return 'text-xs px-2.5 py-1';
  }
};

export function EmployeeStatus({ status, className, size = 'default' }: EmployeeStatusProps) {
  const config = getStatusConfig(status);
  const sizeClass = getSizeClass(size);

  return (
    <Badge
      variant={config.variant}
      className={cn(
        config.className,
        sizeClass,
        'font-medium',
        className
      )}
    >
      {config.label}
    </Badge>
  );
}

// Export individual status components for convenience
export function ActiveStatus({ className, size }: Omit<EmployeeStatusProps, 'status'>) {
  return <EmployeeStatus status="active" className={className} size={size} />;
}

export function InactiveStatus({ className, size }: Omit<EmployeeStatusProps, 'status'>) {
  return <EmployeeStatus status="inactive" className={className} size={size} />;
}

export function OnLeaveStatus({ className, size }: Omit<EmployeeStatusProps, 'status'>) {
  return <EmployeeStatus status="on_leave" className={className} size={size} />;
}

export function TerminatedStatus({ className, size }: Omit<EmployeeStatusProps, 'status'>) {
  return <EmployeeStatus status="terminated" className={className} size={size} />;
}

export function SuspendedStatus({ className, size }: Omit<EmployeeStatusProps, 'status'>) {
  return <EmployeeStatus status="suspended" className={className} size={size} />;
}
