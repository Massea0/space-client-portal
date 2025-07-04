// src/pages/admin/Users.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { notificationManager } from '@/components/ui/notification-provider';
import { motion, AnimatePresence } from 'framer-motion';
import { usersApi, companiesApi } from '@/services/api';
import { Company } from '@/types';
import type {
  AdminFullUserCreatePayload,
  UserUpdateDbPayload,
  UserProfile as ApiUserProfile
} from '@/services/api';
import {
  Plus, Search, KeyRound, XCircle, Filter as FilterIcon,
  ShieldCheck, ShieldAlert, ArchiveRestore, Trash2, Edit, Building, Archive,
  LayoutGrid, LayoutList, RefreshCw, UserCircle2 as User
} from 'lucide-react';

// Import des styles et composants partagés
import { formStyles as styles } from '@/components/forms/FormStyles';
import { FormCard, FormSection } from '@/components/forms/SharedFormComponents';
import { SafeDialogTrigger } from "@/components/ui/safe-dialog-trigger";
import { SafeSelectTrigger } from '@/components/ui/safe-triggers';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AnimatedModal } from '@/components/ui/animated-modal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

// Import des composants interactifs
import { InteractiveUserCard, InteractiveUsersGrid } from '@/components/modules/users';

// Type pour les modes d'affichage disponibles
type ViewMode = 'cards' | 'interactive' | 'list';

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
  const [viewMode, setViewMode] = useState<ViewMode>('interactive');
  const [animationReady, setAnimationReady] = useState(false);

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
      notificationManager.error('Erreur', {
        message: 'Impossible de charger les données.'
      });
      setAllUsers([]); // Ensure state is reset on error
    } finally {
      setLoading(false);
      // Activer les animations après le chargement initial
      // Délai plus important pour s'assurer que le DOM est complètement prêt
      // et que l'animation est fluide après le chargement
      setTimeout(() => setAnimationReady(true), 300);
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
      notificationManager.warning("Validation", {
        message: "Champs requis manquants ou mot de passe trop court."
      });
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
      notificationManager.success('Succès', {
        message: result.message || 'Utilisateur créé.'
      });
    } catch (error) {
      notificationManager.error('Erreur Création', {
        message: (error as Error)?.message || 'Impossible de créer.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditUser = async (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    if (!editingUser || !editingUser.firstName.trim() || !editingUser.lastName.trim() || (editingUser.role === 'client' && !editingUser.companyId)) {
      notificationManager.warning("Validation", {
        message: "Prénom, Nom et Entreprise (pour client) sont requis."
      });
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
      notificationManager.success('Succès', {
        message: 'Utilisateur mis à jour avec succès.'
      });
    } catch (error) {
      notificationManager.error('Erreur Modification', {
        message: (error as Error)?.message || 'Impossible de modifier.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlockUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      await usersApi.toggleUserStatus(userId, false);
      await loadData();
      notificationManager.success('Succès', {
        message: 'Utilisateur bloqué avec succès.'
      });
    } catch (error) {
      notificationManager.error('Erreur', {
        message: (error as Error)?.message || 'Impossible de bloquer.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      await usersApi.toggleUserStatus(userId, true);
      await loadData();
      notificationManager.success('Succès', {
        message: 'Utilisateur débloqué avec succès.'
      });
    } catch (error) {
      notificationManager.error('Erreur', {
        message: (error as Error)?.message || 'Impossible de débloquer.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const promptSoftDeleteUser = (user: ApiUserProfile) => {
    setUserToManage(user);
    setDialogActionType('softDelete');
  };

  const promptPermanentDeleteUser = (user: ApiUserProfile) => {
    setUserToManage(user);
    setDialogActionType('deletePermanently');
  };

  const handleSoftDeleteUser = async () => {
    if (!userToManage) return;
    try {
      setActionLoading(userToManage.id);
      await usersApi.softDelete(userToManage.id);
      await loadData();
      setUserToManage(null);
      setDialogActionType(null);
      notificationManager.success('Succès', {
        message: 'Utilisateur mis à la corbeille avec succès.'
      });
    } catch (error) {
      notificationManager.error('Erreur', {
        message: (error as Error)?.message || 'Impossible de mettre à la corbeille.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDeleteUser = async () => {
    if (!userToManage) return;
    try {
      setActionLoading(userToManage.id);
      await usersApi.deletePermanently(userToManage.id);
      await loadData();
      setUserToManage(null);
      setDialogActionType(null);
      notificationManager.success('Succès', {
        message: 'Utilisateur supprimé définitivement.'
      });
    } catch (error) {
      notificationManager.error('Erreur', {
        message: (error as Error)?.message || 'Impossible de supprimer définitivement.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestoreUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      await usersApi.restore(userId);
      await loadData();
      notificationManager.success('Succès', {
        message: 'Utilisateur restauré avec succès.'
      });
    } catch (error) {
      notificationManager.error('Erreur', {
        message: (error as Error)?.message || 'Impossible de restaurer.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewCompany = (companyId: string | null | undefined) => {
    if (companyId) {
      navigate(`/admin/users?companyId=${companyId}`);
    }
  };

  const resetCompanyFilter = () => navigate('/admin/users');

  useEffect(() => {
    if (!showNewUserDialog) {
      setNewUserFormData({ email: '', password_initial: '', firstName: '', lastName: '', role: 'client', companyId: companyIdFromUrl || null, phone: null });
    }
  }, [showNewUserDialog, companyIdFromUrl]);

  // Fonction wrapper pour adapter les types
  const handleEditUserSelection = useCallback((user: ApiUserProfile) => {
    setEditingUser(user);
  }, []);

  if (loading && allUsers.length === 0) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  // Fonction de rendu pour les cartes utilisateur dans la grille interactive
  const renderUserCard = (user: ApiUserProfile) => (
    <InteractiveUserCard 
      user={user}
      actionLoading={actionLoading}
      onEditUser={handleEditUserSelection}
      onBlockUser={handleBlockUser}
      onUnblockUser={handleUnblockUser}
      onSoftDeleteUser={promptSoftDeleteUser}
      onRestoreUser={handleRestoreUser}
      onPermanentDelete={promptPermanentDeleteUser}
      onViewCompany={handleViewCompany}
    />
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground mt-1">{companyIdFromUrl ? `Utilisateurs de ${filteredByCompanyName}` : 'Gérez les utilisateurs du système'}</p>
        </div>
        <Button 
          className={cn("flex-shrink-0", 
            companyIdFromUrl ? "bg-primary hover:bg-primary-hover text-primary-foreground" : ""
          )} 
          onClick={() => setShowNewUserDialog(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          {companyIdFromUrl ? 'Nouveau utilisateur pour ' + filteredByCompanyName : 'Nouvel utilisateur'}
        </Button>

          {/* Dialog de création d'utilisateur */}
          <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {companyIdFromUrl ? `Ajouter un utilisateur pour ${filteredByCompanyName}` : 'Ajouter un nouvel utilisateur'}
                </DialogTitle>
                <DialogDescription>
                  Saisissez les informations pour créer un nouvel utilisateur.
                </DialogDescription>
              </DialogHeader>
              <FormCard title="Création d'un nouvel utilisateur">
                <form onSubmit={handleAdminCreateFullUser}>
                  <FormSection>
                    <div className={styles.inputGroup}>
                      <Label htmlFor="newUserEmail" className={styles.label}>Email *</Label>
                      <Input id="newUserEmail" type="email" {...{ value: newUserFormData.email, onChange: (e) => setNewUserFormData({ ...newUserFormData, email: e.target.value }) }} required />
                    </div>
                    <div className={styles.inputGroup}>
                      <Label htmlFor="newUserPassword" className={styles.label}>Mot de passe initial *</Label>
                      <div className="relative">
                        <Input id="newUserPassword" type="text" autoComplete="off" {...{ value: newUserFormData.password_initial, onChange: (e) => setNewUserFormData({ ...newUserFormData, password_initial: e.target.value }) }} required minLength={6} />
                        <KeyRound className="absolute top-2.5 right-3 h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Doit contenir au moins 6 caractères.</p>
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

        {/* Filtres et recherche */}
        <div className="flex flex-col md:flex-row gap-4 p-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Rechercher par nom ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          
          <div className="flex gap-2 flex-wrap md:flex-nowrap">
            {/* Contrôles de vue (table ou cartes) */}
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
                      variant={viewMode === 'list' ? "secondary" : "ghost"} 
                      size="sm" 
                      onClick={() => setViewMode('list')} 
                      className="px-3"
                    >
                      <LayoutList className="h-4 w-4 mr-1" />
                      <span className="sr-only sm:not-sr-only sm:inline-block">Liste</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Vue en liste détaillée</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SafeSelectTrigger className="w-full md:w-[150px]">
                <FilterIcon className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Rôle" />
              </SafeSelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="admin">Administrateurs</SelectItem>
                <SelectItem value="client">Clients</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={viewFilter} onValueChange={setViewFilter}>
              <SafeSelectTrigger className="w-full md:w-[200px]">
                <Archive className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Vue" />
              </SafeSelectTrigger>
              <SelectContent>
                <SelectItem value="active_blocked">Actifs & Bloqués</SelectItem>
                <SelectItem value="trash">Corbeille</SelectItem>
              </SelectContent>
            </Select>
            
            {!companyIdFromUrl && (
              <Select value={companyFilter} onValueChange={setCompanyFilter} disabled={loading}>
                <SafeSelectTrigger className="w-full md:w-[220px]">
                  <Building className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Entreprise" />
                </SafeSelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les entreprises</SelectItem>
                  {companies.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {companyIdFromUrl && (
              <Button 
                variant="outline" 
                onClick={resetCompanyFilter} 
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4 mr-1" /> 
                Retirer filtre entreprise
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => loadData()}
              disabled={loading}
              title="Rafraîchir"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Liste des utilisateurs avec animation entre les modes de vue */}
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
                <InteractiveUsersGrid
                  items={filteredUsers}
                  loading={loading}
                  renderItem={renderUserCard}
                  isReady={animationReady}
                  columnLayouts={{ mobile: 1, tablet: 2, desktop: 3 }}
                  emptyState={
                    <Card className="col-span-full">
                      <CardContent className="flex flex-col items-center justify-center py-10 px-6 text-center">
                        <User className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Aucun utilisateur trouvé</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {searchTerm || roleFilter !== 'all' || companyFilter !== 'all' || viewFilter !== 'active_blocked'
                            ? "Essayez de modifier vos filtres de recherche."
                            : "Commencez par créer un nouvel utilisateur."}
                        </p>
                        <Button onClick={() => setShowNewUserDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" /> Créer un utilisateur
                        </Button>
                      </CardContent>
                    </Card>
                  }
                />
              )}

            {viewMode === 'list' && (
              <Card>
                <CardContent className="p-0">
                  <div className="relative w-full overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead className="hidden md:table-cell">Email</TableHead>
                          <TableHead>Rôle</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="hidden lg:table-cell">Entreprise</TableHead>
                          <TableHead className="hidden lg:table-cell">Inscrit le</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                              <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                              <TableCell>
                                {user.role === 'admin' ? (
                                  <Badge variant="destructive" className="flex items-center w-fit">
                                    <ShieldCheck className="h-3 w-3 mr-1" />
                                    Admin
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="flex items-center w-fit">
                                    <User className="h-3 w-3 mr-1" />
                                    Client
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {user.deletedAt ? (
                                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                                    Supprimé
                                  </Badge>
                                ) : !user.isActive ? (
                                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                                    Bloqué
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                                    Actif
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                {user.companyName ? (
                                  <Button
                                    variant="link"
                                    className="p-0 h-auto"
                                    onClick={() => handleViewCompany(user.companyId)}
                                  >
                                    {user.companyName}
                                  </Button>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                {formatDate(new Date(user.createdAt))}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditingUser(user)}
                                    disabled={actionLoading === user.id}
                                    title="Modifier"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>

                                  {user.deletedAt ? (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRestoreUser(user.id)}
                                        disabled={actionLoading === user.id}
                                        title="Restaurer"
                                      >
                                        <ArchiveRestore className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => promptPermanentDeleteUser(user)}
                                        disabled={actionLoading === user.id}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        title="Supprimer définitivement"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      {!user.isActive ? (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleUnblockUser(user.id)}
                                          disabled={actionLoading === user.id}
                                          className="hover:text-green-600 hover:bg-green-50"
                                          title="Débloquer"
                                        >
                                          <ShieldCheck className="h-4 w-4" />
                                        </Button>
                                      ) : (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleBlockUser(user.id)}
                                          disabled={actionLoading === user.id}
                                          className="hover:text-amber-600 hover:bg-amber-50"
                                          title="Bloquer"
                                        >
                                          <ShieldAlert className="h-4 w-4" />
                                        </Button>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => promptSoftDeleteUser(user)}
                                        disabled={actionLoading === user.id}
                                        className="hover:text-gray-600 hover:bg-gray-100"
                                        title="Mettre en corbeille"
                                      >
                                        <Archive className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              Aucun utilisateur trouvé.
                              {(searchTerm || roleFilter !== 'all' || companyFilter !== 'all' || viewFilter !== 'active_blocked') && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  Essayez de modifier vos critères de recherche.
                                </p>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dialog d'édition d'utilisateur */}
        {editingUser && (
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Modifier l'utilisateur</DialogTitle>
                  <DialogDescription>
                    Modifiez les informations de l'utilisateur.
                  </DialogDescription>
                </DialogHeader>
                <FormCard title="Modification d'un utilisateur">
                  <form onSubmit={handleEditUser}>
                    <FormSection>
                      <div className={styles.inputGroup}>
                        <Label htmlFor="editUserEmail" className={styles.label}>Email</Label>
                        <Input id="editUserEmail" type="email" value={editingUser.email} disabled className="bg-muted/50" />
                        <p className="text-xs text-muted-foreground mt-1">L'email ne peut pas être modifié.</p>
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

        {/* Dialog de confirmation de suppression/mise en corbeille */}
        {userToManage && (
          <AlertDialog 
            open={!!dialogActionType} 
            onOpenChange={(open) => !open && setDialogActionType(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {dialogActionType === 'softDelete' 
                    ? 'Mettre en corbeille' 
                    : 'Supprimer définitivement'}
                </AlertDialogTitle>
                <AlertDialogDescriptionComponent>
                  {dialogActionType === 'softDelete' 
                    ? `Voulez-vous vraiment mettre l'utilisateur ${userToManage.firstName} ${userToManage.lastName} en corbeille ? Les données seront conservées, mais l'utilisateur sera désactivé.` 
                    : <span className="text-destructive">Cette action est irréversible. Voulez-vous vraiment supprimer définitivement l'utilisateur {userToManage.firstName} {userToManage.lastName} ?</span>}
                </AlertDialogDescriptionComponent>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel 
                  disabled={actionLoading === userToManage.id}
                  onClick={() => {
                    setUserToManage(null);
                    setDialogActionType(null);
                  }}
                >
                  Annuler
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={dialogActionType === 'softDelete' ? handleSoftDeleteUser : handlePermanentDeleteUser}
                  disabled={actionLoading === userToManage.id}
                  className={dialogActionType === 'deletePermanently' 
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" 
                    : ""
                  }
                >
                  {actionLoading === userToManage.id 
                    ? (dialogActionType === 'softDelete' ? "Mise en corbeille..." : "Suppression...") 
                    : (dialogActionType === 'softDelete' ? "Mettre en corbeille" : "Supprimer définitivement")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
  );
};

export default Users;