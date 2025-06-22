// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/context/AuthContext';
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
import { Toaster } from '@/components/ui/sonner';

const queryClient = new QueryClient();

const LoadingScreen = () => (
    <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
    </div>
);

interface ProtectedRouteProps {
    children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) return <LoadingScreen />;
    return user ? children : <Navigate to="/login" replace />;
};

interface AdminRouteProps {
    children: React.ReactElement;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) return <LoadingScreen />;
    if (!user) return <Navigate to="/login" replace />;
    return user.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <AuthLayout><LoginForm /></AuthLayout>} />
            <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" replace /> : <AuthLayout><ForgotPasswordForm /></AuthLayout>} />
            <Route path="/update-password" element={<AuthLayout><UpdatePasswordPage /></AuthLayout>} />

            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/" element={<Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/devis" element={<DevisPage />} />
                <Route path="/factures" element={<FacturesPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/profile" element={<Profile />} />
            </Route>

            <Route element={<AdminRoute><Layout /></AdminRoute>}>
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/companies" element={<Companies />} />
                <Route path="/admin/users" element={<Users />} />
                <Route path="/admin/devis" element={<AdminDevisPage />} />
                <Route path="/admin/factures" element={<AdminFacturesPage />} />
                <Route path="/admin/support" element={<AdminSupportPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}


function App() {
    return (
        <Router>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
                    <AuthProvider>
                        <AppRoutes />
                    </AuthProvider>
                    <Toaster />
                </ThemeProvider>
            </QueryClientProvider>
        </Router>
    );
}

export default App;