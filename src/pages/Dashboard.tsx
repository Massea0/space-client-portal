// src/pages/Dashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { devisApi, invoicesApi, ticketsApi, companiesApi, usersApi } from '@/services/api';
import { Devis, Invoice, Ticket } from '@/types';
import {
  CreditCard,
  FileText,
  MessageSquare,
  TrendingUp,
  Users,
  Building,
  PlusCircle,
  Eye,
  ClipboardList
} from 'lucide-react';
import { toast } from 'sonner'; // MODIFIÉ: Import de toast depuis sonner
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // const { toast } = useToast(); // SUPPRIMÉ: Plus besoin du hook useToast
  const [devisList, setDevisList] = useState<Devis[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [companiesCount, setCompaniesCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const formatCurrencyLocal = (amount: number) => {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  };

  const loadDashboardData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const companyIdForRequests = user.companyId ?? '';

      const [devisData, invoicesData, ticketsData] = await Promise.all([
        user.role === 'admin' ? devisApi.getAll() : devisApi.getByCompany(companyIdForRequests),
        user.role === 'admin' ? invoicesApi.getAll() : invoicesApi.getByCompany(companyIdForRequests),
        user.role === 'admin' ? ticketsApi.getAll() : ticketsApi.getByCompany(companyIdForRequests)
      ]);

      setDevisList(devisData);
      setInvoices(invoicesData);
      setTickets(ticketsData);

      if (user.role === 'admin') {
        const [companiesData, usersData] = await Promise.all([
          companiesApi.getAll(),
          usersApi.getAll()
        ]);
        setCompaniesCount(companiesData.length);
        setUsersCount(usersData.length);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Erreur de chargement', { // MODIFIÉ: Appel direct à toast.error
        description: 'Impossible de charger les données du tableau de bord.',
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const pendingDevis = devisList.filter(d => d.status === 'pending' || d.status === 'sent').length;
  const totalDevisAmount = devisList.filter(d => d.status !== 'rejected' && d.status !== 'expired').reduce((sum, d) => sum + d.amount, 0);
  const pendingInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').length;
  const totalInvoiceAmount = invoices.filter(i => i.status !== 'cancelled').reduce((sum, i) => sum + i.amount, 0);
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress' || t.status === 'pending_admin_response' || t.status === 'pending_client_response').length;

  const recentActivities = [
    ...devisList.slice(0, 3).map(d => ({
      id: d.id,
      type: 'devis' as const,
      title: d.object,
      description: `Devis ${d.number} - ${formatCurrencyLocal(d.amount)}`,
      date: new Date(d.createdAt),
      status: d.status
    })),
    ...invoices.slice(0, 3).map(i => ({
      id: i.id,
      type: 'invoice' as const,
      title: `Facture ${i.number}`,
      description: `${formatCurrencyLocal(i.amount)}`,
      date: new Date(i.createdAt),
      status: i.status
    })),
    ...tickets.slice(0, 3).map(t => ({
      id: t.id,
      type: 'ticket' as const,
      title: t.subject,
      description: `Ticket ${t.number}`,
      date: new Date(t.createdAt),
      status: t.status
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  const handleCreateDevis = () => {
    navigate('/admin/devis', { state: { openCreateDevisDialog: true } });
  };

  const handleManageUsers = () => {
    navigate('/admin/users');
  };

  const handleCreateTicket = () => {
    navigate('/support', { state: { openCreateTicketDialog: true } });
  };

  const handleViewPendingDevis = () => {
    navigate('/devis');
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arcadis-orange mx-auto"></div>
            <p className="mt-4 text-slate-600">Chargement du tableau de bord...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Tableau de Bord
          </h1>
          <p className="text-muted-foreground mt-2">
            {user?.role === 'admin'
                ? 'Vue d\'ensemble de l\'activité du portail.'
                : `Bienvenue, ${user?.firstName} ${user?.lastName} !`
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {user?.role === 'admin' ? (
              <>
                <StatsCard
                    title="Total Entreprises"
                    value={companiesCount.toString()}
                    description="Clients actifs"
                    icon={Building}
                    onClick={() => navigate('/admin/companies')}
                />
                <StatsCard
                    title="Utilisateurs Actifs"
                    value={usersCount.toString()}
                    description="Comptes enregistrés"
                    icon={Users}
                    onClick={() => navigate('/admin/users')}
                />
                <StatsCard
                    title="Chiffre d'affaires (Facturé)"
                    value={formatCurrencyLocal(totalInvoiceAmount)}
                    description="Total des factures non annulées"
                    icon={TrendingUp}
                    onClick={() => navigate('/admin/factures')}
                />
                <StatsCard
                    title="Tickets Ouverts"
                    value={openTickets.toString()}
                    description="Nécessitent une attention"
                    icon={MessageSquare}
                    onClick={() => navigate('/admin/support')}
                />
              </>
          ) : (
              <>
                <StatsCard
                    title="Devis en Attente"
                    value={pendingDevis.toString()}
                    description="Nécessitent votre réponse"
                    icon={FileText}
                    onClick={() => navigate('/devis')}
                />
                <StatsCard
                    title="Montant Total Devis"
                    value={formatCurrencyLocal(totalDevisAmount)}
                    description="Valeur des devis actifs"
                    icon={TrendingUp}
                    onClick={() => navigate('/devis')}
                />
                <StatsCard
                    title="Factures en Attente"
                    value={pendingInvoices.toString()}
                    description="À régler"
                    icon={CreditCard}
                    onClick={() => navigate('/factures')}
                />
                <StatsCard
                    title="Tickets Ouverts"
                    value={openTickets.toString()}
                    description="Support en cours"
                    icon={MessageSquare}
                    onClick={() => navigate('/support')}
                />
              </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* MODIFIÉ ICI: Ajout de la prop userRole */}
            <RecentActivity activities={recentActivities} userRole={user?.role} />
          </div>

          <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">
              Actions Rapides
            </h3>
            <div className="space-y-3">
              {user?.role === 'admin' ? (
                  <>
                    <button
                        onClick={handleCreateDevis}
                        className="w-full p-3 text-left bg-background hover:bg-muted rounded-lg transition-all duration-200 flex items-center gap-3 border border-border hover:border-primary/50"
                    >
                      <PlusCircle className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium text-foreground">Créer un devis</div>
                        <div className="text-sm text-muted-foreground">Générer une nouvelle proposition</div>
                      </div>
                    </button>
                    <button
                        onClick={() => navigate('/admin/devis')}
                        className="w-full p-3 text-left bg-background hover:bg-muted rounded-lg transition-all duration-200 flex items-center gap-3 border border-border hover:border-primary/50"
                    >
                      <ClipboardList className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium text-foreground">Gérer les Devis</div>
                        <div className="text-sm text-muted-foreground">Consulter et administrer les devis</div>
                      </div>
                    </button>
                    <button
                        onClick={() => navigate('/admin/factures', { state: { openCreateFactureDialog: true }})}
                        className="w-full p-3 text-left bg-background hover:bg-muted rounded-lg transition-all duration-200 flex items-center gap-3 border border-border hover:border-primary/50"
                    >
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium text-foreground">Créer une facture</div>
                        <div className="text-sm text-muted-foreground">Émettre une nouvelle facture</div>
                      </div>
                    </button>
                    <button
                        onClick={handleManageUsers}
                        className="w-full p-3 text-left bg-background hover:bg-muted rounded-lg transition-all duration-200 flex items-center gap-3 border border-border hover:border-primary/50"
                    >
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium text-foreground">Gérer les utilisateurs</div>
                        <div className="text-sm text-muted-foreground">Administrer les comptes</div>
                      </div>
                    </button>
                  </>
              ) : (
                  <>
                    <button
                        onClick={handleCreateTicket}
                        className="w-full p-3 text-left bg-background hover:bg-muted rounded-lg transition-all duration-200 flex items-center gap-3 border border-border hover:border-primary/50"
                    >
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium text-foreground">Ouvrir un ticket</div>
                        <div className="text-sm text-muted-foreground">Demander de l'assistance</div>
                      </div>
                    </button>
                    <button
                        onClick={handleViewPendingDevis}
                        className="w-full p-3 text-left bg-background hover:bg-muted rounded-lg transition-all duration-200 flex items-center gap-3 border border-border hover:border-primary/50"
                    >
                      <Eye className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium text-foreground">Voir mes devis</div>
                        <div className="text-sm text-muted-foreground">Consulter vos propositions</div>
                      </div>
                    </button>
                    <button
                        onClick={() => navigate('/factures')}
                        className="w-full p-3 text-left bg-background hover:bg-muted rounded-lg transition-all duration-200 flex items-center gap-3 border border-border hover:border-primary/50"
                    >
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium text-foreground">Voir mes factures</div>
                        <div className="text-sm text-muted-foreground">Suivre vos paiements</div>
                      </div>
                    </button>
                  </>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default Dashboard;