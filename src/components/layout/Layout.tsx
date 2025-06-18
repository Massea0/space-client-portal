// src/components/layout/Layout.tsx
import React from 'react';
// MODIFIÉ ICI: Importer 'Sidebar' comme un export nommé et l'utiliser comme fournisseur.
import { Sidebar } from '@/components/ui/sidebar';
import AppSidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
      // MODIFIÉ ICI: Utiliser <Sidebar> au lieu de <SidebarProvider>
      <Sidebar>
        <div className="min-h-screen flex w-full bg-background text-foreground"> {/* Utilisation des variables de thème Tailwind */}
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 p-4 sm:p-6 md:p-8 bg-background"> {/* Utilisation des variables de thème et padding ajusté */}
              <div className="max-w-full sm:max-w-7xl mx-auto"> {/* max-w-full pour mobile, 7xl pour plus grand */}
                {children}
              </div>
            </main>
          </div>
        </div>
      </Sidebar>
  );
};

export default Layout;