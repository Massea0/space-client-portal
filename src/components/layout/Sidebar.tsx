
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  FileText, 
  CreditCard, 
  MessageSquare, 
  Users,
  Building
} from 'lucide-react';

const AppSidebar = () => {
  const { user } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();

  const clientMenuItems = [
    {
      title: 'Tableau de Bord',
      url: '/dashboard',
      icon: LayoutDashboard
    },
    {
      title: 'Mes Devis',
      url: '/devis',
      icon: FileText
    },
    {
      title: 'Mes Factures',
      url: '/factures',
      icon: CreditCard
    },
    {
      title: 'Support',
      url: '/support',
      icon: MessageSquare
    }
  ];

  const adminMenuItems = [
    {
      title: 'Tableau de Bord',
      url: '/dashboard',
      icon: LayoutDashboard
    },
    {
      title: 'Entreprises',
      url: '/admin/companies',
      icon: Building
    },
    {
      title: 'Utilisateurs',
      url: '/admin/users',
      icon: Users
    },
    {
      title: 'Tous les Devis',
      url: '/admin/devis',
      icon: FileText
    },
    {
      title: 'Toutes les Factures',
      url: '/admin/factures',
      icon: CreditCard
    },
    {
      title: 'Tous les Tickets',
      url: '/admin/support',
      icon: MessageSquare
    }
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : clientMenuItems;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className={cn(
      "border-r border-slate-200 bg-white transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200",
                        "hover:bg-arcadis-gradient-subtle",
                        isActive(item.url) && "bg-arcadis-gradient text-white shadow-sm"
                      )}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 flex-shrink-0",
                        isActive(item.url) ? "text-white" : "text-slate-600"
                      )} />
                      {!collapsed && (
                        <span className={cn(
                          "font-medium text-sm",
                          isActive(item.url) ? "text-white" : "text-slate-700"
                        )}>
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
