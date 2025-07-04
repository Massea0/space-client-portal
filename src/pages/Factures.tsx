// src/pages/Factures.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, LayoutGrid, LayoutList, RefreshCw, Filter, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
// Remplacement du toast de Sonner par notre notification manager
import { notificationManager } from '@/components/ui/notification-provider';
import { invoicesApi } from '@/services/api';
import { Invoice as InvoiceType } from '@/types';
import { downloadInvoicePdf } from '@/lib/pdfGenerator';
// Import du modal de paiement Dexchange
import WavePaymentModal from '@/components/payments/WavePaymentModal';
// Import des composants de facture
import InvoiceList from '@/components/modules/invoices/InvoiceList';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { InteractiveGrid } from '@/components/ui/interactive-grid';
import InteractiveInvoiceCard from '@/components/modules/invoices/InteractiveInvoiceCard';
import InvoiceListView from '@/components/modules/invoices/InvoiceListView';
import { connectionDiagnostic } from '@/lib/connectionDiagnostic';
import { ConnectionTroubleshooter } from '@/components/diagnostics/ConnectionTroubleshooter';

// Type pour les modes d'affichage disponibles
type ViewMode = 'cards' | 'interactive' | 'list';

const FacturesPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [invoiceList, setInvoiceList] = useState<InvoiceType[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [invoiceToPay, setInvoiceToPay] = useState<InvoiceType | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('interactive');
  const [animationReady, setAnimationReady] = useState(false);
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);

  // Fonction pour charger les factures de l'utilisateur
  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      if (user?.role === 'client' && !user.companyId) {
        notificationManager.error('Erreur', { message: 'Information de compagnie manquante pour charger les factures.' });
        setInvoiceList([]);
        return;
      }
      const data = await invoicesApi.getByCompany(user?.companyId || '');
      setInvoiceList(data);
      filterInvoices(searchTerm, statusFilter, data);
    } catch (error) {
      notificationManager.error('Erreur', { message: 'Impossible de charger les factures.' });
    } finally {
      setLoading(false);
    }
  }, [user, searchTerm, statusFilter]);

  useEffect(() => {
    if (user) {
      loadInvoices();
    }
  }, [user, loadInvoices]);

  // Fonction pour filtrer les factures
  const filterInvoices = (term: string, status: string, sourceData?: InvoiceType[]) => {
    const dataToFilter = sourceData || invoiceList;
    
    setFilteredInvoices(dataToFilter.filter(invoice => {
      const matchesSearch = !term || 
        invoice.number.toLowerCase().includes(term.toLowerCase()) ||
        (invoice.companyName && invoice.companyName.toLowerCase().includes(term.toLowerCase())) ||
        (invoice.object && invoice.object.toLowerCase().includes(term.toLowerCase())) ||
        (invoice.notes && invoice.notes.toLowerCase().includes(term.toLowerCase()));
        
      const matchesStatus = status === 'all' || invoice.status === status;
      
      return matchesSearch && matchesStatus;
    }));
  };

  // Fonction pour rechercher par terme
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    filterInvoices(term, statusFilter);
  };

  // Fonction pour filtrer par statut
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    filterInvoices(searchTerm, status);
  };

  // Fonction pour télécharger une facture en PDF
  const handleDownloadPdf = async (invoice: InvoiceType) => {
    setActionLoading(`pdf-${invoice.id}`);
    try {
      await downloadInvoicePdf(invoice);
    } catch (error) {
      console.error("Error generating Invoice PDF:", error);
      notificationManager.error('Erreur PDF', { message: 'Impossible de générer le PDF pour la facture.' });
    } finally {
      setActionLoading(null);
    }
  };

  // Fonction pour payer une facture
  const handlePayInvoice = (invoice: InvoiceType) => {
    setInvoiceToPay(invoice);
  };

  // Fonction pour gérer l'initialisation du paiement
  const handlePaymentInitiation = (invoiceId: string, method: string, phone?: string) => {
    // Ici, vous pourriez appeler votre API pour initialiser le paiement
    notificationManager.success('Paiement initié', { 
      message: `Demande de paiement par ${method} envoyée.` 
    });
    setInvoiceToPay(null);
  };

  const handleViewDetails = (invoice: InvoiceType) => {
    // Cette fonction sera implémentée dans une prochaine itération
    notificationManager.info('Information', { 
      message: 'La vue détaillée sera disponible prochainement.'
    });
  };
  
  // Fonction de rendu des cartes de factures pour le composant InteractiveGrid
  const renderInvoiceCard = React.useCallback((invoice: InvoiceType) => {
    return (
      <InteractiveInvoiceCard
        key={invoice.id}
        invoice={invoice}
        isAdmin={false}
        actionLoading={actionLoading}
        onDownloadPdf={handleDownloadPdf}
        onViewDetails={handleViewDetails}
        onPayInvoice={handlePayInvoice}
      />
    );
  }, [actionLoading, handleDownloadPdf, handleViewDetails, handlePayInvoice]);

  // Déclencher l'animation après le chargement initial avec un délai plus important
  useEffect(() => {
    if (!loading && invoiceList.length > 0) {
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
  }, [loading, invoiceList]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arcadis-orange mx-auto"></div>
          <p className="mt-4 text-slate-600">Chargement des factures...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Mes Factures</h1>
            <p className="text-slate-600 mt-1">Consultez l'historique de vos factures.</p>
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
                    onClick={loadInvoices}
                    className="px-2 ml-1"
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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
            {viewMode === 'cards' && (
              <InvoiceList
                invoices={filteredInvoices}
                isLoading={loading}
                isAdmin={false}
                onSearchChange={handleSearchChange}
                onStatusFilterChange={handleStatusFilterChange}
                onPayInvoice={handlePayInvoice}
                onDownloadPdf={handleDownloadPdf}
                actionLoading={actionLoading}
                renderAdditionalActions={(invoice) => (
                  <>
                    {/* Actions spécifiques au client ici si nécessaire */}
                  </>
                )}
              />
            )}

            {viewMode === 'interactive' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <div className="w-full flex flex-1 items-center gap-2">
                    <div className="relative w-full max-w-sm">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="search" 
                        placeholder="Rechercher une facture..." 
                        className="pl-8 w-full md:w-[300px]" 
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          filterInvoices(e.target.value, statusFilter);
                        }}
                      />
                    </div>
                    <div className="w-[180px] hidden sm:block flex-shrink-0">
                      <Select value={statusFilter} onValueChange={(value) => {
                        setStatusFilter(value);
                        filterInvoices(searchTerm, value);
                      }}>
                        <SelectTrigger className="w-full">
                          <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <span>Statut</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les statuts</SelectItem>
                          <SelectItem value="sent">À payer</SelectItem>
                          <SelectItem value="paid">Payées</SelectItem>
                          <SelectItem value="partially_paid">Partiellement payées</SelectItem>
                          <SelectItem value="late">En retard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="col-span-full flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <span className="ml-3 text-lg">Chargement des factures...</span>
                  </div>
                ) : filteredInvoices.length === 0 ? (
                  <div className="col-span-full text-center py-12 border rounded-lg bg-muted/20">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">Aucune facture trouvée</h3>
                    <p className="mt-2 text-muted-foreground">
                      {searchTerm || statusFilter !== 'all' 
                        ? "Aucune facture ne correspond à vos critères de recherche."
                        : "Vous n'avez pas encore de factures."}
                    </p>
                    {!searchTerm && statusFilter === 'all' && (
                      <ConnectionTroubleshooter
                        onReloadData={loadInvoices}
                        entityName="factures"
                      />
                    )}
                  </div>
                ) : (
                  <InteractiveGrid
                    items={filteredInvoices}
                    loading={loading}
                    renderItem={renderInvoiceCard}
                  />
                )}
              </div>
            )}

            {viewMode === 'list' && (
              <InvoiceListView
                invoices={filteredInvoices}
                isLoading={loading}
                isAdmin={false}
                onSearchChange={(term) => {
                  setSearchTerm(term);
                  filterInvoices(term, statusFilter);
                }}
                onStatusFilterChange={(status) => {
                  setStatusFilter(status);
                  filterInvoices(searchTerm, status);
                }}
                onDownloadPdf={handleDownloadPdf}
                onPayInvoice={handlePayInvoice}
                onViewDetails={handleViewDetails}
                actionLoading={actionLoading}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <WavePaymentModal
        invoice={invoiceToPay}
        onClose={() => setInvoiceToPay(null)}
        onPaymentSuccess={() => {
          loadInvoices();
          notificationManager.success('Paiement confirmé', { message: 'Votre paiement a été traité avec succès.' });
        }}
      />
    </>
  );
};

export default FacturesPage;
