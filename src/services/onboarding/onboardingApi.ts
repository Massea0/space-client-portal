// src/services/onboarding/onboardingApi.ts
// Service API pour la gestion de l'onboarding

import type { 
  OnboardingProcess, 
  OnboardingStep, 
  OnboardingFilters,
  DocumentToSign,
  MaterialAssignment,
  AccountCreation,
  TrainingAssignment,
  MeetingSchedule,
  MaterialItem,
  MaterialInventoryItem,
  MaterialRequest,
  MaterialCategory,
  MaterialStats,
  OnboardingMaterial
} from '@/types/onboarding';
import type { Employee } from '@/types/hr';

// ============================================================================
// SERVICE PRINCIPAL ONBOARDING
// ============================================================================

class OnboardingApiService {
  private baseUrl = '/api/onboarding';

  // Gestion des processus d'onboarding
  async getOnboardingProcesses(filters?: OnboardingFilters) {
    // TODO: Implémenter l'appel API réel
    return this.mockGetProcesses(filters);
  }

  async getOnboardingProcessById(id: string): Promise<OnboardingProcess> {
    // TODO: Implémenter l'appel API réel
    return this.mockGetProcessById(id);
  }

  async createOnboardingProcess(employeeId: string, templateId?: string): Promise<OnboardingProcess> {
    // TODO: Implémenter l'appel API réel
    return this.mockCreateProcess(employeeId, templateId);
  }

  async updateOnboardingStep(stepId: string, updates: Partial<OnboardingStep>): Promise<OnboardingStep> {
    // TODO: Implémenter l'appel API réel
    return this.mockUpdateStep(stepId, updates);
  }

  async completeOnboardingStep(stepId: string, data?: any): Promise<OnboardingStep> {
    // TODO: Implémenter l'appel API réel
    return this.mockCompleteStep(stepId, data);
  }

  // ============================================================================
  // GESTION DU MATÉRIEL
  // ============================================================================

  async getMaterialInventory(): Promise<MaterialInventoryItem[]> {
    // TODO: Implémenter l'appel API réel
    return this.mockGetMaterialInventory();
  }

  async getProcessMaterials(processId: string): Promise<OnboardingMaterial[]> {
    // TODO: Implémenter l'appel API réel
    return this.mockGetProcessMaterials(processId);
  }

  async getEmployeeMaterials(employeeId: string): Promise<MaterialAssignment[]> {
    // TODO: Implémenter l'appel API réel
    return this.mockGetEmployeeMaterials(employeeId);
  }

  async getMaterialCategories(): Promise<MaterialCategory[]> {
    // TODO: Implémenter l'appel API réel
    return this.mockGetMaterialCategories();
  }

  async assignMaterial(processId: string, materialIds: string[]): Promise<MaterialAssignment[]> {
    // TODO: Implémenter l'appel API réel
    return this.mockAssignMaterial(processId, materialIds);
  }

  async unassignMaterial(assignmentId: string): Promise<void> {
    // TODO: Implémenter l'appel API réel
    return this.mockUnassignMaterial(assignmentId);
  }

  async updateMaterialAssignment(assignmentId: string, updates: Partial<MaterialAssignment>): Promise<MaterialAssignment> {
    // TODO: Implémenter l'appel API réel
    return this.mockUpdateMaterialAssignment(assignmentId, updates);
  }

  async confirmMaterialReceived(materialId: string): Promise<MaterialAssignment> {
    // TODO: Implémenter l'appel API réel
    return this.mockConfirmMaterialReceived(materialId);
  }

  async reportMaterialIssue(materialId: string, issue: string): Promise<void> {
    // TODO: Implémenter l'appel API réel
    return this.mockReportMaterialIssue(materialId, issue);
  }

  async requestMaterialReplacement(materialId: string, reason: string): Promise<MaterialRequest> {
    // TODO: Implémenter l'appel API réel
    return this.mockRequestMaterialReplacement(materialId, reason);
  }

  async addMaterialToInventory(item: Omit<MaterialInventoryItem, 'id'>): Promise<MaterialInventoryItem> {
    // TODO: Implémenter l'appel API réel
    return this.mockAddMaterialToInventory(item);
  }

  async updateInventoryItem(id: string, updates: Partial<MaterialInventoryItem>): Promise<MaterialInventoryItem> {
    // TODO: Implémenter l'appel API réel
    return this.mockUpdateInventoryItem(id, updates);
  }

  async removeFromInventory(id: string): Promise<void> {
    // TODO: Implémenter l'appel API réel
    return this.mockRemoveFromInventory(id);
  }

  async searchMaterials(query: string): Promise<MaterialItem[]> {
    // TODO: Implémenter l'appel API réel
    return this.mockSearchMaterials(query);
  }

  async getMaterialStats(): Promise<MaterialStats> {
    // TODO: Implémenter l'appel API réel
    return this.mockGetMaterialStats();
  }

  async getMaterialRequests(): Promise<MaterialRequest[]> {
    // TODO: Implémenter l'appel API réel
    return this.mockGetMaterialRequests();
  }

  async createMaterialRequest(request: Omit<MaterialRequest, 'id' | 'requested_at'>): Promise<MaterialRequest> {
    // TODO: Implémenter l'appel API réel
    return this.mockCreateMaterialRequest(request);
  }

  async approveMaterialRequest(requestId: string): Promise<MaterialRequest> {
    // TODO: Implémenter l'appel API réel
    return this.mockApproveMaterialRequest(requestId);
  }

  async rejectMaterialRequest(requestId: string, reason: string): Promise<MaterialRequest> {
    // TODO: Implémenter l'appel API réel
    return this.mockRejectMaterialRequest(requestId, reason);
  }

  async fulfillMaterialRequest(requestId: string): Promise<MaterialRequest> {
    // TODO: Implémenter l'appel API réel
    return this.mockFulfillMaterialRequest(requestId);
  }

  // ============================================================================
  // MÉTHODES MOCK (À REMPLACER PAR LES VRAIES API)
  // ============================================================================

  private async mockGetProcesses(filters?: OnboardingFilters): Promise<OnboardingProcess[]> {
    // Simulation de données mock
    return [
      {
        id: '1',
        employee_id: '1',
        status: 'in_progress',
        created_at: '2025-07-01T09:00:00Z',
        updated_at: '2025-07-04T14:30:00Z',
        steps: this.mockGetSteps('1'),
        current_step_index: 2,
        assigned_hr_id: '5',
        due_date: '2025-07-15T17:00:00Z'
      },
      {
        id: '2',
        employee_id: '2',
        status: 'pending',
        created_at: '2025-07-04T10:00:00Z',
        updated_at: '2025-07-04T10:00:00Z',
        steps: this.mockGetSteps('2'),
        current_step_index: 0,
        assigned_hr_id: '5',
        due_date: '2025-07-18T17:00:00Z'
      }
    ];
  }

  private async mockGetProcessById(id: string): Promise<OnboardingProcess> {
    const processes = await this.mockGetProcesses();
    const process = processes.find(p => p.id === id);
    if (!process) throw new Error('Processus d\'onboarding non trouvé');
    return process;
  }

  private async mockCreateProcess(employeeId: string, templateId?: string): Promise<OnboardingProcess> {
    const newProcess: OnboardingProcess = {
      id: Date.now().toString(),
      employee_id: employeeId,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      steps: this.mockGenerateStepsForEmployee(employeeId),
      current_step_index: 0,
      assigned_hr_id: '5', // ID RH par défaut
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 jours
    };
    return newProcess;
  }

  private async mockUpdateStep(stepId: string, updates: Partial<OnboardingStep>): Promise<OnboardingStep> {
    // Simulation de mise à jour
    const step: OnboardingStep = {
      id: stepId,
      process_id: '1',
      step_order: 1,
      type: 'document_signing',
      title: 'Signature du contrat',
      status: updates.status || 'in_progress',
      content: {
        documents: []
      },
      is_required: true,
      auto_complete: false,
      requires_signature: true,
      requires_approval: false,
      ...updates
    };
    return step;
  }

  private async mockCompleteStep(stepId: string, data?: any): Promise<OnboardingStep> {
    return this.mockUpdateStep(stepId, { 
      status: 'completed',
      completed_at: new Date().toISOString()
    });
  }

  private mockGetSteps(processId: string): OnboardingStep[] {
    return [
      {
        id: `${processId}_step_1`,
        process_id: processId,
        step_order: 1,
        type: 'contact_verification',
        title: 'Vérification des coordonnées',
        description: 'Confirmation de l\'email personnel et des informations de contact',
        status: 'completed',
        content: {
          custom_data: {
            personal_email_verified: true,
            phone_verified: true
          }
        },
        is_required: true,
        auto_complete: false,
        requires_signature: false,
        requires_approval: false,
        completed_at: '2025-07-01T10:00:00Z'
      },
      {
        id: `${processId}_step_2`,
        process_id: processId,
        step_order: 2,
        type: 'document_signing',
        title: 'Signature des documents contractuels',
        description: 'Contrat de travail, accord de confidentialité, charte informatique',
        status: 'in_progress',
        content: {
          documents: [
            {
              id: 'doc_contract_1',
              template_id: 'tpl_employment_contract',
              employee_id: processId === '1' ? '1' : '2',
              generated_content: 'Contrat de travail généré par IA...',
              status: 'sent',
              sent_at: '2025-07-02T09:00:00Z',
              expires_at: '2025-07-09T23:59:59Z',
              reminder_count: 1,
              last_reminder_at: '2025-07-04T09:00:00Z'
            }
          ]
        },
        is_required: true,
        auto_complete: false,
        requires_signature: true,
        requires_approval: true,
        started_at: '2025-07-02T09:00:00Z'
      },
      {
        id: `${processId}_step_3`,
        process_id: processId,
        step_order: 3,
        type: 'material_assignment',
        title: 'Attribution du matériel',
        description: 'Ordinateur portable, téléphone, badge d\'accès',
        status: 'pending',
        content: {
          materials: [
            {
              id: 'mat_laptop_001',
              name: 'MacBook Pro 16"',
              category: 'laptop',
              type: 'Apple MacBook Pro',
              brand: 'Apple',
              model: 'MacBook Pro 16" M3',
              status: 'available',
              condition: 'new'
            }
          ]
        },
        is_required: true,
        auto_complete: false,
        requires_signature: true,
        requires_approval: false
      },
      {
        id: `${processId}_step_4`,
        process_id: processId,
        step_order: 4,
        type: 'account_creation',
        title: 'Création des comptes utilisateur',
        description: 'Email professionnel, accès aux systèmes internes',
        status: 'pending',
        content: {
          accounts: [
            {
              id: 'acc_email_1',
              employee_id: processId === '1' ? '1' : '2',
              system_name: 'Microsoft 365',
              account_type: 'email',
              email: processId === '1' ? 'marie.martin@entreprise.com' : 'pierre.durand@entreprise.com',
              groups: ['Tous les utilisateurs', 'Employés'],
              permissions: ['email', 'calendar', 'teams'],
              role: 'user',
              status: 'pending',
              requires_2fa: true,
              password_policy: 'complex',
              access_level: 'standard'
            }
          ]
        },
        is_required: true,
        auto_complete: true,
        requires_signature: false,
        requires_approval: false
      },
      {
        id: `${processId}_step_5`,
        process_id: processId,
        step_order: 5,
        type: 'training_assignment',
        title: 'Formations obligatoires',
        description: 'Sécurité informatique, RGPD, code de conduite',
        status: 'pending',
        content: {
          trainings: [
            {
              id: 'train_security_1',
              employee_id: processId === '1' ? '1' : '2',
              training_module_id: 'mod_cyber_security',
              status: 'assigned',
              progress_percentage: 0,
              assigned_at: new Date().toISOString(),
              due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              attempts_count: 0
            }
          ]
        },
        is_required: true,
        auto_complete: false,
        requires_signature: false,
        requires_approval: false
      },
      {
        id: `${processId}_step_6`,
        process_id: processId,
        step_order: 6,
        type: 'introduction_meeting',
        title: 'Réunions d\'intégration',
        description: 'Accueil avec l\'équipe et le manager',
        status: 'pending',
        content: {
          meetings: [
            {
              id: 'meet_welcome_1',
              employee_id: processId === '1' ? '1' : '2',
              title: 'Réunion d\'accueil équipe',
              type: 'team_introduction',
              organizer_id: '3', // Manager
              participants: [
                {
                  employee_id: processId === '1' ? '1' : '2',
                  role: 'required',
                  status: 'pending'
                }
              ],
              scheduled_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              duration_minutes: 60,
              status: 'scheduled',
              follow_up_required: false
            }
          ]
        },
        is_required: true,
        auto_complete: false,
        requires_signature: false,
        requires_approval: false
      }
    ];
  }

  private mockGenerateStepsForEmployee(employeeId: string): OnboardingStep[] {
    return this.mockGetSteps(employeeId);
  }

  // ============================================================================
  // MÉTHODES MOCK POUR LA GESTION DU MATÉRIEL
  // ============================================================================

  private async mockGetMaterialInventory(): Promise<MaterialInventoryItem[]> {
    return [
      {
        id: 'mat_laptop_1',
        name: 'MacBook Pro 14"',
        category: 'laptop',
        type: 'laptop',
        brand: 'Apple',
        model: 'M2 Pro',
        serial_number: 'MBP2023001',
        asset_tag: 'ASSET-001',
        status: 'available',
        condition: 'new',
        quantity_available: 5,
        quantity_total: 10,
        location: 'IT Storage Room A',
        last_audit_date: '2025-06-15T10:00:00Z'
      },
      {
        id: 'mat_mouse_1',
        name: 'Souris sans fil',
        category: 'mouse',
        type: 'mouse',
        brand: 'Logitech',
        model: 'MX Master 3',
        status: 'available',
        condition: 'new',
        quantity_available: 15,
        quantity_total: 20,
        location: 'IT Storage Room A'
      }
    ];
  }

  private async mockGetProcessMaterials(processId: string): Promise<OnboardingMaterial[]> {
    return [
      {
        id: 'mat_laptop_1',
        name: 'MacBook Pro 14"',
        category: 'laptop',
        type: 'laptop',
        brand: 'Apple',
        model: 'M2 Pro',
        status: 'available',
        condition: 'new',
        onboarding_process_id: processId,
        required: true,
        auto_assign: true
      }
    ];
  }

  private async mockGetEmployeeMaterials(employeeId: string): Promise<MaterialAssignment[]> {
    return [
      {
        id: 'assignment_1',
        employee_id: employeeId,
        material_item_id: 'mat_laptop_1',
        assigned_at: '2025-07-01T10:00:00Z',
        status: 'assigned',
        assigned_by: '5', // HR
        return_due_date: '2026-07-01T17:00:00Z',
        condition_at_assignment: 'new'
      }
    ];
  }

  private async mockGetMaterialCategories(): Promise<MaterialCategory[]> {
    return ['laptop', 'desktop', 'monitor', 'keyboard', 'mouse', 'headset', 'phone', 'tablet', 'accessories', 'furniture', 'software_license', 'security_badge', 'parking_pass'];
  }

  private async mockAssignMaterial(processId: string, materialIds: string[]): Promise<MaterialAssignment[]> {
    return materialIds.map(materialId => ({
      id: `assignment_${Date.now()}_${materialId}`,
      employee_id: processId === '1' ? '1' : '2',
      material_item_id: materialId,
      assigned_at: new Date().toISOString(),
      status: 'assigned' as const,
      assigned_by: '5',
      condition_at_assignment: 'new'
    }));
  }

  private async mockUnassignMaterial(assignmentId: string): Promise<void> {
    // Mock unassignment
    console.log(`Material assignment ${assignmentId} unassigned`);
  }

  private async mockUpdateMaterialAssignment(assignmentId: string, updates: Partial<MaterialAssignment>): Promise<MaterialAssignment> {
    return {
      id: assignmentId,
      employee_id: '1',
      material_item_id: 'mat_laptop_1',
      assigned_at: '2025-07-01T10:00:00Z',
      status: 'assigned',
      assigned_by: '5',
      condition_at_assignment: 'new',
      ...updates
    };
  }

  private async mockConfirmMaterialReceived(materialId: string): Promise<MaterialAssignment> {
    return {
      id: 'assignment_1',
      employee_id: '1',
      material_item_id: materialId,
      assigned_at: '2025-07-01T10:00:00Z',
      status: 'assigned',
      assigned_by: '5',
      condition_at_assignment: 'new',
      returned_at: new Date().toISOString()
    };
  }

  private async mockReportMaterialIssue(materialId: string, issue: string): Promise<void> {
    console.log(`Issue reported for material ${materialId}: ${issue}`);
  }

  private async mockRequestMaterialReplacement(materialId: string, reason: string): Promise<MaterialRequest> {
    return {
      id: `req_${Date.now()}`,
      employee_id: '1',
      requested_items: [{
        material_id: materialId,
        quantity: 1,
        priority: 'high',
        justification: reason
      }],
      status: 'pending',
      requested_at: new Date().toISOString(),
      requested_by: '1'
    };
  }

  private async mockAddMaterialToInventory(item: Omit<MaterialInventoryItem, 'id'>): Promise<MaterialInventoryItem> {
    return {
      id: `mat_${Date.now()}`,
      ...item
    };
  }

  private async mockUpdateInventoryItem(id: string, updates: Partial<MaterialInventoryItem>): Promise<MaterialInventoryItem> {
    const inventory = await this.mockGetMaterialInventory();
    const item = inventory.find(i => i.id === id);
    if (!item) throw new Error('Item not found');
    return { ...item, ...updates };
  }

  private async mockRemoveFromInventory(id: string): Promise<void> {
    console.log(`Material ${id} removed from inventory`);
  }

  private async mockSearchMaterials(query: string): Promise<MaterialItem[]> {
    const inventory = await this.mockGetMaterialInventory();
    return inventory.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.brand?.toLowerCase().includes(query.toLowerCase()) ||
      item.model?.toLowerCase().includes(query.toLowerCase())
    );
  }

  private async mockGetMaterialStats(): Promise<MaterialStats> {
    return {
      total_items: 50,
      available_items: 35,
      assigned_items: 12,
      maintenance_items: 3,
      by_category: {
        laptop: 15,
        desktop: 8,
        monitor: 12,
        keyboard: 5,
        mouse: 5,
        headset: 3,
        phone: 2,
        tablet: 0,
        accessories: 0,
        furniture: 0,
        software_license: 0,
        security_badge: 0,
        parking_pass: 0,
        other: 0
      },
      by_status: {
        available: 35,
        assigned: 12,
        maintenance: 3,
        retired: 0
      },
      recent_assignments: 5,
      pending_returns: 2
    };
  }

  private async mockGetMaterialRequests(): Promise<MaterialRequest[]> {
    return [
      {
        id: 'req_001',
        employee_id: '1',
        onboarding_process_id: '1',
        requested_items: [{
          material_id: 'mat_laptop_1',
          quantity: 1,
          priority: 'high',
          justification: 'Remplacement laptop défaillant'
        }],
        status: 'pending',
        requested_at: '2025-07-04T10:00:00Z',
        requested_by: '1'
      }
    ];
  }

  private async mockCreateMaterialRequest(request: Omit<MaterialRequest, 'id' | 'requested_at'>): Promise<MaterialRequest> {
    return {
      id: `req_${Date.now()}`,
      requested_at: new Date().toISOString(),
      ...request
    };
  }

  private async mockApproveMaterialRequest(requestId: string): Promise<MaterialRequest> {
    const requests = await this.mockGetMaterialRequests();
    const request = requests.find(r => r.id === requestId);
    if (!request) throw new Error('Request not found');
    return {
      ...request,
      status: 'approved',
      approved_by: '5',
      approved_at: new Date().toISOString()
    };
  }

  private async mockRejectMaterialRequest(requestId: string, reason: string): Promise<MaterialRequest> {
    const requests = await this.mockGetMaterialRequests();
    const request = requests.find(r => r.id === requestId);
    if (!request) throw new Error('Request not found');
    return {
      ...request,
      status: 'rejected',
      rejection_reason: reason
    };
  }

  private async mockFulfillMaterialRequest(requestId: string): Promise<MaterialRequest> {
    const requests = await this.mockGetMaterialRequests();
    const request = requests.find(r => r.id === requestId);
    if (!request) throw new Error('Request not found');
    return {
      ...request,
      status: 'fulfilled'
    };
  }
}

export const onboardingApi = new OnboardingApiService();
