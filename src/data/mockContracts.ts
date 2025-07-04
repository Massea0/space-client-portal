// src/data/mockContracts.ts
// Données de test pour l'interface d'administration des contrats

import type { Contract, ContractAlert } from '@/types/contracts';

export const mockContracts: Contract[] = [
  {
    id: '1',
    clientId: 'client-1',
    clientName: 'Entreprise Alpha',
    devisId: 'devis-1',
    contractNumber: 'CTR-2024-001',
    title: 'Contrat de développement web',
    object: 'Développement d\'une application web moderne avec interface d\'administration',
    status: 'signed',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-12-15'),
    signatureDate: new Date('2024-01-10'),
    amount: 45000,
    currency: 'EUR',
    paymentTerms: '30 jours',
    contentPreview: 'Contrat de prestation de services pour le développement d\'une application web...',
    clausesSummary: {
      total_clauses: 12,
      key_terms: ['Développement web', 'Maintenance', 'Support technique'],
      payment_schedule: 'Mensuel - 30 jours',
      liability_cap: '50 000 EUR',
      termination_notice: '30 jours'
    },
    complianceScore: 95,
    aiConfidenceScore: 92,
    generatedByAi: true,
    templateUsed: 'Template Développement Web IA',
    contractType: 'service',
    riskAnalysis: {
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
    obligationsMonitoring: {
      client_obligations: [],
      provider_obligations: [],
      next_milestones: []
    },
    autoRenewal: true,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '2',
    clientId: 'client-2',
    clientName: 'Société Beta',
    contractNumber: 'CTR-2024-002',
    title: 'Contrat de maintenance annuelle',
    object: 'Maintenance et support technique pour infrastructure IT',
    status: 'pending_client',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2025-01-31'),
    amount: 12000,
    currency: 'EUR',
    paymentTerms: 'Trimestriel',
    contentPreview: 'Contrat de maintenance annuelle pour infrastructure...',
    clausesSummary: {
      total_clauses: 8,
      key_terms: ['Maintenance', 'Support 24/7', 'SLA 99.9%'],
      payment_schedule: 'Trimestriel',
      liability_cap: '25 000 EUR',
      termination_notice: '15 jours'
    },
    complianceScore: 88,
    aiConfidenceScore: 85,
    generatedByAi: false,
    contractType: 'maintenance',
    riskAnalysis: {
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
    obligationsMonitoring: {
      client_obligations: [],
      provider_obligations: [],
      next_milestones: []
    },
    autoRenewal: false,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: '3',
    clientId: 'client-3',
    clientName: 'Groupe Gamma',
    contractNumber: 'CTR-2024-003',
    title: 'Contrat de conseil stratégique',
    object: 'Mission de conseil en transformation digitale',
    status: 'draft',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-08-31'),
    amount: 75000,
    currency: 'EUR',
    paymentTerms: 'À la livraison',
    contentPreview: 'Mission de conseil stratégique pour la transformation digitale...',
    clausesSummary: {
      total_clauses: 15,
      key_terms: ['Conseil stratégique', 'Transformation digitale', 'Formation'],
      payment_schedule: 'Par phases',
      liability_cap: '100 000 EUR',
      termination_notice: '60 jours'
    },
    complianceScore: 82,
    aiConfidenceScore: 78,
    generatedByAi: true,
    templateUsed: 'Template Conseil IA',
    contractType: 'consulting',
    riskAnalysis: {
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
    obligationsMonitoring: {
      client_obligations: [],
      provider_obligations: [],
      next_milestones: []
    },
    autoRenewal: false,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-15')
  },
  {
    id: '4',
    clientId: 'client-4',
    clientName: 'Startup Delta',
    contractNumber: 'CTR-2024-004',
    title: 'Licence logicielle annuelle',
    object: 'Licence d\'utilisation du système de gestion DExchange',
    status: 'expired',
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-12-31'),
    signatureDate: new Date('2022-12-15'),
    amount: 8500,
    currency: 'EUR',
    paymentTerms: 'Annuel',
    contentPreview: 'Licence d\'utilisation du logiciel DExchange...',
    clausesSummary: {
      total_clauses: 10,
      key_terms: ['Licence logicielle', 'Support technique', 'Mises à jour'],
      payment_schedule: 'Annuel',
      liability_cap: '15 000 EUR',
      termination_notice: '90 jours'
    },
    complianceScore: 75,
    aiConfidenceScore: 70,
    generatedByAi: false,
    contractType: 'licensing',
    riskAnalysis: {
      overall_score: 65,
      risks: {
        financial: 35,
        legal: 30,
        operational: 25,
        compliance: 20
      },
      recommendations: ['Renouveler rapidement', 'Mettre à jour les termes de licence'],
      flagged_clauses: ['clause_expiry', 'clause_renewal']
    },
    obligationsMonitoring: {
      client_obligations: [],
      provider_obligations: [],
      next_milestones: []
    },
    autoRenewal: true,
    createdAt: new Date('2022-11-01'),
    updatedAt: new Date('2022-12-15')
  }
];

export const mockAlerts: ContractAlert[] = [
  {
    id: 'alert-1',
    contract_id: '4',
    alert_type: 'contract_expired',
    severity: 'high',
    message: 'Le contrat CTR-2024-004 a expiré',
    due_date: new Date('2023-12-31'),
    details: { contract_number: 'CTR-2024-004', client_name: 'Startup Delta' },
    status: 'active',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
    contracts: {
      contract_number: 'CTR-2024-004',
      title: 'Licence logicielle annuelle',
      status: 'expired',
      companies: {
        name: 'Startup Delta'
      }
    }
  },
  {
    id: 'alert-2',
    contract_id: '1',
    alert_type: 'contract_expiring_soon',
    severity: 'medium',
    message: 'Le contrat CTR-2024-001 expire dans 30 jours',
    due_date: new Date('2024-12-15'),
    details: { days_remaining: 30 },
    status: 'active',
    created_at: new Date('2024-11-15'),
    updated_at: new Date('2024-11-15'),
    contracts: {
      contract_number: 'CTR-2024-001',
      title: 'Contrat de développement web',
      status: 'signed',
      companies: {
        name: 'Entreprise Alpha'
      }
    }
  },
  {
    id: 'alert-3',
    contract_id: '2',
    alert_type: 'manual_review_required',
    severity: 'low',
    message: 'Révision manuelle requise pour le contrat en attente',
    details: { reason: 'Clauses spécifiques à valider' },
    status: 'active',
    created_at: new Date('2024-01-25'),
    updated_at: new Date('2024-01-25'),
    contracts: {
      contract_number: 'CTR-2024-002',
      title: 'Contrat de maintenance annuelle',
      status: 'pending_client',
      companies: {
        name: 'Société Beta'
      }
    }
  }
];
