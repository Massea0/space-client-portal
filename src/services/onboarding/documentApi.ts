// src/services/onboarding/documentApi.ts
// Service API pour la gestion des documents et contrats avec IA

import type { 
  DocumentTemplate, 
  DocumentToSign, 
  AIContractTemplate,
  GeneratedVersion,
  DocumentVariable,
  DocumentFilters,
  SignatureData
} from '@/types/onboarding';
import type { Employee } from '@/types/hr';

// ============================================================================
// SERVICE GESTION DOCUMENTS ET CONTRATS IA
// ============================================================================

class DocumentApiService {
  private baseUrl = '/api/documents';

  // Gestion des templates de documents
  async getDocumentTemplates(category?: string) {
    return this.mockGetTemplates(category);
  }

  async getDocumentTemplateById(id: string): Promise<DocumentTemplate> {
    return this.mockGetTemplateById(id);
  }

  async createDocumentTemplate(template: Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<DocumentTemplate> {
    return this.mockCreateTemplate(template);
  }

  // Génération de documents avec IA
  async generateDocumentWithAI(templateId: string, employeeData: Employee, additionalContext?: Record<string, any>): Promise<DocumentToSign> {
    return this.mockGenerateWithAI(templateId, employeeData, additionalContext);
  }

  async regenerateDocumentWithAI(documentId: string, newContext?: Record<string, any>): Promise<DocumentToSign> {
    return this.mockRegenerateWithAI(documentId, newContext);
  }

  // Gestion des documents à signer
  async getDocumentsToSign(filters?: DocumentFilters) {
    return this.mockGetDocumentsToSign(filters);
  }

  async getDocumentToSignById(id: string): Promise<DocumentToSign> {
    return this.mockGetDocumentById(id);
  }

  async sendDocumentForSignature(documentId: string, employeeEmail: string): Promise<void> {
    return this.mockSendForSignature(documentId, employeeEmail);
  }

  async signDocument(documentId: string, signatureData: SignatureData): Promise<DocumentToSign> {
    return this.mockSignDocument(documentId, signatureData);
  }

  async sendReminder(documentId: string): Promise<void> {
    return this.mockSendReminder(documentId);
  }

  // Gestion des templates IA
  async getAIContractTemplates() {
    return this.mockGetAITemplates();
  }

  async createAIContractTemplate(template: Omit<AIContractTemplate, 'id' | 'generated_versions'>): Promise<AIContractTemplate> {
    return this.mockCreateAITemplate(template);
  }

  async generateContractVersion(templateId: string, contextData: Record<string, any>): Promise<GeneratedVersion> {
    return this.mockGenerateVersion(templateId, contextData);
  }

  // ============================================================================
  // MÉTHODES POUR LA GESTION DES TEMPLATES
  // ============================================================================
  // MÉTHODES POUR LA GESTION DES TEMPLATES
  // ============================================================================

  async getTemplates(category?: string): Promise<DocumentTemplate[]> {
    // TODO: Implémenter l'appel API réel
    return this.mockGetTemplates(category);
  }

  async createTemplate(data: any): Promise<DocumentTemplate> {
    // TODO: Implémenter l'appel API réel
    console.log('Create template:', data);
    return {
      id: `tpl_${Date.now()}`,
      name: data.name || 'Nouveau template',
      type: data.type || 'employment_contract',
      category: data.category || 'contract',
      version: '1.0',
      content: data.content || '',
      variables: data.variables || [],
      requires_signature: data.requires_signature || false,
      signature_type: data.signature_type || 'electronic',
      language: data.language || 'fr',
      ai_generated: data.ai_generated || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'system',
      is_active: true
    };
  }

  async updateTemplate(id: string, data: any): Promise<DocumentTemplate> {
    // TODO: Implémenter l'appel API réel
    console.log('Update template:', id, data);
    const templates = await this.mockGetTemplates();
    const existing = templates.find(t => t.id === id);
    if (!existing) {
      throw new Error('Template not found');
    }
    return {
      ...existing,
      ...data,
      updated_at: new Date().toISOString()
    };
  }

  async deleteTemplate(id: string): Promise<void> {
    // TODO: Implémenter l'appel API réel
    console.log('Delete template:', id);
  }

  async duplicateTemplate(id: string, name: string): Promise<DocumentTemplate> {
    // TODO: Implémenter l'appel API réel
    console.log('Duplicate template:', id, name);
    const templates = await this.mockGetTemplates();
    const existing = templates.find(t => t.id === id);
    if (!existing) {
      throw new Error('Template not found');
    }
    return {
      ...existing,
      id: `tpl_${Date.now()}`,
      name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async getContractTemplates(category?: string): Promise<any[]> {
    // TODO: Implémenter l'appel API réel
    const mockTemplates = [
      {
        id: 'contract_1',
        name: 'Contrat CDI Standard',
        category: category || 'employment',
        content: 'Template de contrat CDI...',
        variables: []
      },
      {
        id: 'contract_2', 
        name: 'Contrat Freelance',
        category: 'freelance',
        content: 'Template de contrat freelance...',
        variables: []
      }
    ];
    return category ? mockTemplates.filter(t => t.category === category) : mockTemplates;
  }

  async createContractTemplate(data: any): Promise<any> {
    // TODO: Implémenter l'appel API réel
    console.log('Create contract template:', data);
    return {
      id: `contract_${Date.now()}`,
      name: data.name || 'Nouveau contrat',
      category: data.category || 'employment',
      content: data.content || '',
      variables: data.variables || [],
      created_at: new Date().toISOString()
    };
  }

  async updateContractTemplate(id: string, data: any): Promise<any> {
    // TODO: Implémenter l'appel API réel
    console.log('Update contract template:', id, data);
    return {
      id,
      ...data,
      updated_at: new Date().toISOString()
    };
  }

  async deleteContractTemplate(id: string): Promise<void> {
    // TODO: Implémenter l'appel API réel
    console.log('Delete contract template:', id);
  }

  async generateWithAI(request: any): Promise<DocumentTemplate> {
    // TODO: Implémenter l'appel API réel
    console.log('Generate with AI:', request);
    return {
      id: `ai_generated_${Date.now()}`,
      name: `Template généré par IA - ${request.type || 'Document'}`,
      type: request.type || 'employment_contract',
      category: request.category || 'contract',
      version: '1.0',
      content: `Contenu généré par IA basé sur : ${JSON.stringify(request)}`,
      variables: [],
      requires_signature: false,
      signature_type: 'electronic',
      language: 'fr',
      ai_generated: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'ai_system',
      is_active: true
    };
  }

  async optimizeTemplate(templateId: string, feedback: string): Promise<DocumentTemplate> {
    // TODO: Implémenter l'appel API réel
    console.log('Optimize template:', templateId, feedback);
    const templates = await this.mockGetTemplates();
    const existing = templates.find(t => t.id === templateId);
    if (!existing) {
      throw new Error('Template not found');
    }
    return {
      ...existing,
      content: existing.content + `\n\n<!-- Optimisé avec feedback: ${feedback} -->`,
      version: '1.1',
      updated_at: new Date().toISOString()
    };
  }

  async previewTemplate(templateId: string, sampleData: any): Promise<any> {
    // TODO: Implémenter l'appel API réel
    console.log('Preview template:', templateId, sampleData);
    return {
      templateId,
      preview_html: `<div>Aperçu du template ${templateId} avec données: ${JSON.stringify(sampleData)}</div>`,
      variables_used: Object.keys(sampleData),
      generated_at: new Date().toISOString()
    };
  }

  async testTemplateGeneration(templateId: string): Promise<any> {
    // TODO: Implémenter l'appel API réel
    console.log('Test template generation:', templateId);
    return {
      templateId,
      test_result: 'success',
      errors: [],
      warnings: [],
      sample_output: `Test de génération pour ${templateId}`,
      tested_at: new Date().toISOString()
    };
  }

  async getProcessDocuments(processId: string): Promise<any[]> {
    // TODO: Implémenter l'appel API réel
    console.log('Get process documents:', processId);
    return [
      {
        id: `doc_1_${processId}`,
        name: 'Contrat de travail',
        status: 'generated',
        type: 'employment_contract'
      },
      {
        id: `doc_2_${processId}`,
        name: 'Accord de confidentialité',
        status: 'pending',
        type: 'confidentiality_agreement'
      }
    ];
  }

  async generateDocuments(processId: string): Promise<any[]> {
    // TODO: Implémenter l'appel API réel
    console.log('Generate documents for process:', processId);
    return [
      {
        id: `generated_doc_${Date.now()}`,
        processId,
        name: 'Document généré',
        status: 'ready',
        generated_at: new Date().toISOString()
      }
    ];
  }

  async approveDocument(documentId: string): Promise<any> {
    // TODO: Implémenter l'appel API réel
    console.log('Approve document:', documentId);
    return {
      id: documentId,
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: 'current_user'
    };
  }

  async getDocumentSignatures(processId: string): Promise<any[]> {
    // TODO: Implémenter l'appel API réel
    console.log('Get document signatures:', processId);
    return [
      {
        id: `sig_1_${processId}`,
        document_id: `doc_1_${processId}`,
        signer_email: 'employee@example.com',
        status: 'pending',
        sent_at: new Date().toISOString()
      }
    ];
  }

  async getSignatureProviders(): Promise<any[]> {
    // TODO: Implémenter l'appel API réel
    return [
      {
        id: 'docusign',
        name: 'DocuSign',
        status: 'active',
        supported_formats: ['pdf', 'docx']
      },
      {
        id: 'adobe_sign',
        name: 'Adobe Sign',
        status: 'active',
        supported_formats: ['pdf']
      }
    ];
  }

  async initializeSignature(documentId: string, employeeId: string): Promise<any> {
    // TODO: Implémenter l'appel API réel
    console.log('Initialize signature:', documentId, employeeId);
    return {
      signature_id: `sig_${Date.now()}`,
      document_id: documentId,
      employee_id: employeeId,
      status: 'initialized',
      signing_url: `https://signature.example.com/sign/${documentId}`,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  async sendSignatureRequest(documentId: string, employeeEmail: string): Promise<void> {
    // TODO: Implémenter l'appel API réel
    console.log(`Sending signature request for document ${documentId} to ${employeeEmail}`);
  }

  async checkSignatureStatus(documentId: string): Promise<any> {
    // TODO: Implémenter l'appel API réel
    console.log('Check signature status:', documentId);
    return {
      document_id: documentId,
      status: 'pending',
      last_checked: new Date().toISOString(),
      signer_actions: []
    };
  }

  async cancelSignature(documentId: string): Promise<void> {
    // TODO: Implémenter l'appel API réel
    console.log('Cancel signature:', documentId);
  }

  async configureSignatureProvider(providerId: string, config: any): Promise<any> {
    // TODO: Implémenter l'appel API réel
    console.log('Configure signature provider:', providerId, config);
    return {
      provider_id: providerId,
      status: 'configured',
      config: config,
      configured_at: new Date().toISOString()
    };
  }

  // ============================================================================
  // MÉTHODES MOCK (À REMPLACER PAR LES VRAIES API)
  // ============================================================================

  private async mockGetTemplates(category?: string): Promise<DocumentTemplate[]> {
    const allTemplates: DocumentTemplate[] = [
      {
        id: 'tpl_employment_contract',
        name: 'Contrat de Travail CDI',
        type: 'employment_contract',
        category: 'contract',
        version: '1.2',
        content: `
# CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE

Entre les soussignés :

**L'ENTREPRISE :**
{{company_name}}
{{company_address}}
{{company_legal_form}}
Représentée par {{company_representative}}

**LE SALARIÉ :**
{{employee_first_name}} {{employee_last_name}}
Né(e) le {{employee_birth_date}}
Demeurant {{employee_address}}

## ARTICLE 1 - ENGAGEMENT

L'entreprise engage {{employee_first_name}} {{employee_last_name}} en qualité de {{position_title}} à compter du {{start_date}}.

## ARTICLE 2 - RÉMUNÉRATION

Le salaire brut mensuel est fixé à {{salary_amount}} {{salary_currency}}.

## ARTICLE 3 - LIEU DE TRAVAIL

Le lieu de travail est situé à {{workplace_address}}.
{{#if remote_work_allowed}}
Le télétravail est autorisé selon les modalités définies dans l'accord d'entreprise.
{{/if}}

## ARTICLE 4 - DURÉE DU TRAVAIL

La durée hebdomadaire de travail est de {{weekly_hours}} heures.

## ARTICLE 5 - CONGÉS

Le salarié bénéficie des congés payés légaux et conventionnels.

## ARTICLE 6 - PÉRIODE D'ESSAI

{{#if probation_period}}
Une période d'essai de {{probation_duration}} est prévue.
{{/if}}

Date : {{contract_date}}

Signatures :
L'Employeur : ________________
Le Salarié : ________________
        `,
        variables: [
          { key: 'company_name', label: 'Nom de l\'entreprise', type: 'text', required: true, source: 'system_generated' },
          { key: 'employee_first_name', label: 'Prénom', type: 'text', required: true, source: 'employee_data', source_field: 'first_name' },
          { key: 'employee_last_name', label: 'Nom', type: 'text', required: true, source: 'employee_data', source_field: 'last_name' },
          { key: 'position_title', label: 'Intitulé du poste', type: 'text', required: true, source: 'employee_data', source_field: 'position.title' },
          { key: 'salary_amount', label: 'Montant salaire', type: 'number', required: true, source: 'employee_data', source_field: 'current_salary' },
          { key: 'start_date', label: 'Date de début', type: 'date', required: true, source: 'employee_data', source_field: 'hire_date' },
          { key: 'weekly_hours', label: 'Heures par semaine', type: 'number', default_value: '35', required: true, source: 'manual_input' }
        ],
        requires_signature: true,
        signature_type: 'electronic',
        language: 'fr',
        ai_generated: false,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-06-01T00:00:00Z',
        created_by: 'admin',
        is_active: true
      },
      {
        id: 'tpl_confidentiality_agreement',
        name: 'Accord de Confidentialité',
        type: 'confidentiality_agreement',
        category: 'legal',
        version: '1.1',
        content: `
# ACCORD DE CONFIDENTIALITÉ

Entre :
**{{company_name}}** et **{{employee_first_name}} {{employee_last_name}}**

## DÉFINITIONS

Par "Informations Confidentielles", on entend toute information propriétaire, technique, commerciale ou financière de l'entreprise.

## OBLIGATIONS

Le salarié s'engage à :
- Préserver la confidentialité des informations
- Ne pas divulguer d'informations à des tiers
- Restituer tous documents en fin de contrat

## DURÉE

Cet accord reste valide pendant toute la durée du contrat de travail et {{confidentiality_duration}} années après sa fin.

Date : {{agreement_date}}
Signatures :
        `,
        variables: [
          { key: 'company_name', label: 'Nom de l\'entreprise', type: 'text', required: true, source: 'system_generated' },
          { key: 'employee_first_name', label: 'Prénom', type: 'text', required: true, source: 'employee_data', source_field: 'first_name' },
          { key: 'employee_last_name', label: 'Nom', type: 'text', required: true, source: 'employee_data', source_field: 'last_name' },
          { key: 'confidentiality_duration', label: 'Durée (années)', type: 'number', default_value: '2', required: true, source: 'manual_input' }
        ],
        requires_signature: true,
        signature_type: 'electronic',
        language: 'fr',
        ai_generated: true,
        ai_model: 'gpt-4',
        ai_prompt_template: 'Génère un accord de confidentialité pour {{position_title}} incluant les spécificités du secteur {{company_sector}}',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-06-01T00:00:00Z',
        created_by: 'admin',
        is_active: true
      },
      {
        id: 'tpl_equipment_agreement',
        name: 'Accord d\'Attribution de Matériel',
        type: 'equipment_agreement',
        category: 'form',
        version: '1.0',
        content: `
# ACCORD D'ATTRIBUTION DE MATÉRIEL INFORMATIQUE

**Bénéficiaire :** {{employee_first_name}} {{employee_last_name}}
**Poste :** {{position_title}}
**Date d'attribution :** {{assignment_date}}

## MATÉRIEL ATTRIBUÉ

{{#each equipment_list}}
- {{name}} ({{model}}) - Numéro de série : {{serial_number}}
{{/each}}

## ENGAGEMENTS DU BÉNÉFICIAIRE

Le bénéficiaire s'engage à :
- Utiliser le matériel exclusivement dans le cadre professionnel
- Prendre soin du matériel et le maintenir en bon état
- Signaler immédiatement tout dysfonctionnement
- Restituer le matériel en fin de contrat

## RESPONSABILITÉS

En cas de perte, vol ou dégradation due à une négligence, le bénéficiaire pourra être tenu responsable.

Signatures :
Le bénéficiaire : ________________
Le responsable IT : ________________
        `,
        variables: [
          { key: 'employee_first_name', label: 'Prénom', type: 'text', required: true, source: 'employee_data', source_field: 'first_name' },
          { key: 'employee_last_name', label: 'Nom', type: 'text', required: true, source: 'employee_data', source_field: 'last_name' },
          { key: 'position_title', label: 'Intitulé du poste', type: 'text', required: true, source: 'employee_data', source_field: 'position.title' },
          { key: 'assignment_date', label: 'Date d\'attribution', type: 'date', required: true, source: 'system_generated' }
        ],
        requires_signature: true,
        signature_type: 'electronic',
        language: 'fr',
        ai_generated: false,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        created_by: 'admin',
        is_active: true
      },
      {
        id: 'tpl_code_of_conduct',
        name: 'Code de Conduite',
        type: 'code_of_conduct',
        category: 'policy',
        version: '2.0',
        content: `
# CODE DE CONDUITE

## VALEURS DE L'ENTREPRISE

Chez {{company_name}}, nous nous engageons à maintenir les plus hauts standards éthiques.

## PRINCIPES FONDAMENTAUX

### Respect et Intégrité
- Traiter tous les collègues avec respect
- Agir avec honnêteté et transparence
- Respecter la diversité et l'inclusion

### Confidentialité
- Protéger les informations confidentielles
- Respecter la vie privée des collègues et clients

### Responsabilité Professionnelle
- Accomplir ses missions avec diligence
- Respecter les délais et engagements
- Signaler tout manquement éthique

## SANCTIONS

Tout manquement à ce code peut entraîner des sanctions disciplinaires.

J'ai lu et compris le code de conduite :
{{employee_first_name}} {{employee_last_name}}
Date : {{acknowledgment_date}}
Signature : ________________
        `,
        variables: [
          { key: 'company_name', label: 'Nom de l\'entreprise', type: 'text', required: true, source: 'system_generated' },
          { key: 'employee_first_name', label: 'Prénom', type: 'text', required: true, source: 'employee_data', source_field: 'first_name' },
          { key: 'employee_last_name', label: 'Nom', type: 'text', required: true, source: 'employee_data', source_field: 'last_name' },
          { key: 'acknowledgment_date', label: 'Date d\'accusé', type: 'date', required: true, source: 'system_generated' }
        ],
        requires_signature: true,
        signature_type: 'electronic',
        language: 'fr',
        ai_generated: true,
        ai_model: 'claude-3',
        ai_prompt_template: 'Adapte le code de conduite pour une entreprise {{company_sector}} de {{company_size}} employés',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-03-01T00:00:00Z',
        created_by: 'admin',
        is_active: true
      }
    ];

    return category ? allTemplates.filter(t => t.category === category) : allTemplates;
  }

  private async mockGetTemplateById(id: string): Promise<DocumentTemplate> {
    const templates = await this.mockGetTemplates();
    const template = templates.find(t => t.id === id);
    if (!template) throw new Error('Template non trouvé');
    return template;
  }

  private async mockCreateTemplate(template: Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<DocumentTemplate> {
    const newTemplate: DocumentTemplate = {
      ...template,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return newTemplate;
  }

  private async mockGenerateWithAI(templateId: string, employeeData: Employee, additionalContext?: Record<string, any>): Promise<DocumentToSign> {
    const template = await this.mockGetTemplateById(templateId);
    
    // Simulation de génération IA
    const generatedContent = this.processTemplate(template.content, employeeData, additionalContext);
    
    const document: DocumentToSign = {
      id: Date.now().toString(),
      template_id: templateId,
      employee_id: employeeData.id,
      generated_content: generatedContent,
      status: 'pending',
      reminder_count: 0
    };

    return document;
  }

  private async mockRegenerateWithAI(documentId: string, newContext?: Record<string, any>): Promise<DocumentToSign> {
    // Simulation de régénération
    const document = await this.mockGetDocumentById(documentId);
    return {
      ...document,
      generated_content: document.generated_content + '\n\n[Régénéré avec nouveau contexte]'
    };
  }

  private async mockGetDocumentsToSign(filters?: DocumentFilters): Promise<DocumentToSign[]> {
    return [
      {
        id: 'doc_contract_1',
        template_id: 'tpl_employment_contract',
        employee_id: '1',
        generated_content: 'Contrat de travail pour Marie Martin...',
        status: 'sent',
        sent_at: '2025-07-02T09:00:00Z',
        expires_at: '2025-07-09T23:59:59Z',
        reminder_count: 1,
        last_reminder_at: '2025-07-04T09:00:00Z'
      },
      {
        id: 'doc_confidentiality_1',
        template_id: 'tpl_confidentiality_agreement',
        employee_id: '1',
        generated_content: 'Accord de confidentialité pour Marie Martin...',
        status: 'pending',
        reminder_count: 0
      }
    ];
  }

  private async mockGetDocumentById(id: string): Promise<DocumentToSign> {
    const documents = await this.mockGetDocumentsToSign();
    const document = documents.find(d => d.id === id);
    if (!document) throw new Error('Document non trouvé');
    return document;
  }

  private async mockSendForSignature(documentId: string, employeeEmail: string): Promise<void> {
    console.log(`Document ${documentId} envoyé à ${employeeEmail} pour signature`);
  }

  private async mockSignDocument(documentId: string, signatureData: SignatureData): Promise<DocumentToSign> {
    const document = await this.mockGetDocumentById(documentId);
    return {
      ...document,
      status: 'signed',
      signature_data: signatureData,
      signed_at: new Date().toISOString()
    };
  }

  private async mockSendReminder(documentId: string): Promise<void> {
    console.log(`Rappel envoyé pour le document ${documentId}`);
  }

  private async mockGetAITemplates(): Promise<AIContractTemplate[]> {
    return [
      {
        id: 'ai_tpl_smart_contract',
        name: 'Contrat Intelligent Adaptatif',
        type: 'employment_contract',
        ai_model: 'gpt-4',
        base_prompt: `Génère un contrat de travail adapté pour un poste de {{position_title}} dans le secteur {{company_sector}}.
        
Inclus automatiquement :
- Les clauses spécifiques au secteur d'activité
- Les obligations réglementaires du pays {{country}}
- Les avantages standards pour ce type de poste
- Les clauses de télétravail si applicable pour {{position_title}}

Adapte le langage et les termes selon le niveau du poste (junior/senior/manager).`,
        enhancement_prompt: 'Améliore le contrat en ajoutant des clauses de protection des données et de non-concurrence adaptées au secteur.',
        context_variables: [
          {
            key: 'position_title',
            description: 'Intitulé exact du poste',
            type: 'position',
            source_mapping: 'position.title',
            is_required: true
          },
          {
            key: 'company_sector',
            description: 'Secteur d\'activité de l\'entreprise',
            type: 'company',
            source_mapping: 'company.sector',
            is_required: true
          },
          {
            key: 'country',
            description: 'Pays d\'application du contrat',
            type: 'legal',
            source_mapping: 'branch.country',
            is_required: true
          }
        ],
        legal_requirements: [
          {
            jurisdiction: 'FR',
            requirement_type: 'mandatory_clause',
            description: 'Clause de période d\'essai selon le Code du travail français',
            legal_text: 'La période d\'essai ne peut excéder...',
            reference: 'Article L1221-19 du Code du travail'
          }
        ],
        generated_versions: [],
        requires_legal_review: true
      }
    ];
  }

  private async mockCreateAITemplate(template: Omit<AIContractTemplate, 'id' | 'generated_versions'>): Promise<AIContractTemplate> {
    const newTemplate: AIContractTemplate = {
      ...template,
      id: Date.now().toString(),
      generated_versions: []
    };
    return newTemplate;
  }

  private async mockGenerateVersion(templateId: string, contextData: Record<string, any>): Promise<GeneratedVersion> {
    const version: GeneratedVersion = {
      id: Date.now().toString(),
      template_id: templateId,
      version: '1.0.0',
      content: 'Contrat généré par IA avec les données contextuelles...',
      generated_at: new Date().toISOString(),
      ai_model_used: 'gpt-4',
      prompt_used: 'Prompt utilisé pour la génération...',
      context_data: contextData,
      status: 'draft'
    };
    return version;
  }

  private processTemplate(template: string, employeeData: Employee, additionalContext?: Record<string, any>): string {
    // Simulation simple de traitement de template
    let processed = template;
    
    // Remplacements basiques
    processed = processed.replace(/{{employee_first_name}}/g, employeeData.first_name);
    processed = processed.replace(/{{employee_last_name}}/g, employeeData.last_name);
    processed = processed.replace(/{{position_title}}/g, employeeData.position?.title || 'Non défini');
    processed = processed.replace(/{{salary_amount}}/g, employeeData.current_salary?.toString() || '0');
    processed = processed.replace(/{{start_date}}/g, employeeData.hire_date);
    
    // Contexte additionnel
    if (additionalContext) {
      Object.entries(additionalContext).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        processed = processed.replace(regex, String(value));
      });
    }
    
    // Valeurs par défaut du système
    processed = processed.replace(/{{company_name}}/g, 'MySpace Enterprise');
    processed = processed.replace(/{{contract_date}}/g, new Date().toLocaleDateString('fr-FR'));
    processed = processed.replace(/{{assignment_date}}/g, new Date().toLocaleDateString('fr-FR'));
    processed = processed.replace(/{{acknowledgment_date}}/g, new Date().toLocaleDateString('fr-FR'));
    
    return processed;
  }
}

export const documentApi = new DocumentApiService();
