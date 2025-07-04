// src/components/ui/hover-card-example.tsx
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface HoverCardExampleProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Carte avec effet de hover
 * Exemple d'utilisation des classes CSS d'animation
 */
export const HoverCardExample = ({
  title,
  description,
  icon,
  footer,
  className,
  ...props
}: HoverCardExampleProps) => {
  return (
    <Card 
      className={cn(
        'animated-card border-muted/40 h-full',
        className
      )} 
      {...props}
    >
      <CardHeader className="transition-all">
        {icon && <div className="mb-2 text-primary">{icon}</div>}
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {props.children}
      </CardContent>
      {footer && (
        <CardFooter className="border-t pt-4 mt-auto">{footer}</CardFooter>
      )}
    </Card>
  );
};

export default HoverCardExample;
