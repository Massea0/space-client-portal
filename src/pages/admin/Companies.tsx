// src/pages/admin/Companies.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner'; // MODIFIÉ : Import de toast depuis 'sonner'
import { companiesApi } from '@/services/api';
import { Company } from '@/types';
import { Plus, Search, Building, Mail, Phone, MapPin, Edit, Users as UsersIcon, Trash2 } from 'lucide-react';
import CompanyForm from '@/components/admin/companies/CompanyForm';

const Companies = () => {
  const navigate = useNavigate();
  // MODIFIÉ : Appel direct à toast au lieu de déstructurer useToast()
  // const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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
      toast.error('Impossible de charger les entreprises.'); // MODIFIÉ : Utilisation de toast.error de sonner
    } finally {
      setPageLoading(false);
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
        toast.success('Entreprise modifiée avec succès.'); // MODIFIÉ : Utilisation de toast.success de sonner
      } else {
        // Mode création
        await companiesApi.create(companyData);
        toast.success('Entreprise créée avec succès.'); // MODIFIÉ : Utilisation de toast.success de sonner
      }
      setIsFormOpen(false);
      setEditingCompany(null);
      await loadCompanies(); // Recharger les données
    } catch (error) {
      const message = (error as Error)?.message || `Impossible de ${editingCompany ? 'modifier' : 'créer'} l'entreprise.`;
      toast.error(message); // MODIFIÉ : Utilisation de toast.error de sonner
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;
    setActionLoading(true);
    try {
      await companiesApi.delete(companyToDelete.id);
      toast.success('Entreprise supprimée avec succès.'); // MODIFIÉ : Utilisation de toast.success de sonner
      setCompanyToDelete(null);
      await loadCompanies(); // Recharger les données
    } catch (error) {
      const message = (error as Error)?.message || 'Impossible de supprimer l\'entreprise. Elle est peut-être encore liée à des données.';
      toast.error(message); // MODIFIÉ : Utilisation de toast.error de sonner
    } finally {
      setActionLoading(false);
    }
  };

  const handleManageUsers = (companyId: string) => {
    navigate(`/admin/users?companyId=${companyId}`);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCompany(null);
  }

  if (pageLoading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-slate-600">Chargement des entreprises...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestion des Entreprises</h1>
            <p className="text-slate-600 mt-1">Gérez les entreprises clientes d'Arcadis Tech</p>
          </div>
          <Button className="flex items-center gap-2" onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Nouvelle Entreprise
          </Button>
        </div>

        {/* MODIFIÉ: Remplacé Card par un simple div pour la barre de recherche */}
        <div className="flex flex-col md:flex-row gap-4 p-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => (
              <Card key={company.id} className="hover:shadow-md transition-shadow flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-lg">
                        <Building className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{company.name}</CardTitle>
                        {/* CORRECTION : Affichage unique et correct de la date */}
                        <p className="text-sm text-slate-600">
                          Client depuis {formatDate(new Date(company.createdAt))}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
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
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{company.email}</span>
                  </div>
                  {company.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{company.phone}</span>
                      </div>
                  )}
                  {company.address && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="line-clamp-2">{company.address}</span>
                      </div>
                  )}
                </CardContent>
                <CardContent className="pt-3 border-t border-slate-200">
                  {/* CORRECTION : Suppression du bouton imbriqué */}
                  <Button variant="outline" size="sm" className="w-full flex items-center gap-2" onClick={() => handleManageUsers(company.id)}>
                    <UsersIcon className="h-4 w-4" />
                    Gérer les utilisateurs
                  </Button>
                </CardContent>
              </Card>
          ))}
        </div>

        {filteredCompanies.length === 0 && !pageLoading && (
            <Card>
              <CardContent className="p-8 text-center">
                <Building className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">{searchTerm ? 'Aucune entreprise ne correspond à votre recherche.' : 'Aucune entreprise trouvée.'}</p>
              </CardContent>
            </Card>
        )}

        {/* MODALE DE CRÉATION/ÉDITION (rendue une seule fois) */}
        <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCompany ? "Modifier l'entreprise" : "Ajouter une nouvelle entreprise"}</DialogTitle>
            </DialogHeader>
            <CompanyForm
                company={editingCompany}
                onSave={handleFormSave}
                onCancel={closeForm}
                isLoading={actionLoading}
            />
          </DialogContent>
        </Dialog>

        {/* MODALE DE SUPPRESSION (rendue une seule fois) */}
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
                  onClick={handleDeleteCompany}
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