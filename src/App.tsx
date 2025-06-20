// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/hooks/useToast';
import { ThemeProvider } from "@/components/theme/ThemeProvider";

import Layout from '@/components/layout/Layout';
import AuthLayout from '@/components/layout/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import UpdatePasswordPage from '@/pages/UpdatePassword';
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
    children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) return null; // Or a loading spinner
    return user ? children : <Navigate to="/login" replace />;
};

// --- Définition de AdminRoute ---
interface AdminRouteProps {
    children: React.ReactElement;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) return null; // Or a loading spinner
    if (!user) return <Navigate to="/login" replace />;
    return user.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
};


// --- Composant principal des routes ---
function AppRoutes() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-arcadis-orange"></div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Public routes with AuthLayout */}
            <Route
                path="/login"
                element={
                    user ? (
                        <Navigate to="/dashboard" replace />
                    ) : (
                        <AuthLayout>
                            <LoginForm />
                        </AuthLayout>
                    )
                }
            />
            <Route
                path="/forgot-password"
                element={
                    user ? (
                        <Navigate to="/dashboard" replace />
                    ) : (
                        <AuthLayout>
                            <ForgotPasswordForm />
                        </AuthLayout>
                    )
                }
            />
            <Route
                path="/update-password"
                element={
                    <AuthLayout>
                        <UpdatePasswordPage />
                    </AuthLayout>
                }
            />

            {/* Redirect root to login or dashboard */}
            <Route
                path="/"
                element={
                    user ? (
                        <Navigate to="/dashboard" replace />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />

            {/* All protected routes are nested under the Layout route */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/devis" element={<DevisPage />} />
                <Route path="/factures" element={<FacturesPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/profile" element={<Profile />} />

                {/* Admin Routes */}
                <Route path="/admin/companies" element={<AdminRoute><Companies /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><Users /></AdminRoute>} />
                <Route path="/admin/devis" element={<AdminRoute><AdminDevisPage /></AdminRoute>} />
                <Route path="/admin/factures" element={<AdminRoute><AdminFacturesPage /></AdminRoute>} />
                <Route path="/admin/support" element={<AdminRoute><AdminSupportPage /></AdminRoute>} />
            </Route>

            {/* Not Found Route */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
                <ToastProvider>
                    <AuthProvider>
                        <AppRoutes />
                    </AuthProvider>
                </ToastProvider>
            </ThemeProvider>
        </Router>
    );
}

export default App;