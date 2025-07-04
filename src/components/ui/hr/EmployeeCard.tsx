import React from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Calendar, MoreHorizontal, Edit, Eye, UserMinus } from 'lucide-react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Employee } from "@/types/hr"
import { EmployeeStatus } from "./EmployeeStatus"

interface EmployeeCardProps {
  employee: Employee
  onView?: (employee: Employee) => void
  onEdit?: (employee: Employee) => void
  onDeactivate?: (employee: Employee) => void
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
}

const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  hover: { y: -2, transition: { duration: 0.2 } }
}

export function EmployeeCard({ 
  employee, 
  onView, 
  onEdit, 
  onDeactivate, 
  className = "",
  variant = 'default'
}: EmployeeCardProps) {
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatSalary = (salary: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(salary)
  }

  // Fonction pour obtenir l'email principal
  const getDisplayEmail = () => {
    return employee.work_email || employee.personal_email || ''
  }

  // Fonction pour obtenir le téléphone principal
  const getDisplayPhone = () => {
    return employee.work_phone || employee.personal_phone || ''
  }

  // Fonction pour obtenir l'adresse d'affichage
  const getDisplayLocation = () => {
    if (employee.address) {
      return `${employee.address.city}, ${employee.address.country}`
    }
    return ''
  }

  if (variant === 'compact') {
    return (
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        className={className}
      >
        <Card className="transition-all duration-200 hover:shadow-md cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {getInitials(employee.first_name, employee.last_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {employee.first_name} {employee.last_name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {employee.position?.title || 'Position non définie'}
                </div>
              </div>

              <EmployeeStatus status={employee.employment_status} />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onView && (
                    <DropdownMenuItem onClick={() => onView(employee)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir le profil
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(employee)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                  )}
                  {onDeactivate && employee.employment_status === 'active' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDeactivate(employee)}
                        className="text-red-600 dark:text-red-400"
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Désactiver
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <TooltipProvider>
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        className={className}
      >
        <Card className="transition-all duration-200 hover:shadow-lg cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                    {getInitials(employee.first_name, employee.last_name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">
                      {employee.first_name} {employee.last_name}
                    </h3>
                    <EmployeeStatus status={employee.employment_status} />
                  </div>
                  
                  <p className="text-sm text-muted-foreground font-medium">
                    {employee.position?.title || 'Position non définie'}
                  </p>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                    ID: {employee.employee_number}
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onView && (
                    <DropdownMenuItem onClick={() => onView(employee)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir le profil
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(employee)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                  )}
                  {onDeactivate && employee.employment_status === 'active' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDeactivate(employee)}
                        className="text-red-600 dark:text-red-400"
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Désactiver
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="pt-0 space-y-4">
            {/* Informations de contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {getDisplayEmail() && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{getDisplayEmail()}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getDisplayEmail()}</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {getDisplayPhone() && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span className="truncate">{getDisplayPhone()}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getDisplayPhone()}</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {getDisplayLocation() && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{getDisplayLocation()}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getDisplayLocation()}</p>
                  </TooltipContent>
                </Tooltip>
              )}

              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="truncate">Embauché le {formatDate(employee.hire_date)}</span>
              </div>
            </div>

            {/* Informations supplémentaires si variant === 'detailed' */}
            {variant === 'detailed' && (
              <div className="pt-3 border-t border-border">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Département:</span>
                    <div className="font-medium">{employee.department?.name || 'Non défini'}</div>
                  </div>
                  {employee.current_salary && (
                    <div>
                      <span className="text-muted-foreground">Salaire:</span>
                      <div className="font-medium">{formatSalary(employee.current_salary, employee.salary_currency)}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions rapides */}
            <div className="flex gap-2 pt-2">
              {onView && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onView(employee)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Voir le profil
                </Button>
              )}
              {onEdit && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onEdit(employee)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}
