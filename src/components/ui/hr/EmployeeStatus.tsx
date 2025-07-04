import React from 'react'
import { Badge } from "@/components/ui/badge"
import { Employee } from "@/types/hr"

interface EmployeeStatusProps {
  status: Employee['employment_status']
  className?: string
  variant?: 'default' | 'outline' | 'secondary'
}

const statusConfig = {
  active: {
    label: 'Actif',
    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700'
  },
  inactive: {
    label: 'Inactif',
    color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700'
  },
  on_leave: {
    label: 'En congé',
    color: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700'
  },
  terminated: {
    label: 'Licencié',
    color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700'
  },
  suspended: {
    label: 'Suspendu',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700'
  }
} as const

export function EmployeeStatus({ status, className = "", variant = 'default' }: EmployeeStatusProps) {
  const config = statusConfig[status] || statusConfig.inactive
  
  return (
    <Badge 
      variant={variant}
      className={`${config.color} ${className}`}
    >
      {config.label}
    </Badge>
  )
}
