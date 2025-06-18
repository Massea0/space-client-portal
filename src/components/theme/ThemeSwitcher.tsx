// src/components/theme/ThemeSwitcher.tsx
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface ThemeSwitcherProps {
    isCollapsed: boolean;
}

export function ThemeSwitcher({ isCollapsed }: ThemeSwitcherProps) {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        // Pour éviter les problèmes d'hydratation, ne rien rendre côté serveur
        // ou rendre un placeholder.
        // Un simple div avec la bonne hauteur peut suffire pour éviter le décalage de layout.
        return <div className={cn("flex items-center space-x-2 px-3 py-2", isCollapsed ? "justify-center" : "")} style={{ height: '40px' }} />;
    }

    const isDarkMode = theme === "dark"

    const toggleTheme = () => {
        setTheme(isDarkMode ? "light" : "dark")
    }

    if (isCollapsed) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="h-8 w-8 rounded-lg data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                        aria-label={isDarkMode ? "Passer au thème clair" : "Passer au thème sombre"}
                        data-active={true} // Pour un style cohérent avec les boutons de menu
                    >
                        {isDarkMode ? (
                            <Sun className="h-[1.2rem] w-[1.2rem]" />
                        ) : (
                            <Moon className="h-[1.2rem] w-[1.2rem]" />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={5}>
                    {isDarkMode ? "Thème Clair" : "Thème Sombre"}
                </TooltipContent>
            </Tooltip>
        )
    }

    return (
        <div className="flex items-center space-x-2 px-3 py-2">
            <Sun className={cn("h-5 w-5", !isDarkMode ? "text-arcadis-blue-primary" : "text-slate-500")} />
            <Switch
                id="theme-switcher"
                checked={isDarkMode}
                onCheckedChange={toggleTheme}
                aria-label="Changer de thème"
            />
            <Moon className={cn("h-5 w-5", isDarkMode ? "text-arcadis-blue-primary" : "text-slate-500")} />
            <Label htmlFor="theme-switcher" className="sr-only">
                Changer de thème
            </Label>
        </div>
    )
}