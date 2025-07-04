// Edge Function: monitor-contract-obligations
// Mission 1: AI-Powered Contract Lifecycle Management
// Monitoring périodique des obligations contractuelles et alertes automatiques

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import du client Gemini partagé
import { GeminiClient } from '../_shared/gemini-client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MonitoringRequest {
  contract_id?: string; // Si spécifié, monitoring d'un contrat spécifique
  monitoring_type?: 'deadlines' | 'renewals' | 'payments' | 'all';
  days_ahead?: number; // Nombre de jours à l'avance pour les alertes
}

interface ContractAlert {
  contract_id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  due_date?: string;
  actions_required: string[];
}

serve(async (req) => {
  // Gestion CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      contract_id, 
      monitoring_type = 'all', 
      days_ahead = 30 
    } = await req.json() as MonitoringRequest;

    const today = new Date();
    const alertDate = new Date(today.getTime() + days_ahead * 24 * 60 * 60 * 1000);

    // 1. Construction de la requête selon les paramètres
    let query = supabaseClient
      .from('contracts')
      .select(`
        *,
        companies:client_id (
          id, name, email, phone
        ),
        devis:devis_id (
          id, number, object
        )
      `);

    if (contract_id) {
      query = query.eq('id', contract_id);
    } else {
      // Filtrer seulement les contrats actifs pour le monitoring automatique
      query = query.in('status', ['signed', 'review', 'pending_client']);
    }

    const { data: contracts, error: contractsError } = await query;

    if (contractsError) {
      throw new Error(`Erreur récupération contrats: ${contractsError.message}`);
    }

    if (!contracts || contracts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Aucun contrat à monitorer',
          alerts: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const alerts: ContractAlert[] = [];
    const actions = [];

    // 2. Analyse de chaque contrat
    for (const contract of contracts) {
      const contractAlerts = [];

      // 2.1 Vérification des dates d'échéance
      if (monitoring_type === 'all' || monitoring_type === 'deadlines') {
        const endDate = new Date(contract.end_date);
        const daysUntilEnd = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilEnd <= 0) {
          contractAlerts.push({
            contract_id: contract.id,
            alert_type: 'contract_expired',
            severity: 'critical',
            message: `Contrat ${contract.contract_number} expiré depuis ${Math.abs(daysUntilEnd)} jour(s)`,
            due_date: contract.end_date,
            actions_required: ['Résiliation automatique', 'Négociation renouvellement', 'Archivage']
          });
        } else if (daysUntilEnd <= 7) {
          contractAlerts.push({
            contract_id: contract.id,
            alert_type: 'contract_expiring_soon',
            severity: 'high',
            message: `Contrat ${contract.contract_number} expire dans ${daysUntilEnd} jour(s)`,
            due_date: contract.end_date,
            actions_required: ['Préparer renouvellement', 'Contacter client', 'Préparer facture finale']
          });
        } else if (daysUntilEnd <= 30) {
          contractAlerts.push({
            contract_id: contract.id,
            alert_type: 'contract_expiring',
            severity: 'medium',
            message: `Contrat ${contract.contract_number} expire dans ${daysUntilEnd} jour(s)`,
            due_date: contract.end_date,
            actions_required: ['Évaluer renouvellement', 'Planifier discussion client']
          });
        }
      }

      // 2.2 Vérification des dates de renouvellement
      if ((monitoring_type === 'all' || monitoring_type === 'renewals') && contract.renewal_date) {
        const renewalDate = new Date(contract.renewal_date);
        const daysUntilRenewal = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilRenewal <= 0) {
          contractAlerts.push({
            contract_id: contract.id,
            alert_type: 'renewal_overdue',
            severity: 'high',
            message: `Renouvellement du contrat ${contract.contract_number} en retard`,
            due_date: contract.renewal_date,
            actions_required: ['Processus de renouvellement urgent', 'Génération nouveau contrat']
          });
        } else if (daysUntilRenewal <= 15) {
          contractAlerts.push({
            contract_id: contract.id,
            alert_type: 'renewal_due_soon',
            severity: 'medium',
            message: `Renouvellement du contrat ${contract.contract_number} dans ${daysUntilRenewal} jour(s)`,
            due_date: contract.renewal_date,
            actions_required: ['Préparer documents de renouvellement', 'Contacter client']
          });
        }
      }

      // 2.3 Vérification des paiements (si applicable)
      if (monitoring_type === 'all' || monitoring_type === 'payments') {
        // Vérifier les factures impayées liées au contrat
        const { data: unpaidInvoices } = await supabaseClient
          .from('invoices')
          .select('id, number, amount, due_date, status')
          .eq('company_id', contract.client_id)
          .in('status', ['pending', 'overdue', 'pending_payment'])
          .gte('created_at', contract.start_date)
          .lte('created_at', contract.end_date || new Date().toISOString());

        if (unpaidInvoices && unpaidInvoices.length > 0) {
          const overdueInvoices = unpaidInvoices.filter(inv => 
            new Date(inv.due_date) < today
          );

          if (overdueInvoices.length > 0) {
            const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
            contractAlerts.push({
              contract_id: contract.id,
              alert_type: 'overdue_payments',
              severity: 'high',
              message: `${overdueInvoices.length} facture(s) impayée(s) pour ${totalOverdue} FCFA`,
              actions_required: ['Relance client', 'Vérification paiements', 'Mise en demeure si nécessaire']
            });
          }
        }
      }

      // 2.4 Analyse IA des obligations contractuelles
      if (contract.clauses_summary && Object.keys(contract.clauses_summary).length > 0) {
        const geminiClient = new GeminiClient();
        
        const aiPrompt = `Analyse les clauses contractuelles suivantes et identifie les obligations et échéances importantes:

CONTRAT: ${contract.contract_number}
STATUT: ${contract.status}
DURÉE: ${contract.start_date} → ${contract.end_date}
CLAUSES: ${JSON.stringify(contract.clauses_summary)}

DATE ACTUELLE: ${today.toISOString().split('T')[0]}

Identifie:
1. Les obligations non remplies ou à risque
2. Les échéances importantes à venir
3. Les actions préventives recommandées

RETOURNE un JSON simple:
{
  "urgent_obligations": ["obligation 1", "obligation 2"],
  "upcoming_deadlines": ["échéance 1", "échéance 2"],
  "recommended_actions": ["action 1", "action 2"]
}`;

        const aiResponse = await geminiClient.generateContent({
          prompt: aiPrompt,
          temperature: 0.3,
          maxTokens: 1000
        });

        if (aiResponse.success && aiResponse.content) {
          try {
            const aiAnalysis = JSON.parse(aiResponse.content);
            
            if (aiAnalysis.urgent_obligations && aiAnalysis.urgent_obligations.length > 0) {
              contractAlerts.push({
                contract_id: contract.id,
                alert_type: 'obligations_at_risk',
                severity: 'medium',
                message: `${aiAnalysis.urgent_obligations.length} obligation(s) à surveiller`,
                actions_required: aiAnalysis.recommended_actions || ['Révision manuelle du contrat']
              });
            }
          } catch (e) {
            // Ignore si parsing IA échoue
          }
        }
      }

      alerts.push(...contractAlerts);

      // 2.5 Actions automatiques selon les alertes
      if (contractAlerts.length > 0) {
        for (const alert of contractAlerts) {
          // Sauvegarde de l'alerte en base
          await supabaseClient
            .from('contract_alerts')
            .insert({
              contract_id: contract.id,
              alert_type: alert.alert_type,
              severity: alert.severity,
              message: alert.message,
              due_date: alert.due_date,
              details: {
                actions_required: alert.actions_required,
                monitoring_date: today.toISOString(),
                auto_generated: true
              }
            });

          // Actions automatiques selon le type d'alerte
          if (alert.alert_type === 'contract_expired' && contract.status === 'signed') {
            actions.push({
              action: 'status_update',
              contract_id: contract.id,
              new_status: 'expired',
              reason: 'Expiration automatique détectée'
            });
          }

          if (alert.alert_type === 'renewal_due_soon' && !contract.renewal_initiated) {
            actions.push({
              action: 'generate_renewal_quote',
              contract_id: contract.id,
              reason: 'Renouvellement à préparer'
            });
          }
        }
      }
    }

    // 3. Exécution des actions automatiques
    for (const action of actions) {
      if (action.action === 'status_update') {
        await supabaseClient
          .from('contracts')
          .update({ 
            status: action.new_status,
            last_monitoring_date: today.toISOString()
          })
          .eq('id', action.contract_id);
      }
    }

    // 4. Log du monitoring
    await supabaseClient
      .from('client_activity_logs')
      .insert({
        activity_type: 'contracts_monitored',
        details: {
          contracts_checked: contracts.length,
          alerts_generated: alerts.length,
          actions_executed: actions.length,
          monitoring_type,
          days_ahead
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        monitoring_date: today.toISOString(),
        contracts_monitored: contracts.length,
        alerts_generated: alerts.length,
        alerts,
        actions_executed: actions.length,
        summary: {
          critical: alerts.filter(a => a.severity === 'critical').length,
          high: alerts.filter(a => a.severity === 'high').length,
          medium: alerts.filter(a => a.severity === 'medium').length,
          low: alerts.filter(a => a.severity === 'low').length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur monitoring contrats:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur interne du serveur',
        details: error.toString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
