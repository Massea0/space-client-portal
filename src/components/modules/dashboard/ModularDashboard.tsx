// src/components/modules/dashboard/ModularDashboard.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Layout, 
  Grid3X3, 
  Palette,
  Settings,
  Save,
  RotateCcw,
  Eye,
  Maximize,
  Zap,
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  Target,
  Filter,
  Download,
  Share2,
  Expand,
  Minimize2,
  MoreHorizontal,
  Edit3,
  Trash2,
  RefreshCw,
  Sparkles,
  Brain,
  Activity,
  DollarSign,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  User,
  Shield
} from 'lucide-react';
import { DashboardWidgetContainer, DashboardWidget, WidgetSize } from './DashboardWidgetContainer';
import { AIInsightsCard } from './AIInsightsCard';
import InteractiveStatsCard from './InteractiveStatsCard';
import InteractiveActivityCard from './InteractiveActivityCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface UserRole {
  type: 'client' | 'admin';
  permissions: string[];
}

interface DashboardTheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
}

interface LayoutPreset {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  icon: React.ComponentType<any>;
}

interface ModularDashboardProps {
  userRole?: UserRole;
  initialWidgets?: DashboardWidget[];
  theme?: DashboardTheme;
  enableAI?: boolean;
  enablePersonalization?: boolean;
  onSaveLayout?: (widgets: DashboardWidget[]) => void;
  onLoadLayout?: () => DashboardWidget[] | null;
  onAnalyticsEvent?: (event: string, data: any) => void;
  className?: string;
}

const GRID_SIZE = 20;
const SNAP_THRESHOLD = 10;

// Thèmes prédéfinis
const THEMES: DashboardTheme[] = [
  {
    name: 'Dark Modern',
    primary: 'from-blue-600 to-purple-600',
    secondary: 'from-gray-900 to-gray-800',
    accent: 'text-blue-400',
    background: 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950',
    surface: 'bg-gray-900/50 border-gray-800/50',
    text: 'text-gray-100',
    muted: 'text-gray-400',
    border: 'border-gray-800'
  },
  {
    name: 'Ocean Blue',
    primary: 'from-cyan-600 to-blue-600',
    secondary: 'from-slate-900 to-slate-800',
    accent: 'text-cyan-400',
    background: 'bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950',
    surface: 'bg-slate-900/50 border-slate-800/50',
    text: 'text-slate-100',
    muted: 'text-slate-400',
    border: 'border-slate-800'
  },
  {
    name: 'Purple Galaxy',
    primary: 'from-purple-600 to-pink-600',
    secondary: 'from-purple-900 to-purple-800',
    accent: 'text-purple-400',
    background: 'bg-gradient-to-br from-purple-950 via-purple-900 to-pink-950',
    surface: 'bg-purple-900/50 border-purple-800/50',
    text: 'text-purple-100',
    muted: 'text-purple-400',
    border: 'border-purple-800'
  }
];

// Composants widgets personnalisés
const StatsWidget: React.FC<any> = (props) => (
  <div className="h-full p-4">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-100">{props.title || 'Statistiques'}</h3>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
          +{props.growth || '12%'}
        </Badge>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-100">{props.value1 || '2.4K'}</div>
        <div className="text-sm text-gray-400">{props.label1 || 'Total'}</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-100">{props.value2 || '89%'}</div>
        <div className="text-sm text-gray-400">{props.label2 || 'Taux'}</div>
      </div>
    </div>
    <div className="mt-4 h-2 bg-gray-800 rounded-full">
      <div 
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
        style={{ width: `${props.progress || 75}%` }}
      />
    </div>
  </div>
);

const ChartWidget: React.FC<any> = (props) => (
  <div className="h-full p-4">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-100">{props.title || 'Graphique'}</h3>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
          <DropdownMenuItem className="text-gray-200">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </DropdownMenuItem>
          <DropdownMenuItem className="text-gray-200">
            <Share2 className="h-4 w-4 mr-2" />
            Partager
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div className="h-32 bg-gray-800/30 rounded-lg flex items-center justify-center">
      <div className="flex items-center gap-2 text-gray-400">
        <BarChart3 className="h-6 w-6" />
        <span>Graphique interactif</span>
      </div>
    </div>
  </div>
);

const AIWidget: React.FC<any> = (props) => (
  <div className="h-full p-4">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
        <Brain className="h-5 w-5 text-purple-400" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-100">Assistant IA</h3>
        <p className="text-sm text-gray-400">Analyses intelligentes</p>
      </div>
    </div>
    
    <div className="space-y-3">
      <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
        <div className="flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-purple-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-200">Insight principal</p>
            <p className="text-xs text-gray-400 mt-1">{props.insight || 'Vos ventes ont augmenté de 23% ce mois'}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
          <div className="text-xs text-green-400">Prédiction</div>
          <div className="text-sm text-gray-200">+15% next week</div>
        </div>
        <div className="p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
          <div className="text-xs text-yellow-400">Alerte</div>
          <div className="text-sm text-gray-200">Stock faible</div>
        </div>
      </div>
    </div>
  </div>
);

// Widgets disponibles avec différenciation client/admin
const AVAILABLE_WIDGETS = [
  // Widgets communs
  {
    id: 'ai-insights',
    title: 'Assistant IA',
    type: 'ai-insights' as const,
    description: 'Analyses intelligentes et recommandations IA',
    icon: Brain,
    component: AIWidget,
    category: 'intelligence',
    roles: ['client', 'admin'],
    defaultSize: { width: 350, height: 280, minWidth: 300, minHeight: 250, maxWidth: 500, maxHeight: 400 },
    refreshable: true,
    configurable: true,
    premium: false
  },
  {
    id: 'stats-overview',
    title: 'Vue d\'ensemble',
    type: 'stats' as const,
    description: 'Métriques et KPIs essentiels',
    icon: BarChart3,
    component: StatsWidget,
    category: 'analytics',
    roles: ['client', 'admin'],
    defaultSize: { width: 300, height: 200, minWidth: 250, minHeight: 180, maxWidth: 400, maxHeight: 300 },
    refreshable: true,
    configurable: true,
    premium: false
  },
  {
    id: 'activity-feed',
    title: 'Activités récentes',
    type: 'activity' as const,
    description: 'Flux des dernières activités et notifications',
    icon: Activity,
    component: InteractiveActivityCard,
    category: 'monitoring',
    roles: ['client', 'admin'],
    defaultSize: { width: 400, height: 350, minWidth: 350, minHeight: 300, maxWidth: 600, maxHeight: 500 },
    refreshable: true,
    configurable: true,
    premium: false
  },
  // Widgets spécifiques clients
  {
    id: 'sales-chart',
    title: 'Graphique des ventes',
    type: 'chart' as const,
    description: 'Évolution des ventes et revenus',
    icon: TrendingUp,
    component: ChartWidget,
    category: 'sales',
    roles: ['client'],
    defaultSize: { width: 450, height: 300, minWidth: 400, minHeight: 250, maxWidth: 600, maxHeight: 400 },
    refreshable: true,
    configurable: true,
    premium: false
  },
  {
    id: 'revenue-stats',
    title: 'Revenus',
    type: 'stats' as const,
    description: 'Statistiques de revenus et profitabilité',
    icon: DollarSign,
    component: StatsWidget,
    category: 'finance',
    roles: ['client'],
    defaultSize: { width: 280, height: 200, minWidth: 250, minHeight: 180, maxWidth: 350, maxHeight: 250 },
    refreshable: true,
    configurable: false,
    premium: false
  },
  {
    id: 'orders-tracking',
    title: 'Suivi des commandes',
    type: 'custom' as const,
    description: 'État des commandes et livraisons',
    icon: ShoppingCart,
    component: StatsWidget,
    category: 'operations',
    roles: ['client'],
    defaultSize: { width: 350, height: 250, minWidth: 300, minHeight: 200, maxWidth: 450, maxHeight: 350 },
    refreshable: true,
    configurable: true,
    premium: false
  },
  // Widgets spécifiques admin
  {
    id: 'user-management',
    title: 'Gestion utilisateurs',
    type: 'custom' as const,
    description: 'Vue d\'ensemble des utilisateurs et accès',
    icon: Users,
    component: StatsWidget,
    category: 'admin',
    roles: ['admin'],
    defaultSize: { width: 400, height: 300, minWidth: 350, minHeight: 250, maxWidth: 500, maxHeight: 400 },
    refreshable: true,
    configurable: true,
    premium: false
  },
  {
    id: 'system-health',
    title: 'État du système',
    type: 'custom' as const,
    description: 'Monitoring système et performances',
    icon: Shield,
    component: StatsWidget,
    category: 'admin',
    roles: ['admin'],
    defaultSize: { width: 350, height: 280, minWidth: 300, minHeight: 250, maxWidth: 450, maxHeight: 350 },
    refreshable: true,
    configurable: true,
    premium: false
  },
  {
    id: 'security-alerts',
    title: 'Alertes sécurité',
    type: 'custom' as const,
    description: 'Notifications de sécurité et incidents',
    icon: AlertCircle,
    component: StatsWidget,
    category: 'admin',
    roles: ['admin'],
    defaultSize: { width: 380, height: 250, minWidth: 320, minHeight: 200, maxWidth: 500, maxHeight: 350 },
    refreshable: true,
    configurable: true,
    premium: true
  }
];

// Presets de layout
const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: 'client-essential',
    name: 'Client Essentiel',
    description: 'Layout optimisé pour les clients avec les widgets essentiels',
    icon: User,
    widgets: [
      {
        id: 'ai-insights-preset',
        title: 'Assistant IA',
        type: 'ai-insights',
        size: { width: 350, height: 280, minWidth: 300, minHeight: 250, maxWidth: 500, maxHeight: 400 },
        position: { x: 20, y: 20 },
        component: AIWidget,
        refreshable: true,
        configurable: true,
        props: { insight: 'Vos performances sont excellentes ce mois!' }
      },
      {
        id: 'stats-preset',
        title: 'Vue d\'ensemble',
        type: 'stats',
        size: { width: 300, height: 200, minWidth: 250, minHeight: 180, maxWidth: 400, maxHeight: 300 },
        position: { x: 390, y: 20 },
        component: StatsWidget,
        refreshable: true,
        configurable: true,
        props: { title: 'Statistiques', value1: '2.4K', label1: 'Ventes', value2: '89%', label2: 'Satisfaction' }
      },
      {
        id: 'sales-preset',
        title: 'Graphique des ventes',
        type: 'chart',
        size: { width: 450, height: 300, minWidth: 400, minHeight: 250, maxWidth: 600, maxHeight: 400 },
        position: { x: 20, y: 320 },
        component: ChartWidget,
        refreshable: true,
        configurable: true,
        props: { title: 'Évolution des ventes' }
      }
    ]
  },
  {
    id: 'admin-control',
    name: 'Admin Contrôle',
    description: 'Dashboard complet pour les administrateurs',
    icon: Shield,
    widgets: [
      {
        id: 'ai-insights-admin',
        title: 'Assistant IA',
        type: 'ai-insights',
        size: { width: 350, height: 280, minWidth: 300, minHeight: 250, maxWidth: 500, maxHeight: 400 },
        position: { x: 20, y: 20 },
        component: AIWidget,
        refreshable: true,
        configurable: true,
        props: { insight: 'Système stable, 99.9% uptime' }
      },
      {
        id: 'users-admin',
        title: 'Gestion utilisateurs',
        type: 'custom',
        size: { width: 400, height: 300, minWidth: 350, minHeight: 250, maxWidth: 500, maxHeight: 400 },
        position: { x: 390, y: 20 },
        component: StatsWidget,
        refreshable: true,
        configurable: true,
        props: { title: 'Utilisateurs', value1: '1.2K', label1: 'Actifs', value2: '95%', label2: 'Satisfaction' }
      },
      {
        id: 'system-admin',
        title: 'État du système',
        type: 'custom',
        size: { width: 350, height: 280, minWidth: 300, minHeight: 250, maxWidth: 450, maxHeight: 350 },
        position: { x: 20, y: 340 },
        component: StatsWidget,
        refreshable: true,
        configurable: true,
        props: { title: 'Système', value1: '99.9%', label1: 'Uptime', value2: '2.1s', label2: 'Response' }
      },
      {
        id: 'security-admin',
        title: 'Alertes sécurité',
        type: 'custom',
        size: { width: 380, height: 250, minWidth: 320, minHeight: 200, maxWidth: 500, maxHeight: 350 },
        position: { x: 410, y: 360 },
        component: StatsWidget,
        refreshable: true,
        configurable: true,
        props: { title: 'Sécurité', value1: '0', label1: 'Alertes', value2: '100%', label2: 'Sécurisé' }
      }
    ]
  }
];

export const ModularDashboard: React.FC<ModularDashboardProps> = ({
  userRole = { type: 'client', permissions: [] },
  initialWidgets = [],
  theme = THEMES[0],
  enableAI = true,
  enablePersonalization = true,
  onSaveLayout,
  onLoadLayout,
  onAnalyticsEvent,
  className
}) => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(initialWidgets);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Filtrer les widgets disponibles selon le rôle utilisateur
  const availableWidgets = AVAILABLE_WIDGETS.filter(widget => 
    widget.roles.includes(userRole.type) &&
    (!showPremiumOnly || widget.premium) &&
    (selectedCategory === 'all' || widget.category === selectedCategory) &&
    (searchQuery === '' || 
     widget.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     widget.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Snap to grid helper
  const snapToGrid = useCallback((value: number): number => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  }, []);

  // Handle drag start
  const handleDragStart = useCallback((widgetId: string, e: React.MouseEvent) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    setDraggedWidget(widgetId);
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (!containerRect) {
      console.warn('Container ref not available for drag operation');
      return;
    }
    
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    dragStartPos.current = {
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top
      };

    // Analytics
    onAnalyticsEvent?.('widget_drag_start', { widgetId, widgetType: widget.type });
  }, [widgets, onAnalyticsEvent]);

  // Handle drag move
  useEffect(() => {
    if (!draggedWidget) return;

    const handleMouseMove = (e: MouseEvent) => {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const x = snapToGrid(e.clientX - containerRect.left - dragOffset.x);
      const y = snapToGrid(e.clientY - containerRect.top - dragOffset.y);

      // Limitation pour éviter les mises à jour trop fréquentes
      const newX = Math.max(0, x);
      const newY = Math.max(0, y);
      
      setWidgets(prev => {
        const currentWidget = prev.find(w => w.id === draggedWidget);
        if (currentWidget && (currentWidget.position.x !== newX || currentWidget.position.y !== newY)) {
          return prev.map(widget => 
            widget.id === draggedWidget 
              ? { ...widget, position: { x: newX, y: newY } }
              : widget
          );
        }
        return prev;
      });
    };

    const handleMouseUp = () => {
      if (draggedWidget) {
        const widget = widgets.find(w => w.id === draggedWidget);
        onAnalyticsEvent?.('widget_drag_end', { 
          widgetId: draggedWidget, 
          widgetType: widget?.type,
          position: widget?.position 
        });
      }
      setDraggedWidget(null);
      setDragOffset({ x: 0, y: 0 });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedWidget, dragOffset, snapToGrid, widgets, onAnalyticsEvent]);

  // Add new widget
  const addWidget = useCallback((widgetTemplate: typeof AVAILABLE_WIDGETS[0]) => {
    const newWidget: DashboardWidget = {
      id: `${widgetTemplate.id}-${Date.now()}`,
      title: widgetTemplate.title,
      type: widgetTemplate.type,
      size: widgetTemplate.defaultSize,
      position: { x: 50, y: 50 },
      component: widgetTemplate.component,
      refreshable: widgetTemplate.refreshable,
      configurable: widgetTemplate.configurable,
      props: {}
    };

    setWidgets(prev => [...prev, newWidget]);
    setIsAddWidgetOpen(false);
    
    // Analytics
    onAnalyticsEvent?.('widget_added', { 
      widgetId: newWidget.id, 
      widgetType: newWidget.type,
      category: widgetTemplate.category 
    });
  }, [onAnalyticsEvent]);

  // Load preset layout
  const loadPreset = useCallback((preset: LayoutPreset) => {
    setIsLoading(true);
    setTimeout(() => {
      setWidgets(preset.widgets);
      setIsPresetsOpen(false);
      setIsLoading(false);
      
      // Analytics
      onAnalyticsEvent?.('preset_loaded', { 
        presetId: preset.id, 
        presetName: preset.name,
        widgetCount: preset.widgets.length 
      });
    }, 500);
  }, [onAnalyticsEvent]);

  // Update widget
  const updateWidget = useCallback((updatedWidget: DashboardWidget) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === updatedWidget.id ? updatedWidget : widget
    ));
  }, []);

  // Remove widget
  const removeWidget = useCallback((widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    setWidgets(prev => prev.filter(widget => widget.id !== widgetId));
    
    // Analytics
    onAnalyticsEvent?.('widget_removed', { 
      widgetId, 
      widgetType: widget?.type 
    });
  }, [widgets, onAnalyticsEvent]);

  // Handle widget resize
  const handleWidgetResize = useCallback((widget: DashboardWidget, newSize: WidgetSize) => {
    updateWidget({ ...widget, size: newSize });
    
    // Analytics
    onAnalyticsEvent?.('widget_resized', { 
      widgetId: widget.id, 
      widgetType: widget.type,
      newSize 
    });
  }, [updateWidget, onAnalyticsEvent]);

  // Handle widget refresh
  const handleWidgetRefresh = useCallback((widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    
    // Trigger refresh logic here
    console.log('Refreshing widget:', widgetId);
    
    // Analytics
    onAnalyticsEvent?.('widget_refreshed', { 
      widgetId, 
      widgetType: widget?.type 
    });
  }, [widgets, onAnalyticsEvent]);

  // Save layout
  const saveLayout = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      if (onSaveLayout) {
        onSaveLayout(widgets);
      }
      // Also save to localStorage as backup
      localStorage.setItem(`dashboard-layout-${userRole.type}`, JSON.stringify(widgets));
      setIsLoading(false);
      
      // Analytics
      onAnalyticsEvent?.('layout_saved', { 
        widgetCount: widgets.length,
        userRole: userRole.type 
      });
    }, 300);
  }, [widgets, onSaveLayout, userRole.type, onAnalyticsEvent]);

  // Load layout
  const loadLayout = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      let loadedWidgets: DashboardWidget[] | null = null;
      
      if (onLoadLayout) {
        loadedWidgets = onLoadLayout();
      } else {
        // Try loading from localStorage
        const saved = localStorage.getItem(`dashboard-layout-${userRole.type}`);
        if (saved) {
          try {
            loadedWidgets = JSON.parse(saved);
          } catch (e) {
            console.error('Failed to parse saved layout:', e);
          }
        }
      }
      
      if (loadedWidgets) {
        setWidgets(loadedWidgets);
        
        // Analytics
        onAnalyticsEvent?.('layout_loaded', { 
          widgetCount: loadedWidgets.length,
          userRole: userRole.type 
        });
      }
      setIsLoading(false);
    }, 300);
  }, [onLoadLayout, userRole.type, onAnalyticsEvent]);

  // Reset to default layout
  const resetLayout = useCallback(() => {
    setWidgets([]);
    localStorage.removeItem(`dashboard-layout-${userRole.type}`);
    
    // Analytics
    onAnalyticsEvent?.('layout_reset', { userRole: userRole.type });
  }, [userRole.type, onAnalyticsEvent]);

  // Categories for filtering
  const categories = [
    { id: 'all', label: 'Tous', count: availableWidgets.length },
    { id: 'intelligence', label: 'IA', count: availableWidgets.filter(w => w.category === 'intelligence').length },
    { id: 'analytics', label: 'Analytics', count: availableWidgets.filter(w => w.category === 'analytics').length },
    { id: 'monitoring', label: 'Monitoring', count: availableWidgets.filter(w => w.category === 'monitoring').length },
    ...(userRole.type === 'client' ? [
      { id: 'sales', label: 'Ventes', count: availableWidgets.filter(w => w.category === 'sales').length },
      { id: 'finance', label: 'Finance', count: availableWidgets.filter(w => w.category === 'finance').length },
      { id: 'operations', label: 'Opérations', count: availableWidgets.filter(w => w.category === 'operations').length }
    ] : []),
    ...(userRole.type === 'admin' ? [
      { id: 'admin', label: 'Administration', count: availableWidgets.filter(w => w.category === 'admin').length }
    ] : [])
  ].filter(cat => cat.count > 0);

  return (
    <div className={cn(
      currentTheme.background,
      "relative w-full h-screen overflow-auto",
      className
    )}>
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <Card className="bg-gray-900/90 border-gray-800 p-6">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-blue-400 animate-spin" />
                <span className="text-gray-200">Chargement en cours...</span>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Toolbar */}
      <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800/50">
        <div className="flex items-center justify-between max-w-7xl mx-auto p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg">
                <Layout className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-100">
                  Dashboard Modulaire
                </h1>
                <p className="text-sm text-gray-400">
                  {userRole.type === 'admin' ? 'Mode Administrateur' : 'Mode Client'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                {widgets.length} widgets
              </Badge>
              
              {enableAI && (
                <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  IA Active
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPresetsOpen(true)}
              className="bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-gray-700/50"
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Presets
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddWidgetOpen(true)}
              className="bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-gray-700/50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-gray-700/50"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-gray-900 border-gray-800">
                <DropdownMenuLabel className="text-gray-300">Gestion du Layout</DropdownMenuLabel>
                <DropdownMenuItem 
                  className="text-gray-200 focus:bg-gray-800"
                  onClick={saveLayout}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-gray-200 focus:bg-gray-800"
                  onClick={loadLayout}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Charger
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuLabel className="text-gray-300">Thème</DropdownMenuLabel>
                {THEMES.map((themeOption) => (
                  <DropdownMenuItem 
                    key={themeOption.name}
                    className="text-gray-200 focus:bg-gray-800"
                    onClick={() => setCurrentTheme(themeOption)}
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    {themeOption.name}
                    {currentTheme.name === themeOption.name && (
                      <CheckCircle className="h-3 w-3 ml-auto text-green-400" />
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem 
                  className="text-red-400 focus:bg-red-900/20"
                  onClick={resetLayout}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Réinitialiser
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Dashboard Container */}
      <div 
        ref={containerRef}
        className="relative w-full min-h-screen p-6"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(255,255,255,0.02) 1px, transparent 0),
            linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px, ${GRID_SIZE}px ${GRID_SIZE}px, ${GRID_SIZE}px ${GRID_SIZE}px`
        }}
      >
        <AnimatePresence>
          {widgets.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Card className="bg-gray-900/50 border-gray-800/50 p-8 text-center max-w-md">
                <CardHeader>
                  <CardTitle className="text-gray-200 flex items-center gap-2">
                    <Layout className="h-5 w-5 text-blue-400" />
                    Dashboard vide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-6">
                    Personnalisez votre espace de travail en ajoutant des widgets ou en chargeant un preset.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={() => setIsAddWidgetOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un widget
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setIsPresetsOpen(true)}
                      className="border-gray-700 text-gray-200 hover:bg-gray-800/50"
                    >
                      <Grid3X3 className="h-4 w-4 mr-2" />
                      Charger un preset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {widgets.map(widget => (
            <DashboardWidgetContainer
              key={widget.id}
              widget={widget}
              onUpdateWidget={updateWidget}
              onRemoveWidget={removeWidget}
              onResize={handleWidgetResize}
              onRefresh={handleWidgetRefresh}
              isDragging={draggedWidget === widget.id}
              onDragStart={() => handleDragStart(widget.id, {} as React.MouseEvent)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Enhanced Add Widget Dialog */}
      <Dialog open={isAddWidgetOpen} onOpenChange={setIsAddWidgetOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-gray-100 flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-400" />
              Ajouter un Widget
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Personnalisez votre dashboard avec des widgets adaptés à votre rôle ({userRole.type}).
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher un widget..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 text-gray-200"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={showPremiumOnly}
                  onCheckedChange={setShowPremiumOnly}
                  id="premium-only"
                />
                <Label htmlFor="premium-only" className="text-sm text-gray-400">
                  Premium uniquement
                </Label>
              </div>
            </div>

            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="bg-gray-800/50">
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="text-gray-300 data-[state=active]:text-gray-100"
                  >
                    {category.label}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {category.count}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedCategory} className="mt-4">
                <ScrollArea className="h-96">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                    {availableWidgets.map((widgetTemplate) => {
                      const IconComponent = widgetTemplate.icon;
                      return (
                        <Card 
                          key={widgetTemplate.id}
                          className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                          onClick={() => addWidget(widgetTemplate)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
                                <IconComponent className="h-5 w-5 text-blue-400" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium text-gray-200">
                                    {widgetTemplate.title}
                                  </h3>
                                  {widgetTemplate.premium && (
                                    <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                                      Premium
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-400 mb-3">
                                  {widgetTemplate.description}
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                  {widgetTemplate.refreshable && (
                                    <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                                      <RefreshCw className="h-3 w-3 mr-1" />
                                      Rafraîchissable
                                    </Badge>
                                  )}
                                  {widgetTemplate.configurable && (
                                    <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                                      <Settings className="h-3 w-3 mr-1" />
                                      Configurable
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs border-gray-500/30 text-gray-400">
                                    {widgetTemplate.category}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  {availableWidgets.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-2">Aucun widget trouvé</div>
                      <p className="text-sm text-gray-500">
                        Essayez de modifier vos critères de recherche.
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddWidgetOpen(false)}
              className="bg-gray-800/50 border-gray-700 text-gray-200"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Presets Dialog */}
      <Dialog open={isPresetsOpen} onOpenChange={setIsPresetsOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-gray-100 flex items-center gap-2">
              <Grid3X3 className="h-5 w-5 text-blue-400" />
              Layouts Prédéfinis
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Chargez rapidement un layout optimisé pour votre utilisation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {LAYOUT_PRESETS.map((preset) => {
              const IconComponent = preset.icon;
              const isRecommended = (
                (userRole.type === 'client' && preset.id === 'client-essential') ||
                (userRole.type === 'admin' && preset.id === 'admin-control')
              );
              
              return (
                <Card 
                  key={preset.id}
                  className={cn(
                    "border-gray-700 hover:bg-gray-800/70 cursor-pointer transition-all duration-200 hover:scale-[1.02]",
                    isRecommended 
                      ? "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30" 
                      : "bg-gray-800/50"
                  )}
                  onClick={() => loadPreset(preset)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        isRecommended 
                          ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20" 
                          : "bg-gray-700/50"
                      )}>
                        <IconComponent className={cn(
                          "h-6 w-6",
                          isRecommended ? "text-blue-400" : "text-gray-400"
                        )} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-200">
                            {preset.name}
                          </h3>
                          {isRecommended && (
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                              <Target className="h-3 w-3 mr-1" />
                              Recommandé
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-3">
                          {preset.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs border-gray-500/30 text-gray-400">
                            {preset.widgets.length} widgets
                          </Badge>
                          <div className="flex gap-1">
                            {preset.widgets.slice(0, 3).map((widget, index) => (
                              <div
                                key={index}
                                className="w-2 h-2 bg-blue-400/50 rounded-full"
                              />
                            ))}
                            {preset.widgets.length > 3 && (
                              <div className="text-xs text-gray-500">+{preset.widgets.length - 3}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsPresetsOpen(false)}
              className="bg-gray-800/50 border-gray-700 text-gray-200"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModularDashboard;
