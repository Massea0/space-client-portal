// src/scripts/insertTestData.ts
// Script pour insérer des données de test pour la Mission 1

import { supabase } from '@/lib/supabaseClient';

export async function insertTestData() {
  try {
    // 1. Récupérer une entreprise existante
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name')
      .limit(1);
    
    if (!companies || companies.length === 0) {
      throw new Error('Aucune entreprise trouvée. Créez d\'abord une entreprise.');
    }

    const clientId = companies[0].id;
    const clientName = companies[0].name;

    // 2. Créer des contrats de test
    const contractsToInsert = [
      {
        client_id: clientId,
        contract_number: 'CTR-2024-001',
        title: 'Contrat de développement web',
        object: 'Développement d\'une application web moderne avec interface d\'administration',
        status: 'signed',
        start_date: '2024-01-15',
        end_date: '2024-12-15',
        signature_date: '2024-01-10',
        amount: 45000,
        currency: 'EUR',
        payment_terms: '30 jours',
        content_preview: 'Contrat de prestation de services pour le développement d\'une application web...',
        clauses_summary: {
          total_clauses: 12,
          key_terms: ['Développement web', 'Maintenance', 'Support technique'],
          payment_schedule: 'Mensuel - 30 jours',
          liability_cap: '50 000 EUR',
          termination_notice: '30 jours'
        },
        compliance_score: 95,
        ai_confidence_score: 92,
        generated_by_ai: true,
        template_used: 'Template Développement Web IA',
        contract_type: 'service',
        risk_analysis: {
          overall_score: 85,
          risks: {
            financial: 20,
            legal: 15,
            operational: 10,
            compliance: 5
          },
          recommendations: ['Réviser les clauses de paiement'],
          flagged_clauses: []
        },
        obligations_monitoring: {
          client_obligations: [],
          provider_obligations: [],
          next_milestones: []
        },
        auto_renewal: true
      },
      {
        client_id: clientId,
        contract_number: 'CTR-2024-002',
        title: 'Contrat de maintenance annuelle',
        object: 'Maintenance et support technique pour infrastructure IT',
        status: 'pending_client',
        start_date: '2024-02-01',
        end_date: '2025-01-31',
        amount: 12000,
        currency: 'EUR',
        payment_terms: 'Trimestriel',
        content_preview: 'Contrat de maintenance annuelle pour infrastructure...',
        clauses_summary: {
          total_clauses: 8,
          key_terms: ['Maintenance', 'Support 24/7', 'SLA 99.9%'],
          payment_schedule: 'Trimestriel',
          liability_cap: '25 000 EUR',
          termination_notice: '15 jours'
        },
        compliance_score: 88,
        ai_confidence_score: 85,
        generated_by_ai: false,
        contract_type: 'maintenance',
        risk_analysis: {
          overall_score: 75,
          risks: {
            financial: 25,
            legal: 20,
            operational: 15,
            compliance: 10
          },
          recommendations: ['Clarifier les SLA', 'Ajuster les pénalités'],
          flagged_clauses: ['clause_sla']
        },
        obligations_monitoring: {
          client_obligations: [],
          provider_obligations: [],
          next_milestones: []
        },
        auto_renewal: false
      },
      {
        client_id: clientId,
        contract_number: 'CTR-2024-003',
        title: 'Contrat de conseil stratégique',
        object: 'Mission de conseil en transformation digitale',
        status: 'draft',
        start_date: '2024-03-01',
        end_date: '2024-08-31',
        amount: 75000,
        currency: 'EUR',
        payment_terms: 'À la livraison',
        content_preview: 'Mission de conseil stratégique pour la transformation digitale...',
        clauses_summary: {
          total_clauses: 15,
          key_terms: ['Conseil stratégique', 'Transformation digitale', 'Formation'],
          payment_schedule: 'Par phases',
          liability_cap: '100 000 EUR',
          termination_notice: '60 jours'
        },
        compliance_score: 82,
        ai_confidence_score: 78,
        generated_by_ai: true,
        template_used: 'Template Conseil IA',
        contract_type: 'consulting',
        risk_analysis: {
          overall_score: 70,
          risks: {
            financial: 30,
            legal: 25,
            operational: 20,
            compliance: 15
          },
          recommendations: ['Définir des livrables plus précis', 'Ajuster la répartition des risques'],
          flagged_clauses: ['clause_payment', 'clause_liability']
        },
        obligations_monitoring: {
          client_obligations: [],
          provider_obligations: [],
          next_milestones: []
        },
        auto_renewal: false
      }
    ];

    console.log('Insertion des contrats de test...');
    const { data: insertedContracts, error: contractError } = await supabase
      .from('contracts')
      .insert(contractsToInsert)
      .select('id, contract_number');

    if (contractError) {
      throw contractError;
    }

    console.log('Contrats insérés:', insertedContracts);

    // 3. Créer des alertes de test
    if (insertedContracts && insertedContracts.length > 0) {
      const alertsToInsert = [
        {
          contract_id: insertedContracts[0].id,
          alert_type: 'contract_expiring_soon',
          severity: 'medium',
          message: `Le contrat ${insertedContracts[0].contract_number} expire dans 30 jours`,
          due_date: '2024-12-15',
          details: { days_remaining: 30 },
          status: 'active'
        },
        {
          contract_id: insertedContracts[1]?.id,
          alert_type: 'manual_review_required',
          severity: 'low',
          message: 'Révision manuelle requise pour le contrat en attente',
          details: { reason: 'Clauses spécifiques à valider' },
          status: 'active'
        },
        {
          contract_id: insertedContracts[2]?.id,
          alert_type: 'low_compliance_score',
          severity: 'high',
          message: `Score de conformité faible détecté pour ${insertedContracts[2]?.contract_number}`,
          details: { compliance_score: 82, threshold: 90 },
          status: 'active'
        }
      ].filter(alert => alert.contract_id); // Filtrer les alertes sans contract_id

      console.log('Insertion des alertes de test...');
      console.log('Alertes à insérer:', alertsToInsert);
      
      const { data: insertedAlerts, error: alertError } = await supabase
        .from('contract_alerts')
        .insert(alertsToInsert)
        .select('id, alert_type, message');

      if (alertError) {
        console.error('Erreur détaillée alertes:', alertError);
        // Ne pas faire échouer toute l'insertion si les alertes échouent
        console.warn('Impossible d\'insérer les alertes, mais les contrats ont été créés');
      } else {
        console.log('Alertes insérées:', insertedAlerts);
      }
    }

    return {
      success: true,
      contracts: insertedContracts,
      message: 'Données de test insérées avec succès'
    };

  } catch (error) {
    console.error('Erreur lors de l\'insertion des données de test:', error);
    return {
      success: false,
      error: error.message,
      message: 'Erreur lors de l\'insertion des données de test'
    };
  }
}
