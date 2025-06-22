// src/components/ui/sidebar.tsx
import * as React from "react"
import { createContext, useContext, useCallback } from "react" // Removed useState
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

// --- Context pour l'état de la Sidebar ---
interface SidebarContextProps {
    state: "expanded" | "collapsed"
    isMobile: boolean
    toggle: () => void
    expand: () => void
    collapse: () => void
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined)

export function useSidebar() {
    const context = useContext(SidebarContext)
    if (!context) {
        throw new Error("useSidebar must be used within a Sidebar component (which acts as its provider)")
    }
    return context
}

// --- Composant Sidebar principal (agit comme fournisseur de contexte) ---
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    isCollapsed: boolean; // Prop contrôlée
    setIsCollapsed: (collapsed: boolean) => void; // Setter pour la prop contrôlée
    collapsible?: boolean;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
    ({ className, children, isCollapsed, setIsCollapsed, collapsible = true, ...props }, ref) => {
        const isMobile = useIsMobile();

        // Callbacks pour mettre à jour l'état externe
        const toggle = useCallback(() => {
            if (collapsible) {
                setIsCollapsed(!isCollapsed);
            }
        }, [collapsible, isCollapsed, setIsCollapsed]);

        const expand = useCallback(() => {
            if (collapsible && isCollapsed) {
                setIsCollapsed(false);
            }
        }, [collapsible, isCollapsed, setIsCollapsed]);

        const collapse = useCallback(() => {
            if (collapsible && !isCollapsed) {
                setIsCollapsed(true);
            }
        }, [collapsible, isCollapsed, setIsCollapsed]);

        const state = isMobile ? "collapsed" : (isCollapsed ? "collapsed" : "expanded");

        return (
            <SidebarContext.Provider value={{ state, isMobile, toggle, expand, collapse }}>
                <div
                    ref={ref}
                    className={cn(
                        "bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
                        className
                    )}
                    data-state={state}
                    {...props}
                >
                    {children}
                </div>
            </SidebarContext.Provider>
        );
    }
);
Sidebar.displayName = "Sidebar";

// --- Composant SidebarContent ---
const SidebarContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("h-full overflow-y-auto", className)}
        {...props}
    />
));
SidebarContent.displayName = "SidebarContent";

// --- Composant SidebarGroup ---
const SidebarGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("mb-4 last:mb-0", className)}
        {...props}
    />
));
SidebarGroup.displayName = "SidebarGroup";

// --- Composant SidebarGroupContent ---
const SidebarGroupContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("", className)}
        {...props}
    />
));
SidebarGroupContent.displayName = "SidebarGroupContent";

// --- Composant SidebarMenu ---
const SidebarMenu = React.forwardRef<
    HTMLUListElement,
    React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
    <ul
        ref={ref}
        className={cn("space-y-1", className)}
        {...props}
    />
));
SidebarMenu.displayName = "SidebarMenu";

// --- Composant SidebarMenuItem ---
const SidebarMenuItem = React.forwardRef<
    HTMLLIElement,
    React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
    <li
        ref={ref}
        className={cn("", className)}
        {...props}
    />
));
SidebarMenuItem.displayName = "SidebarMenuItem";

// --- Composant SidebarMenuButton ---
interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: string;
}

const SidebarMenuButton = React.forwardRef<
    HTMLButtonElement,
    SidebarMenuButtonProps
>(({ className, asChild = false, isActive, tooltip, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const { state: sidebarState, isMobile } = useSidebar();
    const isActuallyCollapsed = !isMobile && sidebarState === 'collapsed';

    const buttonContent = (
        <Comp
            ref={ref}
            className={cn(
                "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground",
                isActuallyCollapsed ? "justify-center" : "justify-start",
                className
            )}
            {...props}
        />
    );

    if (isActuallyCollapsed && tooltip) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
                <TooltipContent side="right">{tooltip}</TooltipContent>
            </Tooltip>
        );
    }

    return buttonContent;
});
SidebarMenuButton.displayName = "SidebarMenuButton";

// Optionnel: SidebarTrigger pour contrôler l'ouverture/fermeture depuis l'extérieur
const SidebarTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
    const { toggle } = useSidebar();
    return (
        <button ref={ref} onClick={toggle} className={cn(className)} {...props}>
            {children || "Toggle Sidebar"}
        </button>
    );
});
SidebarTrigger.displayName = "SidebarTrigger";


export {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarTrigger,
};