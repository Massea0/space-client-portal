import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

interface PaymentStats {
  date: string;
  total_payments: number;
  wave_payments: number;
  successful_payments: number;
  failed_payments: number;
  total_amount: number;
  wave_amount: number;
  auto_marked_count: number;
  webhook_received_count: number;
  success_rate: number;
  average_amount: number;
}

interface PaymentAlert {
  id: string;
  type: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  metadata: any;
  resolved: boolean;
  created_at: string;
}

interface DashboardData {
  today_stats: PaymentStats;
  week_stats: PaymentStats[];
  month_stats: PaymentStats[];
  recent_alerts: PaymentAlert[];
  system_health: {
    webhook_reliability: number;
    auto_marking_success_rate: number;
    payment_success_rate: number;
    last_webhook_received: string | null;
    last_successful_payment: string | null;
  };
  trends: {
    daily_growth: number;
    weekly_growth: number;
    monthly_growth: number;
  };
}

async function getPaymentStatistics(supabase: any, period: 'today' | 'week' | 'month'): Promise<PaymentStats[]> {
  let startDate: string;
  const today = new Date();
  
  switch (period) {
    case 'today':
      startDate = today.toISOString().split('T')[0];
      break;
    case 'week':
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      startDate = weekAgo.toISOString().split('T')[0];
      break;
    case 'month':
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDate = monthAgo.toISOString().split('T')[0];
      break;
  }

  const { data, error } = await supabase
    .from('payment_statistics')
    .select('*')
    .gte('date', startDate)
    .order('date', { ascending: true });

  if (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return [];
  }

  return data.map((stat: any) => ({
    ...stat,
    success_rate: stat.total_payments > 0 ? (stat.successful_payments / stat.total_payments) * 100 : 0,
    average_amount: stat.total_payments > 0 ? stat.total_amount / stat.total_payments : 0
  }));
}

async function getRecentAlerts(supabase: any, limit: number = 10): Promise<PaymentAlert[]> {
  const { data, error } = await supabase
    .from('payment_alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Erreur lors de la récupération des alertes:', error);
    return [];
  }

  return data;
}

async function getSystemHealth(supabase: any): Promise<any> {
  try {
    // Récupérer les dernières transactions pour analyser la santé du système
    const { data: recentTransactions } = await supabase
      .from('payment_transactions')
      .select('created_at, status, updated_at')
      .order('created_at', { ascending: false })
      .limit(100);

    // Récupérer les webhooks des 24 dernières heures
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: recentStats } = await supabase
      .from('payment_statistics')
      .select('*')
      .gte('date', yesterday.toISOString().split('T')[0])
      .order('date', { ascending: false })
      .limit(7);

    // Calculs de santé du système
    const totalWebhooks = recentStats?.reduce((sum: number, stat: any) => sum + (stat.webhook_received_count || 0), 0) || 0;
    const totalSuccessful = recentStats?.reduce((sum: number, stat: any) => sum + (stat.successful_payments || 0), 0) || 0;
    const totalPayments = recentStats?.reduce((sum: number, stat: any) => sum + (stat.total_payments || 0), 0) || 0;
    const totalAutoMarked = recentStats?.reduce((sum: number, stat: any) => sum + (stat.auto_marked_count || 0), 0) || 0;

    // Dernière activité
    const lastWebhook = recentStats?.[0]?.updated_at || null;
    const lastPayment = recentTransactions?.find((tx: any) => tx.status === 'completed')?.updated_at || null;

    return {
      webhook_reliability: totalWebhooks > 0 ? (totalWebhooks / Math.max(totalPayments, 1)) * 100 : 0,
      auto_marking_success_rate: totalPayments > 0 ? (totalAutoMarked / totalPayments) * 100 : 0,
      payment_success_rate: totalPayments > 0 ? (totalSuccessful / totalPayments) * 100 : 0,
      last_webhook_received: lastWebhook,
      last_successful_payment: lastPayment
    };
  } catch (error) {
    console.error('Erreur lors du calcul de la santé du système:', error);
    return {
      webhook_reliability: 0,
      auto_marking_success_rate: 0,
      payment_success_rate: 0,
      last_webhook_received: null,
      last_successful_payment: null
    };
  }
}

async function calculateTrends(weekStats: PaymentStats[], monthStats: PaymentStats[]): Promise<any> {
  try {
    // Croissance quotidienne (aujourd'hui vs hier)
    const today = weekStats[weekStats.length - 1];
    const yesterday = weekStats[weekStats.length - 2];
    const dailyGrowth = yesterday ? 
      ((today?.total_amount || 0) - (yesterday?.total_amount || 0)) / Math.max(yesterday?.total_amount || 1, 1) * 100 
      : 0;

    // Croissance hebdomadaire (7 derniers jours vs 7 jours précédents)
    const thisWeekAmount = weekStats.slice(-7).reduce((sum, stat) => sum + (stat?.total_amount || 0), 0);
    const lastWeekAmount = weekStats.slice(-14, -7).reduce((sum, stat) => sum + (stat?.total_amount || 0), 0);
    const weeklyGrowth = lastWeekAmount > 0 ? 
      (thisWeekAmount - lastWeekAmount) / lastWeekAmount * 100 
      : 0;

    // Croissance mensuelle (30 derniers jours vs 30 jours précédents)
    const thisMonthAmount = monthStats.slice(-30).reduce((sum, stat) => sum + (stat?.total_amount || 0), 0);
    const lastMonthAmount = monthStats.slice(-60, -30).reduce((sum, stat) => sum + (stat?.total_amount || 0), 0);
    const monthlyGrowth = lastMonthAmount > 0 ? 
      (thisMonthAmount - lastMonthAmount) / lastMonthAmount * 100 
      : 0;

    return {
      daily_growth: dailyGrowth,
      weekly_growth: weeklyGrowth,
      monthly_growth: monthlyGrowth
    };
  } catch (error) {
    console.error('Erreur lors du calcul des tendances:', error);
    return {
      daily_growth: 0,
      weekly_growth: 0,
      monthly_growth: 0
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('🚀 [PAYMENT-DASHBOARD] Génération du dashboard de paiement');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Récupérer toutes les données en parallèle pour optimiser les performances
    const [
      todayStats,
      weekStats, 
      monthStats,
      recentAlerts,
      systemHealth
    ] = await Promise.all([
      getPaymentStatistics(supabase, 'today'),
      getPaymentStatistics(supabase, 'week'),
      getPaymentStatistics(supabase, 'month'),
      getRecentAlerts(supabase, 15),
      getSystemHealth(supabase)
    ]);

    // Calculer les tendances
    const trends = await calculateTrends(weekStats, monthStats);

    // Construire les données du dashboard
    const dashboardData: DashboardData = {
      today_stats: todayStats[todayStats.length - 1] || {
        date: new Date().toISOString().split('T')[0],
        total_payments: 0,
        wave_payments: 0,
        successful_payments: 0,
        failed_payments: 0,
        total_amount: 0,
        wave_amount: 0,
        auto_marked_count: 0,
        webhook_received_count: 0,
        success_rate: 0,
        average_amount: 0
      },
      week_stats: weekStats,
      month_stats: monthStats,
      recent_alerts: recentAlerts,
      system_health: systemHealth,
      trends: trends
    };

    console.log('✅ [PAYMENT-DASHBOARD] Dashboard généré avec succès');
    console.log(`📊 [PAYMENT-DASHBOARD] Statistiques: ${dashboardData.today_stats.total_payments} paiements aujourd'hui`);
    console.log(`🚨 [PAYMENT-DASHBOARD] Alertes: ${recentAlerts.filter(alert => !alert.resolved).length} non résolues`);

    return new Response(JSON.stringify(dashboardData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('❌ [PAYMENT-DASHBOARD] Erreur:', error);
    return new Response(JSON.stringify({ 
      error: 'Erreur lors de la génération du dashboard',
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
