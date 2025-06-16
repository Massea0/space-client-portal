
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { devisApi, invoicesApi, ticketsApi } from '@/services/api';
import { Devis, Invoice, Ticket } from '@/types';
import { 
  CreditCard, 
  FileText, 
  MessageSquare, 
  TrendingUp,
  Users,
  Building
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [devisList, setDevisList] = useState<Devis[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [devisData, invoicesData, ticketsData] = await Promise.all([
          user?.role === 'admin' ? devisApi.getAll() : devisApi.getByCompany(user?.companyId || ''),
          user?.role === 'admin' ? invoicesApi.getAll() : invoicesApi.getByCompany(user?.companyId || ''),
          user?.role === 'admin' ? ticketsApi.getAll() : ticketsApi.getByCompany(user?.companyId || '')
        ]);
        
        setDevisList(devisData);
        setInvoices(invoicesData);
        setTickets(ticketsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  // Calculate stats
  const pendingDevis = devisList.filter(d => d.status === 'pending').length;
  const totalDevisAmount = devisList.reduce((sum, d) => sum + d.amount, 0);
  const pendingInvoices = invoices.filter(i => i.status === 'pending').length;
  const totalInvoiceAmount = invoices.reduce((sum, i) => sum + i.amount, 0);
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

  // Recent activities
  const recentActivities = [
    ...devisList.slice(0, 2).map(d => ({
      id: d.id,
      type: 'devis' as const,
      title: d.object,
      description: `Devis ${d.number} - ${d.amount.toLocaleString()} FCFA`,
      date: d.createdAt,
      status: d.status
    })),
    ...invoices.slice(0, 2).map(i => ({
      id: i.id,
      type: 'invoice' as const,
      title: `Facture ${i.number}`,
      description: `${i.amount.toLocaleString()} FCFA`,
      date: i.createdAt,
      status: i.status
    })),
    ...tickets.slice(0, 2).map(t => ({
      id: t.id,
      type: 'ticket' as const,
      title: t.subject,
      description: `Ticket ${t.number}`,
      date: t.createdAt,
      status: t.status
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 6);

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} FCFA`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
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
        <h1 className="text-3xl font-bold text-slate-900">
          Tableau de Bord
        </h1>
        <p className="text-slate-600 mt-2">
          {user?.role === 'admin' 
            ? 'Vue d\'ensemble de tous les clients' 
            : `Bienvenue, ${user?.firstName} - ${user?.companyName}`
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user?.role === 'admin' ? (
          <>
            <StatsCard
              title="Total Entreprises"
              value="2"
              description="Clients actifs"
              icon={Building}
            />
            <StatsCard
              title="Utilisateurs"
              value="3"
              description="Comptes actifs"
              icon={Users}
            />
            <StatsCard
              title="Chiffre d'affaires"
              value={formatCurrency(totalInvoiceAmount)}
              description="Total facturé"
              icon={TrendingUp}
            />
            <StatsCard
              title="Tickets Ouverts"
              value={openTickets}
              description="Nécessitent une attention"
              icon={MessageSquare}
            />
          </>
        ) : (
          <>
            <StatsCard
              title="Devis en Attente"
              value={pendingDevis}
              description="Nécessitent votre réponse"
              icon={FileText}
            />
            <StatsCard
              title="Montant Total Devis"
              value={formatCurrency(totalDevisAmount)}
              description="Valeur des devis actifs"
              icon={TrendingUp}
            />
            <StatsCard
              title="Factures en Attente"
              value={pendingInvoices}
              description="À régler"
              icon={CreditCard}
            />
            <StatsCard
              title="Tickets Ouverts"
              value={openTickets}
              description="Support en cours"
              icon={MessageSquare}
            />
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={recentActivities} />
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Actions Rapides
          </h3>
          <div className="space-y-3">
            {user?.role === 'admin' ? (
              <>
                <button className="w-full p-3 text-left bg-arcadis-gradient-subtle rounded-lg hover:bg-arcadis-gradient hover:text-white transition-all duration-200">
                  <div className="font-medium">Créer un nouveau devis</div>
                  <div className="text-sm opacity-75">Ajouter un devis client</div>
                </button>
                <button className="w-full p-3 text-left bg-arcadis-gradient-subtle rounded-lg hover:bg-arcadis-gradient hover:text-white transition-all duration-200">
                  <div className="font-medium">Gérer les utilisateurs</div>
                  <div className="text-sm opacity-75">Administrer les comptes</div>
                </button>
              </>
            ) : (
              <>
                <button className="w-full p-3 text-left bg-arcadis-gradient-subtle rounded-lg hover:bg-arcadis-gradient hover:text-white transition-all duration-200">
                  <div className="font-medium">Créer un ticket de support</div>
                  <div className="text-sm opacity-75">Obtenir de l'aide</div>
                </button>
                <button className="w-full p-3 text-left bg-arcadis-gradient-subtle rounded-lg hover:bg-arcadis-gradient hover:text-white transition-all duration-200">
                  <div className="font-medium">Voir mes devis en attente</div>
                  <div className="text-sm opacity-75">Approuver ou rejeter</div>
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
