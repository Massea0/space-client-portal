import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel, SelectGroup, SelectSeparator } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio'
import { TitleInput } from '@/components/ui/title-input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, ConfirmDialog } from '@/components/ui/dialog'
import { DataTable, Column } from '@/components/ui/table'
import { TabsContainer, TabCard } from '@/components/ui/tabs'
import { KanbanBoard, KanbanBoard as KanbanBoardType, KanbanColumn, KanbanCard } from '@/components/ui/kanban'
import { DataView } from '@/components/ui/data-view'
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarSearch, 
  SidebarGroup, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarFooter, 
  SidebarTrigger,
  SidebarProvider,
  type SidebarItem 
} from '@/components/ui/sidebar'
import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastWithProgress,
  ToastProvider, // Importation de ToastProvider depuis le composant toast
  ToastViewport  // Importation de ToastViewport depuis le composant toast
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { DraggableList, DraggableListItem } from "@/components/ui/draggable-list"
import { WorkflowBuilder, WorkflowNodeData } from "@/components/ui/workflow-builder/workflow-builder"
import {
  Spinner,
  Progress,
  Skeleton,
  CircularProgress,
  TableSkeleton,
  CardSkeleton,
  DataViewSkeleton,
  EmptyState
} from "@/components/ui/loading-states"
import {
  InteractiveStatsCard,
  InteractiveActivityCard,
  InteractiveDashboardGrid,
  type ActivityItem
} from "@/components/modules/dashboard"
import { AIInsightsWidget } from "@/components/modules/dashboard/AIInsightsWidget"
import { ModularDashboard } from "@/components/modules/dashboard/ModularDashboard"
import { DashboardWidgetContainer, type DashboardWidget } from "@/components/modules/dashboard/DashboardWidgetContainer"
import DashboardModular from "./DashboardModular"
import { FileIcon, AlertCircle, InfoIcon, CheckCircle, AlertTriangle, Loader2, Plus, FileText, TrendingUp, Users, Building, MessageSquare, ClipboardList, Zap, Brain, BarChart3, LineChart, PieChart, Target, Activity, Gauge, TrendingDown } from "lucide-react"

// Composant pour afficher les exemples de Toast avec leur propre ToastProvider
const ToastDemo = () => {
  return (
    <ToastProvider>
      <div className="space-y-4">
        <ToastWithProgress variant="success" showProgress={true}>
          <div className="flex flex-col gap-1">
            <ToastTitle>Action réussie</ToastTitle>
            <ToastDescription>L'opération a été effectuée avec succès.</ToastDescription>
          </div>
        </ToastWithProgress>
        
        <ToastWithProgress variant="error" showProgress={true}>
          <div className="flex flex-col gap-1">
            <ToastTitle>Erreur</ToastTitle>
            <ToastDescription>Une erreur est survenue lors de l'opération.</ToastDescription>
          </div>
        </ToastWithProgress>
      </div>
      <ToastViewport />
    </ToastProvider>
  )
}

// Composant pour afficher les exemples de Toast avec actions
const ToastActionDemo = () => {
  return (
    <ToastProvider>
      <div className="space-y-4">
        <ToastWithProgress variant="default">
          <div className="flex flex-col gap-1">
            <ToastTitle>Fichier supprimé</ToastTitle>
            <ToastDescription>Le fichier a été déplacé dans la corbeille.</ToastDescription>
          </div>
          <ToastAction onClick={() => {}} altText="Annuler la suppression">
            Annuler
          </ToastAction>
        </ToastWithProgress>
        
        <ToastWithProgress variant="info">
          <div className="flex flex-col gap-1">
            <ToastTitle>Mise à jour disponible</ToastTitle>
            <ToastDescription>Une nouvelle version est prête à être installée.</ToastDescription>
          </div>
          <div className="flex gap-2">
            <ToastAction onClick={() => {}} altText="Installer la mise à jour">
              Installer
            </ToastAction>
            <ToastAction onClick={() => {}} altText="Reporter la mise à jour">
              Plus tard
            </ToastAction>
          </div>
        </ToastWithProgress>
      </div>
      <ToastViewport />
    </ToastProvider>
  )
}

// Nouveaux composants IA Analytics pour la démo
const AIAnalyticsDemo = () => {
  const mockData = {
    totalAmount: 125000,
    pendingAmount: 25000,
    overdueAmount: 8500,
    invoicesCount: 45,
    trends: {
      revenue: 15.2,
      efficiency: 94.8,
      risk: -2.3
    }
  };

  const insights = [
    { 
      title: "Prédiction CA", 
      value: "€143,750", 
      trend: "up" as const, 
      percentage: 15.2,
      description: "Croissance prévue ce mois",
      confidence: 89
    },
    { 
      title: "Risque impayés", 
      value: "2.3%", 
      trend: "down" as const, 
      percentage: -0.8,
      description: "Amélioration vs mois dernier",
      confidence: 76
    },
    { 
      title: "Efficacité", 
      value: "94.8%", 
      trend: "up" as const, 
      percentage: 3.2,
      description: "Score de performance",
      confidence: 95
    },
    { 
      title: "Opportunités", 
      value: "12", 
      trend: "up" as const, 
      percentage: 25,
      description: "Nouveaux prospects identifiés",
      confidence: 82
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <Card key={insight.title} className="border-0 shadow-sm bg-gradient-to-br from-background/50 to-background/80 backdrop-blur-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${
                    insight.trend === 'up' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'
                  }`}>
                    {insight.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{insight.title}</p>
                    <p className="text-xs text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{insight.value}</p>
                  <p className={`text-xs font-medium ${
                    insight.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {insight.percentage > 0 ? '+' : ''}{insight.percentage}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      insight.confidence > 90 ? 'bg-green-500' : 
                      insight.confidence > 75 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${insight.confidence}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{insight.confidence}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graphiques IA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-blue-500" />
              Analyse Prédictive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Graphique temporel IA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Score Global
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-24 h-24 mb-4">
                <Gauge className="h-20 w-20 text-purple-500" />
                <span className="absolute text-lg font-bold">94</span>
              </div>
              <p className="text-sm text-muted-foreground">Performance IA</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DesignSystemShowcase() {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)

  // États et données pour Sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarVariant, setSidebarVariant] = useState<'default' | 'compact' | 'floating'>('default')
  
  // Toast system
  const { toast, success, error, warning, info } = useToast()
  
  // État pour les exemples de loading
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  
  // États pour les composants Sprint 4 - DraggableList
  const [draggableItems, setDraggableItems] = useState<DraggableListItem[]>([
    { id: '1', content: 'Première tâche' },
    { id: '2', content: 'Deuxième tâche' },
    { id: '3', content: 'Troisième tâche' },
    { id: '4', content: 'Quatrième tâche' },
  ])
  
  const [complexDraggableItems, setComplexDraggableItems] = useState<DraggableListItem[]>([
    { 
      id: 'task-1', 
      content: (
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Développer la nouvelle fonctionnalité</div>
            <div className="text-sm text-muted-foreground">Priorité haute • Assigné à Marie</div>
          </div>
          <Badge variant="destructive">Urgent</Badge>
        </div>
      )
    },
    { 
      id: 'task-2', 
      content: (
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Corriger les bugs détectés</div>
            <div className="text-sm text-muted-foreground">Priorité moyenne • Assigné à Pierre</div>
          </div>
          <Badge variant="secondary">En cours</Badge>
        </div>
      )
    },
    { 
      id: 'task-3', 
      content: (
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Réviser la documentation</div>
            <div className="text-sm text-muted-foreground">Priorité basse • Non assigné</div>
          </div>
          <Badge variant="outline">À faire</Badge>
        </div>
      )
    },
  ])
  
  // Gestionnaire pour réorganiser les éléments
  const handleReorder = (items: DraggableListItem[], setItems: React.Dispatch<React.SetStateAction<DraggableListItem[]>>) => 
    (fromIndex: number, toIndex: number) => {
      const newItems = [...items]
      const [removed] = newItems.splice(fromIndex, 1)
      newItems.splice(toIndex, 0, removed)
      setItems(newItems)
    }

  // États et données pour WorkflowBuilder
  const initialWorkflowNodes = [
    {
      id: '1',
      type: 'workflowNode',
      position: { x: 100, y: 100 },
      data: { 
        label: 'Démarrer le processus', 
        type: 'task' as const,
        config: { autoStart: true }
      },
    },
    {
      id: '2',
      type: 'workflowNode',
      position: { x: 300, y: 100 },
      data: { 
        label: 'Vérification des conditions', 
        type: 'condition' as const,
        config: { condition: 'status === "active"' }
      },
    },
    {
      id: '3',
      type: 'workflowNode',
      position: { x: 500, y: 100 },
      data: { 
        label: 'Envoyer notification', 
        type: 'email' as const,
        config: { template: 'notification', recipients: 'admin@myspace.com' }
      },
    },
  ];

  const initialWorkflowEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true },
    { id: 'e2-3', source: '2', target: '3', animated: true },
  ];

  const handleWorkflowSave = (nodes: any[], edges: any[]) => {
    console.log('Workflow sauvegardé:', { nodes, edges });
    toast({
      title: "Succès",
      description: "Workflow sauvegardé avec succès !",
    });
  };
  
  // Simuler une progression pour les démos
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0
        }
        return prev + 5
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  const simulateLoading = (duration = 2000) => {
    setLoading(true)
    setTimeout(() => setLoading(false), duration)
  }
  
  // Données d'exemple pour le Sidebar
  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      title: 'Tableau de bord',
      icon: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
      href: '/dashboard',
      isActive: true
    },
    {
      id: 'projects',
      title: 'Projets',
      icon: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25A1.125 1.125 0 0 1 2.25 18.375v-2.25Z" />
        </svg>
      ),
      badge: 8,
      children: [
        { id: 'all-projects', title: 'Tous les projets', href: '/projects' },
        { id: 'my-projects', title: 'Mes projets', href: '/projects/mine', badge: 3 },
        { id: 'archived', title: 'Archivés', href: '/projects/archived' },
      ]
    },
    {
      id: 'tasks',
      title: 'Tâches',
      icon: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      badge: 'Nouveau',
      children: [
        { id: 'my-tasks', title: 'Mes tâches', href: '/tasks/mine', badge: 5 },
        { id: 'assigned-tasks', title: 'Assignées', href: '/tasks/assigned' },
        { id: 'completed-tasks', title: 'Terminées', href: '/tasks/completed' },
      ]
    },
    {
      id: 'documents',
      title: 'Documents',
      icon: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      ),
      children: [
        { id: 'recent-docs', title: 'Récents', href: '/documents/recent' },
        { id: 'shared-docs', title: 'Partagés', href: '/documents/shared', badge: 2 },
        { id: 'templates', title: 'Modèles', href: '/documents/templates' },
      ]
    },
    {
      id: 'team',
      title: 'Équipe',
      icon: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      ),
      href: '/team'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      ),
      href: '/analytics'
    },
    {
      id: 'settings',
      title: 'Paramètres',
      icon: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      ),
      children: [
        { id: 'profile', title: 'Profil', href: '/settings/profile' },
        { id: 'account', title: 'Compte', href: '/settings/account' },
        { id: 'notifications', title: 'Notifications', href: '/settings/notifications', badge: 1 },
        { id: 'integrations', title: 'Intégrations', href: '/settings/integrations' },
      ]
    }
  ]

  // Données exemple pour le Kanban
  const [kanbanBoard, setKanbanBoard] = useState<KanbanBoardType>({
    id: 'board-1',
    title: 'Projet Arcadis Enterprise OS',
    columns: [
      {
        id: 'todo',
        title: 'À faire',
        color: '#64748b',
        description: 'Tâches en attente de démarrage',
        wipLimit: 5,
        cards: [
          {
            id: 'card-1',
            title: 'Refonte UI du dashboard',
            description: 'Moderniser l\'interface principale avec Twenty design',
            assignee: { id: 'user-1', name: 'Alice Martin' },
            dueDate: '2024-01-15',
            priority: 'high',
            status: 'todo',
            tags: ['UI/UX', 'Frontend'],
            estimatedTime: '5j'
          },
          {
            id: 'card-2',
            title: 'Optimisation base de données',
            description: 'Améliorer les performances des requêtes critiques',
            assignee: { id: 'user-2', name: 'Bob Dubois' },
            dueDate: '2024-01-20',
            priority: 'medium',
            status: 'todo',
            tags: ['Backend', 'Performance'],
            estimatedTime: '3j'
          },
          {
            id: 'card-3',
            title: 'Tests automatisés',
            description: 'Mise en place de la suite de tests E2E',
            priority: 'low',
            status: 'todo',
            tags: ['Testing', 'QA'],
            estimatedTime: '2j'
          }
        ]
      },
      {
        id: 'in-progress',
        title: 'En cours',
        color: '#3b82f6',
        description: 'Tâches actuellement en développement',
        wipLimit: 3,
        cards: [
          {
            id: 'card-4',
            title: 'Composants Kanban',
            description: 'Développement du système de cartes Kanban',
            assignee: { id: 'user-3', name: 'Claire Moreau' },
            dueDate: '2024-01-12',
            priority: 'urgent',
            status: 'in-progress',
            tags: ['Frontend', 'Components'],
            estimatedTime: '4j'
          },
          {
            id: 'card-5',
            title: 'API REST v2',
            description: 'Migration vers la nouvelle version de l\'API',
            assignee: { id: 'user-4', name: 'David Bernard' },
            priority: 'high',
            status: 'in-progress',
            tags: ['Backend', 'API'],
            estimatedTime: '6j'
          }
        ]
      },
      {
        id: 'review',
        title: 'Révision',
        color: '#f59e0b',
        description: 'Tâches en attente de validation',
        wipLimit: 2,
        cards: [
          {
            id: 'card-6',
            title: 'Design System Documentation',
            description: 'Documentation complète du design system',
            assignee: { id: 'user-5', name: 'Emma Petit' },
            priority: 'medium',
            status: 'done',
            tags: ['Documentation', 'Design'],
            estimatedTime: '2j'
          }
        ]
      },
      {
        id: 'done',
        title: 'Terminé',
        color: '#10b981',
        description: 'Tâches finalisées et déployées',
        cards: [
          {
            id: 'card-7',
            title: 'Configuration CI/CD',
            description: 'Pipeline de déploiement automatique configuré',
            assignee: { id: 'user-2', name: 'Bob Dubois' },
            priority: 'high',
            status: 'done',
            tags: ['DevOps', 'CI/CD'],
            estimatedTime: '3j'
          },
          {
            id: 'card-8',
            title: 'Authentification SSO',
            description: 'Intégration du Single Sign-On',
            assignee: { id: 'user-1', name: 'Alice Martin' },
            priority: 'high',
            status: 'done',
            tags: ['Security', 'Backend'],
            estimatedTime: '4j'
          }
        ]
      }
    ]
  })

  // Données exemple pour la table
  const sampleUsers = [
    { id: 1, name: "Alice Martin", email: "alice@example.com", role: "Admin", status: "Active" },
    { id: 2, name: "Bob Dubois", email: "bob@example.com", role: "User", status: "Active" },
    { id: 3, name: "Claire Moreau", email: "claire@example.com", role: "Editor", status: "Inactive" },
    { id: 4, name: "David Bernard", email: "david@example.com", role: "User", status: "Active" },
    { id: 5, name: "Emma Petit", email: "emma@example.com", role: "Admin", status: "Pending" },
  ]

  // Données pour DataView avec id string
  const dataViewUsers = [
    { id: "1", name: "Alice Martin", email: "alice@example.com", role: "Admin", status: "Active" },
    { id: "2", name: "Bob Dubois", email: "bob@example.com", role: "User", status: "Active" },
    { id: "3", name: "Claire Moreau", email: "claire@example.com", role: "Editor", status: "Inactive" },
    { id: "4", name: "David Bernard", email: "david@example.com", role: "User", status: "Active" },
    { id: "5", name: "Emma Petit", email: "emma@example.com", role: "Admin", status: "Pending" },
    { id: "6", name: "Frank Leroy", email: "frank@example.com", role: "Manager", status: "Active" },
    { id: "7", name: "Grace Duval", email: "grace@example.com", role: "User", status: "Active" },
    { id: "8", name: "Hugo Blanc", email: "hugo@example.com", role: "Editor", status: "Inactive" },
  ]

  const tableColumns: Column<typeof sampleUsers[0]>[] = [
    { 
      id: "name", 
      header: "Nom", 
      accessorKey: "name", 
      sortable: true 
    },
    { 
      id: "email", 
      header: "Email", 
      accessorKey: "email", 
      sortable: true 
    },
    { 
      id: "role", 
      header: "Rôle", 
      accessor: (row) => (
        <Badge variant="secondary">{row.role}</Badge>
      )
    },
    { 
      id: "status", 
      header: "Statut", 
      align: "center" as const,
      accessor: (row) => (
        <Badge 
          variant={row.status === "Active" ? "default" : row.status === "Pending" ? "secondary" : "outline"}
        >
          {row.status}
        </Badge>
      )
    },
  ]
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="layout-modern py-12 border-b border-neutral-15">
        <div className="text-center space-y-4">
          <h1 className="text-display font-semibold text-foreground">
            Arcadis Enterprise OS
          </h1>
          <p className="text-subheading text-neutral-60 max-w-2xl mx-auto">
            Design System Twenty-Inspired - Interface moderne et épurée pour l'excellence professionnelle
          </p>
        </div>
      </div>

      <div className="layout-modern py-12 space-y-16">
        {/* Buttons Section */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-heading font-semibold text-foreground">Boutons Modernes</h2>
            <p className="text-body text-neutral-60">
              Boutons avec animations subtiles et états interactifs
            </p>
          </div>
          
          <div className="grid-modern">
            <div className="space-y-6">
              {/* Button Variants */}
              <div className="space-y-4">
                <h3 className="text-subheading font-medium text-foreground">Variantes</h3>
                <div className="flex flex-wrap gap-4">
                  <Button variant="default">Primary Button</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="warning">Warning</Button>
                  <Button variant="link">Link Button</Button>
                </div>
              </div>

              {/* Button Sizes */}
              <div className="space-y-4">
                <h3 className="text-subheading font-medium text-foreground">Tailles</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="xs">Extra Small</Button>
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                </div>
              </div>

              {/* Icon Buttons */}
              <div className="space-y-4">
                <h3 className="text-subheading font-medium text-foreground">Boutons Icônes</h3>
                <div className="flex flex-wrap gap-4">
                  <Button size="icon" variant="default">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </Button>
                  <Button size="icon-sm" variant="secondary">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                  <Button size="icon-lg" variant="outline">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-heading font-semibold text-foreground">Cartes Épurées</h2>
            <p className="text-body text-neutral-60">
              Composants de cartes avec élévations subtiles et interactions fluides
            </p>
          </div>

          <div className="grid-cards">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Carte Standard</CardTitle>
                <CardDescription>
                  Une carte avec le style par défaut, ombres subtiles et interactions élégantes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body text-neutral-70">
                  Contenu de la carte avec espacement optimisé pour une lecture confortable.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Carte Élevée</CardTitle>
                <CardDescription>
                  Carte avec une élévation plus prononcée pour attirer l'attention.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Nouveau</Badge>
                    <Badge variant="secondary">Recommandé</Badge>
                  </div>
                  <p className="text-body text-neutral-70">
                    Contenu enrichi avec des éléments interactifs et des badges.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Annuler</Button>
                  <Button size="sm">Confirmer</Button>
                </div>
              </CardFooter>
            </Card>

            <Card variant="interactive">
              <CardHeader>
                <CardTitle>Carte Interactive</CardTitle>
                <CardDescription>
                  Carte entièrement cliquable avec animation de hover subtile.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-20 bg-arcadis-blue-subtle rounded-lg flex items-center justify-center">
                    <span className="text-sm text-arcadis-blue font-medium">Zone de contenu</span>
                  </div>
                  <p className="text-body text-neutral-70">
                    Cliquez n'importe où sur cette carte pour interagir.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Inputs Section */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-heading font-semibold text-foreground">Champs de Saisie</h2>
            <p className="text-body text-neutral-60">
              Inputs modernes avec focus states subtils et feedback visuel
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-label text-foreground">Input Standard</label>
                <Input 
                  placeholder="Saisissez votre texte..."
                  variant="default"
                  inputSize="default"
                />
              </div>

              <div className="space-y-3">
                <label className="text-label text-foreground">Input avec Succès</label>
                <Input 
                  placeholder="Validation réussie"
                  variant="success"
                  inputSize="default"
                  defaultValue="john@arcadis.com"
                />
              </div>

              <div className="space-y-3">
                <label className="text-label text-foreground">Input avec Erreur</label>
                <Input 
                  placeholder="Champ obligatoire"
                  variant="error"
                  inputSize="default"
                />
                <p className="text-xs text-arcadis-red">Ce champ est obligatoire</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-label text-foreground">Input Small</label>
                <Input 
                  placeholder="Taille réduite"
                  inputSize="sm"
                />
              </div>

              <div className="space-y-3">
                <label className="text-label text-foreground">Input Large</label>
                <Input 
                  placeholder="Taille élargie"
                  inputSize="lg"
                />
              </div>

              <div className="space-y-3">
                <label className="text-label text-foreground">Input Désactivé</label>
                <Input 
                  placeholder="Champ désactivé"
                  disabled
                  defaultValue="Valeur verrouillée"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Select Components Section */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-heading font-semibold text-foreground">Select Dropdown</h2>
            <p className="text-body text-neutral-60">
              Menus déroulants modernes avec variants Twenty-inspired et animations fluides
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-label text-foreground">Select Standard</label>
                <Select>
                  <SelectTrigger variant="default" size="default">
                    <SelectValue placeholder="Sélectionnez une option..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                    <SelectSeparator />
                    <SelectItem value="option4">Option 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-label text-foreground">Select avec Succès</label>
                <Select>
                  <SelectTrigger variant="success" size="default">
                    <SelectValue placeholder="Validation réussie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="valid1">Choix validé ✓</SelectItem>
                    <SelectItem value="valid2">Option confirmée</SelectItem>
                    <SelectItem value="valid3">Sélection approuvée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-label text-foreground">Select avec Erreur</label>
                <Select>
                  <SelectTrigger variant="error" size="default">
                    <SelectValue placeholder="Sélection requise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="error1">Option 1</SelectItem>
                    <SelectItem value="error2">Option 2</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-arcadis-red">Veuillez faire une sélection</p>
              </div>

              <div className="space-y-3">
                <label className="text-label text-foreground">Select avec Groupes</label>
                <Select>
                  <SelectTrigger variant="default" size="default">
                    <SelectValue placeholder="Choisir un framework..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Frontend</SelectLabel>
                      <SelectItem value="react">React</SelectItem>
                      <SelectItem value="vue">Vue.js</SelectItem>
                      <SelectItem value="angular">Angular</SelectItem>
                    </SelectGroup>
                    <SelectSeparator />
                    <SelectGroup>
                      <SelectLabel>Backend</SelectLabel>
                      <SelectItem value="node">Node.js</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-label text-foreground">Select Small</label>
                <Select>
                  <SelectTrigger variant="default" size="sm">
                    <SelectValue placeholder="Taille réduite" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm1">Option Small 1</SelectItem>
                    <SelectItem value="sm2">Option Small 2</SelectItem>
                    <SelectItem value="sm3">Option Small 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-label text-foreground">Select Large</label>
                <Select>
                  <SelectTrigger variant="default" size="lg">
                    <SelectValue placeholder="Taille élargie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lg1">Option Large 1</SelectItem>
                    <SelectItem value="lg2">Option Large 2</SelectItem>
                    <SelectItem value="lg3">Option Large 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-label text-foreground">Select Warning</label>
                <Select>
                  <SelectTrigger variant="warning" size="default">
                    <SelectValue placeholder="Attention requise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warn1">Option à vérifier</SelectItem>
                    <SelectItem value="warn2">Choix temporaire</SelectItem>
                    <SelectItem value="warn3">Sélection en attente</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-arcadis-orange">Cette option nécessite une validation</p>
              </div>

              <div className="space-y-3">
                <label className="text-label text-foreground">Select Désactivé</label>
                <Select disabled>
                  <SelectTrigger variant="default" size="default" className="opacity-50 cursor-not-allowed">
                    <SelectValue placeholder="Select désactivé" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disabled1">Option 1</SelectItem>
                    <SelectItem value="disabled2">Option 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Code Example */}
          <div className="mt-8 p-6 bg-muted rounded-lg border border-border">
            <h4 className="text-sm font-medium text-foreground mb-4">Exemple d'utilisation</h4>
            <pre className="text-xs text-muted-foreground overflow-x-auto">
{`<Select>
  <SelectTrigger variant="default" size="default">
    <SelectValue placeholder="Sélectionnez..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>`}
            </pre>
          </div>
        </section>

        {/* Checkbox Components Section */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-heading font-semibold text-foreground">Checkbox Components</h2>
            <p className="text-body text-neutral-60">
              Cases à cocher modernes avec variants Twenty-inspired, animations et état indéterminé
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-70">Variants par défaut</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox id="checkbox-default" variant="default" />
                    <label htmlFor="checkbox-default" className="text-sm text-gray-70 cursor-pointer">
                      Checkbox par défaut
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox id="checkbox-success" variant="success" />
                    <label htmlFor="checkbox-success" className="text-sm text-gray-70 cursor-pointer">
                      Validation réussie
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox id="checkbox-warning" variant="warning" />
                    <label htmlFor="checkbox-warning" className="text-sm text-gray-70 cursor-pointer">
                      Attention requise
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox id="checkbox-error" variant="error" />
                    <label htmlFor="checkbox-error" className="text-sm text-gray-70 cursor-pointer">
                      Erreur détectée
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-70">États spéciaux</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox id="checkbox-checked" variant="default" defaultChecked />
                    <label htmlFor="checkbox-checked" className="text-sm text-gray-70 cursor-pointer">
                      Pré-sélectionné
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox id="checkbox-indeterminate" variant="default" indeterminate />
                    <label htmlFor="checkbox-indeterminate" className="text-sm text-gray-70 cursor-pointer">
                      État indéterminé
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox id="checkbox-disabled" variant="default" disabled />
                    <label htmlFor="checkbox-disabled" className="text-sm text-gray-70 cursor-not-allowed opacity-50">
                      Désactivé
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-70">Tailles disponibles</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox id="checkbox-sm" variant="default" size="sm" />
                    <label htmlFor="checkbox-sm" className="text-sm text-gray-70 cursor-pointer">
                      Petite taille (16px)
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox id="checkbox-default-size" variant="default" size="default" />
                    <label htmlFor="checkbox-default-size" className="text-sm text-gray-70 cursor-pointer">
                      Taille par défaut (20px)
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox id="checkbox-lg" variant="default" size="lg" />
                    <label htmlFor="checkbox-lg" className="text-sm text-gray-70 cursor-pointer">
                      Grande taille (24px)
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-70">Groupe de checkboxes</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox id="feature-1" variant="default" />
                    <label htmlFor="feature-1" className="text-sm text-gray-70 cursor-pointer">
                      Notifications par email
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox id="feature-2" variant="default" defaultChecked />
                    <label htmlFor="feature-2" className="text-sm text-gray-70 cursor-pointer">
                      Synchronisation automatique
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox id="feature-3" variant="default" />
                    <label htmlFor="feature-3" className="text-sm text-gray-70 cursor-pointer">
                      Mode sombre
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox id="feature-4" variant="default" defaultChecked />
                    <label htmlFor="feature-4" className="text-sm text-gray-70 cursor-pointer">
                      Analytiques avancées
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Code Example */}
          <div className="mt-8 p-6 bg-gray-5 rounded-lg border border-gray-20">
            <h4 className="text-sm font-medium text-gray-70 mb-4">Exemple d'utilisation</h4>
            <pre className="text-xs text-gray-60 overflow-x-auto">
{`<div className="flex items-center space-x-3">
  <Checkbox id="example" variant="default" size="default" />
  <label htmlFor="example" className="text-sm cursor-pointer">
    Accepter les conditions
  </label>
</div>`}
            </pre>
          </div>
        </section>

        {/* Radio Components Section */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-heading font-semibold text-foreground">Radio Components</h2>
            <p className="text-body text-neutral-60">
              Boutons radio modernes avec variants Twenty-inspired et layouts flexibles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-70">Groupe vertical (défaut)</h4>
                <RadioGroup defaultValue="option-1" orientation="vertical">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="option-1" id="r1" variant="default" />
                    <label htmlFor="r1" className="text-sm text-gray-70 cursor-pointer">Option 1</label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="option-2" id="r2" variant="default" />
                    <label htmlFor="r2" className="text-sm text-gray-70 cursor-pointer">Option 2</label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="option-3" id="r3" variant="default" />
                    <label htmlFor="r3" className="text-sm text-gray-70 cursor-pointer">Option 3</label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-70">Variants colorés</h4>
                <div className="space-y-4">
                  <RadioGroup defaultValue="success" orientation="vertical">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="success" id="r-success" variant="success" />
                      <label htmlFor="r-success" className="text-sm text-gray-70 cursor-pointer">Validation réussie</label>
                    </div>
                  </RadioGroup>
                  <RadioGroup defaultValue="warning" orientation="vertical">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="warning" id="r-warning" variant="warning" />
                      <label htmlFor="r-warning" className="text-sm text-gray-70 cursor-pointer">Attention requise</label>
                    </div>
                  </RadioGroup>
                  <RadioGroup defaultValue="error" orientation="vertical">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="error" id="r-error" variant="error" />
                      <label htmlFor="r-error" className="text-sm text-gray-70 cursor-pointer">Erreur détectée</label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-70">Groupe horizontal</h4>
                <RadioGroup defaultValue="horizontal-1" orientation="horizontal">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="horizontal-1" id="h1" variant="default" />
                    <label htmlFor="h1" className="text-sm text-gray-70 cursor-pointer">Option A</label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="horizontal-2" id="h2" variant="default" />
                    <label htmlFor="h2" className="text-sm text-gray-70 cursor-pointer">Option B</label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="horizontal-3" id="h3" variant="default" />
                    <label htmlFor="h3" className="text-sm text-gray-70 cursor-pointer">Option C</label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-70">Tailles disponibles</h4>
                <div className="space-y-4">
                  <RadioGroup defaultValue="size-sm" orientation="vertical">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="size-sm" id="r-sm" variant="default" size="sm" />
                      <label htmlFor="r-sm" className="text-sm text-gray-70 cursor-pointer">Petite (16px)</label>
                    </div>
                  </RadioGroup>
                  <RadioGroup defaultValue="size-default" orientation="vertical">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="size-default" id="r-default" variant="default" size="default" />
                      <label htmlFor="r-default" className="text-sm text-gray-70 cursor-pointer">Défaut (20px)</label>
                    </div>
                  </RadioGroup>
                  <RadioGroup defaultValue="size-lg" orientation="vertical">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="size-lg" id="r-lg" variant="default" size="lg" />
                      <label htmlFor="r-lg" className="text-sm text-gray-70 cursor-pointer">Grande (24px)</label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </div>

          {/* Code Example */}
          <div className="mt-8 p-6 bg-gray-5 rounded-lg border border-gray-20">
            <h4 className="text-sm font-medium text-gray-70 mb-4">Exemple d'utilisation</h4>
            <pre className="text-xs text-gray-60 overflow-x-auto">
{`<RadioGroup defaultValue="option-1" orientation="vertical">
  <div className="flex items-center space-x-3">
    <RadioGroupItem value="option-1" id="r1" variant="default" />
    <label htmlFor="r1">Option 1</label>
  </div>
  <div className="flex items-center space-x-3">
    <RadioGroupItem value="option-2" id="r2" variant="default" />
    <label htmlFor="r2">Option 2</label>
  </div>
</RadioGroup>`}
            </pre>
          </div>
        </section>

        {/* TitleInput Components Section */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-heading font-semibold text-foreground">TitleInput Components</h2>
            <p className="text-body text-neutral-60">
              Inputs spécialisés pour l'édition inline de titres avec auto-resize et validation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-70">Variants typographiques</h4>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-60 uppercase tracking-wide">H1 - Titre Principal</label>
                    <TitleInput 
                      variant="h1"
                      value="Titre Principal Éditable"
                      placeholder="Entrez un titre principal..."
                      onValueChange={(value) => console.log('H1 changed:', value)}
                      onSave={(value) => console.log('H1 saved:', value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-60 uppercase tracking-wide">H2 - Titre de Section</label>
                    <TitleInput 
                      variant="h2"
                      value="Titre de Section"
                      placeholder="Entrez un titre de section..."
                      onValueChange={(value) => console.log('H2 changed:', value)}
                      onSave={(value) => console.log('H2 saved:', value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-60 uppercase tracking-wide">H3 - Sous-titre</label>
                    <TitleInput 
                      variant="h3"
                      value="Sous-titre Éditable"
                      placeholder="Entrez un sous-titre..."
                      onValueChange={(value) => console.log('H3 changed:', value)}
                      onSave={(value) => console.log('H3 saved:', value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-60 uppercase tracking-wide">Subtitle - Description</label>
                    <TitleInput 
                      variant="subtitle"
                      value="Description éditable avec du texte plus long qui peut s'étendre sur plusieurs lignes selon le contenu saisi"
                      placeholder="Entrez une description..."
                      minRows={2}
                      maxRows={4}
                      onValueChange={(value) => console.log('Subtitle changed:', value)}
                      onSave={(value) => console.log('Subtitle saved:', value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-70">États et validation</h4>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-60 uppercase tracking-wide">État par défaut</label>
                    <TitleInput 
                      variant="default"
                      value="Cliquez pour éditer ce texte"
                      placeholder="Texte d'exemple..."
                      onValueChange={(value) => console.log('Default changed:', value)}
                      onSave={(value) => console.log('Default saved:', value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-60 uppercase tracking-wide">État d'erreur</label>
                    <TitleInput 
                      variant="default"
                      state="error"
                      value="Titre avec erreur"
                      errorMessage="Le titre doit contenir au moins 3 caractères"
                      placeholder="Titre obligatoire..."
                      onValueChange={(value) => console.log('Error changed:', value)}
                      onSave={(value) => console.log('Error saved:', value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-60 uppercase tracking-wide">État de succès</label>
                    <TitleInput 
                      variant="default"
                      state="success"
                      value="Titre validé avec succès"
                      successMessage="Titre sauvegardé avec succès"
                      placeholder="Titre valide..."
                      onValueChange={(value) => console.log('Success changed:', value)}
                      onSave={(value) => console.log('Success saved:', value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-60 uppercase tracking-wide">Texte vide</label>
                    <TitleInput 
                      variant="default"
                      value=""
                      placeholder="Cliquez pour ajouter un titre..."
                      onValueChange={(value) => console.log('Empty changed:', value)}
                      onSave={(value) => console.log('Empty saved:', value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-70">Configuration</h4>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-20 rounded-lg space-y-3">
                    <h5 className="text-xs font-medium text-gray-70">Multi-lignes avec contraintes</h5>
                    <TitleInput 
                      variant="default"
                      value="Texte qui peut s'étendre sur plusieurs lignes selon le contenu. L'auto-resize fonctionne automatiquement."
                      placeholder="Entrez un texte long..."
                      minRows={3}
                      maxRows={6}
                      saveOnEnter={false}
                      onValueChange={(value) => console.log('Multiline changed:', value)}
                      onSave={(value) => console.log('Multiline saved:', value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dialogues */}
          <div className="layout-modern space-y-8">
            <h3 className="text-subheading font-semibold text-foreground">Dialogues</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Dialogues d'Information</CardTitle>
                  <CardDescription>Composants pour l'affichage d'informations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Dialogue Simple</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Dialogue d'Information</DialogTitle>
                        <DialogDescription>
                          Ceci est un dialogue simple pour afficher des informations importantes à l'utilisateur.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline">Annuler</Button>
                        <Button>Confirmer</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Grande Modale</Button>
                    </DialogTrigger>
                    <DialogContent size="xl">
                      <DialogHeader>
                        <DialogTitle>Grande Modale</DialogTitle>
                        <DialogDescription>
                          Cette modale utilise une taille plus grande pour afficher plus de contenu.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <div className="space-y-4">
                          <Input placeholder="Nom complet" />
                          <Input placeholder="Email" />
                          <Input placeholder="Téléphone" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Annuler</Button>
                        <Button>Sauvegarder</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dialogues de Confirmation</CardTitle>
                <CardDescription>Composants pré-configurés pour les confirmations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => setConfirmDialogOpen(true)}
                  >
                    Confirmation Standard
                  </Button>
                  
                  <Button 
                    variant="destructive"
                    onClick={() => setFormDialogOpen(true)}
                  >
                    Action Destructive
                  </Button>
                </div>

                <ConfirmDialog
                  isOpen={confirmDialogOpen}
                  onClose={() => setConfirmDialogOpen(false)}
                  onConfirm={() => {
                    console.log("Action confirmée")
                    setConfirmDialogOpen(false)
                  }}
                  title="Confirmer l'action"
                  description="Êtes-vous sûr de vouloir continuer ? Cette action peut être annulée."
                />

                <ConfirmDialog
                  isOpen={formDialogOpen}
                  onClose={() => setFormDialogOpen(false)}
                  onConfirm={() => {
                    console.log("Suppression confirmée")
                    setFormDialogOpen(false)
                  }}
                  title="Supprimer l'élément"
                  description="Cette action est irréversible. L'élément sera définitivement supprimé."
                  confirmText="Supprimer"
                  variant="destructive"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

        {/* Table Section */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-heading font-semibold text-foreground">Tables de Données</h2>
            <p className="text-body text-neutral-60">
              Tables intelligentes avec tri, filtrage et interactions avancées
            </p>
          </div>

          <div className="grid-cards">
            <Card>
              <CardHeader>
                <CardTitle>Table de Base</CardTitle>
                <CardDescription>Table avec tri et interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable 
                  data={sampleUsers}
                  columns={tableColumns}
                  sortable
                  hoverable
                  onRowClick={(user) => console.log("Utilisateur sélectionné:", user)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Variations de Table</CardTitle>
                <CardDescription>Différents styles et densités d'affichage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Table Standard</h4>
                  <DataTable 
                    data={sampleUsers.slice(0, 3)}
                    columns={tableColumns}
                    variant="default"
                    striped
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Table Compacte</h4>
                  <DataTable 
                    data={sampleUsers.slice(0, 3)}
                    columns={tableColumns}
                    variant="compact"
                    striped
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Table Dense (Style Entra ID)</h4>
                  <DataTable 
                    data={sampleUsers.slice(0, 3)}
                    columns={tableColumns}
                    variant="dense"
                    striped
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Table avec États</h4>
                  <DataTable 
                    data={[]}
                    columns={tableColumns}
                    emptyMessage="Aucun utilisateur trouvé"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Table en Chargement</h4>
                  <DataTable 
                    data={[]}
                    columns={tableColumns}
                    loading
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Kanban Section */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-heading font-semibold text-foreground">Tableau Kanban</h2>
            <p className="text-body text-neutral-60">
              Système de gestion de projet avec drag & drop, colonnes personnalisables et limites WIP
            </p>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kanban Board - Projet Arcadis</CardTitle>
                <CardDescription>
                  Interface Kanban inspirée de Twenty avec drag & drop fluide, gestion des priorités et limitation du WIP
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[600px] w-full border border-gray-200 rounded-lg overflow-hidden">
                  <KanbanBoard
                    board={kanbanBoard}
                    onBoardChange={setKanbanBoard}
                    showWipLimits={true}
                    allowQuickAdd={true}
                    className="h-full"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fonctionnalités Kanban</CardTitle>
                  <CardDescription>Caractéristiques principales du composant</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Drag & Drop fluide entre colonnes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Réorganisation des cartes dans une colonne</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Déplacement des colonnes entières</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Limites WIP avec alertes visuelles</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Ajout rapide de cartes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Gestion des priorités et assignations</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">États visuels et animations</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Support clavier et accessibilité</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Détails des Cartes</CardTitle>
                  <CardDescription>Informations riches sur chaque tâche</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">Titre</Badge>
                      <span className="text-sm">Nom et description de la tâche</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">Assigné</Badge>
                      <span className="text-sm">Personne responsable</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="text-xs bg-red-100 text-red-800">Priorité</Badge>
                      <span className="text-sm">Urgent, High, Medium, Low</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">Due Date</Badge>
                      <span className="text-sm">Date d'échéance</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">Tags</Badge>
                      <span className="text-sm">Catégories et labels</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">Temps</Badge>
                      <span className="text-sm">Estimation effort</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="text-xs bg-blue-100 text-blue-800">Statut</Badge>
                      <span className="text-sm">État de progression</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Options de Configuration</CardTitle>
                <CardDescription>Personnalisation du comportement du Kanban</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Contrôles</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="wip-limits" checked />
                        <label htmlFor="wip-limits" className="text-sm">Limites WIP</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="quick-add" checked />
                        <label htmlFor="quick-add" className="text-sm">Ajout rapide</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="compact-mode" />
                        <label htmlFor="compact-mode" className="text-sm">Mode compact</label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Interactions</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div>• Glisser-déposer les cartes</div>
                      <div>• Réorganiser les colonnes</div>
                      <div>• Édition inline</div>
                      <div>• Actions contextuelles</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Raccourcis</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div>• Échap : Annuler</div>
                      <div>• Entrée : Confirmer</div>
                      <div>• Flèches : Navigation</div>
                      <div>• Espace : Sélection</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* DataView Section */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-heading font-semibold text-foreground">Container DataView</h2>
            <p className="text-body text-neutral-60">
              Vue unifiée avec basculement Table/Kanban/Liste, filtres avancés et actions bulk
            </p>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>DataView - Interface Unifiée</CardTitle>
                <CardDescription>
                  Container intelligent avec basculement de vues, recherche, filtres et actions contextuelles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataView
                  data={dataViewUsers}
                  columns={[
                    {
                      id: 'name',
                      header: 'Nom',
                      accessorKey: 'name',
                      searchable: true,
                      sortable: true
                    },
                    {
                      id: 'email',
                      header: 'Email',
                      accessorKey: 'email',
                      searchable: true,
                      sortable: true
                    },
                    {
                      id: 'role',
                      header: 'Rôle',
                      accessorKey: 'role',
                      filterable: true,
                      sortable: true
                    },
                    {
                      id: 'status',
                      header: 'Statut',
                      accessorKey: 'status',
                      filterable: true,
                      accessor: (user) => (
                        <Badge variant={user.status === 'Active' ? 'success' : 'secondary'}>
                          {user.status}
                        </Badge>
                      )
                    }
                  ]}
                  availableViews={['table', 'list', 'grid']}
                  enableSearch={true}
                  enableFilters={true}
                  filters={[
                    {
                      id: 'role',
                      label: 'Rôle',
                      type: 'select',
                      options: [
                        { label: 'Admin', value: 'Admin' },
                        { label: 'Utilisateur', value: 'User' },
                        { label: 'Manager', value: 'Manager' }
                      ]
                    },
                    {
                      id: 'status',
                      label: 'Statut',
                      type: 'select',
                      options: [
                        { label: 'Actif', value: 'Active' },
                        { label: 'Inactif', value: 'Inactive' }
                      ]
                    }
                  ]}
                  bulkActions={[
                    {
                      id: 'export',
                      label: 'Exporter',
                      action: (ids) => console.log('Export:', ids)
                    },
                    {
                      id: 'delete',
                      label: 'Supprimer',
                      action: (ids) => console.log('Delete:', ids)
                    }
                  ]}
                  onRowClick={(user) => console.log('Utilisateur sélectionné:', user)}
                  renderCard={(user) => (
                    <div className="space-y-2">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" size="sm">{user.role}</Badge>
                        <Badge variant={user.status === 'Active' ? 'success' : 'secondary'} size="sm">
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                  )}
                  renderListItem={(user) => (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" size="sm">{user.role}</Badge>
                        <Badge variant={user.status === 'Active' ? 'success' : 'secondary'} size="sm">
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                  )}
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fonctionnalités DataView</CardTitle>
                  <CardDescription>Capacités du container unifié</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Basculement instantané entre vues</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Recherche en temps réel</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Filtres avancés persistants</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Tri multi-colonnes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Actions bulk avec sélection</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Export et gestion colonnes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Renderers personnalisés</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">États de chargement et erreur</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vues Disponibles</CardTitle>
                  <CardDescription>Modes d'affichage adaptatifs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">Table</Badge>
                      <span className="text-sm">Vue tabulaire avec tri et colonnes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">Liste</Badge>
                      <span className="text-sm">Affichage linéaire compact</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">Grille</Badge>
                      <span className="text-sm">Cartes en grille responsive</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">Kanban</Badge>
                      <span className="text-sm">Vue par colonnes de statut</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm font-medium mb-2">Filtres Actifs</div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>• Recherche globale</div>
                      <div>• Filtres par colonne</div>
                      <div>• Tri dynamique</div>
                      <div>• Sélection multiple</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Sidebar Section */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-heading font-semibold text-foreground">Navigation Sidebar</h2>
            <p className="text-body text-neutral-60">
              Sidebar moderne avec navigation hiérarchique, recherche et variants adaptables
            </p>
          </div>

          <div className="grid-cards">
            <Card>
              <CardHeader>
                <CardTitle>Sidebar Responsive</CardTitle>
                <CardDescription>Navigation avec collapse, search et hiérarchie</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4 mb-4">
                  <Button
                    variant={sidebarVariant === 'default' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSidebarVariant('default')}
                  >
                    Standard
                  </Button>
                  <Button
                    variant={sidebarVariant === 'compact' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSidebarVariant('compact')}
                  >
                    Compact
                  </Button>
                  <Button
                    variant={sidebarVariant === 'floating' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSidebarVariant('floating')}
                  >
                    Flottant
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden bg-muted/30" style={{ height: "500px" }}>
                  <div className="flex h-full">
                    <Sidebar
                      variant={sidebarVariant}
                      isCollapsed={sidebarCollapsed}
                      setIsCollapsed={setSidebarCollapsed}
                      collapsible={true}
                      resizable={true}
                      searchable={true}
                      items={sidebarItems}
                      onItemClick={(item) => console.log('Item clicked:', item)}
                    >
                      <SidebarHeader showToggle={true}>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">AE</span>
                          </div>
                          <div>
                            <div className="font-semibold text-sm">Arcadis Enterprise</div>
                            <div className="text-xs text-muted-foreground">Design System</div>
                          </div>
                        </div>
                      </SidebarHeader>

                      <SidebarContent>
                        <SidebarSearch placeholder="Rechercher..." />
                        
                        <SidebarGroup title="Navigation">
                          <SidebarMenu />
                        </SidebarGroup>
                        
                        <SidebarGroup title="Raccourcis" collapsible={true}>
                          <SidebarMenu items={[
                            { id: 'quick-add', title: 'Nouveau projet', icon: ({ className }) => (
                              <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                              </svg>
                            )},
                            { id: 'recent-files', title: 'Fichiers récents', badge: 'Ctrl+R' },
                            { id: 'favorites', title: 'Favoris', badge: 4 },
                          ]} />
                        </SidebarGroup>
                      </SidebarContent>

                      <SidebarFooter>
                        <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">JD</span>
                          </div>
                          {!sidebarCollapsed && (
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">John Doe</div>
                              <div className="text-xs text-muted-foreground truncate">john@arcadis.com</div>
                            </div>
                          )}
                          <SidebarTrigger className="ml-auto" />
                        </div>
                      </SidebarFooter>
                    </Sidebar>

                    <div className="flex-1 p-6 bg-background">
                      <div className="max-w-2xl space-y-4">
                        <div className="flex items-center gap-2">
                          <SidebarTrigger />
                          <h3 className="text-lg font-semibold">Contenu Principal</h3>
                        </div>
                        <p className="text-muted-foreground">
                          Cette zone représente le contenu principal de votre application. 
                          Le Sidebar peut être collapsé/expandé et prend en charge :
                        </p>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            Navigation hiérarchique avec sous-menus
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            Recherche intégrée avec filtrage
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            Redimensionnement par glisser-déposer
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            Mode mobile avec overlay
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            Variants : standard, compact, flottant
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            Badges et indicateurs d'état
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fonctionnalités Sidebar</CardTitle>
                <CardDescription>Configuration et personnalisation avancée</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Navigation</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Navigation hiérarchique</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Items actifs et focus</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Badges et notifications</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Icônes personnalisées</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Interaction</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Collapse/Expand animé</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Redimensionnement manuel</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Recherche en temps réel</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Tooltips en mode collapsed</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Responsive</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Auto-collapse mobile</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Overlay mobile drawer</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Gestion tactile</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Breakpoints adaptatifs</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Variants</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" size="sm">Standard</Badge>
                        <span className="text-xs">Sidebar classique avec bordures</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" size="sm">Compact</Badge>
                        <span className="text-xs">Version dense avec moins d'espacement</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="default" size="sm">Flottant</Badge>
                        <span className="text-xs">Sidebar flottante avec ombre</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm font-medium mb-2">Configuration Exemple</div>
                  <div className="space-y-1 text-xs text-muted-foreground font-mono">
                    <div>&lt;Sidebar variant="default" collapsible resizable searchable&gt;</div>
                    <div className="ml-2">&lt;SidebarHeader&gt;Logo + Toggle&lt;/SidebarHeader&gt;</div>
                    <div className="ml-2">&lt;SidebarContent&gt;</div>
                    <div className="ml-4">&lt;SidebarSearch /&gt;</div>
                    <div className="ml-4">&lt;SidebarGroup title="Navigation"&gt;</div>
                    <div className="ml-6">&lt;SidebarMenu items={"{sidebarItems}"} /&gt;</div>
                    <div className="ml-4">&lt;/SidebarGroup&gt;</div>
                    <div className="ml-2">&lt;/SidebarContent&gt;</div>
                    <div className="ml-2">&lt;SidebarFooter&gt;User Profile&lt;/SidebarFooter&gt;</div>
                    <div>&lt;/Sidebar&gt;</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-heading font-semibold text-foreground">Onglets Intelligents</h2>
            <p className="text-body text-neutral-60">
              Système d'onglets flexibles avec variants et orientations multiples
            </p>
          </div>

          <div className="grid-cards">
            <Card>
              <CardHeader>
                <CardTitle>Variants d'Onglets</CardTitle>
                <CardDescription>Différents styles d'affichage selon le contexte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <h4 className="text-sm font-medium mb-3">Style Bordé (défaut)</h4>
                  <TabsContainer
                    tabs={[
                      { value: "overview", label: "Vue d'ensemble", content: <div className="p-4 text-center">Contenu de la vue d'ensemble</div> },
                      { value: "details", label: "Détails", content: <div className="p-4 text-center">Informations détaillées</div> },
                      { value: "settings", label: "Paramètres", badge: 3, content: <div className="p-4 text-center">Paramètres de configuration</div> }
                    ]}
                    variant="bordered"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Style Pilules</h4>
                  <TabsContainer
                    tabs={[
                      { value: "dashboard", label: "Tableau de bord", content: <div className="p-4 text-center">Tableau de bord principal</div> },
                      { value: "analytics", label: "Analyses", content: <div className="p-4 text-center">Données analytiques</div> },
                      { value: "reports", label: "Rapports", badge: "Nouveau", content: <div className="p-4 text-center">Rapports détaillés</div> }
                    ]}
                    variant="pills"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Style Ligne</h4>
                  <TabsContainer
                    tabs={[
                      { value: "profile", label: "Profil", content: <div className="p-4 text-center">Informations du profil</div> },
                      { value: "account", label: "Compte", content: <div className="p-4 text-center">Paramètres du compte</div> },
                      { value: "notifications", label: "Notifications", content: <div className="p-4 text-center">Préférences de notification</div> }
                    ]}
                    variant="default"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Onglets Verticaux</CardTitle>
                <CardDescription>Orientation verticale pour les interfaces complexes</CardDescription>
              </CardHeader>
              <CardContent>
                <TabsContainer
                  tabs={[
                    { 
                      value: "general", 
                      label: "Général", 
                      content: (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Paramètres Généraux</h3>
                          <div className="space-y-3">
                            <Input placeholder="Nom d'utilisateur" />
                            <Input placeholder="Email" />
                            <Button>Sauvegarder</Button>
                          </div>
                        </div>
                      )
                    },
                    { 
                      value: "security", 
                      label: "Sécurité", 
                      badge: "!",
                      content: (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Paramètres de Sécurité</h3>
                          <div className="space-y-3">
                            <Input type="password" placeholder="Mot de passe actuel" />
                            <Input type="password" placeholder="Nouveau mot de passe" />
                            <Button variant="destructive">Mettre à jour</Button>
                          </div>
                        </div>
                      )
                    },
                    { 
                      value: "preferences", 
                      label: "Préférences", 
                      content: (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Préférences Utilisateur</h3>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="email-notif" />
                              <label htmlFor="email-notif" className="text-sm">Notifications par email</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="dark-mode" checked />
                              <label htmlFor="dark-mode" className="text-sm">Mode sombre</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="auto-update" />
                              <label htmlFor="auto-update" className="text-sm">Mises à jour automatiques</label>
                            </div>
                          </div>
                        </div>
                      )
                    }
                  ]}
                  orientation="vertical"
                  variant="pills"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tab Card</CardTitle>
                <CardDescription>Composant intégré avec header et contenu</CardDescription>
              </CardHeader>
              <CardContent>
                <TabCard
                  title="Gestion des Projets"
                  description="Organisez et suivez vos projets efficacement"
                  tabs={[
                    { 
                      value: "active", 
                      label: "Actifs", 
                      badge: 5,
                      content: (
                        <div className="p-4 border rounded-lg">
                          <p>Liste des projets actifs...</p>
                        </div>
                      )
                    },
                    { 
                      value: "completed", 
                      label: "Terminés", 
                      badge: 12,
                      content: (
                        <div className="p-4 border rounded-lg">
                          <p>Projets complétés avec succès...</p>
                        </div>
                      )
                    },
                    { 
                      value: "archived", 
                      label: "Archivés", 
                      content: (
                        <div className="p-4 border rounded-lg">
                          <p>Archives des anciens projets...</p>
                        </div>
                      )
                    }
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </section>
        
        {/* Toast System Section */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-heading font-semibold text-foreground">Système de Notifications Toast</h2>
            <p className="text-body text-neutral-60">
              Notifications contextuelles élégantes avec variants sémantiques et animations
            </p>
          </div>

          <div className="grid-cards">
            <Card>
              <CardHeader>
                <CardTitle>Toast Variants</CardTitle>
                <CardDescription>Différents types de notifications selon le contexte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => success({
                      title: "Action réussie",
                      description: "L'opération a été effectuée avec succès."
                    })}
                  >
                    Toast Succès
                  </Button>
                  
                  <Button 
                    onClick={() => error({
                      title: "Erreur",
                      description: "Une erreur est survenue lors de l'opération."
                    })}
                    variant="destructive"
                  >
                    Toast Erreur
                  </Button>
                  
                  <Button 
                    onClick={() => warning({
                      title: "Avertissement",
                      description: "Attention, cette action pourrait avoir des conséquences."
                    })}
                    variant="warning"
                  >
                    Toast Avertissement
                  </Button>
                  
                  <Button 
                    onClick={() => info({
                      title: "Information",
                      description: "Voici quelques informations importantes à connaître."
                    })}
                    variant="secondary"
                  >
                    Toast Info
                  </Button>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-3">Preview</h3>
                  <div className="space-y-4">
                    <ToastDemo />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions et Personnalisation</CardTitle>
                <CardDescription>Toasts avec boutons d'action et contrôles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <Button 
                    onClick={() => toast({
                      title: "Fichier supprimé",
                      description: "Le fichier a été déplacé dans la corbeille.",
                      action: (
                        <ToastAction onClick={() => toast({ title: "Fichier restauré" })} altText="Annuler la suppression">
                          Annuler
                        </ToastAction>
                      ),
                      variant: "default"
                    })}
                  >
                    Toast avec Action
                  </Button>

                  <Button 
                    onClick={() => toast({
                      title: "Mise à jour disponible",
                      description: "Une nouvelle version est prête à être installée.",
                      action: (
                        <>
                          <ToastAction onClick={() => toast({ title: "Installation démarrée" })} altText="Installer la mise à jour">
                            Installer
                          </ToastAction>
                          <ToastAction onClick={() => toast({ title: "Rappel programmé" })} altText="Reporter la mise à jour">
                            Plus tard
                          </ToastAction>
                        </>
                      ),
                      variant: "info",
                      showProgress: false
                    })}
                    variant="outline"
                  >
                    Toast avec Actions Multiples
                  </Button>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-3">Exemples d'utilisation</h3>
                  <div className="space-y-4">
                    <ToastActionDemo />
                  </div>
                  <div className="space-y-2 text-sm mt-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Confirmations d'actions utilisateur</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <InfoIcon className="h-4 w-4 text-blue-500" />
                      <span>Notifications informatives du système</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span>Avertissements avant actions importantes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span>Erreurs et problèmes critiques</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Sprint 4 Advanced Components Section */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-heading font-semibold text-foreground">Sprint 4 - Composants Avancés</h2>
            <p className="text-body text-neutral-60">
              Composants avancés avec interactions drag & drop et workflows
            </p>
          </div>

          <div className="grid-cards">
            <Card>
              <CardHeader>
                <CardTitle>DraggableList - Liste Réorganisable</CardTitle>
                <CardDescription>Liste avec drag & drop pour réorganiser les éléments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Liste simple</h3>
                  <DraggableList
                    items={draggableItems}
                    onReorder={handleReorder(draggableItems, setDraggableItems)}
                    className="max-w-md"
                  />
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Liste avec handle de glissement</h3>
                  <DraggableList
                    items={complexDraggableItems}
                    onReorder={handleReorder(complexDraggableItems, setComplexDraggableItems)}
                    handle={true}
                    className="max-w-lg"
                  />
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Orientation horizontale</h3>
                  <DraggableList
                    items={draggableItems.slice(0, 3)}
                    onReorder={() => {}} // Lecture seule pour la démo
                    orientation="horizontal"
                    className="max-w-2xl"
                  />
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Disposition en grille</h3>
                  <DraggableList
                    items={[
                      { id: 'g1', content: '📋 Tâche 1' },
                      { id: 'g2', content: '📝 Tâche 2' },
                      { id: 'g3', content: '✅ Tâche 3' },
                      { id: 'g4', content: '🔄 Tâche 4' },
                      { id: 'g5', content: '🚀 Tâche 5' },
                      { id: 'g6', content: '📊 Tâche 6' },
                    ]}
                    onReorder={() => {}} // Lecture seule pour la démo
                    orientation="grid"
                    className="max-w-2xl"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>WorkflowBuilder - Constructeur de Workflows</CardTitle>
                <CardDescription>Composant pour créer des workflows visuels avec ReactFlow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Workflow interactif complet</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <WorkflowBuilder
                      initialNodes={initialWorkflowNodes}
                      initialEdges={initialWorkflowEdges}
                      onSave={handleWorkflowSave}
                      className="h-[500px]"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    • Glissez pour repositionner les nœuds<br/>
                    • Cliquez sur un nœud pour le sélectionner et l'éditer<br/>
                    • Utilisez les contrôles à gauche pour ajouter de nouveaux nœuds<br/>
                    • Connectez les nœuds en glissant depuis les poignées
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Mode lecture seule</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <WorkflowBuilder
                      initialNodes={initialWorkflowNodes.slice(0, 2)}
                      initialEdges={initialWorkflowEdges.slice(0, 1)}
                      readOnly={true}
                      className="h-[300px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Dashboard Modulaire Avancé Section */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-heading font-semibold text-foreground">Dashboard Modulaire Avancé</h2>
            <p className="text-body text-neutral-60">
              Composants révolutionnaires pour dashboards modulaires avec IA et drag & drop
            </p>
          </div>

          <div className="grid-cards">
            <Card>
              <CardHeader>
                <CardTitle>AIInsightsWidget - Insights IA Avancés ✨</CardTitle>
                <CardDescription>Widget d'intelligence artificielle pour insights, prédictions et recommandations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-950 rounded-lg p-4 min-h-[400px]">
                  <AIInsightsWidget
                    maxInsights={3}
                    showTrends={true}
                    darkMode={true}
                    refreshInterval={30000}
                    onInsightClick={(insight) => console.log('Insight clicked:', insight)}
                    onTakeAction={(id) => console.log('Action taken for:', id)}
                  />
                </div>

                <div className="mt-6 p-6 bg-gray-5 rounded-lg border border-gray-20">
                  <h4 className="text-sm font-medium text-gray-70 mb-4">✨ Fonctionnalités Révolutionnaires</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-60">
                    <div>
                      <div>🧠 <strong>IA Prédictive</strong> - Anticipe les tendances business</div>
                      <div>⚡ <strong>Insights temps réel</strong> - Analyse continue des données</div>
                      <div>🎯 <strong>Recommandations</strong> - Actions d'optimisation suggérées</div>
                      <div>🚨 <strong>Alertes intelligentes</strong> - Détection proactive de risques</div>
                    </div>
                    <div>
                      <div>📊 <strong>Confiance mesurée</strong> - Fiabilité de chaque insight</div>
                      <div>🔄 <strong>Auto-refresh</strong> - Mise à jour automatique</div>
                      <div>✅ <strong>Actions directes</strong> - Exécution immédiate</div>
                      <div>🌙 <strong>UI sombre premium</strong> - Interface épurée moderne</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ModularDashboard - Dashboard Drag & Drop 🚀</CardTitle>
                <CardDescription>Dashboard modulaire révolutionnaire avec widgets redimensionnables</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-950 rounded-lg overflow-hidden border border-gray-800" style={{ height: '500px' }}>
                  <ModularDashboard
                    initialWidgets={[]}
                    onSaveLayout={(widgets) => console.log('🎯 Layout saved:', widgets)}
                    onLoadLayout={() => {
                      console.log('📥 Loading layout...');
                      return null;
                    }}
                  />
                </div>

                <div className="mt-6 p-6 bg-gray-5 rounded-lg border border-gray-20">
                  <h4 className="text-sm font-medium text-gray-70 mb-4">🚀 Fonctionnalités Révolutionnaires</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-60">
                    <div>
                      <div>🎯 <strong>Drag & Drop fluide</strong> - Réorganisation intuitive</div>
                      <div>📏 <strong>Redimensionnement</strong> - Widgets ajustables</div>
                      <div>🧩 <strong>Modulaire complet</strong> - Ajout/suppression dynamique</div>
                      <div>🔗 <strong>Grille magnétique</strong> - Alignement automatique</div>
                      <div>💾 <strong>Sauvegarde layout</strong> - Persistance intelligente</div>
                    </div>
                    <div>
                      <div>🌙 <strong>Mode sombre premium</strong> - Interface épurée</div>
                      <div>📱 <strong>Responsive total</strong> - Adaptation multi-écrans</div>
                      <div>🎨 <strong>Personnalisation</strong> - Thèmes et couleurs</div>
                      <div>⚡ <strong>Performance</strong> - Animations fluides 60fps</div>
                      <div>🔧 <strong>Configurable</strong> - Options avancées par widget</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Widgets Disponibles - Catalogue Premium 📦</CardTitle>
                <CardDescription>Collection de widgets intelligents pour votre dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Widget IA */}
                  <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">AI Insights</span>
                    </div>
                    <p className="text-sm text-blue-700">Intelligence artificielle avancée avec prédictions et recommandations.</p>
                    <div className="mt-2 flex gap-1">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Prédictif</span>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Temps réel</span>
                    </div>
                  </div>

                  {/* Widget Stats */}
                  <div className="p-4 rounded-lg border border-purple-200 bg-purple-50">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-purple-900">Statistics</span>
                    </div>
                    <p className="text-sm text-purple-700">Métriques et KPIs interactifs avec détails extensibles.</p>
                    <div className="mt-2 flex gap-1">
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">Interactif</span>
                      <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">Extensible</span>
                    </div>
                  </div>

                  {/* Widget Activity */}
                  <div className="p-4 rounded-lg border border-green-200 bg-green-50">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">Activity Feed</span>
                    </div>
                    <p className="text-sm text-green-700">Flux d'activités récentes avec navigation intelligente.</p>
                    <div className="mt-2 flex gap-1">
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Live</span>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Filtrable</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">💡 Innovation Continue</h4>
                  <p className="text-sm text-gray-600">
                    Nouveaux widgets ajoutés régulièrement : Graphiques avancés, Analytics IA, Monitoring temps réel, 
                    Intégrations externes, et bien plus encore. Tous conçus avec la même philosophie : 
                    <strong> performance, élégance et intelligence</strong>.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>DashboardModular Complet - Expérience Révolutionnaire 🚀</CardTitle>
                <CardDescription>Dashboard complet avec toutes les fonctionnalités avancées intégrées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-950 rounded-lg overflow-hidden border border-gray-800" style={{ height: '600px' }}>
                  <DashboardModular />
                </div>

                <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-gray-800 mb-3">🚀 Dashboard Révolutionnaire - Sprint 6</h4>
                  <div className="grid grid-cols-2 gap-6 text-xs text-gray-700">
                    <div>
                      <div className="font-medium mb-2">🎯 Fonctionnalités Core</div>
                      <div>• <strong>Mode Modulaire/Classique</strong> - Bascule intuitive</div>
                      <div>• <strong>Drag & Drop avancé</strong> - Réorganisation fluide</div>
                      <div>• <strong>Redimensionnement</strong> - Widgets ajustables</div>
                      <div>• <strong>Sauvegarde automatique</strong> - Layout persistant</div>
                      <div>• <strong>Mode sombre/clair</strong> - Thème adaptatif</div>
                      <div>• <strong>Responsive total</strong> - Multi-devices</div>
                    </div>
                    <div>
                      <div className="font-medium mb-2">🧠 Intelligence Artificielle</div>
                      <div>• <strong>Insights prédictifs</strong> - IA avancée</div>
                      <div>• <strong>Recommandations</strong> - Actions suggérées</div>
                      <div>• <strong>Alertes intelligentes</strong> - Détection proactive</div>
                      <div>• <strong>Analytics temps réel</strong> - Métriques live</div>
                      <div>• <strong>Confidence scoring</strong> - Fiabilité mesurée</div>
                      <div>• <strong>Auto-refresh</strong> - Mise à jour continue</div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-white/60 rounded border border-blue-300">
                    <p className="text-xs font-medium text-blue-900">
                      💎 <strong>Design Premium</strong> : Interface épurée inspirée de Twenty avec nuances de gris élégantes, 
                      finitions colorées subtiles, animations fluides 60fps, et expérience utilisateur haut de gamme.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Dashboard Interactive Components Section */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-heading font-semibold text-foreground">Composants Dashboard Interactifs</h2>
            <p className="text-body text-neutral-60">
              Cartes de statistiques et d'activités interactives pour les tableaux de bord
            </p>
          </div>

          <div className="grid-cards">
            <Card>
              <CardHeader>
                <CardTitle>InteractiveStatsCard - Cartes de Statistiques</CardTitle>
                <CardDescription>Cartes interactives pour afficher des métriques avec détails extensibles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Carte Factures */}
                  <InteractiveStatsCard
                    title="Factures"
                    value="127"
                    icon={FileText}
                    color="blue"
                    description="Total des factures"
                    details={
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Chiffre d'affaires:</span>
                          <span className="font-semibold">€45,230</span>
                        </div>
                        <div className="flex justify-between">
                          <span>En attente:</span>
                          <span className="font-semibold">€12,400</span>
                        </div>
                        <div className="flex justify-between">
                          <span>En retard:</span>
                          <span className="font-semibold text-red-600">€3,200</span>
                        </div>
                      </div>
                    }
                  />

                  {/* Carte Devis */}
                  <InteractiveStatsCard
                    title="Devis"
                    value="43"
                    icon={ClipboardList}
                    color="yellow"
                    description="Devis en cours"
                    details={
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>En attente validation:</span>
                          <span className="font-semibold">23</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Approuvés:</span>
                          <span className="font-semibold text-green-600">15</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expirés:</span>
                          <span className="font-semibold text-red-600">5</span>
                        </div>
                      </div>
                    }
                  />

                  {/* Carte Support */}
                  <InteractiveStatsCard
                    title="Support"
                    value="12"
                    icon={MessageSquare}
                    color="green"
                    description="Tickets ouverts"
                    details={
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Haute priorité:</span>
                          <span className="font-semibold text-red-600">3</span>
                        </div>
                        <div className="flex justify-between">
                          <span>En cours:</span>
                          <span className="font-semibold">7</span>
                        </div>
                        <div className="flex justify-between">
                          <span>En attente client:</span>
                          <span className="font-semibold">2</span>
                        </div>
                      </div>
                    }
                  />

                  {/* Carte Admin - Entreprises */}
                  <InteractiveStatsCard
                    title="Entreprises"
                    value="28"
                    icon={Building}
                    color="purple"
                    description="Clients actifs"
                    details={
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Nouvelles ce mois:</span>
                          <span className="font-semibold text-green-600">4</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Actives:</span>
                          <span className="font-semibold">25</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Inactives:</span>
                          <span className="font-semibold text-yellow-600">3</span>
                        </div>
                      </div>
                    }
                  />

                  {/* Carte Admin - Utilisateurs */}
                  <InteractiveStatsCard
                    title="Utilisateurs"
                    value="156"
                    icon={Users}
                    color="red"
                    description="Comptes total"
                    details={
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Actifs:</span>
                          <span className="font-semibold text-green-600">142</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Suspendus:</span>
                          <span className="font-semibold text-yellow-600">8</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Administrateurs:</span>
                          <span className="font-semibold">6</span>
                        </div>
                      </div>
                    }
                  />

                  {/* Carte Revenue */}
                  <InteractiveStatsCard
                    title="Chiffre d'affaires"
                    value="€67,890"
                    icon={TrendingUp}
                    color="default"
                    description="Ce mois"
                    details={
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Objectif mensuel:</span>
                          <span className="font-semibold">€75,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Progression:</span>
                          <span className="font-semibold text-green-600">90.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reste à réaliser:</span>
                          <span className="font-semibold">€7,110</span>
                        </div>
                      </div>
                    }
                  />
                </div>

                <div className="mt-8 p-6 bg-gray-5 rounded-lg border border-gray-20">
                  <h4 className="text-sm font-medium text-gray-70 mb-4">Utilisation des variantes de couleur</h4>
                  <div className="space-y-2 text-xs text-gray-60">
                    <div><code>color="blue"</code> - Pour les métriques financières (factures, revenus)</div>
                    <div><code>color="yellow"</code> - Pour les éléments en attente (devis, validations)</div>
                    <div><code>color="green"</code> - Pour le support et la communication</div>
                    <div><code>color="purple"</code> - Pour la gestion d'entreprises</div>
                    <div><code>color="red"</code> - Pour la gestion d'utilisateurs</div>
                    <div><code>color="default"</code> - Pour les métriques générales</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>InteractiveActivityCard - Activités Récentes</CardTitle>
                <CardDescription>Composant pour afficher les activités récentes avec navigation</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const sampleActivities: ActivityItem[] = [
                    {
                      id: 'activity-1',
                      title: 'Facture #INV-2024-001',
                      description: 'Payée pour Entreprise ABC',
                      date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
                      type: 'invoice',
                      status: 'completed',
                      link: { url: '/factures/inv-001', label: 'Voir la facture' }
                    },
                    {
                      id: 'activity-2',
                      title: 'Devis #DEV-2024-045',
                      description: 'Approuvé par TechCorp Ltd',
                      date: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4h ago
                      type: 'quote',
                      status: 'completed',
                      link: { url: '/devis/dev-045', label: 'Voir le devis' }
                    },
                    {
                      id: 'activity-3',
                      title: 'Ticket #T-2024-128',
                      description: 'Nouveau ticket de support priorité haute',
                      date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6h ago
                      type: 'ticket',
                      status: 'pending',
                      link: { url: '/support/t-128', label: 'Voir le ticket' }
                    },
                    {
                      id: 'activity-4',
                      title: 'Paiement reçu',
                      description: 'Virement bancaire de €15,250',
                      date: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8h ago
                      type: 'payment',
                      status: 'completed'
                    },
                    {
                      id: 'activity-5',
                      title: 'Nouvel utilisateur',
                      description: 'Marie Dupont a rejoint Solutions Pro',
                      date: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12h ago
                      type: 'user',
                      status: 'completed'
                    }
                  ];

                  return (
                    <InteractiveActivityCard
                      title="Activités récentes"
                      activities={sampleActivities}
                      maxItems={5}
                      emptyMessage="Aucune activité récente à afficher"
                      onViewAll={() => console.log('Voir toutes les activités')}
                    />
                  );
                })()}

                <div className="mt-6 p-6 bg-gray-5 rounded-lg border border-gray-20">
                  <h4 className="text-sm font-medium text-gray-70 mb-4">Types d'activités supportés</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div><code>'invoice'</code> - Factures</div>
                      <div><code>'quote'</code> - Devis</div>
                      <div><code>'ticket'</code> - Tickets support</div>
                      <div><code>'payment'</code> - Paiements</div>
                    </div>
                    <div>
                      <div><code>'user'</code> - Gestion utilisateurs</div>
                      <div><code>'company'</code> - Gestion entreprises</div>
                      <div><code>'system'</code> - Système</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>InteractiveDashboardGrid - Grille Dashboard</CardTitle>
                <CardDescription>Grille responsive pour organiser les cartes de statistiques</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const dashboardItems = [
                    {
                      id: 'sample-1',
                      title: 'Exemple métrique 1',
                      value: '42',
                      icon: TrendingUp,
                      color: 'blue' as const
                    },
                    {
                      id: 'sample-2',
                      title: 'Exemple métrique 2', 
                      value: '127',
                      icon: Users,
                      color: 'green' as const
                    },
                    {
                      id: 'sample-3',
                      title: 'Exemple métrique 3',
                      value: '€15,230',
                      icon: Building,
                      color: 'purple' as const
                    }
                  ];

                  return (
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <p className="text-sm text-muted-foreground mb-4">Exemple de grille dashboard responsive</p>
                      <InteractiveDashboardGrid
                        items={dashboardItems}
                        loading={false}
                        renderItem={(item) => (
                          <InteractiveStatsCard
                            key={item.id}
                            title={item.title}
                            value={item.value}
                            icon={item.icon}
                            color={item.color}
                            description="Exemple de métrique"
                          />
                        )}
                        keyExtractor={(item) => item.id}
                        isReady={true}
                        columnLayouts={{
                          mobile: 1,
                          tablet: 2,
                          desktop: 3
                        }}
                      />
                    </div>
                  );
                })()}

                <div className="mt-6 p-6 bg-gray-5 rounded-lg border border-gray-20">
                  <h4 className="text-sm font-medium text-gray-70 mb-4">Configuration responsive</h4>
                  <div className="space-y-2 text-xs text-gray-60">
                    <div><code>mobile: 1</code> - 1 colonne sur mobile</div>
                    <div><code>tablet: 2</code> - 2 colonnes sur tablette</div>
                    <div><code>desktop: 3</code> - 3 colonnes sur desktop</div>
                    <div className="mt-2">La grille s'adapte automatiquement à la taille d'écran</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Loading States Section */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-heading font-semibold text-foreground">États de Chargement</h2>
            <p className="text-body text-neutral-60">
              Composants pour indiquer les états de chargement et l'attente utilisateur
            </p>
          </div>

          <div className="grid-cards">
            <Card>
              <CardHeader>
                <CardTitle>Spinners et Progress</CardTitle>
                <CardDescription>Indicateurs animés pour les chargements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Spinners</h3>
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex flex-col items-center gap-2">
                        <Spinner size="xs" />
                        <span className="text-xs">xs</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Spinner size="sm" />
                        <span className="text-xs">sm</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Spinner size="md" />
                        <span className="text-xs">md</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Spinner size="lg" />
                        <span className="text-xs">lg</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Spinner size="xl" />
                        <span className="text-xs">xl</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex flex-col items-center gap-2">
                        <Spinner variant="default" />
                        <span className="text-xs">default</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Spinner variant="success" />
                        <span className="text-xs">success</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Spinner variant="warning" />
                        <span className="text-xs">warning</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Spinner variant="error" />
                        <span className="text-xs">error</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Spinner variant="info" />
                        <span className="text-xs">info</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Progress Bar</h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Téléchargement</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Traitement</span>
                          <span>Indéterminé</span>
                        </div>
                        <Progress value={50} indeterminate />
                      </div>

                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex flex-col items-center gap-2">
                          <Progress value={75} variant="default" className="w-24" />
                          <span className="text-xs">default</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Progress value={75} variant="success" className="w-24" />
                          <span className="text-xs">success</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Progress value={75} variant="warning" className="w-24" />
                          <span className="text-xs">warning</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Progress value={75} variant="error" className="w-24" />
                          <span className="text-xs">error</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Progress Circulaire</h3>
                    <div className="flex flex-wrap items-center gap-6">
                      <CircularProgress value={25} />
                      <CircularProgress value={50} variant="info" />
                      <CircularProgress value={75} variant="success" />
                      <CircularProgress value={100} variant="warning" />
                      <CircularProgress value={65} size={60} strokeWidth={6} variant="error" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skeletons</CardTitle>
                <CardDescription>Placeholders durant le chargement des données</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Skeleton de Base</h3>
                  <div className="flex flex-wrap gap-4">
                    <div className="space-y-2">
                      <Skeleton variant="title" />
                      <Skeleton variant="text" className="w-3/4" />
                      <Skeleton variant="text" className="w-1/2" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton variant="avatar" />
                      <div className="space-y-2">
                        <Skeleton variant="heading" />
                        <Skeleton variant="text" className="w-32" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Tableau en Chargement</h3>
                  <TableSkeleton rows={3} columns={3} showHeader={true} />
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Carte en Chargement</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CardSkeleton />
                    <CardSkeleton hasImage={false} />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">DataView en Chargement</h3>
                  <div className="border rounded-lg p-4">
                    <DataViewSkeleton variant="table" itemCount={3} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>États Vides et Chargement Contextuel</CardTitle>
                <CardDescription>Messages et indicateurs pour situations spéciales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">État Vide</h3>
                  <EmptyState
                    icon={<FileText className="h-12 w-12 text-muted-foreground opacity-20" />}
                    title="Aucun document"
                    description="Vous n'avez pas encore créé de documents. Créez-en un pour commencer."
                    action={
                      <Button size="sm" className="mt-2">
                        <Plus className="h-4 w-4 mr-1" />
                        Nouveau document
                      </Button>
                    }
                  />
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Chargement Contextuel</h3>
                  <div className="flex flex-col gap-4">
                    <Button 
                      onClick={() => simulateLoading()}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Chargement en cours...
                        </>
                      ) : (
                        "Simuler Chargement"
                      )}
                    </Button>
                    
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" className={loading ? "opacity-50" : ""}>
                        Action 1
                      </Button>
                      <Button variant="outline" size="sm" className={loading ? "opacity-50" : ""}>
                        Action 2
                      </Button>
                      {loading && <Spinner size="sm" />}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="layout-modern py-12 border-t border-neutral-15">
        <div className="text-center">
          <p className="text-body text-neutral-60">
            Design System Twenty-Inspired • Arcadis Enterprise OS • 2025
          </p>
        </div>
      </footer>
    </div>
  )
}
