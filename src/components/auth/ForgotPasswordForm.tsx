import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPasswordForm = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        });

        setLoading(false);
        if (error) {
            setError("Erreur lors de l'envoi de l'e-mail de réinitialisation. Veuillez vérifier l'adresse e-mail et réessayer.");
            console.error('Password reset error:', error.message);
        } else {
            setMessage('Si un compte avec cet e-mail existe, un lien de réinitialisation a été envoyé. Veuillez consulter votre boîte de réception.');
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Mot de passe oublié ?</CardTitle>
                <CardDescription>
                    Entrez votre e-mail pour recevoir un lien de réinitialisation.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {message ? (
                    <div className="text-center space-y-4">
                        <p className="text-green-600 dark:text-green-500">{message}</p>
                        <Button asChild variant="outline">
                            <Link to="/login">Retour à la connexion</Link>
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="votre.email@exemple.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                        </Button>
                        <div className="text-center text-sm mt-4">
                            <Link to="/login" className="underline">
                                Retour à la page de connexion
                            </Link>
                        </div>
                    </form>
                )}
            </CardContent>
        </Card>
    );
};

export default ForgotPasswordForm;