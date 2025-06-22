// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { usersApi } from '@/services/api';
import { User as UserType } from '@/types/auth';
import { formatDate } from '@/lib/utils';

const Profile = () => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [formData, setFormData] = useState<Partial<UserType>>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
            });
            setLoading(false);
        } else if (!isAuthLoading) {
            toast.error('Erreur', { description: 'Impossible de charger le profil utilisateur.' });
            setLoading(false);
        }
    }, [user, isAuthLoading]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
            toast.warning("Validation", { description: "Prénom et Nom sont requis." });
            return;
        }

        setIsSaving(true);
        try {
            const updatesToSend = {
                first_name: formData.firstName?.trim(),
                last_name: formData.lastName?.trim(),
                phone: formData.phone?.trim() || null,
            };

            await usersApi.update(user.id, updatesToSend);
            toast.success('Succès', { description: 'Profil mis à jour avec succès' });
        } catch (error) {
            console.error("Erreur lors de la sauvegarde du profil:", error);
            toast.error('Erreur', { description: (error as Error)?.message || 'Impossible de sauvegarder le profil.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isAuthLoading || loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-slate-600">Chargement du profil...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
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
                            <Input id="email" value={user.email} readOnly disabled className="bg-slate-100" />
                        </div>

                        <div>
                            <Label htmlFor="role">Rôle</Label>
                            <Input id="role" value={user.role === 'admin' ? 'Administrateur' : 'Client'} readOnly disabled className="bg-slate-100" />
                        </div>

                        {user.role === 'client' && (
                            <div>
                                <Label htmlFor="companyName">Entreprise</Label>
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

                        {/* CORRECTION: Ajout d'une vérification pour s'assurer que user.createdAt existe */}
                        {user.createdAt && (
                            <div className="text-sm text-slate-600 mt-4">
                                <p>Inscrit le: {formatDate(new Date(user.createdAt))}</p>
                            </div>
                        )}

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