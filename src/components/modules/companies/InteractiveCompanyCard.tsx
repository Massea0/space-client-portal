// src/components/modules/companies/InteractiveCompanyCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Card, CardContent, CardFooter, CardHeader,
  CardTitle, CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, cn } from '@/lib/utils';
import { 
  Building, Mail, Phone, MapPin, Edit, Trash2,
  MoreHorizontal, Users, ExternalLink, Calendar
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

interface InteractiveCompanyCardProps {
  company: Company;
  actionLoading?: boolean;
  onEdit?: (company: Company) => void;
  onDelete?: (company: Company) => void;
  onManageUsers?: (companyId: string) => void;
  hideActions?: boolean;
}

const InteractiveCompanyCard: React.FC<InteractiveCompanyCardProps> = ({
  company,
  actionLoading,
  onEdit,
  onDelete,
  onManageUsers,
  hideActions = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      layout
    >
      <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
        <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-lg">
              <Building className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1"> {/* Pour gérer le overflow correctement */}
              <CardTitle className="text-lg truncate">{company.name}</CardTitle>
              <CardDescription>
                Client depuis {formatDate(new Date(company.createdAt))}
              </CardDescription>
            </div>
          </div>
          
          {!hideActions && (
            <div className="flex flex-shrink-0 items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onEdit?.(company)} 
                      disabled={actionLoading}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Modifier</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onManageUsers?.(company.id)}>
                    <Users className="h-4 w-4 mr-2" />
                    Gérer les utilisateurs
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete?.(company)} className="text-red-500 focus:text-red-500">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="flex-grow flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Mail className="h-4 w-4 flex-shrink-0" />
            <span className="truncate overflow-hidden">{company.email}</span>
          </div>
          
          {company.phone && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{company.phone}</span>
            </div>
          )}
          
          {company.address && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-2">{company.address}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-slate-600 mt-auto">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>Créée le {formatDate(new Date(company.createdAt))}</span>
          </div>
        </CardContent>
        
        <CardFooter className="pt-3 border-t border-slate-200">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full flex items-center gap-2" 
            onClick={() => onManageUsers?.(company.id)}
          >
            <Users className="h-4 w-4" />
            <span className="truncate">Gérer les utilisateurs</span>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default InteractiveCompanyCard;
