
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/hooks/useToast';
import Layout from '@/components/layout/Layout';
import LoginForm from '@/components/auth/LoginForm';
import Dashboard from '@/pages/Dashboard';
import Devis from '@/pages/Devis';
import Factures from '@/pages/Factures';
import Support from '@/pages/Support';
import Companies from '@/pages/admin/Companies';
import NotFound from '@/pages/NotFound';
import { useAuth } from '@/context/AuthContext';

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
  const { user } = useAuth();
  
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/devis" element={
          <ProtectedRoute>
            <Devis />
          </ProtectedRoute>
        } />
        <Route path="/factures" element={
          <ProtectedRoute>
            <Factures />
          </ProtectedRoute>
        } />
        <Route path="/support" element={
          <ProtectedRoute>
            <Support />
          </ProtectedRoute>
        } />
        <Route path="/admin/companies" element={
          <ProtectedRoute>
            <AdminRoute>
              <Companies />
            </AdminRoute>
          </ProtectedRoute>
        } />
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
