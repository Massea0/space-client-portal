// src/components/layout/AppSidebar.tsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    useSidebar,
} from '@/components/ui/sidebar';
import {
    LayoutDashboard,
    FileText,
    CreditCard,
    MessageSquare,
    User,
    Building,
    Users as UsersIcon,
    LogOut, // L'icône LogOut est toujours utilisée ici
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Sous-composant pour un affichage cohérent des éléments de menu ---
const SidebarItemContent = ({ icon: Icon, label }: { icon: React.ElementType, label: string }) => {
    const { state: sidebarState } = useSidebar();
    return (
        <>
            <Icon className={cn(sidebarState === 'expanded' && "mr-3")} />
            {/* Le texte n'est affiché que si la sidebar est étendue */}
            {sidebarState === 'expanded' && <span className="flex-1 whitespace-nowrap">{label}</span>}
        </>
    );
};

// --- Composant de navigation ---
interface NavItemProps {
    to: string;
    icon: React.ElementType;
    label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
    const location = useLocation();
    // La logique d'activation est plus stricte pour les dashboards pour éviter les activations multiples
    const isActive = to.endsWith('dashboard')
        ? location.pathname === to
        : location.pathname.startsWith(to);

    return (
        <SidebarMenuItem>
            <NavLink to={to}>
                {({ isActive: isNavLinkActive }) => (
                    <SidebarMenuButton
                        isActive={isNavLinkActive || isActive}
                        tooltip={label}
                    >
                        <SidebarItemContent icon={icon} label={label} />
                    </SidebarMenuButton>
                )}
            </NavLink>
        </SidebarMenuItem>
    );
};

// --- Composant principal de la Sidebar ---
const AppSidebar = () => {
    const { user, logout } = useAuth();
    const { state: sidebarState } = useSidebar(); // Récupération de l'état de la sidebar

    const adminNavItems = [
        { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/admin/companies', icon: Building, label: 'Entreprises' },
        { to: '/admin/users', icon: UsersIcon, label: 'Utilisateurs' },
        { to: '/admin/devis', icon: FileText, label: 'Devis' },
        { to: '/admin/factures', icon: CreditCard, label: 'Factures' },
        { to: '/admin/support', icon: MessageSquare, label: 'Support' },
    ];

    const clientNavItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/devis', icon: FileText, label: 'Devis' },
        { to: '/factures', icon: CreditCard, label: 'Factures' },
        { to: '/support', icon: MessageSquare, label: 'Support' },
    ];

    const navItems = user?.role === 'admin' ? adminNavItems : clientNavItems;

    return (
        // SidebarContent gère déjà h-full et overflow-y-auto.
        // Nous retirons overflow-y-hidden d'ici pour laisser SidebarContent gérer le défilement.
        <SidebarContent className="flex flex-col">
            {/* Section En-tête de la Sidebar */}
            <div className={cn(
                "flex items-center gap-2 px-4 border-b border-sidebar-border h-16 flex-shrink-0", // flex-shrink-0 pour que l'en-tête ne se réduise pas
                sidebarState === 'collapsed' ? 'justify-center' : 'justify-start'
            )}>
                <img src="/logo/logo-header.png" alt="Arcadis Space Logo" className="h-10 w-auto flex-shrink-0" />
                {sidebarState === 'expanded' && (
                    <h1 className="text-xl font-bold text-primary whitespace-nowrap transition-opacity duration-300">
                        Arcadis Space
                    </h1>
                )}
                {/* Le bouton Pin/Unpin a été déplacé vers AppHeader.tsx */}
            </div>

            {/* Section principale de navigation (avec défilement interne) */}
            {/* flex-grow permet à cette section de prendre l'espace disponible et de défiler si nécessaire */}
            <div className="flex-grow py-2 px-4 overflow-y-auto">
                <SidebarMenu>
                    {navItems.map((item) => (
                        <NavItem key={item.to} {...item} />
                    ))}
                </SidebarMenu>
            </div>

            {/* Section inférieure (Profil et Déconnexion) */}
            {/* flex-shrink-0 pour que le pied de page ne se réduise pas et reste visible */}
            <div className="px-4 border-t border-sidebar-border h-auto py-2 flex-shrink-0">
                <SidebarMenu>
                    <NavItem to="/profile" icon={User} label="Mon Profil" />
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={logout} tooltip="Déconnexion">
                            <SidebarItemContent icon={LogOut} label="Déconnexion" />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </div>
        </SidebarContent>
    );
};

export default AppSidebar;