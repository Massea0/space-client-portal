// src/pages/admin/AdminContracts.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { contractsApi, contractsAI, alertsApi } from '@/services/contracts';
import { Contract, ContractAlert } from '@/types/contracts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { notificationManager } from '@/components/ui/notification-provider';
import { formatCurrency, formatDate } from '@/lib/utils';
import ContractDetailsModal from '@/components/contracts/ContractDetailsModal';
import ContractGenerationModal from '@/components/contracts/ContractGenerationModal';
import ContractAlertsPanel from '@/components/contracts/ContractAlertsPanel';
import { insertTestData } from '@/scripts/insertTestData';
import { 
  Search as SearchIcon, 
  FileText, 
  RefreshCw, 
  Sparkles, 
  Eye, 
  Building, 
  Calendar, 
  Banknote,
  Send,
  CheckCircle,
  Wand2
} from 'lucide-react';

const AdminContractsPage = () => {
  // États principaux
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [alerts, setAlerts] = useState<ContractAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // États des modals
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);

  // Fonction pour charger les contrats
  const loadContracts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await contractsApi.getContracts();
      setContracts(data);
      setFilteredContracts(data);
    } catch (error) {
      console.error('Erreur lors du chargement des contrats:', error);
      notificationManager.error('Erreur', {
        message: 'Impossible de charger les contrats'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour charger les alertes
  const loadAlerts = useCallback(async () => {
    try {
      const data = await alertsApi.getAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Erreur lors du chargement des alertes:', error);
    }
  }, []);

  // Charger les contrats et alertes au montage
  useEffect(() => {
    loadContracts();
    loadAlerts();
  }, [loadContracts, loadAlerts]);

  // Fonction de filtrage
  const filterContracts = useCallback((search: string) => {
    let filtered = contracts;
    
    if (search) {
      filtered = filtered.filter(contract => 
        contract.title.toLowerCase().includes(search.toLowerCase()) ||
        contract.contractNumber.toLowerCase().includes(search.toLowerCase()) ||
        contract.object.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    setFilteredContracts(filtered);
  }, [contracts]);

  // Gestionnaire de recherche
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterContracts(term);
  };

  // Obtenir la couleur du badge selon le statut
  const getStatusBadgeVariant = (status: Contract['status']) => {
    switch (status) {
      case 'draft': return 'outline';
      case 'review': return 'secondary';
      case 'pending_client': return 'default';
      case 'signed': return 'default';
      case 'expired': return 'destructive';
      case 'terminated': return 'destructive';
      case 'renewed': return 'default';
      default: return 'outline';
    }
  };

  // Obtenir le libellé du statut
  const getStatusLabel = (status: Contract['status']) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'review': return 'En révision';
      case 'pending_client': return 'En attente client';
      case 'signed': return 'Signé';
      case 'expired': return 'Expiré';
      case 'terminated': return 'Résilié';
      case 'renewed': return 'Renouvelé';
      default: return status;
    }
  };

  // Gestionnaires de modals
  const handleViewDetails = (contract: Contract) => {
    setSelectedContract(contract);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedContract(null);
  };

  const handleOpenGenerationModal = () => {
    setIsGenerationModalOpen(true);
  };

  const handleCloseGenerationModal = () => {
    setIsGenerationModalOpen(false);
  };

  const handleContractGenerated = (contractId: string) => {
    loadContracts(); // Recharger la liste
    notificationManager.success('Contrat créé', {
      message: 'Le nouveau contrat a été ajouté à la liste'
    });
  };

  // Gestionnaires d'alertes
  const handleResolveAlert = async (alertId: string) => {
    try {
      await alertsApi.resolveAlert(alertId);
      await loadAlerts();
      notificationManager.success('Alerte résolue', {
        message: 'L\'alerte a été marquée comme résolue'
      });
    } catch (error) {
      notificationManager.error('Erreur', {
        message: 'Impossible de résoudre l\'alerte'
      });
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await alertsApi.dismissAlert(alertId);
      await loadAlerts();
      notificationManager.success('Alerte ignorée', {
        message: 'L\'alerte a été marquée comme ignorée'
      });
    } catch (error) {
      notificationManager.error('Erreur', {
        message: 'Impossible d\'ignorer l\'alerte'
      });
    }
  };

  // Fonction temporaire pour insérer des données de test
  const handleInsertTestData = async () => {
    try {
      const result = await insertTestData();
      if (result.success) {
        notificationManager.success('Données de test créées', {
          message: result.message
        });
        await loadContracts();
        await loadAlerts();
      } else {
        notificationManager.error('Erreur', {
          message: result.message
        });
      }
    } catch (error) {
      notificationManager.error('Erreur', {
        message: 'Erreur lors de la création des données de test'
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contrats IA</h1>
          <p className="text-muted-foreground">
            Gestion intelligente des contrats avec génération et analyse IA
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Statistiques rapides */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mr-4">
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {contracts.length} contrats
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              {contracts.filter(c => c.status === 'signed').length} signés
            </span>
          </div>

          {/* Bouton de rafraîchissement */}
          <Button
            variant="outline"
            size="sm"
            onClick={loadContracts}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {/* Bouton de génération de contrat */}
        <div className="flex gap-2">
          <Button className="flex items-center gap-2" onClick={handleOpenGenerationModal}>
            <Sparkles className="h-4 w-4" /> Générer Contrat IA
          </Button>
          {/* Bouton temporaire pour les données de test */}
          <Button variant="outline" onClick={handleInsertTestData}>
            Créer données test
          </Button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-sm">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Rechercher un contrat..." 
            className="pl-8" 
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Contenu principal avec layout deux colonnes */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Colonne principale - Contrats */}
        <div className="xl:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <span className="ml-3 text-lg">Chargement des contrats...</span>
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/20">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Aucun contrat trouvé</h3>
              <p className="mt-2 text-muted-foreground">
                {searchTerm 
                  ? "Aucun contrat ne correspond à vos critères de recherche."
                  : "Il n'y a pas encore de contrats dans le système."}
              </p>
              {!searchTerm && (
                <Button className="mt-4" onClick={handleOpenGenerationModal}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Générer votre premier contrat IA
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {filteredContracts.map((contract) => (
                <Card key={contract.id} className="group hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <Badge variant={getStatusBadgeVariant(contract.status)}>
                          {getStatusLabel(contract.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {contract.generatedByAi && (
                          <div title="Généré par IA">
                            <Wand2 className="h-4 w-4 text-purple-500" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-lg line-clamp-1">
                        {contract.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {contract.contractNumber}
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Client:</span>
                        <span className="font-medium">{contract.clientName || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Montant:</span>
                        <span className="font-medium">{formatCurrency(contract.amount || 0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Fin:</span>
                        <span className="font-medium">{formatDate(contract.endDate)}</span>
                      </div>
                    </div>

                    {/* Métriques IA */}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="flex items-center gap-3 text-xs">
                        <div className="text-center">
                          <div className="text-sm font-medium text-green-600">
                            {contract.complianceScore || 0}%
                          </div>
                          <div className="text-muted-foreground">Conformité</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-blue-600">
                            {contract.aiConfidenceScore || 0}%
                          </div>
                          <div className="text-muted-foreground">IA</div>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(contract)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Colonne latérale - Alertes */}
        <div className="xl:col-span-1">
          <ContractAlertsPanel
            alerts={alerts}
            onResolveAlert={handleResolveAlert}
            onDismissAlert={handleDismissAlert}
          />
        </div>
      </div>
      {/* Modals */}
      {selectedContract && (
        <ContractDetailsModal
          contract={selectedContract}
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          onUpdated={loadContracts}
        />
      )}

      <ContractGenerationModal
        isOpen={isGenerationModalOpen}
        onClose={handleCloseGenerationModal}
        onGenerated={handleContractGenerated}
      />
    </div>
  );
};

export default AdminContractsPage;
