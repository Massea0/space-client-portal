// src/services/projectApi.ts
// API client pour la gestion des projets
import { supabase } from '@/lib/supabaseClient';
import type { 
  Project, 
  ProjectCreatePayload, 
  ProjectUpdatePayload,
  Task,
  TaskCreatePayload,
  TaskUpdatePayload,
  AIProjectPlanSuggestion,
  AITaskAssignmentSuggestion
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Helper pour les appels à l'API
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/functions/v1/${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }

  return response.json();
};

// === PROJECTS API ===

export const projectsApi = {
  // Récupérer tous les projets
  async getAll(): Promise<Project[]> {
    const result = await apiCall('projects-api');
    return result.data;
  },

  // Récupérer un projet par ID
  async getById(id: string): Promise<Project> {
    const result = await apiCall(`projects-api/${id}`);
    return result.data;
  },

  // Créer un nouveau projet
  async create(payload: ProjectCreatePayload): Promise<Project> {
    const result = await apiCall('projects-api', {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name,
        description: payload.description,
        clientCompanyId: payload.clientCompanyId,
        startDate: payload.startDate?.toISOString(),
        endDate: payload.endDate?.toISOString(),
        budget: payload.budget,
        ownerId: payload.ownerId,
        customFields: payload.customFields || {}
      }),
    });
    return result.data;
  },

  // Mettre à jour un projet
  async update(id: string, payload: ProjectUpdatePayload): Promise<Project> {
    const updateData: any = {};
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.startDate !== undefined) updateData.startDate = payload.startDate?.toISOString();
    if (payload.endDate !== undefined) updateData.endDate = payload.endDate?.toISOString();
    if (payload.budget !== undefined) updateData.budget = payload.budget;
    if (payload.ownerId !== undefined) updateData.ownerId = payload.ownerId;
    if (payload.customFields !== undefined) updateData.customFields = payload.customFields;

    const result = await apiCall(`projects-api/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    return result.data;
  },

  // Supprimer un projet
  async delete(id: string): Promise<void> {
    await apiCall(`projects-api/${id}`, {
      method: 'DELETE',
    });
  },
};

// === TASKS API ===

export const tasksApi = {
  // Récupérer toutes les tâches
  async getAll(): Promise<Task[]> {
    const result = await apiCall('tasks-api');
    return result.data;
  },

  // Récupérer les tâches d'un projet
  async getByProject(projectId: string): Promise<Task[]> {
    const result = await apiCall(`tasks-api?projectId=${projectId}`);
    return result.data;
  },

  // Récupérer une tâche par ID
  async getById(id: string): Promise<Task> {
    const result = await apiCall(`tasks-api/${id}`);
    return result.data;
  },

  // Créer une nouvelle tâche
  async create(payload: TaskCreatePayload): Promise<Task> {
    const result = await apiCall('tasks-api', {
      method: 'POST',
      body: JSON.stringify({
        projectId: payload.projectId,
        title: payload.title,
        description: payload.description,
        assigneeId: payload.assigneeId,
        dueDate: payload.dueDate?.toISOString(),
        priority: payload.priority || 'medium',
        estimatedHours: payload.estimatedHours,
        customFields: payload.customFields || {}
      }),
    });
    return result.data;
  },

  // Créer plusieurs tâches en lot (optimisé pour éviter les appels séquentiels)
  async bulkCreate(projectId: string, tasks: Array<{
    title: string;
    description?: string;
    priority?: Task['priority'];
    estimatedHours?: number;
    customFields?: Record<string, any>;
  }>): Promise<{
    success: boolean;
    tasksCreated: number;
    tasks: Task[];
    message: string;
  }> {
    const result = await apiCall('bulk-create-tasks', {
      method: 'POST',
      body: JSON.stringify({
        projectId,
        tasks,
      }),
    });
    return result;
  },

  // Mettre à jour une tâche
  async update(id: string, payload: TaskUpdatePayload): Promise<Task> {
    const updateData: any = {};
    if (payload.title !== undefined) updateData.title = payload.title;
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.assigneeId !== undefined) updateData.assigneeId = payload.assigneeId;
    if (payload.dueDate !== undefined) updateData.dueDate = payload.dueDate?.toISOString();
    if (payload.priority !== undefined) updateData.priority = payload.priority;
    if (payload.estimatedHours !== undefined) updateData.estimatedHours = payload.estimatedHours;
    if (payload.actualHours !== undefined) updateData.actualHours = payload.actualHours;
    if (payload.position !== undefined) updateData.position = payload.position;
    if (payload.customFields !== undefined) updateData.customFields = payload.customFields;

    const result = await apiCall(`tasks-api/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    return result.data;
  },

  // Réorganiser les tâches (drag & drop)
  async reorder(taskIds: string[], newPositions: number[]): Promise<void> {
    await apiCall('tasks-api', {
      method: 'POST',
      body: JSON.stringify({
        action: 'reorder',
        taskIds,
        newPositions
      }),
    });
  },

  // Supprimer une tâche
  async delete(id: string): Promise<void> {
    await apiCall(`tasks-api/${id}`, {
      method: 'DELETE',
    });
  },
};

// === AI-POWERED FEATURES ===

export const projectAiApi = {
  // Générer un plan de projet avec l'IA
  async generateProjectPlan(request: {
    projectName: string;
    projectDescription: string;
    budget?: number;
    timeline?: number;
    industry?: string;
    complexity?: 'simple' | 'medium' | 'complex';
  }): Promise<AIProjectPlanSuggestion> {
    const result = await apiCall('project-planner-ai', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return result.data;
  },

  // Suggérer un assigné pour une tâche avec l'IA
  async suggestTaskAssignment(request: {
    taskTitle: string;
    taskDescription: string;
    requiredSkills?: string[];
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimatedHours?: number;
    dueDate?: string;
    projectId: string;
  }): Promise<AITaskAssignmentSuggestion> {
    const result = await apiCall('task-assigner-ai', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return result.data;
  },
};

// === UTILITY FUNCTIONS ===

export const projectUtils = {
  // Convertir les données de l'API en objets avec des dates
  mapProjectFromApi(apiProject: any): Project {
    return {
      ...apiProject,
      startDate: apiProject.startDate ? new Date(apiProject.startDate) : undefined,
      endDate: apiProject.endDate ? new Date(apiProject.endDate) : undefined,
      createdAt: new Date(apiProject.createdAt),
      updatedAt: new Date(apiProject.updatedAt),
    };
  },

  mapTaskFromApi(apiTask: any): Task {
    return {
      ...apiTask,
      dueDate: apiTask.dueDate ? new Date(apiTask.dueDate) : undefined,
      createdAt: new Date(apiTask.createdAt),
      updatedAt: new Date(apiTask.updatedAt),
    };
  },

  // Calculer les statistiques d'un projet
  calculateProjectStats(project: Project, tasks: Task[]) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
    const blockedTasks = tasks.filter(task => task.status === 'blocked').length;
    const overdueTasks = tasks.filter(task => 
      task.dueDate && task.status !== 'done' && new Date(task.dueDate) < new Date()
    ).length;

    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const totalEstimatedHours = tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
    const totalActualHours = tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      overdueTasks,
      progressPercentage,
      totalEstimatedHours,
      totalActualHours,
      efficiencyRatio: totalEstimatedHours > 0 ? totalActualHours / totalEstimatedHours : 1,
    };
  },

  // Organiser les tâches en colonnes Kanban
  organizeTasksIntoKanban(tasks: Task[]) {
    const columns = [
      {
        id: 'todo' as const,
        title: 'À faire',
        color: '#6b7280',
        tasks: tasks.filter(task => task.status === 'todo').sort((a, b) => a.position - b.position)
      },
      {
        id: 'in_progress' as const,
        title: 'En cours',
        color: '#3b82f6',
        tasks: tasks.filter(task => task.status === 'in_progress').sort((a, b) => a.position - b.position)
      },
      {
        id: 'done' as const,
        title: 'Terminé',
        color: '#10b981',
        tasks: tasks.filter(task => task.status === 'done').sort((a, b) => a.position - b.position)
      },
      {
        id: 'blocked' as const,
        title: 'Bloqué',
        color: '#ef4444',
        tasks: tasks.filter(task => task.status === 'blocked').sort((a, b) => a.position - b.position)
      }
    ];

    return columns;
  },
};
