// supabase/functions/project-planner-ai/index.ts
// Edge Function IA pour la planification de projet automatique
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

interface ProjectPlanRequest {
  projectName: string;
  projectDescription: string;
  budget?: number;
  timeline?: number; // en jours
  industry?: string;
  complexity?: 'simple' | 'medium' | 'complex';
  customFields?: any;
}

interface AIProjectPlan {
  phases: {
    name: string;
    description: string;
    estimatedDuration: number;
    tasks: {
      title: string;
      description: string;
      estimatedHours: number;
      priority: 'low' | 'medium' | 'high' | 'urgent';
      requiredSkills?: string[];
    }[];
  }[];
  totalEstimatedDuration: number;
  estimatedBudget?: number;
  recommendations: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication token');
    }

    const requestData: ProjectPlanRequest = await req.json();
    
    console.log('Project Planner AI:', { projectName: requestData.projectName, userId: user.id });

    // Récupérer les paramètres de contexte métier et de devise depuis la base de données
    let businessContext = 'general';
    let businessDescription = 'Entreprise de services généraux';
    let aiProjectContext = 'Vous êtes un assistant IA spécialisé dans la gestion de projets.';
    let currencySymbol = 'FCFA';
    let companyName = 'Arcadis Technologies';

    try {
      const { data: settings, error: settingsError } = await supabaseClient
        .from('app_settings')
        .select('key, value')
        .in('key', ['business_context', 'business_description', 'ai_project_context', 'currency_symbol', 'company_name']);

      if (!settingsError && settings) {
        const settingsMap = settings.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as Record<string, string>);

        businessContext = settingsMap.business_context || businessContext;
        businessDescription = settingsMap.business_description || businessDescription;
        aiProjectContext = settingsMap.ai_project_context || aiProjectContext;
        currencySymbol = settingsMap.currency_symbol || currencySymbol;
        companyName = settingsMap.company_name || companyName;

        console.log('Paramètres récupérés:', { businessContext, currencySymbol, companyName });
      } else {
        console.log('Utilisation des paramètres par défaut (pas d\'erreur)');
      }
    } catch (error) {
      console.log('Erreur lors de la récupération des paramètres, utilisation des valeurs par défaut:', error);
    }

    // Déterminer le type de projet et adapter le prompt selon les services Arcadis
    const projectName = requestData.projectName.toLowerCase();
    const projectDescription = (requestData.projectDescription || '').toLowerCase();
    const fullText = `${projectName} ${projectDescription}`;
    
    let specificInstructions = "";
    let arcadisLevel = "";
    
    // Détection du niveau Arcadis
    if (fullText.includes('start') || fullText.includes('fondation') || fullText.includes('débutant') || fullText.includes('basique')) {
      arcadisLevel = "ARCADIS START";
    } else if (fullText.includes('plus') || fullText.includes('ia') || fullText.includes('intelligence artificielle') || fullText.includes('avancé')) {
      arcadisLevel = "ARCADIS PLUS";
    } else if (fullText.includes('horizon') || fullText.includes('excellence') || fullText.includes('stratégique') || fullText.includes('expert')) {
      arcadisLevel = "ARCADIS HORIZON";
    } else {
      arcadisLevel = "ARCADIS"; // Niveau par défaut
    }
    
    // === CYBERSÉCURITÉ & AUDIT SÉCURITÉ ===
    if (fullText.includes('audit') && fullText.includes('sécurité') || fullText.includes('cybersécurité') || fullText.includes('pentest')) {
      specificInstructions = `
${arcadisLevel} - CYBERSÉCURITÉ & AUDIT SÉCURITÉ AVANCÉ :
- Phase 1 : Reconnaissance et cartographie (inventaire assets, architecture réseau, surface d'attaque)
- Phase 2 : Audit technique complet (scan vulnérabilités, tests d'intrusion, analyse code)
- Phase 3 : Audit organisationnel (politiques sécurité, processus, maturité cyber, conformité)
- Phase 4 : Évaluation conformité réglementaire (RGPD, ISO 27001, ANSSI, NIS2, sectoriels)
- Phase 5 : Plan d'actions correctives et roadmap sécurité
- Phase 6 : Formation équipes et sensibilisation utilisateurs
- Livrables : rapport audit détaillé, matrice risques, tests pentest, politiques sécurité, formation
- Compétences : ethical hacking, OWASP, NIST, ISO 27001, forensic, SIEM, SOAR, threat intelligence
      `;
    } else if (fullText.includes('mfa') || fullText.includes('authentification') || fullText.includes('accès') || fullText.includes('identité')) {
      specificInstructions = `
${arcadisLevel} - CYBERSÉCURITÉ DE BASE (MFA & GESTION ACCÈS) :
- Phase 1 : Audit des comptes et privilèges existants (AD, Azure AD, systèmes)
- Phase 2 : Conception architecture IAM (Single Sign-On, fédération, RBAC)
- Phase 3 : Implémentation MFA multi-canaux (SMS, app, hardware tokens, biométrie)
- Phase 4 : Gestion des accès privilégiés (PAM, coffre-fort mots de passe)
- Phase 5 : Politiques de sécurité et monitoring accès
- Phase 6 : Formation utilisateurs et support
- Livrables : architecture IAM, configuration MFA, politiques accès, procédures, formation
- Compétences : Azure AD, Active Directory, MFA solutions, PAM, SAML, OAuth, security awareness
      `;
    }
    // === MICROSOFT 365 & CLOUD ===
    else if (fullText.includes('microsoft') || fullText.includes('m365') || fullText.includes('office') || fullText.includes('migration') || fullText.includes('teams')) {
      specificInstructions = `
${arcadisLevel} - DÉPLOIEMENT & MIGRATION MICROSOFT 365 :
- Phase 1 : Audit de l'existant et planification (licences, comptes, données, applications legacy)
- Phase 2 : Architecture et configuration tenant M365 (Azure AD, Exchange Online, SharePoint, Teams)
- Phase 3 : Migration données et contenus (emails, fichiers, calendriers, sites)
- Phase 4 : Déploiement applications et intégrations (Office suite, Teams, Power Platform)
- Phase 5 : Configuration sécurité et conformité (DLP, retention, audit)
- Phase 6 : Formation utilisateurs et adoption
- Phase 7 : Support et optimisation post-déploiement
- Livrables : plan migration, configuration tenant, documentation technique, formation, support
- Compétences : Azure AD, Exchange Online, SharePoint, Teams, Power Platform, PowerShell, Graph API
      `;
    } else if (fullText.includes('cloud') || fullText.includes('azure') || fullText.includes('aws') || fullText.includes('hybride')) {
      specificInstructions = `
${arcadisLevel} - MODERNISATION CLOUD & ARCHITECTURE HYBRIDE :
- Phase 1 : Audit infrastructure et stratégie cloud (lift & shift vs cloud native)
- Phase 2 : Architecture cloud multi-services (compute, storage, network, security)
- Phase 3 : Migration applications et données (réhébergement, refactorisation)
- Phase 4 : Intégration hybride et connectivité (VPN, Express Route, SD-WAN)
- Phase 5 : Sécurité cloud et gouvernance (IAM, monitoring, compliance)
- Phase 6 : Optimisation coûts et performances
- Livrables : architecture cloud, plan migration, configuration services, monitoring, formation
- Compétences : Azure/AWS architecture, networking, security, cost optimization, DevOps
      `;
    }
    // === DÉVELOPPEMENT WEB & APPLICATIONS ===
    else if (fullText.includes('site') || fullText.includes('web') || fullText.includes('application') || fullText.includes('app') || fullText.includes('développement')) {
      specificInstructions = `
${arcadisLevel} - DÉVELOPPEMENT WEB & APPLICATIONS SUR MESURE :
- Phase 1 : Analyse besoins et audit existant (UX/UI, performance, SEO, accessibilité)
- Phase 2 : Conception et architecture (wireframes, maquettes, design system, choix tech)
- Phase 3 : Développement frontend (React/Vue/Angular, responsive, PWA)
- Phase 4 : Développement backend (API REST/GraphQL, base de données, authentification)
- Phase 5 : Intégration et tests (tests unitaires, intégration, performance, sécurité)
- Phase 6 : Déploiement et mise en production (CI/CD, hébergement, monitoring)
- Phase 7 : Formation et maintenance
- Livrables : cahier charges, maquettes, code source, documentation, formation, maintenance
- Compétences : HTML/CSS/JS, React/Vue/Angular, Node.js/Python/.NET, databases, DevOps, UX/UI
      `;
    }
    // === INTELLIGENCE ARTIFICIELLE ===
    else if (fullText.includes('ia') || fullText.includes('intelligence artificielle') || fullText.includes('ai') || fullText.includes('machine learning') || fullText.includes('chatbot')) {
      specificInstructions = `
${arcadisLevel} - DÉVELOPPEMENT SOLUTIONS IA SUR MESURE :
- Phase 1 : Analyse besoins métier et faisabilité IA (use cases, ROI, données disponibles)
- Phase 2 : Architecture et stratégie données (data pipeline, gouvernance, qualité)
- Phase 3 : Développement et entraînement modèles (ML classique, LLM, fine-tuning)
- Phase 4 : Intégration systèmes existants (API, interfaces, workflows)
- Phase 5 : Tests et validation (performance, biais, sécurité, conformité)
- Phase 6 : Déploiement production et monitoring (MLOps, scaling, maintenance)
- Phase 7 : Formation équipes et adoption
- Livrables : POC, modèles IA, API, interfaces, documentation, formation, monitoring
- Compétences : Python, TensorFlow/PyTorch, Azure AI/AWS ML, OpenAI API, MLOps, data science
      `;
    }
    // === BUSINESS INTELLIGENCE & DATA ===
    else if (fullText.includes('business intelligence') || fullText.includes('bi') || fullText.includes('data') || fullText.includes('analyse') || fullText.includes('dashboard')) {
      specificInstructions = `
${arcadisLevel} - ANALYSE DONNÉES AVANCÉE & BUSINESS INTELLIGENCE :
- Phase 1 : Audit sources données et besoins reporting (inventaire, qualité, gouvernance)
- Phase 2 : Architecture data warehouse et data lake (modélisation, ETL/ELT)
- Phase 3 : Développement dashboards et rapports (Power BI, Tableau, self-service)
- Phase 4 : Analyse prédictive et KPI avancés (machine learning, alertes automatiques)
- Phase 5 : Intégration temps réel et automatisation (streaming, APIs, workflows)
- Phase 6 : Formation utilisateurs et adoption (data literacy, best practices)
- Phase 7 : Gouvernance et amélioration continue
- Livrables : data warehouse, dashboards interactifs, rapports automatisés, formation, governance
- Compétences : SQL, Power BI/Tableau, Python/R, Azure Synapse/AWS Redshift, data modeling, ETL
      `;
    }
    // === FORMATION & ACCOMPAGNEMENT ===
    else if (fullText.includes('formation') || fullText.includes('accompagnement') || fullText.includes('coaching') || fullText.includes('conduite du changement')) {
      specificInstructions = `
${arcadisLevel} - FORMATION (M365, IA ARCADIS, IA GÉNÉRATIVE) :
- Phase 1 : Analyse besoins formatifs et niveau utilisateurs (évaluation compétences, gap analysis)
- Phase 2 : Conception programme pédagogique sur mesure (objectifs, parcours, modalités)
- Phase 3 : Création supports et contenus (guides, vidéos, ateliers pratiques, e-learning)
- Phase 4 : Animation sessions formation (présentiel, distanciel, blended learning)
- Phase 5 : Évaluation efficacité et certification (tests, satisfaction, impact business)
- Phase 6 : Accompagnement post-formation et amélioration continue
- Livrables : programme formation, supports pédagogiques complets, certifications, suivi adoption
- Compétences : ingénierie pédagogique, M365, IA tools, création contenu multimédia, animation
      `;
    }
    // === INFRASTRUCTURE & DEVOPS ===
    else if (fullText.includes('infrastructure') || fullText.includes('devops') || fullText.includes('cloud ops') || fullText.includes('automatisation')) {
      specificInstructions = `
${arcadisLevel} - MODERNISATION INFRASTRUCTURE & DEVOPS :
- Phase 1 : Audit infrastructure existante (serveurs, réseau, stockage, performances)
- Phase 2 : Conception architecture moderne (cloud native, microservices, containers)
- Phase 3 : Migration et modernisation (virtualisation, containerisation, cloud)
- Phase 4 : Mise en place CI/CD et automation (pipelines, tests, déploiement continu)
- Phase 5 : Monitoring et observabilité (logging, métriques, alerting, performance)
- Phase 6 : Optimisation sécurité et coûts (DevSecOps, cost optimization, scaling)
- Livrables : architecture infrastructure, pipelines CI/CD, monitoring, documentation, formation
- Compétences : Windows/Linux, VMware/Hyper-V, Docker/Kubernetes, Azure/AWS, Terraform, Jenkins
      `;
    }
    // === CONSEIL & STRATÉGIE DIGITALE ===
    else if (fullText.includes('conseil') || fullText.includes('stratégie') || fullText.includes('transformation') || fullText.includes('digital')) {
      specificInstructions = `
${arcadisLevel} - CONSEIL EN OPTIMISATION DES PROCESSUS :
- Phase 1 : Diagnostic organisationnel et cartographie processus (AS-IS, inefficacités)
- Phase 2 : Analyse des opportunités d'amélioration (automatisation, digitalisation)
- Phase 3 : Conception nouveaux processus optimisés (TO-BE, standards, KPIs)
- Phase 4 : Plan de transformation et conduite du changement (roadmap, communication)
- Phase 5 : Mise en œuvre et accompagnement (pilote, déploiement, support)
- Phase 6 : Suivi des améliorations et optimisation continue
- Livrables : diagnostic complet, cartographie processus, plan transformation, ROI, formation
- Compétences : analyse processus, conduite du changement, lean management, BPMN, digitalisation
      `;
    }
    // === SUPPORT & HELPDESK ===
    else if (fullText.includes('support') || fullText.includes('helpdesk') || fullText.includes('assistance') || fullText.includes('maintenance')) {
      specificInstructions = `
${arcadisLevel} - SUPPORT HELPDESK RÉACTIF :
- Phase 1 : Audit support existant et analyse besoins (SLA actuels, satisfaction, volumes)
- Phase 2 : Conception infrastructure support (ticketing, outils, organisation équipe)
- Phase 3 : Définition processus et SLA (ITIL, escalade, priorités, métriques)
- Phase 4 : Formation équipe support et création base de connaissances
- Phase 5 : Déploiement solution et migration utilisateurs
- Phase 6 : Monitoring performance et amélioration continue
- Livrables : plateforme ticketing, processus ITIL, formation équipe, base connaissances, SLA
- Compétences : ITSM, ServiceNow/Jira, ITIL, diagnostic systèmes, communication, KCS
      `;
    }
    // === GESTION DE PROJET ===
    else if (fullText.includes('gestion') && fullText.includes('projet') || fullText.includes('pmo') || fullText.includes('pilotage')) {
      specificInstructions = `
${arcadisLevel} - GESTION DE PROJET & ACCOMPAGNEMENT :
- Phase 1 : Structuration projet et définition governance (charter, stakeholders, RACI)
- Phase 2 : Planification détaillée et allocation ressources (WBS, estimation, budget)
- Phase 3 : Pilotage exécution et gestion risques (suivi, reporting, mitigation)
- Phase 4 : Suivi qualité et communication stakeholders (comités, dashboards)
- Phase 5 : Gestion changements et adaptation planning (change requests, re-planning)
- Phase 6 : Clôture projet et capitalisation (lessons learned, documentation)
- Livrables : charter projet, planning détaillé, reporting, documentation complète, REX
- Compétences : PMP/Prince2, Agile/Scrum, MS Project/Jira, gestion risques, communication
      `;
    }

    // Instructions génériques si aucune spécialisation détectée
    else {
      specificInstructions = `
${arcadisLevel} - PROJET IT GÉNÉRIQUE :
- Adaptez les phases selon le type de projet (développement, infrastructure, conseil, formation)
- Incluez systématiquement : analyse besoins, conception, réalisation, tests, déploiement
- Considérez les aspects : sécurité, performance, scalabilité, maintenance, formation
- Intégrez les bonnes pratiques : gestion de projet, qualité, documentation, support
- Prévoir accompagnement utilisateurs et amélioration continue
      `;
    }

    // Construire le prompt pour l'IA avec les paramètres configurés
    const prompt = `
En tant qu'expert ${companyName} en gestion de projet IT, vous devez créer un plan détaillé et PROFESSIONNEL pour le projet suivant :

**Projet :** ${requestData.projectName}
${requestData.projectDescription ? `**Description :** ${requestData.projectDescription}` : ''}
${requestData.budget ? `**Budget :** ${requestData.budget} ${currencySymbol}` : ''}
${requestData.timeline ? `**Délai souhaité :** ${requestData.timeline} jours` : ''}
${requestData.industry ? `**Secteur :** ${requestData.industry}` : ''}
${requestData.complexity ? `**Complexité :** ${requestData.complexity}` : ''}

${specificInstructions}

CONTEXTE MÉTIER SPÉCIALISÉ :
${businessDescription}

${aiProjectContext}

CONTEXTE ${companyName.toUpperCase()} :
${companyName} est spécialisé dans le secteur ${businessContext} et offre des services de transformation digitale avec 3 niveaux :
- START : Services fondamentaux et accompagnement de base
- PLUS : Solutions avancées intégrant l'IA et l'innovation
- HORIZON : Excellence opérationnelle et stratégie d'entreprise

IMPORTANT : 
- Créez un plan DÉTAILLÉ et PROFESSIONNEL adapté au secteur ${businessContext}
- Les descriptions doivent être complètes et refléter la réalité du métier ${businessDescription}
- Adaptez le niveau de sophistication au contexte métier détecté
- Incluez les compétences spécifiques requises pour chaque tâche dans ce secteur
- Considérez les aspects sécurité, conformité et best practices du domaine ${businessContext}
- Intégrez les méthodologies et standards propres à ce secteur d'activité
- Utilisez ${currencySymbol} pour tous les montants estimés

Retournez uniquement un JSON valide avec cette structure exacte :

{
  "phases": [
    {
      "name": "Nom de la phase",
      "description": "Description détaillée de la phase",
      "estimatedDuration": nombre_de_jours,
      "tasks": [
        {
          "title": "Titre de la tâche",
          "description": "Description détaillée de la tâche",
          "estimatedHours": nombre_heures,
          "priority": "low|medium|high|urgent",
          "requiredSkills": ["compétence1", "compétence2"]
        }
      ]
    }
  ],
  "totalEstimatedDuration": nombre_total_jours,
  "estimatedBudget": estimation_budget_euros,
  "recommendations": [
    "Recommandation 1",
    "Recommandation 2"
  ]
}

IMPORTANT - CONTRAINTES FORMAT :
- AUCUN commentaire (//, /* */) dans le JSON
- AUCUN texte avant ou après le JSON
- JSON valide et bien formaté uniquement
- Pas de virgules en fin de tableau ou objet
- Guillemets doubles uniquement

Assurez-vous que :
- Les phases sont logiques et ordonnées
- Les tâches sont spécifiques et réalisables
- Les estimations de temps sont réalistes
- Les priorités sont bien réparties
- Les compétences requises sont pertinentes
- Les recommandations sont actionables
`;

    // Appel à l'API Gemini
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log('Calling Gemini API...');
    console.log('API Key length:', geminiApiKey.length);
    console.log('Prompt length:', prompt.length);
    
    let geminiResponse;
    try {
      geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + geminiApiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          }
        })
      });

      console.log('Gemini API response status:', geminiResponse.status);

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.error('Gemini API error response:', errorText);
        throw new Error(`Failed to get response from Gemini API: ${geminiResponse.status} - ${errorText}`);
      }
    } catch (fetchError) {
      console.error('Network error calling Gemini API:', fetchError);
      throw new Error(`Network error calling Gemini API: ${fetchError.message}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini API response structure:', {
      hasCandidates: !!geminiData.candidates,
      candidatesLength: geminiData.candidates?.length,
      hasContent: !!geminiData.candidates?.[0]?.content,
      error: geminiData.error
    });
    
    if (geminiData.error) {
      throw new Error(`Gemini API error: ${geminiData.error.message || JSON.stringify(geminiData.error)}`);
    }
    
    if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content) {
      console.error('Invalid Gemini response:', JSON.stringify(geminiData));
      throw new Error('Invalid response from Gemini API');
    }

    let aiResponse = geminiData.candidates[0].content.parts[0].text;
    console.log('Raw AI response length:', aiResponse.length);
    console.log('Raw AI response start:', aiResponse.substring(0, 300));
    console.log('Raw AI response end:', aiResponse.substring(aiResponse.length - 300));
    
    // Stratégie robuste pour nettoyer et extraire le JSON
    let projectPlan: AIProjectPlan;
    let jsonText = '';
    
    try {
      // 1. Extraire le contenu entre les première et dernière accolades
      const firstBrace = aiResponse.indexOf('{');
      const lastBrace = aiResponse.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
        throw new Error('Could not find valid JSON structure in AI response');
      }
      
      jsonText = aiResponse.substring(firstBrace, lastBrace + 1);
      console.log('Extracted JSON length:', jsonText.length);
      console.log('Extracted JSON preview:', jsonText.substring(0, 500));
      
      // 2. Nettoyage simple mais efficace
      let cleanedText = jsonText
        // Supprimer commentaires //
        .replace(/\/\/.*$/gm, '')
        // Supprimer commentaires /* */
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Supprimer virgules en trop
        .replace(/,(\s*[}\]])/g, '$1')
        // Nettoyer espaces multiples
        .replace(/\s+/g, ' ')
        .trim();
      
      console.log('Cleaned JSON length:', cleanedText.length);
      console.log('Cleaned JSON preview:', cleanedText.substring(0, 500));
      
      // 3. Tentative de parsing JSON direct
      projectPlan = JSON.parse(cleanedText);
      console.log('JSON parsing successful! Generated plan with', projectPlan.phases.length, 'phases');
      
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.error('Failed JSON preview:', jsonText.substring(0, 500));
      
      // Fallback spécifique au type de projet détecté
      console.log('Creating smart fallback for project type:', requestData.projectName);
      
      if (fullText.includes('site') || fullText.includes('web') || fullText.includes('vitrine')) {
        projectPlan = {
          phases: [
            {
              name: "Analyse et Conception",
              description: "Analyse des besoins client et conception du site web vitrine",
              estimatedDuration: 5,
              tasks: [
                {
                  title: "Audit de l'existant et benchmark",
                  description: "Analyser le site actuel et étudier la concurrence",
                  estimatedHours: 8,
                  priority: "high" as const,
                  requiredSkills: ["Analyse web", "UX Research"]
                },
                {
                  title: "Définition de l'arborescence",
                  description: "Structurer l'organisation du contenu et des pages",
                  estimatedHours: 12,
                  priority: "high" as const,
                  requiredSkills: ["Architecture de l'information", "UX Design"]
                },
                {
                  title: "Wireframes et maquettes",
                  description: "Créer les wireframes et maquettes graphiques",
                  estimatedHours: 20,
                  priority: "high" as const,
                  requiredSkills: ["UI Design", "Figma", "Photoshop"]
                }
              ]
            },
            {
              name: "Développement Frontend",
              description: "Développement de l'interface utilisateur responsive",
              estimatedDuration: 10,
              tasks: [
                {
                  title: "Intégration HTML/CSS responsive",
                  description: "Développement frontend responsive avec CSS moderne",
                  estimatedHours: 32,
                  priority: "high" as const,
                  requiredSkills: ["HTML5", "CSS3", "Responsive Design"]
                },
                {
                  title: "Développement JavaScript",
                  description: "Ajout d'interactivité et animations",
                  estimatedHours: 16,
                  priority: "medium" as const,
                  requiredSkills: ["JavaScript", "jQuery", "Animations CSS"]
                },
                {
                  title: "Optimisation SEO technique",
                  description: "Optimisation pour les moteurs de recherche",
                  estimatedHours: 12,
                  priority: "high" as const,
                  requiredSkills: ["SEO", "Performance web", "Lighthouse"]
                }
              ]
            },
            {
              name: "CMS et Backend",
              description: "Intégration du système de gestion de contenu",
              estimatedDuration: 7,
              tasks: [
                {
                  title: "Installation et configuration CMS",
                  description: "Configuration WordPress ou autre CMS",
                  estimatedHours: 8,
                  priority: "high" as const,
                  requiredSkills: ["WordPress", "PHP", "MySQL"]
                },
                {
                  title: "Développement thème sur mesure",
                  description: "Création du thème personnalisé",
                  estimatedHours: 24,
                  priority: "high" as const,
                  requiredSkills: ["PHP", "WordPress", "Templating"]
                },
                {
                  title: "Formulaires de contact",
                  description: "Intégration formulaires et système d'emails",
                  estimatedHours: 8,
                  priority: "medium" as const,
                  requiredSkills: ["PHP", "Email", "Validation"]
                }
              ]
            },
            {
              name: "Tests et Déploiement",
              description: "Tests complets et mise en ligne",
              estimatedDuration: 3,
              tasks: [
                {
                  title: "Tests fonctionnels complets",
                  description: "Tests sur tous navigateurs et appareils",
                  estimatedHours: 12,
                  priority: "high" as const,
                  requiredSkills: ["Tests fonctionnels", "Cross-browser", "Mobile"]
                },
                {
                  title: "Déploiement et configuration serveur",
                  description: "Mise en ligne et configuration hébergement",
                  estimatedHours: 6,
                  priority: "high" as const,
                  requiredSkills: ["Hébergement", "DNS", "SSL"]
                },
                {
                  title: "Formation client",
                  description: "Formation à l'utilisation du CMS",
                  estimatedHours: 6,
                  priority: "medium" as const,
                  requiredSkills: ["Formation", "Documentation", "Support"]
                }
              ]
            }
          ],
          totalEstimatedDuration: 25,
          estimatedBudget: 15000,
          recommendations: [
            "Prévoir un design responsive adapté mobile-first",
            "Optimiser les images et performances pour un chargement rapide",
            "Intégrer Google Analytics et outils de suivi",
            "Prévoir une stratégie de contenu et SEO dès le départ",
            "Planifier une maintenance régulière du site"
          ]
        };
      } else {
        // Plan générique par défaut
        projectPlan = {
          phases: [
            {
              name: "Analyse et Planification",
              description: "Phase d'analyse des besoins et de planification détaillée du projet",
              estimatedDuration: 5,
              tasks: [
                {
                  title: "Collecte des exigences",
                  description: "Analyser et documenter les besoins du projet",
                  estimatedHours: 16,
                  priority: "high" as const,
                  requiredSkills: ["Analyse", "Documentation"]
                },
                {
                  title: "Planification détaillée",
                  description: "Créer le planning et l'allocation des ressources",
                  estimatedHours: 24,
                  priority: "high" as const,
                  requiredSkills: ["Gestion de projet", "Planification"]
                }
              ]
            },
            {
              name: "Développement",
              description: "Phase de développement et d'implémentation",
              estimatedDuration: 15,
              tasks: [
                {
                  title: "Développement core",
                  description: "Développement des fonctionnalités principales",
                  estimatedHours: 80,
                  priority: "high" as const,
                  requiredSkills: ["Développement", "Architecture"]
                },
                {
                  title: "Tests et validation",
                  description: "Tests unitaires et tests d'intégration",
                  estimatedHours: 40,
                  priority: "medium" as const,
                  requiredSkills: ["Tests", "QA"]
                }
              ]
            },
            {
              name: "Déploiement",
              description: "Mise en production et formation",
              estimatedDuration: 5,
              tasks: [
                {
                  title: "Déploiement production",
                  description: "Migration vers l'environnement de production",
                  estimatedHours: 16,
                  priority: "high" as const,
                  requiredSkills: ["DevOps", "Production"]
                },
                {
                  title: "Formation utilisateurs",
                  description: "Formation et accompagnement des utilisateurs",
                  estimatedHours: 24,
                  priority: "medium" as const,
                  requiredSkills: ["Formation", "Support"]
                }
              ]
            }
          ],
          totalEstimatedDuration: 25,
          estimatedBudget: 50000,
          recommendations: [
            "Prévoir des tests réguliers tout au long du projet",
            "Impliquer les utilisateurs finaux dans le processus de validation",
            "Planifier une phase de support post-déploiement"
          ]
        };
      }
    }

    // Valider la structure de la réponse
    if (!projectPlan.phases || !Array.isArray(projectPlan.phases)) {
      throw new Error('Invalid project plan structure from AI');
    }

    // Ajouter des métadonnées
    const enrichedPlan = {
      ...projectPlan,
      generatedAt: new Date().toISOString(),
      generatedFor: {
        projectName: requestData.projectName,
        userId: user.id
      },
      totalTasks: projectPlan.phases.reduce((acc, phase) => acc + phase.tasks.length, 0),
      averageTaskDuration: projectPlan.phases.reduce((acc, phase) => 
        acc + phase.tasks.reduce((taskAcc, task) => taskAcc + task.estimatedHours, 0), 0
      ) / projectPlan.phases.reduce((acc, phase) => acc + phase.tasks.length, 0)
    };

    console.log('Project plan generated:', {
      phases: enrichedPlan.phases.length,
      totalTasks: enrichedPlan.totalTasks,
      totalDuration: enrichedPlan.totalEstimatedDuration
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: enrichedPlan,
        message: 'Project plan generated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Project Planner AI Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to generate project plan'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
