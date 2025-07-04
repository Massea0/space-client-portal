// src/pages/projects/TaskCreateDialog.tsx
// Composant de création de tâche avec intégration IA pour l'assignation
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { projectsApi, tasksApi, projectAiApi } from '@/services/projectApi';
import { usersApi } from '@/services/api';
import type { TaskCreatePayload, Project, Task } from '@/types';
import type { UserProfile } from '@/services/api';
import { Loader2, Sparkles, User as UserIcon, Calendar, Flag, FileText, Plus } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface TaskCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  onTaskCreated?: (task: any) => void;
}

// Interface pour le formulaire local
interface TaskFormData {
  title: string;
  description: string;
  priority: Task['priority'];
  assigneeId?: string;
  estimatedHours?: number;
  dueDate?: string;
}

export const TaskCreateDialog: React.FC<TaskCreateDialogProps> = ({
  open,
  onOpenChange,
  project,
  onTaskCreated
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // État du formulaire
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    assigneeId: undefined,
    estimatedHours: undefined,
    dueDate: undefined
  });

  // États de chargement et données
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAssignment, setIsGeneratingAssignment] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Charger la liste des utilisateurs
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const allUsers = await usersApi.getAll();
        setUsers(allUsers);
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger la liste des utilisateurs',
          variant: 'error'
        });
      } finally {
        setLoadingUsers(false);
      }
    };

    if (open) {
      loadUsers();
    }
  }, [open, toast]);

  // Réinitialiser le formulaire à l'ouverture
  useEffect(() => {
    if (open) {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        assigneeId: undefined,
        estimatedHours: undefined,
        dueDate: undefined
      });
    }
  }, [open]);

  // Gestion des changements de formulaire
  const handleInputChange = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Génération IA de l'assigné
  const handleGenerateAssignment = async () => {
    if (!formData.title || !formData.description) {
      toast({
        title: 'Informations manquantes',
        description: 'Veuillez remplir le titre et la description avant de générer une assignation',
        variant: 'error'
      });
      return;
    }

    try {
      setIsGeneratingAssignment(true);
      
      const suggestion = await projectAiApi.suggestTaskAssignment({
        taskTitle: formData.title,
        taskDescription: formData.description || '',
        projectId: project.id,
        requiredSkills: [],
        priority: formData.priority,
        estimatedHours: formData.estimatedHours,
        dueDate: formData.dueDate
      });

      if (suggestion.suggestedAssigneeId) {
        handleInputChange('assigneeId', suggestion.suggestedAssigneeId);
        
        toast({
          title: 'Assignation suggérée',
          description: `IA recommande : ${suggestion.reasoning}`,
          variant: 'success'
        });
      } else {
        toast({
          title: 'Aucune suggestion',
          description: 'L\'IA n\'a pas pu recommander un assigné pour cette tâche',
          variant: 'error'
        });
      }
    } catch (error) {
      console.error('Erreur génération assignation:', error);
      toast({
        title: 'Erreur IA',
        description: 'Impossible de générer une suggestion d\'assignation',
        variant: 'error'
      });
    } finally {
      setIsGeneratingAssignment(false);
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      toast({
        title: 'Titre requis',
        description: 'Veuillez saisir un titre pour la tâche',
        variant: 'error'
      });
      return;
    }

    try {
      setIsLoading(true);

      const taskData: TaskCreatePayload = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        projectId: project.id,
        priority: formData.priority,
        estimatedHours: formData.estimatedHours || undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        assigneeId: formData.assigneeId || undefined
      };

      const newTask = await tasksApi.create(taskData);

      toast({
        title: 'Tâche créée',
        description: `La tâche "${newTask.title}" a été créée avec succès`,
        variant: 'success'
      });

      onTaskCreated?.(newTask);
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur création tâche:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la tâche',
        variant: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Faible', color: 'text-green-600' },
    { value: 'medium', label: 'Moyenne', color: 'text-yellow-600' },
    { value: 'high', label: 'Élevée', color: 'text-red-600' },
    { value: 'urgent', label: 'Urgente', color: 'text-red-800' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nouvelle tâche
          </DialogTitle>
          <DialogDescription>
            Créer une nouvelle tâche pour le projet "{project.name}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titre */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              placeholder="Titre de la tâche..."
              value={formData.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Description détaillée de la tâche..."
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Ligne 1: Priorité et Assigné avec IA */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priorité</Label>
              <Select
                value={formData.priority || 'medium'}
                onValueChange={(value) => handleInputChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une priorité" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className={option.color}>{option.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="assigneeId">Assigné à</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateAssignment}
                  disabled={isGeneratingAssignment || loadingUsers}
                  className="h-7 px-2"
                >
                  {isGeneratingAssignment ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  <span className="ml-1 text-xs">IA</span>
                </Button>
              </div>
              <Select
                value={formData.assigneeId || ''}
                onValueChange={(value) => handleInputChange('assigneeId', value)}
                disabled={loadingUsers}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingUsers ? "Chargement..." : "Sélectionner un utilisateur"} />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        {user.firstName} {user.lastName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ligne 2: Durée estimée et Date d'échéance */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Durée estimée (heures)</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="0"
                step="0.5"
                placeholder="Ex: 8"
                value={formData.estimatedHours || ''}
                onChange={(e) => handleInputChange('estimatedHours', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Date d'échéance</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => handleInputChange('dueDate', e.target.value || undefined)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer la tâche
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
