// src/components/modules/users/InteractiveUserCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Card, CardContent, CardFooter, CardHeader,
  CardTitle, CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, cn } from '@/lib/utils';
import { 
  User, Building, Key, Mail, Phone,
  Calendar, Shield, ShieldCheck, ShieldAlert, 
  MoreHorizontal, Edit, Trash2, Archive, ArchiveRestore
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  blockedAt?: string | Date | null;
  deletedAt?: string | Date | null;
  companyId?: string | null;
  companyName?: string | null;
  phone?: string | null;
  profileImage?: string | null;
}

interface InteractiveUserCardProps {
  user: UserProfile;
  actionLoading?: string | null;
  onEditUser?: (user: UserProfile) => void;
  onBlockUser?: (userId: string) => Promise<void>;
  onUnblockUser?: (userId: string) => Promise<void>;
  onSoftDeleteUser?: (user: UserProfile) => void;
  onRestoreUser?: (userId: string) => Promise<void>;
  onPermanentDelete?: (user: UserProfile) => void;
  onViewCompany?: (companyId: string | null | undefined) => void;
  hideActions?: boolean;
}

const InteractiveUserCard: React.FC<InteractiveUserCardProps> = ({
  user,
  actionLoading,
  onEditUser,
  onBlockUser,
  onUnblockUser,
  onSoftDeleteUser,
  onRestoreUser,
  onPermanentDelete,
  onViewCompany,
  hideActions = false
}) => {
  const isBlocked = !!user.blockedAt;
  const isDeleted = !!user.deletedAt;
  const isActionLoading = actionLoading === user.id;

  // Fonction pour générer les initiales à partir du nom
  const getInitials = () => {
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Fonction pour déterminer la couleur de l'avatar en fonction du rôle
  const getAvatarColor = () => {
    return user.role === 'admin' ? 'bg-gradient-to-br from-red-500 to-orange-500' : 'bg-gradient-to-br from-blue-500 to-cyan-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      layout
    >
      <Card className={cn(
        "h-full flex flex-col hover:shadow-md transition-shadow border",
        isBlocked && "border-amber-200 bg-amber-50/30",
        isDeleted && "border-gray-200 bg-muted/20 opacity-80",
      )}>
        <CardHeader className="pb-4 flex flex-row items-start justify-between space-y-0">
          <div className="flex items-center gap-3">
            <Avatar className={cn("h-11 w-11", getAvatarColor())}>
              {user.profileImage ? (
                <AvatarImage src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
              ) : (
                <AvatarFallback>{getInitials()}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {user.firstName} {user.lastName}
                {user.role === 'admin' && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <ShieldCheck className="h-4 w-4 text-red-500" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Administrateur du système</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </CardTitle>
              <CardDescription className="line-clamp-1">
                {user.email}
              </CardDescription>
            </div>
          </div>
          
          {!hideActions && (
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onEditUser?.(user)} 
                      disabled={isActionLoading}
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
                  {isDeleted ? (
                    <>
                      <DropdownMenuItem onClick={() => onRestoreUser?.(user.id)} disabled={isActionLoading}>
                        <ArchiveRestore className="h-4 w-4 mr-2" />
                        Restaurer
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onPermanentDelete?.(user)} 
                        className="text-red-500 focus:text-red-500" 
                        disabled={isActionLoading}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer définitivement
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      {isBlocked ? (
                        <DropdownMenuItem onClick={() => onUnblockUser?.(user.id)} disabled={isActionLoading}>
                          <ShieldCheck className="h-4 w-4 mr-2" />
                          Débloquer
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onBlockUser?.(user.id)} disabled={isActionLoading}>
                          <ShieldAlert className="h-4 w-4 mr-2" />
                          Bloquer
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onSoftDeleteUser?.(user)} disabled={isActionLoading}>
                        <Archive className="h-4 w-4 mr-2" />
                        Mettre en corbeille
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="flex-grow flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
          
          {user.companyName && (
            <div className="flex items-center gap-2 text-sm">
              <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Button 
                variant="link" 
                className="h-auto p-0 text-sm" 
                onClick={() => onViewCompany?.(user.companyId)}
              >
                {user.companyName}
              </Button>
            </div>
          )}
          
          {user.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{user.phone}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span>Inscrit le {formatDate(new Date(user.createdAt))}</span>
          </div>
          
          <div className="mt-auto flex flex-wrap gap-2 pt-4">
            <Badge variant={user.role === 'admin' ? "destructive" : "default"} className="capitalize">
              {user.role === 'admin' ? (
                <><ShieldCheck className="h-3 w-3 mr-1" /> Admin</>
              ) : (
                <><User className="h-3 w-3 mr-1" /> Client</>
              )}
            </Badge>
            
            {isBlocked && (
              <Badge variant="outline" className="border-amber-200 text-amber-800 bg-amber-50">
                Bloqué
              </Badge>
            )}
            
            {isDeleted && (
              <Badge variant="outline" className="border-gray-200 text-gray-600 bg-gray-50">
                Corbeille
              </Badge>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="pt-2 flex justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => onEditUser?.(user)}
            disabled={isActionLoading}
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            Modifier
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default InteractiveUserCard;
