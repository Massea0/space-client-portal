// supabase/functions/analyze-contract-compliance/index.ts
// Mission 1: Edge Function pour l'analyse de conformité des contrats

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import du client Gemini partagé
import { GeminiClient } from '../_shared/gemini-client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContractAnalysisRequest {
  contractId: string;
  analysisType?: 'full' | 'compliance' | 'risk' | 'clauses';
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

    // Valider le body de la requête
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Body de requête JSON invalide'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const { contractId } = requestBody as ContractAnalysisRequest;

    if (!contractId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'contractId est requis'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log('Analyse de conformité:', { contractId });

    // 1. Récupérer le contrat
    const { data: contract, error: contractError } = await supabaseClient
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (contractError || !contract) {
      console.error('Erreur contrat:', contractError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Contrat introuvable: ${contractError?.message || 'ID invalide'}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // 2. Récupération du contenu à analyser
    let contractContent = contract.content;
    
    if (!contractContent && contract.content_storage_url) {
      // Récupération depuis Supabase Storage
      try {
        const storageResponse = await fetch(contract.content_storage_url);
        if (storageResponse.ok) {
          contractContent = await storageResponse.text();
        }
      } catch (e) {
        console.error('Impossible de récupérer le contenu depuis Storage:', e);
      }
    }

    if (!contractContent) {
      contractContent = contract.content_preview || 'Contenu non disponible pour analyse complète';
    }

    // 3. Construction du prompt d'analyse pour Gemini
    const geminiClient = new GeminiClient();
    
    const systemPrompt = `Tu es un expert juridique spécialisé dans l'analyse de conformité des contrats informatiques et de services numériques.
    Tu dois analyser le contrat fourni selon le droit OHADA et les meilleures pratiques contractuelles.
    
    FOCUS D'ANALYSE:
    - Conformité légale (droit OHADA, code des obligations du Sénégal)
    - Risques financiers (paiements, pénalités, garanties)
    - Risques juridiques (clauses abusives, vides juridiques)
    - Risques opérationnels (obligations, délais, livraisons)
    - Équilibre contractuel entre les parties
    - Protection des données et confidentialité
    - Propriété intellectuelle
    - Modalités de résiliation et litiges
    
    SCORING: Note de 0 à 100 (100 = parfaitement conforme et équilibré)`;

    const analysisType = requestBody.analysisType || 'full';
    const userPrompt = `ANALYSE DE CONFORMITÉ CONTRACTUELLE

TYPE D'ANALYSE: ${analysisType}

CONTRAT À ANALYSER:
${contractContent}

CONTEXTE DU CONTRAT:
- Type: ${contract.contract_type || 'Non spécifié'}
- Montant: ${contract.amount || 'Non spécifié'} ${contract.currency || 'XOF'}
- Client: ${contract.client_name || 'Non spécifié'}
- Durée: ${contract.start_date || 'Non spécifié'} → ${contract.end_date || 'Non spécifié'}

RETOURNE un JSON avec cette structure exacte:
{
  "overall_score": 85,
  "risks": {
    "financial": 15,
    "legal": 10,
    "operational": 20,
    "compliance": 5
  },
  "flagged_clauses": [
    "Clause X présente un risque Y car...",
    "Absence de clause Z recommandée pour..."
  ],
  "recommendations": [
    "Ajouter une clause de...",
    "Modifier la clause de... pour...",
    "Préciser les modalités de..."
  ],
  "compliance_issues": [
    "Non-conformité OHADA: ...",
    "Clause potentiellement abusive: ..."
  ],
  "strengths": [
    "Clause bien formulée: ...",
    "Protection adéquate: ..."
  ]
}`;

    // 4. Appel à Gemini pour l'analyse
    const geminiResponse = await geminiClient.generateContent({
      prompt: userPrompt,
      systemPrompt: systemPrompt,
      temperature: 0.2,
      maxTokens: 2048
    });

    if (!geminiResponse.success) {
      console.error('Erreur Gemini:', geminiResponse.error);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Erreur d'analyse IA: ${geminiResponse.error || 'Problème avec le service IA'}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // 5. Parser la réponse JSON
    let aiAnalysisData;
    try {
      // Extraire juste la partie JSON de la réponse
      const contentString = geminiResponse.content || '{}';
      const jsonMatch = contentString.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : '{}';
      
      aiAnalysisData = JSON.parse(jsonString);
    } catch (e) {
      console.error('Erreur parsing JSON:', e);
      aiAnalysisData = {
        overall_score: 70,
        risks: { financial: 20, legal: 15, operational: 10, compliance: 12 },
        recommendations: ['Format de réponse incorrect, analyse manuelle recommandée'],
        flagged_clauses: [],
        compliance_issues: ['Erreur de traitement'],
        strengths: []
      };
    }
    
    // 6. Construire l'analyse finale
    const analysis = {
      contractId: contract.id,
      contractNumber: contract.contract_number || 'N/A',
      analysisDate: new Date().toISOString(),
      complianceScore: aiAnalysisData.overall_score || 70,
      riskAnalysis: {
        overall_score: aiAnalysisData.overall_score || 70,
        risks: aiAnalysisData.risks || {
          financial: 20,
          legal: 15,
          operational: 10,
          compliance: 12
        },
        recommendations: aiAnalysisData.recommendations || [],
        flagged_clauses: aiAnalysisData.flagged_clauses || []
      },
      recommendations: aiAnalysisData.recommendations || [],
      issues: aiAnalysisData.compliance_issues || [],
      strengths: aiAnalysisData.strengths || []
    };

    // 7. Mettre à jour les scores dans la base
    const { error: updateError } = await supabaseClient
      .from('contracts')
      .update({
        compliance_score: analysis.complianceScore,
        risk_score: analysis.riskAnalysis.overall_score,
        last_analysis_date: new Date().toISOString(),
        analysis_data: JSON.stringify({
          risks: analysis.riskAnalysis.risks,
          recommendations: analysis.recommendations,
          issues: analysis.issues,
          strengths: analysis.strengths
        }),
        updated_at: new Date().toISOString()
      })
      .eq('id', contractId);

    if (updateError) {
      console.error('Erreur mise à jour:', updateError);
    }

    // 8. Enregistrer les alertes critiques si nécessaire
    if (analysis.issues && analysis.issues.length > 0) {
      try {
        const alertsToInsert = analysis.issues.map((issue, index) => ({
          contract_id: contractId,
          alert_type: 'compliance_issue',
          severity: index === 0 ? 'high' : 'medium',
          message: issue,
          created_at: new Date().toISOString(),
          status: 'open'
        }));

        if (alertsToInsert.length > 0) {
          const { error: alertError } = await supabaseClient
            .from('contract_alerts')
            .insert(alertsToInsert);
          
          if (alertError) {
            console.error('Erreur création alertes:', alertError);
          }
        }
      } catch (e) {
        console.error('Erreur lors de la création des alertes:', e);
      }
    }

    console.log('Analyse terminée:', analysis.complianceScore);

    return new Response(
      JSON.stringify({
        success: true,
        analysis
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erreur analyse conformité:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
