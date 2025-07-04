import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: "default" | "bordered" | "pills"
    size?: "sm" | "md" | "lg"
  }
>(({ className, variant = "bordered", size = "md", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center text-muted-foreground",
      variant === "default" && "border-b",
      variant === "bordered" && "rounded-md border bg-muted p-1",
      variant === "pills" && "gap-1",
      size === "sm" && "h-8 text-xs",
      size === "md" && "h-10 text-sm",
      size === "lg" && "h-12 text-base",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: "default" | "bordered" | "pills"
    size?: "sm" | "md" | "lg"
  }
>(({ className, variant = "bordered", size = "md", ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      variant === "default" && "relative px-4 py-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground hover:text-foreground",
      variant === "bordered" && "rounded-sm px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      variant === "pills" && "rounded-md px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted",
      size === "sm" && "px-2 py-1 text-xs",
      size === "md" && "px-4 py-2 text-sm",
      size === "lg" && "px-6 py-3 text-base",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

// Composant Tabs avec configuration automatique des variants
interface TabsContainerProps {
  tabs: Array<{
    value: string
    label: string
    content: React.ReactNode
    disabled?: boolean
    badge?: number | string
  }>
  defaultValue?: string
  variant?: "default" | "bordered" | "pills"
  size?: "sm" | "md" | "lg"
  className?: string
  onValueChange?: (value: string) => void
  orientation?: "horizontal" | "vertical"
}

const TabsContainer: React.FC<TabsContainerProps> = ({
  tabs,
  defaultValue,
  variant = "bordered",
  size = "md",
  className,
  onValueChange,
  orientation = "horizontal"
}) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue || tabs[0]?.value)

  const handleValueChange = (value: string) => {
    setActiveTab(value)
    onValueChange?.(value)
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleValueChange}
      orientation={orientation}
      className={cn(
        orientation === "vertical" && "flex gap-4",
        className
      )}
    >
      <TabsList 
        variant={variant} 
        size={size}
        className={cn(
          orientation === "vertical" && "flex-col h-auto w-auto"
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            variant={variant}
            size={size}
            disabled={tab.disabled}
            className={cn(
              orientation === "vertical" && "w-full justify-start"
            )}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                {tab.badge}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      
      <div className={cn(
        orientation === "vertical" && "flex-1"
      )}>
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}

// Composant Tab Card pour affichage type Twenty
interface TabCardProps {
  title: string
  description?: string
  children?: React.ReactNode
  tabs: Array<{
    value: string
    label: string
    content: React.ReactNode
    badge?: number | string
  }>
  defaultValue?: string
  variant?: "default" | "bordered" | "pills"
  className?: string
}

const TabCard: React.FC<TabCardProps> = ({
  title,
  description,
  children,
  tabs,
  defaultValue,
  variant = "bordered",
  className
}) => (
  <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
    <div className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      
      <TabsContainer
        tabs={tabs}
        defaultValue={defaultValue}
        variant={variant}
      />
      
      {children}
    </div>
  </div>
)

export { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent, 
  TabsContainer, 
  TabCard,
  type TabsContainerProps,
  type TabCardProps
}
