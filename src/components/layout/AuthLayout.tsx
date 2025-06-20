// src/components/layout/AuthLayout.tsx
import React from 'react';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
            {/* Left Pane: Branding (visible on large screens) */}
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: 'url(/images/auth-background.jpg)' }}
                />
                {/* Color Overlay */}
                <div className="absolute inset-0 bg-zinc-900 opacity-75" />

                {/* Content */}
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <img src="/logo/logo-white.png" alt="Logo Arcadis" className="h-10 w-auto mr-3" />
                    Arcadis Space
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;Votre portail client dédié pour une gestion simplifiée et efficace de vos projets avec Arcadis.&rdquo;
                        </p>
                        <footer className="text-sm">Arcadis Technologies</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Pane: Form (full width on mobile) */}
            <div className="relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
                <div className="absolute top-4 right-4">
                    <ThemeSwitcher />
                </div>
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;