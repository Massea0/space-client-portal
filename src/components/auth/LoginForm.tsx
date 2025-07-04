// src/components/auth/LoginForm.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, KeyRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, user } = useAuth();
  const navigate = useNavigate();
  
  // Gérer la redirection après une connexion réussie
  useEffect(() => {
    if (user) {
      // Utiliser les fonctions importées du context pour gérer la redirection
      import('@/context/AuthContext').then(({ getRedirectUrl, clearRedirectUrl }) => {
        const redirectPath = getRedirectUrl();
        if (redirectPath) {
          // Effacer la redirection stockée et naviguer vers cette page
          clearRedirectUrl();
          navigate(redirectPath, { replace: true });
        } else {
          // Redirection par défaut en fonction du rôle
          navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true });
        }
      });
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login({ email, password });
      // La redirection est gérée par l'effect ci-dessus
    } catch (err) {
      // L'erreur est gérée dans AuthContext et affichée via l'état `error`
      console.error("Login failed from form:", err);
    }
  };

  return (
      // La Card n'a plus besoin de sa propre image de logo
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/* L'image du logo a été retirée car elle est maintenant dans AuthLayout */}
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription>
            Accédez à votre espace client.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
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
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Mot de passe</Label>
                <Link
                    to="/forgot-password"
                    className="ml-auto inline-block text-sm text-primary hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
        </CardContent>
      </Card>
  );
};

export default LoginForm;