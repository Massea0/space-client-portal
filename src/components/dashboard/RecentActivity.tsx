// src/components/dashboard/RecentActivity.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Devis, Invoice, Ticket, User } from '@/types'; // User importé pour le type de rôle
import { FileText, CreditCard, MessageSquare, AlertTriangle, CheckCircle, Clock, Send, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'devis' | 'invoice' | 'ticket';
  title: string;
  description: string;
  date: Date;
  status: Devis['status'] | Invoice['status'] | Ticket['status'];
}

interface RecentActivityProps {
  activities: Activity[];
  userRole?: User['role']; // MODIFIÉ ICI: Ajout de userRole
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities, userRole }) => { // userRole ajouté aux props
  const navigate = useNavigate();

  const getIcon = (type: Activity['type']) => {
    if (type === 'devis') return <FileText className="h-5 w-5 text-primary" />;
    if (type === 'invoice') return <CreditCard className="h-5 w-5 text-green-600 dark:text-green-500" />;
    if (type === 'ticket') return <MessageSquare className="h-5 w-5 text-orange-600 dark:text-orange-500" />;
    return null;
  };

  const getStatusBadge = (status: Activity['status'], type: Activity['type']) => {
    let variantClass: string = 'bg-muted text-muted-foreground';
    let label: string = status.toString();
    let IconComponent: React.ElementType | null = null;

    const statusColors: { [key: string]: string } = { // Clé générique pour couvrir tous les statuts
      approved: 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400',
      pending: 'bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
      rejected: 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400',
      sent: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
      draft: 'bg-slate-500/10 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400',
      expired: 'bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
      paid: 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400',
      overdue: 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400',
      cancelled: 'bg-slate-500/10 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 line-through',
      open: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
      in_progress: 'bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
      resolved: 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400',
      closed: 'bg-slate-500/10 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400',
      pending_admin_response: 'bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
      pending_client_response: 'bg-pink-500/10 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400',
    };

    label = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
    variantClass = statusColors[status as string] || variantClass; // Cast status as string for indexing

    if (type === 'devis') {
      const devisStatus = status as Devis['status'];
      switch (devisStatus) {
        case 'approved': IconComponent = CheckCircle; break;
        case 'pending': IconComponent = Clock; break;
        case 'rejected': IconComponent = XCircle; break;
        case 'sent': IconComponent = Send; break;
        case 'draft': IconComponent = FileText; break;
        case 'expired': IconComponent = AlertTriangle; break;
        default: IconComponent = FileText;
      }
    } else if (type === 'invoice') {
      const invoiceStatus = status as Invoice['status'];
      switch (invoiceStatus) {
        case 'paid': IconComponent = CheckCircle; break;
        case 'pending': IconComponent = Clock; break;
        case 'overdue': IconComponent = AlertTriangle; break;
        case 'draft': IconComponent = FileText; break;
        case 'cancelled': IconComponent = XCircle; break;
        default: IconComponent = CreditCard;
      }
    } else if (type === 'ticket') {
      const ticketStatus = status as Ticket['status'];
      switch (ticketStatus) {
        case 'open': IconComponent = MessageSquare; break;
        case 'in_progress': IconComponent = Clock; break;
        case 'resolved': IconComponent = CheckCircle; break;
        case 'closed': IconComponent = MessageSquare; break;
        case 'pending_admin_response': IconComponent = Clock; break;
        case 'pending_client_response': IconComponent = Clock; break;
        default: IconComponent = MessageSquare;
      }
    }
    return (
        <Badge className={cn(variantClass, "text-xs font-medium flex items-center gap-1")}>
          {IconComponent && <IconComponent className="h-3 w-3" />}
          {label}
        </Badge>
    );
  };

  // MODIFIÉ ICI: Logique de navigation basée sur userRole
  const handleActivityClick = (activity: Activity) => {
    if (userRole === 'admin') {
      if (activity.type === 'devis') navigate(`/admin/devis`);
      else if (activity.type === 'invoice') navigate(`/admin/factures`);
      else if (activity.type === 'ticket') navigate(`/admin/support`);
    } else { // Pour les clients ou si userRole n'est pas défini (fallback)
      if (activity.type === 'devis') navigate(`/devis`);
      else if (activity.type === 'invoice') navigate(`/factures`);
      else if (activity.type === 'ticket') navigate(`/support`);
    }
  };

  return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-card-foreground">Activité Récente</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune activité récente à afficher.</p>
          ) : (
              <ul className="space-y-3">
                {activities.map((activity) => (
                    <li
                        key={`${activity.type}-${activity.id}`}
                        onClick={() => handleActivityClick(activity)}
                        className="flex items-start space-x-4 p-3 hover:bg-muted/50 dark:hover:bg-muted/30 rounded-lg transition-colors duration-150 cursor-pointer border-b border-border/60 dark:border-border/40 last:border-b-0"
                    >
                      <div className="flex-shrink-0 pt-1 text-muted-foreground">
                        {getIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <p className="text-sm font-semibold text-foreground truncate" title={activity.title}>
                            {activity.title}
                          </p>
                          {getStatusBadge(activity.status, activity.type)}
                        </div>
                        <p className="text-xs text-muted-foreground truncate" title={activity.description}>
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground/80 mt-1">{formatDate(activity.date)}</p>
                      </div>
                    </li>
                ))}
              </ul>
          )}
        </CardContent>
      </Card>
  );
};

export default RecentActivity;