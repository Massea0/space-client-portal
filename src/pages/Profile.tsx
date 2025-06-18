// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import { usersApi } from '@/services/api';
import { User as UserType } from '@/types/auth'; // Importer le type User
import { formatDate } from '@/lib/utils';

const Profile = () => {
    const { user, isLoading: isAuthLoading } = useAuth(); // Récupérer l'utilisateur du contexte
    const { toast } = useToast();
    const [formData, setFormData] = useState<Partial<UserType>>({}); // Utiliser Partial<UserType> pour le formulaire
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Charger les données du profil dans le formulaire une fois que l'utilisateur est disponible
    useEffect(() => {
        if (user) {
            // Initialiser le formulaire avec les données de l'utilisateur du contexte
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                // Email, role, companyId/Name ne sont pas modifiables ici, donc pas dans le formData modifiable
            });
            setLoading(false); // Les données sont chargées depuis le contexte
        } else if (!isAuthLoading) {
            // Si pas d'utilisateur et pas en chargement auth, il y a un problème (non authentifié)
            // La ProtectedRoute devrait gérer ça, mais c'est un filet de sécurité.
            toast({
                title: 'Erreur',
                description: 'Impossible de charger le profil utilisateur.',
                variant: 'error'
            });
            setLoading(false);
        }
    }, [user, isAuthLoading, toast]); // Dépendances à user, isAuthLoading et toast

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return; // Ne rien faire si pas d'utilisateur

        // Validation basique
        if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
            toast({ title: "Validation", description: "Prénom et Nom sont requis.", variant: "warning"});
            return;
        }

        setIsSaving(true);
        try {
            // Préparer les mises à jour (mapper vers snake_case si l'API l'attend, mais usersApi.update gère déjà ça)
            const updatesToSend = {
                first_name: formData.firstName?.trim(),
                last_name: formData.lastName?.trim(),
                phone: formData.phone?.trim() || null, // Envoyer null si vide
            };

            // Appeler l'API pour mettre à jour le profil
            await usersApi.update(user.id, updatesToSend);

            // Note: L'AuthContext devrait idéalement écouter les USER_UPDATED events
            // et re-fetch le profil pour garder le contexte synchronisé.
            // Si ce n'est pas le cas, vous pourriez vouloir déclencher un rechargement du user dans le contexte ici.
            // Pour l'instant, on se fie à la logique de AuthContext.

            toast({
                title: 'Succès',
                description: 'Profil mis à jour avec succès',
                variant: 'success'
            });
        } catch (error) {
            console.error("Erreur lors de la sauvegarde du profil:", error);
            toast({
                title: 'Erreur',
                description: (error as Error)?.message || 'Impossible de sauvegarder le profil.',
                variant: 'error'
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Afficher un indicateur de chargement si l'authentification est en cours ou si les données du formulaire ne sont pas encore chargées
    if (isAuthLoading || loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arcadis-orange mx-auto"></div>
                    <p className="mt-4 text-slate-600">Chargement du profil...</p>
                </div>
            </div>
        );
    }

    // Si l'utilisateur n'est pas défini après chargement, rediriger (ProtectedRoute gère déjà, mais sécurité)
    if (!user) {
        return null; // La ProtectedRoute s'occupera de la redirection
    }


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Mon Profil</h1>
                <p className="text-slate-600 mt-1">
                    Visualisez et modifiez vos informations personnelles
                </p>
            </div>

            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Informations du profil</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="firstName">Prénom *</Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName || ''}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="lastName">Nom *</Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName || ''}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="email">Email</Label>
                            {/* Email non modifiable via cette UI */}
                            <Input id="email" value={user.email} readOnly disabled className="bg-slate-100" />
                        </div>

                        <div>
                            <Label htmlFor="role">Rôle</Label>
                            {/* Rôle non modifiable via cette UI */}
                            <Input id="role" value={user.role === 'admin' ? 'Administrateur' : 'Client'} readOnly disabled className="bg-slate-100" />
                        </div>

                        {user.role === 'client' && (
                            <div>
                                <Label htmlFor="companyName">Entreprise</Label>
                                {/* Entreprise non modifiable via cette UI client */}
                                <Input id="companyName" value={user.companyName || 'N/A'} readOnly disabled className="bg-slate-100" />
                            </div>
                        )}

                        <div>
                            <Label htmlFor="phone">Téléphone</Label>
                            <Input
                                id="phone"
                                placeholder="+221 XX XXX XX XX"
                                value={formData.phone || ''}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className="text-sm text-slate-600 mt-4">
                            <p>Inscrit le: {formatDate(new Date(user.createdAt))}</p>
                        </div>


                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSaving || isAuthLoading}>
                                {isSaving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Profile;