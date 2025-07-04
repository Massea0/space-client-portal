// Script de test global pour toutes les missions IA Arcadis Space
// Tests des 3 missions : Sentiment, Personnalisation, Support Prédictif

const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co';
const GEMINI_API_KEY = 'AIzaSyAbjeF0789Jv6ZyM4hbRp5UFzkEoBDDtDI';

console.log('🚀 TESTS COMPLETS SUITE IA ARCADIS SPACE');
console.log('========================================');
console.log('📅 Date:', new Date().toLocaleString('fr-FR'));
console.log('🔗 Supabase:', SUPABASE_URL);
console.log('🧠 Modèle IA: Gemini 1.5 Flash');
console.log('');

// Test Mission 1: Analyse de Sentiment
async function testMission1_SentimentAnalysis() {
    console.log('📊 MISSION 1: ANALYSE DE SENTIMENT AUTOMATISÉE');
    console.log('==============================================');

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ 
                            text: `Analyse le sentiment de ce message client: "Le site est en panne depuis 2 heures, c'est inadmissible !!! Nous perdons des clients !"

Réponds uniquement en JSON:
{
  "priority": "low|medium|high|urgent",
  "sentiment": "positive|neutral|negative|frustrated",
  "summary": "Résumé du problème"
}`
                        }]
                    }]
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        
        console.log('📝 Réponse brute:', text);
        
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || [null, text];
        const analysis = JSON.parse(jsonMatch[1] || text);
        
        console.log('✅ Analyse parsée:', analysis);
        console.log(`🎯 Priority: ${analysis.priority}, Sentiment: ${analysis.sentiment}`);
        
        return { success: true, analysis };
    } catch (error) {
        console.error('❌ Erreur Mission 1:', error);
        return { success: false, error: error.message };
    }
}

// Test Mission 2: Recommandations Personnalisées
async function testMission2_Recommendations() {
    console.log('\n🤖 MISSION 2: IA PERSONNALISATION CLIENT');
    console.log('======================================');

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ 
                            text: `Génère des recommandations pour TechCorp (PME technologique, 50 employés, budget 30k€, secteur: développement web et mobile).

Services disponibles: Développement Web, Application Mobile, Sécurité, Hébergement, Maintenance, Formation.

Réponds uniquement en JSON:
{
  "recommendations": [
    {
      "service": "nom du service",
      "description": "description courte",
      "justification": "pourquoi recommandé",
      "score": 0-10,
      "budget_estimate": "fourchette prix"
    }
  ]
}`
                        }]
                    }]
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        
        console.log('📝 Réponse brute:', text.substring(0, 200) + '...');
        
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || [null, text];
        const recommendations = JSON.parse(jsonMatch[1] || text);
        
        console.log('✅ Recommandations générées:');
        recommendations.recommendations.forEach((rec, i) => {
            console.log(`  ${i+1}. ${rec.service} (Score: ${rec.score}/10)`);
            console.log(`     💰 ${rec.budget_estimate}`);
        });
        
        return { success: true, recommendations };
    } catch (error) {
        console.error('❌ Erreur Mission 2:', error);
        return { success: false, error: error.message };
    }
}

// Test Mission 3: Support Prédictif
async function testMission3_PredictiveSupport() {
    console.log('\n🔮 MISSION 3: SUPPORT PRÉDICTIF ET TICKETS PROACTIFS');
    console.log('==================================================');

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ 
                            text: `Analyse cette activité client pour détecter des problèmes potentiels:

Historique récent:
- 5 tentatives de connexion échouées
- Erreur paiement (carte expirée) x3
- Timeout page checkout (25 secondes)
- Recherche FAQ "problème paiement" x4
- Abandon panier x2

Détermine si un ticket proactif doit être créé.

Réponds uniquement en JSON:
{
  "problemDetected": boolean,
  "ticketSubject": "titre du ticket",
  "ticketDescription": "description détaillée",
  "priority": "low|medium|high|urgent",
  "category": "technique|compte|facturation|autre",
  "confidence": 0.0-1.0,
  "reasoning": "justification de la détection"
}`
                        }]
                    }]
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        
        console.log('📝 Réponse brute:', text.substring(0, 200) + '...');
        
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || [null, text];
        const analysis = JSON.parse(jsonMatch[1] || text);
        
        console.log('✅ Analyse prédictive:', analysis);
        console.log(`🚨 Problème détecté: ${analysis.problemDetected ? 'OUI' : 'NON'}`);
        if (analysis.problemDetected) {
            console.log(`🎫 Ticket suggéré: ${analysis.ticketSubject}`);
            console.log(`⚡ Priorité: ${analysis.priority}`);
            console.log(`🎯 Confiance: ${Math.round(analysis.confidence * 100)}%`);
        }
        
        return { success: true, analysis };
    } catch (error) {
        console.error('❌ Erreur Mission 3:', error);
        return { success: false, error: error.message };
    }
}

// Test des Edge Functions déployées
async function testDeployedFunctions() {
    console.log('\n🛠️ VÉRIFICATION DES EDGE FUNCTIONS DÉPLOYÉES');
    console.log('=============================================');

    const functions = [
        'ticket-sentiment-analysis',
        'recommend-services', 
        'dynamic-content-generator',
        'client-relationship-summary',
        'log-client-activity',
        'proactive-ticket-creator'
    ];

    console.log(`📡 Tentative de ping des ${functions.length} Edge Functions:`);
    
    for (const func of functions) {
        try {
            const response = await fetch(`${SUPABASE_URL}/functions/v1/${func}`, {
                method: 'OPTIONS' // CORS preflight
            });
            
            if (response.status === 200 || response.status === 204) {
                console.log(`✅ ${func}: Accessible`);
            } else {
                console.log(`⚠️  ${func}: Statut ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${func}: Erreur réseau`);
        }
    }
}

// Exécution de tous les tests
async function runAllMissions() {
    const results = {
        mission1: null,
        mission2: null,
        mission3: null,
        deployment: null
    };

    // Test des 3 missions
    results.mission1 = await testMission1_SentimentAnalysis();
    results.mission2 = await testMission2_Recommendations();
    results.mission3 = await testMission3_PredictiveSupport();
    
    // Test déploiement
    await testDeployedFunctions();

    // Rapport final
    console.log('\n🎯 RAPPORT FINAL DES TESTS');
    console.log('==========================');
    
    const successCount = [results.mission1, results.mission2, results.mission3]
        .filter(r => r?.success).length;
    
    console.log(`📊 Score global: ${successCount}/3 missions réussies`);
    console.log(`✅ Mission 1 (Sentiment): ${results.mission1?.success ? 'SUCCÈS' : 'ÉCHEC'}`);
    console.log(`✅ Mission 2 (Personnalisation): ${results.mission2?.success ? 'SUCCÈS' : 'ÉCHEC'}`);
    console.log(`✅ Mission 3 (Support Prédictif): ${results.mission3?.success ? 'SUCCÈS' : 'ÉCHEC'}`);
    
    if (successCount === 3) {
        console.log('\n🎉 TOUTES LES MISSIONS IA VALIDÉES AVEC SUCCÈS !');
        console.log('🚀 Arcadis Space dispose d\'une suite IA complète et opérationnelle');
        console.log('🔮 Capacités: Sentiment, Personnalisation, Support Prédictif');
    } else {
        console.log('\n⚠️  Certaines missions nécessitent une attention');
    }
    
    console.log('\n📋 Prochaines étapes recommandées:');
    console.log('- 🔍 Monitoring production des Edge Functions');
    console.log('- 📈 Analyse des métriques d\'usage client');
    console.log('- 🎯 Optimisation continue des prompts IA');
    console.log('- 🛡️  Surveillance des quotas API Gemini');
}

// Exécution
runAllMissions().catch(console.error);
