// src/pages/admin/AdminFactures.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { invoicesApi } from '@/services/api';
import { Invoice as InvoiceType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog";
import { notificationManager } from '@/components/ui/notification-provider';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { downloadInvoicePdf } from '@/lib/pdfGenerator';
import { 
  Plus, Send, CheckCircle, Search as SearchIcon, Filter, 
  CreditCard, Building, Calendar, Banknote, Eye, LayoutGrid, LayoutList,
  FileText, RefreshCw, TrendingUp, Users, DollarSign, Clock
} from 'lucide-react';
import FactureForm, { FactureFormSubmitData } from '@/components/forms/FactureForm';
import { SafeDialogTrigger } from "@/components/ui/safe-dialog-trigger";
import InvoiceList from '@/components/modules/invoices/InvoiceList';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InteractiveGrid } from '@/components/ui/interactive-grid';
import { connectionDiagnostic } from '@/lib/connectionDiagnostic';
import { ConnectionTroubleshooter } from '@/components/diagnostics/ConnectionTroubleshooter';
import {
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import InteractiveInvoiceCard from '@/components/modules/invoices/InteractiveInvoiceCard';
import InvoiceListView from '@/components/modules/invoices/InvoiceListView';
import { PageTemplate, PageSection, ContentGrid, StatsCard } from '@/components/layout/PageTemplate';


// Fonction utilitaire pour valider et formater les données de facture
const validateAndFormatInvoiceData = (data: FactureFormSubmitData) => {
  console.log('🔍 Validation des données d\'entrée:', JSON.stringify(data, null, 2));
  
  // Vérifier que nous avons des items
  if (!data.items || data.items.length === 0) {
    throw new Error('Au moins un article est requis pour créer une facture.');
  }

  let totalAmount = 0;
  const processedItems = data.items.map((item, index) => {
    console.log(`🔍 Traitement item ${index + 1}:`, {
      raw: item,
      quantityType: typeof item.quantity,
      unitPriceType: typeof item.unitPrice,
    });

    // Fonction utilitaire pour convertir en nombre
    const safeParseNumber = (value: any, fieldName: string): number => {
      if (value === null || value === undefined) {
        console.log(`⚠️ ${fieldName} est null/undefined`);
        return 0;
      }
      
      if (typeof value === 'number') {
        return isNaN(value) ? 0 : value;
      }
      
      const stringValue = String(value).trim();
      if (stringValue === '') {
        console.log(`⚠️ ${fieldName} est une chaîne vide`);
        return 0;
      }
      
      const parsed = parseFloat(stringValue);
      return isNaN(parsed) ? 0 : parsed;
    };

    const quantity = safeParseNumber(item.quantity, 'Quantité');
    const unitPrice = safeParseNumber(item.unitPrice, 'Prix unitaire');
    
    console.log(`📝 Article: "${item.description}"`);
    console.log(`   - Quantité convertie: ${quantity} (valeur originale: ${item.quantity})`);
    console.log(`   - Prix unitaire converti: ${unitPrice} (valeur originale: ${item.unitPrice})`);
    
    if (quantity <= 0) {
      throw new Error(`La quantité pour l'article "${item.description}" doit être supérieure à zéro. (Valeur reçue: ${item.quantity})`);
    }
    
    if (unitPrice < 0) {
      throw new Error(`Le prix unitaire pour l'article "${item.description}" ne peut pas être négatif. (Valeur reçue: ${item.unitPrice})`);
    }
    
    const itemTotal = parseFloat((quantity * unitPrice).toFixed(2));
    totalAmount += itemTotal;
    
    console.log(`   - Total article: ${itemTotal}`);
    
    return {
      description: item.description?.trim() || '',
      quantity: quantity,
      unitPrice: unitPrice,
    };
  });

  const finalTotal = parseFloat(totalAmount.toFixed(2));
  console.log(`💰 Montant total calculé: ${finalTotal}`);

  if (finalTotal <= 0) {
    throw new Error('Le montant total de la facture doit être supérieur à zéro. Vérifiez que tous les articles ont une quantité et un prix unitaire valides.');
  }

  return {
    totalAmount: finalTotal,
    processedItems
  };
};
type ViewMode = 'cards' | 'interactive' | 'list';

const AdminFactures = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [invoiceList, setInvoiceList] = useState<InvoiceType[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceType | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('interactive');
  const [animationReady, setAnimationReady] = useState(false);
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);

  const [isCreateFactureDialogOpen, setIsCreateFactureDialogOpen] = useState(false);
  const [isSubmittingFacture, setIsSubmittingFacture] = useState(false);

  useEffect(() => {
    if (location.state?.openCreateFactureDialog) {
      setIsCreateFactureDialogOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);


  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await invoicesApi.getAll();
      setInvoiceList(data);
      setFilteredInvoices(data);
    } catch (error) {
      notificationManager.error('Erreur', {
        message: 'Impossible de charger les factures'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

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

  // Fonction pour mettre à jour les factures filtrées
  const filterInvoices = useCallback((search: string, status: string) => {
    let filtered = [...invoiceList];

    // Filtrage par recherche
    if (search) {
      filtered = filtered.filter(invoice =>
        invoice.number.toLowerCase().includes(search.toLowerCase()) ||
        invoice.companyName.toLowerCase().includes(search.toLowerCase()) ||
        (invoice.notes && invoice.notes.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // Filtrage par statut
    if (status !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === status);
    }
    
    setFilteredInvoices(filtered);
  }, [invoiceList]);

  useEffect(() => {
    filterInvoices(searchTerm, statusFilter);
  }, [searchTerm, statusFilter, filterInvoices]);

  const handleMarkAsPaid = async (id: string) => {
    setActionLoading(`paid-${id}`);
    try {
      const updatedInvoice = await invoicesApi.updateStatus(id, 'paid');
      await loadInvoices();
      if (selectedInvoice && selectedInvoice.id === id) {
        setSelectedInvoice(updatedInvoice);
      }
      notificationManager.success('Succès', {
        message: 'Facture marquée comme payée'
      });
    } catch (error) {
      notificationManager.error('Erreur', {
        message: 'Impossible de mettre à jour la facture'
      });
    } finally {
      setActionLoading(null);
    }
  };

  // NOUVELLE FONCTION: Finaliser et envoyer une facture brouillon
  const handleFinalizeInvoice = async (id: string) => {
    setActionLoading(`finalize-${id}`);
    try {
      // Met à jour le statut de 'draft' à 'pending'
      const updatedInvoice = await invoicesApi.updateStatus(id, 'pending');
      await loadInvoices();
      if (selectedInvoice && selectedInvoice.id === id) {
        setSelectedInvoice(updatedInvoice);
      }
      notificationManager.success('Succès', {
        message: 'La facture a été finalisée et est maintenant en attente.'
      });
    } catch (error) {
      notificationManager.error('Erreur', {
        message: 'Impossible de finaliser la facture.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateFactureSubmitInDialog = async (data: FactureFormSubmitData) => {
    setIsSubmittingFacture(true);
    try {
      const issueDateObj = new Date(data.issueDate);
      const dueDateObj = new Date(data.dueDate);

      if (isNaN(issueDateObj.getTime()) || isNaN(dueDateObj.getTime())) {
        notificationManager.error('Erreur de Validation', {
          message: 'Les dates fournies (émission ou échéance) sont invalides.',
        });
        setIsSubmittingFacture(false);
        return;
      }

      // Débogage: Afficher les données reçues
      console.log('🔍 Données reçues du formulaire:', data);
      console.log('🔍 Items:', data.items);

      // Validation et formatage des données de la facture
      const { totalAmount, processedItems } = validateAndFormatInvoiceData(data);

      const payloadForApi = {
        companyId: data.companyId,
        object: "Facture " + new Date().toLocaleDateString(), // Valeur par défaut pour l'objet obligatoire
        amount: totalAmount,
        status: 'draft' as InvoiceType['status'], // MODIFIÉ: Créer en tant que brouillon
        dueDate: dueDateObj,
        notes: data.notes,
        items: processedItems,
      };

      console.log('🔍 Payload envoyé à l\'API:', payloadForApi);

      const newFacture = await invoicesApi.create(payloadForApi);

      notificationManager.success('Facture Créée', {
        message: `La facture N°${newFacture.number} a été créée en tant que brouillon.`,
      });
      setIsCreateFactureDialogOpen(false);
      loadInvoices();
    } catch (error: unknown) {
      let errorMessage = 'Une erreur est survenue lors de la création de la facture.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      notificationManager.error('Erreur de Création', {
        message: errorMessage,
      });
    } finally {
      setIsSubmittingFacture(false);
    }
  };

  // Fonctions pour gérer les recherches et filtres
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    filterInvoices(term, statusFilter);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    filterInvoices(searchTerm, status);
  };

  const handleDownloadPdf = async (invoice: InvoiceType) => {
    setActionLoading(`pdf-${invoice.id}`);
    try {
      await downloadInvoicePdf(invoice);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF de la facture:", error);
      notificationManager.error('Erreur PDF', {
        message: 'Impossible de générer le PDF pour la facture.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (invoice: InvoiceType) => {
    // Cette fonction sera implémentée dans une prochaine itération
    notificationManager.info('Information', { 
      message: 'La vue détaillée sera disponible prochainement.'
    });
  };
  
  const getStatusBadge = (status: InvoiceType['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Payée</Badge>;
      case 'overdue':
        return <Badge variant="destructive">En retard</Badge>;
      case 'draft':
        return <Badge variant="secondary" className="bg-slate-100 text-slate-800">Brouillon</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-gray-200 text-gray-700">Annulée</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Fonction de rendu des cartes de factures pour le composant InteractiveGrid
  const renderInvoiceCard = React.useCallback((invoice: InvoiceType) => {
    return (
      <InteractiveInvoiceCard
        key={invoice.id}
        invoice={invoice}
        isAdmin={true}
        actionLoading={actionLoading}
        onDownloadPdf={handleDownloadPdf}
        onViewDetails={handleViewDetails}
        onUpdateStatus={async (id, status) => {
          if (status === 'sent') {
            await handleFinalizeInvoice(id);
          } else if (status === 'paid') {
            await handleMarkAsPaid(id);
          }
        }}
      />
    );
  }, [actionLoading, handleDownloadPdf, handleViewDetails, handleFinalizeInvoice, handleMarkAsPaid]);

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
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestion des Factures</h1>
            <p className="text-slate-600 mt-1">Consultez et gérez toutes les factures clients.</p>
          </div>

          <div className="flex items-center gap-4">
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
            
            <Dialog open={isCreateFactureDialogOpen} onOpenChange={setIsCreateFactureDialogOpen}>
              <SafeDialogTrigger asChild>
                <Button className="flex items-center gap-2 w-full md:w-auto">
                  <Plus className="h-4 w-4" /> Nouvelle Facture
                </Button>
              </SafeDialogTrigger>
              <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Créer une Nouvelle Facture</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations ci-dessous pour générer une nouvelle facture.
                  </DialogDescription>
                </DialogHeader>
                <FactureForm
                    onSubmit={handleCreateFactureSubmitInDialog}
                    onCancel={() => setIsCreateFactureDialogOpen(false)}
                    isLoading={isSubmittingFacture}
                />
              </DialogContent>
            </Dialog>
          </div>
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
                isAdmin={true}
                onSearchChange={handleSearchChange}
                onStatusFilterChange={handleStatusFilterChange}
                onViewDetails={(invoice) => setSelectedInvoice(invoice)}
                onDownloadPdf={handleDownloadPdf}
                actionLoading={actionLoading}
                renderAdditionalActions={(invoice) => (
                  <>
                    {/* ACTION: Finaliser et Envoyer (pour les brouillons) */}
                    {invoice.status === 'draft' && (
                      <Button
                        size="sm"
                        onClick={() => handleFinalizeInvoice(invoice.id)}
                        disabled={actionLoading === `finalize-${invoice.id}`}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Send className="h-4 w-4" />
                        {actionLoading === `finalize-${invoice.id}` ? 'Envoi...' : 'Finaliser et Envoyer'}
                      </Button>
                    )}

                    {/* ACTION: Marquer payée (pour les factures en attente) */}
                    {invoice.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkAsPaid(invoice.id)}
                        disabled={actionLoading === `paid-${invoice.id}`}
                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {actionLoading === `paid-${invoice.id}` ? 'Mise à jour...' : 'Marquer comme payée'}
                      </Button>
                    )}
                  </>
                )}
              />
            )}

            {viewMode === 'interactive' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <div className="w-full flex flex-1 items-center gap-2">
                    <div className="relative w-full max-w-sm">
                      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
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
                          <SelectItem value="draft">Brouillons</SelectItem>
                          <SelectItem value="sent">Envoyées</SelectItem>
                          <SelectItem value="paid">Payées</SelectItem>
                          <SelectItem value="partially_paid">Partiellement payées</SelectItem>
                          <SelectItem value="late">En retard</SelectItem>
                          <SelectItem value="cancelled">Annulées</SelectItem>
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
                        : "Il n'y a pas encore de factures dans le système."}
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
                isAdmin={true}
                onSearchChange={(term) => {
                  setSearchTerm(term);
                  filterInvoices(term, statusFilter);
                }}
                onStatusFilterChange={(status) => {
                  setStatusFilter(status);
                  filterInvoices(searchTerm, status);
                }}
                onDownloadPdf={handleDownloadPdf}
                onViewDetails={handleViewDetails}
                onUpdateStatus={async (id, status) => {
                  if (status === 'sent') {
                    await handleFinalizeInvoice(id);
                  } else if (status === 'paid') {
                    await handleMarkAsPaid(id);
                  }
                }}
                actionLoading={actionLoading}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
  );
};

export default AdminFactures;