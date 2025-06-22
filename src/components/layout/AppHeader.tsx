// /Users/a00/myspace/src/components/layout/AppHeader.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, ChevronsLeftRight } from 'lucide-react'; // Import ChevronsLeftRight
import UserNav from './UserNav';

interface AppHeaderProps {
    isCollapsed: boolean; // MODIFIÉ: Nom de la prop pour correspondre à Layout.tsx
    setIsCollapsed: (collapsed: boolean) => void; // MODIFIÉ: Nom de la prop pour correspondre à Layout.tsx
}

const AppHeader: React.FC<AppHeaderProps> = ({ isCollapsed, setIsCollapsed }) => {
    return (
        // MODIFIÉ: bg-white -> bg-card pour la compatibilité avec le thème
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 sticky top-0 z-30">
            {/* Bouton pour afficher/cacher la sidebar sur mobile */}
            <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(false)} className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Sidebar</span>
            </Button>

            {/* Bouton Desktop pour épingler/détacher */}
            {/* Ce bouton est pour le bureau, il est donc caché sur mobile */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)} // MODIFIÉ: Utilise setIsCollapsed pour basculer l'état
                className="hidden md:flex" // Afficher uniquement sur les écrans md et plus grands
                title={isCollapsed ? 'Étendre la sidebar' : 'Réduire la sidebar'}
            >
                {/* L'icône tourne pour indiquer l'état de la sidebar */}
                <ChevronsLeftRight className={isCollapsed ? "rotate-180" : ""} />
                <span className="sr-only">Toggle Sidebar</span>
            </Button>

            {/* Espace réservé à gauche, peut être utilisé pour le titre de la page ou des breadcrumbs */}
            <div className="flex-1"></div>

            {/* Intégration du composant UserNav pour la navigation utilisateur */}
            <div className="flex items-center gap-4">
                <UserNav />
            </div>
        </header>
    );
};

export default AppHeader;