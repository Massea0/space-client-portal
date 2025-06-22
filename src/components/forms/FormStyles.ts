// /Users/a00/myspace/src/components/forms/FormStyles.ts
import {cn} from "@/lib/utils";

export const formStyles = {
    wrapper: "max-w-4xl mx-auto space-y-8 p-6",
    card: "relative overflow-hidden transition-all",
    cardHeader: cn(
        "flex flex-col space-y-1.5 p-6",
        "bg-gradient-to-r from-primary/10 via-background to-background",
        "dark:from-primary/5 dark:via-background dark:to-background"
    ),
    cardTitle: "text-2xl font-semibold leading-none tracking-tight",
    cardDescription: "text-sm text-muted-foreground",
    cardContent: "p-6 pt-4",
    section: "space-y-4",
    grid: "grid gap-4 md:grid-cols-2",
    inputGroup: "space-y-2",
    // MODIFIÉ: Utilisation de text-foreground pour une meilleure compatibilité thème
    label: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground",
    item: cn(
        "relative p-6 border rounded-lg transition-all",
        "bg-card/50 dark:bg-muted/20",
        "hover:shadow-md hover:bg-card/80 dark:hover:bg-muted/30"
    ),
    itemHeader: "mb-4 flex items-center justify-between",
    itemTitle: "text-sm font-medium",
    deleteButton: cn(
        "absolute top-2 right-2",
        "h-7 w-7 rounded-full",
        "opacity-70 hover:opacity-100 hover:bg-destructive/10"
    ),
    addButton: cn(
        "flex items-center gap-2",
        "text-sm text-primary hover:text-primary/80"
    ),
    buttonsWrapper: "flex justify-end gap-3 pt-6",
    totalsSection: cn(
        "mt-6 p-4 rounded-lg",
        "bg-muted/50 dark:bg-muted/30",
        "border border-border/50"
    ),
};