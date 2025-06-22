// /Users/a00/myspace/src/components/forms/SharedFormComponents.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formStyles as styles } from './FormStyles';
import { Button } from '@/components/ui/button';
import { X, PlusCircle } from 'lucide-react';

export const FormCard: React.FC<{
    title: string;
    description?: string;
    children: React.ReactNode;
}> = ({ title, description, children }) => (
    <Card className={styles.card}>
        <CardHeader className={styles.cardHeader}>
            <CardTitle className={styles.cardTitle}>{title}</CardTitle>
            {description && (
                <CardDescription className={styles.cardDescription}>
                    {description}
                </CardDescription>
            )}
        </CardHeader>
        <CardContent className={styles.cardContent}>
            {children}
        </CardContent>
    </Card>
);

export const FormSection = ({ children }: { children: React.ReactNode }) => (
    <div className={styles.section}>{children}</div>
);

export const DeleteItemButton = ({ onClick }: { onClick: () => void }) => (
    <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClick}
        className={styles.deleteButton}
    >
        <X className="h-4 w-4" />
    </Button>
);

export const AddItemButton = ({ onClick }: { onClick: () => void }) => (
    <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClick}
        className={styles.addButton}
    >
        <PlusCircle className="h-4 w-4" />
        Ajouter un article
    </Button>
);