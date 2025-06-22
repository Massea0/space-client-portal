// src/components/layout/AuthLayout.tsx
import React from 'react';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        // Conteneur principal qui prend tout l'écran et centre le contenu
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-muted/40 p-4 relative">
            {/* Positionnement du ThemeSwitcher en haut à droite */}
            <div className="absolute top-4 right-4">
                <ThemeSwitcher />
            </div>

            {/* Logo et nom de l'application */}
            <div className="mb-8 flex flex-col items-center text-center">
                <img src="/logo/logo-header.png" alt="Logo Arcadis" className="h-20 w-auto" />
                <h1 className="mt-4 text-3xl font-bold text-primary">
                    Arcadis Space
                </h1>
                <p className="text-muted-foreground">Votre portail client dédié.</p>
            </div>

            {/* Conteneur pour le formulaire (LoginForm, ForgotPasswordForm, etc.) */}
            <div className="w-full max-w-md">
                {children}
            </div>

            {/* Footer simple */}
            <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Arcadis Technologies. Tous droits réservés.
            </footer>
        </div>
    );
};

export default AuthLayout;