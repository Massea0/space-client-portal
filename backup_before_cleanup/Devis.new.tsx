// src/pages/Devis.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AnimatedModal } from '@/components/ui/animated-modal';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { notificationManager } from '@/components/ui/notification-provider';
import { devisApi } from '@/services/api';
import { Devis as DevisType } from '@/types';
import { 
  Download, XCircle, CheckCircle, FileText, Clock, AlertTriangle, 
  ShieldCheck
} from 'lucide-react';
import { downloadDevisPdf } from '@/lib/pdfGenerator';
import { useVisualEffect } from '@/components/ui/visual-effect';
import QuoteList from '@/components/quotes/QuoteList';

const DevisPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [devisList, setDevisList] = useState<DevisType[]>([]);
  const [filteredDevis, setFilteredDevis] = useState<DevisType[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [devisToReject, setDevisToReject] = useState<DevisType | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const { playEffect, EffectComponent } = useVisualEffect();

  const getStatusBadge = (status: DevisType['status']) => {
    const variants: { [key in DevisType['status']]: string } = {
      draft: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
      sent: 'bg-[#dbeafe] text-[#1e3a8a] dark:bg-[#3b82f6] dark:text-white',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100',
      approved: 'bg-[#bfdbfe] text-[#1e3a8a] dark:bg-[#3b82f6] dark:text-white',
      validated: 'bg-[#bfdbfe] text-[#1e3a8a] dark:bg-[#3b82f6] dark:text-white',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100',
      expired: 'bg-orange-100 text-orange-800 dark:bg-orange-600 dark:text-orange-100',
    };
    const labels: { [key in DevisType['status']]: string } = {
      draft: 'Brouillon',
      sent: 'Envoyé',
      pending: 'En attente',
      approved: 'Approuvé',
      validated: 'Validé',
      rejected: 'Rejeté',
      expired: 'Expiré',
    };
    const icons: { [key in DevisType['status']]: React.ElementType } = {
      draft: FileText,
      sent: Clock,
      pending: Clock,
      approved: CheckCircle,
      validated: ShieldCheck,
      rejected: XCircle,
      expired: AlertTriangle,
    };
    const Icon = icons[status] || FileText;

    return (
        <Badge className={cn(
          variants[status] || 'bg-slate-100',
          'flex items-center gap-1.5 transform transition-all hover:scale-105 hover:shadow-sm'
        )}>
          <Icon className="h-3.5 w-3.5" />
          {labels[status] || status}
        </Badge>
    );
  };

  const loadDevis = useCallback(async () => {
    setLoading(true);
    try {
      if (user?.role === 'client' && !user.companyId) {
        notificationManager.error('Erreur', { message: 'Information de compagnie manquante pour charger les devis.' });
        setDevisList([]);
        return;
      }
      const data = await devisApi.getByCompany(user?.companyId || '');
      const filteredData = data.filter(d => d.status !== 'draft');
      setDevisList(filteredData);
      filterDevis(searchTerm, statusFilter, filteredData);
    } catch (error) {
      notificationManager.error('Erreur', { message: 'Impossible de charger les devis.' });
    } finally {
      setLoading(false);
    }
  }, [user, searchTerm, statusFilter]);

  useEffect(() => {
    if (user) {
      loadDevis();
    }
  }, [user, loadDevis]);

  // Fonction pour filtrer les devis
  const filterDevis = (term: string, status: string, sourceData?: DevisType[]) => {
    const dataToFilter = sourceData || devisList;
    
    setFilteredDevis(dataToFilter.filter(devis => {
      const matchesSearch = !term || 
        devis.number.toLowerCase().includes(term.toLowerCase()) ||
        devis.object.toLowerCase().includes(term.toLowerCase()) ||
        (devis.companyName && devis.companyName.toLowerCase().includes(term.toLowerCase())) ||
        (devis.notes && devis.notes.toLowerCase().includes(term.toLowerCase()));
        
      const matchesStatus = status === 'all' || devis.status === status;
      
      return matchesSearch && matchesStatus;
    }));
  };

  const handleUpdateStatus = async (devisId: string, status: 'approved' | 'rejected', reason?: string) => {
    setActionLoading(`${devisId}-${status}`);
    try {
      const updatedDevis = await devisApi.updateStatusAsClient(devisId, status, reason);
      
      // Si c'est une approbation, jouer l'effet de confetti
      if (status === 'approved') {
        playEffect('confetti', { 
          spread: 180, 
          particleCount: 120,
          colors: ['#3B82F6', '#1E3A8A', '#38BDF8', '#BFDBFE'] 
        });
      }
      
      notificationManager.success('Succès', {
        message: `Le devis a été ${status === 'approved' ? 'approuvé' : 'rejeté'}.`,
      });
      
      // Mettre à jour la liste des devis
      const updatedList = devisList.map(d => (d.id === updatedDevis.id ? updatedDevis : d));
      setDevisList(updatedList);
      filterDevis(searchTerm, statusFilter, updatedList);
      
    } catch (error) {
      console.error(`Erreur lors de l'action '${status}' sur le devis:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Impossible de mettre à jour le statut du devis.';
      notificationManager.error('Erreur', { message: errorMessage });
    } finally {
      setActionLoading(null);
      setDevisToReject(null);
      setRejectionReason('');
    }
  };

  const handleDownloadPdf = async (devis: DevisType) => {
    setActionLoading(`pdf-${devis.id}`);
    try {
      await downloadDevisPdf(devis);
    } catch (error) {
      console.error("Error generating Devis PDF:", error);
      notificationManager.error('Erreur PDF', { message: 'Impossible de générer le PDF pour le devis.' });
    } finally {
      setActionLoading(null);
    }
  };

  // Fonction pour gérer la réponse au devis (approbation ou rejet)
  const handleRespond = (devis: DevisType, action: 'approve' | 'reject') => {
    if (action === 'approve') {
      handleUpdateStatus(devis.id, 'approved');
    } else {
      setDevisToReject(devis);
    }
  };

  if (loading && devisList.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arcadis-blue mx-auto"></div>
          <p className="mt-4 text-slate-600">Chargement des devis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1e3a8a]">Mes Devis</h1>
          <p className="text-slate-600 mt-1">Consultez et gérez vos devis</p>
        </div>
      </div>

      <QuoteList
        quotes={filteredDevis}
        isLoading={loading}
        isAdmin={false}
        onSearchChange={(term) => {
          setSearchTerm(term);
          filterDevis(term, statusFilter);
        }}
        onStatusFilterChange={(status) => {
          setStatusFilter(status);
          filterDevis(searchTerm, status);
        }}
        onViewDetails={() => {}} // Non disponible pour les clients
        onDownloadPdf={handleDownloadPdf}
        actionLoading={actionLoading}
        renderAdditionalActions={(devis) => (
          <>
            {devis.status === 'sent' && (
              <>
                <Button 
                  variant="default"
                  size="sm" 
                  onClick={() => handleRespond(devis, 'approve')}
                  disabled={actionLoading === devis.id}
                  className="flex items-center gap-1.5 bg-arcadis-green hover:bg-arcadis-green/90"
                >
                  <CheckCircle className="h-3.5 w-3.5" /> Approuver
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleRespond(devis, 'reject')}
                  disabled={actionLoading === devis.id}
                  className="flex items-center gap-1.5 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <XCircle className="h-3.5 w-3.5" /> Rejeter
                </Button>
              </>
            )}
          </>
        )}
      />

      {/* Modal de rejet de devis */}
      {devisToReject && (
        <AnimatedModal
          isOpen={!!devisToReject}
          onOpenChange={() => setDevisToReject(null)}
          title={`Rejeter le devis ${devisToReject.number}`}
          description="Veuillez préciser la raison du rejet de ce devis."
          footer={
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setDevisToReject(null)}
                disabled={actionLoading === `${devisToReject.id}-rejected`}
              >
                Annuler
              </Button>
              <Button 
                onClick={() => handleUpdateStatus(devisToReject.id, 'rejected', rejectionReason)}
                variant="destructive"
                disabled={actionLoading === `${devisToReject.id}-rejected`}
              >
                {actionLoading === `${devisToReject.id}-rejected` ? 'Traitement...' : 'Confirmer le rejet'}
              </Button>
            </div>
          }
        >
          <div className="py-4">
            <Label htmlFor="rejectionReason">Raison du rejet (optionnel)</Label>
            <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ex: Budget dépassé, changement de projet..."
                className="animated-input animated-input-glow"
            />
          </div>
        </AnimatedModal>
      )}
      
      {/* Composant pour afficher les effets visuels */}
      {EffectComponent}
    </div>
  );
};

export default DevisPage;
