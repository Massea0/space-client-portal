// /Users/a00/myspace/src/components/layout/Layout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { Sidebar } from '@/components/ui/sidebar';
import { TooltipProvider } from "@/components/ui/tooltip";
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader'; // Utilisation du nouveau AppHeader
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const Layout = () => {
    const isMobile = useIsMobile();

    const [isCollapsed, setIsCollapsed] = useState(() => {
        // Initialise l'état replié/étendu de la sidebar
        if (isMobile) return true; // Toujours repliée sur mobile par défaut
        if (typeof window !== 'undefined') {
            // Récupère l'état précédent du localStorage si disponible
            return localStorage.getItem('sidebar-collapsed') === 'true';
        }
        return false; // Étendue par défaut si pas d'info ou pas mobile
    });

    const location = useLocation();

    // Sauvegarde l'état de la sidebar dans le localStorage
    useEffect(() => {
        if (!isMobile) {
            localStorage.setItem('sidebar-collapsed', String(isCollapsed));
        }
    }, [isCollapsed, isMobile]);

    // Replie la sidebar sur mobile lors d'un changement de route
    useEffect(() => {
        if (isMobile) {
            setIsCollapsed(true);
        }
    }, [location.pathname, isMobile]);

    return (
        <TooltipProvider>
            <div className="flex h-screen bg-background text-foreground">
                {/* Sidebar pour Desktop (maintenant dans le flux de la page) */}
                <div
                    className={cn(
                        "hidden md:flex md:flex-col transition-all duration-300", // La sidebar est un élément flex
                        isCollapsed ? 'w-20' : 'w-64' // Contrôle la largeur de la sidebar
                    )}>
                    <Sidebar
                        isCollapsed={isCollapsed}
                        setIsCollapsed={setIsCollapsed}
                        className="h-full" // La classe 'fixed' a été retirée pour que la sidebar reste dans le flux
                    >
                        <AppSidebar />
                    </Sidebar>
                </div>

                {/* Sidebar pour Mobile (en superposition, inchangée) */}
                {isMobile && (
                    <>
                        {/* Overlay pour fermer la sidebar en cliquant à l'extérieur */}
                        <div
                            onClick={() => setIsCollapsed(true)}
                            className={cn(
                                "fixed inset-0 z-30 bg-black/60 md:hidden",
                                isCollapsed ? "hidden" : "block"
                            )}
                        />
                        {/* La sidebar mobile elle-même */}
                        <div
                            className={cn(
                                "fixed top-0 left-0 h-full z-40 w-64 transition-transform duration-300 ease-in-out md:hidden",
                                isCollapsed ? "-translate-x-full" : "translate-x-0"
                            )}
                        >
                            <Sidebar isCollapsed={false} setIsCollapsed={setIsCollapsed} className="h-full">
                                <AppSidebar />
                            </Sidebar>
                        </div>
                    </>
                )}

                {/* Contenu principal de l'application */}
                <div className={cn(
                    "flex flex-1 flex-col overflow-hidden", // La marge (ml-*) a été retirée
                )}>
                    {/* L'en-tête de l'application */}
                    <AppHeader isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                    {/* Zone principale de contenu avec défilement */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
};

export default Layout;