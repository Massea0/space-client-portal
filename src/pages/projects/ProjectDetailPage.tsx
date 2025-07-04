// src/pages/projects/ProjectDetailPage.tsx
// Page de détail d'un projet avec vue Kanban et gestion des tâches
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { projectsApi, tasksApi, projectAiApi } from '@/services/projectApi';
import type { Project, Task, TaskCreatePayload } from '@/types';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  Edit3,
  Trash2,
  Target,
  BarChart3,
  Sparkles,
  CheckCircle,
  AlertCircle,
  PauseCircle,
  XCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KanbanBoard as KanbanBoardComponent, KanbanColumn, KanbanCard } from '@/components/ui/kanban';
import { DataTable, Column } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { TaskCreateDialog } from '@/pages/projects';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // États
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Task['status'] | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Task['priority'] | 'all'>('all');
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'kanban' | 'table'>('kanban');

  // Charger les données du projet
  const loadProject = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const projectData = await projectsApi.getById(id);
      setProject(projectData);
    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le projet",
        variant: "error"
      });
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  // Charger les tâches du projet
  const loadTasks = async () => {
    if (!id) return;
    
    try {
      setLoadingTasks(true);
      const tasksData = await tasksApi.getByProject(id);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les tâches",
        variant: "error"
      });
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadProject();
      loadTasks();
    }
  }, [id]);

  // Tâches filtrées
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  // Convertir les tâches en cartes Kanban
  const taskToKanbanCard = useCallback((task: Task): KanbanCard => ({
    id: task.id,
    title: task.title,
    description: task.description,
    assignee: task.assigneeName ? { id: task.assigneeId!, name: task.assigneeName } : undefined,
    dueDate: task.dueDate ? formatDate(task.dueDate) : undefined,
    priority: task.priority,
    status: task.status === 'in_progress' ? 'in-progress' : task.status,
    tags: task.priority === 'urgent' ? ['Urgent'] : task.priority === 'high' ? ['Haute'] : [],
    estimatedTime: task.estimatedHours ? `${task.estimatedHours}h` : undefined
  }), []);

  // Configuration Kanban
  const kanbanColumns: KanbanColumn[] = useMemo(() => [
    {
      id: 'todo',
      title: 'À faire',
      color: '#64748b',
      cards: filteredTasks.filter(task => task.status === 'todo').map(taskToKanbanCard)
    },
    {
      id: 'in_progress',
      title: 'En cours',
      color: '#3b82f6',
      cards: filteredTasks.filter(task => task.status === 'in_progress').map(taskToKanbanCard)
    },
    {
      id: 'done',
      title: 'Terminé',
      color: '#10b981',
      cards: filteredTasks.filter(task => task.status === 'done').map(taskToKanbanCard)
    },
    {
      id: 'blocked',
      title: 'Bloqué',
      color: '#ef4444',
      cards: filteredTasks.filter(task => task.status === 'blocked').map(taskToKanbanCard)
    }
  ], [filteredTasks, taskToKanbanCard]);

  // Configuration Kanban Board
  const kanbanBoard = useMemo(() => ({
    id: 'project-board',
    title: `Board - ${project?.name || 'Projet'}`,
    columns: kanbanColumns
  }), [kanbanColumns, project?.name]);

  // Gestionnaire de drag & drop Kanban
  const handleKanbanMove = async (taskId: string, newStatus: Task['status']) => {
    try {
      // Mise à jour optimiste
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));

      // Mise à jour côté serveur
      await tasksApi.update(taskId, { status: newStatus });
      
      toast({
        title: "Tâche mise à jour",
        description: "Le statut de la tâche a été modifié"
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      // Rollback
      loadTasks();
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la tâche",
        variant: "error"
      });
    }
  };

  // Supprimer une tâche
  const handleDeleteTask = async (taskId: string) => {
    try {
      await tasksApi.delete(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast({
        title: "Succès",
        description: "Tâche supprimée avec succès"
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la tâche",
        variant: "error"
      });
    }
  };

  // Colonnes pour la vue table
  const tableColumns: Column<Task>[] = [
    {
      id: 'title',
      header: 'Titre',
      accessorKey: 'title',
      sortable: true,
    },
    {
      id: 'status',
      header: 'Statut',
      accessor: (task) => {
        const statusConfig = {
          todo: { label: 'À faire', variant: 'secondary' as const },
          in_progress: { label: 'En cours', variant: 'default' as const },
          done: { label: 'Terminé', variant: 'success' as const },
          blocked: { label: 'Bloqué', variant: 'destructive' as const },
        };
        const config = statusConfig[task.status];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      }
    },
    {
      id: 'priority',
      header: 'Priorité',
      accessor: (task) => {
        const priorityConfig = {
          low: { label: 'Basse', variant: 'outline' as const },
          medium: { label: 'Moyenne', variant: 'secondary' as const },
          high: { label: 'Haute', variant: 'default' as const },
          urgent: { label: 'Urgent', variant: 'destructive' as const },
        };
        const config = priorityConfig[task.priority];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      }
    },
    {
      id: 'assignee',
      header: 'Assigné à',
      accessor: (task) => task.assigneeName || '-'
    },
    {
      id: 'dueDate',
      header: 'Échéance',
      accessor: (task) => task.dueDate ? formatDate(task.dueDate) : '-'
    },
    {
      id: 'estimatedHours',
      header: 'Estimation',
      accessor: (task) => task.estimatedHours ? `${task.estimatedHours}h` : '-'
    },
    {
      id: 'actions',
      header: '',
      accessor: (task) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => console.log('Edit task:', task.id)}>
              <Edit3 className="h-4 w-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleDeleteTask(task.id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Statistiques du projet
  const projectStats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
    const overdueTasks = tasks.filter(t => 
      t.dueDate && t.status !== 'done' && new Date(t.dueDate) < new Date()
    ).length;

    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return { 
      totalTasks, 
      completedTasks, 
      inProgressTasks, 
      blockedTasks, 
      overdueTasks, 
      progress 
    };
  }, [tasks]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du projet...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Projet introuvable</h2>
          <p className="text-muted-foreground mb-4">Le projet demandé n'existe pas ou a été supprimé.</p>
          <Button onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux projets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header du projet */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/projects')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">
              {project.clientCompanyName} • {projectStats.progress}% complété
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setCreateTaskDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle tâche
          </Button>
        </div>
      </div>

      {/* Statistiques du projet */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total tâches</p>
                <p className="text-2xl font-bold">{projectStats.totalTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Terminées</p>
                <p className="text-2xl font-bold text-green-600">{projectStats.completedTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En cours</p>
                <p className="text-2xl font-bold text-blue-600">{projectStats.inProgressTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bloquées</p>
                <p className="text-2xl font-bold text-red-600">{projectStats.blockedTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En retard</p>
                <p className="text-2xl font-bold text-orange-600">{projectStats.overdueTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets principaux */}
      <Tabs defaultValue="tasks" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="tasks">Tâches ({tasks.length})</TabsTrigger>
            <TabsTrigger value="team">Équipe</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Contrôles pour la vue des tâches */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border rounded-lg p-1">
              <Button
                variant={currentView === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('kanban')}
              >
                Kanban
              </Button>
              <Button
                variant={currentView === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('table')}
              >
                Table
              </Button>
            </div>
          </div>
        </div>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Description du projet</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {project.description || "Aucune description disponible."}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Période</p>
                      <p className="text-sm text-muted-foreground">
                        {project.startDate ? formatDate(project.startDate) : 'Non définie'} - {project.endDate ? formatDate(project.endDate) : 'Non définie'}
                      </p>
                    </div>
                  </div>
                  
                  {project.budget && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Budget</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(project.budget)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Responsable</p>
                      <p className="text-sm text-muted-foreground">
                        {project.ownerName || 'Non assigné'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Gestion des tâches */}
        <TabsContent value="tasks" className="space-y-6">
          {/* Filtres et recherche */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher des tâches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Task['status'] | 'all')}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">Tous les statuts</option>
                <option value="todo">À faire</option>
                <option value="in_progress">En cours</option>
                <option value="done">Terminé</option>
                <option value="blocked">Bloqué</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as Task['priority'] | 'all')}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">Toutes les priorités</option>
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Vue Kanban */}
          {currentView === 'kanban' && (
            <Card>
              <CardContent className="p-6">
                <div className="min-h-[600px]">
                  <KanbanBoardComponent
                    board={kanbanBoard}
                    onBoardChange={(updatedBoard) => {
                      // Gérer les changements du board
                      // Pour l'instant, on peut implémenter cela plus tard
                    }}
                    allowQuickAdd={true}
                    showWipLimits={false}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vue Table */}
          {currentView === 'table' && (
            <Card>
              <CardContent className="p-0">
                <DataTable
                  data={filteredTasks}
                  columns={tableColumns}
                  loading={loadingTasks}
                  emptyMessage="Aucune tâche trouvée. Créez votre première tâche pour commencer."
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Équipe */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Membres de l'équipe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                La gestion d'équipe sera disponible dans une prochaine mise à jour.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics du projet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Les analytics détaillées seront disponibles dans une prochaine mise à jour.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de création de tâche */}
      <TaskCreateDialog
        open={createTaskDialogOpen}
        onOpenChange={setCreateTaskDialogOpen}
        project={project}
        onTaskCreated={(newTask) => {
          setTasks(prev => [...prev, newTask]);
          toast({
            title: "Succès",
            description: "Tâche créée avec succès"
          });
        }}
      />
    </div>
  );
};

export default ProjectDetailPage;
