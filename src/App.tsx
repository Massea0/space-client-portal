// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/hooks/useToast';
import Layout from '@/components/layout/Layout';
import LoginForm from '@/components/auth/LoginForm';
import Dashboard from '@/pages/Dashboard';
import Devis from '@/pages/Devis';
import Factures from '@/pages/Factures';
import Support from '@/pages/Support';
import Companies from '@/pages/admin/Companies';
import Users from '@/pages/admin/Users';
import AdminDevis from '@/pages/admin/AdminDevis';
import AdminFactures from '@/pages/admin/AdminFactures';
import AdminSupport from '@/pages/admin/AdminSupport';
import NotFound from '@/pages/NotFound';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arcadis-orange"></div>
        </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arcadis-orange"></div>
        </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

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
    // Utilisateur non authentifié
    return (
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
  }

  // Utilisateur authentifié
  if (location.pathname === "/login") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
      <Layout>
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/devis" element={<ProtectedRoute><Devis /></ProtectedRoute>} />
          <Route path="/factures" element={<ProtectedRoute><Factures /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />

          <Route path="/admin/companies" element={<ProtectedRoute><AdminRoute><Companies /></AdminRoute></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><AdminRoute><Users /></AdminRoute></ProtectedRoute>} />
          <Route path="/admin/devis" element={<ProtectedRoute><AdminRoute><AdminDevis /></AdminRoute></ProtectedRoute>} />
          <Route path="/admin/factures" element={<ProtectedRoute><AdminRoute><AdminFactures /></AdminRoute></ProtectedRoute>} />
          <Route path="/admin/support" element={<ProtectedRoute><AdminRoute><AdminSupport /></AdminRoute></ProtectedRoute>} />

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
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </Router>
  );
}

export default App;
    