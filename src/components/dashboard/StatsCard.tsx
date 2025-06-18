// src/components/dashboard/StatsCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatsCardProps { // Exportation de l'interface pour clarté, bien que non strictement nécessaire si utilisée seulement ici
  title: string;
  value: string;
  description?: string;
  icon: React.ElementType<LucideProps>;
  onClick?: () => void; // La prop onClick est bien définie ici et optionnelle
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, description, icon: Icon, onClick, className }) => {
  return (
      <Card
          className={cn(
              "hover:shadow-lg transition-shadow duration-200",
              onClick ? "cursor-pointer" : "", // Ajoute cursor-pointer si onClick est fourni
              className
          )}
          onClick={onClick} // onClick est passé ici au composant Card
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
          <Icon className="h-5 w-5 text-arcadis-blue-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          {description && <p className="text-xs text-slate-500 pt-1">{description}</p>}
        </CardContent>
      </Card>
  );
};

export default StatsCard;