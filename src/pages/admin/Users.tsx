// src/pages/admin/Users.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { usersApi } from '@/services/api'; // Importer usersApi
import type { User as UserType } from '@/types/auth'; // Importer le type User
import { Plus, Search, User, Mail, Phone, Building, Edit } from 'lucide-react';

// Définir une interface plus complète pour les utilisateurs si nécessaire, incluant createdAt
interface UserProfile extends UserType {
  createdAt: Date;
}

const Users = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]); // Utiliser UserProfile[] et initialiser à vide
  const [loading, setLoading] = useState(true); // Initialiser loading à true

  // Charger les utilisateurs depuis l'API
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const data = await usersApi.getAll();
        setUsers(data);
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les utilisateurs',
          variant: 'error',
        });
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [toast]);

  const filteredUsers = users.filter(user =>
      (user.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // TODO: Implémenter la logique pour handleCreateUser et handleEditUser avec des appels API

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arcadis-orange mx-auto"></div>
            <p className="mt-4 text-slate-600">Chargement des utilisateurs...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestion des Utilisateurs</h1>
            <p className="text-slate-600 mt-1">
              Gérez les utilisateurs du système
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nouvel Utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
              </DialogHeader>
              {/* TODO: Remplacer ce formulaire par un formulaire contrôlé avec react-hook-form et appeler usersApi.create */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Prénom *
                  </label>
                  <Input placeholder="Prénom" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nom *
                  </label>
                  <Input placeholder="Nom" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email *
                  </label>
                  <Input type="email" placeholder="email@exemple.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Rôle *
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline">Annuler</Button>
                  <Button>Créer l'utilisateur</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
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

        {/* Users Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-arcadis-gradient rounded-lg">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{user.firstName} {user.lastName}</CardTitle>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="mt-1">
                          {user.role === 'admin' ? 'Administrateur' : 'Client'}
                        </Badge>
                      </div>
                    </div>

                    {/* TODO: Implémenter la modification d'utilisateur */}
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="h-4 w-4" />
                        <span>{user.phone}</span>
                      </div>
                  )}
                  {user.companyName && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Building className="h-4 w-4" />
                        <span>{user.companyName}</span>
                      </div>
                  )}
                  <div className="pt-3 border-t border-slate-200 text-xs text-slate-500">
                    Inscrit le {formatDate(new Date(user.createdAt))} {/* Assurer que createdAt est bien un objet Date */}
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>
        {filteredUsers.length === 0 && !loading && (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Aucun utilisateur trouvé</p>
              </CardContent>
            </Card>
        )}
      </div>
  );
};

export default Users;