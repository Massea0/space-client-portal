// src/pages/DashboardModular.tsx - Dashboard révolutionnaire Sprint 6
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  ModularDashboard, 
  AIInsightsCard,
  DashboardWidget,
  InteractiveStatsCard,
  InteractiveActivityCard
} from '@/components/modules/dashboard';
import { devisApi, invoicesApi, ticketsApi, companiesApi, usersApi } from '@/services/api';
import { Devis, Invoice, Ticket } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Settings,
  Palette,
  Maximize,
  Grid3X3,
  Sparkles,
  Zap,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  ClipboardList,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { notificationManager } from '@/components/ui/notification-provider';

interface DashboardModularProps {
  className?: string;
}

// Configuration par défaut des widgets selon le rôle
const getDefaultWidgets = (userRole: string, userId: string): DashboardWidget[] => {
  const baseWidgets: DashboardWidget[] = [
    {
      id: `ai-insights-${userId}`,
      title: '🧠 Insights IA Premium',
      type: 'ai-insights',
      size: { width: 400, height: 350, minWidth: 350, minHeight: 300, maxWidth: 600, maxHeight: 500 },
      position: { x: 50, y: 50 },
      component: AIInsightsCard,
      refreshable: true,
      configurable: true,
      props: { 
        darkMode: true, 
        maxInsights: 4,
        showTrends: true,
        title: "Insights IA Premium"
      }
    },
    {
      id: `stats-main-${userId}`,
      title: '📊 Métriques Principales',
      type: 'stats',
      size: { width: 300, height: 220, minWidth: 280, minHeight: 200, maxWidth: 400, maxHeight: 280 },
      position: { x: 480, y: 50 },
      component: InteractiveStatsCard,
      refreshable: true,
      configurable: false,
      props: { 
        title: "Revenus",
        value: "€0",
        icon: 'TrendingUp',
        color: "blue",
        description: "Chargement..."
      }
    },
    {
      id: `activity-feed-${userId}`,
      title: '⚡ Activités Récentes',
      type: 'activity',
      size: { width: 450, height: 380, minWidth: 400, minHeight: 350, maxWidth: 600, maxHeight: 500 },
      position: { x: 50, y: 430 },
      component: InteractiveActivityCard,
      refreshable: true,
      configurable: true,
      props: {
        title: "Activités récentes",
        activities: [],
        maxItems: 5,
        emptyMessage: "Aucune activité récente"
      }
    }
  ];

  // Ajouter des widgets spécifiques admin
  if (userRole === 'admin') {
    baseWidgets.push({
      id: `admin-overview-${userId}`,
      title: '🏢 Vue Administrateur',
      type: 'stats',
      size: { width: 320, height: 240, minWidth: 300, minHeight: 220, maxWidth: 400, maxHeight: 300 },
      position: { x: 520, y: 430 },
      component: InteractiveStatsCard,
      refreshable: true,
      configurable: false,
      props: {
        title: "Entreprises",
        value: "0",
        icon: 'Building',
        color: "purple",
        description: "Clients actifs"
      }
    });
  }

  return baseWidgets;
};

export const DashboardModular: React.FC<DashboardModularProps> = ({ className }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // États pour les données
  const [devisList, setDevisList] = useState<Devis[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [companiesCount, setCompaniesCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // États pour le dashboard modulaire
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [isModularMode, setIsModularMode] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Charger les données métier
  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [devis, invoicesData, ticketsData] = await Promise.all([
        user.role === 'admin' ? devisApi.getAll() : devisApi.getByCompany(user.companyId || ''),
        user.role === 'admin' ? invoicesApi.getAll() : invoicesApi.getByCompany(user.companyId || ''),
        user.role === 'admin' ? ticketsApi.getAll() : ticketsApi.getByCompany(user.companyId || '')
      ]);

      setDevisList(devis);
      setInvoices(invoicesData);
      setTickets(ticketsData);

      // Charger les stats admin si nécessaire
      if (user.role === 'admin') {
        try {
          const [companies, users] = await Promise.all([
            companiesApi.getAll(),
            usersApi.getAll()
          ]);
          setCompaniesCount(companies.length);
          setUsersCount(users.length);
        } catch (error) {
          console.error('Erreur chargement stats admin:', error);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      notificationManager.error('Erreur de chargement des données');
      setLoading(false);
    }
  }, [user]);

  // Stats calculées
  const stats = useMemo(() => {
    const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.amount.toString()), 0);
    const overdueAmount = invoices
      .filter(inv => inv.status === 'late' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + parseFloat(inv.amount.toString()), 0);
    const pendingAmount = devisList
      .filter(devis => devis.status === 'sent' || devis.status === 'pending')
      .reduce((sum, devis) => sum + parseFloat(devis.amount.toString()), 0);
    const openTickets = tickets.filter(t => 
      t.status === 'open' || t.status === 'pending_client_response' || 
      t.status === 'pending_admin_response' || t.status === 'in_progress'
    ).length;

    return {
      invoicesCount: invoices.length,
      totalAmount,
      pendingAmount,
      overdueAmount,
      devisCount: devisList.length,
      openTickets,
      companiesCount,
      usersCount
    };
  }, [invoices, devisList, tickets, companiesCount, usersCount]);

  // Activités récentes
  const recentActivities = useMemo(() => {
    const activities: any[] = [];
    
    // Activités des factures
    invoices
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .forEach(invoice => {
        activities.push({
          id: `invoice-${invoice.id}`,
          title: `Facture ${invoice.number}`,
          description: `${invoice.status === 'paid' ? 'Payée' : 'Créée'} - ${formatCurrency(parseFloat(invoice.amount.toString()))}`,
          date: invoice.createdAt,
          type: 'invoice',
          status: invoice.status === 'paid' ? 'completed' : 'pending'
        });
      });

    // Activités des devis
    devisList
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .forEach(devis => {
        activities.push({
          id: `devis-${devis.id}`,
          title: `Devis ${devis.number}`,
          description: `${devis.status === 'approved' ? 'Approuvé' : 'Créé'} - ${formatCurrency(parseFloat(devis.amount.toString()))}`,
          date: devis.createdAt,
          type: 'quote',
          status: devis.status === 'approved' ? 'completed' : 'pending'
        });
      });

    // Activités des tickets
    tickets
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2)
      .forEach(ticket => {
        activities.push({
          id: `ticket-${ticket.id}`,
          title: ticket.subject || `Ticket #${ticket.number}`,
          description: `Statut: ${ticket.status}`,
          date: ticket.createdAt,
          type: 'ticket',
          status: ticket.status === 'closed' ? 'completed' : 'pending'
        });
      });

    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [invoices, devisList, tickets]);

  // Initialiser les widgets
  useEffect(() => {
    if (user && widgets.length === 0) {
      const defaultWidgets = getDefaultWidgets(user.role || 'client', user.id);
      setWidgets(defaultWidgets);
    }
  }, [user, widgets.length]);

  // Mettre à jour les props des widgets avec les vraies données
  useEffect(() => {
    if (!loading && widgets.length > 0) {
      setWidgets(prevWidgets => 
        prevWidgets.map(widget => {
          if (widget.type === 'stats' && widget.id.includes('stats-main')) {
            return {
              ...widget,
              props: {
                ...widget.props,
                title: "Revenus totaux",
                value: formatCurrency(stats.totalAmount),
                description: `${stats.invoicesCount} factures`,
                trend: { direction: 'up', value: '+12.5%' }
              }
            };
          }
          
          if (widget.type === 'stats' && widget.id.includes('admin-overview')) {
            return {
              ...widget,
              props: {
                ...widget.props,
                title: "Entreprises",
                value: stats.companiesCount.toString(),
                description: `${stats.usersCount} utilisateurs`
              }
            };
          }
          
          if (widget.type === 'activity') {
            return {
              ...widget,
              props: {
                ...widget.props,
                activities: recentActivities
              }
            };
          }
          
          return widget;
        })
      );
    }
  }, [loading, stats, recentActivities]);

  // Charger les données au montage
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handlers pour le dashboard modulaire
  const handleSaveLayout = useCallback((savedWidgets: DashboardWidget[]) => {
    localStorage.setItem(`dashboard-layout-${user?.id}`, JSON.stringify(savedWidgets));
    notificationManager.success('Configuration sauvegardée');
  }, [user?.id]);

  const handleLoadLayout = useCallback((): DashboardWidget[] | null => {
    try {
      const saved = localStorage.getItem(`dashboard-layout-${user?.id}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, [user?.id]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen transition-all duration-300 bg-background",
      className
    )}>
      {/* Header avec contrôles */}
      <div className={cn(
        "sticky top-0 z-40 backdrop-blur-sm border-b transition-colors bg-background/95 border-border"
      )}>
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">
                  Dashboard
                </h1>
                <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
              </div>
              
              <Badge variant="secondary" className="font-medium">
                {user.role === 'admin' ? '👑 Admin' : '👤 Client'} • {user.firstName} {user.lastName}
              </Badge>
            </div>

            <TooltipProvider>
              <div className="flex items-center gap-2">
                {/* Toggle Mode Modulaire */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsModularMode(!isModularMode)}
                      className="gap-2"
                    >
                      {isModularMode ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      {isModularMode ? 'Modulaire ON' : 'Modulaire OFF'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isModularMode ? 'Désactiver' : 'Activer'} le mode modulaire</p>
                  </TooltipContent>
                </Tooltip>

                {/* Toggle Dark Mode */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDarkMode(!isDarkMode)}
                    >
                      <Palette className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Basculer {isDarkMode ? 'mode clair' : 'mode sombre'}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Refresh */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadDashboardData}
                      disabled={loading}
                    >
                      <Zap className={cn("h-4 w-4", loading && "animate-spin")} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Actualiser les données</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <AnimatePresence mode="wait">
        {isModularMode ? (
          <motion.div
            key="modular"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <ModularDashboard
              initialWidgets={widgets}
              onSaveLayout={handleSaveLayout}
              onLoadLayout={handleLoadLayout}
            />
          </motion.div>
        ) : (
          <motion.div
            key="classic"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto p-6 space-y-6"
          >
            {/* Mode classique avec nos composants */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <Card className={cn(
                isDarkMode ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"
              )}>
                <CardContent className="p-6">
                  <InteractiveStatsCard
                    title="Revenus totaux"
                    value={formatCurrency(stats.totalAmount)}
                    description={`${stats.invoicesCount} factures`}
                    icon={TrendingUp}
                    color="blue"
                  />
                </CardContent>
              </Card>

              <Card className={cn(
                isDarkMode ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"
              )}>
                <CardContent className="p-6">
                  <InteractiveStatsCard
                    title="Devis en cours"
                    value={stats.devisCount.toString()}
                    description={formatCurrency(stats.pendingAmount) + " en attente"}
                    icon={ClipboardList}
                    color="yellow"
                  />
                </CardContent>
              </Card>

              <Card className={cn(
                isDarkMode ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"
              )}>
                <CardContent className="p-6">
                  <InteractiveStatsCard
                    title="Support"
                    value={stats.openTickets.toString()}
                    description="tickets ouverts"
                    icon={MessageSquare}
                    color="green"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Activités et IA */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className={cn(
                isDarkMode ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"
              )}>
                <CardContent className="p-0">
                  <InteractiveActivityCard
                    title="Activités récentes"
                    activities={recentActivities}
                    maxItems={5}
                    emptyMessage="Aucune activité récente"
                  />
                </CardContent>
              </Card>

              <AIInsightsCard
                title="Insights IA"
                darkMode={isDarkMode}
                maxInsights={4}
                showTrends={true}
                onInsightClick={(insight) => console.log('Insight:', insight)}
                onTakeAction={(id) => console.log('Action:', id)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardModular;
