// Edge Function: analyze-contract-compliance
// Mission 1: AI-Powered Contract Lifecycle Management
// Analyse de conformité et des risques d'un contrat via IA

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import du client Gemini partagé
import { GeminiClient } from '../_shared/gemini-client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ComplianceAnalysisRequest {
  contract_id: string;
  content?: string; // Si fourni, analyse ce contenu au lieu de celui en DB
  analysis_type?: 'full' | 'risk_only' | 'compliance_only';
}

interface ComplianceReport {
  overall_score: number;
  risks: {
    financial: number;
    legal: number;
    operational: number;
    compliance: number;
  };
  flagged_clauses: string[];
  recommendations: string[];
  compliance_issues: string[];
  strengths: string[];
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

    const { contract_id, content, analysis_type = 'full' } = await req.json() as ComplianceAnalysisRequest;

    if (!contract_id) {
      return new Response(
        JSON.stringify({ error: 'contract_id is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // 1. Récupération du contrat
    const { data: contract, error: contractError } = await supabaseClient
      .from('contracts')
      .select(`
        *,
        companies:client_id (
          id, name, email, phone, address
        ),
        devis:devis_id (
          id, number, object, amount
        )
      `)
      .eq('id', contract_id)
      .single();

    if (contractError || !contract) {
      return new Response(
        JSON.stringify({ error: 'Contract not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // 2. Récupération du contenu à analyser
    let contractContent = content;
    
    if (!contractContent && contract.content_storage_url) {
      // Récupération depuis Supabase Storage
      try {
        const storageResponse = await fetch(contract.content_storage_url);
        if (storageResponse.ok) {
          contractContent = await storageResponse.text();
        }
      } catch (e) {
        console.log('Impossible de récupérer le contenu depuis Storage:', e);
      }
    }

    if (!contractContent) {
      contractContent = contract.content_preview || 'Contenu non disponible pour analyse';
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

    const userPrompt = `ANALYSE DE CONFORMITÉ CONTRACTUELLE

TYPE D'ANALYSE: ${analysis_type}

CONTRAT À ANALYSER:
${contractContent}

CONTEXTE DU CONTRAT:
- Type: ${contract.contract_type}
- Montant: ${contract.amount} ${contract.currency}
- Client: ${contract.companies?.name}
- Durée: ${contract.start_date} → ${contract.end_date}

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
    "Bonne définition des obligations",
    "Clauses de confidentialité solides"
  ]
}

Le scoring des risques va de 0 (aucun risque) à 100 (risque maximal).
Le overall_score va de 0 (contrat problématique) à 100 (contrat excellent).`;

    // 4. Analyse via Gemini
    const aiResponse = await geminiClient.generateContent({
      prompt: userPrompt,
      systemPrompt,
      temperature: 0.2, // Plus déterministe pour l'analyse
      maxTokens: 3000
    });

    if (!aiResponse.success || !aiResponse.content) {
      throw new Error('Échec de l\'analyse de conformité par IA');
    }

    // 5. Parsing de la réponse JSON
    let complianceReport: ComplianceReport;
    try {
      complianceReport = JSON.parse(aiResponse.content);
    } catch (e) {
      // Fallback avec analyse basique
      complianceReport = {
        overall_score: 70,
        risks: {
          financial: 25,
          legal: 20,
          operational: 30,
          compliance: 15
        },
        flagged_clauses: ["Analyse complète nécessaire - format de réponse IA non standard"],
        recommendations: ["Révision manuelle recommandée", "Consultation juridique conseillée"],
        compliance_issues: ["Format de réponse IA non analysable"],
        strengths: ["Contrat généré par IA avec structure de base"]
      };
    }

    // 6. Mise à jour du contrat avec l'analyse
    const { error: updateError } = await supabaseClient
      .from('contracts')
      .update({
        risk_analysis: complianceReport,
        compliance_score: complianceReport.overall_score,
        last_analysis_date: new Date().toISOString(),
        status: contract.status === 'draft' ? 'review' : contract.status
      })
      .eq('id', contract_id);

    if (updateError) {
      console.error('Erreur mise à jour analyse:', updateError);
    }

    // 7. Création d'une alerte si le score est trop bas
    if (complianceReport.overall_score < 60) {
      await supabaseClient
        .from('contract_alerts')
        .insert({
          contract_id,
          alert_type: 'low_compliance_score',
          severity: complianceReport.overall_score < 40 ? 'high' : 'medium',
          message: `Score de conformité faible: ${complianceReport.overall_score}/100`,
          details: {
            risks: complianceReport.risks,
            main_issues: complianceReport.compliance_issues.slice(0, 3)
          }
        });
    }

    // 8. Log de l'activité
    await supabaseClient
      .from('client_activity_logs')
      .insert({
        activity_type: 'contract_analyzed',
        details: {
          contract_id,
          analysis_type,
          compliance_score: complianceReport.overall_score,
          risks_detected: Object.values(complianceReport.risks).reduce((a, b) => a + b, 0)
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        contract_id,
        analysis: complianceReport,
        analysis_date: new Date().toISOString(),
        ai_usage: aiResponse.usage
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur analyse conformité:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur interne du serveur',
        details: error.toString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
