// src/components/ui/sidebar.tsx
import * as React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile" // Assurez-vous que ce hook existe

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
        throw new Error("useSidebar must be used within a SidebarProvider (which is the Sidebar component itself)")
    }
    return context
}

// --- Composant Sidebar principal (agit comme fournisseur de contexte) ---
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    defaultCollapsed?: boolean
    collapsible?: boolean
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
    ({ className, children, defaultCollapsed = false, collapsible = true, ...props }, ref) => {
        const isMobile = useIsMobile()
        const [isCollapsed, setIsCollapsed] = useState(isMobile ? true : defaultCollapsed)

        const toggle = useCallback(() => {
            if (collapsible) {
                setIsCollapsed((prev) => !prev)
            }
        }, [collapsible])

        const expand = useCallback(() => {
            if (collapsible && isCollapsed) {
                setIsCollapsed(false)
            }
        }, [collapsible, isCollapsed])

        const collapse = useCallback(() => {
            if (collapsible && !isCollapsed) {
                setIsCollapsed(true)
            }
        }, [collapsible, isCollapsed])

        // S'assurer que la sidebar est collapsée sur mobile initialement
        React.useEffect(() => {
            if (isMobile) {
                setIsCollapsed(true)
            }
        }, [isMobile])

        const state = isMobile ? "collapsed" : (isCollapsed ? "collapsed" : "expanded")

        return (
            <SidebarContext.Provider value={{ state, isMobile, toggle, expand, collapse }}>
                <div
                    ref={ref}
                    className={cn(
                        "bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
                        // Les classes de largeur seront appliquées par AppSidebar ou ici si nécessaire
                        // Exemple: state === "collapsed" && !isMobile ? "w-16" : "w-64",
                        className
                    )}
                    data-state={state}
                    {...props}
                >
                    {children}
                </div>
            </SidebarContext.Provider>
        )
    }
)
Sidebar.displayName = "Sidebar"

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
))
SidebarContent.displayName = "SidebarContent"

// --- Composant SidebarGroup ---
const SidebarGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("mb-4 last:mb-0", className)} // Espacement entre les groupes
        {...props}
    />
))
SidebarGroup.displayName = "SidebarGroup"

// --- Composant SidebarGroupContent ---
const SidebarGroupContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("", className)} // Pas de style spécifique par défaut
        {...props}
    />
))
SidebarGroupContent.displayName = "SidebarGroupContent"

// --- Composant SidebarMenu ---
const SidebarMenu = React.forwardRef<
    HTMLUListElement,
    React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
    <ul
        ref={ref}
        className={cn("space-y-1", className)} // Espacement entre les items du menu
        {...props}
    />
))
SidebarMenu.displayName = "SidebarMenu"

// --- Composant SidebarMenuItem ---
const SidebarMenuItem = React.forwardRef<
    HTMLLIElement,
    React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
    <li
        ref={ref}
        className={cn("", className)} // Pas de style spécifique par défaut
        {...props}
    />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

// --- Composant SidebarMenuButton ---
interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string // Pour le tooltip quand la sidebar est collapsée
}

const SidebarMenuButton = React.forwardRef<
    HTMLButtonElement,
    SidebarMenuButtonProps
>(({ className, asChild = false, isActive, tooltip, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const { state: sidebarState, isMobile } = useSidebar() // Utiliser le hook ici
    const isActuallyCollapsed = !isMobile && sidebarState === 'collapsed'

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
    )

    if (isActuallyCollapsed && tooltip) {
        // Ici, vous pourriez intégrer votre composant Tooltip de shadcn/ui
        // Pour la simplicité, je vais juste ajouter un title pour l'instant
        // mais l'idéal serait d'utiliser <Tooltip><TooltipTrigger>{buttonContent}</TooltipTrigger><TooltipContent>{tooltip}</TooltipContent></Tooltip>
        return React.cloneElement(buttonContent, { title: tooltip } as React.HTMLAttributes<HTMLElement>)
    }

    return buttonContent
})
SidebarMenuButton.displayName = "SidebarMenuButton"

// Optionnel: SidebarTrigger pour contrôler l'ouverture/fermeture depuis l'extérieur
const SidebarTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
    const { toggle } = useSidebar()
    return (
        <button ref={ref} onClick={toggle} className={cn(className)} {...props}>
            {children || "Toggle Sidebar"}
        </button>
    )
})
SidebarTrigger.displayName = "SidebarTrigger"


export {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarTrigger, // Exporté si vous voulez un bouton de déclenchement externe
    // SidebarProvider n'est pas exporté car Sidebar agit comme fournisseur
}