// src/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAppSidebar } from './Layout'; // Use the hook from Layout.tsx
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  MessageSquare,
  Users,
  Building,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

const AppSidebar = () => {
  const { user } = useAuth();
  const { state, isMobile, toggle } = useAppSidebar();
  const location = useLocation();

  const clientMenuItems = [
    { title: 'Tableau de Bord', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Mes Devis', url: '/devis', icon: FileText },
    { title: 'Mes Factures', url: '/factures', icon: CreditCard },
    { title: 'Support', url: '/support', icon: MessageSquare }
  ];

  const adminMenuItems = [
    { title: 'Tableau de Bord', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Entreprises', url: '/admin/companies', icon: Building },
    { title: 'Utilisateurs', url: '/admin/users', icon: Users },
    { title: 'Tous les Devis', url: '/admin/devis', icon: FileText },
    { title: 'Toutes les Factures', url: '/admin/factures', icon: CreditCard },
    { title: 'Tous les Tickets', url: '/admin/support', icon: MessageSquare }
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : clientMenuItems;
  const isCollapsed = !isMobile && state === 'collapsed';
  const isOpen = state === 'open';

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
      <TooltipProvider>
        {isMobile && isOpen && (
            <div
                className="fixed inset-0 z-40 bg-black/50 md:hidden"
                onClick={toggle}
            />
        )}

        <ShadcnSidebar
            className={cn(
                "border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out border-sidebar-border",
                "fixed inset-y-0 left-0 z-50 md:static",
                isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : (isCollapsed ? "w-16" : "w-64"),
                "md:translate-x-0"
            )}
        >
          <SidebarContent className="flex flex-col p-3">
            <SidebarGroup className="flex-grow">
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1.5">
                  {menuItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            tooltip={isCollapsed ? item.title : undefined}
                            isActive={isActive(item.url)}
                            className={cn(
                                "w-full justify-start rounded-lg",
                                isActive(item.url)
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                    : "hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground text-sidebar-foreground/90",
                                isCollapsed ? "px-0 justify-center h-10 w-10" : "px-3 py-2.5"
                            )}
                        >
                          <NavLink
                              to={item.url}
                              className="flex items-center gap-3"
                              title={isCollapsed ? item.title : undefined}
                              onClick={() => { if (isMobile) toggle(); }}
                          >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            <span className={cn(isCollapsed && "sr-only")}>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-auto flex flex-col gap-2">
              <div className={cn(
                  "pt-3 border-t",
                  isCollapsed ? "flex justify-center py-1" : "px-1 py-1",
                  "border-sidebar-border"
              )}>
                <ThemeSwitcher />
              </div>

              <div className="hidden md:block">
                <SidebarMenuButton
                    onClick={toggle}
                    className="w-full justify-center"
                    tooltip={isCollapsed ? "Expand" : "Collapse"}
                >
                  {isCollapsed ? (
                      <ChevronsRight className="h-5 w-5" />
                  ) : (
                      <ChevronsLeft className="h-5 w-5" />
                  )}
                </SidebarMenuButton>
              </div>
            </div>
          </SidebarContent>
        </ShadcnSidebar>
      </TooltipProvider>
  );
};

export default AppSidebar;