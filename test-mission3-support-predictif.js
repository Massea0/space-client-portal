// Script de test pour la Mission 3: Support Prédictif et Tickets Proactifs
// Test des fonctions de logging d'activité et création proactive de tickets

const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDQyMTY2NSwiZXhwIjoyMDUwMDAzMzQzfQ.nNO_9oj5E1aBVluvAyGC9WQxMNpWRfDPdwgGvzCOhWE';

async function testClientActivityLogging() {
    console.log('🧪 TEST 1: Logging d\'activité client');
    console.log('=====================================');

    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/log-client-activity`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                activity_type: 'form_error',
                details: {
                    form_type: 'login',
                    error_message: 'Mot de passe incorrect',
                    page: '/login',
                    attempts: 3
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        console.log('✅ Log d\'activité enregistré:', data);
        return data;

    } catch (error) {
        console.error('❌ Erreur test logging:', error);
        return null;
    }
}

async function testMultipleCriticalActivities() {
    console.log('\n🧪 TEST 2: Activités critiques multiples (déclenchement proactif)');
    console.log('================================================================');

    const criticalActivities = [
        {
            activity_type: 'login_failed',
            details: { error_message: 'Identifiants incorrects', page: '/login' }
        },
        {
            activity_type: 'form_error', 
            details: { form_type: 'payment', error_message: 'Erreur carte bancaire' }
        },
        {
            activity_type: 'error_occurred',
            details: { error_type: 'network', error_message: 'Timeout connexion' }
        },
        {
            activity_type: 'timeout_occurred',
            details: { operation: 'data_loading', duration_ms: 15000 }
        }
    ];

    try {
        for (const [index, activity] of criticalActivities.entries()) {
            console.log(`📊 Envoi activité critique ${index + 1}/4: ${activity.activity_type}`);
            
            const response = await fetch(`${SUPABASE_URL}/functions/v1/log-client-activity`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(activity)
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Activité ${index + 1} loggée:`, data.log_id);
            } else {
                console.log(`❌ Erreur activité ${index + 1}:`, await response.text());
            }

            // Petite pause entre les envois
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('🎯 Test terminé - Si 3+ activités critiques, un ticket proactif devrait être créé');

    } catch (error) {
        console.error('❌ Erreur test activités multiples:', error);
    }
}

async function testProactiveTicketCreation() {
    console.log('\n🧪 TEST 3: Création directe de ticket proactif');
    console.log('==============================================');

    const testPayload = {
        user_id: 'mock-user-id',
        trigger_reason: 'test_manual',
        activity_logs: [
            {
                timestamp: new Date().toISOString(),
                activity_type: 'form_error',
                details: { form_type: 'payment', error_message: 'Carte expirée' }
            },
            {
                timestamp: new Date(Date.now() - 60000).toISOString(),
                activity_type: 'login_failed', 
                details: { error_message: 'Mot de passe incorrect' }
            },
            {
                timestamp: new Date(Date.now() - 120000).toISOString(),
                activity_type: 'timeout_occurred',
                details: { operation: 'checkout', duration_ms: 20000 }
            }
        ]
    };

    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/proactive-ticket-creator`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testPayload)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        console.log('🎯 Réponse analyse proactive:', data);

        if (data.problemDetected) {
            console.log('✅ Problème détecté par l\'IA !');
            console.log('🎫 Ticket créé:', data.ticket);
            console.log('🧠 Analyse:', data.analysis);
        } else {
            console.log('ℹ️  Aucun problème significatif détecté');
        }

        return data;

    } catch (error) {
        console.error('❌ Erreur test création ticket proactif:', error);
        return null;
    }
}

async function testGeminiAnalysisDirectly() {
    console.log('\n🧪 TEST 4: Test direct de l\'analyse Gemini');
    console.log('============================================');

    const GEMINI_API_KEY = 'AIzaSyAbjeF0789Jv6ZyM4hbRp5UFzkEoBDDtDI';
    
    const prompt = `
Tu es un expert en support client pour Arcadis Space.

Activité Client Récente:
- Échec de connexion (3 tentatives)
- Erreur de paiement (carte expirée)  
- Timeout lors du checkout (20 secondes)
- Recherche FAQ "problème paiement"

MISSION: Analyse si un ticket proactif doit être créé.

Réponds UNIQUEMENT avec un JSON valide:
{
  "problemDetected": boolean,
  "ticketSubject": "Titre du problème",
  "ticketDescription": "Description détaillée",
  "priority": "low|medium|high|urgent",
  "category": "technique|compte|facturation|autre",
  "confidence": 0.0-1.0,
  "reasoning": "Explication courte"
}
`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API Error: ${response.status}`);
        }

        const data = await response.json();
        const generatedText = data.candidates[0].content.parts[0].text;
        
        console.log('📝 Réponse brute Gemini:', generatedText);

        // Extraction du JSON
        const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/) || [null, generatedText];
        const jsonText = jsonMatch[1] || generatedText;
        const analysis = JSON.parse(jsonText.trim());

        console.log('🎯 Analyse parsée:', analysis);
        console.log(`🎪 Confiance: ${Math.round(analysis.confidence * 100)}%`);
        console.log(`🚨 Problème détecté: ${analysis.problemDetected ? 'OUI' : 'NON'}`);

        return analysis;

    } catch (error) {
        console.error('❌ Erreur test Gemini direct:', error);
        return null;
    }
}

async function runAllTests() {
    console.log('🚀 TESTS MISSION 3: SUPPORT PRÉDICTIF ET TICKETS PROACTIFS');
    console.log('==========================================================');
    console.log(`🔗 Supabase URL: ${SUPABASE_URL}`);
    console.log(`🤖 Functions disponibles: log-client-activity, proactive-ticket-creator`);
    console.log('');

    // Test 1: Logging basique
    await testClientActivityLogging();

    // Test 2: Multiple activités critiques
    await testMultipleCriticalActivities();

    // Test 3: Création proactive directe
    await testProactiveTicketCreation();

    // Test 4: Test Gemini direct
    await testGeminiAnalysisDirectly();

    console.log('\n🎉 TOUS LES TESTS TERMINÉS !');
    console.log('===============================');
    console.log('📊 Vérifiez les tables client_activity_logs et tickets dans Supabase');
    console.log('🎫 Les tickets proactifs ont le statut "suggested" et is_proactive = true');
    console.log('🔍 Vérifiez les logs des Edge Functions pour plus de détails');
}

// Exécution des tests
runAllTests().catch(console.error);
