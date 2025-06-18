// src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/useToast';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading, error: authError } = useAuth(); // Utiliser authError du contexte
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Réinitialiser l'erreur locale

    try {
      await login({ email, password });
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Arcadis Space",
        variant: "success"
      });
      // La redirection est gérée par AppRoutes ou le contexte
    } catch (err) {
      // L'erreur est déjà gérée et mise à jour dans AuthContext (via setError là-bas)
      // Nous n'avons pas besoin de la redéfinir ici, sauf si nous voulons un message différent
      // pour les erreurs de type "invalid login credentials" qui ne sont pas "compte désactivé".
      if (err instanceof Error && err.message !== 'Votre compte a été désactivé. Veuillez contacter le développeur.') {
        setError('Email ou mot de passe incorrect. Veuillez réessayer.');
      }
      // Si c'est l'erreur de compte désactivé, `authError` du contexte sera déjà mis à jour et affiché.
    }
  };

  // Utiliser l'erreur du contexte d'authentification pour l'affichage,
  // car elle contient le message spécifique pour les comptes désactivés.
  // S'il y a une erreur locale (comme "Email ou mot de passe incorrect"), on l'affiche.
  const displayError = error || authError;

  return (
      <div className="min-h-screen flex items-center justify-center bg-arcadis-gradient-subtle">
        <div className="w-full max-w-md p-6">
          <div className="text-center mb-8">
            <img
                src="/logo/logo-svg.svg"
                alt="Arcadis Technologies"
                className="h-21 w-auto mx-auto -mb-20" // MODIFIÉ ICI: h-16 -> h-20
            />
            <h1 className="text-3xl font-bold bg-arcadis-gradient bg-clip-text text-transparent">
              Arcadis Space
            </h1>
            <p className="text-slate-600 mt-2">Portail Client</p>
          </div>

          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Connexion</CardTitle>
              <CardDescription>
                Accédez à votre espace client sécurisé
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre-email@example.com"
                      required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                  />
                </div>

                {displayError && (
                    <Alert variant="destructive">
                      <AlertDescription>{displayError}</AlertDescription>
                    </Alert>
                )}

                <Button
                    type="submit"
                    className="w-full bg-arcadis-gradient hover:opacity-90"
                    disabled={isLoading}
                >
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </Button>

              </form>
            </CardContent>
          </Card>
        </div>
      </div>
  );
};

export default LoginForm;