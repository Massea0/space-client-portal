// src/pages/admin/Users.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription as AlertDialogDescriptionComponent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usersApi, companiesApi } from '@/services/api';
import { Company } from '@/types';
import type {
  AdminFullUserCreatePayload,
  UserUpdateDbPayload,
  UserProfile as ApiUserProfile
} from '@/services/api';
import {
  Plus, Search, KeyRound, XCircle, Filter as FilterIcon,
  ShieldCheck, ShieldAlert, ArchiveRestore, Trash2, Edit, Building, Archive
} from 'lucide-react';

// NOUVEAU: Import des styles et composants partagés
import { formStyles as styles } from '@/components/forms/FormStyles';
import { FormCard, FormSection } from '@/components/forms/SharedFormComponents';


interface NewUserFormDataType {
  email: string;
  password_initial: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'admin';
  companyId?: string | null;
  phone?: string | null;
}

const Users = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyIdFromUrl = searchParams.get('companyId');

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [viewFilter, setViewFilter] = useState<string>('active_blocked');

  const [allUsers, setAllUsers] = useState<ApiUserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ApiUserProfile[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [newUserFormData, setNewUserFormData] = useState<NewUserFormDataType>({
    email: '', password_initial: '', firstName: '', lastName: '', role: 'client', companyId: companyIdFromUrl || null, phone: null
  });

  const [editingUser, setEditingUser] = useState<ApiUserProfile | null>(null);
  const [userToManage, setUserToManage] = useState<ApiUserProfile | null>(null);
  const [dialogActionType, setDialogActionType] = useState<'softDelete' | 'deletePermanently' | null>(null);

  const [filteredByCompanyName, setFilteredByCompanyName] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersData, companiesData] = await Promise.all([
        usersApi.getAll(true),
        companiesApi.getAll()
      ]);
      setAllUsers(usersData);
      setCompanies(companiesData);

      if (companyIdFromUrl) {
        const company = companiesData.find(c => c.id === companyIdFromUrl);
        setFilteredByCompanyName(company?.name || `ID: ${companyIdFromUrl}`);
      } else {
        setFilteredByCompanyName(null);
      }

    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast.error('Erreur', { description: 'Impossible de charger les données.', });
      setAllUsers([]); // Ensure state is reset on error
    } finally {
      setLoading(false);
    }
  }, [companyIdFromUrl]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    let usersToDisplay = allUsers;

    if (viewFilter === 'trash') {
      usersToDisplay = usersToDisplay.filter(user => !!user.deletedAt);
    } else {
      usersToDisplay = usersToDisplay.filter(user => !user.deletedAt);
    }

    if (companyIdFromUrl) {
      usersToDisplay = usersToDisplay.filter(user => user.companyId === companyIdFromUrl);
      const company = companies.find(c => c.id === companyIdFromUrl);
      setFilteredByCompanyName(company?.name || `ID: ${companyIdFromUrl}`);
      setNewUserFormData(prev => ({ ...prev, companyId: companyIdFromUrl, role: 'client' }));
    } else {
      setFilteredByCompanyName(null);
      if (companyFilter !== 'all') {
        usersToDisplay = usersToDisplay.filter(user => user.companyId === companyFilter);
      }
    }

    if (roleFilter !== 'all') {
      usersToDisplay = usersToDisplay.filter(user => user.role === roleFilter);
    }

    if (searchTerm) {
      usersToDisplay = usersToDisplay.filter(user =>
          (user.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (user.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }
    setFilteredUsers(usersToDisplay);
  }, [searchTerm, roleFilter, companyFilter, viewFilter, allUsers, companyIdFromUrl, companies]);

  const handleAdminCreateFullUser = async (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    if (!newUserFormData.email.trim() || !newUserFormData.password_initial || newUserFormData.password_initial.length < 6 ||
        !newUserFormData.firstName.trim() || !newUserFormData.lastName.trim() ||
        (newUserFormData.role === 'client' && !newUserFormData.companyId)) {
      toast.warning("Validation", { description: "Champs requis manquants ou mot de passe trop court." });
      return;
    }
    try {
      setActionLoading('create-full');
      const payload: AdminFullUserCreatePayload = {
        email: newUserFormData.email.trim(), password_initial: newUserFormData.password_initial,
        first_name: newUserFormData.firstName.trim(), last_name: newUserFormData.lastName.trim(),
        role: newUserFormData.role,
        company_id: newUserFormData.role === 'client' ? newUserFormData.companyId : null,
        phone: newUserFormData.phone?.trim() || null,
      };
      const result = await usersApi.adminCreateFullUser(payload);
      await loadData();
      setNewUserFormData({ email: '', password_initial: '', firstName: '', lastName: '', role: 'client', companyId: companyIdFromUrl || null, phone: null });
      setShowNewUserDialog(false);
      toast.success('Succès', { description: result.message || 'Utilisateur créé.' });
    } catch (error) {
      toast.error('Erreur Création', { description: (error as Error)?.message || 'Impossible de créer.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditUser = async (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    if (!editingUser || !editingUser.firstName.trim() || !editingUser.lastName.trim() || (editingUser.role === 'client' && !editingUser.companyId)) {
      toast.warning("Validation", { description: "Prénom, Nom et Entreprise (pour client) sont requis." });
      return;
    }
    try {
      setActionLoading(`edit-${editingUser.id}`);
      const updatesToSend: UserUpdateDbPayload = {
        first_name: editingUser.firstName.trim(), last_name: editingUser.lastName.trim(),
        role: editingUser.role,
        company_id: editingUser.role === 'client' ? editingUser.companyId : null,
        phone: editingUser.phone?.trim() || null,
      };
      await usersApi.update(editingUser.id, updatesToSend);
      await loadData();
      setEditingUser(null);
      toast.success('Succès', { description: 'Utilisateur modifié.' });
    } catch (error) {
      toast.error('Erreur Modification', { description: (error as Error)?.message || 'Impossible de modifier.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSoftDeleteUser = async (userId: string) => {
    try {
      setActionLoading(`soft-delete-${userId}`);
      await usersApi.softDelete(userId);
      await loadData();
      toast.success('Succès', { description: 'Utilisateur mis à la corbeille.' });
    } catch (error) {
      toast.error('Erreur', { description: (error as Error)?.message || 'Échec de la mise à la corbeille.' });
    } finally {
      setActionLoading(null);
      setUserToManage(null);
      setDialogActionType(null);
    }
  };

  const handleRestoreUser = async (userId: string) => {
    try {
      setActionLoading(`restore-${userId}`);
      await usersApi.restore(userId);
      await loadData();
      toast.success('Succès', { description: 'Utilisateur restauré.' });
    } catch (error) {
      toast.error('Erreur', { description: (error as Error)?.message || 'Échec de la restauration.' });
    } finally {
      setActionLoading(null);
      setUserToManage(null);
    }
  };

  const handleDeleteUserPermanently = async (userId: string) => {
    try {
      setActionLoading(`delete-perm-${userId}`);
      await usersApi.deletePermanently(userId);
      await loadData();
      toast.success('Succès', { description: 'Utilisateur supprimé définitivement.' });
    } catch (error) {
      toast.error('Erreur', { description: (error as Error)?.message || 'Échec de la suppression définitive.' });
    } finally {
      setActionLoading(null);
      setUserToManage(null);
      setDialogActionType(null);
    }
  };

  const handleToggleUserActiveStatus = async (userId: string, newStatus: boolean) => {
    const userToToggle = allUsers.find(u => u.id === userId);
    if (userToToggle?.deletedAt) {
      toast.warning('Action non permise', { description: 'Cet utilisateur est dans la corbeille. Restaurez-le d\'abord.' });
      return;
    }
    try {
      setActionLoading(`status-${userId}`);
      await usersApi.toggleUserStatus(userId, newStatus);
      await loadData();
      toast.success('Succès', { description: `Utilisateur ${newStatus ? 'débloqué' : 'bloqué'}.` });
    } catch (error) {
      toast.error('Erreur', { description: (error as Error)?.message || `Impossible de ${newStatus ? 'débloquer' : 'bloquer'}.` });
    } finally {
      setActionLoading(null);
    }
  };

  const openConfirmationDialog = (user: ApiUserProfile, action: 'softDelete' | 'deletePermanently') => {
    setUserToManage(user);
    setDialogActionType(action);
  };

  const resetCompanyFilter = () => navigate('/admin/users');

  useEffect(() => {
    if (!showNewUserDialog) {
      setNewUserFormData({ email: '', password_initial: '', firstName: '', lastName: '', role: 'client', companyId: companyIdFromUrl || null, phone: null });
    }
  }, [showNewUserDialog, companyIdFromUrl]);

  if (loading && allUsers.length === 0) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestion des Utilisateurs</h1>
            <p className="text-muted-foreground mt-1">Gérez les utilisateurs du système.</p>
          </div>
          <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
            <DialogTrigger asChild><Button className="flex items-center gap-2 w-full sm:w-auto"><Plus /> Nouvel Utilisateur</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <FormCard
                  title="Ajouter un nouvel utilisateur"
                  description="Remplissez les informations pour créer un nouveau compte."
              >
                <form onSubmit={handleAdminCreateFullUser}> {/* Supprimé py-4 ici car FormCard gère le padding */}
                  <FormSection>
                    <div className={styles.inputGroup}>
                      <Label htmlFor="newUserEmail" className={styles.label}>Email *</Label>
                      <Input id="newUserEmail" {...{ value: newUserFormData.email, onChange: (e) => setNewUserFormData({ ...newUserFormData, email: e.target.value }) }} type="email" required />
                    </div>
                    <div className={styles.inputGroup}>
                      <Label htmlFor="newUserPassword" className={styles.label}>Mot de passe initial * <span className="text-xs text-muted-foreground">(min. 6 caractères)</span></Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input id="newUserPassword" {...{ value: newUserFormData.password_initial, onChange: (e) => setNewUserFormData({ ...newUserFormData, password_initial: e.target.value }) }} type="password" className="pl-10" required />
                      </div>
                    </div>
                    <div className={styles.inputGroup}>
                      <Label htmlFor="newUserFirstName" className={styles.label}>Prénom *</Label>
                      <Input id="newUserFirstName" {...{ value: newUserFormData.firstName, onChange: (e) => setNewUserFormData({ ...newUserFormData, firstName: e.target.value }) }} required />
                    </div>
                    <div className={styles.inputGroup}>
                      <Label htmlFor="newUserLastName" className={styles.label}>Nom *</Label>
                      <Input id="newUserLastName" {...{ value: newUserFormData.lastName, onChange: (e) => setNewUserFormData({ ...newUserFormData, lastName: e.target.value }) }} required />
                    </div>
                    <div className={styles.inputGroup}>
                      <Label htmlFor="newUserRole" className={styles.label}>Rôle *</Label>
                      <Select value={newUserFormData.role} onValueChange={(value: 'client' | 'admin') => setNewUserFormData({ ...newUserFormData, role: value, companyId: value === 'admin' ? null : (companyIdFromUrl || newUserFormData.companyId) })}>
                        <SelectTrigger id="newUserRole"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="admin">Administrateur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newUserFormData.role === 'client' && (
                        <div className={styles.inputGroup}>
                          <Label htmlFor="newUserCompany" className={styles.label}>Entreprise cliente *</Label>
                          <Select value={newUserFormData.companyId || ''} onValueChange={(value) => setNewUserFormData({ ...newUserFormData, companyId: value })} disabled={!!companyIdFromUrl}>
                            <SelectTrigger id="newUserCompany"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                            <SelectContent>
                              {companies.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                            </SelectContent>
                          </Select>
                          {companyIdFromUrl && <p className="text-xs text-muted-foreground mt-1">Assigné à {filteredByCompanyName}.</p>}
                        </div>
                    )}
                    <div className={styles.inputGroup}>
                      <Label htmlFor="newUserPhone" className={styles.label}>Téléphone</Label>
                      <Input id="newUserPhone" {...{ value: newUserFormData.phone || '', onChange: (e) => setNewUserFormData({ ...newUserFormData, phone: e.target.value }) }} />
                    </div>
                  </FormSection>
                  <div className={styles.buttonsWrapper}>
                    <Button type="button" variant="outline" onClick={() => setShowNewUserDialog(false)} disabled={actionLoading === 'create-full'}>Annuler</Button>
                    <Button type="submit" disabled={!newUserFormData.email.trim() || !newUserFormData.password_initial || newUserFormData.password_initial.length < 6 || !newUserFormData.firstName.trim() || !newUserFormData.lastName.trim() || (newUserFormData.role === 'client' && !newUserFormData.companyId) || actionLoading === 'create-full'}>{actionLoading === 'create-full' ? 'Création...' : 'Créer'}</Button>
                  </div>
                </form>
              </FormCard>
            </DialogContent>
          </Dialog>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col md:flex-row items-center gap-4 p-2">
          <div className="relative flex-1 w-full"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" /><Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-full"/></div>
          <div className="flex items-center gap-2 w-full md:w-auto"><FilterIcon className="h-4 w-4 text-muted-foreground hidden md:inline-block" /><Select value={roleFilter} onValueChange={setRoleFilter}><SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Rôle" /></SelectTrigger><SelectContent><SelectItem value="all">Tous rôles</SelectItem><SelectItem value="admin">Admin</SelectItem><SelectItem value="client">Client</SelectItem></SelectContent></Select></div>
          <div className="flex items-center gap-2 w-full md:w-auto"><Archive className="h-4 w-4 text-muted-foreground hidden md:inline-block" /><Select value={viewFilter} onValueChange={setViewFilter}><SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder="Vue" /></SelectTrigger><SelectContent><SelectItem value="active_blocked">Actifs & Bloqués</SelectItem><SelectItem value="trash">Corbeille</SelectItem></SelectContent></Select></div>
          {!companyIdFromUrl && (
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Building className="h-4 w-4 text-muted-foreground hidden md:inline-block" />
                <Select value={companyFilter} onValueChange={setCompanyFilter} disabled={loading}>
                  <SelectTrigger className="w-full md:w-[220px]">
                    <SelectValue placeholder="Entreprise" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
          )}
          {companyIdFromUrl && <Button variant="ghost" onClick={resetCompanyFilter} className="flex items-center gap-2"><XCircle className="h-4 w-4" /> Retirer filtre entreprise</Button>}
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="relative w-full overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead className="hidden md:table-cell">Email</TableHead><TableHead>Rôle</TableHead><TableHead>Statut</TableHead><TableHead className="hidden lg:table-cell">Entreprise</TableHead><TableHead className="hidden lg:table-cell">Inscrit le</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                          <TableRow key={user.id} className={cn(!user.isActive && !user.deletedAt && 'opacity-70 bg-yellow-50 dark:bg-yellow-900/20', user.deletedAt && 'bg-red-50 dark:bg-red-900/30 opacity-50')}>
                            <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                            <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                            <TableCell><Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role === 'admin' ? 'Admin' : 'Client'}</Badge></TableCell>
                            <TableCell>
                              {user.deletedAt ? (
                                  <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200"><Trash2 className="h-3.5 w-3.5 mr-1" /> Corbeille</Badge>
                              ) : user.isActive ? (
                                  <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200"><ShieldCheck className="h-3.5 w-3.5 mr-1" /> Actif</Badge>
                              ) : (
                                  <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-50 hover:bg-yellow-100"><ShieldAlert className="h-3.5 w-3.5 mr-1" /> Bloqué</Badge>
                              )}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">{user.companyName || 'N/A'}</TableCell>
                            <TableCell className="hidden lg:table-cell">{formatDate(new Date(user.createdAt!))}</TableCell>
                            <TableCell className="text-right space-x-1">
                              {user.deletedAt ? (
                                  <>
                                    <Button variant="outline" size="sm" onClick={() => handleRestoreUser(user.id)} disabled={actionLoading === `restore-${user.id}`} title="Restaurer"><ArchiveRestore className="h-4 w-4" /></Button>
                                    <Button variant="destructive" size="sm" onClick={() => openConfirmationDialog(user, 'deletePermanently')} disabled={actionLoading === `delete-perm-${user.id}`} title="Supprimer définitivement"><Trash2 className="h-4 w-4" /></Button>
                                  </>
                              ) : (
                                  <>
                                    <Button variant="outline" size="sm" onClick={() => handleToggleUserActiveStatus(user.id, !user.isActive)} disabled={actionLoading === `status-${user.id}`} title={user.isActive ? 'Bloquer' : 'Débloquer'}>{user.isActive ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}</Button>
                                    <Button variant="outline" size="sm" onClick={() => setEditingUser(user)} title="Modifier"><Edit className="h-4 w-4" /></Button>
                                    <Button variant="outline" size="sm" onClick={() => openConfirmationDialog(user, 'softDelete')} disabled={actionLoading === `soft-delete-${user.id}`} title="Mettre à la corbeille"><Archive className="h-4 w-4" /></Button>
                                  </>
                              )}
                            </TableCell>
                          </TableRow>
                      ))
                  ) : (
                      <TableRow><TableCell colSpan={7} className="text-center h-24">Aucun utilisateur trouvé.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <AlertDialog open={!!userToManage && !!dialogActionType} onOpenChange={(open) => { if (!open) { setUserToManage(null); setDialogActionType(null); }}}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescriptionComponent>
                {dialogActionType === 'softDelete' && `L'utilisateur "${userToManage?.firstName} ${userToManage?.lastName}" sera déplacé vers la corbeille. Il pourra être restauré plus tard.`}
                {dialogActionType === 'deletePermanently' && `Cette action est irréversible et supprimera définitivement l'utilisateur "${userToManage?.firstName} ${userToManage?.lastName}".`}
              </AlertDialogDescriptionComponent>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                  onClick={() => {
                    if (dialogActionType === 'softDelete') handleSoftDeleteUser(userToManage!.id);
                    if (dialogActionType === 'deletePermanently') handleDeleteUserPermanently(userToManage!.id);
                  }}
                  className={cn(dialogActionType === 'deletePermanently' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90')}
              >
                Confirmer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {editingUser && (
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
              <DialogContent className="max-w-2xl">
                <FormCard
                    title={`Modifier l'utilisateur ${editingUser.firstName}`}
                    description="Mettez à jour les informations de l'utilisateur."
                >
                  <form onSubmit={handleEditUser}> {/* Supprimé py-4 ici */}
                    <FormSection>
                      <div className={styles.inputGroup}>
                        <Label className={styles.label}>Email</Label>
                        <Input value={editingUser.email} disabled />
                      </div>
                      <div className={styles.inputGroup}>
                        <Label htmlFor="editUserFirstName" className={styles.label}>Prénom *</Label>
                        <Input id="editUserFirstName" {...{ value: editingUser.firstName, onChange: (e) => setEditingUser({ ...editingUser, firstName: e.target.value }) }} required />
                      </div>
                      <div className={styles.inputGroup}>
                        <Label htmlFor="editUserLastName" className={styles.label}>Nom *</Label>
                        <Input id="editUserLastName" {...{ value: editingUser.lastName, onChange: (e) => setEditingUser({ ...editingUser, lastName: e.target.value }) }} required />
                      </div>
                      <div className={styles.inputGroup}>
                        <Label htmlFor="editUserRole" className={styles.label}>Rôle *</Label>
                        <Select value={editingUser.role} onValueChange={(value: 'client' | 'admin') => setEditingUser({ ...editingUser, role: value, companyId: value === 'admin' ? null : editingUser.companyId })}>
                          <SelectTrigger id="editUserRole"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="client">Client</SelectItem>
                            <SelectItem value="admin">Administrateur</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {editingUser.role === 'client' && (
                          <div className={styles.inputGroup}>
                            <Label htmlFor="editUserCompany" className={styles.label}>Entreprise cliente *</Label>
                            <Select value={editingUser.companyId || ''} onValueChange={(value) => setEditingUser({ ...editingUser, companyId: value })}>
                              <SelectTrigger id="editUserCompany"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                              <SelectContent>
                                {companies.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                              </SelectContent>
                            </Select>
                          </div>
                      )}
                      <div className={styles.inputGroup}>
                        <Label htmlFor="editUserPhone" className={styles.label}>Téléphone</Label>
                        <Input id="editUserPhone" {...{ value: editingUser.phone || '', onChange: (e) => setEditingUser({ ...editingUser, phone: e.target.value }) }} />
                      </div>
                    </FormSection>
                    <div className={styles.buttonsWrapper}>
                      <Button type="button" variant="outline" onClick={() => setEditingUser(null)} disabled={actionLoading === `edit-${editingUser.id}`}>Annuler</Button>
                      <Button type="submit" disabled={!editingUser.firstName.trim() || !editingUser.lastName.trim() || (editingUser.role === 'client' && !editingUser.companyId) || actionLoading === `edit-${editingUser.id}`}>{actionLoading === `edit-${editingUser.id}` ? 'Sauvegarde...' : 'Sauvegarder'}</Button>
                    </div>
                  </form>
                </FormCard>
              </DialogContent>
            </Dialog>
        )}
      </div>
  );
};

export default Users;