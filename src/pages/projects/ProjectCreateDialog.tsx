// src/pages/projects/ProjectCreateDialog.tsx
// Dialog pour la création de nouveaux projets avec validation et intégration IA
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { projectsApi, projectAiApi, tasksApi } from '@/services/projectApi';
import { companiesApi } from '@/services/api';
import type { ProjectCreatePayload, Company } from '@/types';
import { motion } from 'framer-motion';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, LoaderIcon, Sparkles, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn, formatCurrency } from '@/lib/utils';

interface ProjectCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: any) => void;
}

interface FormData {
  name: string;
  description: string;
  clientCompanyId: string;
  startDate: string;
  endDate: string;
  budget: string;
  ownerId: string;
}

interface FormErrors {
  name?: string;
  clientCompanyId?: string;
  startDate?: string;
  endDate?: string;
  budget?: string;
}

export const ProjectCreateDialog: React.FC<ProjectCreateDialogProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // États
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    clientCompanyId: '',
    startDate: '',
    endDate: '',
    budget: '',
    ownerId: user?.id || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isCreatingTasks, setIsCreatingTasks] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [generatedAiPlan, setGeneratedAiPlan] = useState<any>(null);

  // Charger les entreprises au montage
  useEffect(() => {
    if (isOpen) {
      loadCompanies();
      // Reset form
      setFormData({
        name: '',
        description: '',
        clientCompanyId: '',
        startDate: '',
        endDate: '',
        budget: '',
        ownerId: user?.id || '',
      });
      setErrors({});
      setGeneratedAiPlan(null);
      setIsCreatingTasks(false);
    }
  }, [isOpen, user?.id]);

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const response = await companiesApi.getAll();
      setCompanies(response || []);
    } catch (error) {
      console.error('Erreur chargement companies:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la liste des entreprises',
        variant: 'error',
      });
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du projet est requis';
    }

    if (!formData.clientCompanyId) {
      newErrors.clientCompanyId = 'Veuillez sélectionner une entreprise cliente';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        newErrors.endDate = 'La date de fin doit être postérieure à la date de début';
      }
    }

    if (formData.budget && parseFloat(formData.budget) < 0) {
      newErrors.budget = 'Le budget doit être positif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      const payload: ProjectCreatePayload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        clientCompanyId: formData.clientCompanyId,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        ownerId: formData.ownerId || undefined,
        customFields: {},
      };

      const newProject = await projectsApi.create(payload);

      // Si un plan IA a été généré, créer automatiquement les tâches
      if (generatedAiPlan && generatedAiPlan.phases) {
        try {
          setIsCreatingTasks(true);
          
          // Préparer toutes les tâches pour la création en lot
          const allTasks = [];
          for (const phase of generatedAiPlan.phases) {
            for (const task of phase.tasks || []) {
              allTasks.push({
                title: `${phase.name}: ${task.title}`,
                description: task.description,
                priority: task.priority,
                estimatedHours: task.estimatedHours,
                customFields: {
                  phase: phase.name,
                  requiredSkills: task.requiredSkills || [],
                  aiGenerated: true
                }
              });
            }
          }

          // Créer toutes les tâches en une seule requête
          const bulkResult = await tasksApi.bulkCreate(newProject.id, allTasks);

          toast({
            title: 'Projet créé avec IA',
            description: `Le projet "${newProject.name}" a été créé avec ${bulkResult.tasksCreated} tâches générées par l'IA`,
          });
        } catch (tasksError) {
          console.error('Erreur création tâches en lot:', tasksError);
          toast({
            title: 'Projet créé',
            description: `Le projet "${newProject.name}" a été créé, mais la génération des tâches IA a échoué`,
            variant: 'error',
          });
        } finally {
          setIsCreatingTasks(false);
        }
      } else {
        toast({
          title: 'Projet créé',
          description: `Le projet "${newProject.name}" a été créé avec succès`,
        });
      }

      onProjectCreated(newProject);
      onClose();
    } catch (error: any) {
      console.error('Erreur création projet:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la création du projet',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateProjectPlan = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Information manquante',
        description: 'Veuillez saisir un nom de projet pour générer un plan IA',
        variant: 'error',
      });
      return;
    }

    try {
      setIsGeneratingPlan(true);

      const suggestions = await projectAiApi.generateProjectPlan({
        projectName: formData.name,
        projectDescription: formData.description,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
      });

      // Sauvegarder le plan IA complet
      setGeneratedAiPlan(suggestions);

      // L'IA ne retourne pas de description spécifique, on garde la description existante
      // ou on pourrait utiliser suggestions.recommendations[0] si disponible
      if (suggestions.recommendations && suggestions.recommendations.length > 0) {
        setFormData(prev => ({
          ...prev,
          description: prev.description || suggestions.recommendations[0],
        }));
      }

      if (suggestions.totalEstimatedDuration) {
        const startDate = formData.startDate ? new Date(formData.startDate) : new Date();
        const endDate = new Date(startDate.getTime() + suggestions.totalEstimatedDuration * 24 * 60 * 60 * 1000);
        
        setFormData(prev => ({
          ...prev,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        }));
      }

      if (suggestions.estimatedBudget) {
        setFormData(prev => ({
          ...prev,
          budget: suggestions.estimatedBudget!.toString(),
        }));
      }

      const totalTasks = suggestions.phases?.reduce((acc, phase) => acc + (phase.tasks?.length || 0), 0) || 0;

      toast({
        title: 'Plan généré',
        description: `Plan IA généré avec ${suggestions.phases?.length || 0} phases et ${totalTasks} tâches`,
      });
    } catch (error: any) {
      console.error('Erreur génération plan:', error);
      toast({
        title: 'Erreur IA',
        description: error.message || 'Erreur lors de la génération du plan',
        variant: 'error',
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const selectedCompany = companies.find(c => c.id === formData.clientCompanyId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="lg" className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Créer un nouveau projet
          </DialogTitle>
          <DialogDescription>
            Définissez les paramètres de votre nouveau projet. L'IA peut vous aider à planifier.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Nom du projet */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nom du projet <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Refonte site web, Application mobile..."
                className={cn(errors.name && 'border-red-500')}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Entreprise cliente */}
            <div className="space-y-2">
              <Label htmlFor="clientCompanyId">
                Entreprise cliente <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.clientCompanyId} 
                onValueChange={(value) => handleInputChange('clientCompanyId', value)}
              >
                <SelectTrigger className={cn(errors.clientCompanyId && 'border-red-500')}>
                  <SelectValue placeholder="Sélectionner une entreprise">
                    {selectedCompany?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {loadingCompanies ? (
                    <div className="p-2 text-center text-muted-foreground">
                      Chargement...
                    </div>
                  ) : companies.length === 0 ? (
                    <div className="p-2 text-center text-muted-foreground">
                      Aucune entreprise trouvée
                    </div>
                  ) : (
                    companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.clientCompanyId && (
                <p className="text-sm text-red-500">{errors.clientCompanyId}</p>
              )}
            </div>

            {/* Plan IA généré - Aperçu */}
            {generatedAiPlan && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Plan IA généré</span>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• {generatedAiPlan.phases?.length || 0} phases de projet</p>
                  <p>• {generatedAiPlan.phases?.reduce((acc: number, phase: any) => acc + (phase.tasks?.length || 0), 0) || 0} tâches détaillées</p>
                  {generatedAiPlan.totalEstimatedDuration && (
                    <p>• Durée estimée : {generatedAiPlan.totalEstimatedDuration} jours</p>
                  )}
                  {generatedAiPlan.estimatedBudget && (
                    <p>• Budget estimé : {formatCurrency(generatedAiPlan.estimatedBudget)}</p>
                  )}
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Les tâches seront automatiquement créées lors de la validation du projet.
                </p>
              </div>
            )}

            {/* Description avec IA */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Description</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateProjectPlan}
                  disabled={isGeneratingPlan || !formData.name.trim()}
                  className="text-xs"
                >
                  {isGeneratingPlan ? (
                    <LoaderIcon className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="w-3 h-3 mr-1" />
                  )}
                  Générer plan IA
                </Button>
              </div>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description détaillée du projet, objectifs, livrables..."
                rows={4}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début</Label>
                <div className="relative">
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={cn(errors.startDate && 'border-red-500')}
                  />
                  <CalendarIcon className="absolute right-3 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin</Label>
                <div className="relative">
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={cn(errors.endDate && 'border-red-500')}
                  />
                  <CalendarIcon className="absolute right-3 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                {errors.endDate && (
                  <p className="text-sm text-red-500">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget">Budget estimé (€)</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                step="0.01"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                placeholder="Ex: 15000"
                className={cn(errors.budget && 'border-red-500')}
              />
              {errors.budget && (
                <p className="text-sm text-red-500">{errors.budget}</p>
              )}
              {formData.budget && parseFloat(formData.budget) > 0 && (
                <p className="text-sm text-muted-foreground">
                  Budget: {formatCurrency(parseFloat(formData.budget))}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading || isCreatingTasks}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isCreatingTasks}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <LoaderIcon className="w-4 h-4 animate-spin mr-2" />
                  Création...
                </>
              ) : isCreatingTasks ? (
                <>
                  <LoaderIcon className="w-4 h-4 animate-spin mr-2" />
                  Génération tâches...
                </>
              ) : (
                'Créer le projet'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
