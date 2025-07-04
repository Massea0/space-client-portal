// supabase/functions/generate-contract-draft/index.ts
// Mission 1: Edge Function pour la génération de contrats IA

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import du client Gemini partagé
import { GeminiClient } from '../_shared/gemini-client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContractGenerationRequest {
  devisId: string;
  clientId: string;
  templateType: 'service' | 'maintenance' | 'consulting' | 'licensing';
  customClauses?: string[];
  specificRequirements?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { devisId, clientId, templateType, customClauses, specificRequirements } = await req.json() as ContractGenerationRequest;
    
    console.log('Génération de contrat IA:', { devisId, clientId, templateType });

    // 1. Récupérer le devis source
    const { data: devis, error: devisError } = await supabaseClient
      .from('devis')
      .select(`
        *,
        companies:company_id (
          id, name, email, address
        )
      `)
      .eq('id', devisId)
      .single();

    if (devisError || !devis) {
      throw new Error(`Devis introuvable: ${devisError?.message || 'ID invalide'}`);
    }

    // 2. Générer le numéro de contrat unique
    const year = new Date().getFullYear();
    const { count } = await supabaseClient
      .from('contracts')
      .select('*', { count: 'exact', head: true })
      .like('contract_number', `CTR-${year}-%`);
    
    const contractNumber = `CTR-${year}-${String((count || 0) + 1).padStart(3, '0')}`;

    // 3. Générer le contenu du contrat avec IA (simulation pour l'instant)
    const aiGeneratedContent = await generateContractContent({
      devis,
      client: devis.companies,
      templateType,
      customClauses: customClauses || [],
      specificRequirements: specificRequirements || ''
    });

    // 4. Calculer les scores IA
    const complianceScore = calculateComplianceScore(aiGeneratedContent, templateType);
    const aiConfidenceScore = calculateAIConfidenceScore(aiGeneratedContent);

    // 5. Créer le contrat dans la base
    const newContract = {
      client_id: clientId,
      devis_id: devisId,
      contract_number: contractNumber,
      title: `Contrat ${templateType} - ${devis.companies?.name || 'Client'}`,
      object: devis.object || 'Prestation de services',
      status: 'draft',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // +1 an
      amount: devis.amount || 0,
      currency: 'EUR',
      payment_terms: '30 jours',
      content_preview: aiGeneratedContent.preview,
      clauses_summary: aiGeneratedContent.clausesSummary,
      compliance_score: complianceScore,
      ai_confidence_score: aiConfidenceScore,
      generated_by_ai: true,
      template_used: `Template ${templateType} IA`,
      contract_type: templateType,
      risk_analysis: aiGeneratedContent.riskAnalysis,
      obligations_monitoring: {
        client_obligations: [],
        provider_obligations: [],
        next_milestones: []
      },
      auto_renewal: false
    };

    const { data: contract, error: contractError } = await supabaseClient
      .from('contracts')
      .insert(newContract)
      .select()
      .single();

    if (contractError) {
      throw new Error(`Erreur création contrat: ${contractError.message}`);
    }

    console.log('Contrat généré avec succès:', contract.id);

    return new Response(
      JSON.stringify({
        success: true,
        contract_id: contract.id,
        contract: {
          contractId: contract.id,
          contractNumber: contract.contract_number,
          ...contract
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erreur génération contrat:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// --- Fonctions auxiliaires ---

async function generateContractContent(params: {
  devis: any;
  client: any;
  templateType: string;
  customClauses: string[];
  specificRequirements: string;
}) {
  const { devis, client, templateType, customClauses, specificRequirements } = params;
  
  // 1. Initialiser le client Gemini
  const geminiClient = new GeminiClient();
  
  // 2. Préparer le prompt d'instruction système pour Gemini
  const systemPrompt = `Tu es un expert juridique spécialisé dans la rédaction de contrats commerciaux 
  conformes au droit OHADA et à la législation sénégalaise. 
  Tu dois générer un contrat professionnel détaillé et juridiquement solide.
  
  DIRECTIVES:
  - Utilise un format professionnel et juridiquement précis
  - Inclus toutes les clauses standards nécessaires
  - Adapte le contenu aux spécificités du type de contrat
  - Respecte les exigences spécifiques du client
  - Assure la conformité avec le droit OHADA
  - Utilise un langage clair et sans ambiguïté
  - Inclus les clauses de confidentialité appropriées
  - Structure clairement les obligations de chaque partie`;

  // 3. Construire le prompt principal pour la génération
  const today = new Date();
  const endDate = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000); // +1 an par défaut
  
  const userPrompt = `GÉNÉRATION DE CONTRAT DE ${templateType.toUpperCase()}
  
  INFORMATIONS DE BASE:
  - Type de contrat: ${templateType}
  - Client: ${client?.name || 'Client'} (${client?.email || 'Email non fourni'})
  - Adresse client: ${client?.address || 'Adresse non fournie'}
  - Objet du contrat: ${devis.object || 'Non spécifié'}
  - Montant: ${devis.amount || 0} ${devis.currency || 'EUR'}
  - Date de début: ${today.toISOString().split('T')[0]}
  - Date de fin: ${endDate.toISOString().split('T')[0]}
  
  CLAUSES SPÉCIFIQUES À INCLURE:
  ${customClauses.length > 0 ? customClauses.map(c => `- ${c}`).join('\n') : '- Clauses standard pour ce type de contrat'}
  
  EXIGENCES PARTICULIÈRES:
  ${specificRequirements || 'Aucune exigence particulière spécifiée'}
  
  RETOURNE LE CONTRAT COMPLET, FORMATÉ COMME UN DOCUMENT JURIDIQUE PROFESSIONNEL.
  ASSURE-TOI QU'IL Y A AU MOINS 8-12 CLAUSES BIEN DÉTAILLÉES.
  À LA FIN, AJOUTE UNE SECTION JSON AVEC UN RÉSUMÉ DU CONTRAT DANS CE FORMAT:
  
  {
    "clausesSummary": {
      "total_clauses": 10,
      "key_terms": ["terme1", "terme2", "terme3"],
      "payment_schedule": "description",
      "liability_cap": "montant",
      "termination_notice": "délai"
    },
    "riskAnalysis": {
      "overall_score": 85,
      "risks": {
        "financial": 15,
        "legal": 10,
        "operational": 20,
        "compliance": 5
      },
      "recommendations": ["rec1", "rec2", "rec3"],
      "flagged_clauses": ["clause1", "clause2"]
    }
  }`;

  // 4. Appel à Gemini pour la génération
  const geminiResponse = await geminiClient.generateContent({
    prompt: userPrompt,
    systemPrompt: systemPrompt,
    temperature: 0.2,
    maxTokens: 4096
  });

  // 5. Gestion des erreurs et fallback
  if (!geminiResponse.success || !geminiResponse.content) {
    console.error('Erreur génération contrat avec Gemini:', geminiResponse.error);
    
    // Fallback avec un contrat de base
    const fallbackPreview = `CONTRAT DE ${templateType.toUpperCase()} (MODE FALLBACK)

Entre :
- ${client?.name || 'Client'}, ci-après dénommé "le Client"
- DExchange, ci-après dénommé "le Prestataire"

OBJET : ${devis.object}
MONTANT : ${devis.amount} ${devis.currency || 'EUR'}
DURÉE : Du ${today.toISOString().split('T')[0]} au ${endDate.toISOString().split('T')[0]}

CLAUSES PRINCIPALES :
${customClauses.length > 0 ? customClauses.map(c => `- ${c}`).join('\n') : '- Prestations conformes au devis'}

${specificRequirements ? `EXIGENCES SPÉCIFIQUES :\n${specificRequirements}` : ''}

[Contrat généré en mode fallback - Version préliminaire]`;

    const fallbackClausesSummary = {
      total_clauses: 8 + customClauses.length,
      key_terms: [devis.object, templateType, ...customClauses.slice(0, 3)],
      payment_schedule: 'Selon modalités du devis',
      liability_cap: `${Math.floor(devis.amount * 1.5)} ${devis.currency || 'EUR'}`,
      termination_notice: templateType === 'service' ? '30 jours' : '60 jours'
    };

    const fallbackRiskAnalysis = {
      overall_score: 70,
      risks: {
        financial: 20,
        legal: 15,
        operational: 15,
        compliance: 10
      },
      recommendations: [
        'Réviser les clauses de paiement',
        'Clarifier les conditions de résiliation',
        'Ajouter une clause de force majeure'
      ],
      flagged_clauses: []
    };

    return {
      preview: fallbackPreview,
      clausesSummary: fallbackClausesSummary,
      riskAnalysis: fallbackRiskAnalysis
    };
  }

  // 6. Traiter la réponse de Gemini
  const contractContent = geminiResponse.content;
  
  // 7. Extraire le preview (le contrat lui-même)
  const preview = contractContent.split('{')[0].trim();
  
  // 8. Extraire et parser le JSON de résumé
  let clausesSummary, riskAnalysis;
  try {
    const jsonMatch = contractContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonData = JSON.parse(jsonMatch[0]);
      clausesSummary = jsonData.clausesSummary;
      riskAnalysis = jsonData.riskAnalysis;
    } else {
      throw new Error('Format JSON non trouvé');
    }
  } catch (e) {
    console.error('Erreur parsing JSON:', e);
    clausesSummary = {
      total_clauses: 8 + customClauses.length,
      key_terms: [devis.object, templateType, ...customClauses.slice(0, 3)],
      payment_schedule: 'Selon modalités du devis',
      liability_cap: `${Math.floor(devis.amount * 1.5)} ${devis.currency || 'EUR'}`,
      termination_notice: templateType === 'service' ? '30 jours' : '60 jours'
    };

    riskAnalysis = {
      overall_score: 75,
      risks: {
        financial: 15,
        legal: 10,
        operational: 12,
        compliance: 8
      },
      recommendations: [
        'Réviser les clauses de paiement',
        'Clarifier les conditions de résiliation',
        'Ajouter une clause de force majeure'
      ],
      flagged_clauses: []
    };
  }

  return {
    preview,
    clausesSummary,
    riskAnalysis
  };
}

function calculateComplianceScore(content: any, templateType: string): number {
  // Calcul plus sophistiqué du score de conformité
  if (content.riskAnalysis && typeof content.riskAnalysis.overall_score === 'number') {
    // Si le modèle a fourni un score, utilisons-le comme base
    const baseScore = content.riskAnalysis.overall_score;
    
    // Ajustements basés sur d'autres facteurs
    let adjustments = 0;
    
    // Bonus pour les contrats avec beaucoup de clauses
    if (content.clausesSummary && content.clausesSummary.total_clauses >= 10) {
      adjustments += 5;
    }
    
    // Bonus pour les contrats de service (généralement plus standardisés)
    if (templateType === 'service') {
      adjustments += 3;
    }
    
    // Malus pour les contrats avec beaucoup de risques financiers
    if (content.riskAnalysis.risks && content.riskAnalysis.risks.financial > 20) {
      adjustments -= 5;
    }
    
    // Malus pour les contrats avec des clauses signalées
    if (content.riskAnalysis.flagged_clauses && content.riskAnalysis.flagged_clauses.length > 0) {
      adjustments -= 3 * Math.min(3, content.riskAnalysis.flagged_clauses.length);
    }
    
    return Math.min(100, Math.max(1, baseScore + adjustments));
  }
  
  // Fallback si pas de score dans la réponse
  return 80;
}

function calculateAIConfidenceScore(content: any): number {
  // Calcul plus intelligent du score de confiance IA
  
  // Score de base variable selon la qualité du contenu
  let score = 85; // Score optimisé par défaut avec Gemini
  
  // Facteurs qui réduisent la confiance
  const negativeFactors: string[] = [];
  
  // Vérifier si le contenu JSON a été correctement extrait
  if (!content.clausesSummary || !content.riskAnalysis) {
    score -= 25;
    negativeFactors.push("parsing_error");
  }
  
  // Vérifier la longueur du contenu (indicateur de qualité)
  if (content.preview && content.preview.length < 1000) {
    score -= 15;
    negativeFactors.push("short_content");
  }
  
  // Vérifier si l'analyse de risque est cohérente
  if (content.riskAnalysis && 
      (!content.riskAnalysis.risks || 
       typeof content.riskAnalysis.overall_score !== 'number')) {
    score -= 10;
    negativeFactors.push("incomplete_analysis");
  }
  
  // Log des facteurs qui ont réduit le score
  if (negativeFactors.length > 0) {
    console.log('Facteurs réduisant le score de confiance IA:', negativeFactors);
  }
  
  return Math.min(100, Math.max(50, score));
}
