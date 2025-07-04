// Edge Function: generate-contract-draft
// Mission 1: AI-Powered Contract Lifecycle Management
// Génère un brouillon de contrat intelligent à partir d'un devis accepté

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import du client Gemini partagé
import { GeminiClient } from '../_shared/gemini-client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContractGenerationRequest {
  devis_id: string;
  contract_type?: 'service' | 'maintenance' | 'consulting' | 'license';
  custom_clauses?: string[];
  template_id?: string;
}

interface ContractDraft {
  content: string;
  clauses_summary: any;
  risk_analysis: any;
  compliance_score: number;
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

    const { devis_id, contract_type = 'service', custom_clauses = [], template_id } = await req.json() as ContractGenerationRequest;

    if (!devis_id) {
      return new Response(
        JSON.stringify({ error: 'devis_id is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // 1. Récupération des données du devis et du client
    const { data: devis, error: devisError } = await supabaseClient
      .from('devis')
      .select(`
        *,
        companies:company_id (
          id, name, email, phone, address
        ),
        devis_items (
          id, description, quantity, unit_price, total
        )
      `)
      .eq('id', devis_id)
      .eq('status', 'approved')
      .single();

    if (devisError || !devis) {
      return new Response(
        JSON.stringify({ error: 'Devis not found or not approved' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // 2. Récupération d'un template si spécifié
    let templateContent = '';
    if (template_id) {
      const { data: template } = await supabaseClient
        .from('contract_templates')
        .select('template_content, clauses')
        .eq('id', template_id)
        .single();
      
      if (template) {
        templateContent = template.template_content;
      }
    }

    // 3. Construction du prompt pour Gemini
    const geminiClient = new GeminiClient();
    
    const systemPrompt = `Tu es un expert juridique spécialisé dans la rédaction de contrats informatiques et de services numériques. 
    Ta tâche est de générer un contrat professionnel en français, adapté aux entreprises sénégalaises et au droit OHADA.
    
    RÈGLES IMPORTANTES:
    - Utilise un langage juridique précis mais accessible
    - Inclus toutes les clauses essentielles (objet, durée, prix, obligations, résiliation)
    - Adapte les montants en FCFA 
    - Respecte les normes OHADA
    - Génère un contrat complet prêt à être signé
    - Inclus les clauses de confidentialité et de propriété intellectuelle
    - Prévois les modalités de paiement adaptées au contexte local`;

    const promptData = {
      devis: {
        number: devis.number,
        object: devis.object,
        amount: devis.amount,
        items: devis.devis_items
      },
      client: devis.companies,
      contract_type,
      custom_clauses,
      template: templateContent
    };

    const userPrompt = `Génère un contrat de ${contract_type} basé sur ce devis approuvé:

DEVIS:
- Numéro: ${devis.number}
- Objet: ${devis.object}
- Montant: ${devis.amount} FCFA
- Client: ${devis.companies?.name}

PRESTATIONS:
${devis.devis_items?.map(item => 
  `- ${item.description} (${item.quantity} x ${item.unit_price} FCFA = ${item.total} FCFA)`
).join('\n')}

${custom_clauses.length > 0 ? `CLAUSES SPÉCIALES DEMANDÉES:\n${custom_clauses.join('\n')}` : ''}

${templateContent ? `TEMPLATE DE BASE:\n${templateContent}` : ''}

RETOURNE un JSON avec cette structure exacte:
{
  "content": "Le contrat complet en HTML formaté",
  "clauses_summary": {
    "service_clauses": ["liste des clauses de service"],
    "payment_clauses": ["clauses de paiement"],
    "confidentiality_clauses": ["clauses de confidentialité"],
    "liability_clauses": ["clauses de responsabilité"],
    "termination_clauses": ["clauses de résiliation"]
  },
  "risk_analysis": {
    "financial_risks": ["risques financiers identifiés"],
    "legal_risks": ["risques juridiques"],
    "operational_risks": ["risques opérationnels"],
    "recommendations": ["recommandations pour mitiger les risques"]
  },
  "compliance_score": 85
}`;

    // 4. Génération du contrat via Gemini
    const aiResponse = await geminiClient.generateContent({
      prompt: userPrompt,
      systemPrompt,
      temperature: 0.3,
      maxTokens: 4000
    });

    if (!aiResponse.success || !aiResponse.content) {
      throw new Error('Échec de la génération du contrat par IA');
    }

    // 5. Parsing de la réponse JSON
    let contractDraft: ContractDraft;
    try {
      contractDraft = JSON.parse(aiResponse.content);
    } catch (e) {
      // Fallback si la réponse n'est pas du JSON valide
      contractDraft = {
        content: aiResponse.content,
        clauses_summary: {
          service_clauses: ["Clauses de service à définir"],
          payment_clauses: [`Paiement de ${devis.amount} FCFA selon échéancier`],
          confidentiality_clauses: ["Clause de confidentialité standard"],
          liability_clauses: ["Limitation de responsabilité"],
          termination_clauses: ["Résiliation possible avec préavis"]
        },
        risk_analysis: {
          financial_risks: ["Risque de non-paiement"],
          legal_risks: ["Conformité OHADA à vérifier"],
          operational_risks: ["Délais de livraison"],
          recommendations: ["Révision juridique recommandée"]
        },
        compliance_score: 75
      };
    }

    // 6. Génération du numéro de contrat
    const contractNumber = `CTR-${Date.now().toString().slice(-6)}-${devis.number.split('-')[1] || 'XX'}`;

    // 7. Sauvegarde du contrat en base
    const { data: contract, error: contractError } = await supabaseClient
      .from('contracts')
      .insert({
        contract_number: contractNumber,
        title: `Contrat de ${contract_type} - ${devis.object}`,
        object: devis.object,
        client_id: devis.company_id,
        devis_id: devis.id,
        status: 'draft',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +1 an
        amount: devis.amount,
        currency: 'XOF',
        contract_type,
        clauses_summary: contractDraft.clauses_summary,
        risk_analysis: contractDraft.risk_analysis,
        compliance_score: contractDraft.compliance_score,
        content_preview: contractDraft.content.substring(0, 500) + '...',
        ai_generated: true,
        created_by: 'ai-generator'
      })
      .select()
      .single();

    if (contractError) {
      console.error('Erreur sauvegarde contrat:', contractError);
      throw new Error('Échec de la sauvegarde du contrat');
    }

    // 8. Sauvegarde du contenu complet dans Supabase Storage (optionnel)
    const fileName = `contracts/${contract.id}/content.html`;
    const { error: storageError } = await supabaseClient.storage
      .from('documents')
      .upload(fileName, contractDraft.content, {
        contentType: 'text/html',
        upsert: true
      });

    if (!storageError) {
      // Mise à jour avec l'URL de stockage
      await supabaseClient
        .from('contracts')
        .update({ 
          content_storage_url: `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/documents/${fileName}`
        })
        .eq('id', contract.id);
    }

    // 9. Log de l'activité
    await supabaseClient
      .from('client_activity_logs')
      .insert({
        activity_type: 'contract_generated',
        details: {
          contract_id: contract.id,
          devis_id: devis.id,
          ai_generated: true,
          contract_type,
          amount: devis.amount
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        contract: {
          ...contract,
          content: contractDraft.content
        },
        ai_usage: aiResponse.usage
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur génération contrat:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur interne du serveur',
        details: error.toString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
