// src/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Sidebar as ShadcnSidebar, // Renommé pour éviter conflit de nom
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar, // Hook de la sidebar de shadcn/ui
} from '@/components/ui/sidebar';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher'; // AJOUTÉ
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  MessageSquare,
  Users,
  Building,
  // Settings // Ajouté pour une future page de paramètres (commenté pour l'instant)
} from 'lucide-react';

const AppSidebar = () => {
  const { user } = useAuth();
  const { state, isMobile, toggle } = useSidebar(); // Utiliser le hook de la sidebar, toggle ajouté si besoin
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
    // { title: 'Paramètres', url: '/admin/settings', icon: Settings } // Pour plus tard
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : clientMenuItems;
  // isCollapsed est vrai si la sidebar n'est pas en mode mobile ET que son état est 'collapsed'
  const isCollapsed = !isMobile && state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === path;
    // Pour les autres liens, vérifier si le chemin actuel commence par l'URL du lien
    // Cela permet de garder actif "Mes Devis" même si on est sur "/devis/123"
    return location.pathname.startsWith(path);
  };

  return (
      <ShadcnSidebar // Utilisation du nom renommé
          className={cn(
              "border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
              // Les largeurs sont gérées par le composant Sidebar de shadcn/ui via les data-attributes
              // ou peuvent être explicitement définies ici si nécessaire en fonction de 'isCollapsed'
              isCollapsed ? "w-16" : "w-64", // Largeurs explicites pour l'état collapsé/étendu
              "border-sidebar-border" // S'assurer que la bordure utilise la variable de thème
          )}
      >
        <SidebarContent className="flex flex-col p-3"> {/* p-3 au lieu de p-4 pour un look plus compact */}
          {/* Logo Section - Optionnel, peut être ajouté ici si désiré */}
          {/* <div className={cn("mb-4 flex items-center", isCollapsed ? "justify-center" : "px-2")}>
          <img src={isCollapsed ? "/logo/logo-icon.svg" : "/logo/logo-full.svg"} alt="Arcadis" className={isCollapsed ? "h-8 w-8" : "h-8 w-auto"} />
        </div> */}

          <SidebarGroup className="flex-grow"> {/* flex-grow pour pousser le switcher en bas */}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1.5">
                {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                          asChild
                          tooltip={isCollapsed ? item.title : undefined} // Afficher tooltip si collapsé
                          isActive={isActive(item.url)}
                          className={cn( // Styles personnalisés pour le bouton actif/inactif
                              "w-full justify-start rounded-lg", // Assurer que le texte est à gauche, rounded-lg pour un look plus doux
                              isActive(item.url)
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" // Style actif plus prononcé
                                  : "hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground text-sidebar-foreground/90", // Style inactif et survol
                              isCollapsed ? "px-0 justify-center h-10 w-10" : "px-3 py-2.5" // Ajustement padding pour collapsé/étendu
                          )}
                      >
                        <NavLink
                            to={item.url}
                            className="flex items-center gap-3"
                            title={isCollapsed ? item.title : undefined} // Ajout du title pour accessibilité en mode collapsé
                        >
                          <item.icon className={cn(
                              "h-5 w-5 flex-shrink-0",
                              // La couleur de l'icône est gérée par text-sidebar-accent-foreground sur le parent actif
                              // ou text-sidebar-foreground/90 pour inactif
                          )} />
                          <span className={cn(isCollapsed && "sr-only")}>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Theme Switcher en bas */}
          <div className={cn(
              "mt-auto pt-3 border-t", // pt-3 pour un espacement plus fin
              isCollapsed ? "flex justify-center py-3" : "px-1 py-2", // Ajustement padding pour collapsé/étendu
              "border-sidebar-border" // S'assurer que la bordure utilise la variable de thème
          )}>
            <ThemeSwitcher isCollapsed={isCollapsed} />
          </div>
        </SidebarContent>
      </ShadcnSidebar>
  );
};

export default AppSidebar;