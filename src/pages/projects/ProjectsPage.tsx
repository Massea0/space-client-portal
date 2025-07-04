// src/pages/projects/ProjectsPage.tsx
// Page principale de gestion des projets avec vue table Twenty-inspired
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { projectsApi, projectUtils } from '@/services/projectApi';
import { companiesApi } from '@/services/api';
import type { Project, Company } from '@/types';
import { motion } from 'framer-motion';
import {
  FolderOpen,
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DataTable, Column } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { ProjectCreateDialog } from '@/pages/projects';

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // États
  const [projects, setProjects] = useState<Project[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Project['status'] | 'all'>('all');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Charger les données
  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, companiesData] = await Promise.all([
        projectsApi.getAll(),
        companiesApi.getAll()
      ]);
      
      setProjects(projectsData.map(projectUtils.mapProjectFromApi));
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les projets",
        variant: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Projets filtrés
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.clientCompanyName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  // Gestionnaire pour supprimer un projet
  const handleDeleteProject = async (projectId: string) => {
    try {
      await projectsApi.delete(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      toast({
        title: "Succès",
        description: "Projet supprimé avec succès"
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le projet",
        variant: "error"
      });
    }
  };

  // Gestionnaire pour naviguer vers un projet
  const handleViewProject = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  // Badge de statut avec couleurs
  const getStatusBadge = (status: Project['status']) => {
    const statusConfig = {
      planning: { label: 'Planification', variant: 'secondary' as const },
      in_progress: { label: 'En cours', variant: 'default' as const },
      on_hold: { label: 'En pause', variant: 'warning' as const },
      completed: { label: 'Terminé', variant: 'success' as const },
      cancelled: { label: 'Annulé', variant: 'destructive' as const },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Colonnes de la table
  const columns: Column<Project>[] = [
    {
      id: 'select',
      header: 'Sélection',
      accessor: (project) => (
        <Checkbox
          checked={selectedProjects.includes(project.id)}
          onCheckedChange={(checked) => {
            setSelectedProjects(prev => 
              checked 
                ? [...prev, project.id]
                : prev.filter(id => id !== project.id)
            );
          }}
          aria-label={`Sélectionner ${project.name}`}
        />
      ),
    },
    {
      id: 'name',
      header: 'Nom du projet',
      accessorKey: 'name',
      sortable: true,
      accessor: (project) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <FolderOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-foreground truncate">
              {project.name}
            </div>
            {project.description && (
              <div className="text-sm text-muted-foreground truncate">
                {project.description}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'client',
      header: 'Client',
      accessor: (project) => (
        <div className="text-sm">
          {project.clientCompanyName || 'Non assigné'}
        </div>
      ),
      sortable: true,
    },
    {
      id: 'status',
      header: 'Statut',
      accessor: (project) => getStatusBadge(project.status),
      sortable: true,
    },
    {
      id: 'progress',
      header: 'Progression',
      accessor: (project) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${project.progressPercentage || 0}%` }}
            />
          </div>
          <span className="text-sm font-medium text-muted-foreground min-w-[3rem]">
            {project.progressPercentage || 0}%
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      id: 'dates',
      header: 'Échéances',
      accessor: (project) => (
        <div className="text-sm space-y-1">
          {project.startDate && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDate(project.startDate)}
            </div>
          )}
          {project.endDate && (
            <div className={cn(
              "flex items-center gap-1",
              project.endDate < new Date() && project.status !== 'completed' 
                ? "text-destructive" 
                : "text-muted-foreground"
            )}>
              <Clock className="h-3 w-3" />
              {formatDate(project.endDate)}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'budget',
      header: 'Budget',
      accessor: (project) => (
        <div className="text-sm font-medium">
          {project.budget ? formatCurrency(project.budget) : 'Non défini'}
        </div>
      ),
      sortable: true,
    },
    {
      id: 'tasks',
      header: 'Tâches',
      accessor: (project) => (
        <div className="text-sm">
          <span className="font-medium">{project.completedTasksCount || 0}</span>
          <span className="text-muted-foreground">/{project.tasksCount || 0}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: '',
      accessor: (project) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => handleViewProject(project)}>
              <Eye className="h-4 w-4 mr-2" />
              Voir détails
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/projects/${project.id}/edit`)}>
              <Edit3 className="h-4 w-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleDeleteProject(project.id)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Statistiques des projets
  const projectStats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'in_progress').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const overdue = projects.filter(p => 
      p.endDate && p.status !== 'completed' && new Date(p.endDate) < new Date()
    ).length;

    return { total, active, completed, overdue };
  }, [projects]);

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projets</h1>
          <p className="text-muted-foreground">
            Gérez vos projets avec une approche moderne et intelligente
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau projet
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <FolderOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{projectStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Actifs</p>
                <p className="text-2xl font-bold">{projectStats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Terminés</p>
                <p className="text-2xl font-bold">{projectStats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">En retard</p>
                <p className="text-2xl font-bold">{projectStats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher des projets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="planning">Planification</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="on_hold">En pause</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>

            {selectedProjects.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedProjects.length} sélectionné(s)
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedProjects([])}
                >
                  Désélectionner
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table des projets */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            data={filteredProjects}
            columns={columns}
            loading={loading}
            onRowClick={handleViewProject}
            emptyMessage="Aucun projet trouvé. Créez votre premier projet pour commencer."
          />
        </CardContent>
      </Card>

      {/* Dialog de création */}
      <ProjectCreateDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onProjectCreated={(newProject) => {
          setProjects(prev => [newProject, ...prev]);
          toast({
            title: "Succès",
            description: "Projet créé avec succès"
          });
        }}
      />
    </div>
  );
};

export default ProjectsPage;
