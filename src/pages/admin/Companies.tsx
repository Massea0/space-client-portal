// src/pages/admin/Companies.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnimatedModal } from '@/components/ui/animated-modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate, cn } from '@/lib/utils';
import { notificationManager } from '@/components/ui/notification-provider';
import { companiesApi } from '@/services/api';
import { Company } from '@/types';
import { 
  Plus, Search, Building, Mail, Phone, MapPin, Edit, 
  Users as UsersIcon, Trash2, LayoutGrid, LayoutList, RefreshCw,
  Filter as FilterIcon, Eye
} from 'lucide-react';
import CompanyForm from '@/components/admin/companies/CompanyForm';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

// Import des composants interactifs
import { InteractiveCompanyCard, InteractiveCompaniesGrid } from '@/components/modules/companies';

// Type pour les modes d'affichage disponibles
type ViewMode = 'cards' | 'interactive';

const Companies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('interactive');
  const [animationReady, setAnimationReady] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadCompanies = async () => {
    try {
      setPageLoading(true);
      const data = await companiesApi.getAll();
      setCompanies(data);
    } catch (error) {
      console.error("Erreur lors du chargement des entreprises:", error);
      notificationManager.error('Erreur', {
        message: 'Impossible de charger les entreprises.'
      });
    } finally {
      setPageLoading(false);
      // Activer les animations après le chargement initial
      setTimeout(() => setAnimationReady(true), 100);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const filteredCompanies = useMemo(() =>
      companies.filter(company =>
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.email.toLowerCase().includes(searchTerm.toLowerCase())
      ), [companies, searchTerm]);

  const handleFormSave = async (companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    setActionLoading(true);
    try {
      if (editingCompany) {
        // Mode édition
        await companiesApi.update(editingCompany.id, companyData);
        notificationManager.success('Succès', {
          message: 'Entreprise modifiée avec succès.'
        });
      } else {
        // Mode création
        await companiesApi.create(companyData);
        notificationManager.success('Succès', {
          message: 'Entreprise créée avec succès.'
        });
      }
      setIsFormOpen(false);
      setEditingCompany(null);
      await loadCompanies(); // Recharger les données
    } catch (error) {
      const message = (error as Error)?.message || `Impossible de ${editingCompany ? 'modifier' : 'créer'} l'entreprise.`;
      notificationManager.error('Erreur', { message });
    } finally {
      setActionLoading(false);
    }
  };

  // Fonctions wrapper pour adapter les types
  const handleEditCompany = useCallback((company: Company) => {
    setEditingCompany(company);
  }, []);

  const handleDeleteCompany = useCallback((company: Company) => {
    setCompanyToDelete(company);
  }, []);

  const handleManageUsers = (companyId: string) => {
    navigate(`/admin/users?companyId=${companyId}`);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCompany(null);
  }

  // Fonction de rendu pour les cartes entreprise dans la grille interactive
  const renderCompanyCard = (company: Company) => (
    <InteractiveCompanyCard 
      company={company}
      actionLoading={actionLoading}
      onEdit={handleEditCompany}
      onDelete={handleDeleteCompany}
      onManageUsers={handleManageUsers}
    />
  );

  if (pageLoading && companies.length === 0) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Chargement des entreprises...</p>
          </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Entreprises</h1>
          <p className="text-muted-foreground mt-1">Gérez les entreprises clientes d'Arcadis Tech</p>
        </div>
        <Button 
          className="flex items-center gap-2" 
          onClick={() => setIsFormOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Nouvelle Entreprise
        </Button>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-4 p-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap md:flex-nowrap">
          {/* Contrôles de vue (cartes ou grille interactive) */}
          <div className="flex items-center bg-muted/40 rounded-lg p-1 border shadow-sm">
            <TooltipProvider>
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
                    variant={viewMode === 'cards' ? "secondary" : "ghost"} 
                    size="sm" 
                    onClick={() => setViewMode('cards')} 
                    className="px-3"
                  >
                    <LayoutList className="h-4 w-4 mr-1" />
                    <span className="sr-only sm:not-sr-only sm:inline-block">Liste</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Vue en liste simple</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => loadCompanies()}
            disabled={pageLoading}
            title="Rafraîchir"
          >
            <RefreshCw className={cn("h-4 w-4", pageLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

        {/* Liste des entreprises avec animation entre les modes de vue */}
        <div className="grid gap-4">
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
            {viewMode === 'interactive' && (
              <InteractiveCompaniesGrid
                items={filteredCompanies}
                loading={pageLoading}
                renderItem={renderCompanyCard}
                isReady={animationReady}
                columnLayouts={{ mobile: 1, tablet: 2, desktop: 3 }}
                emptyState={
                  <Card className="col-span-full">
                    <CardContent className="flex flex-col items-center justify-center py-10 px-6 text-center">
                      <Building className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Aucune entreprise trouvée</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {searchTerm 
                          ? "Essayez de modifier vos critères de recherche."
                          : "Commencez par créer une nouvelle entreprise."}
                      </p>
                      <Button onClick={() => setIsFormOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Créer une entreprise
                      </Button>
                    </CardContent>
                  </Card>
                }
              />
            )}

            {viewMode === 'cards' && (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company) => (
                    <Card key={company.id} className="hover:shadow-md transition-shadow flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-lg">
                              <Building className="h-5 w-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <CardTitle className="text-lg truncate">{company.name}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                Client depuis {formatDate(new Date(company.createdAt))}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center flex-shrink-0 ml-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => navigate(`/admin/companies/${company.id}`)} 
                              title="Voir détails"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => { setEditingCompany(company); setIsFormOpen(true); }} title="Modifier">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/90 hover:bg-destructive/10" onClick={() => setCompanyToDelete(company)} title="Supprimer">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 flex-grow">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate overflow-hidden">{company.email}</span>
                        </div>
                        {company.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{company.phone}</span>
                          </div>
                        )}
                        {company.address && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="line-clamp-2">{company.address}</span>
                          </div>
                        )}
                      </CardContent>
                      <CardContent className="pt-3 border-t border-slate-200">
                        <Button variant="outline" size="sm" className="w-full flex items-center gap-2" onClick={() => handleManageUsers(company.id)}>
                          <UsersIcon className="h-4 w-4" />
                          <span className="truncate">Gérer les utilisateurs</span>
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="col-span-1 md:col-span-2 lg:col-span-3">
                    <CardContent className="p-8 text-center">
                      <Building className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {searchTerm ? 'Aucune entreprise ne correspond à votre recherche.' : 'Aucune entreprise trouvée.'}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* MODALE DE CRÉATION/ÉDITION */}
        <AnimatedModal
          isOpen={isFormOpen}
          onOpenChange={(open) => !open && closeForm()}
          title={editingCompany ? "Modifier l'entreprise" : "Ajouter une nouvelle entreprise"}
          size="lg"
          animationType="zoom"
          contentClassName="max-w-2xl"
        >
          <CompanyForm
            company={editingCompany}
            onSave={handleFormSave}
            onCancel={closeForm}
            isLoading={actionLoading}
          />
        </AnimatedModal>

        {/* MODALE DE SUPPRESSION */}
        <AlertDialog open={!!companyToDelete} onOpenChange={(open) => !open && setCompanyToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette entreprise ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible et supprimera l'entreprise "{companyToDelete?.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCompanyToDelete(null)}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => companyToDelete && handleDeleteCompany(companyToDelete)}
                disabled={actionLoading}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                {actionLoading ? 'Suppression...' : 'Supprimer'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
};

export default Companies;