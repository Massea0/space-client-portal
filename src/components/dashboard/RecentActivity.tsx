
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'devis' | 'invoice' | 'ticket';
  title: string;
  description: string;
  date: Date;
  status: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getStatusColor = (type: string, status: string) => {
    if (type === 'devis') {
      switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'approved': return 'bg-green-100 text-green-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-slate-100 text-slate-800';
      }
    }
    if (type === 'invoice') {
      switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'paid': return 'bg-green-100 text-green-800';
        case 'overdue': return 'bg-red-100 text-red-800';
        default: return 'bg-slate-100 text-slate-800';
      }
    }
    if (type === 'ticket') {
      switch (status) {
        case 'open': return 'bg-blue-100 text-blue-800';
        case 'in_progress': return 'bg-yellow-100 text-yellow-800';
        case 'resolved': return 'bg-green-100 text-green-800';
        default: return 'bg-slate-100 text-slate-800';
      }
    }
    return 'bg-slate-100 text-slate-800';
  };

  const getStatusLabel = (type: string, status: string) => {
    if (type === 'devis') {
      switch (status) {
        case 'pending': return 'En attente';
        case 'approved': return 'Approuvé';
        case 'rejected': return 'Rejeté';
        default: return status;
      }
    }
    if (type === 'invoice') {
      switch (status) {
        case 'pending': return 'En attente';
        case 'paid': return 'Payée';
        case 'overdue': return 'En retard';
        default: return status;
      }
    }
    if (type === 'ticket') {
      switch (status) {
        case 'open': return 'Ouvert';
        case 'in_progress': return 'En cours';
        case 'resolved': return 'Résolu';
        default: return status;
      }
    }
    return status;
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          Activité Récente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-slate-500 text-center py-4">
              Aucune activité récente
            </p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-slate-900 truncate">
                      {activity.title}
                    </h4>
                    <Badge 
                      variant="secondary" 
                      className={getStatusColor(activity.type, activity.status)}
                    >
                      {getStatusLabel(activity.type, activity.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDate(activity.date)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
