// src/App.tsx
import React from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/hooks/useToast';
import { ThemeProvider } from "@/components/theme/ThemeProvider"; // AJOUTÉ

import Layout from '@/components/layout/Layout';
import LoginForm from '@/components/auth/LoginForm';
import Dashboard from '@/pages/Dashboard';
import DevisPage from '@/pages/Devis';
import FacturesPage from '@/pages/Factures';
import SupportPage from '@/pages/Support';
import Profile from '@/pages/Profile';

import Companies from '@/pages/admin/Companies';
import Users from '@/pages/admin/Users';
import AdminDevisPage from '@/pages/admin/AdminDevis';
import AdminFacturesPage from '@/pages/admin/AdminFactures';
import AdminSupportPage from '@/pages/admin/AdminSupport';

import NotFound from '@/pages/NotFound';

// --- Définition de ProtectedRoute ---
interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arcadis-orange"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

// --- Définition de AdminRoute ---
interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { user, isLoading: authIsLoading } = useAuth();

    if (authIsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arcadis-orange"></div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        console.log('[AdminRoute] Access denied. User role:', user?.role);
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};


// --- Composant principal des routes ---
function AppRoutes() {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arcadis-orange"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    if (location.pathname === '/login') {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <Layout>
            <Routes>
                {/* Routes Utilisateur Standard (Clients) */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/devis" element={<ProtectedRoute><DevisPage /></ProtectedRoute>} />
                <Route path="/factures" element={<ProtectedRoute><FacturesPage /></ProtectedRoute>} />
                <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                {/* Routes Admin */}
                <Route path="/admin/companies" element={<ProtectedRoute><AdminRoute><Companies /></AdminRoute></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute><AdminRoute><Users /></AdminRoute></ProtectedRoute>} />
                <Route path="/admin/devis" element={<ProtectedRoute><AdminRoute><AdminDevisPage /></AdminRoute></ProtectedRoute>} />
                <Route path="/admin/factures" element={<ProtectedRoute><AdminRoute><AdminFacturesPage /></AdminRoute></ProtectedRoute>} />
                <Route path="/admin/support" element={<ProtectedRoute><AdminRoute><AdminSupportPage /></AdminRoute></ProtectedRoute>} />

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Layout>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem> {/* AJOUTÉ */}
                    <ToastProvider>
                        <AppRoutes />
                    </ToastProvider>
                </ThemeProvider> {/* AJOUTÉ */}
            </AuthProvider>
        </Router>
    );
}

export default App;