// src/pages/Devis.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AnimatedModal } from '@/components/ui/animated-modal';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { notificationManager } from '@/components/ui/notification-provider';
import { devisApi } from '@/services/api';
import { Devis as DevisType } from '@/types';
import { 
  Download, XCircle, CheckCircle, FileText, Clock, AlertTriangle, 
  ShieldCheck, LayoutGrid, LayoutList, RefreshCw, Filter, Search
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { downloadDevisPdf } from '@/lib/pdfGenerator';
import { useVisualEffect } from '@/components/ui/visual-effect';
import QuoteList from '@/components/modules/quotes/QuoteList';
import InteractiveQuoteCard from '@/components/modules/quotes/InteractiveQuoteCard';
import QuoteListView from '@/components/modules/quotes/QuoteListView';
// Import du composant IA d'optimisation de devis
import QuoteOptimizationPanel from '@/components/ai/QuoteOptimizationPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InteractiveGrid } from '@/components/ui/interactive-grid';
import { connectionDiagnostic } from '@/lib/connectionDiagnostic';

// Type pour les modes d'affichage disponibles
type ViewMode = 'cards' | 'interactive' | 'list';

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
  const [viewMode, setViewMode] = useState<ViewMode>('interactive');
  const [animationReady, setAnimationReady] = useState(false);
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);
  
  const { playEffect, EffectComponent } = useVisualEffect();

  // Déclencher l'animation après le chargement initial avec un délai plus important
  useEffect(() => {
    if (!loading && devisList.length > 0) {
      // Délai plus important pour s'assurer que le DOM est complètement prêt
      // et que l'écran de chargement a disparu
      const timer = setTimeout(() => {
        setAnimationReady(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      // Réinitialiser l'état d'animation si les données sont en cours de chargement
      setAnimationReady(false);
    }
  }, [loading, devisList]);

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

  const handleViewDetails = (devis: DevisType) => {
    // Cette fonction sera implémentée dans une prochaine itération
    notificationManager.info('Information', { 
      message: 'La vue détaillée sera disponible prochainement.'
    });
  };

  // Fonction de rendu des cartes de devis pour le composant InteractiveGrid
  const renderDevisCard = React.useCallback((devis: DevisType) => {
    return (
      <InteractiveQuoteCard
        key={devis.id}
        quote={devis}
        isAdmin={false}
        actionLoading={actionLoading}
        onDownloadPdf={handleDownloadPdf}
        onViewDetails={handleViewDetails}
        onUpdateStatus={(id, status) => handleUpdateStatus(id, status as any)}
      />
    );
  }, [actionLoading, handleDownloadPdf, handleViewDetails, handleUpdateStatus]);

  // Ajouter cette nouvelle fonction pour exécuter le diagnostic
  const runConnectionDiagnostic = async () => {
    setDiagnosticRunning(true);
    try {
      // Exécuter le diagnostic
      const diagResult = await connectionDiagnostic.checkSupabaseConnection();
      
      // Essayer de corriger automatiquement
      const autoFixed = await connectionDiagnostic.attemptAutoFix();
      
      if (autoFixed) {
        notificationManager.success("Connexion rétablie", {
          message: "La connexion a été rétablie. Actualisation des données..."
        });
        loadDevis(); // Recharger les données
      } else {
        // Afficher le rapport de diagnostic
        let message = "Problèmes détectés:\n";
        if (!diagResult.connected) message += "• Impossible de se connecter à la base de données\n";
        if (!diagResult.authenticated) message += "• Session non authentifiée\n";
        if (!diagResult.userProfile) message += "• Profil utilisateur introuvable\n";
        if (!diagResult.companyId) message += "• Aucune entreprise associée à votre profil\n";
        
        notificationManager.warning("Diagnostic de connexion", { message });
        
        // Si l'utilisateur n'est pas authentifié, proposer une reconnexion
        if (!diagResult.authenticated) {
          setTimeout(() => {
            if (window.confirm('Voulez-vous vous reconnecter pour résoudre ce problème?')) {
              supabase.auth.signOut().then(() => {
                window.location.href = '/login';
              });
            }
          }, 1000);
        }
      }
    } catch (e) {
      notificationManager.error("Erreur", {
        message: "Impossible de terminer le diagnostic. Veuillez contacter le support."
      });
    } finally {
      setDiagnosticRunning(false);
    }
  };
  
  // Modifier la fonction renderContent pour inclure le bouton de diagnostic
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-500">Chargement des devis...</p>
        </div>
      );
    }

    if (!filteredDevis.length) {
      return (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
          <div className="rounded-full bg-gray-100 p-3 mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Aucun devis trouvé</h3>
          <p className="mt-1 text-sm text-gray-500">
            {statusFilter !== 'all' || searchTerm 
              ? "Essayez de modifier vos filtres ou votre recherche."
              : "Vous n'avez pas encore de devis dans le système."}
          </p>
          {user?.role === 'admin' && (
            <Button onClick={() => window.location.href = '/admin/nouveau-devis'} className="mt-4">
              Créer un devis
            </Button>
          )}
          <div className="mt-6 flex flex-col gap-2">
            <Button 
              variant="outline" 
              onClick={loadDevis} 
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
            
            <Button
              variant="ghost"
              onClick={runConnectionDiagnostic}
              disabled={diagnosticRunning}
              className="flex items-center gap-2 text-sm"
            >
              {diagnosticRunning ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-gray-500 rounded-full border-t-transparent"></div>
                  Diagnostic en cours...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  Diagnostiquer la connexion
                </>
              )}
            </Button>
          </div>
        </div>
      );
    }

    // Si nous avons des données, afficher selon le mode de vue
    switch (viewMode) {
      case 'interactive':
        return (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="w-full flex flex-1 items-center gap-2">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Rechercher un devis..." 
                    className="pl-8 w-full md:w-[300px]" 
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      filterDevis(e.target.value, statusFilter);
                    }}
                  />
                </div>
                <div className="w-[180px] hidden sm:block flex-shrink-0">
                  <Select value={statusFilter} onValueChange={(value) => {
                    setStatusFilter(value);
                    filterDevis(searchTerm, value);
                  }}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span>Statut</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="sent">Envoyés</SelectItem>
                      <SelectItem value="approved">Approuvés</SelectItem>
                      <SelectItem value="expired">Expirés</SelectItem>
                      <SelectItem value="rejected">Rejetés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <InteractiveGrid
              items={filteredDevis}
              loading={loading}
              keyExtractor={(devis) => devis.id}
              emptyState={
                <div className="col-span-full text-center py-12 border rounded-lg bg-muted/20">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Aucun devis trouvé</h3>
                  <p className="mt-2 text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' 
                      ? "Aucun devis ne correspond à vos critères de recherche."
                      : "Vous n'avez pas encore de devis."}
                  </p>
                </div>
              }
              loadingState={
                <div className="col-span-full flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <span className="ml-3 text-lg">Chargement des devis...</span>
                </div>
              }
              renderItem={renderDevisCard}
            />
          </div>
        );
      case 'cards':
        return (
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
            onViewDetails={handleViewDetails}
            onDownloadPdf={handleDownloadPdf}
            actionLoading={actionLoading}
            onUpdateStatus={(id, status, reason) => handleUpdateStatus(id, status as any, reason)}
          />
        );
      case 'list':
      default:
        return (
          <QuoteListView
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
            onViewDetails={handleViewDetails}
            onDownloadPdf={handleDownloadPdf}
            actionLoading={actionLoading}
            onUpdateStatus={(id, status, reason) => handleUpdateStatus(id, status as any, reason)}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1e3a8a]">Mes Devis</h1>
          <p className="text-slate-600 mt-1">Consultez et gérez vos devis</p>
        </div>
        
        <TooltipProvider>
          <div className="flex items-center bg-muted/40 rounded-lg p-1 border shadow-sm">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={viewMode === 'interactive' ? "secondary" : "ghost"} 
                  size="sm" 
                  onClick={() => setViewMode('interactive')} 
                  className="px-3"
                >
                  <LayoutGrid className="h-4 w-4 mr-1" />
                  <span className="sr-only sm:not-sr-only sm:inline-block">Cartes</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Vue en cartes interactives</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={viewMode === 'list' ? "secondary" : "ghost"} 
                  size="sm" 
                  onClick={() => setViewMode('list')} 
                  className="px-3"
                >
                  <LayoutList className="h-4 w-4 mr-1" />
                  <span className="sr-only sm:not-sr-only sm:inline-block">Tableau</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Vue en tableau</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={viewMode === 'cards' ? "secondary" : "ghost"} 
                  size="sm" 
                  onClick={() => setViewMode('cards')} 
                  className="px-3"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  <span className="sr-only sm:not-sr-only sm:inline-block">Standard</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Vue standard</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={loadDevis}
                  className="px-2 ml-1"
                  disabled={loading}
                >
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rafraîchir la liste</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={animationReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ 
            duration: 0.5, 
            ease: [0.22, 1, 0.36, 1],
            opacity: { duration: 0.4 },
            y: { type: "spring", stiffness: 100, damping: 15 }
          }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      {/* Modal de rejet de devis avec animation améliorée */}
      {devisToReject && (
        <AnimatedModal
          isOpen={!!devisToReject}
          onOpenChange={() => setDevisToReject(null)}
          title={`Rejeter le devis ${devisToReject.number}`}
          description="Veuillez préciser la raison du rejet de ce devis."
          animationType="zoom"
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
