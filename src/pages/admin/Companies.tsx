// src/pages/admin/Companies.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importer useNavigate
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { companiesApi } from '@/services/api';
import { Company } from '@/types';
import { Plus, Search, Building, Mail, Phone, MapPin, Edit, Users as UsersIcon, Trash2 } from 'lucide-react'; // Renommé Users en UsersIcon

const Companies = () => {
  const navigate = useNavigate(); // Initialiser useNavigate
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewCompanyDialog, setShowNewCompanyDialog] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [newCompany, setNewCompany] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await companiesApi.getAll();
      setCompanies(data);
    } catch (error) {
      console.error("Erreur lors du chargement des entreprises:", error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les entreprises',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const filteredCompanies = companies.filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCompany = async () => {
    if (!newCompany.name.trim() || !newCompany.email.trim()) {
      toast({ title: "Validation", description: "Le nom et l'email sont requis.", variant: "warning"});
      return;
    }
    try {
      setActionLoading('create');
      await companiesApi.create(newCompany);
      await loadCompanies();
      setNewCompany({ name: '', email: '', phone: '', address: '' });
      setShowNewCompanyDialog(false);
      toast({
        title: 'Succès',
        description: 'Entreprise créée avec succès',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: (error as Error)?.message || 'Impossible de créer l\'entreprise',
        variant: 'error'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditCompany = async () => {
    if (!editingCompany || !editingCompany.name.trim() || !editingCompany.email.trim()) {
      toast({ title: "Validation", description: "Le nom et l'email sont requis.", variant: "warning"});
      return;
    }
    try {
      setActionLoading(`edit-${editingCompany.id}`);
      await companiesApi.update(editingCompany.id, {
        name: editingCompany.name,
        email: editingCompany.email,
        phone: editingCompany.phone,
        address: editingCompany.address
      });
      await loadCompanies();
      setEditingCompany(null);
      toast({
        title: 'Succès',
        description: 'Entreprise modifiée avec succès',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: (error as Error)?.message || 'Impossible de modifier l\'entreprise',
        variant: 'error'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    try {
      setActionLoading(`delete-${id}`);
      await companiesApi.delete(id);
      await loadCompanies();
      toast({
        title: 'Succès',
        description: 'Entreprise supprimée avec succès',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: (error as Error)?.message || 'Impossible de supprimer l\'entreprise. Elle est peut-être encore liée à des données.',
        variant: 'error'
      });
    } finally {
      setActionLoading(null);
      setCompanyToDelete(null);
    }
  };

  // NOUVELLE FONCTION pour gérer la navigation
  const handleManageUsers = (companyId: string) => {
    navigate(`/admin/users?companyId=${companyId}`);
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arcadis-orange mx-auto"></div>
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
            <p className="text-slate-600 mt-1">
              Gérez les entreprises clientes d'Arcadis Tech
            </p>
          </div>

          <Dialog open={showNewCompanyDialog} onOpenChange={setShowNewCompanyDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle Entreprise
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter une nouvelle entreprise</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label htmlFor="newName" className="block text-sm font-medium text-slate-700 mb-1">
                    Nom de l'entreprise *
                  </label>
                  <Input
                      id="newName"
                      placeholder="Ex: ACME Corporation"
                      value={newCompany.name}
                      onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="newEmail" className="block text-sm font-medium text-slate-700 mb-1">
                    Email de contact *
                  </label>
                  <Input
                      id="newEmail"
                      type="email"
                      placeholder="contact@entreprise.com"
                      value={newCompany.email}
                      onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="newPhone" className="block text-sm font-medium text-slate-700 mb-1">
                    Téléphone
                  </label>
                  <Input
                      id="newPhone"
                      placeholder="+221 XX XXX XX XX"
                      value={newCompany.phone}
                      onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="newAddress" className="block text-sm font-medium text-slate-700 mb-1">
                    Adresse
                  </label>
                  <Input
                      id="newAddress"
                      placeholder="Adresse complète"
                      value={newCompany.address}
                      onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" onClick={() => setShowNewCompanyDialog(false)}>
                    Annuler
                  </Button>
                  <Button
                      onClick={handleCreateCompany}
                      disabled={!newCompany.name.trim() || !newCompany.email.trim() || actionLoading === 'create'}
                  >
                    {actionLoading === 'create' ? 'Création...' : 'Créer l\'entreprise'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => (
              <Card key={company.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-arcadis-gradient rounded-lg">
                        <Building className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{company.name}</CardTitle>
                        <p className="text-sm text-slate-600">
                          Client depuis {formatDate(new Date(company.createdAt))}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Dialog onOpenChange={(open) => !open && setEditingCompany(null)}>
                        <DialogTrigger asChild>
                          <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingCompany({...company})}
                              title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        {editingCompany && editingCompany.id === company.id && (
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Modifier l'entreprise</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <label htmlFor={`editName-${company.id}`} className="block text-sm font-medium text-slate-700 mb-1">
                                    Nom de l'entreprise *
                                  </label>
                                  <Input
                                      id={`editName-${company.id}`}
                                      value={editingCompany.name}
                                      onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <label htmlFor={`editEmail-${company.id}`} className="block text-sm font-medium text-slate-700 mb-1">
                                    Email de contact *
                                  </label>
                                  <Input
                                      id={`editEmail-${company.id}`}
                                      type="email"
                                      value={editingCompany.email}
                                      onChange={(e) => setEditingCompany({ ...editingCompany, email: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <label htmlFor={`editPhone-${company.id}`} className="block text-sm font-medium text-slate-700 mb-1">
                                    Téléphone
                                  </label>
                                  <Input
                                      id={`editPhone-${company.id}`}
                                      value={editingCompany.phone}
                                      onChange={(e) => setEditingCompany({ ...editingCompany, phone: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <label htmlFor={`editAddress-${company.id}`} className="block text-sm font-medium text-slate-700 mb-1">
                                    Adresse
                                  </label>
                                  <Input
                                      id={`editAddress-${company.id}`}
                                      value={editingCompany.address}
                                      onChange={(e) => setEditingCompany({ ...editingCompany, address: e.target.value })}
                                  />
                                </div>
                                <div className="flex gap-2 justify-end pt-2">
                                  <Button variant="outline" onClick={() => setEditingCompany(null)}>
                                    Annuler
                                  </Button>
                                  <Button
                                      onClick={handleEditCompany}
                                      disabled={!editingCompany.name.trim() || !editingCompany.email.trim() || actionLoading === `edit-${company.id}`}
                                  >
                                    {actionLoading === `edit-${company.id}` ? 'Modification...' : 'Sauvegarder'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                        )}
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                              onClick={() => setCompanyToDelete(company)}
                              title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        {companyToDelete && companyToDelete.id === company.id && (
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette entreprise ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible et supprimera l'entreprise "{companyToDelete.name}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setCompanyToDelete(null)}>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => handleDeleteCompany(companyToDelete.id)}
                                    disabled={actionLoading === `delete-${companyToDelete.id}`}
                                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                >
                                  {actionLoading === `delete-${companyToDelete.id}` ? 'Suppression...' : 'Supprimer'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                        )}
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4" />
                    <span>{company.email}</span>
                  </div>
                  {company.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="h-4 w-4" />
                        <span>{company.phone}</span>
                      </div>
                  )}
                  {company.address && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-2">{company.address}</span>
                      </div>
                  )}

                  <div className="pt-3 border-t border-slate-200">
                    {/* MISE À JOUR DU BOUTON */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center gap-2"
                        onClick={() => handleManageUsers(company.id)} // Ajout du onClick
                    >
                      <UsersIcon className="h-4 w-4" /> {/* Utilisation de UsersIcon */}
                      Gérer les utilisateurs
                    </Button>
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>

        {filteredCompanies.length === 0 && !loading && (
            <Card>
              <CardContent className="p-8 text-center">
                <Building className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Aucune entreprise trouvée</p>
              </CardContent>
            </Card>
        )}
      </div>
  );
};

export default Companies;