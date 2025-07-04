// src/components/ui/sidebar.tsx
import * as React from "react"
import { createContext, useContext, useCallback, useEffect, useState } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { cva, type VariantProps } from "class-variance-authority"
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Settings,
  Home,
  User,
  FileText,
  Search,
  Bell
} from "lucide-react"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

// --- Types et constantes ---
interface SidebarItem {
  id: string
  title: string
  icon?: React.ComponentType<{ className?: string }>
  href?: string
  onClick?: () => void
  badge?: string | number
  isActive?: boolean
  children?: SidebarItem[]
  isExpanded?: boolean
}

type SidebarVariant = "default" | "compact" | "floating"
type SidebarPosition = "left" | "right"

// --- Context pour l'état de la Sidebar ---
interface SidebarContextProps {
  state: "expanded" | "collapsed"
  variant: SidebarVariant
  position: SidebarPosition
  isMobile: boolean
  isOverlayOpen: boolean
  width: number
  minWidth: number
  maxWidth: number
  items: SidebarItem[]
  searchQuery: string
  filteredItems: SidebarItem[]
  expandedItems: Set<string>
  toggle: () => void
  expand: () => void
  collapse: () => void
  openOverlay: () => void
  closeOverlay: () => void
  setWidth: (width: number) => void
  setItems: (items: SidebarItem[]) => void
  setSearchQuery: (query: string) => void
  toggleItemExpansion: (itemId: string) => void
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a Sidebar component")
  }
  return context
}

// --- Composant SidebarProvider ---
interface SidebarProviderProps {
  children: React.ReactNode
  isCollapsed?: boolean
  setIsCollapsed?: (collapsed: boolean) => void
  variant?: SidebarVariant
  position?: SidebarPosition
  items?: SidebarItem[]
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  collapsible?: boolean
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({
  children,
  isCollapsed: controlledCollapsed,
  setIsCollapsed: setControlledCollapsed,
  variant = "default",
  position = "left",
  items = [],
  defaultWidth = 280,
  minWidth = 200,
  maxWidth = 400,
  collapsible = true,
}) => {
  const isMobile = useIsMobile()
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [width, setWidth] = useState(defaultWidth)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>(items)

  const isControlled = controlledCollapsed !== undefined
  const isCollapsed = isControlled ? controlledCollapsed : internalCollapsed
  const state = isMobile ? "collapsed" : (isCollapsed ? "collapsed" : "expanded")

  const filteredItems = useFilteredItems(sidebarItems, searchQuery)

  const toggle = useCallback(() => {
    if (!collapsible) return
    
    if (isMobile) {
      setIsOverlayOpen(prev => !prev)
    } else {
      const newValue = !isCollapsed
      if (isControlled && setControlledCollapsed) {
        setControlledCollapsed(newValue)
      } else {
        setInternalCollapsed(newValue)
      }
    }
  }, [collapsible, isCollapsed, isControlled, setControlledCollapsed, isMobile])

  const expand = useCallback(() => {
    if (!collapsible || !isCollapsed) return
    
    if (isMobile) {
      setIsOverlayOpen(true)
    } else {
      if (isControlled && setControlledCollapsed) {
        setControlledCollapsed(false)
      } else {
        setInternalCollapsed(false)
      }
    }
  }, [collapsible, isCollapsed, isControlled, setControlledCollapsed, isMobile])

  const collapse = useCallback(() => {
    if (!collapsible || isCollapsed) return
    
    if (isMobile) {
      setIsOverlayOpen(false)
    } else {
      if (isControlled && setControlledCollapsed) {
        setControlledCollapsed(true)
      } else {
        setInternalCollapsed(true)
      }
    }
  }, [collapsible, isCollapsed, isControlled, setControlledCollapsed, isMobile])

  const openOverlay = useCallback(() => setIsOverlayOpen(true), [])
  const closeOverlay = useCallback(() => setIsOverlayOpen(false), [])

  const toggleItemExpansion = useCallback((itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }, [])

  // Synchroniser les items internes avec les props
  useEffect(() => {
    // Vérifier si les items ont réellement changé pour éviter les re-renders en boucle
    if (JSON.stringify(items) !== JSON.stringify(sidebarItems)) {
      setSidebarItems(items)
    }
  }, [items, sidebarItems])

  // Valeur du contexte
  const contextValue: SidebarContextProps = React.useMemo(() => ({
    state,
    variant,
    position,
    isMobile,
    isOverlayOpen,
    width,
    minWidth,
    maxWidth,
    items: sidebarItems,
    searchQuery,
    filteredItems,
    expandedItems,
    toggle,
    expand,
    collapse,
    openOverlay,
    closeOverlay,
    setWidth,
    setItems: setSidebarItems,
    setSearchQuery,
    toggleItemExpansion,
  }), [
    state, variant, position, isMobile, isOverlayOpen, width,
    minWidth, maxWidth, sidebarItems, searchQuery, filteredItems,
    expandedItems, toggle, expand, collapse, openOverlay, closeOverlay
  ])

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  )
}

// --- Variants du Sidebar ---
const sidebarVariants = cva(
  "relative flex flex-col bg-background border-r border-border transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-card",
        compact: "bg-muted/50",
        floating: "bg-card shadow-lg rounded-lg m-2 border",
      },
      state: {
        expanded: "",
        collapsed: "",
      },
      position: {
        left: "",
        right: "border-r-0 border-l",
      },
    },
    defaultVariants: {
      variant: "default",
      state: "expanded",
      position: "left",
    },
  }
)

// --- Hook pour filtrer les items ---
function useFilteredItems(items: SidebarItem[], searchQuery: string): SidebarItem[] {
  return React.useMemo(() => {
    if (!searchQuery.trim()) return items

    const filterItems = (items: SidebarItem[]): SidebarItem[] => {
      return items.reduce((acc, item) => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
        const filteredChildren = item.children ? filterItems(item.children) : []
        
        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            ...item,
            children: filteredChildren.length > 0 ? filteredChildren : item.children,
            isExpanded: filteredChildren.length > 0 ? true : item.isExpanded,
          })
        }
        
        return acc
      }, [] as SidebarItem[])
    }

    return filterItems(items)
  }, [items, searchQuery])
}

// --- Composant Sidebar principal ---
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean
  setIsCollapsed?: (collapsed: boolean) => void
  variant?: SidebarVariant
  position?: SidebarPosition
  collapsible?: boolean
  resizable?: boolean
  searchable?: boolean
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  items?: SidebarItem[]
  onItemClick?: (item: SidebarItem) => void
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({
    className,
    children,
    isCollapsed: controlledCollapsed,
    setIsCollapsed: setControlledCollapsed,
    variant = "default",
    position = "left",
    collapsible = true,
    resizable = false,
    searchable = false,
    defaultWidth = 280,
    minWidth = 200,
    maxWidth = 400,
    items = [],
    onItemClick,
    ...props
  }, ref) => {
    const isMobile = useIsMobile()
    const [internalCollapsed, setInternalCollapsed] = useState(false)
    const [isOverlayOpen, setIsOverlayOpen] = useState(false)
    const [width, setWidth] = useState(defaultWidth)
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
    const [searchQuery, setSearchQuery] = useState("")
    const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>(items)

    const isControlled = controlledCollapsed !== undefined
    const isCollapsed = isControlled ? controlledCollapsed : internalCollapsed
    const state = isMobile ? "collapsed" : (isCollapsed ? "collapsed" : "expanded")

    const filteredItems = useFilteredItems(sidebarItems, searchQuery)

    const toggle = useCallback(() => {
      if (!collapsible) return
      
      if (isMobile) {
        setIsOverlayOpen(prev => !prev)
      } else {
        const newValue = !isCollapsed
        if (isControlled && setControlledCollapsed) {
          setControlledCollapsed(newValue)
        } else {
          setInternalCollapsed(newValue)
        }
      }
    }, [collapsible, isCollapsed, isControlled, setControlledCollapsed, isMobile])

    const expand = useCallback(() => {
      if (!collapsible || !isCollapsed) return
      
      if (isMobile) {
        setIsOverlayOpen(true)
      } else {
        if (isControlled && setControlledCollapsed) {
          setControlledCollapsed(false)
        } else {
          setInternalCollapsed(false)
        }
      }
    }, [collapsible, isCollapsed, isControlled, setControlledCollapsed, isMobile])

    const collapse = useCallback(() => {
      if (!collapsible || isCollapsed) return
      
      if (isMobile) {
        setIsOverlayOpen(false)
      } else {
        if (isControlled && setControlledCollapsed) {
          setControlledCollapsed(true)
        } else {
          setInternalCollapsed(true)
        }
      }
    }, [collapsible, isCollapsed, isControlled, setControlledCollapsed, isMobile])

    const openOverlay = useCallback(() => setIsOverlayOpen(true), [])
    const closeOverlay = useCallback(() => setIsOverlayOpen(false), [])

    const toggleItemExpansion = useCallback((itemId: string) => {
      setExpandedItems(prev => {
        const next = new Set(prev)
        if (next.has(itemId)) {
          next.delete(itemId)
        } else {
          next.add(itemId)
        }
        return next
      })
    }, [])

    const handleResize = useCallback((e: React.MouseEvent) => {
      if (!resizable || isCollapsed) return

      const startX = e.clientX
      const startWidth = width

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = position === "left" ? e.clientX - startX : startX - e.clientX
        const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX))
        setWidth(newWidth)
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }, [resizable, isCollapsed, width, minWidth, maxWidth, position])

    // Synchroniser les items internes avec les props
    useEffect(() => {
      // Vérifier si les items ont réellement changé pour éviter les re-renders en boucle
      if (JSON.stringify(items) !== JSON.stringify(sidebarItems)) {
        setSidebarItems(items)
      }
    }, [items, sidebarItems])

    // Fermer l'overlay sur mobile lors d'un clic sur un item
    const handleItemClick = useCallback((item: SidebarItem) => {
      if (isMobile) {
        setIsOverlayOpen(false)
      }
      onItemClick?.(item)
    }, [isMobile, onItemClick])

    const contextValue: SidebarContextProps = React.useMemo(() => ({
      state,
      variant,
      position,
      isMobile,
      isOverlayOpen,
      width,
      minWidth,
      maxWidth,
      items: sidebarItems,
      searchQuery,
      filteredItems,
      expandedItems,
      toggle,
      expand,
      collapse,
      openOverlay,
      closeOverlay,
      setWidth,
      setItems: setSidebarItems,
      setSearchQuery,
      toggleItemExpansion,
    }), [
      state, variant, position, isMobile, isOverlayOpen, width, 
      minWidth, maxWidth, sidebarItems, searchQuery, filteredItems, 
      expandedItems, toggle, expand, collapse, openOverlay, closeOverlay
    ])

    // Sidebar principal (desktop)
    const sidebarContent = (
      <div
        ref={ref}
        className={cn(
          sidebarVariants({ variant, state, position }),
          variant === "floating" && "absolute z-50",
          className
        )}
        style={{
          width: isMobile ? "100%" : isCollapsed ? "60px" : `${width}px`,
          height: variant === "floating" ? "calc(100vh - 1rem)" : "100vh",
        }}
        data-state={state}
        data-variant={variant}
        data-position={position}
        {...props}
      >
        {children}
        
        {/* Resize Handle */}
        {resizable && !isCollapsed && !isMobile && (
          <div
            className={cn(
              "absolute top-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-border transition-colors",
              position === "left" ? "right-0" : "left-0"
            )}
            onMouseDown={handleResize}
          />
        )}
      </div>
    )

    // Overlay pour mobile
    const mobileOverlay = isMobile && isOverlayOpen && (
      <>
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeOverlay}
        />
        <div
          className={cn(
            "fixed top-0 z-50 h-full w-80 bg-card border-r transition-transform duration-300",
            position === "left" ? "left-0" : "right-0",
            isOverlayOpen ? "translate-x-0" : position === "left" ? "-translate-x-full" : "translate-x-full"
          )}
        >
          {children}
        </div>
      </>
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        {isMobile ? mobileOverlay : sidebarContent}
      </SidebarContext.Provider>
    )
  }
)
Sidebar.displayName = "Sidebar"

// --- Composant SidebarHeader ---
const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { showToggle?: boolean }
>(({ className, children, showToggle = true, ...props }, ref) => {
  const context = useContext(SidebarContext)
  const state = context?.state || "expanded"
  const toggle = context?.toggle || (() => {})
  const isMobile = context?.isMobile || false
  const variant = context?.variant || "default"
  const isCollapsed = state === "collapsed"

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between p-4 border-b bg-card/50",
        variant === "compact" && "p-2",
        className
      )}
      {...props}
    >
      <div className={cn("flex items-center gap-2", isCollapsed && !isMobile && "justify-center")}>
        {!isCollapsed || isMobile ? children : null}
      </div>
      
      {showToggle && (
        <Button
          variant="ghost"
          size="sm"
          onClick={toggle}
          className={cn(
            "h-8 w-8 p-0",
            isCollapsed && !isMobile && "mx-auto"
          )}
        >
          {isMobile ? (
            <X className="h-4 w-4" />
          ) : isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  )
})
SidebarHeader.displayName = "SidebarHeader"

// --- Composant SidebarContent ---
const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto overflow-x-hidden p-2", className)}
    {...props}
  />
))
SidebarContent.displayName = "SidebarContent"

// --- Composant SidebarSearch ---
const SidebarSearch = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { placeholder?: string }
>(({ className, placeholder = "Rechercher...", ...props }, ref) => {
  const context = useContext(SidebarContext)
  const searchQuery = context?.searchQuery || ""
  const setSearchQuery = context?.setSearchQuery || (() => {})
  const state = context?.state || "expanded"
  const isCollapsed = state === "collapsed"

  if (isCollapsed) return null

  return (
    <div ref={ref} className={cn("p-2", className)} {...props}>
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 h-8"
        />
      </div>
    </div>
  )
})
SidebarSearch.displayName = "SidebarSearch"

// --- Composant SidebarGroup ---
const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { title?: string, collapsible?: boolean }
>(({ className, title, collapsible = false, children, ...props }, ref) => {
  const context = useContext(SidebarContext)
  const state = context?.state || "expanded"
  const [isExpanded, setIsExpanded] = useState(true)
  const isCollapsed = state === "collapsed"

  return (
    <div ref={ref} className={cn("mb-2", className)} {...props}>
      {title && !isCollapsed && (
        <div
          className={cn(
            "flex items-center justify-between px-2 py-1 mb-1",
            collapsible && "cursor-pointer hover:bg-muted/50 rounded"
          )}
          onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
        >
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </h4>
          {collapsible && (
            <ChevronDown
              className={cn(
                "h-3 w-3 text-muted-foreground transition-transform",
                !isExpanded && "-rotate-90"
              )}
            />
          )}
        </div>
      )}
      
      <div className={cn("space-y-1", collapsible && !isExpanded && "hidden")}>
        {children}
      </div>
    </div>
  )
})
SidebarGroup.displayName = "SidebarGroup"

// --- Composant SidebarMenu ---
const SidebarMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    items?: SidebarItem[],
    onItemClick?: (item: SidebarItem) => void 
  }
>(({ className, items, onItemClick, children, ...props }, ref) => {
  const context = useContext(SidebarContext)
  const filteredItems = context?.filteredItems || []
  const menuItems = items || filteredItems

  return (
    <div ref={ref} className={cn("space-y-1", className)} {...props}>
      {children || menuItems.map((item) => (
        <SidebarMenuItem 
          key={item.id} 
          item={{
            ...item,
            onClick: () => onItemClick ? onItemClick(item) : item.onClick?.()
          }} 
        />
      ))}
    </div>
  )
})
SidebarMenu.displayName = "SidebarMenu"

// --- Composant SidebarMenuItem ---
interface SidebarMenuItemProps {
  item: SidebarItem
  level?: number
}

const SidebarMenuItem = React.forwardRef<HTMLDivElement, SidebarMenuItemProps>(
  ({ item, level = 0 }, ref) => {
    const context = useContext(SidebarContext)
    const state = context?.state || "expanded"
    const expandedItems = context?.expandedItems || new Set()
    const toggleItemExpansion = context?.toggleItemExpansion || (() => {})
    const isCollapsed = state === "collapsed"
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.id) || item.isExpanded

    const handleClick = () => {
      if (hasChildren) {
        toggleItemExpansion(item.id)
      }
      item.onClick?.()
    }

    return (
      <div ref={ref}>
        <SidebarMenuButton
          item={item}
          level={level}
          isActive={item.isActive}
          hasChildren={hasChildren}
          isExpanded={isExpanded}
          onClick={handleClick}
        />
        
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children!.map((child) => (
              <SidebarMenuItem
                key={child.id}
                item={child}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }
)
SidebarMenuItem.displayName = "SidebarMenuItem"

// --- Composant SidebarMenuButton ---
interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  item: SidebarItem
  level?: number
  isActive?: boolean
  hasChildren?: boolean
  isExpanded?: boolean
  asChild?: boolean
}

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({
    className,
    item,
    level = 0,
    isActive,
    hasChildren,
    isExpanded,
    asChild = false,
    ...props
  }, ref) => {
    const context = useContext(SidebarContext)
    const state = context?.state || "expanded"
    const variant = context?.variant || "default"
    const isCollapsed = state === "collapsed"
    const Comp = asChild ? Slot : "button"
    const IconComponent = item.icon

    const buttonContent = (
      <Comp
        ref={ref}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-all",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          isActive && "bg-accent text-accent-foreground",
          isCollapsed && "justify-center px-1",
          variant === "compact" && "py-1 text-xs",
          level > 0 && `ml-${level * 4}`,
          className
        )}
        {...props}
      >
        {IconComponent && (
          <IconComponent className={cn("h-4 w-4 shrink-0", isCollapsed && "h-5 w-5")} />
        )}
        
        {!isCollapsed && (
          <>
            <span className="truncate">{item.title}</span>
            
            <div className="ml-auto flex items-center gap-1">
              {item.badge && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {item.badge}
                </Badge>
              )}
              
              {hasChildren && (
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform",
                    !isExpanded && "-rotate-90"
                  )}
                />
              )}
            </div>
          </>
        )}
      </Comp>
    )

    if (isCollapsed && item.title) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {item.title}
              {item.badge && <Badge className="ml-2">{item.badge}</Badge>}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return buttonContent
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

// --- Composant SidebarFooter ---
const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-4 border-t bg-card/50", className)}
    {...props}
  />
))
SidebarFooter.displayName = "SidebarFooter"

// --- Composant SidebarTrigger ---
const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  // Utilisation sécurisée du contexte pour éviter les erreurs lorsqu'utilisé en dehors du provider
  const context = useContext(SidebarContext)
  const toggle = context?.toggle || (() => {})
  const isMobile = context?.isMobile || false
  const isOverlayOpen = context?.isOverlayOpen || false
  
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="sm"
      onClick={toggle}
      className={cn("h-8 w-8 p-0", className)}
      {...props}
    >
      {children || (
        isMobile && isOverlayOpen ? (
          <X className="h-4 w-4" />
        ) : (
          <Menu className="h-4 w-4" />
        )
      )}
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarSearch,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  type SidebarItem,
  type SidebarVariant,
  type SidebarPosition,
}