// src/components/layout/AppLayout.tsx
import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarSearch,
  SidebarGroup,
  SidebarMenu,
  SidebarFooter,
  SidebarTrigger,
  SidebarProvider,
  type SidebarItem
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Settings,
  Users,
  Building,
  Brain,
  TrendingUp,
  Target,
  Zap,
  AlertTriangle,
  Home,
  Sparkles,
  CreditCard,
  MessageSquare,
  User,
  LogOut,
  Palette,
  FolderKanban
} from 'lucide-react';
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children?: React.ReactNode;
  showSidebar?: boolean;
  sidebarVariant?: 'default' | 'compact' | 'floating';
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showSidebar = true,
  sidebarVariant = 'default'
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() => {
    if (isMobile) return true;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    }
    return false;
  });

  // Sauvegarde l'état de la sidebar
  React.useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed));
    }
  }, [sidebarCollapsed, isMobile]);

  // Replie la sidebar sur mobile lors d'un changement de route
  React.useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [location.pathname, isMobile]);

  // Configuration des items de navigation
  const navigationItems: SidebarItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: user?.role === 'admin' ? '/admin/dashboard' : '/dashboard',
      isActive: location.pathname === '/dashboard' || location.pathname === '/admin/dashboard'
    },
    {
      id: 'devis',
      title: 'Devis',
      icon: FileText,
      href: user?.role === 'admin' ? '/admin/devis' : '/devis',
      isActive: location.pathname.startsWith('/devis')
    },
    {
      id: 'factures',
      title: 'Factures',
      icon: CreditCard,
      href: user?.role === 'admin' ? '/admin/factures' : '/factures',
      isActive: location.pathname.startsWith('/factures')
    },
    {
      id: 'projects',
      title: 'Projets',
      icon: FolderKanban,
      href: '/projects',
      isActive: location.pathname.startsWith('/projects')
    },
    {
      id: 'hr',
      title: 'Ressources Humaines',
      icon: Users,
      href: '/hr',
      isActive: location.pathname.startsWith('/hr')
    },
    {
      id: 'support',
      title: 'Support',
      icon: MessageSquare,
      href: user?.role === 'admin' ? '/admin/support' : '/support',
      isActive: location.pathname.startsWith('/support')
    }
  ];

  // Items spécifiques admin
  if (user?.role === 'admin') {
    navigationItems.push(
      {
        id: 'analytics',
        title: 'Analytics IA',
        icon: Brain,
        href: '/analytics',
        isActive: location.pathname.startsWith('/analytics'),
        children: [
          {
            id: 'analytics-overview',
            title: 'Vue d\'ensemble',
            href: '/analytics',
            isActive: location.pathname === '/analytics'
          },
          {
            id: 'analytics-predictions',
            title: 'Prédictions',
            href: '/analytics/predictions',
            isActive: location.pathname === '/analytics/predictions'
          },
          {
            id: 'analytics-risks',
            title: 'Analyse des Risques',
            href: '/analytics/risks',
            isActive: location.pathname === '/analytics/risks'
          },
          {
            id: 'analytics-efficiency',
            title: 'Efficacité Opérationnelle',
            href: '/analytics/efficiency',
            isActive: location.pathname === '/analytics/efficiency'
          },
          {
            id: 'analytics-opportunities',
            title: 'Opportunités Business',
            href: '/analytics/opportunities',
            isActive: location.pathname === '/analytics/opportunities'
          }
        ]
      },
      {
        id: 'hr-admin',
        title: 'RH - Administration',
        icon: Users,
        href: '/hr',
        isActive: location.pathname.startsWith('/hr'),
        children: [
          {
            id: 'hr-employees',
            title: 'Gestion Employés',
            href: '/hr/employees',
            isActive: location.pathname === '/hr/employees'
          },
          {
            id: 'hr-departments',
            title: 'Départements',
            href: '/hr/departments',
            isActive: location.pathname === '/hr/departments'
          },
          {
            id: 'hr-organization',
            title: 'Organisation',
            href: '/hr/organization',
            isActive: location.pathname === '/hr/organization'
          },
          {
            id: 'hr-analytics',
            title: 'Analytics RH',
            href: '/hr/analytics',
            isActive: location.pathname === '/hr/analytics'
          }
        ]
      },
      {
        id: 'reports',
        title: 'Rapports',
        icon: FileText,
        href: '/admin/rapports',
        isActive: location.pathname === '/admin/rapports'
      },
      {
        id: 'contracts',
        title: 'Contrats IA',
        icon: FileText,
        href: '/admin/contracts',
        isActive: location.pathname.startsWith('/admin/contracts')
      },
      {
        id: 'reference-quotes',
        title: 'Modèles Référence',
        icon: Target,
        href: '/admin/reference-quotes',
        isActive: location.pathname.startsWith('/admin/reference-quotes')
      },
      {
        id: 'companies',
        title: 'Entreprises',
        icon: Building,
        href: '/admin/companies',
        isActive: location.pathname.startsWith('/admin/companies')
      },
      {
        id: 'users',
        title: 'Utilisateurs',
        icon: Users,
        href: '/admin/users',
        isActive: location.pathname === '/admin/users'
      },
      {
        id: 'settings',
        title: 'Paramètres',
        icon: Settings,
        href: '/admin/settings',
        isActive: location.pathname === '/admin/settings'
      }
    );
  }

  // Ajouter le Design System pour tous
  navigationItems.push({
    id: 'showcase',
    title: 'Design System',
    icon: Sparkles,
    href: '/design-system',
    isActive: location.pathname === '/design-system-showcase'
  });

  // Items de raccourcis
  const shortcutItems: SidebarItem[] = [
    {
      id: 'quick-add',
      title: 'Nouveau projet',
      icon: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      ),
      onClick: () => console.log('Nouveau projet')
    },
    {
      id: 'recent-files',
      title: 'Fichiers récents',
      badge: 'Ctrl+R',
      onClick: () => console.log('Fichiers récents')
    },
    {
      id: 'favorites',
      title: 'Favoris',
      badge: 4,
      onClick: () => console.log('Favoris')
    }
  ];

  // Items du footer (profil et déconnexion)
  const footerItems: SidebarItem[] = [
    {
      id: 'profile',
      title: 'Mon Profil',
      icon: User,
      href: '/profile',
      isActive: location.pathname === '/profile'
    },
    {
      id: 'logout',
      title: 'Déconnexion',
      icon: LogOut,
      onClick: logout
    }
  ];

  const handleItemClick = (item: SidebarItem) => {
    if (item.href) {
      navigate(item.href);
    } else if (item.onClick) {
      item.onClick();
    }
  };

  if (!showSidebar) {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          {children || <Outlet />}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex min-h-screen bg-background">
          {/* Sidebar pour Desktop */}
          <div
            className={cn(
              "hidden md:flex md:flex-col transition-all duration-300",
              sidebarCollapsed ? 'w-20' : 'w-64'
            )}
          >
            <Sidebar
              variant={sidebarVariant}
              isCollapsed={sidebarCollapsed}
              setIsCollapsed={setSidebarCollapsed}
              collapsible={true}
              resizable={true}
              searchable={true}
              items={navigationItems}
              onItemClick={handleItemClick}
              className="h-full"
            >
              <SidebarHeader showToggle={true}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-foreground font-bold text-sm">AE</span>
                  </div>
                  {!sidebarCollapsed && (
                    <div>
                      <div className="font-semibold text-sm text-foreground">Arcadis Enterprise</div>
                      <div className="text-xs text-muted-foreground">OS Platform</div>
                    </div>
                  )}
                </div>
              </SidebarHeader>

              <SidebarContent>
                {!sidebarCollapsed && <SidebarSearch placeholder="Rechercher..." />}
                
                <SidebarGroup title="Navigation">
                  <SidebarMenu items={navigationItems} onItemClick={handleItemClick} />
                </SidebarGroup>
                
                {!sidebarCollapsed && (
                  <SidebarGroup title="Raccourcis" collapsible={true}>
                    <SidebarMenu items={shortcutItems} onItemClick={handleItemClick} />
                  </SidebarGroup>
                )}
              </SidebarContent>

              <SidebarFooter>
                <div className="space-y-1">
                  {footerItems.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      {item.icon && (
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                      )}
                      {!sidebarCollapsed && (
                        <span className="text-sm text-foreground">{item.title}</span>
                      )}
                    </div>
                  ))}
                </div>
                
                {!sidebarCollapsed && (
                  <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg mt-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {user?.firstName?.charAt(0) || 'U'}
                        {user?.lastName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </div>
                    </div>
                    <SidebarTrigger className="ml-auto" />
                  </div>
                )}
              </SidebarFooter>
            </Sidebar>
          </div>

          {/* Sidebar pour Mobile */}
          {isMobile && (
            <>
              {/* Overlay */}
              <div
                onClick={() => setSidebarCollapsed(true)}
                className={cn(
                  "fixed inset-0 z-30 bg-black/60 md:hidden",
                  sidebarCollapsed ? "hidden" : "block"
                )}
              />
              {/* Sidebar mobile */}
              <div
                className={cn(
                  "fixed top-0 left-0 h-full z-40 w-64 transition-transform duration-300 ease-in-out md:hidden",
                  sidebarCollapsed ? "-translate-x-full" : "translate-x-0"
                )}
              >
                <Sidebar
                  variant={sidebarVariant}
                  isCollapsed={false}
                  setIsCollapsed={setSidebarCollapsed}
                  collapsible={true}
                  resizable={false}
                  searchable={true}
                  items={navigationItems}
                  onItemClick={handleItemClick}
                  className="h-full"
                >
                  <SidebarHeader showToggle={true}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-sm">AE</span>
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground">Arcadis Enterprise</div>
                        <div className="text-xs text-muted-foreground">OS Platform</div>
                      </div>
                    </div>
                  </SidebarHeader>

                  <SidebarContent>
                    <SidebarSearch placeholder="Rechercher..." />
                    
                    <SidebarGroup title="Navigation">
                      <SidebarMenu items={navigationItems} onItemClick={handleItemClick} />
                    </SidebarGroup>
                    
                    <SidebarGroup title="Raccourcis" collapsible={true}>
                      <SidebarMenu items={shortcutItems} onItemClick={handleItemClick} />
                    </SidebarGroup>
                  </SidebarContent>

                  <SidebarFooter>
                    <div className="space-y-1">
                      {footerItems.map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          {item.icon && (
                            <item.icon className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm text-foreground">{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </SidebarFooter>
                </Sidebar>
              </div>
            </>
          )}

          {/* Contenu principal */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header mobile avec toggle sidebar - FIXE EN HAUT */}
            {isMobile && (
              <div className="sticky top-0 z-50 flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <SidebarTrigger onClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
                  <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-xs">AE</span>
                  </div>
                  <span className="font-semibold text-sm">Arcadis Enterprise</span>
                </div>
              </div>
            )}
            
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              {children || <Outlet />}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default AppLayout;
