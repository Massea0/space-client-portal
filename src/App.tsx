import React, { lazy, Suspense, useEffect } from 'react';
import { 
    BrowserRouter as Router, 
    Routes, 
    Route, 
    Navigate, 
    Outlet, 
    createBrowserRouter, 
    RouterProvider 
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { setupDiagnostics } from '@/lib/diagnostics';
import AppLayout from '@/components/layout/AppLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
// Nous utilisons maintenant notre propre système de toast
// import { Toaster } from '@/components/ui/sonner';
import NotificationProvider from '@/providers/NotificationProvider';
import ConnectionStatusIndicator from '@/components/ui/ConnectionStatusIndicator';
// Import du nouveau système de toast
import { ToastProvider } from '@/hooks/use-toast';

// Chargement paresseux des pages principales
const UpdatePasswordPage = lazy(() => import('@/pages/UpdatePassword'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const DevisPage = lazy(() => import('@/pages/Devis'));
const FacturesPage = lazy(() => import('@/pages/Factures'));
const SupportPage = lazy(() => import('@/pages/Support'));
const Profile = lazy(() => import('@/pages/Profile'));
const AnimationShowcase = lazy(() => import('@/pages/AnimationShowcase'));
const DesignSystemShowcase = lazy(() => import('@/pages/design-system-showcase'));

// Nouvelles pages de création
const FacturesNew = lazy(() => import('@/pages/FacturesNew'));
const DevisNew = lazy(() => import('@/pages/DevisNew'));

// Composants de test pour debugging
const EmployeeTestComponent = lazy(() => import('@/components/debug/EmployeeTestComponent'));
const ScrollTestComponent = lazy(() => import('@/components/debug/ScrollTestComponent'));
const RLSValidationComponent = lazy(() => import('@/components/debug/RLSValidationComponent'));

// Pages Analytics 
const Analytics = lazy(() => import('@/pages/Analytics'));
const AnalyticsPredictions = lazy(() => import('@/pages/AnalyticsPredictions'));
const AnalyticsRisks = lazy(() => import('@/pages/AnalyticsRisks'));
const AnalyticsEfficiency = lazy(() => import('@/pages/AnalyticsEfficiency'));
const AnalyticsOpportunities = lazy(() => import('@/pages/AnalyticsOpportunities'));

// Pages Projets
const ProjectsPage = lazy(() => import('@/pages/projects/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('@/pages/projects/ProjectDetailPage'));

// Pages RH
const HRDashboard = lazy(() => import('@/pages/hr/HRDashboard'));
const HREmployeeListPage = lazy(() => import('@/pages/hr/EmployeeListPage'));
const HREmployeeDetailPage = lazy(() => import('@/pages/hr/employees/EmployeeDetailPage'));
const HREmployeeFormPage = lazy(() => import('@/pages/hr/employees/EmployeeFormPage'));
const HRDepartmentListPage = lazy(() => import('@/pages/hr/DepartmentsPage'));
const HROrganizationPage = lazy(() => import('@/pages/hr/OrganizationPage'));
const HRAnalyticsPage = lazy(() => import('@/pages/hr/HRAnalyticsPage'));

// Chargement paresseux des pages admin
const Companies = lazy(() => import('@/pages/admin/Companies'));
const CompanyDetail = lazy(() => import('@/pages/admin/CompanyDetail'));
const Users = lazy(() => import('@/pages/admin/Users'));
const AdminDevisPage = lazy(() => import('@/pages/admin/AdminDevis'));
const AdminFacturesPage = lazy(() => import('@/pages/admin/AdminFactures'));
const AdminSupportPage = lazy(() => import('@/pages/admin/AdminSupport'));
const AdminReferenceQuotes = lazy(() => import('@/pages/admin/AdminReferenceQuotes'));
const AdminContracts = lazy(() => import('@/pages/admin/AdminContracts')); // Mission 1: Gestion des contrats IA

// Nouvelles pages admin
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));
const AdminDashboardCFO = lazy(() => import('@/pages/AdminDashboardCFO'));
const AdminRapports = lazy(() => import('@/pages/AdminRapports'));

// Chargement paresseux des pages auxiliaires
const NotFound = lazy(() => import('@/pages/NotFound'));
const PaymentSuccess = lazy(() => import('@/pages/PaymentSuccess'));
const PaymentCancel = lazy(() => import('@/pages/PaymentCancel'));
const PaymentCallback = lazy(() => import('@/pages/PaymentCallback'));
const TestPolling = lazy(() => import('@/pages/TestPolling'));
const TestMarkPaid = lazy(() => import('@/pages/TestMarkPaid'));
const TestAutoPayment = lazy(() => import('@/pages/TestAutoPayment'));

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
    const location = window.location;
    
    React.useEffect(() => {
        // Si nous ne sommes pas en train de charger et qu'aucun utilisateur n'est connecté,
        // sauvegarder l'URL actuelle pour y revenir après connexion
        if (!isLoading && !user) {
            // Import depuis AuthContext
            import('@/context/AuthContext').then(({ saveLastVisitedUrl }) => {
                saveLastVisitedUrl(location.pathname + location.search);
            });
        }
    }, [isLoading, user, location.pathname, location.search]);
    
    // Pendant le chargement, montrer un écran de chargement
    // Cela évite un flash de redirection vers la page de login
    if (isLoading) {
        return <LoadingScreen />;
    }
    
    // Si l'utilisateur est authentifié, montrer le contenu protégé
    if (user) {
        return children;
    }
    
    // Si l'utilisateur n'est pas authentifié après le chargement, rediriger vers login
    // Pas besoin de passer state car saveLastVisitedUrl est déjà appelé plus haut
    return <Navigate to="/login" replace />;
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
            <Route path="/login" element={<AuthLayout><LoginForm /></AuthLayout>} />
            <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" replace /> : <AuthLayout><ForgotPasswordForm /></AuthLayout>} />
            <Route path="/update-password" element={
                <AuthLayout>
                    <Suspense fallback={<LoadingScreen />}>
                        <UpdatePasswordPage />
                    </Suspense>
                </AuthLayout>
            } />

            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/" element={<Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />} />
                <Route path="/dashboard" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <Dashboard />
                    </Suspense>
                } />
                <Route path="/design-system" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <DesignSystemShowcase />
                    </Suspense>
                } />
                <Route path="/devis" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <DevisPage />
                    </Suspense>
                } />
                <Route path="/devis/new" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <DevisNew />
                    </Suspense>
                } />
                <Route path="/factures" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <FacturesPage />
                    </Suspense>
                } />
                <Route path="/factures/new" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <FacturesNew />
                    </Suspense>
                } />
                <Route path="/analytics" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <Analytics />
                    </Suspense>
                } />
                <Route path="/analytics/predictions" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <AnalyticsPredictions />
                    </Suspense>
                } />
                <Route path="/analytics/risks" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <AnalyticsRisks />
                    </Suspense>
                } />
                <Route path="/analytics/efficiency" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <AnalyticsEfficiency />
                    </Suspense>
                } />
                <Route path="/analytics/opportunities" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <AnalyticsOpportunities />
                    </Suspense>
                } />
                <Route path="/projects" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <ProjectsPage />
                    </Suspense>
                } />
                <Route path="/projects/:id" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <ProjectDetailPage />
                    </Suspense>
                } />
                
                {/* Routes RH */}
                <Route path="/hr" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <HRDashboard />
                    </Suspense>
                } />
                <Route path="/hr/employees" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <HREmployeeListPage />
                    </Suspense>
                } />
                <Route path="/hr/employees/new" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <HREmployeeFormPage />
                    </Suspense>
                } />
                <Route path="/hr/employees/:id" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <HREmployeeDetailPage />
                    </Suspense>
                } />
                <Route path="/hr/employees/:id/edit" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <HREmployeeFormPage />
                    </Suspense>
                } />
                
                {/* Routes de test temporaires */}
                <Route path="/test/employees" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <EmployeeTestComponent />
                    </Suspense>
                } />
                <Route path="/test/scroll" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <ScrollTestComponent />
                    </Suspense>
                } />
                <Route path="/test/rls-validation" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <RLSValidationComponent />
                    </Suspense>
                } />
                
                <Route path="/hr/departments" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <HRDepartmentListPage />
                    </Suspense>
                } />
                <Route path="/hr/organization" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <HROrganizationPage />
                    </Suspense>
                } />
                <Route path="/hr/analytics" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <HRAnalyticsPage />
                    </Suspense>
                } />
                
                <Route path="/support" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <SupportPage />
                    </Suspense>
                } />
                <Route path="/profile" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <Profile />
                    </Suspense>
                } />
                <Route path="/animation-showcase" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <AnimationShowcase />
                    </Suspense>
                } />
                {/* Routes de paiement */}
                <Route path="/payment/success" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <PaymentSuccess />
                    </Suspense>
                } />
                <Route path="/payment/cancel" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <PaymentCancel />
                    </Suspense>
                } />
                {/* Route de test */}
                <Route path="/test-polling" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <TestPolling />
                    </Suspense>
                } />
            </Route>

            <Route element={<AdminRoute><AppLayout /></AdminRoute>}>
                <Route path="/admin/dashboard" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <Dashboard />
                    </Suspense>
                } />
                <Route path="/admin/companies" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <Companies />
                    </Suspense>
                } />
                <Route path="/admin/companies/:companyId" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <CompanyDetail />
                    </Suspense>
                } />
                <Route path="/admin/users" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <Users />
                    </Suspense>
                } />
                <Route path="/admin/devis" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <AdminDevisPage />
                    </Suspense>
                } />
                <Route path="/admin/factures" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <AdminFacturesPage />
                    </Suspense>
                } />
                <Route path="/admin/support" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <AdminSupportPage />
                    </Suspense>
                } />
                <Route path="/admin/animations" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <AnimationShowcase />
                    </Suspense>
                } />
                <Route path="/admin/design-system" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <DesignSystemShowcase />
                    </Suspense>
                } />
                <Route path="/admin/reference-quotes" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <AdminReferenceQuotes />
                    </Suspense>
                } />
                <Route path="/admin/contracts" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <AdminContracts />
                    </Suspense>
                } />
                <Route path="/admin/settings" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <AdminSettings />
                    </Suspense>
                } />
                <Route path="/admin/dashboard-cfo" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <AdminDashboardCFO />
                    </Suspense>
                } />
                <Route path="/admin/rapports" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <AdminRapports />
                    </Suspense>
                } />
                <Route path="/admin/factures/new" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <FacturesNew />
                    </Suspense>
                } />
                <Route path="/admin/devis/new" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <DevisNew />
                    </Suspense>
                } />
                <Route path="/admin/analytics" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <Analytics />
                    </Suspense>
                } />
                <Route path="/admin/analytics/predictions" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <AnalyticsPredictions />
                    </Suspense>
                } />
                <Route path="/admin/analytics/risks" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <AnalyticsRisks />
                    </Suspense>
                } />
                <Route path="/admin/analytics/efficiency" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <AnalyticsEfficiency />
                    </Suspense>
                } />
                <Route path="/admin/analytics/opportunities" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <AnalyticsOpportunities />
                    </Suspense>
                } />
            </Route>

            {/* Routes de paiement - accessibles sans authentification */}
            <Route path="/payment/success" element={
                <Suspense fallback={<LoadingScreen />}>
                    <PaymentSuccess />
                </Suspense>
            } />
            <Route path="/payment/cancel" element={
                <Suspense fallback={<LoadingScreen />}>
                    <PaymentCancel />
                </Suspense>
            } />
            <Route path="/payment/callback" element={
                <Suspense fallback={<LoadingScreen />}>
                    <PaymentCallback />
                </Suspense>
            } />
            
            {/* Routes de test - accessible sans authentification */}
            <Route path="/test-mark-paid" element={
                <Suspense fallback={<LoadingScreen />}>
                    <TestMarkPaid />
                </Suspense>
            } />
            
            <Route path="/test-auto-payment" element={
                <Suspense fallback={<LoadingScreen />}>
                    <TestAutoPayment />
                </Suspense>
            } />

            <Route path="*" element={
                <Suspense fallback={<LoadingScreen />}>
                    <NotFound />
                </Suspense>
            } />
        </Routes>
    );
}


// Note sur les avertissements React Router v7:
// Les avertissements concernant v7_startTransition et v7_relativeSplatPath
// seront résolus lors de la mise à jour vers React Router v7 ou en configurant correctement
// le futur routeur avec createBrowserRouter. Pour l'instant, nous gardons le routeur actuel.

function App() {
    // Initialiser les outils de diagnostic
    useEffect(() => {
        // Configuration pour limiter les requêtes en boucle
        setupDiagnostics();
        
        // Configuration du client React Query pour éviter les requêtes excessives
        queryClient.setDefaultOptions({
            queries: {
                refetchOnWindowFocus: false, // Désactiver le refetch automatique lors du focus de la fenêtre
                retry: 1, // Limiter les tentatives de nouvelle requête en cas d'échec
                staleTime: 30000, // Considérer les données comme "fraîches" pendant 30 secondes
                gcTime: 5 * 60 * 1000 // Garder les données en cache pendant 5 minutes avant le garbage collection
            },
        });
    }, []);
    
    return (
        <Router 
            future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
            }}
        >
            <QueryClientProvider client={queryClient}>
                <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
                    <AuthProvider>
                        <SettingsProvider>
                            <ToastProvider>
                                <NotificationProvider>
                                    <ConnectionStatusIndicator />
                                    <AppRoutes />
                                </NotificationProvider>
                            </ToastProvider>
                        </SettingsProvider>
                    </AuthProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </Router>
    );
}

export default App;