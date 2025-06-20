// src/components/layout/Layout.tsx
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from './Sidebar';
import Header from './Header';
import { cn } from '@/lib/utils';

// --- Sidebar Context and Provider ---
const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, [matches, query]);
    return matches;
};

type SidebarContextType = {
    state: 'open' | 'collapsed';
    isMobile: boolean;
    toggle: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useAppSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useAppSidebar must be used within a AppSidebarProvider');
    }
    return context;
};

const AppSidebarProvider = ({ children }: { children: React.ReactNode }) => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [state, setState] = useState<'open' | 'collapsed'>(isMobile ? 'collapsed' : 'open');

    useEffect(() => {
        if (!isMobile) {
            setState('open');
        } else {
            setState('collapsed');
        }
    }, [isMobile]);

    const toggle = () => {
        setState(prevState => (prevState === 'open' ? 'collapsed' : 'open'));
    };

    const value = useMemo(() => ({ state, isMobile, toggle }), [state, isMobile]);

    return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};


// --- Layout Components ---

const AppLayoutContent = () => {
    return (
        <div className="relative flex min-h-screen w-full bg-background">
            <AppSidebar />
            <div
                className={cn(
                    "flex flex-1 flex-col",
                    // The unnecessary margin has been removed.
                    // On desktop, the sidebar is 'static' and part of the flex layout,
                    // so flex-1 on this div correctly fills the remaining space.
                    "transition-all duration-300 ease-in-out"
                )}
            >
                <Header />
                <main className="flex-1 overflow-y-auto p-4 sm:px-6 md:gap-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

const Layout = () => {
    return (
        <AppSidebarProvider>
            <AppLayoutContent />
        </AppSidebarProvider>
    );
};

export default Layout;