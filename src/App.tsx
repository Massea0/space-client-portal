
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";
import LoginForm from "@/components/auth/LoginForm";
import Dashboard from "@/pages/Dashboard";
import Factures from "@/pages/Factures";
import DevisPage from "@/pages/Devis";
import Support from "@/pages/Support";
import Companies from "@/pages/admin/Companies";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-arcadis-blue-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <LoginForm />;
  }
  
  return <Layout>{children}</Layout>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/factures" element={
        <ProtectedRoute>
          <Factures />
        </ProtectedRoute>
      } />
      <Route path="/devis" element={
        <ProtectedRoute>
          <DevisPage />
        </ProtectedRoute>
      } />
      <Route path="/support" element={
        <ProtectedRoute>
          <Support />
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin/companies" element={
        <ProtectedRoute>
          <AdminRoute>
            <Companies />
          </AdminRoute>
        </ProtectedRoute>
      } />
      <Route path="/admin/factures" element={
        <ProtectedRoute>
          <AdminRoute>
            <Factures />
          </AdminRoute>
        </ProtectedRoute>
      } />
      <Route path="/admin/devis" element={
        <ProtectedRoute>
          <AdminRoute>
            <DevisPage />
          </AdminRoute>
        </ProtectedRoute>
      } />
      <Route path="/admin/support" element={
        <ProtectedRoute>
          <AdminRoute>
            <Support />
          </AdminRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
