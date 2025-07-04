import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

interface AlertRule {
  type: string;
  condition: string;
  threshold: number;
  period: 'hour' | 'day' | 'week';
  severity: 'info' | 'warning' | 'error';
  message_template: string;
}

// Règles d'alerte configurables
const ALERT_RULES: AlertRule[] = [
  {
    type: 'high_failure_rate',
    condition: 'failed_payments / total_payments > threshold',
    threshold: 0.1, // 10% de taux d'échec
    period: 'hour',
    severity: 'warning',
    message_template: 'Taux d\'échec de paiement élevé: {failure_rate}% sur la dernière heure'
  },
  {
    type: 'no_payments',
    condition: 'total_payments = 0',
    threshold: 0,
    period: 'day',
    severity: 'warning',
    message_template: 'Aucun paiement reçu aujourd\'hui - Vérifier la connectivité'
  },
  {
    type: 'webhook_missing',
    condition: 'webhook_received_count = 0',
    threshold: 0,
    period: 'hour',
    severity: 'error',
    message_template: 'Aucun webhook reçu depuis 1 heure - Problème de connectivité possible'
  },
  {
    type: 'low_auto_marking',
    condition: 'auto_marked_count / successful_payments < threshold',
    threshold: 0.8, // 80% des paiements devraient être marqués automatiquement
    period: 'day',
    severity: 'warning',
    message_template: 'Taux de marquage automatique faible: {auto_rate}% - Vérifier le système de vérification Wave'
  },
  {
    type: 'unusual_amount_pattern',
    condition: 'average_amount > previous_average * threshold OR average_amount < previous_average / threshold',
    threshold: 2.0, // Montant moyen 2x plus élevé ou 2x plus faible que la normale
    period: 'day',
    severity: 'info',
    message_template: 'Motif de montant inhabituel détecté: montant moyen {current_average} vs {previous_average} précédent'
  }
];

async function getStatisticsForPeriod(supabase: any, period: 'hour' | 'day' | 'week'): Promise<any> {
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case 'hour':
      startDate = new Date(now.getTime() - 60 * 60 * 1000); // 1 heure
      break;
    case 'day':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 jour
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 semaine
      break;
  }

  // Pour les statistiques horaires, nous devons regarder les transactions individuelles
  if (period === 'hour') {
    const { data: transactions } = await supabase
      .from('payment_transactions')
      .select('status, amount, created_at, updated_at')
      .gte('created_at', startDate.toISOString());

    const totalPayments = transactions?.length || 0;
    const successfulPayments = transactions?.filter((t: any) => t.status === 'completed').length || 0;
    const failedPayments = transactions?.filter((t: any) => t.status === 'failed').length || 0;
    const totalAmount = transactions?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0;

    return {
      total_payments: totalPayments,
      successful_payments: successfulPayments,
      failed_payments: failedPayments,
      total_amount: totalAmount,
      auto_marked_count: 0, // TODO: Implémenter le suivi du marquage automatique
      webhook_received_count: 0, // TODO: Récupérer depuis les logs de webhook
      average_amount: totalPayments > 0 ? totalAmount / totalPayments : 0,
      failure_rate: totalPayments > 0 ? failedPayments / totalPayments : 0
    };
  }

  // Pour les périodes plus longues, utiliser la table payment_statistics
  const startDateStr = startDate.toISOString().split('T')[0];
  
  const { data: stats } = await supabase
    .from('payment_statistics')
    .select('*')
    .gte('date', startDateStr)
    .order('date', { ascending: true });

  if (!stats || stats.length === 0) {
    return {
      total_payments: 0,
      successful_payments: 0,
      failed_payments: 0,
      total_amount: 0,
      auto_marked_count: 0,
      webhook_received_count: 0,
      average_amount: 0,
      failure_rate: 0
    };
  }

  // Agréger les statistiques sur la période
  const aggregated = stats.reduce((acc: any, stat: any) => ({
    total_payments: acc.total_payments + (stat.total_payments || 0),
    successful_payments: acc.successful_payments + (stat.successful_payments || 0),
    failed_payments: acc.failed_payments + (stat.failed_payments || 0),
    total_amount: acc.total_amount + (stat.total_amount || 0),
    auto_marked_count: acc.auto_marked_count + (stat.auto_marked_count || 0),
    webhook_received_count: acc.webhook_received_count + (stat.webhook_received_count || 0)
  }), {
    total_payments: 0,
    successful_payments: 0,
    failed_payments: 0,
    total_amount: 0,
    auto_marked_count: 0,
    webhook_received_count: 0
  });

  return {
    ...aggregated,
    average_amount: aggregated.total_payments > 0 ? aggregated.total_amount / aggregated.total_payments : 0,
    failure_rate: aggregated.total_payments > 0 ? aggregated.failed_payments / aggregated.total_payments : 0,
    auto_rate: aggregated.successful_payments > 0 ? aggregated.auto_marked_count / aggregated.successful_payments : 0
  };
}

async function checkAlertRule(supabase: any, rule: AlertRule): Promise<boolean> {
  console.log(`🔍 [ALERT-CHECK] Vérification de la règle: ${rule.type}`);
  
  try {
    const currentStats = await getStatisticsForPeriod(supabase, rule.period);
    
    let shouldAlert = false;
    let alertData: any = {};

    switch (rule.type) {
      case 'high_failure_rate':
        shouldAlert = currentStats.failure_rate > rule.threshold;
        alertData = { 
          failure_rate: (currentStats.failure_rate * 100).toFixed(1),
          total_payments: currentStats.total_payments,
          failed_payments: currentStats.failed_payments
        };
        break;

      case 'no_payments':
        shouldAlert = currentStats.total_payments === 0;
        alertData = { period: rule.period };
        break;

      case 'webhook_missing':
        shouldAlert = currentStats.webhook_received_count === 0 && currentStats.total_payments > 0;
        alertData = { 
          expected_webhooks: currentStats.total_payments,
          received_webhooks: currentStats.webhook_received_count
        };
        break;

      case 'low_auto_marking':
        shouldAlert = currentStats.auto_rate < rule.threshold && currentStats.successful_payments > 0;
        alertData = {
          auto_rate: (currentStats.auto_rate * 100).toFixed(1),
          successful_payments: currentStats.successful_payments,
          auto_marked: currentStats.auto_marked_count
        };
        break;

      case 'unusual_amount_pattern':
        // Récupérer les statistiques de la période précédente pour comparaison
        const previousPeriodStart = new Date();
        switch (rule.period) {
          case 'hour':
            previousPeriodStart.setTime(previousPeriodStart.getTime() - 2 * 60 * 60 * 1000);
            break;
          case 'day':
            previousPeriodStart.setTime(previousPeriodStart.getTime() - 2 * 24 * 60 * 60 * 1000);
            break;
          case 'week':
            previousPeriodStart.setTime(previousPeriodStart.getTime() - 2 * 7 * 24 * 60 * 60 * 1000);
            break;
        }

        // Pour simplifier, nous comparons avec la moyenne historique
        const { data: historicalStats } = await supabase
          .from('payment_statistics')
          .select('total_amount, total_payments')
          .order('date', { ascending: false })
          .limit(30);

        if (historicalStats && historicalStats.length > 0) {
          const historicalAverage = historicalStats.reduce((sum: number, stat: any) => {
            return sum + (stat.total_payments > 0 ? stat.total_amount / stat.total_payments : 0);
          }, 0) / historicalStats.length;

          shouldAlert = currentStats.average_amount > historicalAverage * rule.threshold || 
                       currentStats.average_amount < historicalAverage / rule.threshold;
          
          alertData = {
            current_average: currentStats.average_amount.toFixed(2),
            previous_average: historicalAverage.toFixed(2),
            ratio: (currentStats.average_amount / Math.max(historicalAverage, 1)).toFixed(2)
          };
        }
        break;
    }

    if (shouldAlert) {
      console.log(`⚠️ [ALERT-CHECK] Alerte déclenchée pour ${rule.type}:`, alertData);
      
      // Vérifier si une alerte similaire non résolue existe déjà
      const { data: existingAlerts } = await supabase
        .from('payment_alerts')
        .select('id')
        .eq('type', rule.type)
        .eq('resolved', false)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Dernières 24h

      if (existingAlerts && existingAlerts.length > 0) {
        console.log(`ℹ️ [ALERT-CHECK] Alerte ${rule.type} déjà existante, pas de duplication`);
        return false;
      }

      // Créer l'alerte
      let message = rule.message_template;
      Object.keys(alertData).forEach(key => {
        message = message.replace(`{${key}}`, alertData[key]);
      });

      const { error } = await supabase
        .from('payment_alerts')
        .insert({
          type: rule.type,
          level: rule.severity,
          message: message,
          metadata: JSON.stringify({
            rule: rule,
            triggered_data: alertData,
            current_stats: currentStats,
            timestamp: new Date().toISOString()
          }),
          resolved: false
        });

      if (error) {
        console.error(`❌ [ALERT-CHECK] Erreur lors de la création de l'alerte:`, error);
        return false;
      }

      console.log(`✅ [ALERT-CHECK] Alerte ${rule.type} créée avec succès`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ [ALERT-CHECK] Erreur lors de la vérification de ${rule.type}:`, error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('🚀 [PAYMENT-ALERTS] Vérification automatique des alertes');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Vérifier toutes les règles d'alerte
    const alertResults = await Promise.allSettled(
      ALERT_RULES.map(rule => checkAlertRule(supabase, rule))
    );

    // Compter les alertes créées
    const alertsCreated = alertResults.filter(result => 
      result.status === 'fulfilled' && result.value === true
    ).length;

    // Résoudre automatiquement les alertes anciennes ou non pertinentes
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { error: resolveError } = await supabase
      .from('payment_alerts')
      .update({ resolved: true, resolved_at: new Date().toISOString() })
      .eq('resolved', false)
      .lt('created_at', oneDayAgo)
      .in('type', ['webhook_missing', 'no_payments']); // Auto-résoudre certains types d'alertes

    if (resolveError) {
      console.error('Erreur lors de la résolution automatique des alertes:', resolveError);
    }

    console.log(`✅ [PAYMENT-ALERTS] Vérification terminée: ${alertsCreated} nouvelles alertes créées`);

    return new Response(JSON.stringify({
      success: true,
      alerts_checked: ALERT_RULES.length,
      alerts_created: alertsCreated,
      rules_processed: alertResults.map((result, index) => ({
        rule: ALERT_RULES[index].type,
        status: result.status,
        alert_created: result.status === 'fulfilled' ? result.value : false
      })),
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('❌ [PAYMENT-ALERTS] Erreur:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
