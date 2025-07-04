// src/services/contracts.ts
// Mission 1: Services pour la gestion intelligente des contrats
// Interface frontend pour les Edge Functions de contrats IA

import { supabase } from '@/lib/supabaseClient';
import type { 
  Contract, 
  ContractTemplate, 
  ContractAlert, 
  ContractObligation,
  ContractGenerationRequest,
  ContractAnalysisRequest 
} from '@/types/contracts';

// --- Fonctions CRUD de base ---

export const contractsApi = {
  // Récupération des contrats
  async getContracts(filters?: {
    status?: string;
    client_id?: string;
    contract_type?: string;
    search?: string;
  }) {
    let query = supabase
      .from('contracts')
      .select(`
        *,
        companies:client_id (
          id, name, email, phone
        ),
        devis:devis_id (
          id, number, object, amount
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.client_id) {
      query = query.eq('client_id', filters.client_id);
    }
    if (filters?.contract_type) {
      query = query.eq('contract_type', filters.contract_type);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,contract_number.ilike.%${filters.search}%,object.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Erreur récupération contrats: ${error.message}`);
    }

    return data || [];
  },

  // Récupération d'un contrat spécifique
  async getContract(id: string) {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        companies:client_id (
          id, name, email, phone, address
        ),
        devis:devis_id (
          id, number, object, amount, devis_items (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Erreur récupération contrat: ${error.message}`);
    }

    return data;
  },

  // Mise à jour d'un contrat
  async updateContract(id: string, updates: Partial<Contract>) {
    const { data, error } = await supabase
      .from('contracts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur mise à jour contrat: ${error.message}`);
    }

    return data;
  },

  // Suppression d'un contrat
  async deleteContract(id: string) {
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erreur suppression contrat: ${error.message}`);
    }

    return true;
  }
};

// --- Fonctions IA via Edge Functions ---

export const contractsAI = {
  // Génération d'un contrat IA à partir d'un devis
  async generateContractDraft(request: ContractGenerationRequest) {
    const { data, error } = await supabase.functions.invoke('generate-contract-draft', {
      body: request
    });

    if (error) {
      throw new Error(`Erreur génération contrat: ${error.message}`);
    }

    if (!data.success) {
      throw new Error(data.error || 'Erreur lors de la génération du contrat');
    }

    return data.contract;
  },

  // Analyse de conformité d'un contrat
  async analyzeContractCompliance(request: ContractAnalysisRequest) {
    const { data, error } = await supabase.functions.invoke('analyze-contract-compliance', {
      body: request
    });

    if (error) {
      throw new Error(`Erreur analyse conformité: ${error.message}`);
    }

    if (!data.success) {
      throw new Error(data.error || 'Erreur lors de l\'analyse de conformité');
    }

    return data.analysis;
  },

  // Monitoring des obligations contractuelles
  async monitorContracts(options?: {
    contract_id?: string;
    monitoring_type?: 'deadlines' | 'renewals' | 'payments' | 'all';
    days_ahead?: number;
  }) {
    const { data, error } = await supabase.functions.invoke('monitor-contract-obligations', {
      body: options || {}
    });

    if (error) {
      throw new Error(`Erreur monitoring contrats: ${error.message}`);
    }

    if (!data.success) {
      throw new Error(data.error || 'Erreur lors du monitoring');
    }

    return {
      alerts: data.alerts,
      summary: data.summary,
      contracts_monitored: data.contracts_monitored
    };
  }
};

// --- Gestion des templates ---

export const templatesApi = {
  // Récupération des templates
  async getTemplates(contract_type?: string) {
    let query = supabase
      .from('contract_templates')
      .select('*')
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('name');

    if (contract_type) {
      query = query.eq('contract_type', contract_type);
    }

    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Erreur récupération templates: ${error.message}`);
    }

    return data || [];
  },

  // Récupération d'un template spécifique
  async getTemplate(id: string) {
    const { data, error } = await supabase
      .from('contract_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Erreur récupération template: ${error.message}`);
    }

    return data;
  },

  // Création d'un nouveau template
  async createTemplate(template: Omit<ContractTemplate, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('contract_templates')
      .insert(template)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur création template: ${error.message}`);
    }

    return data;
  },

  // Mise à jour d'un template
  async updateTemplate(id: string, updates: Partial<ContractTemplate>) {
    const { data, error } = await supabase
      .from('contract_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur mise à jour template: ${error.message}`);
    }

    return data;
  }
};

// --- Gestion des alertes ---

export const alertsApi = {
  // Récupération des alertes
  async getAlerts(filters?: {
    contract_id?: string;
    status?: string;
    severity?: string;
  }) {
    let query = supabase
      .from('contract_alerts')
      .select(`
        *,
        contracts:contract_id (
          contract_number, title, status,
          companies:client_id (name)
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.contract_id) {
      query = query.eq('contract_id', filters.contract_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }

    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Erreur récupération alertes: ${error.message}`);
    }

    return data || [];
  },

  // Marquer une alerte comme acquittée
  async acknowledgeAlert(id: string) {
    const { data, error } = await supabase
      .from('contract_alerts')
      .update({
        status: 'acknowledged',
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur acquittement alerte: ${error.message}`);
    }

    return data;
  },

  // Résoudre une alerte
  async resolveAlert(id: string, resolution_notes?: string) {
    const { data, error } = await supabase
      .from('contract_alerts')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: (await supabase.auth.getUser()).data.user?.id,
        details: {
          ...(await supabase.from('contract_alerts').select('details').eq('id', id).single()).data?.details,
          resolution_notes
        }
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur résolution alerte: ${error.message}`);
    }

    return data;
  },

  // Récupération des alertes actives
  async getActiveAlerts(contract_id?: string) {
    let query = supabase
      .from('contract_alerts')
      .select(`
        *,
        contracts:contract_id (
          contract_number,
          title,
          status,
          companies:client_id (
            name
          )
        )
      `)
      .eq('status', 'active')
      .order('severity', { ascending: false })
      .order('created_at', { ascending: false });

    if (contract_id) {
      query = query.eq('contract_id', contract_id);
    }

    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Erreur récupération alertes: ${error.message}`);
    }

    return data || [];
  },

  // Résoudre une alerte
  async resolveAlertById(alertId: string) {
    const { error } = await supabase
      .from('contract_alerts')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId);

    if (error) {
      throw new Error(`Erreur résolution alerte: ${error.message}`);
    }

    return true;
  },

  // Ignorer une alerte
  async dismissAlert(alertId: string) {
    const { error } = await supabase
      .from('contract_alerts')
      .update({
        status: 'dismissed',
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId);

    if (error) {
      throw new Error(`Erreur suppression alerte: ${error.message}`);
    }

    return true;
  },

  // Marquer une alerte comme acquittée
  async acknowledgeAlertById(alertId: string) {
    const { error } = await supabase
      .from('contract_alerts')
      .update({
        status: 'acknowledged',
        acknowledged_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId);

    if (error) {
      throw new Error(`Erreur acquittement alerte: ${error.message}`);
    }

    return true;
  }
};

// --- Gestion des obligations ---

export const obligationsApi = {
  // Récupération des obligations
  async getObligations(contract_id?: string) {
    let query = supabase
      .from('contract_obligations')
      .select(`
        *,
        contracts:contract_id (
          contract_number, title,
          companies:client_id (name)
        )
      `)
      .order('due_date', { ascending: true, nullsFirst: false });

    if (contract_id) {
      query = query.eq('contract_id', contract_id);
    }

    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Erreur récupération obligations: ${error.message}`);
    }

    return data || [];
  },

  // Création d'une nouvelle obligation
  async createObligation(obligation: Omit<ContractObligation, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('contract_obligations')
      .insert(obligation)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur création obligation: ${error.message}`);
    }

    return data;
  },

  // Marquer une obligation comme complétée
  async completeObligation(id: string, completion_notes?: string) {
    const { data, error } = await supabase
      .from('contract_obligations')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: (await supabase.auth.getUser()).data.user?.id,
        completion_notes
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur completion obligation: ${error.message}`);
    }

    return data;
  },

  // Mise à jour d'une obligation
  async updateObligation(id: string, updates: Partial<ContractObligation>) {
    const { data, error } = await supabase
      .from('contract_obligations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur mise à jour obligation: ${error.message}`);
    }

    return data;
  }
};

// --- Utilitaires ---

export const contractsUtils = {
  // Formatage du statut de contrat pour l'affichage
  formatContractStatus(status: string): { label: string; color: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
    const statusMap = {
      'draft': { label: 'Brouillon', color: 'text-gray-600', variant: 'outline' as const },
      'review': { label: 'En révision', color: 'text-blue-600', variant: 'default' as const },
      'pending_client': { label: 'En attente client', color: 'text-orange-600', variant: 'secondary' as const },
      'signed': { label: 'Signé', color: 'text-green-600', variant: 'default' as const },
      'expired': { label: 'Expiré', color: 'text-red-600', variant: 'destructive' as const },
      'terminated': { label: 'Résilié', color: 'text-red-600', variant: 'destructive' as const },
      'renewed': { label: 'Renouvelé', color: 'text-blue-600', variant: 'default' as const }
    };

    return statusMap[status as keyof typeof statusMap] || { label: status, color: 'text-gray-600', variant: 'outline' };
  },

  // Calcul du score de risque global
  calculateRiskScore(risks: { financial: number; legal: number; operational: number; compliance: number }): number {
    const weights = { financial: 0.3, legal: 0.3, operational: 0.2, compliance: 0.2 };
    return Math.round(
      risks.financial * weights.financial +
      risks.legal * weights.legal +
      risks.operational * weights.operational +
      risks.compliance * weights.compliance
    );
  },

  // Formatage des alertes par gravité
  getAlertsByStatus(alerts: ContractAlert[]) {
    return {
      critical: alerts.filter(a => a.severity === 'critical'),
      high: alerts.filter(a => a.severity === 'high'),
      medium: alerts.filter(a => a.severity === 'medium'),
      low: alerts.filter(a => a.severity === 'low')
    };
  },

  // Vérification si un contrat nécessite une action
  needsAttention(contract: Contract): boolean {
    const today = new Date();
    const endDate = new Date(contract.endDate);
    const daysUntilEnd = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return (
      contract.status === 'draft' ||
      contract.complianceScore < 70 ||
      daysUntilEnd <= 30 ||
      (contract.renewalDate && new Date(contract.renewalDate) <= new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000))
    );
  }
};
