// src/pages/UpdatePassword.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

const UpdatePasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        setLoading(true);
        const { error: updateError } = await supabase.auth.updateUser({ password });
        setLoading(false);

        if (updateError) {
            console.error('Error updating password:', updateError);
            toast({
                title: 'Erreur',
                description: updateError.message || 'Impossible de mettre à jour le mot de passe. Le lien a peut-être expiré.',
                variant: 'error',
            });
            setError(updateError.message);
        } else {
            toast({
                title: 'Succès',
                description: 'Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter.',
                variant: 'success',
            });
            setTimeout(() => navigate('/login'), 3000);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Changer votre mot de passe</CardTitle>
                <CardDescription>
                    Veuillez saisir votre nouveau mot de passe ci-dessous.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Nouveau mot de passe</Label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="pl-10"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="pl-10"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default UpdatePasswordPage;