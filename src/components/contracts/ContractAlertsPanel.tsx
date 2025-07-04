// src/components/contracts/ContractAlertsPanel.tsx
import React from 'react';
import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import type { ContractAlert } from '@/types/contracts';

interface ContractAlertsPanelProps {
  alerts: ContractAlert[];
  onResolveAlert?: (alertId: string) => void;
  onDismissAlert?: (alertId: string) => void;
}

const ContractAlertsPanel: React.FC<ContractAlertsPanelProps> = ({
  alerts,
  onResolveAlert,
  onDismissAlert
}) => {
  const getAlertIcon = (type: ContractAlert['alert_type']) => {
    switch (type) {
      case 'contract_expiring_soon':
      case 'contract_expiring':
        return <Clock className="h-4 w-4" />;
      case 'renewal_due_soon':
      case 'renewal_overdue':
        return <AlertTriangle className="h-4 w-4" />;
      case 'low_compliance_score':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (severity: ContractAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getAlertLabel = (type: ContractAlert['alert_type']) => {
    switch (type) {
      case 'contract_expiring_soon': return 'Expiration proche';
      case 'contract_expiring': return 'Contrat expirant';
      case 'contract_expired': return 'Contrat expiré';
      case 'renewal_due_soon': return 'Renouvellement proche';
      case 'renewal_overdue': return 'Renouvellement en retard';
      case 'low_compliance_score': return 'Score de conformité faible';
      case 'obligations_at_risk': return 'Obligations à risque';
      case 'overdue_payments': return 'Paiements en retard';
      case 'manual_review_required': return 'Révision manuelle requise';
      default: return type;
    }
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Alertes contractuelles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
            <p className="text-sm text-muted-foreground">
              Aucune alerte active
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Alertes contractuelles ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start gap-3 p-3 border rounded">
            <div className="flex-shrink-0 mt-0.5">
              {getAlertIcon(alert.alert_type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getAlertLabel(alert.alert_type)}
                  </p>
                </div>
                <Badge variant={getAlertVariant(alert.severity)} className="text-xs">
                  {alert.severity}
                </Badge>
              </div>
              
              {alert.contracts?.title && (
                <p className="text-sm text-muted-foreground mt-2">
                  Contrat: {alert.contracts.title}
                </p>
              )}
              
              {alert.due_date && (
                <p className="text-xs text-muted-foreground mt-2">
                  Échéance: {formatDate(alert.due_date)}
                </p>
              )}
              
              {alert.status === 'active' && (
                <div className="flex gap-2 mt-3">
                  {onResolveAlert && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onResolveAlert(alert.id)}
                      className="text-xs"
                    >
                      Résoudre
                    </Button>
                  )}
                  {onDismissAlert && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDismissAlert(alert.id)}
                      className="text-xs"
                    >
                      Ignorer
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ContractAlertsPanel;