// src/services/contracts-test.ts
// Version de test du service contracts qui utilise les données mock

import { mockContracts, mockAlerts } from '@/data/mockContracts';
import type { Contract, ContractAlert } from '@/types/contracts';

// Simuler un délai réseau
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const contractsApiTest = {
  async getContracts(filters?: {
    status?: string;
    client_id?: string;
    contract_type?: string;
    search?: string;
  }): Promise<Contract[]> {
    await delay(800); // Simuler un appel API

    let filtered = [...mockContracts];

    if (filters?.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    if (filters?.contract_type) {
      filtered = filtered.filter(c => c.contractType === filters.contract_type);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(search) ||
        c.contractNumber.toLowerCase().includes(search) ||
        c.object.toLowerCase().includes(search) ||
        c.clientName.toLowerCase().includes(search)
      );
    }

    return filtered;
  },

  async getContract(id: string): Promise<Contract | null> {
    await delay(300);
    return mockContracts.find(c => c.id === id) || null;
  },

  async createContract(contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contract> {
    await delay(1000);
    
    const newContract: Contract = {
      ...contract,
      id: `contract-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockContracts.unshift(newContract);
    return newContract;
  },

  async updateContract(id: string, updates: Partial<Contract>): Promise<Contract> {
    await delay(600);
    
    const index = mockContracts.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Contrat introuvable');
    }

    mockContracts[index] = {
      ...mockContracts[index],
      ...updates,
      updatedAt: new Date()
    };

    return mockContracts[index];
  },

  async deleteContract(id: string): Promise<boolean> {
    await delay(400);
    
    const index = mockContracts.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Contrat introuvable');
    }

    mockContracts.splice(index, 1);
    return true;
  }
};

export const contractsAITest = {
  async generateContractDraft(request: any): Promise<{ contractId: string }> {
    await delay(3000); // Simuler une génération IA

    // Créer un nouveau contrat avec des données basées sur la requête
    const newContract: Contract = {
      id: `ai-contract-${Date.now()}`,
      clientId: request.clientId || 'client-test',
      clientName: 'Client IA Test',
      devisId: request.devisId,
      contractNumber: `CTR-AI-${new Date().getFullYear()}-${String(mockContracts.length + 1).padStart(3, '0')}`,
      title: `Contrat IA généré - ${request.templateType}`,
      object: `Contrat généré automatiquement par IA pour ${request.templateType}`,
      status: 'draft' as const,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +1 an
      amount: 15000,
      currency: 'EUR',
      paymentTerms: '30 jours',
      contentPreview: `Contrat ${request.templateType} généré par IA avec des clauses intelligentes...`,
      clausesSummary: {
        total_clauses: 10,
        key_terms: request.customClauses || ['Prestation', 'Support', 'Maintenance'],
        payment_schedule: 'Mensuel',
        liability_cap: '25 000 EUR',
        termination_notice: '30 jours'
      },
      complianceScore: 92,
      aiConfidenceScore: 88,
      generatedByAi: true,
      templateUsed: `Template ${request.templateType} IA`,
      contractType: request.templateType,
      riskAnalysis: {
        overall_score: 85,
        risks: {
          financial: 15,
          legal: 10,
          operational: 8,
          compliance: 5
        },
        recommendations: ['Réviser les clauses de responsabilité'],
        flagged_clauses: []
      },
      obligationsMonitoring: {
        client_obligations: [],
        provider_obligations: [],
        next_milestones: []
      },
      autoRenewal: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockContracts.unshift(newContract);
    
    return { contractId: newContract.id };
  },

  async analyzeContractCompliance(request: any): Promise<any> {
    await delay(2000);
    
    return {
      complianceScore: 87,
      risks: ['Clause de résiliation imprécise', 'Termes de paiement à clarifier'],
      recommendations: ['Ajouter une clause de force majeure', 'Préciser les conditions de résiliation'],
      analysis: 'Analyse de conformité simulée'
    };
  },

  async monitorContracts(options?: any): Promise<any> {
    await delay(1500);
    
    return {
      alerts: mockAlerts,
      summary: {
        total_contracts: mockContracts.length,
        active_alerts: mockAlerts.filter(a => a.status === 'active').length,
        critical_alerts: mockAlerts.filter(a => a.severity === 'critical').length
      },
      contracts_monitored: mockContracts.length
    };
  }
};

export const alertsApiTest = {
  async getAlerts(): Promise<ContractAlert[]> {
    await delay(500);
    return mockAlerts.filter(a => a.status === 'active');
  },

  async resolveAlert(alertId: string): Promise<boolean> {
    await delay(300);
    const alert = mockAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'resolved';
      alert.resolved_at = new Date();
    }
    return true;
  },

  async dismissAlert(alertId: string): Promise<boolean> {
    await delay(300);
    const alert = mockAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'dismissed';
    }
    return true;
  }
};
